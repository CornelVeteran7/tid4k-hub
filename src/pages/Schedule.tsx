import { useState, useEffect } from 'react';
import { useGroup } from '@/contexts/GroupContext';
import { useAuth } from '@/contexts/AuthContext';
import { getScheduleWithAvatars, saveSchedule } from '@/api/schedule';
import type { ScheduleData } from '@/api/schedule';
import { areRol, isInky } from '@/utils/roles';
import type { ScheduleCell, ScheduleEntry } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar, Printer, Save, Edit2, QrCode, X, DoorOpen } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { API_BASE_URL } from '@/api/config';

const DAYS = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri'];
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
const COLORS = ['#E3F2FD', '#E8F5E9', '#FFF3E0', '#F3E5F5', '#FFEBEE', '#E0F7FA', '#FFF8E1', '#F1F8E9'];

export default function Schedule() {
  const { currentGroup } = useGroup();
  const { user } = useAuth();
  const [cells, setCells] = useState<ScheduleCell[]>([]);
  const [editing, setEditing] = useState(false);
  const [editCell, setEditCell] = useState<{ zi: string; ora: string } | null>(null);
  const [editEntries, setEditEntries] = useState<ScheduleEntry[]>([{ materie: '', profesor: '', sala: '', clasa: '' }]);
  const [editCuloare, setEditCuloare] = useState('#E3F2FD');
  const [showQR, setShowQR] = useState<string | null>(null);
  const [showRoomQR, setShowRoomQR] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [profesorAvatars, setProfesorAvatars] = useState<Record<string, string>>({});
  const [profesorQrcodes, setProfesorQrcodes] = useState<Record<string, string>>({});

  // Doar secretara si Inky pot edita orarul (unic per unitate scolara)
  const canEdit = user && (areRol(user.status, 'secretara') || isInky(user.status, user.nume_prenume));

  useEffect(() => {
    getScheduleWithAvatars().then((data) => {
      setCells(data.cells);
      setProfesorAvatars(data.profesorAvatars);
      setProfesorQrcodes(data.profesorQrcodes);
    });
  }, []);

  const getCell = (zi: string, ora: string) => cells.find(c => c.zi === zi && c.ora === ora);

  const handleCellClick = (zi: string, ora: string) => {
    if (!editing) return;
    const existing = getCell(zi, ora);
    setEditCell({ zi, ora });
    if (existing?.entries && existing.entries.length > 0) {
      setEditEntries(existing.entries.map(e => ({ ...e })));
    } else if (existing) {
      setEditEntries([{ materie: existing.materie, profesor: existing.profesor, sala: existing.sala || '', clasa: existing.clasa || '' }]);
    } else {
      setEditEntries([{ materie: '', profesor: '', sala: '', clasa: '' }]);
    }
    setEditCuloare(existing?.culoare || COLORS[Math.floor(Math.random() * COLORS.length)]);
  };

  const handleSaveCell = () => {
    if (!editCell) return;
    const { zi, ora } = editCell;
    // Filtram entries goale
    const validEntries = editEntries.filter(e => e.materie.trim());
    if (validEntries.length === 0) {
      setCells(prev => prev.filter(c => !(c.zi === zi && c.ora === ora)));
    } else {
      setCells(prev => {
        const existingIdx = prev.findIndex(c => c.zi === zi && c.ora === ora);
        const first = validEntries[0];
        const newCell: ScheduleCell = {
          zi, ora,
          materie: first.materie,
          profesor: first.profesor,
          sala: first.sala,
          clasa: first.clasa,
          culoare: editCuloare,
          entries: validEntries.length > 1 ? validEntries : undefined,
        };
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = newCell;
          return updated;
        }
        return [...prev, newCell];
      });
    }
    setEditCell(null);
    setDirty(true);
  };

  const updateEntry = (index: number, field: keyof ScheduleEntry, value: string) => {
    setEditEntries(prev => prev.map((e, i) => i === index ? { ...e, [field]: value } : e));
  };

  const addEntry = () => {
    setEditEntries(prev => [...prev, { materie: '', profesor: '', sala: '', clasa: '' }]);
  };

  const removeEntry = (index: number) => {
    setEditEntries(prev => prev.filter((_, i) => i !== index));
  };

  // Auto-propagation: rename professor across all cells (including entries)
  const handlePropagateProfesor = (oldName: string, newName: string) => {
    if (!oldName || oldName === newName) return;
    setCells(prev => prev.map(c => {
      let changed = false;
      let newCell = { ...c };
      if (c.profesor === oldName) { newCell.profesor = newName; changed = true; }
      if (c.entries) {
        const newEntries = c.entries.map(e => e.profesor === oldName ? { ...e, profesor: newName } : e);
        if (newEntries.some((e, i) => e !== c.entries![i])) { newCell.entries = newEntries; changed = true; }
      }
      return changed ? newCell : c;
    }));
    setDirty(true);
    toast.success(`"${oldName}" → "${newName}" în toate celulele`);
  };

  const handleSaveAll = async () => {
    try {
      await saveSchedule(cells);
      toast.success('Orar salvat!');
      setDirty(false);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // Get unique values for QR generation and autocomplete (include entries)
  const allEntries = cells.flatMap(c => c.entries || [{ materie: c.materie, profesor: c.profesor, sala: c.sala || '', clasa: c.clasa || '' }]);
  const uniqueTeachers = [...new Set(allEntries.map(e => e.profesor).filter(Boolean))];
  const uniqueRooms = [...new Set(allEntries.map(e => e.sala).filter(Boolean))];
  const uniqueSubjects = [...new Set(allEntries.map(e => e.materie).filter(Boolean))];
  const uniqueClasses = [...new Set(allEntries.map(e => e.clasa).filter(Boolean))];

  // Get teacher/room schedule for QR view
  const getTeacherSchedule = (profesor: string) => cells.filter(c => c.profesor === profesor);
  const getRoomSchedule = (sala: string) => cells.filter(c => c.sala === sala);

  // URL-ul pentru QR-urile profesorilor - scriptul original de pe serverul TID4K
  const buildTeacherQRUrl = (profesor: string) => {
    const teacherCells = getTeacherSchedule(profesor);
    const materie = teacherCells[0]?.materie || '';
    const params = new URLSearchParams({ profesor, materie });
    return `${API_BASE_URL}/pages/genereaza_qr_code_profesor.php?${params.toString()}`;
  };

  return (
    <div className="space-y-5 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold">Orar</h1>
          <p className="text-muted-foreground text-sm">{currentGroup?.nume}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {canEdit && (
            <>
              <Button
                variant={editing ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
                onClick={async () => {
                  if (editing && dirty) {
                    try {
                      await saveSchedule(cells);
                      toast.success('Orar salvat!');
                      setDirty(false);
                    } catch (e: any) {
                      toast.error(e.message);
                      return;
                    }
                  }
                  setEditing(!editing);
                }}
              >
                {editing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                {editing ? 'Oprește editarea' : 'Editează'}
              </Button>
              {dirty && (
                <Button size="sm" className="gap-2" onClick={handleSaveAll}>
                  <Save className="h-4 w-4" /> Salvează
                </Button>
              )}
            </>
          )}
          <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Printează
          </Button>
        </div>
      </div>

      {/* Teacher QR codes */}
      {uniqueTeachers.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1.5">QR Profesori</p>
          <div className="flex gap-2 flex-wrap">
            {uniqueTeachers.map(t => (
              <Badge
                key={t}
                variant="outline"
                className="cursor-pointer gap-1.5 hover:bg-muted"
                onClick={() => setShowQR(t)}
              >
                <QrCode className="h-3 w-3" /> {t}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Room QR codes (Cancelarie QR) */}
      {uniqueRooms.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1.5">QR Săli (Cancelarie)</p>
          <div className="flex gap-2 flex-wrap">
            {uniqueRooms.map(r => (
              <Badge
                key={r}
                variant="secondary"
                className="cursor-pointer gap-1.5 hover:bg-muted"
                onClick={() => setShowRoomQR(r)}
              >
                <DoorOpen className="h-3 w-3" /> {r}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Program Săptămânal
            {editing && <Badge variant="secondary" className="text-xs">Mod editare</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-px">
            <table className="w-full text-sm border-collapse min-w-[500px]">
              <thead>
                <tr>
                  <th className="border p-2 bg-muted text-left w-14 text-xs">Ora</th>
                  {DAYS.map(d => (
                    <th key={d} className="border p-2 bg-muted text-center font-medium text-xs">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map(hora => (
                  <tr key={hora}>
                    <td className="border p-2 font-mono text-xs text-muted-foreground">{hora}</td>
                    {DAYS.map(zi => {
                      const cell = getCell(zi, hora);
                      return (
                        <td
                          key={`${zi}-${hora}`}
                          className={`border p-2 text-center transition-colors ${editing ? 'cursor-pointer hover:bg-primary/10 hover:ring-1 hover:ring-primary/30' : ''}`}
                          style={cell ? { backgroundColor: cell.culoare } : undefined}
                          onClick={() => handleCellClick(zi, hora)}
                        >
                          {cell ? (
                            <div className="space-y-1">
                              {(cell.entries || [{ materie: cell.materie, profesor: cell.profesor, sala: cell.sala, clasa: cell.clasa }]).map((entry, idx) => {
                                const profKey = (entry.profesor || '').replace(/^prof\.\s*/i, '');
                                const avatarUrl = profesorAvatars[profKey] || profesorAvatars[entry.profesor || ''];
                                return (
                                  <div key={idx} className={cell.entries && cell.entries.length > 1 && idx > 0 ? 'border-t border-dashed border-muted-foreground/30 pt-1' : ''}>
                                    <p className="font-medium text-xs">{entry.materie}</p>
                                    <div className="flex items-center justify-center gap-1">
                                      {avatarUrl && <img src={avatarUrl} alt="" className="h-4 w-4 rounded-full object-cover shrink-0" />}
                                      <p className="text-[10px] text-muted-foreground truncate">{entry.profesor}</p>
                                    </div>
                                    {entry.clasa && <p className="text-[9px] text-muted-foreground/80">{entry.clasa}</p>}
                                    {entry.sala && <p className="text-[9px] text-muted-foreground/70">📍 {entry.sala}</p>}
                                  </div>
                                );
                              })}
                            </div>
                          ) : editing ? (
                            <span className="text-[10px] text-muted-foreground/50">+</span>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit cell dialog */}
      <Dialog open={!!editCell} onOpenChange={() => setEditCell(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">
              {editCell?.zi} — {editCell?.ora}
            </DialogTitle>
            <DialogDescription>Editează detaliile orei</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {editEntries.map((entry, idx) => (
              <div key={idx} className={`space-y-2 ${idx > 0 ? 'border-t pt-3' : ''}`}>
                {editEntries.length > 1 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Materia {idx + 1}</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeEntry(idx)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <div>
                  <Label>Materie</Label>
                  <Input
                    list="materii-autocomplete"
                    value={entry.materie}
                    onChange={e => updateEntry(idx, 'materie', e.target.value)}
                    placeholder="Ex: Matematica"
                  />
                </div>
                <div>
                  <Label>Profesor</Label>
                  <Input
                    list="profesori-autocomplete"
                    value={entry.profesor}
                    onChange={e => updateEntry(idx, 'profesor', e.target.value)}
                    placeholder="Ex: Prof. Ionescu"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Clasă</Label>
                    <Input
                      list="clase-autocomplete"
                      value={entry.clasa || ''}
                      onChange={e => updateEntry(idx, 'clasa', e.target.value)}
                      placeholder="VII-C"
                    />
                  </div>
                  <div>
                    <Label>Sală</Label>
                    <Input
                      list="sali-autocomplete"
                      value={entry.sala || ''}
                      onChange={e => updateEntry(idx, 'sala', e.target.value)}
                      placeholder="Sala 101"
                    />
                  </div>
                </div>
              </div>
            ))}
            <datalist id="materii-autocomplete">
              {uniqueSubjects.map(s => <option key={s} value={s} />)}
            </datalist>
            <datalist id="profesori-autocomplete">
              {uniqueTeachers.map(t => <option key={t} value={t} />)}
            </datalist>
            <datalist id="clase-autocomplete">
              {uniqueClasses.map(c => <option key={c} value={c} />)}
            </datalist>
            <datalist id="sali-autocomplete">
              {uniqueRooms.map(r => <option key={r} value={r} />)}
            </datalist>
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={addEntry}>
              + Adaugă materie
            </Button>
            <div>
              <Label>Culoare</Label>
              <div className="flex gap-2 flex-wrap mt-1">
                {COLORS.map(c => (
                  <button
                    key={c}
                    className={`h-7 w-7 rounded-md border-2 transition-all ${editCuloare === c ? 'border-primary scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setEditCuloare(c)}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveCell} className="flex-1">Salvează</Button>
              {getCell(editCell?.zi || '', editCell?.ora || '') && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    setEditEntries([{ materie: '', profesor: '', sala: '', clasa: '' }]);
                    handleSaveCell();
                  }}
                >
                  Șterge
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Teacher QR Dialog */}
      <Dialog open={!!showQR} onOpenChange={() => setShowQR(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">QR Profesor — {showQR}</DialogTitle>
            <DialogDescription>Scanează codul pentru a vedea orarul profesorului</DialogDescription>
          </DialogHeader>
          {showQR && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <QRCodeSVG
                  value={buildTeacherQRUrl(showQR)}
                  size={180}
                />
              </div>
              <div className="space-y-1">
                {DAYS.map(zi => {
                  const dayCells = getTeacherSchedule(showQR).filter(c => c.zi === zi);
                  if (!dayCells.length) return null;
                  return (
                    <div key={zi}>
                      <p className="text-xs font-semibold text-muted-foreground">{zi}</p>
                      {dayCells.map(c => (
                        <p key={`${c.zi}-${c.ora}`} className="text-sm ml-3">
                          {c.ora} — {c.materie} {c.sala && <span className="text-muted-foreground text-xs">({c.sala})</span>}
                        </p>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Room QR Dialog (Cancelarie QR) */}
      <Dialog open={!!showRoomQR} onOpenChange={() => setShowRoomQR(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <DoorOpen className="h-5 w-5" /> Orar sală — {showRoomQR}
            </DialogTitle>
            <DialogDescription>Scanează codul pentru a vedea programul sălii</DialogDescription>
          </DialogHeader>
          {showRoomQR && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <QRCodeSVG
                  value={`${API_BASE_URL}/pages/genereaza_qr_code_profesor.php?sala=${encodeURIComponent(showRoomQR)}`}
                  size={180}
                />
              </div>
              <div className="space-y-1">
                {DAYS.map(zi => {
                  const dayCells = getRoomSchedule(showRoomQR).filter(c => c.zi === zi);
                  if (!dayCells.length) return null;
                  return (
                    <div key={zi}>
                      <p className="text-xs font-semibold text-muted-foreground">{zi}</p>
                      {dayCells.map(c => (
                        <p key={`${c.zi}-${c.ora}`} className="text-sm ml-3">
                          {c.ora} — {c.materie} <span className="text-muted-foreground text-xs">({c.profesor})</span>
                        </p>
                      ))}
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                Printează acest QR și lipește-l pe ușa sălii {showRoomQR}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

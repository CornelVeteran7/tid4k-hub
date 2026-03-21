import { useState, useEffect, useRef } from 'react';
import { useGroup } from '@/contexts/GroupContext';
import { useAuth } from '@/contexts/AuthContext';
import { getScheduleWithAvatars, saveSchedule } from '@/api/schedule';
import type { ScheduleData } from '@/api/schedule';
import { areRol, isInky } from '@/utils/roles';
import type { ScheduleCell, ScheduleEntry, ProfesorAbsenta } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarWidget } from '@/components/ui/calendar';
import { ro } from 'date-fns/locale';
import { Calendar, Printer, Save, Edit2, QrCode, X, DoorOpen, Camera, Trash2, Plus, CalendarDays } from 'lucide-react';
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
  const [avatarProfesorTinta, setAvatarProfesorTinta] = useState<string>('');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Doar secretara si Inky pot edita orarul (unic per unitate scolara)
  const canEdit = user && (areRol(user.status, 'secretara') || isInky(user.status, user.nume_prenume));

  // Extrage cheia avatar (fara prefixul "prof. ")
  const getAvatarKey = (profesor: string) => (profesor || '').replace(/^prof\.\s*/i, '');

  // Deschide file picker pentru avatarul unui profesor
  const deschideAvatarPicker = (numeProfesor: string) => {
    const key = getAvatarKey(numeProfesor);
    if (!key) {
      toast.error('Completează numele profesorului mai întâi');
      return;
    }
    setAvatarProfesorTinta(key);
    avatarInputRef.current?.click();
  };

  // Proceseaza fisierul selectat
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selectează un fișier imagine (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imaginea nu poate depăși 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setProfesorAvatars(prev => ({ ...prev, [avatarProfesorTinta]: base64 }));
      setDirty(true);
      toast.success(`Avatar setat pentru ${avatarProfesorTinta}`);
    };
    reader.readAsDataURL(file);

    // Reset input pentru a permite reselectarea aceluiasi fisier
    e.target.value = '';
  };

  // Sterge avatarul unui profesor
  const stergeAvatar = (numeProfesor: string) => {
    const key = getAvatarKey(numeProfesor);
    setProfesorAvatars(prev => {
      const nou = { ...prev };
      delete nou[key];
      return nou;
    });
    setDirty(true);
    toast.success(`Avatar șters pentru ${key}`);
  };

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
        // Verificăm dacă vreun entry are date de activitate/absențe
        const areActivitate = validEntries.some(e => e.activitate_inceput || e.activitate_sfarsit || e.activitate_zile || (e.absente && e.absente.length > 0));
        const newCell: ScheduleCell = {
          zi, ora,
          materie: first.materie,
          profesor: first.profesor,
          sala: first.sala,
          clasa: first.clasa,
          culoare: editCuloare,
          entries: (validEntries.length > 1 || areActivitate) ? validEntries : undefined,
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

  const updateEntry = (index: number, field: keyof ScheduleEntry, value: any) => {
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
      await saveSchedule(cells, profesorAvatars);
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
                      await saveSchedule(cells, profesorAvatars);
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

      {/* Input file ascuns pentru avatar (cross-platform compatible) */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.gif,.webp,.heic,.heif"
        onChange={handleAvatarChange}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
      />

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
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Program Săptămânal
              {editing && <Badge variant="secondary" className="text-xs">Mod editare</Badge>}
            </CardTitle>
          </div>
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

          {/* Legendă orar (identic cu editorul vechi PHP) */}
          {cells.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 pt-3 border-t text-[11px] text-muted-foreground">
              {COLORS.map((c, i) => {
                // Găsim o materie care folosește această culoare
                const celulaCuCuloare = cells.find(cell => cell.culoare === c);
                if (!celulaCuCuloare) return null;
                return (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm border shrink-0" style={{ backgroundColor: c }} />
                    <span>{celulaCuCuloare.materie}</span>
                  </div>
                );
              })}
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm border bg-background shrink-0" />
                <span>Liber</span>
              </div>
            </div>
          )}
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
                  <div className="flex items-center gap-2">
                    <Input
                      list="profesori-autocomplete"
                      value={entry.profesor}
                      onChange={e => updateEntry(idx, 'profesor', e.target.value)}
                      placeholder="Ex: Prof. Ionescu"
                      className="flex-1"
                    />
                    {(() => {
                      const key = getAvatarKey(entry.profesor);
                      const avatarExistent = key ? profesorAvatars[key] : null;
                      return (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            className="h-9 w-9 rounded-md border border-input flex items-center justify-center hover:bg-accent transition-colors overflow-hidden"
                            title={avatarExistent ? 'Schimbă avatarul' : 'Adaugă avatar'}
                            onClick={() => deschideAvatarPicker(entry.profesor)}
                          >
                            {avatarExistent ? (
                              <img src={avatarExistent} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <Camera className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                          {avatarExistent && (
                            <button
                              type="button"
                              className="h-9 w-9 rounded-md border border-input flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
                              title="Șterge avatarul"
                              onClick={() => stergeAvatar(entry.profesor)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
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

                {/* Activitate profesor + Absențe (identic cu editorul vechi PHP) */}
                {entry.profesor.trim() && (
                  <div className="border rounded-md p-2.5 mt-2 space-y-2 bg-muted/30">
                    <p className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" /> Activitate Profesor
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[11px]">De la</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full h-8 text-xs justify-start font-normal">
                              <CalendarDays className="h-3 w-3 mr-1.5" />
                              {entry.activitate_inceput || 'Selectează'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarWidget mode="single" locale={ro}
                              selected={entry.activitate_inceput ? new Date(entry.activitate_inceput + 'T12:00:00') : undefined}
                              onSelect={d => { if (d) updateEntry(idx, 'activitate_inceput', d.toISOString().split('T')[0]); }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label className="text-[11px]">Până la</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full h-8 text-xs justify-start font-normal">
                              <CalendarDays className="h-3 w-3 mr-1.5" />
                              {entry.activitate_sfarsit || 'Selectează'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarWidget mode="single" locale={ro}
                              selected={entry.activitate_sfarsit ? new Date(entry.activitate_sfarsit + 'T12:00:00') : undefined}
                              onSelect={d => { if (d) updateEntry(idx, 'activitate_sfarsit', d.toISOString().split('T')[0]); }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[11px]">Zile activitate</Label>
                      <Input type="number" min={1} max={31} className="text-xs h-8 w-24"
                        value={entry.activitate_zile || ''}
                        onChange={e => updateEntry(idx, 'activitate_zile', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="Nr"
                      />
                    </div>

                    {/* Absențe */}
                    <div className="border-t pt-2 mt-2">
                      <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">Absențe</p>
                      {(entry.absente || []).map((abs, absIdx) => (
                        <div key={absIdx} className="flex items-center gap-1.5 mb-1">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm" className="h-7 text-[11px] flex-1 justify-start font-normal">
                                <CalendarDays className="h-3 w-3 mr-1" />
                                {abs.data || 'Ziua'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarWidget mode="single" locale={ro}
                                selected={abs.data ? new Date(abs.data + 'T12:00:00') : undefined}
                                onSelect={d => {
                                  if (!d) return;
                                  const absNoi = [...(entry.absente || [])];
                                  absNoi[absIdx] = { ...absNoi[absIdx], data: d.toISOString().split('T')[0] };
                                  updateEntry(idx, 'absente', absNoi);
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                          <Select value={abs.motiv || ''} onValueChange={val => {
                            const absNoi = [...(entry.absente || [])];
                            absNoi[absIdx] = { ...absNoi[absIdx], motiv: val };
                            updateEntry(idx, 'absente', absNoi);
                          }}>
                            <SelectTrigger className="h-7 text-xs w-28">
                              <SelectValue placeholder="Motiv" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="medical">Medical</SelectItem>
                              <SelectItem value="personal">Personal</SelectItem>
                              <SelectItem value="concediu">Concediu</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive"
                            onClick={() => {
                              const absNoi = (entry.absente || []).filter((_, i) => i !== absIdx);
                              updateEntry(idx, 'absente', absNoi);
                            }}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="h-7 text-[11px] w-full"
                        onClick={() => {
                          const absNoi = [...(entry.absente || []), { data: '', motiv: '' }];
                          updateEntry(idx, 'absente', absNoi);
                        }}>
                        <Plus className="h-3 w-3 mr-1" /> Adaugă absență
                      </Button>
                    </div>
                  </div>
                )}
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

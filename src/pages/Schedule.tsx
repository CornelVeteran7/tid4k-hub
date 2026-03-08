import { useState, useEffect } from 'react';
import { useGroup } from '@/contexts/GroupContext';
import { useAuth } from '@/contexts/AuthContext';
import { getSchedule, saveSchedule } from '@/api/schedule';
import { areRol, isInky } from '@/utils/roles';
import type { ScheduleCell } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Printer, Save, Edit2, QrCode, X } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

const DAYS = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri'];
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
const COLORS = ['#E3F2FD', '#E8F5E9', '#FFF3E0', '#F3E5F5', '#FFEBEE', '#E0F7FA', '#FFF8E1', '#F1F8E9'];

export default function Schedule() {
  const { currentGroup } = useGroup();
  const { user } = useAuth();
  const [cells, setCells] = useState<ScheduleCell[]>([]);
  const [editing, setEditing] = useState(false);
  const [editCell, setEditCell] = useState<{ zi: string; ora: string } | null>(null);
  const [editForm, setEditForm] = useState({ materie: '', profesor: '', culoare: '#E3F2FD' });
  const [showQR, setShowQR] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const canEdit = user && (areRol(user.status, 'profesor') || areRol(user.status, 'director') || areRol(user.status, 'administrator') || isInky(user.status, user.nume_prenume));

  useEffect(() => {
    if (currentGroup) getSchedule(currentGroup.id).then(setCells);
  }, [currentGroup]);

  const getCell = (zi: string, ora: string) => cells.find(c => c.zi === zi && c.ora === ora);

  const handleCellClick = (zi: string, ora: string) => {
    if (!editing) return;
    const existing = getCell(zi, ora);
    setEditCell({ zi, ora });
    setEditForm({
      materie: existing?.materie || '',
      profesor: existing?.profesor || '',
      culoare: existing?.culoare || COLORS[Math.floor(Math.random() * COLORS.length)],
    });
  };

  const handleSaveCell = () => {
    if (!editCell) return;
    const { zi, ora } = editCell;
    if (!editForm.materie) {
      // Remove cell
      setCells(prev => prev.filter(c => !(c.zi === zi && c.ora === ora)));
    } else {
      setCells(prev => {
        const existing = prev.findIndex(c => c.zi === zi && c.ora === ora);
        const newCell: ScheduleCell = { zi, ora, materie: editForm.materie, profesor: editForm.profesor, culoare: editForm.culoare };
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = newCell;
          return updated;
        }
        return [...prev, newCell];
      });
    }
    setEditCell(null);
    setDirty(true);
  };

  // Auto-propagation: rename professor across all cells
  const handlePropagateProfesor = (oldName: string, newName: string) => {
    if (!oldName || oldName === newName) return;
    setCells(prev => prev.map(c => c.profesor === oldName ? { ...c, profesor: newName } : c));
    setDirty(true);
    toast.success(`"${oldName}" → "${newName}" în toate celulele`);
  };

  const handleSaveAll = async () => {
    if (!currentGroup) return;
    try {
      await saveSchedule(currentGroup.id, cells);
      toast.success('Orar salvat!');
      setDirty(false);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // Get unique teachers for QR generation
  const uniqueTeachers = [...new Set(cells.map(c => c.profesor).filter(Boolean))];

  // Get teacher schedule for QR view
  const getTeacherSchedule = (profesor: string) => cells.filter(c => c.profesor === profesor);

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
                onClick={() => setEditing(!editing)}
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
          <Button variant="outline" size="sm" className="gap-2">
            <Printer className="h-4 w-4" /> Printează
          </Button>
        </div>
      </div>

      {/* Teacher QR codes */}
      {uniqueTeachers.length > 0 && (
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
                            <div>
                              <p className="font-medium text-xs">{cell.materie}</p>
                              <p className="text-[10px] text-muted-foreground">{cell.profesor}</p>
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
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">
              {editCell?.zi} — {editCell?.ora}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Materie</Label>
              <Input
                value={editForm.materie}
                onChange={e => setEditForm(p => ({ ...p, materie: e.target.value }))}
                placeholder="Ex: Matematica"
              />
            </div>
            <div>
              <Label>Profesor</Label>
              <Input
                value={editForm.profesor}
                onChange={e => setEditForm(p => ({ ...p, profesor: e.target.value }))}
                placeholder="Ex: Prof. Ionescu"
              />
              {/* Auto-propagation hint */}
              {editCell && (() => {
                const existing = getCell(editCell.zi, editCell.ora);
                if (existing?.profesor && editForm.profesor && existing.profesor !== editForm.profesor) {
                  const count = cells.filter(c => c.profesor === existing.profesor).length;
                  if (count > 1) {
                    return (
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs px-0 h-auto mt-1"
                        onClick={() => {
                          handlePropagateProfesor(existing.profesor, editForm.profesor);
                        }}
                      >
                        🔄 Schimbă "{existing.profesor}" → "{editForm.profesor}" în toate {count} celulele
                      </Button>
                    );
                  }
                }
                return null;
              })()}
            </div>
            <div>
              <Label>Culoare</Label>
              <div className="flex gap-2 flex-wrap mt-1">
                {COLORS.map(c => (
                  <button
                    key={c}
                    className={`h-7 w-7 rounded-md border-2 transition-all ${editForm.culoare === c ? 'border-primary scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setEditForm(p => ({ ...p, culoare: c }))}
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
                    setEditForm(p => ({ ...p, materie: '' }));
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
            <DialogTitle className="text-base">Orar — {showQR}</DialogTitle>
          </DialogHeader>
          {showQR && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <QRCodeSVG
                  value={JSON.stringify({
                    type: 'teacher_schedule',
                    teacher: showQR,
                    group: currentGroup?.nume,
                    schedule: getTeacherSchedule(showQR).map(c => ({
                      zi: c.zi, ora: c.ora, materie: c.materie
                    }))
                  })}
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
                          {c.ora} — {c.materie}
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
    </div>
  );
}

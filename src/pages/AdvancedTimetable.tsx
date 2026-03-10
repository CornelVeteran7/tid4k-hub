import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar, Save, Edit2, X, QrCode, DoorOpen, Printer, Settings2, Users, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { areRol, isInky } from '@/utils/roles';
import {
  getTimetableConfig, saveTimetableConfig, getTimetableEntries,
  saveTimetableEntries, propagateTeacherRename, computePeriodTimes,
  getCurrentPeriod,
  type TimetableConfig, type TimetableEntry,
} from '@/api/timetable';

const DAYS = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri'];
const COLORS = ['#E3F2FD', '#E8F5E9', '#FFF3E0', '#F3E5F5', '#FFEBEE', '#E0F7FA', '#FFF8E1', '#F1F8E9'];
const DEFAULT_CLASSES = [
  'Clasa I-A', 'Clasa I-B', 'Clasa a II-a A', 'Clasa a II-a B',
  'Clasa a III-a A', 'Clasa a IV-a A', 'Clasa a V-a A', 'Clasa a V-a B',
  'Clasa a VI-a A', 'Clasa a VII-a A', 'Clasa a VIII-a A',
];

export default function AdvancedTimetable() {
  const { user } = useAuth();
  const orgId = user?.organization_id || '';
  const canEdit = user && (areRol(user.status, 'profesor') || areRol(user.status, 'director') || areRol(user.status, 'administrator') || isInky(user.status, user.nume_prenume));

  const [config, setConfig] = useState<TimetableConfig | null>(null);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [allEntries, setAllEntries] = useState<TimetableEntry[]>([]);
  const [selectedClass, setSelectedClass] = useState(DEFAULT_CLASSES[0]);
  const [editing, setEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [editCell, setEditCell] = useState<{ day: number; period: number } | null>(null);
  const [editForm, setEditForm] = useState({ subject: '', teacher_name: '', room: '' });
  const [showTeacherQR, setShowTeacherQR] = useState<string | null>(null);
  const [showRoomQR, setShowRoomQR] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [configForm, setConfigForm] = useState({ periods_per_day: 7, period_duration_minutes: 50, start_time: '08:00' });

  useEffect(() => {
    if (!orgId) return;
    getTimetableConfig(orgId).then(c => {
      if (c) {
        setConfig(c);
        setConfigForm({ periods_per_day: c.periods_per_day, period_duration_minutes: c.period_duration_minutes, start_time: c.start_time });
      } else {
        setConfig({ id: '', organization_id: orgId, periods_per_day: 7, period_duration_minutes: 50, break_durations: [10, 10, 20, 10, 10, 10], start_time: '08:00' });
      }
    });
    getTimetableEntries(orgId).then(setAllEntries);
  }, [orgId]);

  useEffect(() => {
    setEntries(allEntries.filter(e => e.class_id === selectedClass));
  }, [allEntries, selectedClass]);

  const periodTimes = useMemo(() => config ? computePeriodTimes(config) : [], [config]);
  const currentPeriodInfo = useMemo(() => config ? getCurrentPeriod(config) : { period: 0, remaining: 0, isBreak: false }, [config]);

  const getEntry = (day: number, period: number) => entries.find(e => e.day_of_week === day && e.period_number === period);

  const handleCellClick = (day: number, period: number) => {
    if (!editing) return;
    const existing = getEntry(day, period);
    setEditCell({ day, period });
    setEditForm({
      subject: existing?.subject || '',
      teacher_name: existing?.teacher_name || '',
      room: existing?.room || '',
    });
  };

  const handleSaveCell = () => {
    if (!editCell) return;
    const { day, period } = editCell;
    if (!editForm.subject) {
      setEntries(prev => prev.filter(e => !(e.day_of_week === day && e.period_number === period)));
    } else {
      setEntries(prev => {
        const idx = prev.findIndex(e => e.day_of_week === day && e.period_number === period);
        const newEntry: TimetableEntry = {
          class_id: selectedClass,
          day_of_week: day,
          period_number: period,
          subject: editForm.subject,
          teacher_name: editForm.teacher_name,
          room: editForm.room,
        };
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = newEntry;
          return updated;
        }
        return [...prev, newEntry];
      });
    }
    setEditCell(null);
    setDirty(true);
  };

  const handlePropagate = async (oldName: string, newName: string) => {
    if (!orgId) return;
    const count = await propagateTeacherRename(orgId, oldName, newName);
    toast.success(`"${oldName}" → "${newName}" în ${count} celule din toate clasele`);
    const fresh = await getTimetableEntries(orgId);
    setAllEntries(fresh);
    setDirty(false);
  };

  const handleSaveAll = async () => {
    if (!orgId) return;
    try {
      await saveTimetableEntries(orgId, selectedClass, entries);
      toast.success('Orar salvat!');
      setDirty(false);
      const fresh = await getTimetableEntries(orgId);
      setAllEntries(fresh);
    } catch (e: any) { toast.error(e.message); }
  };

  const handleSaveConfig = async () => {
    if (!orgId) return;
    try {
      await saveTimetableConfig(orgId, configForm);
      const c = await getTimetableConfig(orgId);
      if (c) setConfig(c);
      toast.success('Configurare salvată!');
      setShowConfig(false);
    } catch (e: any) { toast.error(e.message); }
  };

  // Unique teachers/rooms across ALL classes
  const uniqueTeachers = [...new Set(allEntries.map(e => e.teacher_name).filter(Boolean))];
  const uniqueRooms = [...new Set(allEntries.map(e => e.room).filter(Boolean))];

  // Used subjects for autocomplete
  const usedSubjects = [...new Set(allEntries.map(e => e.subject).filter(Boolean))];
  const usedTeachers = uniqueTeachers;

  // Teacher schedule across all classes
  const getTeacherFullSchedule = (name: string) => allEntries.filter(e => e.teacher_name === name);
  const getRoomFullSchedule = (room: string) => allEntries.filter(e => e.room === room);

  const periodsCount = config?.periods_per_day || 7;

  return (
    <div className="space-y-5 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold">Orar Avansat</h1>
          <p className="text-muted-foreground text-sm">
            {selectedClass}
            {currentPeriodInfo.period > 0 && !currentPeriodInfo.isBreak && (
              <span className="ml-2 text-success font-medium">
                · Ora {currentPeriodInfo.period} ({currentPeriodInfo.remaining} min rămase)
              </span>
            )}
            {currentPeriodInfo.isBreak && (
              <span className="ml-2 text-warning font-medium">
                · Pauză ({currentPeriodInfo.remaining} min)
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEFAULT_CLASSES.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {canEdit && (
            <>
              <Button variant={editing ? 'default' : 'outline'} size="sm" className="gap-2" onClick={() => setEditing(!editing)}>
                {editing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                {editing ? 'Oprește' : 'Editează'}
              </Button>
              {dirty && (
                <Button size="sm" className="gap-2" onClick={handleSaveAll}>
                  <Save className="h-4 w-4" /> Salvează
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowConfig(true)}>
                <Settings2 className="h-4 w-4" /> Config
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      {/* QR badges */}
      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid" className="gap-1.5"><Calendar className="h-3.5 w-3.5" /> Orar</TabsTrigger>
          <TabsTrigger value="teachers" className="gap-1.5"><Users className="h-3.5 w-3.5" /> Profesori ({uniqueTeachers.length})</TabsTrigger>
          <TabsTrigger value="rooms" className="gap-1.5"><DoorOpen className="h-3.5 w-3.5" /> Săli ({uniqueRooms.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> {selectedClass} — Program Săptămânal
                {editing && <Badge variant="secondary" className="text-xs">Mod editare</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-px">
                <table className="w-full text-sm border-collapse min-w-[600px] print-table">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-muted text-left w-24 text-xs">Ora</th>
                      {DAYS.map(d => (
                        <th key={d} className="border p-2 bg-muted text-center font-medium text-xs">{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: periodsCount }, (_, i) => i + 1).map(periodNum => {
                      const time = periodTimes[periodNum - 1];
                      const isCurrent = currentPeriodInfo.period === periodNum && !currentPeriodInfo.isBreak;
                      return (
                        <tr key={periodNum} className={isCurrent ? 'ring-2 ring-success/50' : ''}>
                          <td className="border p-2 text-xs">
                            <div className="font-semibold text-foreground">Ora {periodNum}</div>
                            {time && <div className="font-mono text-muted-foreground text-[10px]">{time.start}–{time.end}</div>}
                          </td>
                          {[1, 2, 3, 4, 5].map(day => {
                            const entry = getEntry(day, periodNum);
                            const colorIdx = entry ? (usedSubjects.indexOf(entry.subject) % COLORS.length) : 0;
                            return (
                              <td
                                key={`${day}-${periodNum}`}
                                className={`border p-2 text-center transition-colors ${editing ? 'cursor-pointer hover:bg-primary/10 hover:ring-1 hover:ring-primary/30' : ''} ${isCurrent ? 'bg-success/5' : ''}`}
                                style={entry ? { backgroundColor: COLORS[colorIdx] } : undefined}
                                onClick={() => handleCellClick(day, periodNum)}
                              >
                                {entry ? (
                                  <div>
                                    <p className="font-medium text-xs">{entry.subject}</p>
                                    <p className="text-[10px] text-muted-foreground">{entry.teacher_name}</p>
                                    {entry.room && <p className="text-[9px] text-muted-foreground/70">📍 {entry.room}</p>}
                                  </div>
                                ) : editing ? (
                                  <span className="text-[10px] text-muted-foreground/50">+</span>
                                ) : null}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-3">
          {uniqueTeachers.map(t => (
            <Card key={t} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setShowTeacherQR(t)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{t}</p>
                  <p className="text-xs text-muted-foreground">
                    {getTeacherFullSchedule(t).length} ore/săptămână · {[...new Set(getTeacherFullSchedule(t).map(e => e.class_id))].length} clase
                  </p>
                </div>
                <Badge variant="outline" className="gap-1.5"><QrCode className="h-3 w-3" /> QR</Badge>
              </CardContent>
            </Card>
          ))}
          {uniqueTeachers.length === 0 && <p className="text-center py-8 text-muted-foreground">Adăugați ore în orar pentru a vedea profesorii</p>}
        </TabsContent>

        <TabsContent value="rooms" className="space-y-3">
          {uniqueRooms.map(r => (
            <Card key={r} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setShowRoomQR(r)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm flex items-center gap-2"><DoorOpen className="h-4 w-4" /> {r}</p>
                  <p className="text-xs text-muted-foreground">
                    {getRoomFullSchedule(r).length} ore/săptămână
                  </p>
                </div>
                <Badge variant="secondary" className="gap-1.5"><QrCode className="h-3 w-3" /> Cancelarie QR</Badge>
              </CardContent>
            </Card>
          ))}
          {uniqueRooms.length === 0 && <p className="text-center py-8 text-muted-foreground">Adăugați săli în orar</p>}
        </TabsContent>
      </Tabs>

      {/* Edit cell dialog */}
      <Dialog open={!!editCell} onOpenChange={() => setEditCell(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">
              {editCell ? `${DAYS[editCell.day - 1]} — Ora ${editCell.period}` : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Materie</Label>
              <Input
                value={editForm.subject}
                onChange={e => setEditForm(p => ({ ...p, subject: e.target.value }))}
                placeholder="Ex: Matematica"
                list="subjects-list"
              />
              <datalist id="subjects-list">
                {usedSubjects.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>
            <div>
              <Label>Profesor</Label>
              <Input
                value={editForm.teacher_name}
                onChange={e => setEditForm(p => ({ ...p, teacher_name: e.target.value }))}
                placeholder="Ex: Prof. Ionescu"
                list="teachers-list"
              />
              <datalist id="teachers-list">
                {usedTeachers.map(t => <option key={t} value={t} />)}
              </datalist>
              {/* Auto-propagation hint */}
              {editCell && (() => {
                const existing = getEntry(editCell.day, editCell.period);
                if (existing?.teacher_name && editForm.teacher_name && existing.teacher_name !== editForm.teacher_name) {
                  const count = allEntries.filter(e => e.teacher_name === existing.teacher_name).length;
                  if (count > 1) {
                    return (
                      <Button variant="link" size="sm" className="text-xs px-0 h-auto mt-1"
                        onClick={() => handlePropagate(existing.teacher_name, editForm.teacher_name)}>
                        🔄 Actualizați "{existing.teacher_name}" → "{editForm.teacher_name}" în toate {count} celulele?
                      </Button>
                    );
                  }
                }
                return null;
              })()}
            </div>
            <div>
              <Label>Sală</Label>
              <Input
                value={editForm.room}
                onChange={e => setEditForm(p => ({ ...p, room: e.target.value }))}
                placeholder="Ex: Sala 101"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveCell} className="flex-1">Salvează</Button>
              {getEntry(editCell?.day || 0, editCell?.period || 0) && (
                <Button variant="destructive" onClick={() => { setEditForm(p => ({ ...p, subject: '' })); handleSaveCell(); }}>
                  Șterge
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Teacher QR Dialog — cross-class schedule */}
      <Dialog open={!!showTeacherQR} onOpenChange={() => setShowTeacherQR(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <QrCode className="h-5 w-5" /> Orar complet — {showTeacherQR}
            </DialogTitle>
          </DialogHeader>
          {showTeacherQR && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <QRCodeSVG
                  value={JSON.stringify({
                    type: 'teacher_schedule_full',
                    teacher: showTeacherQR,
                    schedule: getTeacherFullSchedule(showTeacherQR).map(e => ({
                      class: e.class_id, day: e.day_of_week, period: e.period_number,
                      subject: e.subject, room: e.room,
                    }))
                  })}
                  size={160}
                />
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {DAYS.map((dayName, dayIdx) => {
                  const dayEntries = getTeacherFullSchedule(showTeacherQR).filter(e => e.day_of_week === dayIdx + 1);
                  if (!dayEntries.length) return null;
                  return (
                    <div key={dayName}>
                      <p className="text-xs font-semibold text-muted-foreground">{dayName}</p>
                      {dayEntries.sort((a, b) => a.period_number - b.period_number).map(e => (
                        <p key={`${e.day_of_week}-${e.period_number}`} className="text-sm ml-3">
                          Ora {e.period_number} — {e.subject}
                          <span className="text-muted-foreground text-xs ml-1">({e.class_id})</span>
                          {e.room && <span className="text-muted-foreground text-xs"> · {e.room}</span>}
                        </p>
                      ))}
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-center text-muted-foreground">
                Scanează QR-ul pentru a vedea orarul complet al profesorului
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Room QR Dialog */}
      <Dialog open={!!showRoomQR} onOpenChange={() => setShowRoomQR(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <DoorOpen className="h-5 w-5" /> Orar sală — {showRoomQR}
            </DialogTitle>
          </DialogHeader>
          {showRoomQR && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground text-center">
                Lipește acest QR pe ușa sălii {showRoomQR}
              </p>
              <div className="flex justify-center">
                <QRCodeSVG
                  value={JSON.stringify({
                    type: 'room_schedule',
                    room: showRoomQR,
                    schedule: getRoomFullSchedule(showRoomQR).map(e => ({
                      class: e.class_id, day: e.day_of_week, period: e.period_number,
                      subject: e.subject, teacher: e.teacher_name,
                    }))
                  })}
                  size={160}
                />
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {DAYS.map((dayName, dayIdx) => {
                  const dayEntries = getRoomFullSchedule(showRoomQR).filter(e => e.day_of_week === dayIdx + 1);
                  if (!dayEntries.length) return null;
                  return (
                    <div key={dayName}>
                      <p className="text-xs font-semibold text-muted-foreground">{dayName}</p>
                      {dayEntries.sort((a, b) => a.period_number - b.period_number).map(e => (
                        <p key={`${e.day_of_week}-${e.period_number}`} className="text-sm ml-3">
                          Ora {e.period_number} — {e.subject}
                          <span className="text-muted-foreground text-xs ml-1">({e.teacher_name} · {e.class_id})</span>
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

      {/* Config dialog */}
      <Dialog open={showConfig} onOpenChange={setShowConfig}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Settings2 className="h-5 w-5" /> Configurare Orar
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Ore pe zi</Label>
              <Input type="number" min={1} max={8} value={configForm.periods_per_day}
                onChange={e => setConfigForm(p => ({ ...p, periods_per_day: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Durata orei (minute)</Label>
              <Input type="number" min={30} max={90} value={configForm.period_duration_minutes}
                onChange={e => setConfigForm(p => ({ ...p, period_duration_minutes: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Ora de început</Label>
              <Input type="time" value={configForm.start_time}
                onChange={e => setConfigForm(p => ({ ...p, start_time: e.target.value }))} />
            </div>
            <Button onClick={handleSaveConfig} className="w-full">Salvează configurarea</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

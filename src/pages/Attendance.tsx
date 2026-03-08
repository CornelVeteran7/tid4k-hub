import { useState, useEffect, useMemo } from 'react';
import { useGroup } from '@/contexts/GroupContext';
import { useAuth } from '@/contexts/AuthContext';
import { getWeeklyAttendance, saveWeeklyAttendance, getParentChildAttendance, getAttendanceStats } from '@/api/attendance';
import type { WeeklyAttendanceData, AttendanceStats } from '@/types';
import { areRol, isInky } from '@/utils/roles';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Save, Printer, ChevronLeft, ChevronRight, Loader2, CheckCheck, MessageSquare, BarChart3 } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { ro } from 'date-fns/locale';
import { toast } from 'sonner';

const DAY_LABELS = ['L', 'Ma', 'Mi', 'J', 'V'];
const MONTHS = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'];

const PASTEL_COLORS = [
  'bg-rose-200 text-rose-700',
  'bg-sky-200 text-sky-700',
  'bg-amber-200 text-amber-700',
  'bg-emerald-200 text-emerald-700',
  'bg-violet-200 text-violet-700',
  'bg-pink-200 text-pink-700',
  'bg-teal-200 text-teal-700',
  'bg-orange-200 text-orange-700',
];

function getMonday(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

function getWeekDates(monday: Date): string[] {
  return Array.from({ length: 5 }, (_, i) => format(addDays(monday, i), 'yyyy-MM-dd'));
}

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Attendance({ embedded }: { embedded?: boolean }) {
  const { currentGroup } = useGroup();
  const { user } = useAuth();
  const [monday, setMonday] = useState(() => getMonday(new Date()));
  const [data, setData] = useState<WeeklyAttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [noteEditing, setNoteEditing] = useState<{ childId: string; date: string } | null>(null);
  const [noteText, setNoteText] = useState('');
  const [activeTab, setActiveTab] = useState('weekly');

  // Stats state
  const [statsMonth, setStatsMonth] = useState(new Date().getMonth() + 1);
  const [statsYear, setStatsYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const weekDates = useMemo(() => getWeekDates(monday), [monday]);
  const today = format(new Date(), 'yyyy-MM-dd');

  const userStatus = user?.status || '';
  const isParent = areRol(userStatus, 'parinte') && !areRol(userStatus, 'profesor') && !areRol(userStatus, 'director') && !areRol(userStatus, 'administrator') && !isInky(userStatus, user?.nume_prenume || '');
  const canEdit = !isParent;

  useEffect(() => {
    if (!currentGroup) return;
    setLoading(true);
    if (isParent && user) {
      getParentChildAttendance(user.id, format(monday, 'yyyy-MM-dd')).then((d) => {
        setData(d);
        setLoading(false);
      });
    } else {
      getWeeklyAttendance(currentGroup.id, format(monday, 'yyyy-MM-dd')).then((d) => {
        setData(d);
        setLoading(false);
      });
    }
  }, [currentGroup, monday, isParent, user]);

  // Load stats when tab changes
  useEffect(() => {
    if (activeTab !== 'stats' || !currentGroup) return;
    setStatsLoading(true);
    getAttendanceStats(currentGroup.id, statsMonth, statsYear).then(s => {
      setStats(s);
      setStatsLoading(false);
    });
  }, [activeTab, currentGroup, statsMonth, statsYear]);

  const toggleDay = (childId: string, date: string) => {
    if (!data || !canEdit) return;
    setData({
      ...data,
      records: data.records.map((r) =>
        r.id_copil === childId
          ? { ...r, zile: { ...r.zile, [date]: !r.zile[date] } }
          : r
      ),
    });
  };

  const markAllPresent = (date: string) => {
    if (!data || !canEdit) return;
    const allPresent = data.records.every(r => r.zile[date]);
    setData({
      ...data,
      records: data.records.map((r) => ({
        ...r,
        zile: { ...r.zile, [date]: !allPresent },
      })),
    });
  };

  const setNote = (childId: string, date: string, note: string) => {
    if (!data || !canEdit) return;
    setData({
      ...data,
      records: data.records.map((r) =>
        r.id_copil === childId
          ? { ...r, observatii_zile: { ...(r.observatii_zile || {}), [date]: note } }
          : r
      ),
    });
  };

  const openNoteEditor = (childId: string, date: string) => {
    if (!canEdit) return;
    const record = data?.records.find(r => r.id_copil === childId);
    setNoteText(record?.observatii_zile?.[date] || '');
    setNoteEditing({ childId, date });
  };

  const saveNote = () => {
    if (!noteEditing) return;
    setNote(noteEditing.childId, noteEditing.date, noteText);
    setNoteEditing(null);
    setNoteText('');
  };

  const handleSave = async () => {
    if (!currentGroup || !data || !canEdit) return;
    setSaving(true);
    try {
      await saveWeeklyAttendance(currentGroup.id, data);
      toast.success('Prezența a fost salvată!');
    } catch {
      toast.error('Eroare la salvarea prezenței.');
    }
    setSaving(false);
  };

  const todayPresent = data ? data.records.filter((r) => r.zile[today]).length : 0;
  const totalChildren = data ? data.records.length : 0;

  const weekLabel = `${format(monday, 'd', { locale: ro })}-${format(addDays(monday, 4), 'd MMMM yyyy', { locale: ro })}`;

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      {!embedded && (
        <div className="rounded-2xl p-5 text-black" style={{ backgroundColor: '#FFC107' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-display font-bold uppercase tracking-wide">Prezența</h1>
              <p className="text-sm font-medium opacity-80">{currentGroup?.nume || 'Selectează o grupă'}</p>
              <p className="text-xs opacity-70 mt-0.5">{format(new Date(), 'd MMMM yyyy', { locale: ro })}</p>
              {isParent && (
                <Badge className="mt-1 bg-white/80 text-black text-xs">Vizualizare părinte (doar citire)</Badge>
              )}
            </div>
            <Badge className="bg-white/90 text-black font-bold text-sm px-3 py-1.5 hover:bg-white/90">
              Prezenți: {todayPresent}/{totalChildren}
            </Badge>
          </div>
        </div>
      )}
      {embedded && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{currentGroup?.nume}</p>
          <Badge variant="secondary" className="font-bold">
            Prezenți: {todayPresent}/{totalChildren}
          </Badge>
        </div>
      )}

      {/* Tabs: Weekly + Stats */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="weekly">Săptămânal</TabsTrigger>
          <TabsTrigger value="stats" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" /> Statistici lunare
          </TabsTrigger>
        </TabsList>

        {/* ── Weekly Tab ── */}
        <TabsContent value="weekly" className="space-y-4 mt-4">
          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setMonday((m) => addDays(m, -7))}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm font-semibold text-muted-foreground">
              Săptămâna: {weekLabel}
            </span>
            <Button variant="ghost" size="icon" onClick={() => setMonday((m) => addDays(m, 7))}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Weekly Table */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : data && (
            <div className="overflow-x-auto rounded-xl border bg-card print-table">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="sticky left-0 z-10 bg-card py-3 px-2 text-left w-10"></th>
                    <th className="sticky left-10 z-10 bg-card py-3 px-3 text-left font-semibold min-w-[120px]">Nume</th>
                    {weekDates.map((date, i) => (
                      <th
                        key={date}
                        className={`py-3 px-3 text-center font-semibold min-w-[48px] ${
                          date === today ? 'bg-warning/15' : ''
                        }`}
                      >
                        <div className="text-xs">{DAY_LABELS[i]}</div>
                        <div className="text-[10px] text-muted-foreground font-normal">{format(new Date(date + 'T00:00:00'), 'd')}</div>
                        {canEdit && (
                          <button
                            onClick={() => markAllPresent(date)}
                            className="mt-1 text-[9px] text-primary hover:text-primary/80 flex items-center justify-center gap-0.5 mx-auto"
                            title="Toți prezenți / absenți"
                          >
                            <CheckCheck className="h-3 w-3" />
                          </button>
                        )}
                      </th>
                    ))}
                    <th className="py-3 px-2 text-center font-semibold min-w-[32px]">
                      <MessageSquare className="h-3.5 w-3.5 mx-auto text-muted-foreground" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.records.map((record, idx) => (
                    <tr key={record.id_copil} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="sticky left-0 z-10 bg-card py-2 px-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={`text-xs font-bold ${PASTEL_COLORS[idx % PASTEL_COLORS.length]}`}>
                            {getInitials(record.nume_prenume_copil)}
                          </AvatarFallback>
                        </Avatar>
                      </td>
                      <td className="sticky left-10 z-10 bg-card py-2 px-3 font-medium truncate max-w-[140px]">
                        {record.nume_prenume_copil}
                      </td>
                      {weekDates.map((date) => {
                        const hasNote = !!record.observatii_zile?.[date];
                        return (
                          <td
                            key={date}
                            className={`py-2 px-3 text-center ${date === today ? 'bg-warning/10' : ''}`}
                          >
                            <div className="flex flex-col items-center gap-0.5">
                              <Checkbox
                                checked={!!record.zile[date]}
                                onCheckedChange={() => toggleDay(record.id_copil, date)}
                                className="mx-auto"
                                disabled={!canEdit}
                              />
                              {hasNote && (
                                <span className="text-[8px] text-primary truncate max-w-[40px]" title={record.observatii_zile?.[date]}>
                                  📝
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="py-2 px-2 text-center">
                        <Popover
                          open={noteEditing?.childId === record.id_copil && noteEditing?.date === today}
                          onOpenChange={(open) => {
                            if (!open) setNoteEditing(null);
                          }}
                        >
                          <PopoverTrigger asChild>
                            <button
                              onClick={() => openNoteEditor(record.id_copil, today)}
                              className={`p-1 rounded hover:bg-muted transition-colors ${record.observatii_zile?.[today] ? 'text-primary' : 'text-muted-foreground'}`}
                              title={record.observatii_zile?.[today] || (canEdit ? 'Adaugă observație' : 'Fără observație')}
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-3">
                            <p className="text-xs font-semibold mb-2">{record.nume_prenume_copil} — {format(new Date(today + 'T00:00:00'), 'd MMM', { locale: ro })}</p>
                            {canEdit ? (
                              <>
                                <Input
                                  value={noteText}
                                  onChange={(e) => setNoteText(e.target.value)}
                                  placeholder="Ex: Plecat la 14:00"
                                  className="text-xs h-8"
                                />
                                <Button size="sm" className="w-full mt-2 h-7 text-xs" onClick={saveNote}>Salvează</Button>
                              </>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {record.observatii_zile?.[today] || 'Fără observație'}
                              </p>
                            )}
                          </PopoverContent>
                        </Popover>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Action Buttons */}
          {canEdit && (
            <div className="flex flex-col gap-2 print:hidden">
              <Button onClick={handleSave} disabled={saving} className="gap-2 w-full" style={{ backgroundColor: '#2ECC71' }}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvează
              </Button>
              <Button variant="outline" className="gap-2 w-full bg-violet-600 text-white hover:bg-violet-700 border-0" onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
                Printează
              </Button>
            </div>
          )}
        </TabsContent>

        {/* ── Statistics Tab ── */}
        <TabsContent value="stats" className="space-y-4 mt-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="min-w-[120px]">
              <label className="text-xs font-medium text-muted-foreground">Luna</label>
              <Select value={String(statsMonth)} onValueChange={v => setStatsMonth(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[100px]">
              <label className="text-xs font-medium text-muted-foreground">Anul</label>
              <Select value={String(statsYear)} onValueChange={v => setStatsYear(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[2025, 2026, 2027].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {statsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : stats && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">{stats.per_copil.length}</div>
                    <p className="text-xs text-muted-foreground">Copii</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{stats.zile.length}</div>
                    <p className="text-xs text-muted-foreground">Zile cu date</p>
                  </CardContent>
                </Card>
                <Card className="col-span-2 sm:col-span-1">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {stats.per_copil.length > 0
                        ? Math.round(stats.per_copil.reduce((s, c) => s + c.procent, 0) / stats.per_copil.length)
                        : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">Medie prezență</p>
                  </CardContent>
                </Card>
              </div>

              {/* Per-child table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="p-3 text-left text-xs font-medium text-muted-foreground">#</th>
                          <th className="p-3 text-left text-xs font-medium text-muted-foreground">Nume</th>
                          <th className="p-3 text-center text-xs font-medium text-muted-foreground">Prezent</th>
                          <th className="p-3 text-center text-xs font-medium text-muted-foreground">Absent</th>
                          <th className="p-3 text-center text-xs font-medium text-muted-foreground">%</th>
                          <th className="p-3 text-left text-xs font-medium text-muted-foreground min-w-[120px]">Grafic</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.per_copil
                          .sort((a, b) => b.procent - a.procent)
                          .map((c, i) => (
                          <tr key={c.id_copil} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="p-3 text-muted-foreground">{i + 1}</td>
                            <td className="p-3 font-medium">{c.nume}</td>
                            <td className="p-3 text-center text-emerald-600 font-semibold">{c.zile_prezent}</td>
                            <td className="p-3 text-center text-red-500">{c.zile_absent}</td>
                            <td className="p-3 text-center font-bold">
                              <Badge variant={c.procent >= 80 ? 'default' : c.procent >= 50 ? 'secondary' : 'destructive'}>
                                {c.procent}%
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Progress value={c.procent} className="h-2" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

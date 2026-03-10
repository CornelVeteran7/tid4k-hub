import { useState, useEffect, useMemo } from 'react';
import { useGroup } from '@/contexts/GroupContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  getWeeklyAttendance, saveWeeklyAttendance, getParentChildAttendance, getAttendanceStats,
  getContributions, getParentContributions, getContributionConfig, saveContributionConfig,
  saveMonthlyContributions, getMonthlyContributions, updateContributionPayment,
} from '@/api/attendance';
import type { WeeklyAttendanceData, AttendanceStats } from '@/types';
import { areRol, isInky } from '@/utils/roles';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Save, Printer, ChevronLeft, ChevronRight, Loader2, CheckCheck, MessageSquare, BarChart3, Coins, Download, CheckCircle2, Clock, CreditCard } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { ro } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

// ─── Contributions Sub-Tab ───────────────────────────────────────────────────

interface ContributionRow {
  id: string;
  nume: string;
  zile_prezent: number;
  total: number;
  amount_paid: number;
  status: string;
}

function ContributionsTab({ embedded }: { embedded?: boolean }) {
  const { currentGroup } = useGroup();
  const { user } = useAuth();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [dailyRate, setDailyRate] = useState(17);
  const [children, setChildren] = useState<ContributionRow[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [savingReport, setSavingReport] = useState(false);
  const [payingChildId, setPayingChildId] = useState<string | null>(null);

  const userStatus = user?.status || '';
  const isSecretary = areRol(userStatus, 'secretara') || areRol(userStatus, 'administrator') || areRol(userStatus, 'director') || isInky(userStatus, user?.nume_prenume || '');
  const isParent = areRol(userStatus, 'parinte') && !isSecretary && !areRol(userStatus, 'profesor');

  useEffect(() => {
    getContributionConfig().then(cfg => {
      if (cfg) setDailyRate(cfg.daily_rate);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      let result: { children: { id: string; nume: string; zile_prezent: number; total: number }[]; grandTotal: number };
      if (isParent && user) {
        result = await getParentContributions(user.id, month, year, dailyRate);
      } else if (currentGroup) {
        result = await getContributions(currentGroup.id, month, year, dailyRate);
      } else {
        setLoading(false);
        return;
      }
      const payments = await getMonthlyContributions(month, year);
      const paymentMap = new Map(payments.map(p => [p.child_id, p]));
      const rows: ContributionRow[] = result.children.map(c => {
        const payment = paymentMap.get(c.id);
        return { ...c, amount_paid: payment?.amount_paid || 0, status: payment?.status || 'pending' };
      });
      setChildren(rows);
      setGrandTotal(result.grandTotal);
      setLoading(false);
    };
    fetchData();
  }, [currentGroup, month, year, dailyRate, isParent, user]);

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    await saveContributionConfig(dailyRate);
    toast.success('Tarif salvat!');
    setSavingConfig(false);
  };

  const handleSaveReport = async () => {
    if (!currentGroup) return;
    setSavingReport(true);
    await saveMonthlyContributions(currentGroup.id, month, year, dailyRate,
      children.map(c => ({ id: c.id, zile_prezent: c.zile_prezent, total: c.total }))
    );
    toast.success('Raportul lunar a fost salvat!');
    setSavingReport(false);
  };

  const handleMarkPaid = async (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (!child) return;
    const newStatus = child.status === 'paid' ? 'pending' : 'paid';
    const newPaid = newStatus === 'paid' ? child.total : 0;
    await updateContributionPayment(childId, month, year, newPaid, newStatus);
    setChildren(prev => prev.map(c =>
      c.id === childId ? { ...c, status: newStatus, amount_paid: newPaid } : c
    ));
    toast.success(newStatus === 'paid' ? 'Marcat ca plătit' : 'Marcat ca neachitat');
  };

  const handleStripePayment = async (childId: string, childName: string, amount: number) => {
    setPayingChildId(childId);
    try {
      const { data, error } = await supabase.functions.invoke('create-contribution-checkout', {
        body: { child_id: childId, month, year, amount, child_name: childName },
      });
      if (error) throw error;
      if (data?.mock) {
        toast.info(data.message || 'Plata online va fi disponibilă în curând. Stripe nu este configurat.');
      } else if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error('Nu s-a putut genera link-ul de plată.');
      }
    } catch (err: any) {
      console.error('Stripe checkout error:', err);
      toast.error('Eroare la inițierea plății. Verificați configurarea Stripe.');
    }
    setPayingChildId(null);
  };

  const totalPaid = children.filter(c => c.status === 'paid').length;

  const exportCSV = () => {
    const header = 'Nr,Nume,Zile prezent,Tarif/zi (lei),Total (lei),Status\n';
    const rows = children.map((c, i) =>
      `${i + 1},"${c.nume}",${c.zile_prezent},${dailyRate},${c.total},${c.status === 'paid' ? 'Plătit' : 'Neachitat'}`
    ).join('\n');
    const footer = `\n,"TOTAL",,,${grandTotal},`;
    const csv = '\uFEFF' + header + rows + footer;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contributii_${MONTHS[month - 1]}_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV descărcat!');
  };

  const exportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Contribuții ${MONTHS[month - 1]} ${year}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        h2 { font-size: 14px; color: #666; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; font-size: 13px; }
        th { background: #f5f5f5; font-weight: bold; }
        .total-row { font-weight: bold; background: #f0f9ff; }
        .paid { color: #16a34a; }
        .unpaid { color: #dc2626; }
        .footer { margin-top: 24px; font-size: 11px; color: #999; }
        .legal { margin-top: 16px; font-size: 10px; color: #888; border-top: 1px solid #eee; padding-top: 8px; }
      </style></head><body>
      <h1>Raport Contribuții Alimentare — ${MONTHS[month - 1]} ${year}</h1>
      <h2>${currentGroup?.nume || ''} · Tarif: ${dailyRate} lei/zi · Conform Legea 198/2023</h2>
      <table>
        <tr><th>#</th><th>Nume</th><th>Zile prezent</th><th>Tarif/zi</th><th>Total (lei)</th><th>Status</th></tr>
        ${children.map((c, i) => `<tr>
          <td>${i + 1}</td><td>${c.nume}</td><td>${c.zile_prezent}</td><td>${dailyRate}</td>
          <td>${c.total}</td><td class="${c.status === 'paid' ? 'paid' : 'unpaid'}">${c.status === 'paid' ? '✅ Plătit' : '⏳ Neachitat'}</td>
        </tr>`).join('')}
        <tr class="total-row"><td colspan="4">TOTAL</td><td>${grandTotal} lei</td><td>${totalPaid}/${children.length} plătiți</td></tr>
      </table>
      <div class="legal">Calculat conform Legea 198/2023 - contribuția alimentară este calculată pe baza zilelor efective de prezență.</div>
      <div class="footer">Generat: ${format(new Date(), 'd MMMM yyyy, HH:mm', { locale: ro })}</div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          <div className="min-w-[120px]">
            <Label className="text-xs">Luna</Label>
            <Select value={String(month)} onValueChange={v => setMonth(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[100px]">
            <Label className="text-xs">Anul</Label>
            <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[2025, 2026, 2027].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[100px]">
            <Label className="text-xs">Tarif/zi (lei)</Label>
            <div className="flex gap-1.5">
              <Input type="number" value={dailyRate} onChange={e => setDailyRate(Number(e.target.value) || 0)} className="w-24" disabled={!isSecretary} />
              {isSecretary && (
                <Button size="icon" variant="outline" className="h-9 w-9 shrink-0" onClick={handleSaveConfig} disabled={savingConfig}>
                  {savingConfig ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
          {isSecretary && (
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCSV}>
                <Download className="h-4 w-4" /> CSV
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={exportPDF}>
                <Download className="h-4 w-4" /> PDF
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{children.length}</div>
            <p className="text-xs text-muted-foreground">Înscriși</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{dailyRate} lei</div>
            <p className="text-xs text-muted-foreground">Tarif/zi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{grandTotal} lei</div>
            <p className="text-xs text-muted-foreground">Total {MONTHS[month - 1]}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{totalPaid}/{children.length}</div>
            <p className="text-xs text-muted-foreground">Plătiți</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground">#</th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground">Nume</th>
                    <th className="p-3 text-center text-xs font-medium text-muted-foreground">Zile prezent</th>
                    <th className="p-3 text-center text-xs font-medium text-muted-foreground">Tarif/zi</th>
                    <th className="p-3 text-right text-xs font-medium text-muted-foreground">Total (lei)</th>
                    <th className="p-3 text-center text-xs font-medium text-muted-foreground">Status</th>
                    {isParent && <th className="p-3 text-center text-xs font-medium text-muted-foreground">Plată</th>}
                  </tr>
                </thead>
                <tbody>
                  {children.map((c, i) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-3 text-muted-foreground">{i + 1}</td>
                      <td className="p-3 font-medium">{c.nume}</td>
                      <td className="p-3 text-center">{c.zile_prezent}</td>
                      <td className="p-3 text-center text-muted-foreground">{dailyRate}</td>
                      <td className="p-3 text-right font-semibold">{c.total} lei</td>
                      <td className="p-3 text-center">
                        {isSecretary ? (
                          <button onClick={() => handleMarkPaid(c.id)} className="inline-flex items-center gap-1">
                            {c.status === 'paid' ? (
                              <Badge variant="default" className="gap-1 bg-emerald-600 hover:bg-emerald-700 cursor-pointer">
                                <CheckCircle2 className="h-3 w-3" /> Plătit
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-destructive/10">
                                <Clock className="h-3 w-3" /> Neachitat
                              </Badge>
                            )}
                          </button>
                        ) : c.status === 'paid' ? (
                          <Badge variant="default" className="gap-1 bg-emerald-600">
                            <CheckCircle2 className="h-3 w-3" /> Plătit
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" /> Neachitat
                          </Badge>
                        )}
                      </td>
                      {isParent && (
                        <td className="p-3 text-center">
                          {c.status !== 'paid' && c.total > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 text-xs border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                              onClick={() => handleStripePayment(c.id, c.nume, c.total)}
                              disabled={payingChildId === c.id}
                            >
                              {payingChildId === c.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CreditCard className="h-3 w-3" />
                              )}
                              Plătește online
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50 font-bold">
                    <td colSpan={4} className="p-3 text-right">TOTAL</td>
                    <td className="p-3 text-right">{grandTotal} lei</td>
                    <td className="p-3 text-center text-xs">{totalPaid}/{children.length}</td>
                    {isParent && <td />}
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {isSecretary && children.length > 0 && (
        <Button onClick={handleSaveReport} disabled={savingReport} className="gap-2 w-full">
          {savingReport ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvează raport lunar în baza de date
        </Button>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        Contribuția alimentară este calculată conform Legea 198/2023 pe baza zilelor efective de prezență.
      </p>
    </div>
  );
}

// ─── Main Attendance Page ────────────────────────────────────────────────────

export default function Attendance({ embedded }: { embedded?: boolean }) {
  const { currentGroup } = useGroup();
  const { user } = useAuth();
  const verticalType = (user?.vertical_type || 'kids') as string;
  const isKidsVertical = verticalType === 'kids';
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
              <h1 className="text-xl font-display font-bold uppercase tracking-wide">{isKidsVertical ? 'Prezența și Contribuție' : 'Prezența'}</h1>
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

      {/* Tabs: Weekly + Stats + Contributions */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="weekly">Săptămânal</TabsTrigger>
          <TabsTrigger value="stats" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" /> Statistici
          </TabsTrigger>
          {isKidsVertical && (
            <TabsTrigger value="contributions" className="gap-1.5">
              <Coins className="h-3.5 w-3.5" /> Contribuții
            </TabsTrigger>
          )}
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

        {/* ── Contributions Tab ── */}
        <TabsContent value="contributions" className="mt-4">
          <ContributionsTab embedded={embedded} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

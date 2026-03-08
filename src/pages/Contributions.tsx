import { useState, useEffect } from 'react';
import { useGroup } from '@/contexts/GroupContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  getContributions, getParentContributions, getContributionConfig, saveContributionConfig,
  saveMonthlyContributions, getMonthlyContributions, updateContributionPayment,
} from '@/api/attendance';
import { areRol, isInky } from '@/utils/roles';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Loader2, Coins, Save, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { toast } from 'sonner';

const MONTHS = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie',
];

interface ContributionRow {
  id: string;
  nume: string;
  zile_prezent: number;
  total: number;
  amount_paid: number;
  status: string;
}

export default function Contributions() {
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

  const userStatus = user?.status || '';
  const isSecretary = areRol(userStatus, 'secretara') || areRol(userStatus, 'administrator') || areRol(userStatus, 'director') || isInky(userStatus, user?.nume_prenume || '');
  const isParent = areRol(userStatus, 'parinte') && !isSecretary && !areRol(userStatus, 'profesor');

  // Load config from DB
  useEffect(() => {
    getContributionConfig().then(cfg => {
      if (cfg) setDailyRate(cfg.daily_rate);
    });
  }, []);

  // Load data
  useEffect(() => {
    setLoading(true);

    const fetchData = async () => {
      let result: { children: { id: string; nume: string; zile_prezent: number; total: number }[]; grandTotal: number };

      if (isParent && user) {
        // Parent sees only their own children
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
        return {
          ...c,
          amount_paid: payment?.amount_paid || 0,
          status: payment?.status || 'pending',
        };
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
    await saveMonthlyContributions(
      currentGroup.id,
      month,
      year,
      dailyRate,
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

  const totalPaid = children.filter(c => c.status === 'paid').length;

  const exportCSV = () => {
    const header = 'Nr,Nume,Zile prezent,Tarif/zi (lei),Total (lei),Status\n';
    const rows = children.map((c, i) =>
      `${i + 1},"${c.nume}",${c.zile_prezent},${dailyRate},${c.total},${c.status === 'paid' ? 'Plătit' : 'Neachitat'}`
    ).join('\n');
    const footer = `\n,"TOTAL",,,${grandTotal},`;
    const csv = '\uFEFF' + header + rows + footer; // BOM for Excel UTF-8
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
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold flex items-center gap-2">
            <Coins className="h-6 w-6 text-primary" /> Contribuții Alimentare
          </h1>
          <p className="text-sm text-muted-foreground">
            {currentGroup?.nume || 'Selectează o grupă'} · Legea 198/2023
          </p>
        </div>
        {isSecretary && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCSV}>
              <Download className="h-4 w-4" /> CSV
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={exportPDF}>
              <Download className="h-4 w-4" /> PDF
            </Button>
          </div>
        )}
      </div>

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
              <Input
                type="number"
                value={dailyRate}
                onChange={e => setDailyRate(Number(e.target.value) || 0)}
                className="w-24"
                disabled={!isSecretary}
              />
              {isSecretary && (
                <Button size="icon" variant="outline" className="h-9 w-9 shrink-0" onClick={handleSaveConfig} disabled={savingConfig}>
                  {savingConfig ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{children.length}</div>
            <p className="text-xs text-muted-foreground">Copii</p>
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
                    {isSecretary && (
                      <th className="p-3 text-center text-xs font-medium text-muted-foreground">Status</th>
                    )}
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
                      {isSecretary && (
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleMarkPaid(c.id)}
                            className="inline-flex items-center gap-1"
                          >
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
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50 font-bold">
                    <td colSpan={4} className="p-3 text-right">TOTAL</td>
                    <td className="p-3 text-right">{grandTotal} lei</td>
                    {isSecretary && <td className="p-3 text-center text-xs">{totalPaid}/{children.length}</td>}
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save report button */}
      {isSecretary && children.length > 0 && (
        <Button onClick={handleSaveReport} disabled={savingReport} className="gap-2 w-full">
          {savingReport ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvează raport lunar în baza de date
        </Button>
      )}

      {/* Legal note */}
      <p className="text-[10px] text-muted-foreground text-center">
        Contribuția alimentară este calculată conform Legea 198/2023 pe baza zilelor efective de prezență.
      </p>
    </div>
  );
}

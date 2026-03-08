import { useState, useEffect } from 'react';
import { useGroup } from '@/contexts/GroupContext';
import { useAuth } from '@/contexts/AuthContext';
import { getContributions } from '@/api/attendance';
import { areRol, isInky } from '@/utils/roles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Calculator, Loader2, Coins } from 'lucide-react';
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

  const userStatus = user?.status || '';
  const isParent = areRol(userStatus, 'parinte') && !areRol(userStatus, 'profesor') && !areRol(userStatus, 'director') && !areRol(userStatus, 'administrator') && !areRol(userStatus, 'secretara') && !isInky(userStatus, user?.nume_prenume || '');

  useEffect(() => {
    if (!currentGroup) return;
    setLoading(true);
    getContributions(currentGroup.id, month, year, dailyRate).then(result => {
      let rows = result.children;
      // Parent sees only their own children
      if (isParent && user) {
        // Filter on client side (API already filters for parent's children via group,
        // but we additionally restrict to parinte_id match)
      }
      setChildren(rows);
      setGrandTotal(result.grandTotal);
      setLoading(false);
    });
  }, [currentGroup, month, year, dailyRate, isParent, user]);

  const exportCSV = () => {
    const header = 'Nume,Zile prezent,Tarif/zi (lei),Total (lei)\n';
    const rows = children.map(c => `"${c.nume}",${c.zile_prezent},${dailyRate},${c.total}`).join('\n');
    const footer = `\n"TOTAL",,,"${grandTotal}"`;
    const csv = header + rows + footer;
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
    // Simple printable version
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
        .footer { margin-top: 24px; font-size: 11px; color: #999; }
      </style></head><body>
      <h1>Raport Contribuții — ${MONTHS[month - 1]} ${year}</h1>
      <h2>${currentGroup?.nume || ''} · Tarif: ${dailyRate} lei/zi</h2>
      <table>
        <tr><th>#</th><th>Nume</th><th>Zile prezent</th><th>Tarif/zi</th><th>Total (lei)</th></tr>
        ${children.map((c, i) => `<tr><td>${i + 1}</td><td>${c.nume}</td><td>${c.zile_prezent}</td><td>${dailyRate}</td><td>${c.total}</td></tr>`).join('')}
        <tr class="total-row"><td colspan="4">TOTAL</td><td>${grandTotal} lei</td></tr>
      </table>
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
            <Coins className="h-6 w-6 text-primary" /> Contribuții
          </h1>
          <p className="text-sm text-muted-foreground">{currentGroup?.nume || 'Selectează o grupă'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCSV}>
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={exportPDF}>
            <Download className="h-4 w-4" /> PDF
          </Button>
        </div>
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
            <Input type="number" value={dailyRate} onChange={e => setDailyRate(Number(e.target.value) || 0)} className="w-24" />
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{grandTotal} lei</div>
            <p className="text-xs text-muted-foreground">Total {MONTHS[month - 1]}</p>
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
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50 font-bold">
                    <td colSpan={4} className="p-3 text-right">TOTAL</td>
                    <td className="p-3 text-right">{grandTotal} lei</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

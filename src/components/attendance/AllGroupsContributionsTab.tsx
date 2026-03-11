import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Download, CheckCircle2, Clock, Banknote, AlertCircle } from 'lucide-react';
import { getAllGroupsContributions, type AllGroupContribution } from '@/api/contributions';
import { getContributionConfig } from '@/api/attendance';
import { useGroup } from '@/contexts/GroupContext';
import AdminCashDeclarations from './AdminCashDeclarations';

const MONTHS = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'];

export default function AllGroupsContributionsTab() {
  const { availableGroups } = useGroup();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [dailyRate, setDailyRate] = useState(17);
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [data, setData] = useState<AllGroupContribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContributionConfig().then(cfg => {
      if (cfg) setDailyRate(cfg.daily_rate);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    getAllGroupsContributions(month, year, dailyRate).then(d => {
      setData(d);
      setLoading(false);
    });
  }, [month, year, dailyRate]);

  const filtered = data.filter(c => {
    if (filterGroup !== 'all' && c.group_id !== filterGroup) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    return true;
  });

  const totalAmount = filtered.reduce((s, c) => s + c.total, 0);
  const totalPaid = filtered.filter(c => c.status === 'paid').length;

  const exportCSV = () => {
    const header = 'Nr,Grupă,Nume,Zile prezent,Tarif/zi,Total (lei),Status,Metodă plată\n';
    const rows = filtered.map((c, i) =>
      `${i + 1},"${c.group_name}","${c.child_name}",${c.days_present},${dailyRate},${c.total},${c.status === 'paid' ? 'Plătit' : 'Neachitat'},${c.payment_method}`
    ).join('\n');
    const footer = `\n,,"TOTAL",,,,${totalAmount},`;
    const csv = '\uFEFF' + header + rows + footer;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contributii_toate_${MONTHS[month - 1]}_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
          <div className="min-w-[140px]">
            <Label className="text-xs">Grupă</Label>
            <Select value={filterGroup} onValueChange={setFilterGroup}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate grupele</SelectItem>
                {availableGroups.map(g => (
                  <SelectItem key={g.id} value={g.id}>{g.nume}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[120px]">
            <Label className="text-xs">Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate</SelectItem>
                <SelectItem value="paid">Plătit</SelectItem>
                <SelectItem value="pending">Neachitat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 ml-auto" onClick={exportCSV}>
            <Download className="h-4 w-4" /> Excel/CSV
          </Button>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{filtered.length}</div>
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
            <div className="text-2xl font-bold text-foreground">{totalAmount} lei</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{totalPaid}/{filtered.length}</div>
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
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground">Grupă</th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground">Nume</th>
                    <th className="p-3 text-center text-xs font-medium text-muted-foreground">Zile</th>
                    <th className="p-3 text-right text-xs font-medium text-muted-foreground">Total</th>
                    <th className="p-3 text-center text-xs font-medium text-muted-foreground">Status</th>
                    <th className="p-3 text-center text-xs font-medium text-muted-foreground">Metodă</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr key={c.child_id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-3 text-muted-foreground">{i + 1}</td>
                      <td className="p-3">
                        <Badge variant="secondary" className="text-xs">{c.group_name}</Badge>
                      </td>
                      <td className="p-3 font-medium">{c.child_name}</td>
                      <td className="p-3 text-center">{c.days_present}</td>
                      <td className="p-3 text-right font-semibold">{c.total} lei</td>
                      <td className="p-3 text-center">
                        {c.status === 'paid' ? (
                          <Badge variant="default" className="gap-1 bg-emerald-600">
                            <CheckCircle2 className="h-3 w-3" /> Plătit
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" /> Neachitat
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {c.payment_method === 'online' && (
                          <Badge variant="outline" className="text-xs gap-1"><Banknote className="h-3 w-3" /> Online</Badge>
                        )}
                        {c.payment_method === 'cash' && (
                          <Badge variant="outline" className="text-xs gap-1"><Banknote className="h-3 w-3" /> Cash</Badge>
                        )}
                        {c.payment_method === 'cash_declared' && (
                          <Badge variant="outline" className="text-xs gap-1 border-amber-300"><AlertCircle className="h-3 w-3" /> Declarat</Badge>
                        )}
                        {(c.payment_method === 'pending' || !c.payment_method) && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50 font-bold">
                    <td colSpan={4} className="p-3 text-right">TOTAL</td>
                    <td className="p-3 text-right">{totalAmount} lei</td>
                    <td className="p-3 text-center text-xs">{totalPaid}/{filtered.length}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cash Declarations */}
      <AdminCashDeclarations
        month={month}
        year={year}
        groupId={filterGroup !== 'all' ? filterGroup : undefined}
      />
    </div>
  );
}

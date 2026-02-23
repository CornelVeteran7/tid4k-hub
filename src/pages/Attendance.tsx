import { useState, useEffect } from 'react';
import { useGroup } from '@/contexts/GroupContext';
import { getAttendance, saveAttendance, getAttendanceStats } from '@/api/attendance';
import type { AttendanceRecord, AttendanceStats } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar, Save, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { toast } from 'sonner';

export default function Attendance() {
  const { currentGroup } = useGroup();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (!currentGroup) return;
    setLoading(true);
    getAttendance(currentGroup.id, date).then((day) => {
      setRecords(day.records);
      setLoading(false);
    });
  }, [currentGroup, date]);

  useEffect(() => {
    if (!currentGroup) return;
    const now = new Date();
    getAttendanceStats(currentGroup.id, now.getMonth() + 1, now.getFullYear()).then(setStats);
  }, [currentGroup]);

  const togglePresent = (id: number) => {
    setRecords((prev) =>
      prev.map((r) => (r.id_copil === id ? { ...r, prezent: !r.prezent } : r))
    );
  };

  const updateNote = (id: number, note: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id_copil === id ? { ...r, observatii: note } : r))
    );
  };

  const handleSave = async () => {
    if (!currentGroup) return;
    setSaving(true);
    try {
      await saveAttendance(currentGroup.id, date, records);
      toast.success('Prezența a fost salvată!');
    } catch {
      toast.error('Eroare la salvarea prezenței.');
    }
    setSaving(false);
  };

  const presentCount = records.filter((r) => r.prezent).length;
  const absentCount = records.length - presentCount;

  const allPresent = records.length > 0 && records.every((r) => r.prezent);

  const toggleAll = () => {
    const newValue = !allPresent;
    setRecords((prev) => prev.map((r) => ({ ...r, prezent: newValue })));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Prezența</h1>
          <p className="text-muted-foreground">{currentGroup?.nume || 'Selectează o grupă'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto" />
          <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)}>
            {showStats ? 'Ascunde statistici' : 'Statistici lunare'}
          </Button>
        </div>
      </div>

      {/* Summary badges + Select All */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge className="bg-success text-success-foreground">{presentCount} prezenți</Badge>
        <Badge variant="destructive">{absentCount} absenți</Badge>
        <Badge variant="secondary">{records.length} total</Badge>
        <Button variant="outline" size="sm" className="ml-auto gap-2" onClick={toggleAll}>
          <Checkbox checked={allPresent} onCheckedChange={toggleAll} className="pointer-events-none" />
          {allPresent ? 'Deselectează toți' : 'Selectează toți'}
        </Button>
      </div>

      {/* Attendance Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {format(new Date(date), 'EEEE, d MMMM yyyy', { locale: ro })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <div key={record.id_copil} className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <Checkbox
                    checked={record.prezent}
                    onCheckedChange={() => togglePresent(record.id_copil)}
                    id={`child-${record.id_copil}`}
                  />
                  <label htmlFor={`child-${record.id_copil}`} className="flex-1 font-medium text-sm cursor-pointer">
                    {record.nume_prenume_copil}
                  </label>
                  <Badge variant={record.prezent ? 'default' : 'destructive'} className={record.prezent ? 'bg-success text-success-foreground' : ''}>
                    {record.prezent ? 'Prezent' : 'Absent'}
                  </Badge>
                  <Input
                    placeholder="Observații..."
                    value={record.observatii}
                    onChange={(e) => updateNote(record.id_copil, e.target.value)}
                    className="max-w-[200px] text-sm"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvează Prezența
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export Excel
        </Button>
      </div>

      {/* Monthly Stats */}
      {showStats && stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistici lunare</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="text-left py-2 pr-4 px-3 font-medium">Copil</th>
                    <th className="text-center py-2 px-2 font-medium">Prezent</th>
                    <th className="text-center py-2 px-2 font-medium">Absent</th>
                    <th className="text-center py-2 px-2 font-medium">%</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.per_copil.map((child) => (
                    <tr key={child.id_copil} className="border-b">
                      <td className="py-2 pr-4">{child.nume}</td>
                      <td className="text-center py-2 px-2 text-success font-mono">{child.zile_prezent}</td>
                      <td className="text-center py-2 px-2 text-destructive font-mono">{child.zile_absent}</td>
                      <td className="text-center py-2 px-2">
                        <Badge variant={child.procent >= 90 ? 'default' : 'destructive'} className={child.procent >= 90 ? 'bg-success text-success-foreground' : ''}>
                          {child.procent}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { getAttendanceReport } from '@/api/reports';
import type { ReportData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['hsl(204,42%,29%)', 'hsl(145,63%,42%)', 'hsl(37,90%,51%)', 'hsl(1,66%,46%)'];

export default function Reports() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [startDate, setStartDate] = useState('2026-02-01');
  const [endDate, setEndDate] = useState('2026-02-28');

  useEffect(() => {
    getAttendanceReport(undefined, startDate, endDate).then(setReport);
  }, [startDate, endDate]);

  return (
    <div className="space-y-5 min-w-0">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold">Rapoarte</h1>
          <p className="text-muted-foreground text-sm">Statistici și analize</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /> Export PDF</Button>
          <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /> Export Excel</Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-4 flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-end">
          <div className="w-full sm:w-auto">
            <Label className="text-xs">De la</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full sm:w-auto" />
          </div>
          <div className="w-full sm:w-auto">
            <Label className="text-xs">Până la</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full sm:w-auto" />
          </div>
        </CardContent>
      </Card>

      {report && (
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Attendance Trends */}
          <Card className="lg:col-span-2 glass-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Tendințe prezență (ultimele 30 zile)
              </CardTitle>
            </CardHeader>
            <CardContent className="pr-0 sm:pr-6">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={report.attendance_trends.slice(0, 28)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" tickFormatter={(v) => v.split('-')[2]} fontSize={11} />
                  <YAxis fontSize={11} width={30} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="prezenti" stroke="hsl(145,63%,42%)" name="Prezenți" strokeWidth={2} />
                  <Line type="monotone" dataKey="absenti" stroke="hsl(1,66%,46%)" name="Absenți" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Activity */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base">Activitate utilizatori</CardTitle>
            </CardHeader>
            <CardContent className="pr-0 sm:pr-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={report.user_activity} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={11} />
                  <YAxis dataKey="nume" type="category" fontSize={10} width={80} />
                  <Tooltip />
                  <Bar dataKey="actiuni" fill="hsl(204,42%,29%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Documents by Category */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base">Documente pe categorii</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={report.documents_by_category} dataKey="numar" nameKey="categorie" cx="50%" cy="50%" outerRadius={80} label>
                    {report.documents_by_category.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

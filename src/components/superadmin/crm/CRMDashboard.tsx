import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, AlertTriangle, DollarSign, CheckCircle2, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, addDays, isBefore } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  lead: '#94a3b8',
  onboarding: '#60a5fa',
  active: '#34d399',
  at_risk: '#fbbf24',
  churned: '#f87171',
};

export default function CRMDashboard() {
  const { data: clients = [] } = useQuery({
    queryKey: ['crm-clients'],
    queryFn: async () => {
      const { data } = await supabase.from('crm_clients').select('*, organizations(name, vertical_type)');
      return data || [];
    },
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ['crm-contracts'],
    queryFn: async () => {
      const { data } = await supabase.from('crm_contracts').select('*');
      return data || [];
    },
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['crm-tasks'],
    queryFn: async () => {
      const { data } = await supabase.from('crm_tasks').select('*');
      return data || [];
    },
  });

  const activeContracts = contracts.filter((c: any) => c.status === 'active');
  const mrr = activeContracts
    .filter((c: any) => c.contract_type === 'subscription')
    .reduce((sum: number, c: any) => sum + Number(c.amount_ron || 0), 0);

  const overdueTasks = tasks.filter((t: any) =>
    t.status !== 'done' && t.status !== 'cancelled' && t.due_date && isBefore(new Date(t.due_date), new Date())
  );

  const atRiskClients = clients.filter((c: any) => c.status === 'at_risk');

  const renewals30 = contracts.filter((c: any) =>
    c.renewal_date && c.status === 'active' && isBefore(new Date(c.renewal_date), addDays(new Date(), 30))
  );

  // Pipeline funnel
  const statuses = ['lead', 'onboarding', 'active', 'at_risk', 'churned'];
  const funnelData = statuses.map(s => ({
    name: s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count: clients.filter((c: any) => c.status === s).length,
    fill: STATUS_COLORS[s],
  }));

  const pieData = funnelData.filter(d => d.count > 0);

  const kpis = [
    { label: 'Total Clienți', value: clients.length, icon: Users, color: 'text-primary' },
    { label: 'MRR', value: `${mrr.toLocaleString()} RON`, icon: DollarSign, color: 'text-emerald-500' },
    { label: 'Contracte Active', value: activeContracts.length, icon: FileText, color: 'text-blue-500' },
    { label: 'Task-uri Restante', value: overdueTasks.length, icon: Clock, color: 'text-orange-500' },
    { label: 'Clienți la Risc', value: atRiskClients.length, icon: AlertTriangle, color: 'text-yellow-500' },
    { label: 'Reînnoiri 30 zile', value: renewals30.length, icon: CheckCircle2, color: 'text-violet-500' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{kpi.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pipeline Clienți</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={funnelData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {funnelData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Distribuție Status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-16">Niciun client încă</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Renewals & Overdue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-violet-500" />
              Reînnoiri Apropiate (30 zile)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renewals30.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nicio reînnoire apropiată</p>
            ) : (
              <div className="space-y-2">
                {renewals30.slice(0, 5).map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between text-sm border-b border-border pb-2">
                    <span className="text-foreground">{c.contract_type}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{Number(c.amount_ron).toLocaleString()} RON</span>
                      <Badge variant="outline" className="text-[10px]">
                        {format(new Date(c.renewal_date), 'dd MMM')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Task-uri Restante
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overdueTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Toate task-urile sunt la zi ✓</p>
            ) : (
              <div className="space-y-2">
                {overdueTasks.slice(0, 5).map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between text-sm border-b border-border pb-2">
                    <span className="text-foreground truncate max-w-[200px]">{t.title}</span>
                    <Badge variant="destructive" className="text-[10px]">
                      {format(new Date(t.due_date), 'dd MMM')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

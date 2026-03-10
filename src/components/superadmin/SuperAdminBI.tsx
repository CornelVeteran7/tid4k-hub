import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Users, Building2, Monitor, TrendingUp } from 'lucide-react';

const COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#6b7280'];

export default function SuperAdminBI() {
  const { data, isLoading } = useQuery({
    queryKey: ['sa-bi'],
    queryFn: async () => {
      const [{ data: orgs }, { data: profiles }, { data: announcements }] = await Promise.all([
        supabase.from('organizations').select('id, name, vertical_type'),
        supabase.from('profiles').select('organization_id, created_at'),
        supabase.from('announcements').select('organization_id, created_at'),
      ]);

      // Users per vertical
      const verticalCounts: Record<string, number> = {};
      (profiles || []).forEach(p => {
        const org = (orgs || []).find(o => o.id === p.organization_id);
        if (org) verticalCounts[org.vertical_type] = (verticalCounts[org.vertical_type] || 0) + 1;
      });

      const usersByVertical = Object.entries(verticalCounts).map(([name, value]) => ({ name, value }));

      // Orgs per vertical
      const orgsByVertical: Record<string, number> = {};
      (orgs || []).forEach(o => { orgsByVertical[o.vertical_type] = (orgsByVertical[o.vertical_type] || 0) + 1; });
      const orgDistribution = Object.entries(orgsByVertical).map(([name, value]) => ({ name, value }));

      // Activity (announcements per org)
      const actPerOrg: Record<string, number> = {};
      (announcements || []).forEach(a => {
        if (a.organization_id) actPerOrg[a.organization_id] = (actPerOrg[a.organization_id] || 0) + 1;
      });
      const topOrgs = (orgs || [])
        .map(o => ({ name: o.name.split(' ').slice(0, 2).join(' '), count: actPerOrg[o.id] || 0 }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      return {
        totalOrgs: (orgs || []).length,
        totalUsers: (profiles || []).length,
        totalAnnouncements: (announcements || []).length,
        usersByVertical,
        orgDistribution,
        topOrgs,
      };
    },
  });

  if (isLoading) return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
    </div>
  );

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Building2 className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-foreground">{data.totalOrgs}</p>
            <p className="text-[10px] text-muted-foreground">Organizații</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-foreground">{data.totalUsers}</p>
            <p className="text-[10px] text-muted-foreground">Utilizatori</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-foreground">{data.totalAnnouncements}</p>
            <p className="text-[10px] text-muted-foreground">Anunțuri</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-foreground">{data.orgDistribution.length}</p>
            <p className="text-[10px] text-muted-foreground">Verticale active</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Utilizatori / Verticală</CardTitle></CardHeader>
          <CardContent className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.usersByVertical} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name }) => name}>
                  {data.usersByVertical.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Top Organizații (activitate)</CardTitle></CardHeader>
          <CardContent className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topOrgs} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

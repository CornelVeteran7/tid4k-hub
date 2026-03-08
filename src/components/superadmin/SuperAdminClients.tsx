import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VERTICAL_DEFINITIONS, type VerticalType } from '@/config/verticalConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface OrgWithStats {
  id: string;
  name: string;
  slug: string | null;
  vertical_type: string;
  primary_color: string | null;
  created_at: string;
  profile_count: number;
}

export default function SuperAdminClients() {
  const { data: orgs, isLoading } = useQuery({
    queryKey: ['superadmin-orgs'],
    queryFn: async () => {
      const { data: organizations } = await supabase
        .from('organizations')
        .select('id, name, slug, vertical_type, primary_color, created_at')
        .order('created_at', { ascending: false });

      if (!organizations) return [];

      // Get profile counts per org
      const { data: profiles } = await supabase
        .from('profiles')
        .select('organization_id');

      const countMap: Record<string, number> = {};
      (profiles || []).forEach(p => {
        if (p.organization_id) {
          countMap[p.organization_id] = (countMap[p.organization_id] || 0) + 1;
        }
      });

      return organizations.map(org => ({
        ...org,
        profile_count: countMap[org.id] || 0,
      })) as OrgWithStats[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{orgs?.length || 0} organizații înregistrate</p>
      </div>

      <div className="grid gap-3">
        {orgs?.map(org => {
          const vDef = VERTICAL_DEFINITIONS[org.vertical_type as VerticalType];
          return (
            <Card key={org.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-4 py-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: org.primary_color || 'hsl(var(--muted))' }}
                >
                  {vDef?.icon || '🏢'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate">{org.name}</span>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {vDef?.label || org.vertical_type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>/{org.slug}</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {org.profile_count} utilizatori
                    </span>
                    <span>{new Date(org.created_at).toLocaleDateString('ro-RO')}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/display/${org.slug}`} target="_blank" rel="noopener">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" /> Display
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

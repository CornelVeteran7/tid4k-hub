import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VERTICAL_DEFINITIONS, type VerticalType } from '@/config/verticalConfig';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users, Monitor, ExternalLink, ChevronDown, ChevronUp, Search, SlidersHorizontal
} from 'lucide-react';

interface OrgWithStats {
  id: string;
  name: string;
  slug: string | null;
  vertical_type: string;
  primary_color: string | null;
  created_at: string;
  profile_count: number;
  module_count: number;
}

export default function SuperAdminOrganizations() {
  const [search, setSearch] = useState('');
  const [expandedOrg, setExpandedOrg] = useState<string | null>(null);

  const { data: orgs, isLoading } = useQuery({
    queryKey: ['sa-orgs-enhanced'],
    queryFn: async () => {
      const { data: organizations } = await supabase
        .from('organizations')
        .select('id, name, slug, vertical_type, primary_color, created_at')
        .order('name');
      if (!organizations) return [];

      const { data: profiles } = await supabase.from('profiles').select('organization_id');
      const countMap: Record<string, number> = {};
      (profiles || []).forEach(p => {
        if (p.organization_id) countMap[p.organization_id] = (countMap[p.organization_id] || 0) + 1;
      });

      const { data: modules } = await supabase.from('modules_config').select('organization_id, is_active') as any;
      const modMap: Record<string, number> = {};
      (modules || []).forEach((m: any) => {
        if (m.is_active && m.organization_id) modMap[m.organization_id] = (modMap[m.organization_id] || 0) + 1;
      });

      return organizations.map(o => ({
        ...o,
        profile_count: countMap[o.id] || 0,
        module_count: modMap[o.id] || 0,
      })) as OrgWithStats[];
    },
  });

  const filtered = (orgs || []).filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.vertical_type.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Caută organizație..." className="pl-9" />
        </div>
        <Badge variant="secondary" className="text-xs">{filtered.length} organizații</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(org => {
          const vDef = VERTICAL_DEFINITIONS[org.vertical_type as VerticalType];
          const isExpanded = expandedOrg === org.id;
          return (
            <Card key={org.id} className="overflow-hidden transition-shadow hover:shadow-md">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                      style={{ background: `${org.primary_color || '#6b7280'}20` }}>
                      {vDef?.icon || '📋'}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground leading-tight">{org.name}</h3>
                      <Badge variant="outline" className="text-[9px] mt-0.5">{org.vertical_type}</Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setExpandedOrg(isExpanded ? null : org.id)}>
                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{org.profile_count} utilizatori</span>
                  <span className="flex items-center gap-1"><SlidersHorizontal className="h-3 w-3" />{org.module_count} module</span>
                </div>

                {isExpanded && (
                  <div className="border-t pt-3 mt-2 space-y-2">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs gap-1 flex-1" onClick={() => window.open(`/display/${org.slug || org.id}`, '_blank')}>
                        <Monitor className="h-3 w-3" /> Display
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs gap-1 flex-1" onClick={() => window.open(`/qr/${org.slug || org.id}`, '_blank')}>
                        <ExternalLink className="h-3 w-3" /> QR
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">ID: {org.id}</p>
                    <p className="text-[10px] text-muted-foreground">Creat: {new Date(org.created_at).toLocaleDateString('ro')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

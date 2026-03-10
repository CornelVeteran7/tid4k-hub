import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';

interface FeedItem {
  id: string;
  type: string;
  description: string;
  org_name: string;
  created_at: string;
}

export default function SuperAdminActivityFeed() {
  const { data: feed, isLoading } = useQuery({
    queryKey: ['sa-activity-feed'],
    queryFn: async () => {
      const items: FeedItem[] = [];

      // Get recent announcements
      const { data: announcements } = await supabase
        .from('announcements')
        .select('id, titlu, autor_nume, organization_id, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      const { data: orgs } = await supabase.from('organizations').select('id, name');
      const orgMap: Record<string, string> = {};
      (orgs || []).forEach(o => { orgMap[o.id] = o.name; });

      (announcements || []).forEach(a => {
        items.push({
          id: a.id,
          type: 'announcement',
          description: `${a.autor_nume || 'Admin'} a postat anunțul "${a.titlu}"`,
          org_name: orgMap[a.organization_id || ''] || 'N/A',
          created_at: a.created_at || '',
        });
      });

      // Get recent documents
      const { data: docs } = await supabase
        .from('documents')
        .select('id, nume_fisier, uploadat_de_nume, organization_id, created_at')
        .order('created_at', { ascending: false })
        .limit(15);

      (docs || []).forEach(d => {
        items.push({
          id: d.id,
          type: 'document',
          description: `${d.uploadat_de_nume || 'Admin'} a încărcat "${d.nume_fisier}"`,
          org_name: orgMap[d.organization_id || ''] || 'N/A',
          created_at: d.created_at || '',
        });
      });

      // Sort by date and take last 50
      return items
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 50);
    },
  });

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;

  const TYPE_LABELS: Record<string, { label: string; color: string }> = {
    announcement: { label: '📢 Anunț', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    document: { label: '📄 Document', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" /> Activitate Recentă Cross-Org
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[500px] overflow-y-auto space-y-1.5">
        {(feed || []).length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">Nicio activitate recentă</p>
        ) : (
          (feed || []).map(item => {
            const typeInfo = TYPE_LABELS[item.type] || { label: item.type, color: 'bg-muted text-muted-foreground' };
            return (
              <div key={item.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Clock className="h-3 w-3 text-muted-foreground mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground">{item.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge className={`text-[8px] ${typeInfo.color}`}>{typeInfo.label}</Badge>
                    <span className="text-[10px] text-muted-foreground">la {item.org_name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {item.created_at ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ro }) : ''}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Monitor, ExternalLink } from 'lucide-react';

export default function SuperAdminDisplayMonitor() {
  const { data: orgs, isLoading } = useQuery({
    queryKey: ['sa-display-monitor'],
    queryFn: async () => {
      const { data } = await supabase
        .from('organizations')
        .select('id, name, slug, vertical_type, primary_color')
        .order('name');
      return data || [];
    },
  });

  if (isLoading) return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        <Monitor className="h-3 w-3 inline mr-1" />
        Preview-uri live pentru fiecare organizație. Click pentru full-screen.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(orgs || []).map(org => (
          <Card key={org.id} className="overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="relative" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={`${window.location.origin}/display/${org.slug || org.id}`}
                  className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                  style={{ transform: 'scale(1)', transformOrigin: 'top left' }}
                  title={`Display ${org.name}`}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button size="sm" variant="secondary" className="text-xs gap-1" onClick={() => window.open(`/display/${org.slug || org.id}`, '_blank')}>
                    <ExternalLink className="h-3 w-3" /> Full Screen
                  </Button>
                </div>
              </div>
              <div className="p-2 flex items-center justify-between">
                <span className="text-xs font-medium text-foreground truncate">{org.name}</span>
                <Badge variant="outline" className="text-[8px]">{org.vertical_type}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

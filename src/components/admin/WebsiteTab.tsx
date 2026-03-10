import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, ExternalLink, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { getWebsiteConfig, upsertWebsiteConfig, type WebsiteConfig } from '@/api/websiteConfig';

const ALL_PAGES = [
  { key: 'home', label: 'Pagina principală' },
  { key: 'announcements', label: 'Anunțuri' },
  { key: 'gallery', label: 'Galerie foto' },
  { key: 'documents', label: 'Documente' },
  { key: 'schedule', label: 'Program / Orar' },
  { key: 'team', label: 'Echipă' },
  { key: 'services', label: 'Servicii' },
  { key: 'contact', label: 'Contact' },
];

export default function WebsiteTab() {
  const { user } = useAuth();
  const orgId = user?.organization_id;
  const orgSlug = user?.organization_id; // In demo mode we use orgId as slug
  const verticalType = user?.vertical_type || 'kids';
  const [config, setConfig] = useState<Partial<WebsiteConfig>>({
    is_published: false,
    custom_domain: '',
    template: verticalType,
    pages_enabled: ['home', 'announcements', 'gallery', 'contact'],
    hero_title: '',
    hero_subtitle: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    getWebsiteConfig(orgId).then(c => {
      if (c) setConfig(c);
      else setConfig(p => ({ ...p, template: verticalType }));
      setLoading(false);
    });
  }, [orgId, verticalType]);

  const save = async () => {
    if (!orgId) return;
    try {
      await upsertWebsiteConfig(orgId, config);
      toast.success('Configurare website salvată');
    } catch (e: any) { toast.error(e.message); }
  };

  const togglePage = (key: string) => {
    const pages = config.pages_enabled || [];
    if (pages.includes(key)) {
      setConfig(p => ({ ...p, pages_enabled: pages.filter(k => k !== key) }));
    } else {
      setConfig(p => ({ ...p, pages_enabled: [...pages, key] }));
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" /> Website Public
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Publish toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Publicat</Label>
              <p className="text-xs text-muted-foreground">Website-ul va fi accesibil public</p>
            </div>
            <Switch
              checked={config.is_published}
              onCheckedChange={v => setConfig(p => ({ ...p, is_published: v }))}
            />
          </div>

          {config.is_published && (
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-3">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs">
                🟢 Live
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                className="ml-2 text-xs gap-1"
                onClick={() => window.open(`/site/${orgSlug}`, '_blank')}
              >
                <ExternalLink className="h-3 w-3" /> Deschide
              </Button>
            </div>
          )}

          {/* Template */}
          <div>
            <Label className="text-xs text-muted-foreground">Template</Label>
            <Input value={config.template} onChange={e => setConfig(p => ({ ...p, template: e.target.value }))} disabled className="mt-1" />
            <p className="text-[10px] text-muted-foreground mt-0.5">Auto-setat pe baza verticalei ({verticalType})</p>
          </div>

          {/* Hero */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Titlu Hero</Label>
              <Input value={config.hero_title} onChange={e => setConfig(p => ({ ...p, hero_title: e.target.value }))} placeholder="Bine ați venit!" />
            </div>
            <div>
              <Label className="text-xs">Subtitlu Hero</Label>
              <Input value={config.hero_subtitle} onChange={e => setConfig(p => ({ ...p, hero_subtitle: e.target.value }))} placeholder="Descriere scurtă" />
            </div>
          </div>

          {/* Custom domain */}
          <div>
            <Label className="text-xs">Domeniu personalizat (opțional)</Label>
            <Input value={config.custom_domain} onChange={e => setConfig(p => ({ ...p, custom_domain: e.target.value }))} placeholder="www.organizatia-mea.ro" />
          </div>

          {/* Page toggles */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Pagini activate</Label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_PAGES.map(page => (
                <div key={page.key} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <span className="text-sm">{page.label}</span>
                  <Switch
                    checked={(config.pages_enabled || []).includes(page.key)}
                    onCheckedChange={() => togglePage(page.key)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Preview button */}
          <div className="flex gap-2">
            <Button onClick={save} className="flex-1">Salvează</Button>
            <Button variant="outline" className="gap-1.5" onClick={() => window.open(`/site/${orgSlug}`, '_blank')}>
              <Eye className="h-4 w-4" /> Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

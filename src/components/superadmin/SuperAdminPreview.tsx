import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Monitor, Globe, FolderOpen, Lock, ExternalLink, Smartphone, TabletSmartphone } from 'lucide-react';

type PreviewMode = 'desktop' | 'mobile';

export default function SuperAdminPreview() {
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [previewTab, setPreviewTab] = useState('dashboard');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');

  const { data: orgs } = useQuery({
    queryKey: ['sa-orgs-preview'],
    queryFn: async () => {
      const { data } = await supabase.from('organizations').select('id, name, slug, vertical_type').order('name');
      return data || [];
    },
  });

  const selectedOrgData = (orgs || []).find(o => o.id === selectedOrg);
  const orgSlug = selectedOrgData?.slug || selectedOrg;

  const getPreviewUrl = () => {
    const base = window.location.origin;
    switch (previewTab) {
      case 'dashboard': return `${base}/?org=${selectedOrg}`;
      case 'infodisplay': return `${base}/display/${orgSlug}`;
      case 'website': return `${base}/qr/${orgSlug}`;
      case 'gallery': return `${base}/documente?org=${selectedOrg}`;
      default: return '';
    }
  };

  const iframeWidth = previewMode === 'mobile' ? '390px' : '100%';
  const iframeHeight = previewMode === 'mobile' ? '700px' : '600px';

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            Previzualizare — Ce văd utilizatorii
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Org selector */}
          <Select value={selectedOrg} onValueChange={setSelectedOrg}>
            <SelectTrigger className="w-full max-w-sm">
              <SelectValue placeholder="Selectează organizația..." />
            </SelectTrigger>
            <SelectContent>
              {(orgs || []).map(org => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                  <span className="text-muted-foreground ml-1 text-[10px]">({org.vertical_type})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Privacy note */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            <span>Mesajele private nu sunt vizibile din preview — sunt criptate și protejate.</span>
          </div>
        </CardContent>
      </Card>

      {selectedOrg && (
        <Card>
          <CardContent className="p-0">
            {/* Preview tabs + viewport toggle */}
            <div className="flex items-center justify-between px-4 pt-3 pb-0 gap-2 flex-wrap">
              <Tabs value={previewTab} onValueChange={setPreviewTab}>
                <TabsList className="h-8">
                  <TabsTrigger value="dashboard" className="text-xs gap-1 h-7 px-2">
                    <Eye className="h-3 w-3" /> Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="infodisplay" className="text-xs gap-1 h-7 px-2">
                    <Monitor className="h-3 w-3" /> InfoDisplay
                  </TabsTrigger>
                  <TabsTrigger value="website" className="text-xs gap-1 h-7 px-2">
                    <Globe className="h-3 w-3" /> Website
                  </TabsTrigger>
                  <TabsTrigger value="gallery" className="text-xs gap-1 h-7 px-2">
                    <FolderOpen className="h-3 w-3" /> Galerie
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-1">
                <Button
                  variant={previewMode === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => setPreviewMode('desktop')}
                >
                  <TabletSmartphone className="h-3 w-3 mr-1" /> Desktop
                </Button>
                <Button
                  variant={previewMode === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => setPreviewMode('mobile')}
                >
                  <Smartphone className="h-3 w-3 mr-1" /> Mobil
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => window.open(getPreviewUrl(), '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Info bar */}
            <div className="px-4 py-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-[9px]">{selectedOrgData?.vertical_type}</Badge>
              <span>{selectedOrgData?.name}</span>
              <span className="text-[10px] font-mono">/{orgSlug}</span>
            </div>

            {/* Preview iframe */}
            <div className="px-4 pb-4">
              <div
                className={`mx-auto rounded-xl border-2 border-border overflow-hidden bg-background shadow-lg transition-all ${
                  previewMode === 'mobile' ? 'max-w-[410px]' : 'w-full'
                }`}
              >
                {previewMode === 'mobile' && (
                  <div className="h-6 bg-muted flex items-center justify-center">
                    <div className="w-20 h-1 rounded-full bg-muted-foreground/20" />
                  </div>
                )}
                <iframe
                  key={`${previewTab}-${selectedOrg}-${previewMode}`}
                  src={getPreviewUrl()}
                  className="border-0 w-full"
                  style={{ width: iframeWidth, height: iframeHeight }}
                  title={`Preview ${previewTab}`}
                  loading="lazy"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

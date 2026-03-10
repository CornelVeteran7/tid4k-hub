import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, QrCode, ExternalLink, RefreshCw, Smartphone } from 'lucide-react';

export default function DisplayPreviewTab() {
  const { user } = useAuth();
  const orgSlug = user?.organization_id || 'demo';
  const [refreshKey, setRefreshKey] = useState(0);
  const origin = window.location.origin;

  return (
    <div className="space-y-4">
      <Tabs defaultValue="display">
        <TabsList>
          <TabsTrigger value="display" className="gap-1.5 text-xs"><Monitor className="h-3.5 w-3.5" /> Display</TabsTrigger>
          <TabsTrigger value="qr" className="gap-1.5 text-xs"><QrCode className="h-3.5 w-3.5" /> QR Portal</TabsTrigger>
        </TabsList>

        <TabsContent value="display" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">Live Preview</Badge>
              <span className="text-xs text-muted-foreground">/display/{orgSlug}</span>
            </div>
            <div className="flex gap-1.5">
              <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setRefreshKey(k => k + 1)}>
                <RefreshCw className="h-3 w-3" /> Refresh
              </Button>
              <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => window.open(`/display/${orgSlug}`, '_blank')}>
                <ExternalLink className="h-3 w-3" /> Full Screen
              </Button>
            </div>
          </div>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <iframe
                  key={`display-${refreshKey}`}
                  src={`${origin}/display/${orgSlug}`}
                  className="absolute inset-0 w-full h-full border-0 rounded-lg"
                  title="Display Preview"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">QR Portal</Badge>
              <span className="text-xs text-muted-foreground">/qr/{orgSlug}</span>
            </div>
            <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => window.open(`/qr/${orgSlug}`, '_blank')}>
              <ExternalLink className="h-3 w-3" /> Deschide
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Guest view */}
            <Card className="overflow-hidden">
              <CardHeader className="py-2 px-3"><CardTitle className="text-xs flex items-center gap-1.5"><Smartphone className="h-3 w-3" /> Vizitator (Guest)</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="relative w-full" style={{ paddingTop: '177%', maxHeight: 500 }}>
                  <iframe
                    key={`qr-guest-${refreshKey}`}
                    src={`${origin}/qr/${orgSlug}`}
                    className="absolute inset-0 w-full h-full border-0"
                    style={{ maxWidth: 375, margin: '0 auto' }}
                    title="QR Guest Preview"
                  />
                </div>
              </CardContent>
            </Card>
            {/* Info card */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Acces diferențiat</h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="rounded-lg bg-muted/50 p-2">
                    <span className="font-medium text-foreground">👤 Vizitator</span>
                    <p>Anunțuri publice, program, informații generale</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2">
                    <span className="font-medium text-foreground">🔐 Autentificat</span>
                    <p>Date personalizate, mesaje, documente private, statistici</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

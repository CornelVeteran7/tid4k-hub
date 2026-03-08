import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Facebook, Link2 } from 'lucide-react';

interface Props { orgId: string; }

export default function SettingsIntegrations({ orgId }: Props) {
  return (
    <div className="space-y-4">
      {/* WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Sincronizare activă</p>
              <p className="text-xs text-muted-foreground">Bidirecțională cu grupurile de părinți</p>
            </div>
            <Badge className="bg-success text-success-foreground">Activ</Badge>
          </div>
          <Separator />
          <div className="flex items-center gap-2">
            <Switch defaultChecked id="wa-consent" />
            <Label htmlFor="wa-consent" className="text-sm">Consimțământ părinți activ</Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Configurarea detaliată a mapping-ului grup → WhatsApp se face din pagina WhatsApp.
          </p>
        </CardContent>
      </Card>

      {/* Facebook */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Facebook className="h-4 w-4" /> Facebook
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Conectare pagină Facebook</span>
            <Badge variant="secondary">În dezvoltare</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Postare automată pe pagina de Facebook a organizației. Funcționalitate disponibilă în curând.
          </p>
        </CardContent>
      </Card>

      {/* Other integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4" /> Alte integrări
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Integrări cu sisteme externe (ERP, contabilitate, etc.) vor fi disponibile în viitoarele versiuni.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

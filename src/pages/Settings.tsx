import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Upload, Key, MessageCircle, Facebook, Bell, Database, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-display font-bold">Configurări</h1>
        <p className="text-muted-foreground">Setări sistem și integrări</p>
      </div>

      {/* School Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" /> Informații școală
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Nume școală</Label><Input defaultValue="Grădinița Floarea Soarelui" /></div>
          <div><Label>Adresă</Label><Input defaultValue="Str. Exemplu nr. 1, București" /></div>
          <div>
            <Label>Logo</Label>
            <div className="mt-2 flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <Button variant="outline" size="sm">Schimbă logo</Button>
            </div>
          </div>
          <Button onClick={() => toast.success('Salvat!')}>Salvează</Button>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Key className="h-4 w-4" /> Chei API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {['Cloudmersive', 'OpenAI', 'Twilio'].map((name) => (
            <div key={name}>
              <Label>{name}</Label>
              <Input type="password" defaultValue="••••••••••••••••" readOnly className="font-mono" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><MessageCircle className="h-4 w-4" /> Integrare WhatsApp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-sm">Sincronizare activă</p><p className="text-xs text-muted-foreground">Bidirecțională</p></div>
            <Badge className="bg-success text-success-foreground">Activ</Badge>
          </div>
          <Separator />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Grupa Mare → Grupa Mare - Părinți</span><Badge variant="secondary">Bidirecțional</Badge></div>
            <div className="flex justify-between"><span>Clasa I-A → Clasa I-A Comunicare</span><Badge variant="secondary">Unidirecțional</Badge></div>
          </div>
          <div className="flex items-center gap-2">
            <Switch defaultChecked id="consent" />
            <Label htmlFor="consent" className="text-sm">Consimțământ părinți activ</Label>
          </div>
        </CardContent>
      </Card>

      {/* Facebook */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Facebook className="h-4 w-4" /> Integrare Facebook</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Page ID</Label><Input defaultValue="123456789" className="font-mono" /></div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Token status</span>
            <Badge className="bg-success text-success-foreground">Activ</Badge>
          </div>
          <div><Label>Format postare</Label><Input defaultValue="text+image" /></div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" /> Notificări</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Notificări email</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label>Notificări SMS</Label>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4" /> Mentenanță sistem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="gap-2" onClick={() => toast.success('Cache golit!')}>
            <Trash2 className="h-4 w-4" /> Golește cache
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => toast.success('Backup inițiat!')}>
            <Database className="h-4 w-4" /> Backup bază de date
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

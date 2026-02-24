import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Settings as SettingsIcon, Upload, Key, MessageCircle, Facebook, Bell, Database, Trash2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const sections = [
  { id: 'info', label: 'Informații școală', icon: SettingsIcon },
  { id: 'api', label: 'Chei API', icon: Key },
  { id: 'whatsapp', label: 'Integrare WhatsApp', icon: MessageCircle },
  { id: 'facebook', label: 'Integrare Facebook', icon: Facebook },
  { id: 'notif', label: 'Notificări', icon: Bell },
  { id: 'maint', label: 'Mentenanță', icon: Database },
];

export default function SettingsTab() {
  const [openSections, setOpenSections] = useState<string[]>(['info']);

  const toggle = (id: string) => {
    setOpenSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-3 max-w-3xl">
      {/* Info */}
      <Collapsible open={openSections.includes('info')} onOpenChange={() => toggle('info')}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" /> Informații școală
                <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${openSections.includes('info') ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div><Label>Nume</Label><Input defaultValue="Grădinița Floarea Soarelui" /></div>
              <div><Label>Adresă</Label><Input defaultValue="Str. Exemplu nr. 1, București" /></div>
              <div>
                <Label>Logo</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center"><Upload className="h-6 w-6 text-muted-foreground" /></div>
                  <Button variant="outline" size="sm">Schimbă logo</Button>
                </div>
              </div>
              <Button onClick={() => toast.success('Salvat!')}>Salvează</Button>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* API Keys */}
      <Collapsible open={openSections.includes('api')} onOpenChange={() => toggle('api')}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Key className="h-4 w-4" /> Chei API <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${openSections.includes('api') ? 'rotate-180' : ''}`} /></CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              {['Cloudmersive', 'OpenAI', 'Twilio'].map(name => (
                <div key={name}><Label>{name}</Label><Input type="password" defaultValue="••••••••••••••••" readOnly className="font-mono" /></div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* WhatsApp */}
      <Collapsible open={openSections.includes('whatsapp')} onOpenChange={() => toggle('whatsapp')}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${openSections.includes('whatsapp') ? 'rotate-180' : ''}`} /></CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div className="flex items-center justify-between">
                <div><p className="font-medium text-sm">Sincronizare</p><p className="text-xs text-muted-foreground">Bidirecțională</p></div>
                <Badge className="bg-emerald-500 text-white">Activ</Badge>
              </div>
              <Separator />
              <div className="flex items-center gap-2"><Switch defaultChecked id="consent" /><Label htmlFor="consent" className="text-sm">Consimțământ părinți</Label></div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Facebook */}
      <Collapsible open={openSections.includes('facebook')} onOpenChange={() => toggle('facebook')}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Facebook className="h-4 w-4" /> Facebook <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${openSections.includes('facebook') ? 'rotate-180' : ''}`} /></CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div><Label>Page ID</Label><Input defaultValue="123456789" className="font-mono" /></div>
              <div className="flex items-center justify-between"><span className="text-sm">Token</span><Badge className="bg-emerald-500 text-white">Activ</Badge></div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Notifications */}
      <Collapsible open={openSections.includes('notif')} onOpenChange={() => toggle('notif')}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Bell className="h-4 w-4" /> Notificări <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${openSections.includes('notif') ? 'rotate-180' : ''}`} /></CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-center justify-between"><Label>Email</Label><Switch defaultChecked /></div>
              <div className="flex items-center justify-between"><Label>SMS</Label><Switch /></div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Maintenance */}
      <Collapsible open={openSections.includes('maint')} onOpenChange={() => toggle('maint')}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Database className="h-4 w-4" /> Mentenanță <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${openSections.includes('maint') ? 'rotate-180' : ''}`} /></CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-3 pt-0">
              <Button variant="outline" className="gap-2" onClick={() => toast.success('Cache golit!')}><Trash2 className="h-4 w-4" />Golește cache</Button>
              <Button variant="outline" className="gap-2" onClick={() => toast.success('Backup inițiat!')}><Database className="h-4 w-4" />Backup DB</Button>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Monitor, Save, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { getOrgConfigByKey, upsertOrgConfig, getOrganization } from '@/api/orgConfig';

interface Props { orgId: string; }

export default function SettingsDisplay({ orgId }: Props) {
  const [config, setConfig] = useState({
    slide_duration: 8,
    ticker_speed: 30,
    show_menu: false,
    show_schedule: true,
    show_qr: true,
    show_queue: false,
    show_tasks: false,
    show_ssm: false,
  });
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getOrgConfigByKey(orgId, 'display_settings').then(val => {
      if (val) setConfig(prev => ({ ...prev, ...val }));
    });
    getOrganization(orgId).then(o => setSlug(o.slug || ''));
  }, [orgId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertOrgConfig(orgId, 'display_settings', config);
      toast.success('Setări display salvate!');
    } catch (e: any) {
      toast.error(e.message || 'Eroare');
    }
    setSaving(false);
  };

  const displayUrl = slug ? `/display/${slug}` : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Monitor className="h-4 w-4" /> Configurare Display Fizic
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {slug && (
          <div className="rounded-lg bg-muted p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">URL Display</p>
              <p className="text-xs text-muted-foreground font-mono">{window.location.origin}{displayUrl}</p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open(displayUrl, '_blank')}>
              <ExternalLink className="h-3.5 w-3.5" /> Deschide
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Durată slide (secunde)</Label>
            <Input
              type="number"
              min={3}
              max={30}
              value={config.slide_duration}
              onChange={e => setConfig(prev => ({ ...prev, slide_duration: parseInt(e.target.value) || 8 }))}
            />
          </div>
          <div>
            <Label>Viteză ticker (secunde)</Label>
            <Input
              type="number"
              min={10}
              max={60}
              value={config.ticker_speed}
              onChange={e => setConfig(prev => ({ ...prev, ticker_speed: parseInt(e.target.value) || 30 }))}
            />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Conținut afișat pe display</p>
          {[
            { key: 'show_menu', label: 'Meniu zilnic' },
            { key: 'show_schedule', label: 'Orar / program' },
            { key: 'show_qr', label: 'Cod QR (Cancelarie)' },
            { key: 'show_queue', label: 'Sistem coadă (tichete)' },
            { key: 'show_tasks', label: 'Taskuri active' },
            { key: 'show_ssm', label: 'Remindere SSM' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <Label className="text-sm">{item.label}</Label>
              <Switch
                checked={(config as any)[item.key] ?? false}
                onCheckedChange={v => setConfig(prev => ({ ...prev, [item.key]: v }))}
              />
            </div>
          ))}
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" /> {saving ? 'Se salvează...' : 'Salvează'}
        </Button>
      </CardContent>
    </Card>
  );
}

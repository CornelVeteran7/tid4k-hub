import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Building2, Upload, Nfc, Save } from 'lucide-react';
import { toast } from 'sonner';
import { getOrganization, updateOrganization } from '@/api/orgConfig';

interface Props { orgId: string; }

export default function SettingsGeneral({ orgId }: Props) {
  const [org, setOrg] = useState<any>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [nfcEnabled, setNfcEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getOrganization(orgId).then(o => {
      setOrg(o);
      setName(o.name || '');
      setSlug(o.slug || '');
      setNfcEnabled(o.nfc_enabled || false);
    }).catch(() => {});
  }, [orgId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateOrganization(orgId, { name, slug: slug || undefined, nfc_enabled: nfcEnabled });
      toast.success('Informații salvate!');
    } catch (e: any) {
      toast.error(e.message || 'Eroare la salvare');
    }
    setSaving(false);
  };

  if (!org) return <div className="py-8 text-center text-muted-foreground text-sm">Se încarcă...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-4 w-4" /> Informații organizație
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Nume organizație</Label>
          <Input value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <Label>Slug (URL display)</Label>
          <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="ex: gradinita-mea" />
          <p className="text-xs text-muted-foreground mt-1">/display/{slug || '...'}</p>
        </div>
        <div>
          <Label>Logo</Label>
          <div className="mt-2 flex items-center gap-4">
            {org.logo_url ? (
              <img src={org.logo_url} alt="Logo" className="h-16 w-16 rounded-lg object-contain bg-muted" />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <Button variant="outline" size="sm" disabled>Schimbă logo</Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm flex items-center gap-2"><Nfc className="h-4 w-4" /> NFC</p>
            <p className="text-xs text-muted-foreground">Activare scanare NFC pe paginile relevante</p>
          </div>
          <Switch checked={nfcEnabled} onCheckedChange={setNfcEnabled} />
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" /> {saving ? 'Se salvează...' : 'Salvează'}
        </Button>
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Upload, Nfc, Save, MapPin, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { getOrganization, updateOrganization } from '@/api/orgConfig';
import { getOrgConfigByKey, upsertOrgConfig } from '@/api/orgConfig';
import { supabase } from '@/integrations/supabase/client';

interface Props { orgId: string; }

export default function SettingsGeneral({ orgId }: Props) {
  const [org, setOrg] = useState<any>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [nfcEnabled, setNfcEnabled] = useState(false);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    Promise.all([
      getOrganization(orgId),
      getOrgConfigByKey(orgId, 'contact_info'),
    ]).then(([o, contact]) => {
      setOrg(o);
      setName(o.name || '');
      setSlug(o.slug || '');
      setNfcEnabled(o.nfc_enabled || false);
      if (contact) {
        setAddress(contact.address || '');
        setPhone(contact.phone || '');
        setContactEmail(contact.email || '');
        setDescription(contact.description || '');
      }
    }).catch(() => {});
  }, [orgId]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `logos/${orgId}.${ext}`;
      const { error: upErr } = await supabase.storage.from('documents').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path);
      await updateOrganization(orgId, { logo_url: urlData.publicUrl });
      setOrg((prev: any) => ({ ...prev, logo_url: urlData.publicUrl }));
      toast.success('Logo actualizat!');
    } catch (err: any) {
      toast.error(err.message || 'Eroare la upload');
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updateOrganization(orgId, { name, slug: slug || undefined, nfc_enabled: nfcEnabled }),
        upsertOrgConfig(orgId, 'contact_info', { address, phone, email: contactEmail, description }),
      ]);
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

        {/* Logo upload */}
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
            <label>
              <Button variant="outline" size="sm" disabled={uploading} asChild>
                <span>{uploading ? 'Se încarcă...' : 'Schimbă logo'}</span>
              </Button>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
          </div>
        </div>

        {/* Contact info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Adresă</Label>
            <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Str. Exemplu, Nr. 1" />
          </div>
          <div>
            <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Telefon</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="0721 000 000" />
          </div>
          <div>
            <Label className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email contact</Label>
            <Input value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="contact@org.ro" />
          </div>
        </div>
        <div>
          <Label>Descriere scurtă</Label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Descrierea organizației..." />
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

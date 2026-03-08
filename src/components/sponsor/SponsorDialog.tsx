import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createSponsor } from '@/api/sponsors';
import type { Sponsor } from '@/types/sponsor';
import { toast } from 'sonner';
import { Building2, Save } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (sponsor: Sponsor) => void;
}

export default function SponsorDialog({ open, onOpenChange, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nume: '',
    logo_url: '',
    website: '',
    culoare_brand: '#e1001a',
    descriere: '',
    plan: 'Basic',
    data_start: new Date().toISOString().split('T')[0],
    data_expirare: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.nume.trim()) {
      toast.error('Numele sponsorului este obligatoriu');
      return;
    }
    if (!form.logo_url.trim()) {
      toast.error('URL-ul logo-ului este obligatoriu');
      return;
    }
    setLoading(true);
    try {
      const sponsor = await createSponsor({
        ...form,
        activ: true,
      });
      toast.success(`Sponsor ${sponsor.nume} creat cu succes!`);
      onSaved(sponsor);
      onOpenChange(false);
      // Reset form
      setForm({
        nume: '',
        logo_url: '',
        website: '',
        culoare_brand: '#e1001a',
        descriere: '',
        plan: 'Basic',
        data_start: new Date().toISOString().split('T')[0],
        data_expirare: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    } catch (err: any) {
      toast.error('Eroare la crearea sponsorului: ' + (err.message || 'necunoscută'));
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Sponsor nou
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="nume">Nume sponsor *</Label>
            <Input
              id="nume"
              placeholder="ex: Kaufland"
              value={form.nume}
              onChange={e => update('nume', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_url">URL logo *</Label>
            <Input
              id="logo_url"
              type="url"
              placeholder="https://example.com/logo.png"
              value={form.logo_url}
              onChange={e => update('logo_url', e.target.value)}
            />
            {form.logo_url && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Preview:</span>
                <img src={form.logo_url} alt="Logo preview" className="h-8 w-8 object-contain border rounded" onError={() => toast.error('URL logo invalid')} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://sponsor.com"
              value={form.website}
              onChange={e => update('website', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="culoare_brand">Culoare brand</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={form.culoare_brand}
                onChange={e => update('culoare_brand', e.target.value)}
                className="h-10 w-16 rounded border cursor-pointer"
              />
              <Input
                id="culoare_brand"
                value={form.culoare_brand}
                onChange={e => update('culoare_brand', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descriere">Descriere</Label>
            <Textarea
              id="descriere"
              placeholder="Descriere scurtă a sponsorului..."
              value={form.descriere}
              onChange={e => update('descriere', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan">Plan</Label>
            <Select value={form.plan} onValueChange={v => update('plan', v)}>
              <SelectTrigger id="plan">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_start">Data start</Label>
              <Input
                id="data_start"
                type="date"
                value={form.data_start}
                onChange={e => update('data_start', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_expirare">Data expirare</Label>
              <Input
                id="data_expirare"
                type="date"
                value={form.data_expirare}
                onChange={e => update('data_expirare', e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Anulează
          </Button>
          <Button onClick={handleSave} disabled={loading} className="gap-2">
            {loading ? '...' : <><Save className="h-4 w-4" />Salvează</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

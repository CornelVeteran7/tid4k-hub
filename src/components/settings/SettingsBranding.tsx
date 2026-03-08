import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { getOrganization, updateOrganization } from '@/api/orgConfig';
import { getOrgConfigByKey, upsertOrgConfig } from '@/api/orgConfig';
import { applyBrandingColors } from '@/utils/branding';

interface Props { orgId: string; }

const FONT_OPTIONS = [
  { value: 'default', label: 'Playfair Display + Poppins (implicit)' },
  { value: 'modern', label: 'Inter + DM Sans' },
  { value: 'classic', label: 'Georgia + Roboto' },
  { value: 'playful', label: 'Nunito + Quicksand' },
  { value: 'corporate', label: 'Montserrat + Open Sans' },
];

export default function SettingsBranding({ orgId }: Props) {
  const [primaryColor, setPrimaryColor] = useState('#1E3A4C');
  const [secondaryColor, setSecondaryColor] = useState('#2D5F7A');
  const [fontPref, setFontPref] = useState('default');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      getOrganization(orgId),
      getOrgConfigByKey(orgId, 'branding'),
    ]).then(([o, branding]) => {
      setPrimaryColor(o.primary_color || '#1E3A4C');
      setSecondaryColor(o.secondary_color || '#2D5F7A');
      if (branding?.font_preference) setFontPref(branding.font_preference);
    }).catch(() => {});
  }, [orgId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updateOrganization(orgId, { primary_color: primaryColor, secondary_color: secondaryColor }),
        upsertOrgConfig(orgId, 'branding', { font_preference: fontPref }),
      ]);
      // Apply immediately
      applyBrandingColors(primaryColor, secondaryColor);
      toast.success('Branding salvat! Culorile s-au aplicat.');
    } catch (e: any) {
      toast.error(e.message || 'Eroare');
    }
    setSaving(false);
  };

  const handleReset = () => {
    setPrimaryColor('#1E3A4C');
    setSecondaryColor('#2D5F7A');
    setFontPref('default');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Palette className="h-4 w-4" /> Branding — Culori & Font
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Culorile se aplică pe toate ecranele: dashboard, display fizic, sidebar, pagina de login.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Culoare primară</Label>
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-lg border-2 border-border shadow-sm" style={{ backgroundColor: primaryColor }} />
                <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
              <div>
                <p className="text-sm font-mono">{primaryColor}</p>
                <p className="text-xs text-muted-foreground">Sidebar, butoane, accente</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Culoare secundară</Label>
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-lg border-2 border-border shadow-sm" style={{ backgroundColor: secondaryColor }} />
                <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
              <div>
                <p className="text-sm font-mono">{secondaryColor}</p>
                <p className="text-xs text-muted-foreground">Gradiente, elemente secundare</p>
              </div>
            </div>
          </div>
        </div>

        {/* Font preference */}
        <div className="space-y-2">
          <Label>Font preferință</Label>
          <Select value={fontPref} onValueChange={setFontPref}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map(f => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Fontul se aplică pe toate paginile aplicației.</p>
        </div>

        {/* Preview */}
        <div className="rounded-xl border border-border p-4 space-y-3">
          <p className="text-sm font-semibold">Previzualizare</p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: primaryColor }}>
              Buton Primar
            </div>
            <div className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: secondaryColor }}>
              Buton Secundar
            </div>
            <div className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
              Gradient
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: primaryColor }} />
            <div className="h-1 flex-1 rounded-full" style={{ background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})` }} />
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: secondaryColor }} />
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" /> {saving ? 'Se salvează...' : 'Salvează branding'}
          </Button>
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Resetează
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

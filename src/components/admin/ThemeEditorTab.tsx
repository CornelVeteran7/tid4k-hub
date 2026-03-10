import { useState, useEffect } from 'react';
import { Palette, Save, RotateCcw, Upload, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { applyBrandingColors, applyVerticalTheme } from '@/utils/branding';
import { VERTICAL_DEFINITIONS, type VerticalType } from '@/config/verticalConfig';

/* Default theme presets per vertical */
const VERTICAL_PRESETS: Record<string, { primary: string; secondary: string; description: string }> = {
  kids: { primary: '#1E3A4C', secondary: '#104F8C', description: 'Navy jucăuș — tonuri calde și prietenoase' },
  schools: { primary: '#1E3A4C', secondary: '#104F8C', description: 'Navy academic — profesional și serios' },
  medicine: { primary: '#1A6B8A', secondary: '#2D9B8A', description: 'Clinical Blue — curat, de încredere' },
  construction: { primary: '#5C3D1E', secondary: '#8B6914', description: 'Earth Industrial — pământiu, profesional' },
  workshops: { primary: '#2F3B4E', secondary: '#3D5A80', description: 'Steel Blue — profesional, auto' },
  living: { primary: '#2D5016', secondary: '#4A7C1C', description: 'Forest Green — rezidențial, natural' },
  culture: { primary: '#8B1A1A', secondary: '#C9A03C', description: 'Opera Noir — roșu profund, auriu' },
  students: { primary: '#1E3A4C', secondary: '#104F8C', description: 'Academic Navy — universitar' },
};

interface ThemeOverride {
  primary_color: string;
  secondary_color: string;
  inky_costume_url: string;
}

export default function ThemeEditorTab() {
  const { user } = useAuth();
  const verticalType = (user?.vertical_type || 'kids') as VerticalType;

  // General vertical preset editing
  const [selectedVertical, setSelectedVertical] = useState<string>(verticalType);
  const [primaryColor, setPrimaryColor] = useState(VERTICAL_PRESETS[selectedVertical]?.primary || '#1E3A4C');
  const [secondaryColor, setSecondaryColor] = useState(VERTICAL_PRESETS[selectedVertical]?.secondary || '#104F8C');
  const [inkyCostumeUrl, setInkyCostumeUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // Per-org override
  const [orgOverride, setOrgOverride] = useState<ThemeOverride | null>(null);
  const [orgPrimary, setOrgPrimary] = useState('');
  const [orgSecondary, setOrgSecondary] = useState('');
  const [orgInkyUrl, setOrgInkyUrl] = useState('');

  // Load current org override
  useEffect(() => {
    if (!user?.organization_id) return;
    supabase
      .from('org_config')
      .select('config_value')
      .eq('organization_id', user.organization_id)
      .eq('config_key', 'theme_override')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.config_value) {
          const val = data.config_value as any;
          setOrgOverride(val);
          setOrgPrimary(val.primary_color || '');
          setOrgSecondary(val.secondary_color || '');
          setOrgInkyUrl(val.inky_costume_url || '');
        }
      });
  }, [user?.organization_id]);

  // Update colors when vertical changes
  useEffect(() => {
    const preset = VERTICAL_PRESETS[selectedVertical];
    if (preset) {
      setPrimaryColor(preset.primary);
      setSecondaryColor(preset.secondary);
    }
  }, [selectedVertical]);

  const handlePreview = () => {
    applyBrandingColors(primaryColor, secondaryColor);
    applyVerticalTheme(selectedVertical);
    toast.info('Previzualizare aplicată. Salvează pentru a păstra.');
  };

  const handleSaveVerticalPreset = async () => {
    if (!user?.organization_id) return;
    setSaving(true);
    try {
      // Save as org_config entry: vertical_theme_{type}
      const configKey = `vertical_theme_${selectedVertical}`;
      const configValue = { primary_color: primaryColor, secondary_color: secondaryColor, inky_costume_url: inkyCostumeUrl };

      const { data: existing } = await supabase
        .from('org_config')
        .select('id')
        .eq('organization_id', user.organization_id)
        .eq('config_key', configKey)
        .maybeSingle();

      if (existing) {
        await supabase.from('org_config').update({ config_value: configValue as any }).eq('id', existing.id);
      } else {
        await supabase.from('org_config').insert({ organization_id: user.organization_id, config_key: configKey, config_value: configValue as any });
      }

      toast.success(`Tema pentru ${VERTICAL_DEFINITIONS[selectedVertical as VerticalType]?.label || selectedVertical} salvată!`);
    } catch (e: any) {
      toast.error(e.message || 'Eroare la salvare');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOrgOverride = async () => {
    if (!user?.organization_id) return;
    setSaving(true);
    try {
      const configValue = { primary_color: orgPrimary, secondary_color: orgSecondary, inky_costume_url: orgInkyUrl };

      const { data: existing } = await supabase
        .from('org_config')
        .select('id')
        .eq('organization_id', user.organization_id)
        .eq('config_key', 'theme_override')
        .maybeSingle();

      if (existing) {
        await supabase.from('org_config').update({ config_value: configValue as any }).eq('id', existing.id);
      } else {
        await supabase.from('org_config').insert({ organization_id: user.organization_id, config_key: 'theme_override', config_value: configValue as any });
      }

      // Apply immediately
      if (orgPrimary && orgSecondary) {
        applyBrandingColors(orgPrimary, orgSecondary);
      }

      toast.success('Override temă organizație salvat!');
    } catch (e: any) {
      toast.error(e.message || 'Eroare la salvare');
    } finally {
      setSaving(false);
    }
  };

  const handleResetOrgOverride = async () => {
    if (!user?.organization_id) return;
    await supabase
      .from('org_config')
      .delete()
      .eq('organization_id', user.organization_id)
      .eq('config_key', 'theme_override');
    setOrgPrimary('');
    setOrgSecondary('');
    setOrgInkyUrl('');
    setOrgOverride(null);
    // Re-apply vertical default
    applyVerticalTheme(verticalType);
    toast.success('Override eliminat. Se folosește tema implicită.');
  };

  return (
    <div className="space-y-6">
      {/* ── Section 1: General Vertical Themes ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5 text-primary" />
            Teme per Tip de Client
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Setări generale de culoare pentru fiecare categorie de clienți
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Selectează tipul de client</Label>
            <Select value={selectedVertical} onValueChange={setSelectedVertical}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(VERTICAL_DEFINITIONS).map(([key, def]) => (
                  <SelectItem key={key} value={key}>
                    {def.icon} {def.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {VERTICAL_PRESETS[selectedVertical]?.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Culoare primară</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="h-10 w-14 rounded border border-input cursor-pointer"
                />
                <Input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="font-mono" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Culoare secundară</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={e => setSecondaryColor(e.target.value)}
                  className="h-10 w-14 rounded border border-input cursor-pointer"
                />
                <Input value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="font-mono" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Inky Costume URL (opțional)</Label>
            <Input
              placeholder="https://... sau lăsați gol pentru costumul implicit"
              value={inkyCostumeUrl}
              onChange={e => setInkyCostumeUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              PNG transparent, minim 256×256px. Costumele implicite: Doctor (Medicină), Constructor (Construcții), Mecanic (Service), Operă (Cultură).
            </p>
          </div>

          {/* Preview strip */}
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
            <div className="h-8 w-8 rounded-lg" style={{ background: primaryColor }} />
            <div className="h-8 w-8 rounded-lg" style={{ background: secondaryColor }} />
            <div className="h-8 flex-1 rounded-lg" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }} />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePreview} className="gap-1.5">
              <Eye className="h-4 w-4" /> Previzualizare
            </Button>
            <Button size="sm" onClick={handleSaveVerticalPreset} disabled={saving} className="gap-1.5">
              <Save className="h-4 w-4" /> Salvează preset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* ── Section 2: Per-Org Override ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5 text-accent" />
            Override Temă — {user?.org_name || 'Organizația curentă'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Suprascrie tema implicită cu culori personalizate doar pentru această organizație
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Culoare primară (override)</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={orgPrimary || primaryColor}
                  onChange={e => setOrgPrimary(e.target.value)}
                  className="h-10 w-14 rounded border border-input cursor-pointer"
                />
                <Input
                  value={orgPrimary}
                  onChange={e => setOrgPrimary(e.target.value)}
                  placeholder="Lăsați gol pentru implicit"
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Culoare secundară (override)</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={orgSecondary || secondaryColor}
                  onChange={e => setOrgSecondary(e.target.value)}
                  className="h-10 w-14 rounded border border-input cursor-pointer"
                />
                <Input
                  value={orgSecondary}
                  onChange={e => setOrgSecondary(e.target.value)}
                  placeholder="Lăsați gol pentru implicit"
                  className="font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Inky Costume URL (override org)</Label>
            <Input
              placeholder="URL imagine PNG pentru asistentul acestei organizații"
              value={orgInkyUrl}
              onChange={e => setOrgInkyUrl(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveOrgOverride} disabled={saving} className="gap-1.5">
              <Save className="h-4 w-4" /> Salvează override
            </Button>
            {orgOverride && (
              <Button variant="outline" size="sm" onClick={handleResetOrgOverride} className="gap-1.5">
                <RotateCcw className="h-4 w-4" /> Resetează la implicit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

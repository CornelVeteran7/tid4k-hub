import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Palette, Save } from 'lucide-react';
import { toast } from 'sonner';
import { getOrganization, updateOrganization } from '@/api/orgConfig';

interface Props { orgId: string; }

export default function SettingsBranding({ orgId }: Props) {
  const [primaryColor, setPrimaryColor] = useState('#4F46E5');
  const [secondaryColor, setSecondaryColor] = useState('#7C3AED');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getOrganization(orgId).then(o => {
      setPrimaryColor(o.primary_color || '#4F46E5');
      setSecondaryColor(o.secondary_color || '#7C3AED');
    }).catch(() => {});
  }, [orgId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateOrganization(orgId, { primary_color: primaryColor, secondary_color: secondaryColor });
      toast.success('Branding salvat! Culorile se vor aplica la următoarea încărcare.');
    } catch (e: any) {
      toast.error(e.message || 'Eroare');
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Palette className="h-4 w-4" /> Branding — Culori organizație
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Culorile se aplică pe toate ecranele: dashboard, display fizic, pagina de login.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Culoare primară</Label>
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-lg border-2 border-border shadow-sm" style={{ backgroundColor: primaryColor }} />
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div>
                <p className="text-sm font-mono">{primaryColor}</p>
                <p className="text-xs text-muted-foreground">Butoane, sidebar, accente</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Culoare secundară</Label>
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-lg border-2 border-border shadow-sm" style={{ backgroundColor: secondaryColor }} />
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={e => setSecondaryColor(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div>
                <p className="text-sm font-mono">{secondaryColor}</p>
                <p className="text-xs text-muted-foreground">Gradiente, elemente secundare</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-xl border border-border p-4 space-y-3">
          <p className="text-sm font-semibold">Previzualizare</p>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: primaryColor }}>
              Buton Primar
            </div>
            <div className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: secondaryColor }}>
              Buton Secundar
            </div>
            <div
              className="px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
            >
              Gradient
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" /> {saving ? 'Se salvează...' : 'Salvează branding'}
        </Button>
      </CardContent>
    </Card>
  );
}

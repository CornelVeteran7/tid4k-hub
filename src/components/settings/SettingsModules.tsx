import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { VERTICAL_DEFINITIONS, type VerticalType } from '@/config/verticalConfig';

interface Props {
  orgId: string;
  verticalType: VerticalType;
}

const ALL_MODULES: Record<string, { label: string; description: string; verticals: VerticalType[] }> = {
  prezenta: { label: 'Prezență', description: 'Evidența prezenței zilnice', verticals: ['kids', 'schools', 'students'] },
  imagini: { label: 'Galerie Imagini', description: 'Fotografii din activități', verticals: ['kids', 'schools', 'medicine', 'culture', 'students', 'construction', 'workshops'] },
  documente: { label: 'Documente', description: 'Fișiere PDF partajate', verticals: ['kids', 'schools', 'medicine', 'living', 'culture', 'students', 'construction', 'workshops'] },
  povesti: { label: 'Povești TTS', description: 'Povești cu text-to-speech', verticals: ['kids'] },
  ateliere: { label: 'Ateliere', description: 'Activități creative', verticals: ['kids'] },
  meniu: { label: 'Meniu OMS', description: 'Meniul zilnic / săptămânal', verticals: ['kids'] },
  mesaje: { label: 'Mesaje', description: 'Comunicare directă', verticals: ['kids', 'schools', 'medicine', 'living', 'students', 'construction', 'workshops'] },
  orar: { label: 'Orar', description: 'Programul zilnic/săptămânal', verticals: ['kids', 'schools', 'medicine', 'culture', 'students'] },
  anunturi: { label: 'Anunțuri', description: 'Comunicări oficiale', verticals: ['kids', 'schools', 'medicine', 'living', 'culture', 'students', 'construction', 'workshops'] },
  rapoarte: { label: 'Rapoarte', description: 'Statistici și analize', verticals: ['schools', 'living', 'students', 'construction', 'workshops'] },
  coada: { label: 'Sistem Coadă', description: 'Queue cu tichete', verticals: ['medicine', 'students'] },
  video: { label: 'Video Monitoring', description: 'Monitorizare video', verticals: ['kids', 'construction'] },
};

export default function SettingsModules({ orgId, verticalType }: Props) {
  const [moduleStates, setModuleStates] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const availableModules = Object.entries(ALL_MODULES)
    .filter(([_, def]) => def.verticals.includes(verticalType));

  useEffect(() => {
    loadModules();
  }, [orgId]);

  const loadModules = async () => {
    const { data } = await supabase
      .from('modules_config')
      .select('module_key, is_active')
      .eq('organization_id', orgId);

    const states: Record<string, boolean> = {};
    // Default: ON for defaultModules of this vertical
    const defaults = VERTICAL_DEFINITIONS[verticalType]?.defaultModules || [];
    availableModules.forEach(([key]) => {
      states[key] = defaults.includes(key);
    });
    // Override with DB values
    (data || []).forEach(row => {
      states[row.module_key] = row.is_active;
    });
    setModuleStates(states);
    setLoading(false);
  };

  const toggleModule = async (moduleKey: string, active: boolean) => {
    setModuleStates(prev => ({ ...prev, [moduleKey]: active }));

    const { error } = await supabase
      .from('modules_config')
      .upsert({
        organization_id: orgId,
        module_key: moduleKey,
        is_active: active,
      }, { onConflict: 'organization_id,module_key' });

    if (error) {
      toast.error('Eroare la actualizare modul');
      setModuleStates(prev => ({ ...prev, [moduleKey]: !active }));
    } else {
      toast.success(`${ALL_MODULES[moduleKey]?.label} ${active ? 'activat' : 'dezactivat'}`);
    }
  };

  if (loading) return <div className="py-8 text-center text-muted-foreground text-sm">Se încarcă...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <LayoutGrid className="h-4 w-4" /> Module disponibile — {VERTICAL_DEFINITIONS[verticalType]?.label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Activează sau dezactivează modulele pentru organizația ta. Modulele dezactivate nu vor apărea în sidebar.
        </p>
        <div className="divide-y divide-border">
          {availableModules.map(([key, def]) => (
            <div key={key} className="flex items-center justify-between py-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{def.label}</p>
                  {moduleStates[key] && <Badge variant="secondary" className="text-[10px]">Activ</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{def.description}</p>
              </div>
              <Switch
                checked={moduleStates[key] ?? false}
                onCheckedChange={(checked) => toggleModule(key, checked)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

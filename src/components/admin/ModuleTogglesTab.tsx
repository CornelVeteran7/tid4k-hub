import { useFeatureToggles } from '@/hooks/useFeatureToggles';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { SlidersHorizontal } from 'lucide-react';
import { VERTICAL_DEFINITIONS, type VerticalType } from '@/config/verticalConfig';

const ALL_MODULES = [
  { key: 'prezenta', label: 'Prezență', description: 'Pontaj și evidență zilnică' },
  { key: 'imagini', label: 'Fotografii', description: 'Galerie foto pe grupe/clase' },
  { key: 'documente', label: 'Documente', description: 'Partajare documente' },
  { key: 'mesaje', label: 'Mesaje', description: 'Chat intern' },
  { key: 'anunturi', label: 'Anunțuri', description: 'Anunțuri și notificări' },
  { key: 'orar', label: 'Orar', description: 'Program și calendar' },
  { key: 'meniu', label: 'Meniu', description: 'Meniu zilnic' },
  { key: 'povesti', label: 'Povești', description: 'Jurnal activități' },
  { key: 'ateliere', label: 'Ateliere', description: 'Activități extra' },
  { key: 'inventar', label: 'Inventar QR', description: 'Gestionare stocuri cu QR' },
  { key: 'coada', label: 'Sistem Coadă', description: 'Ticketing și cozi' },
  { key: 'infodisplay', label: 'InfoDisplay', description: 'Afișaj digital public' },
  { key: 'sponsori', label: 'Sponsori', description: 'Gestiune sponsorizări' },
  { key: 'website', label: 'Website', description: 'Website public auto-generat' },
  { key: 'contributii', label: 'Contribuții', description: 'Taxe și plăți' },
];

export default function ModuleTogglesTab() {
  const { user } = useAuth();
  const { toggles, isEnabled, setToggle, loading } = useFeatureToggles();
  const verticalType = (user?.vertical_type || 'kids') as VerticalType;
  const defaultModules = VERTICAL_DEFINITIONS[verticalType]?.defaultModules || [];

  if (loading) return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" /> Module Active
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ALL_MODULES.map(mod => {
              const isDefault = defaultModules.includes(mod.key);
              const enabled = isEnabled(mod.key);
              return (
                <div key={mod.key} className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${enabled ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'}`}>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-foreground">{mod.label}</span>
                      {isDefault && <Badge variant="secondary" className="text-[9px] px-1">Default</Badge>}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{mod.description}</p>
                  </div>
                  <Switch checked={enabled} onCheckedChange={v => setToggle(mod.key, v)} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

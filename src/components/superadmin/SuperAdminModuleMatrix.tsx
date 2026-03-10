import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VERTICAL_DEFINITIONS, type VerticalType } from '@/config/verticalConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react';

const MODULE_KEYS = [
  'prezenta', 'imagini', 'documente', 'mesaje', 'anunturi', 'orar',
  'meniu', 'povesti', 'ateliere', 'inventar', 'coada', 'infodisplay',
  'sponsori', 'website', 'contributii',
];

const MODULE_LABELS: Record<string, string> = {
  prezenta: 'Prezență', imagini: 'Fotografii', documente: 'Documente',
  mesaje: 'Mesaje', anunturi: 'Anunțuri', orar: 'Orar',
  meniu: 'Meniu', povesti: 'Povești', ateliere: 'Ateliere',
  inventar: 'Inventar', coada: 'Coadă', infodisplay: 'Display',
  sponsori: 'Sponsori', website: 'Website', contributii: 'Contribuții',
};

export default function SuperAdminModuleMatrix() {
  const { data: orgs, isLoading } = useQuery({
    queryKey: ['sa-module-matrix'],
    queryFn: async () => {
      const { data: organizations } = await supabase
        .from('organizations')
        .select('id, name, vertical_type')
        .order('name');
      return organizations || [];
    },
  });

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;

  return (
    <Card className="overflow-x-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Matricea Module × Organizații</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2 sticky left-0 bg-background z-10 min-w-[120px]">Modul</th>
              {(orgs || []).map(org => (
                <th key={org.id} className="p-2 text-center min-w-[80px]">
                  <div className="truncate max-w-[80px]" title={org.name}>
                    {org.name.split(' ').slice(0, 2).join(' ')}
                  </div>
                  <Badge variant="outline" className="text-[8px] mt-0.5">{org.vertical_type}</Badge>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULE_KEYS.map(modKey => (
              <tr key={modKey} className="border-b last:border-0">
                <td className="p-2 font-medium sticky left-0 bg-background z-10">{MODULE_LABELS[modKey]}</td>
                {(orgs || []).map(org => {
                  const vDef = VERTICAL_DEFINITIONS[org.vertical_type as VerticalType];
                  const isDefault = vDef?.defaultModules?.includes(modKey);
                  const isAvailable = isDefault; // Simplified — in production would check modules_config
                  return (
                    <td key={org.id} className="p-2 text-center">
                      {isAvailable ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                      ) : (
                        <MinusCircle className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

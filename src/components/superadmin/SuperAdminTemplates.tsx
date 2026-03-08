import { VERTICAL_DEFINITIONS, type VerticalType } from '@/config/verticalConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const DEFAULT_COLORS: Record<VerticalType, { primary: string; secondary: string }> = {
  kids: { primary: '#1E3A4C', secondary: '#2D5F7A' },
  schools: { primary: '#1B5E20', secondary: '#388E3C' },
  medicine: { primary: '#0D47A1', secondary: '#1976D2' },
  living: { primary: '#4E342E', secondary: '#795548' },
  culture: { primary: '#880E4F', secondary: '#AD1457' },
  students: { primary: '#311B92', secondary: '#512DA8' },
  construction: { primary: '#E65100', secondary: '#F57C00' },
  workshops: { primary: '#263238', secondary: '#455A64' },
};

export default function SuperAdminTemplates() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Șabloanele definesc configurația implicită aplicată la crearea unei noi organizații.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {(Object.entries(VERTICAL_DEFINITIONS) as [VerticalType, typeof VERTICAL_DEFINITIONS.kids][]).map(([key, def]) => {
          const colors = DEFAULT_COLORS[key];
          return (
            <Card key={key}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                    style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                  >
                    {def.icon}
                  </div>
                  <div>
                    <CardTitle className="text-sm">{def.label}</CardTitle>
                    <p className="text-[10px] text-muted-foreground">{def.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Module implicite</p>
                  <div className="flex flex-wrap gap-1">
                    {def.defaultModules.map(m => (
                      <Badge key={m} variant="secondary" className="text-[10px]">{m}</Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Entitate</p>
                    <p>{def.entityLabel} / {def.entityLabelPlural}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Membru</p>
                    <p>{def.memberLabel} / {def.memberLabelPlural}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Staff</p>
                    <p>{def.staffLabel} / {def.staffLabelPlural}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Culori</p>
                    <div className="flex gap-1 mt-0.5">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.primary }} />
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.secondary }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

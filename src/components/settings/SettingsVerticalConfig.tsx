import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Wrench, Save } from 'lucide-react';
import { toast } from 'sonner';
import { getOrgConfigByKey, upsertOrgConfig } from '@/api/orgConfig';
import type { VerticalType } from '@/config/verticalConfig';

interface Props {
  orgId: string;
  verticalType: VerticalType;
}

// Define vertical-specific fields
const VERTICAL_FIELDS: Record<VerticalType, { key: string; label: string; type: 'text' | 'number' | 'boolean' }[]> = {
  kids: [
    { key: 'daily_contribution_rate', label: 'Contribuție zilnică (lei)', type: 'number' },
    { key: 'meal_types', label: 'Tipuri mese (mic_dejun,pranz,gustare)', type: 'text' },
    { key: 'age_groups', label: 'Grupe de vârstă (3-4,4-5,5-6)', type: 'text' },
  ],
  schools: [
    { key: 'timetable_periods', label: 'Număr ore pe zi', type: 'number' },
    { key: 'grading_system', label: 'Sistem notare (1-10 / calificative)', type: 'text' },
    { key: 'magazine_enabled', label: 'Revista școlii activă', type: 'boolean' },
  ],
  medicine: [
    { key: 'specialties', label: 'Specialități (dental,derma,general)', type: 'text' },
    { key: 'service_list_enabled', label: 'Listă servicii cu prețuri', type: 'boolean' },
    { key: 'avg_consultation_minutes', label: 'Durată medie consultație (min)', type: 'number' },
  ],
  living: [
    { key: 'apartments_count', label: 'Număr apartamente', type: 'number' },
    { key: 'expense_categories', label: 'Categorii cheltuieli (întreținere,reparații,fond)', type: 'text' },
    { key: 'monthly_report_enabled', label: 'Raport lunar automat', type: 'boolean' },
  ],
  culture: [
    { key: 'shows_per_week', label: 'Spectacole pe săptămână', type: 'number' },
    { key: 'surtitle_languages', label: 'Limbi supratitrare (ro,en,fr)', type: 'text' },
    { key: 'sponsors_on_display', label: 'Sponsori pe display', type: 'boolean' },
  ],
  students: [
    { key: 'faculties', label: 'Facultăți (nume separate cu virgulă)', type: 'text' },
    { key: 'secretariat_windows', label: 'Ghișee secretariat', type: 'number' },
    { key: 'queue_enabled', label: 'Sistem coadă activ', type: 'boolean' },
  ],
  construction: [
    { key: 'active_sites_max', label: 'Șantiere active maxim', type: 'number' },
    { key: 'team_count', label: 'Număr echipe', type: 'number' },
    { key: 'budget_tracking', label: 'Urmărire buget activă', type: 'boolean' },
    { key: 'ssm_daily_required', label: 'SSM zilnic obligatoriu', type: 'boolean' },
  ],
  workshops: [
    { key: 'workshop_type', label: 'Tip (reparatii/dezmembrari/ambele)', type: 'text' },
    { key: 'part_categories', label: 'Categorii piese (motor,caroserie,electrice)', type: 'text' },
    { key: 'client_portal', label: 'Portal client activ', type: 'boolean' },
  ],
};

export default function SettingsVerticalConfig({ orgId, verticalType }: Props) {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const fields = VERTICAL_FIELDS[verticalType] || [];

  useEffect(() => {
    getOrgConfigByKey(orgId, 'vertical_config').then(val => {
      if (val) setConfig(val);
    }).catch(() => {});
  }, [orgId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertOrgConfig(orgId, 'vertical_config', config);
      toast.success('Configurare verticală salvată!');
    } catch (e: any) {
      toast.error(e.message || 'Eroare');
    }
    setSaving(false);
  };

  if (fields.length === 0) return null;

  const verticalLabels: Record<string, string> = {
    kids: 'Grădinițe', schools: 'Școli', medicine: 'Medicină',
    living: 'Rezidențial', culture: 'Cultură', students: 'Universități',
    construction: 'Construcții', workshops: 'Service Auto',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Wrench className="h-4 w-4" /> Configurare {verticalLabels[verticalType]}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Setări specifice pentru verticala <strong>{verticalLabels[verticalType]}</strong>.
        </p>

        {fields.map(field => (
          <div key={field.key}>
            {field.type === 'boolean' ? (
              <div className="flex items-center justify-between py-1">
                <Label className="text-sm">{field.label}</Label>
                <Switch
                  checked={config[field.key] ?? false}
                  onCheckedChange={v => setConfig(prev => ({ ...prev, [field.key]: v }))}
                />
              </div>
            ) : (
              <div>
                <Label>{field.label}</Label>
                <Input
                  type={field.type}
                  value={config[field.key] ?? ''}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value,
                  }))}
                />
              </div>
            )}
          </div>
        ))}

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" /> {saving ? 'Se salvează...' : 'Salvează'}
        </Button>
      </CardContent>
    </Card>
  );
}

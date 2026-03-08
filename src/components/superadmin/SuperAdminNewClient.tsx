import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VERTICAL_DEFINITIONS, type VerticalType } from '@/config/verticalConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from 'lucide-react';

const SEED_TEMPLATES: Record<VerticalType, { groups: { nume: string; slug: string; tip: string }[]; vertical_config: Record<string, any> }> = {
  kids: {
    groups: [
      { nume: 'Grupa Mică', slug: 'grupa-mica', tip: 'gradinita' },
      { nume: 'Grupa Mijlocie', slug: 'grupa-mijlocie', tip: 'gradinita' },
      { nume: 'Grupa Mare', slug: 'grupa-mare', tip: 'gradinita' },
    ],
    vertical_config: { daily_contribution_rate: 17, meal_types: 'mic_dejun,pranz,gustare', age_groups: '3-4,4-5,5-6' },
  },
  schools: {
    groups: [
      { nume: 'Clasa a V-a A', slug: '5a', tip: 'scoala' },
      { nume: 'Clasa a VI-a B', slug: '6b', tip: 'scoala' },
    ],
    vertical_config: { timetable_periods: 7, grading_system: '1-10', magazine_enabled: true },
  },
  medicine: {
    groups: [{ nume: 'Cabinet General', slug: 'general', tip: 'scoala' }],
    vertical_config: { specialties: 'general', service_list_enabled: true, avg_consultation_minutes: 30 },
  },
  living: {
    groups: [{ nume: 'Scara A', slug: 'scara-a', tip: 'scoala' }],
    vertical_config: { apartments_count: 40, expense_categories: 'intretinere,reparatii,fond_rulment' },
  },
  culture: {
    groups: [{ nume: 'Sala Mare', slug: 'sala-mare', tip: 'scoala' }],
    vertical_config: { shows_per_week: 5, surtitle_languages: 'ro,en,fr' },
  },
  students: {
    groups: [{ nume: 'Facultatea de Informatică', slug: 'info', tip: 'scoala' }],
    vertical_config: { faculties: 'Informatică', secretariat_windows: 4, queue_enabled: true },
  },
  construction: {
    groups: [{ nume: 'Șantier Central', slug: 'santier-central', tip: 'scoala' }],
    vertical_config: { active_sites_max: 5, team_count: 8, budget_tracking: true, ssm_daily_required: true },
  },
  workshops: {
    groups: [
      { nume: 'Mecanică', slug: 'mecanica', tip: 'scoala' },
      { nume: 'Electrică', slug: 'electrica', tip: 'scoala' },
    ],
    vertical_config: { workshop_type: 'ambele', part_categories: 'motor,caroserie,electrice,transmisie' },
  },
};

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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ăâ]/g, 'a').replace(/[îï]/g, 'i').replace(/[șş]/g, 's').replace(/[țţ]/g, 't')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface SuperAdminNewClientProps {
  preFilledVertical?: VerticalType | null;
  onPreFillConsumed?: () => void;
}

export default function SuperAdminNewClient({ preFilledVertical, onPreFillConsumed }: SuperAdminNewClientProps) {
  const [step, setStep] = useState(0);
  const [creating, setCreating] = useState(false);
  const [createdOrg, setCreatedOrg] = useState<{ id: string; slug: string } | null>(null);

  const [vertical, setVertical] = useState<VerticalType | null>(null);
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [orgAddress, setOrgAddress] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#1E3A4C');
  const [secondaryColor, setSecondaryColor] = useState('#2D5F7A');
  const [activeModules, setActiveModules] = useState<string[]>([]);
  const [groups, setGroups] = useState<{ nume: string; slug: string; tip: string }[]>([]);

  const allModules = [
    'prezenta', 'imagini', 'documente', 'povesti', 'ateliere', 'meniu',
    'mesaje', 'orar', 'anunturi', 'video', 'social', 'inventar',
    'rapoarte', 'coada', 'ssm', 'supratitrare', 'revista',
  ];

  // Handle pre-fill from templates tab
  useEffect(() => {
    if (preFilledVertical) {
      selectVertical(preFilledVertical);
      onPreFillConsumed?.();
    }
  }, [preFilledVertical]);

  function selectVertical(v: VerticalType) {
    setVertical(v);
    const def = VERTICAL_DEFINITIONS[v];
    const tmpl = SEED_TEMPLATES[v];
    const colors = DEFAULT_COLORS[v];
    setActiveModules([...def.defaultModules]);
    setGroups([...tmpl.groups]);
    setPrimaryColor(colors.primary);
    setSecondaryColor(colors.secondary);
    setStep(1);
  }

  async function handleCreate() {
    if (!vertical || !orgName.trim()) return;
    setCreating(true);

    try {
      const slug = orgSlug || slugify(orgName);

      const { data: org, error: orgErr } = await supabase
        .from('organizations')
        .insert({
          name: orgName.trim(),
          slug,
          vertical_type: vertical,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          address: orgAddress,
        })
        .select()
        .single();

      if (orgErr) throw orgErr;

      for (const g of groups) {
        await supabase.from('groups').insert({ ...g, organization_id: org.id });
      }

      const tmpl = SEED_TEMPLATES[vertical];
      await supabase.from('org_config').insert({
        organization_id: org.id,
        config_key: 'vertical_config',
        config_value: tmpl.vertical_config,
      });

      await supabase.from('org_config').insert({
        organization_id: org.id,
        config_key: 'display_settings',
        config_value: { slide_duration: 8, ticker_speed: 30, show_menu: vertical === 'kids', show_schedule: true, show_qr: true },
      });

      for (const mod of activeModules) {
        await supabase.from('modules_config').insert({
          organization_id: org.id,
          module_key: mod,
          is_active: true,
        });
      }

      await supabase.from('announcements').insert({
        organization_id: org.id,
        titlu: `Bine ați venit la ${orgName}!`,
        continut: `Organizație ${VERTICAL_DEFINITIONS[vertical].label} configurată cu succes.`,
        prioritate: 'normal',
        target: 'scoala',
        autor_nume: 'Sistem',
      });

      setCreatedOrg({ id: org.id, slug });
      toast.success(`Organizația "${orgName}" a fost creată cu succes!`);
    } catch (err: any) {
      toast.error(err.message || 'Eroare la crearea organizației');
    } finally {
      setCreating(false);
    }
  }

  if (createdOrg) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="py-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold">Organizație creată! ✅</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Login: <code className="bg-muted px-2 py-0.5 rounded">/login/{createdOrg.slug}</code></p>
            <p>Display: <code className="bg-muted px-2 py-0.5 rounded">/display/{createdOrg.slug}</code></p>
            <p>QR Portal: <code className="bg-muted px-2 py-0.5 rounded">/qr/{createdOrg.slug}</code></p>
          </div>
          <Button onClick={() => { setCreatedOrg(null); setStep(0); setOrgName(''); setOrgSlug(''); }}>
            Creează altă organizație
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {['Vertical', 'Detalii', 'Branding', 'Module', 'Grupe', 'Creare'].map((label, i) => (
          <div key={label} className="flex items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>{i + 1}</div>
            <span className="text-xs text-muted-foreground hidden sm:inline">{label}</span>
            {i < 5 && <div className="w-4 h-px bg-border hidden sm:block" />}
          </div>
        ))}
      </div>

      {/* Step 0: Select Vertical */}
      {step === 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.entries(VERTICAL_DEFINITIONS) as [VerticalType, typeof VERTICAL_DEFINITIONS.kids][]).map(([key, def]) => (
            <Card
              key={key}
              className={`cursor-pointer hover:shadow-md transition-all ${vertical === key ? 'ring-2 ring-primary' : ''}`}
              onClick={() => selectVertical(key)}
            >
              <CardContent className="py-4 text-center space-y-1">
                <div className="text-2xl">{def.icon}</div>
                <p className="font-semibold text-sm">{def.label}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{def.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Step 1: Org Details */}
      {step === 1 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Detalii organizație</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nume organizație *</Label>
              <Input
                value={orgName}
                onChange={e => { setOrgName(e.target.value); setOrgSlug(slugify(e.target.value)); }}
                placeholder="ex: Grădinița Fluturași"
              />
            </div>
            <div>
              <Label>Slug (URL)</Label>
              <Input value={orgSlug} onChange={e => setOrgSlug(e.target.value)} placeholder="fluturasi" />
              <p className="text-xs text-muted-foreground mt-1">Va fi folosit în URL: /login/{orgSlug || 'slug'}</p>
            </div>
            <div>
              <Label>Adresă</Label>
              <Input value={orgAddress} onChange={e => setOrgAddress(e.target.value)} placeholder="Str. Exemplu Nr. 1, București" />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}><ArrowLeft className="h-4 w-4 mr-1" /> Înapoi</Button>
              <Button onClick={() => setStep(2)} disabled={!orgName.trim()}>Continuă <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Branding */}
      {step === 2 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Branding</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Culoare primară</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded border cursor-pointer" />
                  <Input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="flex-1" />
                </div>
              </div>
              <div>
                <Label>Culoare secundară</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-10 h-10 rounded border cursor-pointer" />
                  <Input value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="flex-1" />
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
              <p className="text-white font-bold text-sm">{orgName || 'Preview organizație'}</p>
              <p className="text-white/70 text-xs">{vertical && VERTICAL_DEFINITIONS[vertical].label}</p>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4 mr-1" /> Înapoi</Button>
              <Button onClick={() => setStep(3)}>Continuă <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Modules */}
      {step === 3 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Module active</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {allModules.map(mod => (
                <label key={mod} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer text-sm">
                  <Checkbox
                    checked={activeModules.includes(mod)}
                    onCheckedChange={(checked) => {
                      setActiveModules(prev => checked ? [...prev, mod] : prev.filter(m => m !== mod));
                    }}
                  />
                  {mod}
                </label>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4 mr-1" /> Înapoi</Button>
              <Button onClick={() => setStep(4)}>Continuă <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Groups */}
      {step === 4 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Grupe inițiale</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {groups.map((g, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={g.nume}
                  onChange={e => {
                    const next = [...groups];
                    next[i] = { ...g, nume: e.target.value, slug: slugify(e.target.value) };
                    setGroups(next);
                  }}
                  placeholder="Nume grupă"
                  className="flex-1"
                />
                <Badge variant="secondary" className="text-[10px] shrink-0">{g.slug}</Badge>
                <Button variant="ghost" size="icon" onClick={() => setGroups(groups.filter((_, j) => j !== i))}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGroups([...groups, { nume: '', slug: '', tip: vertical ? VERTICAL_DEFINITIONS[vertical].groupTypeDefault : 'scoala' }])}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Adaugă grupă
            </Button>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}><ArrowLeft className="h-4 w-4 mr-1" /> Înapoi</Button>
              <Button onClick={() => setStep(5)}>Continuă <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Review & Create */}
      {step === 5 && vertical && (
        <Card>
          <CardHeader><CardTitle className="text-base">Confirmare & Creare</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Vertical</p>
                <p className="font-medium">{VERTICAL_DEFINITIONS[vertical].icon} {VERTICAL_DEFINITIONS[vertical].label}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Nume</p>
                <p className="font-medium">{orgName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Slug</p>
                <p className="font-medium">/{orgSlug}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Adresă</p>
                <p className="font-medium">{orgAddress || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Culori</p>
                <div className="flex gap-1">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: primaryColor }} />
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: secondaryColor }} />
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Module ({activeModules.length})</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {activeModules.slice(0, 6).map(m => <Badge key={m} variant="secondary" className="text-[10px]">{m}</Badge>)}
                  {activeModules.length > 6 && <Badge variant="secondary" className="text-[10px]">+{activeModules.length - 6}</Badge>}
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Grupe ({groups.length})</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {groups.map((g, i) => <Badge key={i} variant="outline" className="text-[10px]">{g.nume}</Badge>)}
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep(4)}><ArrowLeft className="h-4 w-4 mr-1" /> Înapoi</Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? 'Se creează...' : '🚀 Creează organizația'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

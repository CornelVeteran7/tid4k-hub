import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VERTICAL_DEFINITIONS, type VerticalType } from '@/config/verticalConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, Upload, Monitor, User, Users } from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────
const HW_DISPLAY_EUR = 320; // total display kit
const INKY_EUR = 100;
const HW_LIFE = 36; // months amortization

const SEED_TEMPLATES: Record<VerticalType, { groups: { nume: string; slug: string; tip: string }[]; vertical_config: Record<string, unknown> }> = {
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

const f = (n: number, d = 0) => n.toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// ─── User row for bulk add ───────────────────────────────────
interface UserRow {
  name: string;
  email: string;
  role: string;
}

// ─── Steps ───────────────────────────────────────────────────
const STEPS = ['Vertical', 'Detalii', 'Branding', 'Module', 'Grupe', 'Hardware', 'Utilizatori', 'Preț', 'Creare'];

interface SuperAdminNewClientProps {
  preFilledVertical?: VerticalType | null;
  onPreFillConsumed?: () => void;
}

export default function SuperAdminNewClient({ preFilledVertical, onPreFillConsumed }: SuperAdminNewClientProps) {
  const [step, setStep] = useState(0);
  const [creating, setCreating] = useState(false);
  const [createdOrg, setCreatedOrg] = useState<{ id: string; slug: string } | null>(null);

  // Step 0: Vertical
  const [vertical, setVertical] = useState<VerticalType | null>(null);

  // Step 1: Org details
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [orgAddress, setOrgAddress] = useState('');

  // Step 2: Branding
  const [primaryColor, setPrimaryColor] = useState('#1E3A4C');
  const [secondaryColor, setSecondaryColor] = useState('#2D5F7A');

  // Step 3: Modules
  const [activeModules, setActiveModules] = useState<string[]>([]);

  // Step 4: Groups
  const [groups, setGroups] = useState<{ nume: string; slug: string; tip: string }[]>([]);

  // Step 5: Hardware
  const [numDisplays, setNumDisplays] = useState(1);
  const [numInky, setNumInky] = useState(0);
  const [hwOwned, setHwOwned] = useState(true);

  // Step 6: Users (bulk)
  const [users, setUsers] = useState<UserRow[]>([
    { name: '', email: '', role: 'director' },
  ]);
  const [csvInput, setCsvInput] = useState('');

  // Step 7: Pricing (auto-calculated)
  const [minPrice, setMinPrice] = useState(1000);
  const [eurRate] = useState(4.97);
  const [taxPercent] = useState(35);
  const [marginPercent] = useState(25);
  const [fleetSize] = useState(30);

  const allModules = [
    'prezenta', 'imagini', 'documente', 'povesti', 'ateliere', 'meniu',
    'mesaje', 'orar', 'anunturi', 'video', 'social', 'inventar',
    'rapoarte', 'coada', 'ssm', 'supratitrare', 'revista', 'sondaje',
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
    // Set sensible defaults per vertical
    setNumInky(v === 'kids' ? groups.length : 0);
    setStep(1);
  }

  // ─── Pricing calculation ───────────────────────────────────
  const pricing = (() => {
    const fixShareEUR = 4500 / Math.max(fleetSize, 1); // approximate fixed costs / fleet
    const hwDspMonth = hwOwned ? (HW_DISPLAY_EUR * numDisplays) / HW_LIFE : 0;
    const hwInkMonth = hwOwned ? (INKY_EUR * numInky) / HW_LIFE : 0;
    const totalCostEUR = fixShareEUR + hwDspMonth + hwInkMonth;
    const totalCostRON = totalCostEUR * eurRate;
    const calculatedSub = totalCostEUR * (1 + taxPercent / 100) * (1 + marginPercent / 100) * eurRate;
    const subRON = Math.max(minPrice, calculatedSub);
    const hwUpfrontEUR = hwOwned ? (HW_DISPLAY_EUR * numDisplays + INKY_EUR * numInky) : 0;
    const extraDisplayRON = Math.max(0, numDisplays - 1) * (HW_DISPLAY_EUR / HW_LIFE) * (1 + taxPercent / 100) * (1 + marginPercent / 100) * eurRate;
    const inkyAddonRON = numInky * (INKY_EUR / HW_LIFE) * (1 + taxPercent / 100) * (1 + marginPercent / 100) * eurRate;

    return { totalCostEUR, totalCostRON, subRON, hwUpfrontEUR, extraDisplayRON, inkyAddonRON, hwDspMonth, hwInkMonth };
  })();

  // ─── CSV import ────────────────────────────────────────────
  function handleCsvImport() {
    if (!csvInput.trim()) return;
    const lines = csvInput.trim().split('\n');
    const parsed: UserRow[] = [];
    for (const line of lines) {
      const parts = line.split(/[,;\t]/).map(s => s.trim());
      if (parts.length >= 2) {
        parsed.push({
          name: parts[0],
          email: parts[1],
          role: parts[2] || 'parinte',
        });
      }
    }
    if (parsed.length > 0) {
      setUsers(prev => [...prev, ...parsed]);
      setCsvInput('');
      toast.success(`${parsed.length} utilizatori importați`);
    }
  }

  // ─── Create organization ───────────────────────────────────
  async function handleCreate() {
    if (!vertical || !orgName.trim()) return;
    setCreating(true);

    try {
      const slug = orgSlug || slugify(orgName);

      // 1. Create organization
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

      // 2. Create groups
      for (const g of groups) {
        await supabase.from('groups').insert({ ...g, organization_id: org.id });
      }

      // 3. Vertical config
      const tmpl = SEED_TEMPLATES[vertical];
      await supabase.from('org_config').insert({
        organization_id: org.id,
        config_key: 'vertical_config',
        config_value: tmpl.vertical_config as Record<string, string | number | boolean>,
      });

      // 4. Display settings
      await supabase.from('org_config').insert({
        organization_id: org.id,
        config_key: 'display_settings',
        config_value: { slide_duration: 8, ticker_speed: 30, show_menu: vertical === 'kids', show_schedule: true, show_qr: true },
      });

      // 5. Hardware config
      await supabase.from('org_config').insert({
        organization_id: org.id,
        config_key: 'hardware_config',
        config_value: { displays: numDisplays, inky_devices: numInky, hw_owned: hwOwned, hw_upfront_eur: pricing.hwUpfrontEUR },
      });

      // 6. Pricing config
      await supabase.from('org_config').insert({
        organization_id: org.id,
        config_key: 'pricing',
        config_value: { subscription_ron: pricing.subRON, min_price: minPrice, displays: numDisplays, inky: numInky },
      });

      // 7. Active modules
      for (const mod of activeModules) {
        await supabase.from('modules_config').insert({
          organization_id: org.id,
          module_key: mod,
          is_active: true,
        });
      }

      // 8. Register display devices
      for (let i = 0; i < numDisplays; i++) {
        await supabase.from('display_devices').insert({
          organization_id: org.id,
          alias: numDisplays === 1 ? 'Display Principal' : `Display ${i + 1}`,
          status: 'unknown',
        });
      }

      // 9. Welcome announcement
      await supabase.from('announcements').insert({
        organization_id: org.id,
        titlu: `Bine ați venit la ${orgName}!`,
        continut: `Organizație ${VERTICAL_DEFINITIONS[vertical].label} configurată cu succes.`,
        prioritate: 'normal',
        target: 'scoala',
        autor_nume: 'Sistem',
      });

      setCreatedOrg({ id: org.id, slug });

      // Summary of what we created
      const userCount = users.filter(u => u.name && u.email).length;
      toast.success(
        `"${orgName}" creată cu ${groups.length} grupe, ${numDisplays} display(uri), ${activeModules.length} module` +
        (userCount > 0 ? ` și ${userCount} utilizatori pregătiți` : '')
      );
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Eroare la crearea organizației');
    } finally {
      setCreating(false);
    }
  }

  // ─── Success screen ───────────────────────────────────────
  if (createdOrg) {
    const userCount = users.filter(u => u.name && u.email).length;
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
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded bg-muted">
              <div className="text-lg font-bold">{groups.length}</div>
              <div className="text-[10px] text-muted-foreground">Grupe</div>
            </div>
            <div className="p-2 rounded bg-muted">
              <div className="text-lg font-bold">{numDisplays}</div>
              <div className="text-[10px] text-muted-foreground">Display-uri</div>
            </div>
            <div className="p-2 rounded bg-muted">
              <div className="text-lg font-bold">{userCount}</div>
              <div className="text-[10px] text-muted-foreground">Utilizatori</div>
            </div>
          </div>
          <div className="p-3 rounded-md bg-primary/5 border">
            <div className="text-sm font-medium">Abonament lunar: <strong className="text-primary">{f(pricing.subRON)} lei</strong></div>
            {pricing.hwUpfrontEUR > 0 && (
              <div className="text-xs text-muted-foreground">HW upfront: {f(pricing.hwUpfrontEUR)} EUR ({f(pricing.hwUpfrontEUR * eurRate)} lei)</div>
            )}
          </div>
          <Button onClick={() => { setCreatedOrg(null); setStep(0); setOrgName(''); setOrgSlug(''); setUsers([{ name: '', email: '', role: 'director' }]); }}>
            Creează altă organizație
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ─── Wizard ────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-1 shrink-0">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                i < step ? 'bg-green-500 text-white' : i === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {i < step ? <Check className="h-3 w-3" /> : i + 1}
            </div>
            <span className="text-[9px] text-muted-foreground hidden md:inline">{label}</span>
            {i < STEPS.length - 1 && <div className="w-3 h-px bg-border" />}
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
              <Input value={orgName} onChange={e => { setOrgName(e.target.value); setOrgSlug(slugify(e.target.value)); }} placeholder="ex: Grădinița Fluturași" />
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

      {/* Step 5: Hardware */}
      {step === 5 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Monitor className="h-4 w-4" /> Configurare Hardware</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Număr displayuri</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setNumDisplays(Math.max(0, numDisplays - 1))}>−</Button>
                  <span className="text-xl font-bold font-mono w-8 text-center">{numDisplays}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setNumDisplays(Math.min(10, numDisplays + 1))}>+</Button>
                </div>
                <p className="text-[9px] text-muted-foreground mt-1">{HW_DISPLAY_EUR} EUR/buc ({f(HW_DISPLAY_EUR * eurRate)} lei)</p>
              </div>
              <div>
                <Label>Număr Inky (roboți)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setNumInky(Math.max(0, numInky - 1))}>−</Button>
                  <span className="text-xl font-bold font-mono w-8 text-center">{numInky}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setNumInky(Math.min(30, numInky + 1))}>+</Button>
                </div>
                <p className="text-[9px] text-muted-foreground mt-1">{INKY_EUR} EUR/buc ({f(INKY_EUR * eurRate)} lei)</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant={hwOwned ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => setHwOwned(true)}>HW al nostru</Button>
              <Button variant={!hwOwned ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => setHwOwned(false)}>HW al clientului</Button>
            </div>

            {hwOwned && (numDisplays > 0 || numInky > 0) && (
              <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20">
                <div className="text-xs font-medium text-amber-600 dark:text-amber-400">Cost hardware upfront:</div>
                <div className="text-sm font-bold font-mono">{f(pricing.hwUpfrontEUR)} EUR = {f(pricing.hwUpfrontEUR * eurRate)} lei</div>
                <div className="text-[9px] text-muted-foreground">Amortizat pe {HW_LIFE} luni = {(pricing.hwDspMonth + pricing.hwInkMonth).toFixed(2)} EUR/lună</div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(4)}><ArrowLeft className="h-4 w-4 mr-1" /> Înapoi</Button>
              <Button onClick={() => setStep(6)}>Continuă <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 6: Users */}
      {step === 6 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Utilizatori inițiali</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">Adaugă utilizatori manual sau importă din CSV. Conturile vor fi create la onboarding.</p>

            {/* Manual entries */}
            <div className="space-y-2">
              {users.map((u, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={u.name} onChange={e => { const next = [...users]; next[i] = { ...u, name: e.target.value }; setUsers(next); }} placeholder="Nume" className="flex-1" />
                  <Input value={u.email} onChange={e => { const next = [...users]; next[i] = { ...u, email: e.target.value }; setUsers(next); }} placeholder="Email" className="flex-1" />
                  <select
                    className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                    value={u.role}
                    onChange={e => { const next = [...users]; next[i] = { ...u, role: e.target.value }; setUsers(next); }}
                  >
                    <option value="director">Director</option>
                    <option value="profesor">Profesor</option>
                    <option value="parinte">Părinte</option>
                    <option value="secretara">Secretară</option>
                  </select>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setUsers(users.filter((_, j) => j !== i))} disabled={users.length === 1}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setUsers([...users, { name: '', email: '', role: 'parinte' }])}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Adaugă utilizator
              </Button>
            </div>

            {/* CSV import */}
            <div className="border-t pt-3 space-y-2">
              <Label className="flex items-center gap-1 text-xs"><Upload className="h-3 w-3" /> Import CSV</Label>
              <Textarea
                value={csvInput}
                onChange={e => setCsvInput(e.target.value)}
                placeholder={"Nume, Email, Rol (un utilizator per linie)\nIon Popescu, ion@email.com, profesor\nMaria Ionescu, maria@email.com, parinte"}
                rows={4}
                className="text-xs font-mono"
              />
              <Button variant="secondary" size="sm" onClick={handleCsvImport} disabled={!csvInput.trim()}>
                <Upload className="h-3 w-3 mr-1" /> Importă
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                <User className="h-3 w-3 mr-1" /> {users.filter(u => u.name && u.email).length} utilizatori valizi
              </Badge>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(5)}><ArrowLeft className="h-4 w-4 mr-1" /> Înapoi</Button>
              <Button onClick={() => setStep(7)}>Continuă <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 7: Pricing */}
      {step === 7 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Calcul preț automat</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Preț minim abonament (RON/lună, incl. 1 display)</Label>
              <Input type="number" value={minPrice} onChange={e => setMinPrice(Number(e.target.value))} className="mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-md bg-destructive/5 border border-destructive/20">
                <div className="text-[9px] text-muted-foreground uppercase">Cost intern</div>
                <div className="text-sm font-bold font-mono text-destructive">{f(pricing.totalCostRON)} lei</div>
                <div className="text-[9px] text-muted-foreground">{pricing.totalCostEUR.toFixed(2)} EUR</div>
              </div>
              <div className="p-3 rounded-md bg-primary/5 border border-primary/20">
                <div className="text-[9px] text-muted-foreground uppercase">Abonament sugerat</div>
                <div className="text-sm font-bold font-mono text-primary">{f(pricing.subRON)} lei/lună</div>
                <div className="text-[9px] text-muted-foreground">
                  {pricing.subRON > minPrice ? 'Calculat (cost+taxe+marjă)' : `Minim ${f(minPrice)} lei`}
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="text-xs space-y-1 border-t pt-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Bază software (incl. 1 display)</span><span className="font-mono">{f(minPrice)} lei</span></div>
              {numDisplays > 1 && (
                <div className="flex justify-between"><span className="text-muted-foreground">+ {numDisplays - 1} display(uri) extra</span><span className="font-mono text-amber-500">+{f(pricing.extraDisplayRON)} lei</span></div>
              )}
              {numInky > 0 && (
                <div className="flex justify-between"><span className="text-muted-foreground">+ {numInky} Inky add-on</span><span className="font-mono text-violet-500">+{f(pricing.inkyAddonRON)} lei</span></div>
              )}
              <div className="flex justify-between font-bold border-t pt-1"><span>Total abonament</span><span className="font-mono text-primary">{f(pricing.subRON)} lei/lună</span></div>
            </div>

            {pricing.hwUpfrontEUR > 0 && (
              <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-xs">
                <strong>HW upfront:</strong> {f(pricing.hwUpfrontEUR)} EUR = {f(pricing.hwUpfrontEUR * eurRate)} lei (plătit la instalare)
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(6)}><ArrowLeft className="h-4 w-4 mr-1" /> Înapoi</Button>
              <Button onClick={() => setStep(8)}>Continuă <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 8: Review & Create */}
      {step === 8 && vertical && (
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
              <div>
                <p className="text-muted-foreground">Grupe ({groups.length})</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {groups.map((g, i) => <Badge key={i} variant="outline" className="text-[10px]">{g.nume}</Badge>)}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Hardware</p>
                <p className="font-medium">{numDisplays} display, {numInky} Inky {hwOwned ? '(al nostru)' : '(al clientului)'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Utilizatori</p>
                <p className="font-medium">{users.filter(u => u.name && u.email).length} pregătiți</p>
              </div>
              <div>
                <p className="text-muted-foreground">Abonament</p>
                <p className="font-bold text-primary">{f(pricing.subRON)} lei/lună</p>
              </div>
            </div>

            {pricing.hwUpfrontEUR > 0 && (
              <div className="p-2 rounded bg-amber-500/10 text-xs">
                HW upfront: <strong>{f(pricing.hwUpfrontEUR)} EUR = {f(pricing.hwUpfrontEUR * eurRate)} lei</strong>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep(7)}><ArrowLeft className="h-4 w-4 mr-1" /> Înapoi</Button>
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

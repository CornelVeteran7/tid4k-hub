import { useState } from 'react';
import { Palette, Type, Layout, Megaphone, SidebarIcon, Flower2, RotateCcw, Save } from 'lucide-react';
import { useModuleConfig, DEFAULT_MODULE_CONFIG, type ModuleKey, type ModuleSettings } from '@/config/moduleConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const BRAND_COLORS = [
  { name: 'Primary (Bec Navy)', token: '--primary', hsl: '200 42% 21%', hex: '#1E3A4C', usage: 'Butoane, ticker anunțuri, accente principale, linii fundal topografic' },
  { name: 'Sidebar Background', token: '--sidebar-background', hsl: '200 45% 16%', hex: '#162D3B', usage: 'Meniu lateral, contrast profund' },
  { name: 'Sidebar Accent', token: '--sidebar-accent', hsl: '200 38% 22%', hex: '#233F51', usage: 'Element activ în sidebar' },
  { name: 'Accent Blue', token: '--accent', hsl: '210 80% 32%', hex: '#104F8C', usage: 'Link-uri, gradiente accent' },
  { name: 'Background', token: '--background', hsl: '210 30% 97%', hex: '#F4F6F8', usage: 'Fundal pagini, carduri' },
  { name: 'Success Green', token: '--success', hsl: '145 63% 42%', hex: '#27AE60', usage: 'Prezență confirmată, acțiuni pozitive' },
  { name: 'Warning Gold', token: '--warning', hsl: '37 90% 51%', hex: '#F39C12', usage: 'Atenționări, badge-uri' },
  { name: 'Destructive Red', token: '--destructive', hsl: '1 66% 46%', hex: '#C0392B', usage: 'Ștergeri, erori, urgențe' },
];

function ColorSwatch({ hex, name, token, usage }: { hex: string; name: string; token?: string; usage: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-10 h-10 rounded-lg border border-border shadow-sm shrink-0" style={{ backgroundColor: hex }} />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">
          {hex} {token && <span className="opacity-60">· {token}</span>}
        </p>
        <p className="text-xs text-muted-foreground/80">{usage}</p>
      </div>
    </div>
  );
}

const MODULE_KEYS: ModuleKey[] = ['prezenta', 'imagini', 'documente', 'povesti', 'ateliere', 'meniu', 'mesaje'];

function ModuleEditor() {
  const { config, updateModule, resetConfig } = useModuleConfig();
  const [draft, setDraft] = useState<Record<ModuleKey, ModuleSettings>>(() => ({ ...config }));
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: ModuleKey, field: keyof ModuleSettings, value: string) => {
    setDraft(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    for (const key of MODULE_KEYS) {
      const d = draft[key];
      const c = config[key];
      if (d.color !== c.color || d.title !== c.title || d.subtitle !== c.subtitle) {
        updateModule(key, d);
      }
    }
    setHasChanges(false);
    toast({ title: 'Salvat!', description: 'Culorile și textele modulelor au fost actualizate.' });
  };

  const handleReset = () => {
    resetConfig();
    setDraft({ ...DEFAULT_MODULE_CONFIG });
    setHasChanges(false);
    toast({ title: 'Resetat', description: 'Modulele au fost readuse la valorile implicite.' });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          Editor Module Dashboard
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Resetează
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasChanges} className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            Salvează
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Modificările se aplică pe toate școlile și grădinițele din sistem. Culorile, titlurile și subtitlurile se sincronizează între cardurile din dashboard și butoanele rapide.
      </p>

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {MODULE_KEYS.map(key => {
          const mod = draft[key];
          const isDefault = mod.color === DEFAULT_MODULE_CONFIG[key].color
            && mod.title === DEFAULT_MODULE_CONFIG[key].title
            && mod.subtitle === DEFAULT_MODULE_CONFIG[key].subtitle;

          return (
            <div key={key} className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                {/* Color picker */}
                <div className="relative shrink-0">
                  <div
                    className="w-10 h-10 rounded-lg border-2 border-border shadow-sm cursor-pointer"
                    style={{ backgroundColor: mod.color }}
                  />
                  <input
                    type="color"
                    value={mod.color}
                    onChange={e => handleChange(key, 'color', e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Alege culoare"
                  />
                </div>

                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Titlu</Label>
                    <Input
                      value={mod.title}
                      onChange={e => handleChange(key, 'title', e.target.value)}
                      className="h-8 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Subtitlu</Label>
                    <Input
                      value={mod.subtitle}
                      onChange={e => handleChange(key, 'subtitle', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                {!isDefault && (
                  <span className="text-[10px] text-primary font-medium shrink-0">Modificat</span>
                )}
              </div>

              {/* Live preview */}
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-white w-fit"
                style={{ backgroundColor: mod.color }}
              >
                <span>{mod.title}</span>
                <span className="opacity-60">·</span>
                <span className="opacity-80 font-normal">{mod.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function BrandingTab() {
  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          Ghid de Branding — TID4K
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Documentație centralizată a identității vizuale, paletei de culori și elementelor de design.
        </p>
      </div>

      {/* Interactive Module Editor */}
      <ModuleEditor />

      {/* Origin */}
      <section className="space-y-2">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Layout className="h-4 w-4 text-muted-foreground" />
          Inspirație & Origine
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Paleta principală este inspirată din estetica <strong>Bec Restaurant</strong> — un albastru navy profund 
          (<code className="bg-muted px-1 rounded text-xs">#1E3A4C</code>) care transmite profesionalism, 
          încredere și eleganță. Acest albastru este folosit consecvent în bara de anunțuri, meniul lateral, 
          butoanele principale și liniile topografice decorative din fundal.
        </p>
      </section>

      {/* Brand Colors */}
      <section className="space-y-3">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          Paleta de Culori — Sistem
        </h3>
        <div className="rounded-xl border border-border bg-card p-4 space-y-1">
          {BRAND_COLORS.map(c => (
            <ColorSwatch key={c.token} {...c} />
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-3">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Type className="h-4 w-4 text-muted-foreground" />
          Tipografie
        </h3>
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div>
            <p className="font-display text-lg font-bold text-foreground">Playfair Display</p>
            <p className="text-xs text-muted-foreground">Titluri principale, mesaje de bun venit, headere de secțiune</p>
          </div>
          <div className="border-t border-border pt-3">
            <p className="text-lg font-semibold text-foreground">Poppins</p>
            <p className="text-xs text-muted-foreground">Text general, butoane, etichete, navigare</p>
          </div>
        </div>
      </section>

      {/* Visual Elements */}
      <section className="space-y-3">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Flower2 className="h-4 w-4 text-muted-foreground" />
          Elemente Decorative
        </h3>
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground space-y-2">
          <p><strong className="text-foreground">Fundal topografic:</strong> Linii curbe organice SVG inline, stroke <code className="bg-muted px-1 rounded text-xs">#1E3A4C</code> la 9% opacitate, acoperind ecranul complet (position: fixed).</p>
          <p><strong className="text-foreground">Flori & albine:</strong> Elemente SVG decorative (margarete, lalele, clopoței, floarea-soarelui, albine) distribuite aleator în fundal pentru un aspect jucăuș.</p>
          <p><strong className="text-foreground">Carduri:</strong> Efect „liquid glass" cu backdrop-blur, border-radius 12px, transparențe subtile.</p>
          <p><strong className="text-foreground">Valuri ticker:</strong> 3 straturi SVG wave deasupra barei de anunțuri, cu opacități progresive (50%, 70%, 90%) pentru blending natural.</p>
        </div>
      </section>

      {/* Announcements Bar */}
      <section className="space-y-3">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-muted-foreground" />
          Bara de Anunțuri
        </h3>
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground space-y-2">
          <p>Culoare fond: <code className="bg-muted px-1 rounded text-xs">bg-primary/90</code> — navy Bec cu backdrop-blur.</p>
          <p>Text: alb (<code className="bg-muted px-1 rounded text-xs">--primary-foreground</code>), 13px, animație marquee.</p>
          <p>Poziționare: fixed bottom, z-50, extins sub sidebar pe desktop.</p>
        </div>
      </section>

      {/* Sidebar */}
      <section className="space-y-3">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <SidebarIcon className="h-4 w-4 text-muted-foreground" />
          Meniu Lateral (Sidebar)
        </h3>
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground space-y-2">
          <p>Fond: <code className="bg-muted px-1 rounded text-xs">#162D3B</code> — variantă mai închisă a navy-ului Bec.</p>
          <p>Element activ: <code className="bg-muted px-1 rounded text-xs">#233F51</code> cu text alb.</p>
          <p>Borduri: <code className="bg-muted px-1 rounded text-xs">hsl(200 32% 24%)</code> pentru separare subtilă.</p>
        </div>
      </section>
    </div>
  );
}

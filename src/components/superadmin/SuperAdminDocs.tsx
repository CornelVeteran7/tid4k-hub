import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Palette, Layout, Globe, BookOpen, Layers, Eye, Code, Type, Paintbrush, Monitor, MessageSquare, Calendar, CheckSquare, FileText, LogIn, Tv, QrCode, Settings, PanelLeft, Megaphone, Users, Package, BarChart3, Ticket, ShieldCheck, Subtitles, Newspaper, Camera, Star, Zap, HardHat, Wrench, Building2, Theater, Stethoscope } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { VERTICAL_DEFINITIONS, type VerticalType } from '@/config/verticalConfig';
import { DEFAULT_MODULE_CONFIG } from '@/config/moduleConfig';
import DocsTab from '@/components/admin/DocsTab';
import UserGuideTab from '@/components/admin/UserGuideTab';

/* ─── Color Swatch Component ─── */
function Swatch({ color, label, token }: { color: string; label: string; token: string }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg border border-border">
      <div className="w-10 h-10 rounded-lg shrink-0 border border-border" style={{ backgroundColor: color }} />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground font-mono truncate">{token}</p>
      </div>
    </div>
  );
}

/* ─── Section Wrapper ─── */
function DocSection({ id, title, icon: Icon, children, defaultOpen = false }: {
  id: string; title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean;
}) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group">
        <Icon className="h-4 w-4 text-primary shrink-0" />
        <span className="font-semibold text-sm text-foreground flex-1">{title}</span>
        <span className="text-xs text-muted-foreground group-data-[state=open]:rotate-90 transition-transform">▶</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-6 pr-2 pb-4 space-y-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ─── Prop Row ─── */
function PropRow({ name, type, desc, def }: { name: string; type: string; desc: string; def?: string }) {
  return (
    <tr className="border-b border-border text-xs">
      <td className="py-1.5 pr-2 font-mono text-primary font-semibold">{name}</td>
      <td className="py-1.5 pr-2 font-mono text-muted-foreground">{type}</td>
      <td className="py-1.5 pr-2 text-foreground">{desc}</td>
      {def !== undefined && <td className="py-1.5 font-mono text-muted-foreground">{def}</td>}
    </tr>
  );
}

/* ─── Mini Preview Card ─── */
function MiniModuleCard({ color, title, subtitle, textColor }: { color: string; title: string; subtitle: string; textColor?: string }) {
  const tc = textColor || '#ffffff';
  return (
    <div className="rounded-xl p-3 flex items-center gap-3 shadow-sm" style={{ backgroundColor: color }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: textColor ? `${textColor}20` : 'rgba(255,255,255,0.2)' }}>
        <Star className="h-4 w-4" style={{ color: tc }} />
      </div>
      <div className="min-w-0">
        <p className="font-display font-bold text-[10px] tracking-wide uppercase" style={{ color: tc }}>{title}</p>
        <p className="font-display text-[10px] font-semibold" style={{ color: textColor ? `${textColor}e6` : 'rgba(255,255,255,0.9)' }}>{subtitle}</p>
      </div>
    </div>
  );
}

/* ─── Vertical Theme Colors ─── */
const VERTICAL_THEME_COLORS: Record<string, { name: string; primary: string; accent: string; bg: string; desc: string }> = {
  culture: { name: '🎭 Culture — Opera Noir', primary: 'hsl(0, 55%, 35%)', accent: 'hsl(40, 60%, 45%)', bg: 'hsl(0, 0%, 6%)', desc: 'Dark theme cu crimson + gold' },
  medicine: { name: '🏥 Medicine — Clinical Clean', primary: 'hsl(200, 65%, 38%)', accent: 'hsl(170, 50%, 40%)', bg: 'hsl(200, 20%, 97%)', desc: 'Trust blue + teal pe alb' },
  construction: { name: '🏗️ Construction — Earth Industrial', primary: 'hsl(25, 30%, 30%)', accent: 'hsl(35, 60%, 45%)', bg: 'hsl(30, 10%, 95%)', desc: 'Brown + amber pe gri cald' },
  workshops: { name: '🔧 Workshops — Steel Professional', primary: 'hsl(215, 25%, 28%)', accent: 'hsl(200, 30%, 50%)', bg: 'hsl(210, 10%, 95%)', desc: 'Slate blue pe gri rece' },
};

/* ─── Searchable content registry ─── */
const SEARCH_INDEX: Record<string, string[]> = {
  design: ['color', 'palette', 'typography', 'glass', 'gradient', 'font', 'playfair', 'poppins', 'dark mode', 'spacing', 'radius', 'decorative', 'svg', 'contour', 'branding', 'theme', 'vertical', 'opera', 'clinical', 'industrial'],
  components: ['modulecard', 'banner', 'ticker', 'messages', 'schedule', 'attendance', 'documents', 'login', 'display', 'qr', 'settings', 'sidebar', 'calendar', 'menu', 'stories', 'inventory', 'reports', 'queue', 'ssm', 'surtitles', 'magazine', 'sponsor', 'inky', 'costume', 'theme editor'],
  whitelabel: ['vertical', 'multi-tenant', 'branding', 'terminology', 'rls', 'slug', 'module', 'isolation', 'costume', 'theme'],
  architecture: ['api', 'supabase', 'edge function', 'database', 'auth', 'context', 'hook', 'doc registry'],
  guides: ['admin', 'parinte', 'profesor', 'director', 'tutorial'],
};

function matchesSearch(tab: string, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return SEARCH_INDEX[tab]?.some(k => k.includes(q)) || tab.includes(q);
}

export default function SuperAdminDocs() {
  const [search, setSearch] = useState('');
  const q = search.toLowerCase();

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Caută în documentație..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs defaultValue="design" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          {matchesSearch('architecture', q) && <TabsTrigger value="architecture" className="gap-1 text-xs"><Code className="h-3 w-3" /> Arhitectură</TabsTrigger>}
          {matchesSearch('design', q) && <TabsTrigger value="design" className="gap-1 text-xs"><Palette className="h-3 w-3" /> Design System</TabsTrigger>}
          {matchesSearch('components', q) && <TabsTrigger value="components" className="gap-1 text-xs"><Layout className="h-3 w-3" /> Componente</TabsTrigger>}
          {matchesSearch('whitelabel', q) && <TabsTrigger value="whitelabel" className="gap-1 text-xs"><Globe className="h-3 w-3" /> Whitelabel</TabsTrigger>}
          {matchesSearch('guides', q) && <TabsTrigger value="guides" className="gap-1 text-xs"><BookOpen className="h-3 w-3" /> Ghiduri</TabsTrigger>}
        </TabsList>

        {/* ═══════════ TAB: ARHITECTURĂ ═══════════ */}
        <TabsContent value="architecture">
          <DocsTab />
        </TabsContent>

        {/* ═══════════ TAB: DESIGN SYSTEM ═══════════ */}
        <TabsContent value="design" className="space-y-4">
          
          {/* Color Palette */}
          <DocSection id="colors" title="Paleta de Culori (Bază)" icon={Paintbrush} defaultOpen>
            <p className="text-xs text-muted-foreground mb-3">
              Toate culorile sunt definite ca valori HSL în <code className="bg-muted px-1 rounded">index.css</code> și referite prin tokeni semantici Tailwind. Nu se folosesc culori hardcoded în componente.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <Swatch color="hsl(200, 42%, 21%)" label="Primary (Navy)" token="--primary: 200 42% 21%" />
              <Swatch color="hsl(210, 80%, 32%)" label="Accent (Blue)" token="--accent: 210 80% 32%" />
              <Swatch color="hsl(145, 63%, 42%)" label="Success (Green)" token="--success: 145 63% 42%" />
              <Swatch color="hsl(37, 90%, 51%)" label="Warning (Amber)" token="--warning: 37 90% 51%" />
              <Swatch color="hsl(1, 66%, 46%)" label="Destructive (Red)" token="--destructive: 1 66% 46%" />
              <Swatch color="hsl(200, 12%, 94%)" label="Muted" token="--muted: 200 12% 94%" />
            </div>
          </DocSection>

          {/* Vertical Themes */}
          <DocSection id="vertical-themes" title="Teme per Vertical (NOU)" icon={Palette}>
            <p className="text-xs text-muted-foreground mb-3">
              Fiecare vertical are o temă CSS dedicată, aplicată automat via <code className="bg-muted px-1 rounded">data-vertical</code> attribute pe <code className="bg-muted px-1 rounded">&lt;html&gt;</code>. Override complet al variabilelor CSS.
            </p>
            <div className="space-y-3">
              {Object.entries(VERTICAL_THEME_COLORS).map(([key, theme]) => (
                <div key={key} className="p-3 rounded-lg border border-border space-y-2">
                  <p className="text-xs font-bold text-foreground">{theme.name}</p>
                  <p className="text-[10px] text-muted-foreground">{theme.desc}</p>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded border border-border" style={{ backgroundColor: theme.primary }} />
                      <span className="text-[9px] font-mono text-muted-foreground">Primary</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded border border-border" style={{ backgroundColor: theme.accent }} />
                      <span className="text-[9px] font-mono text-muted-foreground">Accent</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded border border-border" style={{ backgroundColor: theme.bg }} />
                      <span className="text-[9px] font-mono text-muted-foreground">Background</span>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground">
                    Selector: <code className="bg-muted px-1 rounded">[data-vertical="{key}"]</code>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
              <p><strong>Flux aplicare:</strong> Login → fetchProfile() → getOrganization() → loadAndApplyBranding(org) → applyVerticalTheme(verticalType)</p>
              <p className="mt-1"><strong>Admin editor:</strong> Admin Panel → tab "Teme" — editare culori per vertical sau per organizație specifică</p>
            </div>
          </DocSection>

          {/* Typography */}
          <DocSection id="typography" title="Tipografie" icon={Type}>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-border space-y-2">
                <p className="font-display text-2xl font-bold text-foreground">Playfair Display</p>
                <p className="text-xs text-muted-foreground">Font display — headings, card titles, module names. Google Fonts.</p>
                <p className="font-display font-bold text-sm tracking-wide uppercase text-foreground">PREZENȚA — EXEMPLU CARD TITLE</p>
                <code className="text-[10px] bg-muted px-2 py-1 rounded block">font-display font-bold text-sm tracking-wide uppercase</code>
              </div>
              <div className="p-4 rounded-lg border border-border space-y-2">
                <p className="font-sans text-2xl font-semibold text-foreground">Poppins</p>
                <p className="text-xs text-muted-foreground">Font body — paragraphs, labels, UI text. <code className="bg-muted px-1 rounded">font-sans</code>.</p>
              </div>
            </div>
          </DocSection>

          {/* Glass Tokens */}
          <DocSection id="glass" title="Glass Tokens" icon={Layers}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Efect glass morphism pentru carduri și headere.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="glass-card rounded-xl p-4 space-y-2">
                  <p className="text-sm font-bold text-foreground">Glass Card Preview</p>
                  <p className="text-xs text-muted-foreground">Clasa: <code className="bg-muted/50 px-1 rounded">.glass-card</code></p>
                </div>
                <div className="glass-header rounded-xl p-4 space-y-2">
                  <p className="text-sm font-bold text-foreground">Glass Header Preview</p>
                  <p className="text-xs text-muted-foreground">Clasa: <code className="bg-muted/50 px-1 rounded">.glass-header</code></p>
                </div>
              </div>
            </div>
          </DocSection>

          {/* Dark Mode */}
          <DocSection id="dark" title="Dark Mode & Vertical Overrides" icon={Monitor}>
            <p className="text-xs text-muted-foreground mb-3">Variabilele au o versiune dark sub <code className="bg-muted px-1 rounded">.dark</code>. Vertical themes override ambele moduri (light & dark).</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-border">
                  <th className="text-left py-1.5 text-muted-foreground font-medium">Token</th>
                  <th className="text-left py-1.5 text-muted-foreground font-medium">Light</th>
                  <th className="text-left py-1.5 text-muted-foreground font-medium">Dark</th>
                </tr></thead>
                <tbody>
                  {[
                    ['--background', '210 30% 97%', '200 40% 7%'],
                    ['--foreground', '200 42% 13%', '200 10% 92%'],
                    ['--primary', '200 42% 21%', '200 42% 48%'],
                    ['--accent', '210 80% 32%', '210 70% 42%'],
                    ['--card', '0 0% 100%', '200 35% 11%'],
                    ['--muted', '200 12% 94%', '200 20% 14%'],
                    ['--border', '200 12% 88%', '200 20% 18%'],
                  ].map(([token, light, dark]) => (
                    <tr key={token} className="border-b border-border">
                      <td className="py-1.5 font-mono text-foreground">{token}</td>
                      <td className="py-1.5 font-mono text-muted-foreground">{light}</td>
                      <td className="py-1.5 font-mono text-muted-foreground">{dark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DocSection>

          {/* Per-Vertical Colors Table */}
          <DocSection id="vertical-colors" title="Culori Default per Vertical" icon={Palette}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(Object.entries(VERTICAL_DEFINITIONS) as [VerticalType, typeof VERTICAL_DEFINITIONS.kids][]).map(([key, def]) => (
                <div key={key} className="p-2 rounded-lg border border-border space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{def.icon}</span>
                    <span className="text-xs font-semibold text-foreground">{def.label}</span>
                  </div>
                  <div className="text-[9px] font-mono text-muted-foreground">
                    {key in VERTICAL_THEME_COLORS ? 'CSS theme override ✓' : 'Org branding colors'}
                  </div>
                </div>
              ))}
            </div>
          </DocSection>
        </TabsContent>

        {/* ═══════════ TAB: COMPONENTE ═══════════ */}
        <TabsContent value="components" className="space-y-4">
          
          {/* ModuleCard */}
          <DocSection id="module-card" title="ModuleCard — Card Dashboard" icon={Layout} defaultOpen>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Card-ul principal de pe dashboard. Culoare, icon, titlu Playfair, subtitle, badge contor, share button.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/components/dashboard/ModuleCard.tsx</p>
              
              <h4 className="text-xs font-bold text-foreground">Preview — 3 States</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground">Default</p>
                  <MiniModuleCard color="#E8829A" title="PREZENȚA" subtitle="Cine a venit azi" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground">Pressed (scale 0.97)</p>
                  <div className="transform scale-[0.97]">
                    <MiniModuleCard color="#a19afe" title="MESAJE" subtitle="Comunicare" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground">Edit Mode (wiggle)</p>
                  <div className="transform rotate-1 opacity-80">
                    <MiniModuleCard color="#FFC107" title="ATELIERE" subtitle="Activități creative" textColor="#1a1a1a" />
                  </div>
                </div>
              </div>

              <h4 className="text-xs font-bold text-foreground">Module Color Assignments</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(DEFAULT_MODULE_CONFIG).map(([key, cfg]) => (
                  <div key={key} className="flex items-center gap-2 p-1.5 rounded border border-border">
                    <div className="w-5 h-5 rounded shrink-0" style={{ backgroundColor: cfg.color }} />
                    <div>
                      <p className="text-[10px] font-semibold text-foreground">{cfg.title}</p>
                      <p className="text-[9px] font-mono text-muted-foreground">{cfg.color}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h4 className="text-xs font-bold text-foreground">Props</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-border">
                    <th className="text-left py-1 text-muted-foreground font-medium">Prop</th>
                    <th className="text-left py-1 text-muted-foreground font-medium">Type</th>
                    <th className="text-left py-1 text-muted-foreground font-medium">Descriere</th>
                    <th className="text-left py-1 text-muted-foreground font-medium">Default</th>
                  </tr></thead>
                  <tbody>
                    <PropRow name="icon" type="LucideIcon" desc="Iconița modulului" />
                    <PropRow name="title" type="string" desc="Titlu card (uppercase, Playfair)" />
                    <PropRow name="subtitle" type="string" desc="Subtitlu descriptiv" />
                    <PropRow name="color" type="string" desc="Background color (hex)" />
                    <PropRow name="textColor" type="string?" desc="Text color override" def="#ffffff" />
                    <PropRow name="count" type="number?" desc="Badge contor" def="—" />
                    <PropRow name="editMode" type="boolean?" desc="Mod editare (wiggle + switch)" def="false" />
                    <PropRow name="layoutId" type="string?" desc="Framer Motion layout animation ID" def="—" />
                  </tbody>
                </table>
              </div>
            </div>
          </DocSection>

          {/* Inky Assistant */}
          <DocSection id="inky" title="InkyAssistant — Costume per Vertical (NOU)" icon={Star}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Mascota Inky se adaptează la verticalul organizației prin costume diferite. Enterprise sponsors pot seta costume custom.</p>

              {/* Visual preview of Inky button */}
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="h-14 w-14 rounded-full shadow-lg border border-primary/20 flex items-center justify-center overflow-hidden bg-card shrink-0">
                  <img src="/src/assets/inky-button.png" alt="Inky" className="h-12 w-12 object-contain" />
                </div>
                <div className="text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">Buton Inky (56×56px)</p>
                  <p>Fixed bottom-right, border gradient, shadow-lg</p>
                </div>
              </div>

              <p className="text-[10px] font-mono text-muted-foreground">📁 src/components/InkyAssistant.tsx</p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-border">
                    <th className="text-left py-1.5 text-muted-foreground font-medium">Vertical</th>
                    <th className="text-left py-1.5 text-muted-foreground font-medium">Costum</th>
                    <th className="text-left py-1.5 text-muted-foreground font-medium">Asset</th>
                  </tr></thead>
                  <tbody>
                    <tr className="border-b border-border/30"><td className="py-1.5">Kids / Schools / Living / Students</td><td>Default (bufniță buton)</td><td className="font-mono text-[10px]">inky-button.png</td></tr>
                    <tr className="border-b border-border/30"><td className="py-1.5">🏥 Medicine</td><td>Halat alb + stetoscop</td><td className="font-mono text-[10px]">inky-doctor.png</td></tr>
                    <tr className="border-b border-border/30"><td className="py-1.5">🏗️ Construction</td><td>Cască galbenă + vestă reflectorizantă</td><td className="font-mono text-[10px]">inky-construction.png</td></tr>
                    <tr className="border-b border-border/30"><td className="py-1.5">🔧 Workshops</td><td>Salopetă albastră + cheie franceză</td><td className="font-mono text-[10px]">inky-mechanic.png</td></tr>
                    <tr><td className="py-1.5">🎭 Culture</td><td>Capă roșie + joben negru</td><td className="font-mono text-[10px]">inky-opera.png</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Mapare:</strong> <code className="bg-muted px-1 rounded">VERTICAL_COSTUMES</code> în InkyAssistant.tsx</p>
                <p><strong>Detectie:</strong> Citit din <code className="bg-muted px-1 rounded">user.vertical_type</code> via AuthContext</p>
                <p><strong>Override:</strong> Sponsorii Enterprise pot seta <code className="bg-muted px-1 rounded">stilInky.costume_url</code> pe campanie</p>
              </div>
            </div>
          </DocSection>

          {/* Theme Editor */}
          <DocSection id="theme-editor" title="ThemeEditorTab — Editor Teme (NOU)" icon={Paintbrush}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Admin Panel → tab "Teme". Permite editarea culorilor per vertical (preset-uri globale) și per organizație individuală (override-uri).</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/components/admin/ThemeEditorTab.tsx</p>

              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Secțiunea 1:</strong> Preset-uri per vertical — selectează vertical → editează primary/secondary → save la <code className="bg-muted px-1 rounded">org_config</code> key: <code className="bg-muted px-1 rounded">vertical_theme_{'{type}'}</code></p>
                <p><strong>Secțiunea 2:</strong> Override per organizație — culori custom → save la <code className="bg-muted px-1 rounded">org_config</code> key: <code className="bg-muted px-1 rounded">theme_override</code></p>
                <p><strong>Aplicare:</strong> <code className="bg-muted px-1 rounded">loadAndApplyBranding()</code> din <code className="bg-muted px-1 rounded">utils/branding.ts</code></p>
              </div>
            </div>
          </DocSection>

          {/* Dashboard Banner */}
          <DocSection id="banner" title="Dashboard Banner — Rezumatul Zilei" icon={BarChart3}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Banner principal cu efect liquid glass. 4 butoane stat: Prezență, Fotografii, Documente, Meniu.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/components/dashboard/ModuleHub.tsx</p>
              
              <div className="glass-card rounded-xl p-4 space-y-3">
                <p className="font-display text-sm font-bold text-foreground">👋 Bun venit, Utilizator</p>
                <div className="grid grid-cols-4 gap-2">
                  {['Prezență', 'Fotografii', 'Documente', 'Meniu'].map(label => (
                    <div key={label} className="stat-pill justify-center text-center">
                      <span className="text-[10px]">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DocSection>

          {/* Announcements Ticker */}
          <DocSection id="ticker" title="AnnouncementsTicker — Bandă Scrollabilă" icon={Megaphone}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Bară fixă în partea de jos. CSS marquee animation, content triplicat. Integrează promo-uri sponsor.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/components/dashboard/AnnouncementsTicker.tsx</p>
            </div>
          </DocSection>

          {/* Messages */}
          <DocSection id="messages" title="Messages — Split Pane" icon={MessageSquare}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Split-pane: conversații (stânga) + chat (dreapta). Realtime via Supabase channels. Responsive — mobil: un ecran la un moment.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/pages/Messages.tsx</p>
            </div>
          </DocSection>

          {/* Schedule */}
          <DocSection id="schedule" title="Schedule Grid — Orar" icon={Calendar}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Tabel Zi × Oră cu celule color-coded. Editare inline, QR per profesor/sală. Print.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/pages/Schedule.tsx</p>
            </div>
          </DocSection>

          {/* Construction */}
          <DocSection id="construction" title="Construction Dashboard — Șantiere" icon={HardHat}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Management complet construcții: site-uri, echipe, task-uri (kanban), costuri, asignări săptămânale. Temă earth industrial.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/pages/ConstructionDashboard.tsx (1273 linii)</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>5 taburi:</strong> Site-uri, Echipe, Task-uri, Costuri, Asignări</p>
                <p><strong>Worker view:</strong> Interfață simplificată mobil (<code className="bg-muted px-1 rounded">ConstructionWorker.tsx</code>)</p>
              </div>
            </div>
          </DocSection>

          {/* Culture */}
          <DocSection id="culture" title="Culture — Spectacole & Supratitrare" icon={Theater}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Management spectacole teatru/operă cu dark theme opera noir. Cast, sponsori, supratitrare live multi-limbă.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/pages/CultureShowEditor.tsx, Surtitles.tsx, SurtitleOperator.tsx</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Public:</strong> /program/:showId (program digital), /surtitle/view/:showId (audiență)</p>
                <p><strong>Backstage:</strong> /surtitle/operate/:showId (operator console, keyboard shortcuts)</p>
              </div>
            </div>
          </DocSection>

          {/* Medicine */}
          <DocSection id="medicine" title="Medicine — Cabinet Medical" icon={Stethoscope}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Profiluri doctori, servicii medicale, sistem coadă, temă clinical clean.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/pages/MedicineAdmin.tsx, QueueAdmin.tsx, QueueTicket.tsx</p>
            </div>
          </DocSection>

          {/* Workshop */}
          <DocSection id="workshop" title="Workshop — Service Auto" icon={Wrench}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Vehicule, programări, clienți. Temă steel professional.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/pages/WorkshopDashboard.tsx</p>
            </div>
          </DocSection>

          {/* Living */}
          <DocSection id="living" title="Living — Rezidențial" icon={Building2}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Apartamente, cheltuieli lunare, entități administrative, tracking plăți.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/pages/LivingDashboard.tsx</p>
            </div>
          </DocSection>

          {/* Other sections */}
          <DocSection id="other-components" title="Alte componente" icon={Package}>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p><strong>Inventory</strong> (src/pages/Inventory.tsx) — CRUD articole, QR, mișcări stoc</p>
              <p><strong>SSM</strong> (src/pages/SSM.tsx) — Checklist-uri securitate, template-uri, semnătură</p>
              <p><strong>Magazine</strong> (src/pages/Magazine.tsx) — Revistă digitală, workflow editorial, cluburi</p>
              <p><strong>Stories</strong> (src/pages/Stories.tsx) — Povești copii, audio, video, favorites</p>
              <p><strong>Contributions</strong> (src/pages/Contributions.tsx) — Contribuții lunare bazate pe prezență</p>
              <p><strong>Video Generation</strong> (src/pages/VideoGeneration.tsx) — Template-uri video pentru social</p>
              <p><strong>Social Media</strong> — Facebook (postări) + WhatsApp (mapări grupuri)</p>
              <p><strong>Public Display</strong> (src/pages/PublicDisplay.tsx, 1348 linii) — Slideshow TV fullscreen</p>
              <p><strong>QR Portal</strong> (src/pages/QRCancelarie.tsx, 781 linii) — Portal acces tiered per vertical</p>
            </div>
          </DocSection>
        </TabsContent>

        {/* ═══════════ TAB: WHITELABEL ═══════════ */}
        <TabsContent value="whitelabel" className="space-y-4">
          
          <DocSection id="wl-overview" title="Arhitectura Multi-Tenant" icon={Globe} defaultOpen>
            <div className="space-y-3 text-xs text-muted-foreground">
              <p>Platforma folosește un singur codebase care servește <strong>8 verticale</strong>. Fiecare organizație are un <code className="bg-muted px-1 rounded">vertical_type</code> care determină:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Ce module sunt vizibile pe dashboard și sidebar</li>
                <li>Terminologia UI (Grupă vs. Clasă vs. Cabinet)</li>
                <li><strong>Tema vizuală</strong> — CSS variables override per vertical (culture=dark opera, medicine=clean, etc.)</li>
                <li><strong>Costumul Inky</strong> — mascota se adaptează automat (doctor, muncitor, mecanic, etc.)</li>
                <li>Configurația verticală specifică (daily_rate, timetable_periods, etc.)</li>
              </ul>
            </div>
          </DocSection>

          <DocSection id="wl-verticals" title="Cele 8 Verticale" icon={Layers}>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">Vertical</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Entitate</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Membru</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Staff</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Temă</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Inky</th>
                  </tr>
                </thead>
                <tbody>
                  {(Object.entries(VERTICAL_DEFINITIONS) as [VerticalType, typeof VERTICAL_DEFINITIONS.kids][]).map(([key, def]) => {
                    const theme = VERTICAL_THEME_COLORS[key];
                    const costumes: Record<string, string> = {
                      medicine: '🩺 Doctor', construction: '👷 Muncitor', workshops: '🔧 Mecanic', culture: '🎩 Operă'
                    };
                    return (
                      <tr key={key} className="border-b border-border">
                        <td className="py-2 font-semibold text-foreground">{def.icon} {def.label}</td>
                        <td className="py-2 text-foreground">{def.entityLabel}</td>
                        <td className="py-2 text-foreground">{def.memberLabel}</td>
                        <td className="py-2 text-foreground">{def.staffLabel}</td>
                        <td className="py-2">{theme ? <Badge variant="secondary" className="text-[8px]">{theme.desc}</Badge> : <span className="text-muted-foreground">Default</span>}</td>
                        <td className="py-2">{costumes[key] || 'Default'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </DocSection>

          <DocSection id="wl-theming" title="Sistem de Tematizare (NOU)" icon={Paintbrush}>
            <div className="space-y-3 text-xs text-muted-foreground">
              <p>Trei nivele de tematizare, aplicate în cascadă:</p>
              <div className="p-3 rounded-lg bg-muted/50 font-mono text-[10px] space-y-1">
                <p className="font-bold text-foreground">Nivel 1: Tema de bază (index.css :root)</p>
                <p className="pl-4">Variabile CSS default — navy + blue palette</p>
                <p className="font-bold text-foreground mt-2">Nivel 2: Tema per vertical (index.css [data-vertical="X"])</p>
                <p className="pl-4">Override complet al variabilelor CSS</p>
                <p className="pl-4">Culture: dark noir, Medicine: clinical, Construction: earth, Workshops: steel</p>
                <p className="font-bold text-foreground mt-2">Nivel 3: Branding per organizație (inline CSS)</p>
                <p className="pl-4">applyBrandingColors(primaryHex, secondaryHex) → CSS custom properties</p>
                <p className="pl-4">Salvat în: organizations.primary_color + secondary_color</p>
              </div>
              <p><strong>Admin editor:</strong> Admin Panel → tab "Teme" (<code className="bg-muted px-1 rounded">ThemeEditorTab.tsx</code>)</p>
              <p><strong>Doc markdown:</strong> <code className="bg-muted px-1 rounded">docs/THEMING.md</code></p>
            </div>
          </DocSection>

          <DocSection id="wl-branding" title="Branding Cascade" icon={Paintbrush}>
            <div className="space-y-3 text-xs text-muted-foreground">
              <p>Fluxul de branding la nivel de organizație:</p>
              <div className="p-3 rounded-lg bg-muted/50 font-mono text-[10px] space-y-1">
                <p>1. organizations.primary_color + secondary_color (hex)</p>
                <p>2. → loadAndApplyBranding(org) din utils/branding.ts</p>
                <p>3. → applyBrandingColors(primaryHex, secondaryHex)</p>
                <p>4. → hexToHsl() conversie → document.documentElement.style.setProperty()</p>
                <p>5. → applyVerticalTheme(verticalType) → data-vertical attribute pe html</p>
                <p>6. → Actualizare CSS custom properties: --primary, --accent, --sidebar, etc.</p>
                <p>7. → Tailwind classes (bg-primary, text-accent) se actualizează automat</p>
              </div>
            </div>
          </DocSection>

          <DocSection id="wl-modules" title="Module Toggle Flow" icon={Eye}>
            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="p-3 rounded-lg bg-muted/50 font-mono text-[10px] space-y-1">
                <p>1. modules_config table (organization_id, module_key, is_active)</p>
                <p>2. → useActiveModules() hook (src/hooks/useActiveModules.ts)</p>
                <p>3. → Filtrare SECONDARY_NAV items din AppLayout sidebar</p>
                <p>4. → Filtrare module cards din ModuleHub dashboard</p>
                <p>5. → Route protection (redirect dacă modul inactiv)</p>
              </div>
            </div>
          </DocSection>

          <DocSection id="wl-isolation" title="Izolarea Organizațiilor (RLS)" icon={ShieldCheck}>
            <div className="space-y-3 text-xs text-muted-foreground">
              <p>Row Level Security asigură că fiecare organizație vede doar propriile date:</p>
              <div className="p-3 rounded-lg bg-muted/50 font-mono text-[10px] space-y-1">
                <p>-- Funcție helper</p>
                <p>user_org_match(org_id uuid) → boolean</p>
                <p>  → profiles.organization_id = org_id</p>
                <p>  → WHERE auth.uid() = profiles.id</p>
                <p></p>
                <p>-- Policy exemplu pe orice tabel</p>
                <p>CREATE POLICY "org_isolation" ON public.announcements</p>
                <p>  USING (user_org_match(organization_id))</p>
              </div>
              <p className="mt-2"><strong>Excepții:</strong> Utilizatorii cu status <code className="bg-muted px-1 rounded">inky</code> bypass RLS pentru acces cross-org (superadmin).</p>
            </div>
          </DocSection>

          <DocSection id="wl-slugs" title="Sistem de Slug-uri" icon={Globe}>
            <div className="space-y-3 text-xs text-muted-foreground">
              <p>Fiecare organizație are un slug unic folosit în URL-uri publice:</p>
              <div className="space-y-1 font-mono text-[10px]">
                <p className="p-1.5 bg-muted rounded">/login/<span className="text-primary font-bold">:slug</span> — Autentificare branded</p>
                <p className="p-1.5 bg-muted rounded">/display/<span className="text-primary font-bold">:slug</span> — Infodisplay public</p>
                <p className="p-1.5 bg-muted rounded">/qr/<span className="text-primary font-bold">:slug</span> — Portal QR cancelarie</p>
                <p className="p-1.5 bg-muted rounded">/site/<span className="text-primary font-bold">:slug</span> — Website public auto-generat</p>
                <p className="p-1.5 bg-muted rounded">/queue/<span className="text-primary font-bold">:slug</span> — Tichet coadă public</p>
                <p className="p-1.5 bg-muted rounded">/surtitle/<span className="text-primary font-bold">:slug</span> — Supratitrare audiență</p>
              </div>
            </div>
          </DocSection>

          <DocSection id="wl-docs" title="Documentație Auto-Actualizabilă (NOU)" icon={BookOpen}>
            <div className="space-y-3 text-xs text-muted-foreground">
              <p>Documentația markdown din <code className="bg-muted px-1 rounded">docs/</code> se actualizează automat prin registrul din <code className="bg-muted px-1 rounded">docs/DOC_REGISTRY.md</code>.</p>
              <div className="space-y-1 font-mono text-[10px]">
                <p className="p-1.5 bg-muted rounded">APP_OVERVIEW.md — Arhitectură, tech stack, verticals</p>
                <p className="p-1.5 bg-muted rounded">PAGES.md — Toate paginile cu rute și features</p>
                <p className="p-1.5 bg-muted rounded">API.md — Toate funcțiile API cu semnături</p>
                <p className="p-1.5 bg-muted rounded">HOOKS.md — Hook-uri custom + context hooks</p>
                <p className="p-1.5 bg-muted rounded">CONTEXTS.md — Provider tree + detalii contexte</p>
                <p className="p-1.5 bg-muted rounded">TYPES.md — Interfețe TypeScript</p>
                <p className="p-1.5 bg-muted rounded">ROLES.md — Sistem roluri + matrice acces</p>
                <p className="p-1.5 bg-muted rounded">THEMING.md — Sistem teme + Inky costumes</p>
                <p className="p-1.5 bg-muted rounded">GUEST_ACCESS.md — Token-uri QR, sesiuni guest</p>
                <p className="p-1.5 bg-muted rounded">DATABASE.md — Schema bază de date</p>
              </div>
              <p className="mt-2"><strong>Utilitar:</strong> <code className="bg-muted px-1 rounded">src/utils/docRegistry.ts</code> — <code className="bg-muted px-1 rounded">getAffectedDocs(filePath)</code> returnează ce docs trebuie actualizate când un fișier se modifică.</p>
            </div>
          </DocSection>
        </TabsContent>

        {/* ═══════════ TAB: GHIDURI ═══════════ */}
        <TabsContent value="guides">
          <UserGuideTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

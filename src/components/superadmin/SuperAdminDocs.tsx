import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Palette, Layout, Globe, BookOpen, Layers, Eye, Code, Type, Paintbrush, Monitor, MessageSquare, Calendar, CheckSquare, FileText, LogIn, Tv, QrCode, Settings, PanelLeft, Megaphone, Users, Package, BarChart3, Ticket, ShieldCheck, Subtitles, Newspaper, Camera, Star, Zap } from 'lucide-react';
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

/* ─── Vertical Colors Table ─── */
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

/* ─── Searchable content registry ─── */
const SEARCH_INDEX: Record<string, string[]> = {
  design: ['color', 'palette', 'typography', 'glass', 'gradient', 'font', 'playfair', 'poppins', 'dark mode', 'spacing', 'radius', 'decorative', 'svg', 'contour', 'branding'],
  components: ['modulecard', 'banner', 'ticker', 'messages', 'schedule', 'attendance', 'documents', 'login', 'display', 'qr', 'settings', 'sidebar', 'calendar', 'menu', 'stories', 'inventory', 'reports', 'queue', 'ssm', 'surtitles', 'magazine', 'sponsor'],
  whitelabel: ['vertical', 'multi-tenant', 'branding', 'terminology', 'rls', 'slug', 'module', 'isolation'],
  architecture: ['api', 'supabase', 'edge function', 'database', 'auth', 'context'],
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
          <DocSection id="colors" title="Paleta de Culori" icon={Paintbrush} defaultOpen>
            <p className="text-xs text-muted-foreground mb-3">
              Toate culorile sunt definite ca valori HSL în <code className="bg-muted px-1 rounded">index.css</code> și referite prin tokeni semantici Tailwind.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <Swatch color="hsl(200, 42%, 21%)" label="Primary (Navy)" token="--primary: 200 42% 21%" />
              <Swatch color="hsl(210, 80%, 32%)" label="Accent (Blue)" token="--accent: 210 80% 32%" />
              <Swatch color="hsl(145, 63%, 42%)" label="Success (Green)" token="--success: 145 63% 42%" />
              <Swatch color="hsl(37, 90%, 51%)" label="Warning (Amber)" token="--warning: 37 90% 51%" />
              <Swatch color="hsl(1, 66%, 46%)" label="Destructive (Red)" token="--destructive: 1 66% 46%" />
              <Swatch color="hsl(200, 12%, 94%)" label="Muted" token="--muted: 200 12% 94%" />
              <Swatch color="hsl(200, 18%, 92%)" label="Secondary" token="--secondary: 200 18% 92%" />
              <Swatch color="hsl(200, 12%, 88%)" label="Border" token="--border: 200 12% 88%" />
            </div>

            <h4 className="text-xs font-bold text-foreground mt-4 mb-2">Sidebar</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <Swatch color="hsl(200, 42%, 21%)" label="Sidebar BG" token="--sidebar-background: 200 42% 21%" />
              <Swatch color="hsl(210, 80%, 32%)" label="Sidebar Accent" token="--sidebar-accent: 210 80% 32%" />
              <Swatch color="hsl(200, 35%, 28%)" label="Sidebar Border" token="--sidebar-border: 200 35% 28%" />
            </div>
          </DocSection>

          {/* Typography */}
          <DocSection id="typography" title="Tipografie" icon={Type}>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-border space-y-2">
                <p className="font-display text-2xl font-bold text-foreground">Playfair Display</p>
                <p className="text-xs text-muted-foreground">Font display — headings, card titles, module names. Loaded from Google Fonts.</p>
                <p className="font-display font-bold text-sm tracking-wide uppercase text-foreground">PREZENȚA — EXEMPLU CARD TITLE</p>
                <code className="text-[10px] bg-muted px-2 py-1 rounded block">font-display font-bold text-sm tracking-wide uppercase</code>
              </div>
              <div className="p-4 rounded-lg border border-border space-y-2">
                <p className="font-sans text-2xl font-semibold text-foreground">Poppins</p>
                <p className="text-xs text-muted-foreground">Font body — paragraphs, labels, UI text. Applied via <code className="bg-muted px-1 rounded">font-sans</code>.</p>
                <p className="text-sm text-foreground">Acesta este un exemplu de text body cu fontul Poppins.</p>
              </div>
              <div className="p-4 rounded-lg border border-border space-y-2">
                <p className="font-mono text-lg text-foreground">Monospace</p>
                <p className="text-xs text-muted-foreground">Used in ticker, code snippets, and technical labels.</p>
                <div className="bg-muted p-2 rounded font-mono text-xs text-foreground">📢 Anunț important — afișaj ticker scroll</div>
              </div>
            </div>
          </DocSection>

          {/* Glass Tokens */}
          <DocSection id="glass" title="Glass Tokens" icon={Layers}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Sistemul de design folosește efect glass morphism pentru carduri și headere.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="glass-card rounded-xl p-4 space-y-2">
                  <p className="text-sm font-bold text-foreground">Glass Card Preview</p>
                  <p className="text-xs text-muted-foreground">Clasa: <code className="bg-muted/50 px-1 rounded">.glass-card</code></p>
                  <div className="text-[10px] font-mono text-muted-foreground space-y-0.5">
                    <p>--glass-bg: 0 0% 100% / 0.65</p>
                    <p>--glass-border: 200 18% 90% / 0.5</p>
                    <p>--glass-blur: 16px</p>
                  </div>
                </div>
                <div className="glass-header rounded-xl p-4 space-y-2">
                  <p className="text-sm font-bold text-foreground">Glass Header Preview</p>
                  <p className="text-xs text-muted-foreground">Clasa: <code className="bg-muted/50 px-1 rounded">.glass-header</code></p>
                  <p className="text-[10px] font-mono text-muted-foreground">blur(20px) saturate(1.4)</p>
                </div>
              </div>
            </div>
          </DocSection>

          {/* Gradients */}
          <DocSection id="gradients" title="Gradienți" icon={Paintbrush}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl p-4 text-white" style={{ background: 'linear-gradient(135deg, hsl(200, 42%, 21%), hsl(210, 80%, 32%))' }}>
                <p className="text-xs font-bold">gradient-primary</p>
                <p className="text-[10px] opacity-70">Navy → Accent Blue</p>
                <code className="text-[9px] opacity-60 block mt-1">--gradient-primary</code>
              </div>
              <div className="rounded-xl p-4 text-foreground border border-border" style={{ background: 'linear-gradient(135deg, hsl(37, 90%, 51%, 0.15), hsl(1, 66%, 46%, 0.08))' }}>
                <p className="text-xs font-bold">gradient-warm</p>
                <p className="text-[10px] text-muted-foreground">Amber → Red (subtle)</p>
                <code className="text-[9px] text-muted-foreground block mt-1">--gradient-warm</code>
              </div>
              <div className="rounded-xl p-4 text-foreground border border-border" style={{ background: 'linear-gradient(135deg, hsl(200, 42%, 21%, 0.08), hsl(145, 63%, 42%, 0.06))' }}>
                <p className="text-xs font-bold">gradient-cool</p>
                <p className="text-[10px] text-muted-foreground">Navy → Green (subtle)</p>
                <code className="text-[9px] text-muted-foreground block mt-1">--gradient-cool</code>
              </div>
            </div>
          </DocSection>

          {/* Spacing & Radius */}
          <DocSection id="spacing" title="Spacing & Radius" icon={Layout}>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-border">
                <p className="text-xs font-bold text-foreground">Border Radius</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-12 h-12 bg-primary rounded-[0.75rem]" />
                  <code className="text-[10px] text-muted-foreground font-mono">--radius: 0.75rem</code>
                </div>
              </div>
              <div className="p-3 rounded-lg border border-border">
                <p className="text-xs font-bold text-foreground">Card Min Heights</p>
                <div className="text-[10px] text-muted-foreground space-y-1 mt-2 font-mono">
                  <p>Mobile: min-h-[72px]</p>
                  <p>Desktop: lg:min-h-[80px]</p>
                </div>
              </div>
            </div>
          </DocSection>

          {/* Dark Mode */}
          <DocSection id="dark" title="Dark Mode" icon={Monitor}>
            <p className="text-xs text-muted-foreground mb-3">Toate variabilele au o versiune dark sub selectorul <code className="bg-muted px-1 rounded">.dark</code>.</p>
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
                    ['--destructive', '1 66% 46%', '1 60% 40%'],
                    ['--success', '145 63% 42%', '145 55% 35%'],
                    ['--warning', '37 90% 51%', '37 80% 45%'],
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

          {/* Decorative Elements */}
          <DocSection id="decorative" title="Elemente Decorative" icon={Paintbrush}>
            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="p-3 rounded-lg border border-border space-y-2">
                <p className="font-bold text-foreground">SVG Contour Lines</p>
                <p>Background-uri procedurale inline SVG cu topographic contour lines. Două instanțe rotative:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>Main background:</strong> opacity 0.08, stroke-width 1, animate-slow-rotate (90s)</li>
                  <li><strong>Sidebar background:</strong> opacity 0.45, stroke-width 1.5, alb pe fundal navy</li>
                </ul>
              </div>
              <div className="p-3 rounded-lg border border-border space-y-2">
                <p className="font-bold text-foreground">Flower & Bee Line Art</p>
                <p>Decorații inline SVG în sidebar — flori stilizate și albine. Coloare albă, opacity ridicată (0.45) pentru contrast pe fundal #162D3B.</p>
              </div>
              <div className="p-3 rounded-lg border border-border space-y-2">
                <p className="font-bold text-foreground">Hover & Tap Effects</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Desktop hover: translateY(-1px), shadow 0 4px 12px</li>
                  <li>Desktop active: translateY(0) scale(0.98)</li>
                  <li>Cards: translateY(-2px), shadow 0 8px 24px</li>
                  <li>Mobile tap: scale(0.97) via framer-motion whileTap</li>
                </ul>
              </div>
            </div>
          </DocSection>

          {/* Per-Vertical Colors */}
          <DocSection id="vertical-colors" title="Culori per Vertical" icon={Palette}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(Object.entries(DEFAULT_COLORS) as [VerticalType, { primary: string; secondary: string }][]).map(([key, c]) => (
                <div key={key} className="p-2 rounded-lg border border-border space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{VERTICAL_DEFINITIONS[key].icon}</span>
                    <span className="text-xs font-semibold text-foreground">{VERTICAL_DEFINITIONS[key].label}</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="flex-1 h-6 rounded" style={{ backgroundColor: c.primary }} />
                    <div className="flex-1 h-6 rounded" style={{ backgroundColor: c.secondary }} />
                  </div>
                  <div className="text-[9px] font-mono text-muted-foreground">
                    {c.primary} / {c.secondary}
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
              <p className="text-xs text-muted-foreground">Card-ul principal de pe dashboard. Fiecare modul are un card cu culoare, icon, titlu (Playfair), subtitle, badge contor și share button.</p>
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
                    <PropRow name="showShare" type="boolean?" desc="Arată buton Share" def="false" />
                    <PropRow name="editMode" type="boolean?" desc="Mod editare (wiggle + switch)" def="false" />
                    <PropRow name="visible" type="boolean?" desc="Vizibilitate în edit mode" def="true" />
                    <PropRow name="preview" type="ReactNode?" desc="Conținut preview sub card" def="—" />
                    <PropRow name="layoutId" type="string?" desc="Framer Motion layout animation ID" def="—" />
                  </tbody>
                </table>
              </div>
            </div>
          </DocSection>

          {/* Dashboard Banner */}
          <DocSection id="banner" title="Dashboard Banner — Rezumatul Zilei" icon={BarChart3}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Banner principal cu efect liquid glass. Conține 4 butoane stat: Prezență, Fotografii, Documente, Meniu.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/components/dashboard/ModuleHub.tsx</p>
              
              <div className="glass-card rounded-xl p-4 space-y-3">
                <p className="font-display text-sm font-bold text-foreground">👋 Bun venit, Utilizator</p>
                <p className="text-xs text-muted-foreground">Rezumatul zilei</p>
                <div className="grid grid-cols-4 gap-2">
                  {['Prezență', 'Fotografii', 'Documente', 'Meniu'].map(label => (
                    <div key={label} className="stat-pill justify-center text-center">
                      <span className="text-[10px]">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <h4 className="text-xs font-bold text-foreground">Meal Slot Logic</h4>
              <div className="text-xs text-muted-foreground space-y-1 font-mono">
                <p>Mic dejun → ora &lt; 09:00</p>
                <p>Gustare 1 → ora &lt; 10:30</p>
                <p>Prânz → ora &lt; 13:00</p>
                <p>Gustare 2 → ora ≥ 13:01</p>
              </div>
            </div>
          </DocSection>

          {/* Announcements Ticker */}
          <DocSection id="ticker" title="AnnouncementsTicker — Bandă Scrollabilă" icon={Megaphone}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Bandă fixă în partea de jos a ecranului. Scrollare continuă CSS-only. Content triplicat pentru bucla infinită.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/components/dashboard/AnnouncementsTicker.tsx</p>

              <div className="rounded-lg overflow-hidden border border-border">
                <div className="bg-accent text-accent-foreground px-4 py-2 overflow-hidden">
                  <div className="animate-marquee whitespace-nowrap text-xs font-mono">
                    📢 Anunț 1 — Reuniunea părinților marți la 17:00 &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; 🎉 Anunț 2 — Spectacol de Crăciun &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; 📢 Anunț 1 — Reuniunea părinților marți la 17:00
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Animație:</strong> CSS <code className="bg-muted px-1 rounded">@keyframes display-ticker</code></p>
                <p><strong>Durată:</strong> 30s default, scalat cu nr. anunțuri</p>
                <p><strong>Content:</strong> Triplicat (×3) pentru seamless loop</p>
                <p><strong>Translate:</strong> <code className="bg-muted px-1 rounded">translate3d(-33.333%, 0, 0)</code></p>
                <p><strong>Hover:</strong> animation-play-state: paused</p>
              </div>
            </div>
          </DocSection>

          {/* Messages */}
          <DocSection id="messages" title="Messages — Split Pane" icon={MessageSquare}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Layout split-pane: lista conversații (stânga) + view chat (dreapta). Responsive — pe mobil, un ecran la un moment dat.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/pages/Messages.tsx</p>

              <div className="grid grid-cols-3 gap-2 rounded-lg border border-border overflow-hidden h-32">
                <div className="border-r border-border p-2 space-y-1.5">
                  {['Ana P.', 'Mihai D.', 'Elena R.'].map(name => (
                    <div key={name} className="flex items-center gap-1.5 p-1 rounded hover:bg-muted/50 cursor-pointer">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">{name[0]}</div>
                      <span className="text-[10px] text-foreground">{name}</span>
                    </div>
                  ))}
                </div>
                <div className="col-span-2 p-2 flex flex-col justify-end gap-1.5">
                  <div className="bg-muted px-2 py-1 rounded-lg rounded-tl-none text-[10px] text-foreground self-start max-w-[80%]">Bună! Cum a fost azi?</div>
                  <div className="bg-primary text-primary-foreground px-2 py-1 rounded-lg rounded-tr-none text-[10px] self-end max-w-[80%]">A fost super! 😊</div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Avatar:</strong> Inițiala numelui pe fundal colorat (primar/20)</p>
                <p><strong>Bubbles:</strong> Sender = bg-primary, Receiver = bg-muted</p>
                <p><strong>Timestamp:</strong> Relativ (acum 5 min) sau absolut (14:30)</p>
              </div>
            </div>
          </DocSection>

          {/* Schedule */}
          <DocSection id="schedule" title="Schedule Grid — Orar" icon={Calendar}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Tabel Zi × Oră cu celule color-coded. Suportă editare inline și QR per profesor.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/pages/Schedule.tsx</p>

              <div className="overflow-x-auto">
                <table className="w-full text-[10px] border border-border rounded">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-1.5 border-r border-border text-muted-foreground">Ora</th>
                      {['Luni', 'Marți', 'Miercuri'].map(d => (
                        <th key={d} className="p-1.5 border-r border-border text-foreground font-medium">{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {['08:00', '09:00', '10:00'].map((ora, i) => (
                      <tr key={ora} className="border-t border-border">
                        <td className="p-1.5 border-r border-border text-muted-foreground font-mono">{ora}</td>
                        <td className="p-1.5 border-r border-border rounded-sm" style={{ backgroundColor: ['#E8829A22', '#3498DB22', '#2ECC7122'][i] }}>
                          <span className="text-foreground font-medium">{['Matematică', 'Română', 'Engleză'][i]}</span>
                        </td>
                        <td className="p-1.5 border-r border-border rounded-sm" style={{ backgroundColor: ['#9B59B622', '#FFC10722', '#FF8C4222'][i] }}>
                          <span className="text-foreground font-medium">{['Fizică', 'Istorie', 'Sport'][i]}</span>
                        </td>
                        <td className="p-1.5 border-r border-border text-muted-foreground">—</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </DocSection>

          {/* Attendance */}
          <DocSection id="attendance" title="Attendance Table — Prezență" icon={CheckSquare}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Grid săptămânal cu checkbox-uri. Header galben cu contor prezență. View lunar cu statistici.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/pages/Attendance.tsx</p>

              <div className="rounded-lg border border-border overflow-hidden">
                <div className="p-2 text-[10px] font-bold text-foreground" style={{ backgroundColor: '#FFC10730' }}>
                  📋 Prezență — 18/22 copii prezenți
                </div>
                <table className="w-full text-[10px]">
                  <thead><tr className="bg-muted">
                    <th className="p-1.5 text-left text-muted-foreground">Nume</th>
                    {['L', 'Ma', 'Mi', 'J', 'V'].map(d => <th key={d} className="p-1.5 text-center text-muted-foreground">{d}</th>)}
                  </tr></thead>
                  <tbody>
                    {['Andrei P.', 'Maria C.'].map(name => (
                      <tr key={name} className="border-t border-border">
                        <td className="p-1.5 text-foreground">{name}</td>
                        {[true, true, false, true, true].map((v, i) => (
                          <td key={i} className="p-1.5 text-center">
                            {v ? <span className="text-success">✓</span> : <span className="text-destructive">✗</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </DocSection>

          {/* Documents */}
          <DocSection id="documents" title="Document Gallery — Documente" icon={FileText}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Galerie cu filtre pe categorii, thumbnail grid și zonă drag-drop pentru upload.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/pages/Documents.tsx</p>

              <div className="space-y-2">
                <div className="flex gap-1.5">
                  {['Toate', 'Rapoarte', 'Formulare', 'Fotografii'].map(cat => (
                    <Badge key={cat} variant={cat === 'Toate' ? 'default' : 'secondary'} className="text-[10px] cursor-pointer">{cat}</Badge>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {['Raport trim.pdf', 'Fișă med.pdf', 'Foto grup.jpg', 'Contract.pdf'].map(name => (
                    <div key={name} className="p-2 rounded-lg border border-border text-center space-y-1">
                      <div className="w-full h-10 bg-muted rounded flex items-center justify-center">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-[9px] text-foreground truncate">{name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DocSection>

          {/* Login Page */}
          <DocSection id="login" title="Login Page — Pagina de Autentificare" icon={LogIn}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Pagină branded cu logo organizație, gradient background din culorile primare. URL: <code className="bg-muted px-1 rounded">/login/:orgSlug</code></p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/pages/Login.tsx</p>

              <div className="rounded-xl overflow-hidden border border-border h-40 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(200, 42%, 21%), hsl(210, 80%, 32%))' }}>
                <div className="bg-white/90 rounded-xl p-4 w-48 space-y-2 text-center">
                  <div className="w-8 h-8 rounded-full bg-primary/20 mx-auto" />
                  <p className="text-xs font-bold text-foreground">Grădinița Fluturași</p>
                  <div className="h-5 bg-muted rounded" />
                  <div className="h-5 bg-muted rounded" />
                  <div className="h-5 bg-primary rounded" />
                </div>
              </div>
            </div>
          </DocSection>

          {/* Public Display */}
          <DocSection id="display" title="Public Display — Infodisplay" icon={Tv}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Slideshow fullscreen pentru ecrane TV. CSS-only animations. URL: <code className="bg-muted px-1 rounded">/display/:orgSlug</code></p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/pages/PublicDisplay.tsx + src/pages/Infodisplay.tsx</p>

              <div className="rounded-xl border border-border overflow-hidden h-36 bg-foreground relative flex items-center justify-center">
                <p className="text-background text-xs font-bold">🖥️ Slideshow Content</p>
                <div className="absolute bottom-0 left-0 right-0 bg-accent text-accent-foreground px-3 py-1">
                  <p className="text-[9px] font-mono animate-marquee whitespace-nowrap">📢 Ticker scroll — anunțuri importante</p>
                </div>
                <div className="absolute top-2 right-2 w-8 h-8 bg-white rounded flex items-center justify-center">
                  <QrCode className="h-4 w-4 text-foreground" />
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Componente:</strong> Slideshow + Ticker + QR corner + Branding overlay</p>
                <p><strong>Puppeteer:</strong> CSS-only transitions (≥200ms), 5fps capture, no JS animations</p>
                <p><strong>Clasa:</strong> <code className="bg-muted px-1 rounded">.display-slide-wrapper</code> — font smoothing, no selection</p>
              </div>
            </div>
          </DocSection>

          {/* QR Cancelarie */}
          <DocSection id="qr" title="QR Cancelarie — Portal Acces" icon={QrCode}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Portal acces tiered: public (QR + info), autentificat (features complete). URL: <code className="bg-muted px-1 rounded">/qr/:orgSlug</code></p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/pages/QRCancelarie.tsx</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Public:</strong> Afișare program, QR scan, link login branded</p>
                <p><strong>Autentificat:</strong> Pontaj activități, calendar prezență, profil</p>
              </div>
            </div>
          </DocSection>

          {/* Settings */}
          <DocSection id="settings" title="Settings — 7 Tab Layout" icon={Settings}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Configurare completă organizație. 7 taburi: General, Branding, Module, Utilizatori, Display, Integrări, Vertical.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/pages/Settings.tsx</p>

              <div className="flex flex-wrap gap-1">
                {['General', 'Branding', 'Module', 'Utilizatori', 'Display', 'Integrări', 'Vertical'].map(tab => (
                  <Badge key={tab} variant="secondary" className="text-[10px]">{tab}</Badge>
                ))}
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>General:</strong> Nume, slug, adresă, contact</p>
                <p><strong>Branding:</strong> Logo upload, culori primare/secundare, preview live</p>
                <p><strong>Module:</strong> Toggle on/off per modul, reorder carduri</p>
                <p><strong>Utilizatori:</strong> Lista, roluri, invite</p>
                <p><strong>Display:</strong> Configurare panouri infodisplay, ticker, QR</p>
                <p><strong>Integrări:</strong> Facebook, WhatsApp, webhook-uri</p>
                <p><strong>Vertical:</strong> Config specific tipului (daily_rate, timetable_periods, etc.)</p>
              </div>
            </div>
          </DocSection>

          {/* Sidebar */}
          <DocSection id="sidebar" title="Sidebar — Navigare Principală" icon={PanelLeft}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Desktop: 280px fix, navy background cu SVG decorative. Mobile: Sheet overlay cu bg-accent/90.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/components/layout/AppLayout.tsx</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl overflow-hidden border border-border">
                  <div className="p-3 space-y-2" style={{ backgroundColor: 'hsl(200, 42%, 21%)' }}>
                    <p className="text-[10px] font-bold text-white/90">🧒 Grădinița X</p>
                    <div className="space-y-1">
                      {['Dashboard', 'Prezență', 'Mesaje', 'Documente'].map(item => (
                        <div key={item} className="text-[9px] text-white/70 py-0.5 px-2 rounded hover:bg-white/10">{item}</div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Desktop:</strong> w-[280px], position fixed</p>
                  <p><strong>Mobile:</strong> Sheet component, drag-to-close</p>
                  <p><strong>Nav items:</strong> Dynamic din SECONDARY_NAV, filtrate per vertical + modules_config</p>
                  <p><strong>Decorații:</strong> SVG contour (opacity 0.45), flower art</p>
                </div>
              </div>
            </div>
          </DocSection>

          {/* Sponsor System */}
          <DocSection id="sponsors" title="Sponsor System — Campanii & Rotație" icon={Star}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Sistem complet de sponsorizare cu campanii, canale de afișare, și rotație automată.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/pages/SponsorAdmin.tsx</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Canale:</strong> Card Dashboard, Ticker, Inky Popup, Infodisplay</p>
                <p><strong>Pachete:</strong> Basic (500 RON), Premium (1.500 RON), Enterprise (3.000 RON)</p>
                <p><strong>Rotație:</strong> Un sponsor per canal, ciclu 60s, proporțional cu planul</p>
                <p><strong>Tracking:</strong> Afișări, click-uri, CTR per campanie</p>
              </div>
            </div>
          </DocSection>

          {/* Stories */}
          <DocSection id="stories" title="Stories — Povești pentru Copii" icon={BookOpen}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Modul de povești cu categorii, audio URL, thumbnail și content text. Favorizare per user.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/pages/Stories.tsx</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Câmpuri:</strong> titlu, continut, categorie, varsta, audio_url, thumbnail</p>
                <p><strong>Interacțiuni:</strong> Favorite (story_favorites table), playback audio</p>
              </div>
            </div>
          </DocSection>

          {/* Inventory */}
          <DocSection id="inventory" title="Inventory — Gestiune Stocuri" icon={Package}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">CRUD articole inventar cu categorii, QR code, mișcări stoc (intrare/ieșire), și alerte nivel minim.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/pages/Inventory.tsx</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Tabele:</strong> inventory_items, inventory_movements</p>
                <p><strong>Features:</strong> Scan QR, filtrare categorii, export</p>
              </div>
            </div>
          </DocSection>

          {/* Reports */}
          <DocSection id="reports" title="Reports — Rapoarte & Statistici" icon={BarChart3}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Grafice recharts: Attendance Trends, User Activity, Document Categories. Desktop-only charts pe dashboard.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/pages/Reports.tsx</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Charts:</strong> recharts — BarChart, LineChart, PieChart</p>
                <p><strong>Desktop dashboard:</strong> 3 chart cards sub module grid</p>
              </div>
            </div>
          </DocSection>

          {/* Queue */}
          <DocSection id="queue" title="Queue — Sistem Coadă" icon={Ticket}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Sistem electronic de tichete: emitere tichet, afișare pe display, calling la ghișeu.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/pages/QueueAdmin.tsx, QueueTicket.tsx</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Config:</strong> prefix tichet, nr. ghișee, timp mediu serviciu</p>
                <p><strong>Status:</strong> waiting → called → completed</p>
              </div>
            </div>
          </DocSection>

          {/* SSM */}
          <DocSection id="ssm" title="SSM — Securitate și Sănătate" icon={ShieldCheck}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Checklist-uri zilnice SSM cu template-uri, reminder-uri, și semnătură digitală.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/pages/SSM.tsx</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Tabele:</strong> ssm_templates, ssm_checklists, ssm_reminders</p>
                <p><strong>Flow:</strong> Template → Checklist zilnic → Completare items → Semnătură</p>
              </div>
            </div>
          </DocSection>

          {/* Surtitles */}
          <DocSection id="surtitles" title="Surtitles — Supratitrare" icon={Subtitles}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Supratitrare live pentru spectacole. Operator control + audience view. Multi-limbă (RO, EN, FR).</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/pages/Surtitles.tsx, SurtitleAudience.tsx</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Operator:</strong> Navigare blocuri text, notes, sequence control</p>
                <p><strong>Audience:</strong> Realtime display, selecție limbă, fullscreen</p>
              </div>
            </div>
          </DocSection>

          {/* Magazine */}
          <DocSection id="magazine" title="Magazine — Revistă Digitală" icon={Newspaper}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Articole cu workflow editorial: Draft → Review → Published. Categorii, fotografii multiple, reviewer comments.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/pages/Magazine.tsx</p>
            </div>
          </DocSection>

          {/* Contributions */}
          <DocSection id="contributions" title="Contributions — Contribuții Lunare" icon={BarChart3}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Calcul automat contribuții bazat pe prezență × tarif zilnic. Status plată per copil/lună.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/pages/Contributions.tsx</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Formula:</strong> zile_prezent × daily_rate = suma_calculata</p>
                <p><strong>Status:</strong> pending → partial → paid</p>
              </div>
            </div>
          </DocSection>

          {/* Video Generation */}
          <DocSection id="video" title="Video Generation" icon={Camera}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Generare video din fotografii cu tranziții automate. Export pentru social media.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/pages/VideoGeneration.tsx</p>
            </div>
          </DocSection>

          {/* Social Media */}
          <DocSection id="social" title="Social Media — Facebook & WhatsApp" icon={Globe}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Integrări social media: postare pe Facebook, trimitere mesaje WhatsApp.</p>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/pages/SocialMediaFacebook.tsx, SocialMediaWhatsapp.tsx</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Facebook:</strong> Token Page, format postare, programare</p>
                <p><strong>WhatsApp:</strong> Template messages, broadcast la grupuri</p>
              </div>
            </div>
          </DocSection>
        </TabsContent>

        {/* ═══════════ TAB: WHITELABEL ═══════════ */}
        <TabsContent value="whitelabel" className="space-y-4">
          
          <DocSection id="wl-overview" title="Arhitectura Multi-Tenant" icon={Globe} defaultOpen>
            <div className="space-y-3 text-xs text-muted-foreground">
              <p>Platforma folosește un singur codebase care servește 8 verticale diferite. Fiecare organizație are un <code className="bg-muted px-1 rounded">vertical_type</code> care determină:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Ce module sunt vizibile pe dashboard și sidebar</li>
                <li>Terminologia UI (Grupă vs. Clasă vs. Cabinet)</li>
                <li>Culorile de branding (sidebar, accent, primary)</li>
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
                    <th className="text-left py-2 text-muted-foreground font-medium">Părinte</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Module</th>
                  </tr>
                </thead>
                <tbody>
                  {(Object.entries(VERTICAL_DEFINITIONS) as [VerticalType, typeof VERTICAL_DEFINITIONS.kids][]).map(([key, def]) => (
                    <tr key={key} className="border-b border-border">
                      <td className="py-2 font-semibold text-foreground">{def.icon} {def.label}</td>
                      <td className="py-2 text-foreground">{def.entityLabel} / {def.entityLabelPlural}</td>
                      <td className="py-2 text-foreground">{def.memberLabel} / {def.memberLabelPlural}</td>
                      <td className="py-2 text-foreground">{def.staffLabel} / {def.staffLabelPlural}</td>
                      <td className="py-2 text-foreground">{def.parentLabel} / {def.parentLabelPlural}</td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-0.5">
                          {def.defaultModules.slice(0, 5).map(m => (
                            <Badge key={m} variant="secondary" className="text-[8px] px-1 py-0">{m}</Badge>
                          ))}
                          {def.defaultModules.length > 5 && <Badge variant="outline" className="text-[8px] px-1 py-0">+{def.defaultModules.length - 5}</Badge>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DocSection>

          <DocSection id="wl-branding" title="Branding Cascade" icon={Paintbrush}>
            <div className="space-y-3 text-xs text-muted-foreground">
              <p>Fluxul de branding la nivel de organizație:</p>
              <div className="p-3 rounded-lg bg-muted/50 font-mono text-[10px] space-y-1">
                <p>1. organizations.primary_color + secondary_color (hex)</p>
                <p>2. → applyBrandingColors() din utils/branding.ts</p>
                <p>3. → hexToHsl() conversie</p>
                <p>4. → document.documentElement.style.setProperty()</p>
                <p>5. → Actualizare CSS custom properties:</p>
                <p className="pl-4">--primary, --primary-foreground</p>
                <p className="pl-4">--accent, --accent-foreground</p>
                <p className="pl-4">--sidebar, --sidebar-foreground</p>
                <p className="pl-4">--sidebar-accent, --ring</p>
                <p>6. → Tailwind classes (bg-primary, text-accent, etc.) se actualizează automat</p>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground">📁 src/utils/branding.ts — applyBrandingColors(), loadAndApplyBranding()</p>
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
              </div>
              <p className="mt-2">Slug generat automat din numele organizației: diacritice eliminate, lowercase, kebab-case.</p>
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

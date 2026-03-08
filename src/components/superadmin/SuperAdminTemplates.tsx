import { useState } from 'react';
import { VERTICAL_DEFINITIONS, type VerticalType } from '@/config/verticalConfig';
import { DEFAULT_MODULE_CONFIG, type ModuleKey } from '@/config/moduleConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowRight, CheckSquare, FileText, Layout, MessageSquare, Calendar, Megaphone, Star, Tv, QrCode, Settings, PanelLeft, Users, Eye } from 'lucide-react';

/* ─── Colors ─── */
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

/* ─── Seed templates ─── */
const SEED_GROUPS: Record<VerticalType, string[]> = {
  kids: ['Grupa Mică', 'Grupa Mijlocie', 'Grupa Mare'],
  schools: ['Clasa a V-a A', 'Clasa a VI-a B'],
  medicine: ['Cabinet General'],
  living: ['Scara A'],
  culture: ['Sala Mare'],
  students: ['Facultatea de Informatică'],
  construction: ['Șantier Central'],
  workshops: ['Mecanică', 'Electrică'],
};

/* ─── Mini Dashboard Preview ─── */
function DashboardPreview({ vertical, colors }: { vertical: VerticalType; colors: { primary: string; secondary: string } }) {
  const def = VERTICAL_DEFINITIONS[vertical];
  const moduleColors = ['#E8829A', '#2ECC71', '#3498DB', '#9B59B6', '#FFC107', '#FF8C42'];
  const sampleModules = def.defaultModules.slice(0, 6);

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-background">
      {/* Header bar */}
      <div className="h-6 flex items-center px-2 gap-1" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
        <span className="text-[8px] text-white font-bold">{def.icon} {def.label}</span>
      </div>
      {/* Body */}
      <div className="p-2 space-y-1.5">
        {/* Welcome banner */}
        <div className="glass-card rounded-md p-1.5">
          <p className="text-[7px] font-display font-bold text-foreground">👋 Bun venit</p>
          <div className="flex gap-1 mt-0.5">
            {['📋', '📷', '📄', '🍽️'].map(e => (
              <div key={e} className="stat-pill !px-1 !py-0.5 text-[6px]">{e}</div>
            ))}
          </div>
        </div>
        {/* Module cards */}
        <div className="grid grid-cols-3 gap-1">
          {sampleModules.map((mod, i) => (
            <div
              key={mod}
              className="rounded-md p-1 min-h-[18px]"
              style={{ backgroundColor: moduleColors[i % moduleColors.length] }}
            >
              <p className="text-[6px] font-bold text-white uppercase tracking-wider truncate">{mod}</p>
            </div>
          ))}
        </div>
        {/* Ticker */}
        <div className="rounded-sm px-1 py-0.5 text-[6px] text-white font-mono overflow-hidden" style={{ backgroundColor: colors.secondary }}>
          📢 Anunț ticker...
        </div>
      </div>
    </div>
  );
}

/* ─── Component Template Card ─── */
function ComponentTemplateCard({ title, icon: Icon, description, preview }: {
  title: string; icon: React.ElementType; description: string; preview: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-primary" />
          <CardTitle className="text-xs">{title}</CardTitle>
        </div>
        <p className="text-[10px] text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        {preview}
      </CardContent>
    </Card>
  );
}

interface SuperAdminTemplatesProps {
  onUseTemplate?: (vertical: VerticalType) => void;
}

export default function SuperAdminTemplates({ onUseTemplate }: SuperAdminTemplatesProps) {
  const [expanded, setExpanded] = useState<VerticalType | null>(null);

  return (
    <div className="space-y-6">
      {/* ═══ Vertical Templates ═══ */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-1">Șabloane Verticale</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Fiecare șablon configurează automat modulele, grupele, culorile și terminologia pentru un tip de organizație.
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          {(Object.entries(VERTICAL_DEFINITIONS) as [VerticalType, typeof VERTICAL_DEFINITIONS.kids][]).map(([key, def]) => {
            const colors = DEFAULT_COLORS[key];
            const isExpanded = expanded === key;

            return (
              <Card key={key} className="overflow-hidden">
                <Collapsible open={isExpanded} onOpenChange={(open) => setExpanded(open ? key : null)}>
                  <CollapsibleTrigger className="w-full text-left">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                          style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                        >
                          {def.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm">{def.label}</CardTitle>
                          <p className="text-[10px] text-muted-foreground">{def.description}</p>
                        </div>
                        <Eye className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CardContent className="pb-2 pt-0">
                    {/* Quick info always visible */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {def.defaultModules.slice(0, 6).map(m => (
                        <Badge key={m} variant="secondary" className="text-[9px]">{m}</Badge>
                      ))}
                      {def.defaultModules.length > 6 && <Badge variant="outline" className="text-[9px]">+{def.defaultModules.length - 6}</Badge>}
                    </div>

                    <CollapsibleContent className="space-y-3 pt-2 border-t border-border">
                      {/* Dashboard Preview */}
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Preview Dashboard</p>
                        <DashboardPreview vertical={key} colors={colors} />
                      </div>

                      {/* Config details */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground text-[10px] font-medium">Terminologie</p>
                          <div className="space-y-0.5 mt-1">
                            <p className="text-[10px] text-foreground">{def.entityLabel} / {def.memberLabel}</p>
                            <p className="text-[10px] text-foreground">{def.staffLabel} / {def.parentLabel}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-[10px] font-medium">Grupe implicite</p>
                          <div className="space-y-0.5 mt-1">
                            {SEED_GROUPS[key].map(g => (
                              <Badge key={g} variant="outline" className="text-[8px] mr-0.5">{g}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-[10px] font-medium">Culori</p>
                          <div className="flex gap-1 mt-1">
                            <div className="w-5 h-5 rounded border border-border" style={{ backgroundColor: colors.primary }} />
                            <div className="w-5 h-5 rounded border border-border" style={{ backgroundColor: colors.secondary }} />
                            <span className="text-[9px] font-mono text-muted-foreground self-center">{colors.primary}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-[10px] font-medium">Module ({def.defaultModules.length})</p>
                          <p className="text-[10px] text-foreground mt-1">{def.defaultModules.join(', ')}</p>
                        </div>
                      </div>

                      {/* Use Template button */}
                      {onUseTemplate && (
                        <Button
                          size="sm"
                          className="w-full gap-1.5"
                          onClick={(e) => { e.stopPropagation(); onUseTemplate(key); }}
                        >
                          Folosește acest șablon <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </CollapsibleContent>
                  </CardContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ═══ Component Templates ═══ */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-1">Componente Reutilizabile</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Catalog vizual al tuturor pattern-urilor UI disponibile în platformă. Fiecare componentă poate fi personalizată per vertical/organizație.
        </p>

        {/* Dashboard Components */}
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4">Dashboard</h4>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mb-4">
          <ComponentTemplateCard
            title="Module Card"
            icon={Layout}
            description="Card principal dashboard cu icon, titlu Playfair, contor și share."
            preview={
              <div className="space-y-1.5">
                {Object.entries(DEFAULT_MODULE_CONFIG).slice(0, 3).map(([key, cfg]) => (
                  <div key={key} className="rounded-lg p-2 flex items-center gap-2" style={{ backgroundColor: cfg.color }}>
                    <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: cfg.textColor ? `${cfg.textColor}20` : 'rgba(255,255,255,0.2)' }}>
                      <Star className="h-3 w-3" style={{ color: cfg.textColor || '#fff' }} />
                    </div>
                    <div>
                      <p className="font-display font-bold text-[8px] tracking-wide uppercase" style={{ color: cfg.textColor || '#fff' }}>{cfg.title}</p>
                      <p className="text-[7px]" style={{ color: cfg.textColor ? `${cfg.textColor}cc` : 'rgba(255,255,255,0.7)' }}>{cfg.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            }
          />

          <ComponentTemplateCard
            title="Welcome Banner"
            icon={Star}
            description="Glass card cu greeting personalizat și stat buttons grid."
            preview={
              <div className="glass-card rounded-lg p-2 space-y-1.5">
                <p className="font-display text-[9px] font-bold text-foreground">👋 Bun venit, Admin</p>
                <div className="grid grid-cols-4 gap-1">
                  {['📋', '📷', '📄', '🍽️'].map(e => (
                    <div key={e} className="stat-pill justify-center text-center !text-[8px] !px-1 !py-0.5">{e}</div>
                  ))}
                </div>
              </div>
            }
          />

          <ComponentTemplateCard
            title="Announcements Ticker"
            icon={Megaphone}
            description="Bandă scrollabilă fixă în footer cu anunțuri."
            preview={
              <div className="rounded-md overflow-hidden">
                <div className="bg-accent text-accent-foreground px-2 py-1 overflow-hidden">
                  <div className="animate-marquee whitespace-nowrap text-[8px] font-mono">
                    📢 Anunț important &nbsp;•&nbsp; 🎉 Spectacol vineri &nbsp;•&nbsp; 📢 Anunț important
                  </div>
                </div>
              </div>
            }
          />
        </div>

        {/* Communication */}
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Comunicare</h4>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mb-4">
          <ComponentTemplateCard
            title="Messages Split-View"
            icon={MessageSquare}
            description="Chat layout cu lista conversații + view mesaje."
            preview={
              <div className="grid grid-cols-3 gap-1 rounded-md border border-border overflow-hidden h-20">
                <div className="border-r border-border p-1 space-y-1">
                  {['Ana', 'Ion'].map(n => (
                    <div key={n} className="flex items-center gap-1 p-0.5 rounded hover:bg-muted/50">
                      <div className="w-3 h-3 rounded-full bg-primary/20 text-[5px] flex items-center justify-center text-primary font-bold">{n[0]}</div>
                      <span className="text-[7px] text-foreground">{n}</span>
                    </div>
                  ))}
                </div>
                <div className="col-span-2 p-1 flex flex-col justify-end gap-0.5">
                  <div className="bg-muted px-1.5 py-0.5 rounded text-[7px] text-foreground self-start">Salut!</div>
                  <div className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded text-[7px] self-end">Bună 😊</div>
                </div>
              </div>
            }
          />
        </div>

        {/* Data Views */}
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Date & Vizualizări</h4>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mb-4">
          <ComponentTemplateCard
            title="Attendance Grid"
            icon={CheckSquare}
            description="Grid săptămânal prezență cu checkbox-uri și contor header."
            preview={
              <div className="rounded-md border border-border overflow-hidden">
                <div className="px-2 py-1 text-[8px] font-bold text-foreground" style={{ backgroundColor: '#FFC10730' }}>
                  📋 18/22 prezenți
                </div>
                <table className="w-full text-[7px]">
                  <thead><tr className="bg-muted">
                    <th className="p-1 text-left text-muted-foreground">Nume</th>
                    {['L', 'M', 'Mi'].map(d => <th key={d} className="p-1 text-center text-muted-foreground">{d}</th>)}
                  </tr></thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="p-1 text-foreground">Andrei</td>
                      <td className="p-1 text-center text-success">✓</td>
                      <td className="p-1 text-center text-success">✓</td>
                      <td className="p-1 text-center text-destructive">✗</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            }
          />

          <ComponentTemplateCard
            title="Schedule Table"
            icon={Calendar}
            description="Orar Zi × Oră cu celule color-coded."
            preview={
              <table className="w-full text-[7px] border border-border rounded">
                <thead><tr className="bg-muted">
                  <th className="p-1 text-muted-foreground">Ora</th>
                  <th className="p-1 text-foreground">Lu</th>
                  <th className="p-1 text-foreground">Ma</th>
                </tr></thead>
                <tbody>
                  {[['08:00', 'Mate', 'Rom'], ['09:00', 'Eng', 'Fiz']].map(([h, a, b]) => (
                    <tr key={h} className="border-t border-border">
                      <td className="p-1 font-mono text-muted-foreground">{h}</td>
                      <td className="p-1 rounded-sm" style={{ backgroundColor: '#E8829A22' }}><span className="text-foreground">{a}</span></td>
                      <td className="p-1 rounded-sm" style={{ backgroundColor: '#3498DB22' }}><span className="text-foreground">{b}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          />

          <ComponentTemplateCard
            title="Document Gallery"
            icon={FileText}
            description="Grid thumbnails cu filtre categorii și upload."
            preview={
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {['Toate', 'PDF', 'Foto'].map(c => (
                    <Badge key={c} variant={c === 'Toate' ? 'default' : 'secondary'} className="text-[7px] px-1 py-0">{c}</Badge>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {['Doc.pdf', 'Foto.jpg', 'Rap.pdf'].map(n => (
                    <div key={n} className="p-1 rounded border border-border text-center">
                      <div className="w-full h-6 bg-muted rounded mb-0.5 flex items-center justify-center">
                        <FileText className="h-2.5 w-2.5 text-muted-foreground" />
                      </div>
                      <p className="text-[6px] text-foreground truncate">{n}</p>
                    </div>
                  ))}
                </div>
              </div>
            }
          />
        </div>

        {/* Public Pages */}
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Pagini Publice</h4>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mb-4">
          <ComponentTemplateCard
            title="Public Display"
            icon={Tv}
            description="Slideshow fullscreen cu ticker și QR corner."
            preview={
              <div className="rounded-md border border-border overflow-hidden h-20 bg-foreground relative flex items-center justify-center">
                <p className="text-background text-[8px] font-bold">🖥️ Slide</p>
                <div className="absolute bottom-0 left-0 right-0 bg-accent text-accent-foreground px-1 py-0.5">
                  <p className="text-[6px] font-mono">📢 Ticker...</p>
                </div>
                <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded flex items-center justify-center">
                  <QrCode className="h-2.5 w-2.5 text-foreground" />
                </div>
              </div>
            }
          />

          <ComponentTemplateCard
            title="Branded Login"
            icon={Users}
            description="Pagină login cu gradient org și logo."
            preview={
              <div className="rounded-md overflow-hidden h-20 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(200, 42%, 21%), hsl(210, 80%, 32%))' }}>
                <div className="bg-white/90 rounded-md p-2 w-24 space-y-1 text-center">
                  <div className="w-4 h-4 rounded-full bg-primary/20 mx-auto" />
                  <div className="h-2 bg-muted rounded" />
                  <div className="h-2 bg-muted rounded" />
                  <div className="h-2 bg-primary rounded" />
                </div>
              </div>
            }
          />

          <ComponentTemplateCard
            title="QR Portal"
            icon={QrCode}
            description="Acces tiered: public (QR+info) vs. autentificat."
            preview={
              <div className="rounded-md border border-border p-2 space-y-1 text-center">
                <div className="w-10 h-10 mx-auto bg-muted rounded flex items-center justify-center">
                  <QrCode className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-[8px] text-foreground font-semibold">Scanează QR</p>
                <p className="text-[7px] text-muted-foreground">sau logare cu cont</p>
              </div>
            }
          />
        </div>

        {/* Admin */}
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Administrare</h4>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <ComponentTemplateCard
            title="Settings Tabs"
            icon={Settings}
            description="7 tab-uri configurare organizație."
            preview={
              <div className="flex flex-wrap gap-0.5">
                {['General', 'Branding', 'Module', 'Users', 'Display', 'Integrări', 'Vertical'].map(t => (
                  <Badge key={t} variant="secondary" className="text-[7px] px-1 py-0">{t}</Badge>
                ))}
              </div>
            }
          />

          <ComponentTemplateCard
            title="User Management"
            icon={Users}
            description="Tabel utilizatori cu roluri, filtrare și invite."
            preview={
              <table className="w-full text-[7px] border border-border rounded">
                <thead><tr className="bg-muted">
                  <th className="p-1 text-left text-muted-foreground">Nume</th>
                  <th className="p-1 text-left text-muted-foreground">Rol</th>
                  <th className="p-1 text-left text-muted-foreground">Status</th>
                </tr></thead>
                <tbody>
                  {[['Admin', 'director', '🟢'], ['Ana P.', 'parinte', '🟢'], ['Mihai', 'profesor', '🟡']].map(([n, r, s]) => (
                    <tr key={n} className="border-t border-border">
                      <td className="p-1 text-foreground">{n}</td>
                      <td className="p-1"><Badge variant="outline" className="text-[6px] px-0.5 py-0">{r}</Badge></td>
                      <td className="p-1">{s}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          />

          <ComponentTemplateCard
            title="Sidebar Navigation"
            icon={PanelLeft}
            description="Sidebar 280px cu SVG decorative și nav dynamic."
            preview={
              <div className="rounded-md overflow-hidden" style={{ backgroundColor: 'hsl(200, 42%, 21%)' }}>
                <div className="p-1.5 space-y-0.5">
                  <p className="text-[7px] font-bold text-white/90">🧒 Org Name</p>
                  {['Dashboard', 'Prezență', 'Mesaje', 'Documente'].map(item => (
                    <div key={item} className="text-[6px] text-white/60 py-0.5 px-1 rounded hover:bg-white/10">{item}</div>
                  ))}
                </div>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}

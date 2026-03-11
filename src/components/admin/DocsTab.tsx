import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight, Server, Shield, Layout, Globe, Database, Palette, Cpu, Users, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';

interface DocSection {
  title: string;
  content: React.ReactNode;
}

// ===================================================================
// SECTION: ARHITECTURA GENERALĂ
// ===================================================================
const ARCHITECTURE_SECTIONS: DocSection[] = [
  {
    title: 'Tehnologii utilizate',
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Frontend:</strong> React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Recharts, React Query, react-router-dom v6</p>
        <p><strong className="text-foreground">Backend:</strong> Supabase (PostgreSQL + Auth + Storage + Edge Functions + Realtime). Toate operațiile de date trec prin funcții în <code className="bg-muted px-1 rounded text-xs">src/api/</code>.</p>
        <p><strong className="text-foreground">Autentificare:</strong> Supabase Auth — email/password + Google OAuth. Sesiune gestionată automat prin <code className="bg-muted px-1 rounded text-xs">@supabase/supabase-js</code>.</p>
        <p><strong className="text-foreground">Demo mode:</strong> Mock user stocat în localStorage, fără apeluri Supabase. Activat prin <code className="bg-muted px-1 rounded text-xs">/demo?vertical=kids&role=profesor</code>.</p>
        <p><strong className="text-foreground">PWA:</strong> Configurat via <code className="bg-muted px-1 rounded text-xs">vite-plugin-pwa</code> cu manifest, icons și service worker.</p>
        <p><strong className="text-foreground">Maps:</strong> Leaflet + react-leaflet (harta sponsori)</p>
        <p><strong className="text-foreground">QR:</strong> qrcode.react (token-uri acces, orare, inventar)</p>
      </div>
    ),
  },
  {
    title: 'Structura de fișiere',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <div className="font-mono text-xs bg-muted/50 rounded-lg p-3 space-y-0.5">
          <p className="font-bold text-foreground">src/</p>
          <p className="pl-2">api/ — Supabase data access layer (un fișier per domeniu)</p>
          <p className="pl-4">auth.ts, attendance.ts, announcements.ts, children.ts, documents.ts</p>
          <p className="pl-4">menu.ts, menuOms.ts, messages.ts, schedule.ts, schools.ts, users.ts</p>
          <p className="pl-4">construction.ts, culture.ts, surtitles.ts, inventory.ts, ssm.ts</p>
          <p className="pl-4">workshops.ts, living.ts, magazine.ts, clubs.ts, sponsors.ts</p>
          <p className="pl-4">facebook.ts, whatsapp.ts, websiteConfig.ts, orgConfig.ts, guestTokens.ts</p>
          <p className="pl-2">components/ — UI components (admin/, dashboard/, layout/, settings/, sponsor/, superadmin/, ui/)</p>
          <p className="pl-2">config/ — verticalConfig.ts, moduleConfig.tsx, demoEnvironments.ts</p>
          <p className="pl-2">contexts/ — AuthContext, GroupContext, NotificationContext, ExternalLinkContext</p>
          <p className="pl-2">hooks/ — useActiveModules, useFeatureToggles, useGuestSession, useSponsorRotation</p>
          <p className="pl-2">pages/ — 35+ page components</p>
          <p className="pl-2">types/ — TypeScript interfaces (index.ts, sponsor.ts)</p>
          <p className="pl-2">utils/ — branding.ts, roles.ts, docRegistry.ts</p>
          <p className="font-bold text-foreground mt-2">docs/ — Documentație markdown auto-actualizabilă</p>
          <p className="pl-2">APP_OVERVIEW.md, PAGES.md, API.md, HOOKS.md, CONTEXTS.md</p>
          <p className="pl-2">TYPES.md, ROLES.md, THEMING.md, GUEST_ACCESS.md, DATABASE.md, DOC_REGISTRY.md</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Multi-tenancy & Verticale',
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Platforma servește <strong>8 verticale</strong> dintr-un singur codebase. Fiecare organizație are un <code className="bg-muted px-1 rounded text-xs">vertical_type</code> care determină module, terminologie și temă vizuală.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-border">
              <th className="py-1.5 pr-3 text-left font-medium">Vertical</th>
              <th className="py-1.5 pr-3 text-left font-medium">Entitate</th>
              <th className="py-1.5 pr-3 text-left font-medium">Membru</th>
              <th className="py-1.5 text-left font-medium">Staff</th>
            </tr></thead>
            <tbody>
              <tr className="border-b border-border/30"><td className="py-1 pr-3 font-medium">🧒 Grădinițe</td><td>Grupă</td><td>Copil</td><td>Educatoare</td></tr>
              <tr className="border-b border-border/30"><td className="py-1 pr-3 font-medium">🏫 Școli</td><td>Clasă</td><td>Elev</td><td>Profesor</td></tr>
              <tr className="border-b border-border/30"><td className="py-1 pr-3 font-medium">🏥 Medicină</td><td>Cabinet</td><td>Pacient</td><td>Medic</td></tr>
              <tr className="border-b border-border/30"><td className="py-1 pr-3 font-medium">🏠 Rezidențial</td><td>Bloc</td><td>Locatar</td><td>Administrator</td></tr>
              <tr className="border-b border-border/30"><td className="py-1 pr-3 font-medium">🎭 Cultură</td><td>Sală</td><td>Vizitator</td><td>Regizor</td></tr>
              <tr className="border-b border-border/30"><td className="py-1 pr-3 font-medium">🎓 Universități</td><td>Facultate</td><td>Student</td><td>Profesor</td></tr>
              <tr className="border-b border-border/30"><td className="py-1 pr-3 font-medium">🏗️ Construcții</td><td>Șantier</td><td>Muncitor</td><td>Inginer</td></tr>
              <tr><td className="py-1 pr-3 font-medium">🔧 Service Auto</td><td>Service</td><td>Client</td><td>Mecanic</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    title: 'Roluri utilizator',
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Rolurile sunt stocate ca CSV în câmpul <code className="bg-muted px-1 rounded text-xs">profiles.status</code> (ex: <code className="bg-muted px-1 rounded text-xs">"profesor,director"</code>). Utilitar: <code className="bg-muted px-1 rounded text-xs">src/utils/roles.ts</code></p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-border">
              <th className="py-1.5 pr-3 text-left font-medium">Rol</th>
              <th className="py-1.5 text-left font-medium">Acces</th>
            </tr></thead>
            <tbody>
              <tr className="border-b border-border/30"><td className="py-1 pr-3 font-medium">parinte</td><td>Dashboard, prezență (vizualizare), mesaje, documente, meniu, povești</td></tr>
              <tr className="border-b border-border/30"><td className="py-1 pr-3 font-medium">profesor</td><td>Toate modulele, editare prezență, upload documente, InfoDisplay</td></tr>
              <tr className="border-b border-border/30"><td className="py-1 pr-3 font-medium">director</td><td>Tot ce are profesorul + rapoarte, orar cancelarie</td></tr>
              <tr className="border-b border-border/30"><td className="py-1 pr-3 font-medium">administrator</td><td>Acces total: panou admin, gestionare școli/utilizatori/setări</td></tr>
              <tr className="border-b border-border/30"><td className="py-1 pr-3 font-medium">secretara</td><td>Documente administrative, orar</td></tr>
              <tr className="border-b border-border/30"><td className="py-1 pr-3 font-medium">sponsor</td><td>Dashboard sponsor, gestionare campanii proprii</td></tr>
              <tr><td className="py-1 pr-3 font-medium">inky</td><td>Superuser — acces la toate funcționalitățile + superadmin panel</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    title: 'Contexte React',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">AuthContext</strong> — Sesiunea utilizatorului, login/logout, roluri. Wraps toată aplicația. Aplică branding + temă la login.</p>
        <p><strong className="text-foreground">GroupContext</strong> — Grupa/clasa selectată curent. Determină ce date se afișează.</p>
        <p><strong className="text-foreground">NotificationContext</strong> — Contoare mesaje necitite, anunțuri noi. Poll periodic.</p>
        <p><strong className="text-foreground">ExternalLinkContext</strong> — Dialog confirmare pentru link-uri externe (PWA safe).</p>
        <p><strong className="text-foreground">ModuleConfigProvider</strong> — Configurare culori/titluri module. Persistat în localStorage.</p>
      </div>
    ),
  },
  {
    title: 'Sistem de Teme (Theming)',
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Trei straturi de tematizare, aplicate în ordine:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li><strong>Tema de bază</strong> — variabile CSS în <code className="bg-muted px-1 rounded text-xs">:root</code> din <code className="bg-muted px-1 rounded text-xs">index.css</code></li>
          <li><strong>Tema per vertical</strong> — selectori CSS <code className="bg-muted px-1 rounded text-xs">[data-vertical="culture"]</code> în <code className="bg-muted px-1 rounded text-xs">index.css</code></li>
          <li><strong>Branding per organizație</strong> — variabile CSS inline via <code className="bg-muted px-1 rounded text-xs">applyBrandingColors()</code></li>
        </ol>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-border">
              <th className="py-1.5 pr-3 text-left font-medium">Vertical</th>
              <th className="py-1.5 pr-3 text-left font-medium">Temă</th>
              <th className="py-1.5 text-left font-medium">Paletă</th>
            </tr></thead>
            <tbody>
              <tr className="border-b border-border/30"><td className="py-1 pr-3">Culture</td><td>Dark opera noir</td><td>Crimson + gold, background negru</td></tr>
              <tr className="border-b border-border/30"><td className="py-1 pr-3">Medicine</td><td>Clinical clean</td><td>Trust blue + teal, alb</td></tr>
              <tr className="border-b border-border/30"><td className="py-1 pr-3">Construction</td><td>Earth industrial</td><td>Brown + amber, gri cald</td></tr>
              <tr><td className="py-1 pr-3">Workshops</td><td>Steel professional</td><td>Slate blue, gri rece</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2"><strong className="text-foreground">Admin editor:</strong> Panou Admin → tab "Teme" (<code className="bg-muted px-1 rounded text-xs">ThemeEditorTab.tsx</code>)</p>
      </div>
    ),
  },
  {
    title: 'Inky Assistant — Costume per vertical',
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>Mascota Inky se adaptează automat la verticalul organizației:</p>
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="h-14 w-14 rounded-full shadow-lg border border-primary/20 flex items-center justify-center overflow-hidden bg-card shrink-0">
            <img src="/src/assets/inky-button.png" alt="Inky default" className="h-12 w-12 object-contain" />
          </div>
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Preview buton Inky</p>
            <p>Cerc 56×56px cu imaginea costumului, poziționare fixed bottom-right</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-border">
              <th className="py-1.5 pr-3 text-left font-medium">Vertical</th>
              <th className="py-1.5 pr-3 text-left font-medium">Costum</th>
              <th className="py-1.5 text-left font-medium">Fișier PNG</th>
            </tr></thead>
            <tbody>
              <tr className="border-b border-border/30"><td className="py-1 pr-3">Kids/Schools/Living/Students</td><td>Default (bufniță buton)</td><td><code className="text-xs">inky-button.png</code></td></tr>
              <tr className="border-b border-border/30"><td className="py-1 pr-3">🏥 Medicine</td><td>Halat alb + stetoscop</td><td><code className="text-xs">inky-doctor.png</code></td></tr>
              <tr className="border-b border-border/30"><td className="py-1 pr-3">🏗️ Construction</td><td>Cască galbenă + vestă reflectorizantă</td><td><code className="text-xs">inky-construction.png</code></td></tr>
              <tr className="border-b border-border/30"><td className="py-1 pr-3">🔧 Workshops</td><td>Salopetă mecanic + cheie franceză</td><td><code className="text-xs">inky-mechanic.png</code></td></tr>
              <tr><td className="py-1 pr-3">🎭 Culture</td><td>Capă roșie + joben negru</td><td><code className="text-xs">inky-opera.png</code></td></tr>
            </tbody>
          </table>
        </div>
        <p><strong>Mapare:</strong> <code className="bg-muted px-1 rounded text-xs">VERTICAL_COSTUMES</code> în InkyAssistant.tsx citește <code className="bg-muted px-1 rounded text-xs">user.vertical_type</code></p>
        <p><strong>Override Enterprise:</strong> Sponsorii pot seta costum custom via <code className="bg-muted px-1 rounded text-xs">stilInky.costume_url</code> în campanie</p>
      </div>
    ),
  },
  {
    title: 'Baza de date — Supabase PostgreSQL',
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Toate tabelele au <code className="bg-muted px-1 rounded text-xs">organization_id</code> pentru multi-tenancy. RLS (Row Level Security) izolează datele per organizație.</p>
        <p><strong className="text-foreground">Tabele core:</strong> organizations, profiles, groups, schools, org_config, modules_config</p>
        <p><strong className="text-foreground">Tabele conținut:</strong> announcements, children, attendance, documents, schedule, menu_weeks/meals/dishes, messages, conversations</p>
        <p><strong className="text-foreground">Tabele domeniu:</strong> construction_sites/teams/tasks/costs, culture_shows/surtitle_blocks, doctor_profiles, medicine_services, inventory_items, living_apartments, magazine_articles, school_clubs</p>
        <p><strong className="text-foreground">Tabele integrări:</strong> sponsor_campaigns/promos, facebook_settings, infodisplay_panels, guest_tokens, queue_entries</p>
        <p><strong className="text-foreground">Tipuri în:</strong> <code className="bg-muted px-1 rounded text-xs">src/integrations/supabase/types.ts</code> (auto-generat)</p>
      </div>
    ),
  },
  {
    title: 'Guest Access — Acces QR fără autentificare',
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Vizitatorii pot accesa conținut public prin scanarea unui QR code de pe display-ul TV.</p>
        <p><strong className="text-foreground">Flow:</strong> Display TV afișează QR → Vizitor scanează → <code className="bg-muted px-1 rounded text-xs">/qr/:orgSlug?t=token</code> → Token validat → Sesiune guest creată în localStorage</p>
        <p><strong className="text-foreground">Token:</strong> Rotație zilnică, 12 caractere alfanumerice, validat prin edge function <code className="bg-muted px-1 rounded text-xs">validate-guest-token</code></p>
        <p><strong className="text-foreground">Expirare:</strong> Sesiunea guest expiră la miezul nopții (verificare client-side)</p>
        <p><strong className="text-foreground">Hook:</strong> <code className="bg-muted px-1 rounded text-xs">useGuestSession(orgSlug)</code> — gestionează validare, stocare și expirare</p>
      </div>
    ),
  },
];

// ===================================================================
// SECTION: PAGINI
// ===================================================================
const PAGE_SECTIONS: DocSection[] = [
  {
    title: '/ — Dashboard',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/Dashboard.tsx</code> (504 linii)</p>
        <p><strong className="text-foreground">Descriere:</strong> Hub central cu banner de bun venit, statistici rapide, module interactive reordonabile, anunțuri ticker, sponsor cards. Vertical-aware: conținut adaptat tipului de organizație.</p>
        <p><strong className="text-foreground">Acces:</strong> Toți utilizatorii autentificați.</p>
      </div>
    ),
  },
  {
    title: '/login — Autentificare',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/Login.tsx</code></p>
        <p><strong className="text-foreground">Descriere:</strong> Login email/password + Google OAuth + sign-up. Branded per organizație când accesat via <code className="bg-muted px-1 rounded text-xs">/login/:orgSlug</code>.</p>
      </div>
    ),
  },
  {
    title: '/prezenta — Prezența',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/Attendance.tsx</code> (810 linii)</p>
        <p><strong className="text-foreground">Descriere:</strong> Grid săptămânal cu checkbox-uri per copil/zi. Vizualizare lunară cu statistici. Calcul contribuții financiare (daily_rate × zile prezent). Export Excel/PDF. Print-optimized.</p>
        <p><strong className="text-foreground">Acces:</strong> profesor+ (editare), parinte (vizualizare proprii copii).</p>
      </div>
    ),
  },
  {
    title: '/documente — Documente',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/Documents.tsx</code> (224 linii)</p>
        <p><strong className="text-foreground">Descriere:</strong> Upload la Supabase Storage. Categorii: Activități, Administrativ, Teme, Fotografii. Grid/list view, thumbnails, download/delete.</p>
      </div>
    ),
  },
  {
    title: '/mesaje — Mesaje',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/Messages.tsx</code> (461 linii)</p>
        <p><strong className="text-foreground">Descriere:</strong> Chat real-time via Supabase channels. Split-pane layout. Read receipts, avatar colors, date grouping. Responsive.</p>
      </div>
    ),
  },
  {
    title: '/anunturi — Anunțuri',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/Announcements.tsx</code> (213 linii)</p>
        <p><strong className="text-foreground">Descriere:</strong> Creare/gestionare anunțuri cu prioritate (normal/urgent), expiry dates, ascundere din ticker, cross-post WhatsApp/Facebook.</p>
      </div>
    ),
  },
  {
    title: '/orar — Orar',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/Schedule.tsx</code> (402 linii)</p>
        <p><strong className="text-foreground">Descriere:</strong> Grid 5-zile × 9-ore cu celule color-coded. Editare inline (materie, profesor, sală, culoare). QR per clasă/sală. Print.</p>
      </div>
    ),
  },
  {
    title: '/meniu — Meniu Săptămânal (OMS)',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/WeeklyMenu.tsx</code> (561 linii)</p>
        <p><strong className="text-foreground">Descriere:</strong> Sistem de meniu OMS-compliant cu 4 mese/zi, tracking ingrediente + valori nutriționale, target calorii per grupă de vârstă (1-3, 3-7 ani), detecție ingrediente interzise, workflow publicare.</p>
        <p><strong className="text-foreground">API:</strong> <code className="bg-muted px-1 rounded text-xs">src/api/menuOms.ts</code> — computeDayNutrition(), checkBannedIngredients(), getCalorieStatus()</p>
      </div>
    ),
  },
  {
    title: '/povesti — Povești',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/Stories.tsx</code> (523 linii)</p>
        <p><strong className="text-foreground">Descriere:</strong> Bibliotecă de povești: Read, Listen (audio player), Watch (video). Categorii, filtre pe vârstă, favorites.</p>
      </div>
    ),
  },
  {
    title: '/rapoarte — Rapoarte',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/Reports.tsx</code> (114 linii)</p>
        <p><strong className="text-foreground">Descriere:</strong> Dashboard analitic cu Recharts: tendințe prezență, activitate utilizatori, documente pe categorii. Export PDF/Excel.</p>
      </div>
    ),
  },
  {
    title: '/admin — Panou Administrare',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/AdminPanel.tsx</code> (119 linii)</p>
        <p><strong className="text-foreground">Descriere:</strong> Hub admin cu 16 taburi (filtrate per vertical):</p>
        <p className="pl-3">• SchoolsTab, UsersTab, ScheduleTab, MenuTab, WorkshopsTab</p>
        <p className="pl-3">• SponsorsTab, SponsorPolicyTab, DisplayPreviewTab, WebsiteTab</p>
        <p className="pl-3">• ModuleTogglesTab, SettingsTab, UserGuideTab, DocsTab</p>
        <p className="pl-3">• BrandingTab, BusinessIntelligenceTab, <strong>ThemeEditorTab</strong> (NOU)</p>
        <p><strong className="text-foreground">Acces:</strong> administrator, director, inky.</p>
      </div>
    ),
  },
  {
    title: '/santiere — Construcții Dashboard',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/ConstructionDashboard.tsx</code> (1273 linii)</p>
        <p><strong className="text-foreground">Descriere:</strong> Management complet: șantiere (CRUD, progress, buget), echipe, task-uri (kanban), costuri categorisate, asignări săptămânale, SSM.</p>
      </div>
    ),
  },
  {
    title: '/spectacole — Cultură (Show Editor)',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/CultureShowEditor.tsx</code> (365 linii)</p>
        <p><strong className="text-foreground">Descriere:</strong> Management spectacole: CRUD shows, cast, sponsori per spectacol, blocuri supratitrare. Temă dark opera noir.</p>
      </div>
    ),
  },
  {
    title: '/supratitrare — Supratitrare Live',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/Surtitles.tsx</code> (352 linii)</p>
        <p><strong className="text-foreground">Descriere:</strong> Operator console + audience view. Multi-limbă (RO, EN, FR, DE). Realtime via Supabase channels.</p>
        <p><strong className="text-foreground">Rute aferente:</strong> <code className="bg-muted px-1 rounded text-xs">/surtitle/operate/:showId</code>, <code className="bg-muted px-1 rounded text-xs">/surtitle/view/:showId</code></p>
      </div>
    ),
  },
  {
    title: '/coada — Sistem Coadă',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișiere:</strong> <code className="bg-muted px-1 rounded text-xs">QueueAdmin.tsx</code> (505 linii), <code className="bg-muted px-1 rounded text-xs">QueueTicket.tsx</code> (472 linii)</p>
        <p><strong className="text-foreground">Descriere:</strong> Admin: call next, service points, statistici. Public: take ticket, wait estimation, realtime updates.</p>
      </div>
    ),
  },
  {
    title: '/cabinet — Medicină Admin',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/MedicineAdmin.tsx</code> (362 linii)</p>
        <p><strong className="text-foreground">Descriere:</strong> Profiluri doctori (foto, bio, specializare), servicii medicale cu prețuri și durată. Temă clinical clean.</p>
      </div>
    ),
  },
  {
    title: '/atelier — Workshop Dashboard',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/WorkshopDashboard.tsx</code> (242 linii)</p>
        <p><strong className="text-foreground">Descriere:</strong> Management service auto: vehicule, programări (scheduled/in-progress/done), clienți. Temă steel professional.</p>
      </div>
    ),
  },
  {
    title: '/bloc — Rezidențial Dashboard',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/LivingDashboard.tsx</code> (293 linii)</p>
        <p><strong className="text-foreground">Descriere:</strong> Apartamente, cheltuieli lunare pe categorii, entități administrative externe, tracking plăți.</p>
      </div>
    ),
  },
  {
    title: '/inventar — Inventar',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/Inventory.tsx</code> (269 linii)</p>
        <p><strong className="text-foreground">Descriere:</strong> CRUD articole, categorii, mișcări stoc (in/out), QR per articol, locație.</p>
      </div>
    ),
  },
  {
    title: '/revista — Revistă / Magazine',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/Magazine.tsx</code> (383 linii)</p>
        <p><strong className="text-foreground">Descriere:</strong> Workflow editorial: draft → review → published. Cluburi școlare cu membership.</p>
      </div>
    ),
  },
  {
    title: 'Rute publice (fără auth)',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><code className="bg-muted px-1 rounded text-xs">/display/:orgSlug</code> — Infodisplay fullscreen pentru TV-uri (1348 linii)</p>
        <p><code className="bg-muted px-1 rounded text-xs">/qr/:orgSlug</code> — Portal QR guest (781 linii). Content adaptat per vertical.</p>
        <p><code className="bg-muted px-1 rounded text-xs">/queue/:orgSlug</code> — Tichet coadă public (472 linii)</p>
        <p><code className="bg-muted px-1 rounded text-xs">/site/:orgSlug</code> — Website public auto-generat (319 linii)</p>
        <p><code className="bg-muted px-1 rounded text-xs">/program/:showId</code> — Program digital spectacol (221 linii)</p>
        <p><code className="bg-muted px-1 rounded text-xs">/surtitle/:orgSlug</code> — Selectare spectacol supratitrare</p>
        <p><code className="bg-muted px-1 rounded text-xs">/surtitle/view/:showId</code> — Vizualizare supratitrare audiență</p>
        <p><code className="bg-muted px-1 rounded text-xs">/demo</code> — Intrare mod demo</p>
      </div>
    ),
  },
  {
    title: '/superadmin — Super Admin Panel',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/SuperAdmin.tsx</code> (89 linii)</p>
        <p><strong className="text-foreground">Descriere:</strong> Panel cross-org: Organizații, Module Matrix, BI, Display Monitor, Activity Feed, Docs, Clienți, Șabloane, Client Nou.</p>
        <p><strong className="text-foreground">Acces:</strong> Doar inky/administrator.</p>
      </div>
    ),
  },
];

// ===================================================================
// SECTION: SPONSORI
// ===================================================================
const SPONSOR_SECTIONS: DocSection[] = [
  {
    title: 'Pachete disponibile',
    content: (
      <div className="overflow-x-auto text-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-4 font-medium">Caracteristică</th>
              <th className="py-2 pr-4 font-medium">Basic (500 RON)</th>
              <th className="py-2 pr-4 font-medium">Premium (1.500 RON)</th>
              <th className="py-2 font-medium">Enterprise (3.000 RON)</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4">Card Dashboard</td><td>✅</td><td>✅</td><td>✅</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4">Ticker</td><td>✅</td><td>✅</td><td>✅</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4">Infodisplay</td><td>❌</td><td>✅</td><td>✅</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4">Inky Popup</td><td>❌</td><td>✅</td><td>✅</td></tr>
            <tr><td className="py-1.5 pr-4">Branding custom Inky</td><td>❌</td><td>❌</td><td>✅</td></tr>
          </tbody>
        </table>
      </div>
    ),
  },
  {
    title: 'Canale & Rotație',
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p><strong>Card Dashboard</strong> — Pe pagina principală, cu logo, titlu, descriere și buton CTA.</p>
        <p><strong>Ticker</strong> — Bară fixă în partea de jos, text scrollabil cu badge.</p>
        <p><strong>Inky Popup</strong> — Meniul asistentului virtual, buton cu logo sponsor.</p>
        <p><strong>Infodisplay</strong> — Ecranele TV din hol, panou dedicat cu QR code.</p>
        <p className="mt-2"><strong>Rotație:</strong> Un sponsor per canal, ciclu 60s, proporțional cu planul. Hook: <code className="bg-muted px-1 rounded text-xs">useSponsorRotation(location)</code></p>
      </div>
    ),
  },
  {
    title: 'Campanii — Lifecycle',
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex flex-wrap gap-1.5 mt-1">
          <Badge variant="outline">draft — în pregătire</Badge>
          <Badge variant="outline">activ — rulează</Badge>
          <Badge variant="outline">pauza — oprită temporar</Badge>
          <Badge variant="outline">expirat — data a trecut</Badge>
          <Badge variant="outline">arhivat — scos din circulație</Badge>
        </div>
        <p className="mt-2"><strong>Statistici:</strong> Afișări, click-uri, CTR per campanie. Logging automat via <code className="bg-muted px-1 rounded text-xs">logImpression()</code> / <code className="bg-muted px-1 rounded text-xs">logClick()</code>.</p>
      </div>
    ),
  },
];

// ===================================================================
// SECTION: COMPONENTE UI CHEIE
// ===================================================================
const UI_SECTIONS: DocSection[] = [
  {
    title: 'AppLayout — Layout principal',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/components/layout/AppLayout.tsx</code></p>
        <p>Sidebar fix pe desktop (280px), hamburger pe mobil. Navigare role-based + module-aware. SVG decorative pe sidebar.</p>
      </div>
    ),
  },
  {
    title: 'ModuleHub + ModuleCard + ModulePanel',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișiere:</strong> <code className="bg-muted px-1 rounded text-xs">src/components/dashboard/Module*.tsx</code></p>
        <p><strong>ModuleHub</strong> — Grid de carduri module, filtrat prin visibility + useActiveModules.</p>
        <p><strong>ModuleCard</strong> — Card colorat cu icon, titlu Playfair, subtitle, badge contor, share button.</p>
        <p><strong>ModulePanel</strong> — Panel fullscreen (mobil) / lateral (desktop) cu Framer Motion layoutId.</p>
      </div>
    ),
  },
  {
    title: 'InkyAssistant — Asistent virtual cu costume',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/components/InkyAssistant.tsx</code></p>
        <p>Buton floating cu mascota Inky. Costume adaptate per vertical (doctor, muncitor, mecanic, operă). Meniu shortcut-uri + promo-uri sponsori.</p>
        <p>Map costum: <code className="bg-muted px-1 rounded text-xs">VERTICAL_COSTUMES</code> — medicine→inkyDoctor, construction→inkyConstruction, etc.</p>
      </div>
    ),
  },
  {
    title: 'ThemeEditorTab — Editor teme (NOU)',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/components/admin/ThemeEditorTab.tsx</code></p>
        <p>Două secțiuni: preset-uri per vertical (culorile default) și override per organizație specifică.</p>
        <p>Persistare: <code className="bg-muted px-1 rounded text-xs">org_config</code> table, keys: <code className="bg-muted px-1 rounded text-xs">vertical_theme_preset</code> și <code className="bg-muted px-1 rounded text-xs">theme_override</code></p>
      </div>
    ),
  },
  {
    title: 'WhiteLabelSwitcher — Selector demo vertical',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/components/WhiteLabelSwitcher.tsx</code></p>
        <p>Dropdown pentru schimbarea verticalului în mod demo. Aplică automat tema + branding la switch.</p>
      </div>
    ),
  },
  {
    title: 'AnnouncementsTicker — Bandă scrollabilă',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/components/dashboard/AnnouncementsTicker.tsx</code></p>
        <p>Bară fixă în partea de jos cu CSS marquee animation. Content triplicat pentru buclă infinită. Integrează promo-uri sponsor.</p>
      </div>
    ),
  },
];

// ===================================================================
// SECTION: HOOKS
// ===================================================================
const HOOKS_SECTIONS: DocSection[] = [
  {
    title: 'useActiveModules(orgId, verticalType)',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p>Încarcă module active din <code className="bg-muted px-1 rounded text-xs">modules_config</code>. Returnează <code className="bg-muted px-1 rounded text-xs">{`{ activeModules: Set<string>, loaded }`}</code>. Fallback: module default per vertical.</p>
      </div>
    ),
  },
  {
    title: 'useFeatureToggles()',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p>Toggle-uri funcționalitate via <code className="bg-muted px-1 rounded text-xs">org_config</code>. Returnează <code className="bg-muted px-1 rounded text-xs">{`{ isEnabled(key), setToggle(key, enabled) }`}</code>. Demo mode: defaults fără DB.</p>
      </div>
    ),
  },
  {
    title: 'useGuestSession(orgSlug)',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p>Sesiune guest QR: validare token, stocare localStorage, expirare la miezul nopții. Returnează <code className="bg-muted px-1 rounded text-xs">{`{ guestSession, isGuest, validateAndCreateSession, clearSession }`}</code>.</p>
      </div>
    ),
  },
  {
    title: 'useSponsorRotation(location)',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p>Rotație sponsor per locație (dashboard, infodisplay, ticker, inky_popup). Auto-timer + impression logging. Returnează <code className="bg-muted px-1 rounded text-xs">{`{ currentPromo }`}</code>.</p>
      </div>
    ),
  },
];

// ===================================================================
// SHARED COMPONENTS
// ===================================================================
function DocGroup({ title, badge, sections }: { title: string; badge?: string; sections: DocSection[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/60 transition-colors text-left">
        {open ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
        <span className="font-semibold text-sm">{title}</span>
        {badge && <Badge variant="secondary" className="ml-auto text-[10px]">{badge}</Badge>}
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-7 pr-4 pb-2 space-y-3">
        {sections.map((s, i) => (
          <div key={i} className="border-l-2 border-border pl-3 py-1">
            <p className="text-sm font-medium mb-1">{s.title}</p>
            {s.content}
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ===================================================================
// MAIN COMPONENT
// ===================================================================
export default function DocsTab() {
  return (
    <div className="space-y-4 pb-10">
      <div>
        <h2 className="text-lg font-display font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Documentație completă Infodisplay Platform
        </h2>
        <p className="text-sm text-muted-foreground">Ghid tehnic și operațional — arhitectură, pagini, componente UI, hooks, sponsori</p>
        <p className="text-xs text-muted-foreground mt-1">Documentație detaliată markdown disponibilă în <code className="bg-muted px-1 rounded">docs/</code> — actualizare automată via <code className="bg-muted px-1 rounded">DOC_REGISTRY.md</code></p>
      </div>

      {/* Architecture */}
      <Card>
        <CardContent className="p-2 divide-y divide-border/50">
          <DocGroup title="Arhitectură, Teme & Configurare" badge={`${ARCHITECTURE_SECTIONS.length} secțiuni`} sections={ARCHITECTURE_SECTIONS} />
        </CardContent>
      </Card>

      {/* All Pages */}
      <Card>
        <CardContent className="p-2 divide-y divide-border/50">
          <DocGroup title="Pagini — Ghid complet (toate rutele)" badge={`${PAGE_SECTIONS.length} pagini`} sections={PAGE_SECTIONS} />
        </CardContent>
      </Card>

      {/* Sponsors */}
      <Card>
        <CardContent className="p-2 divide-y divide-border/50">
          <DocGroup title="Sponsori — Pachete, Canale & Campanii" badge="sponsori" sections={SPONSOR_SECTIONS} />
        </CardContent>
      </Card>

      {/* UI Components */}
      <Card>
        <CardContent className="p-2 divide-y divide-border/50">
          <DocGroup title="Componente UI cheie" badge={`${UI_SECTIONS.length} componente`} sections={UI_SECTIONS} />
        </CardContent>
      </Card>

      {/* Hooks */}
      <Card>
        <CardContent className="p-2 divide-y divide-border/50">
          <DocGroup title="Hooks & Contexte" badge={`${HOOKS_SECTIONS.length} hooks`} sections={HOOKS_SECTIONS} />
        </CardContent>
      </Card>

      {/* Footer note */}
      <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground space-y-1">
        <p className="flex items-center gap-1.5"><Shield className="h-3 w-3" /><strong>Autentificare:</strong> Supabase Auth — sesiune automată, RLS pentru izolarea organizațiilor.</p>
        <p className="flex items-center gap-1.5"><Database className="h-3 w-3" /><strong>Backend:</strong> Supabase PostgreSQL cu Row Level Security. Tipuri auto-generate în <code className="bg-muted px-1 rounded">types.ts</code>.</p>
        <p className="flex items-center gap-1.5"><Palette className="h-3 w-3" /><strong>Teme:</strong> CSS variables per vertical + override per organizație. Editor în Admin Panel → Teme.</p>
        <p className="flex items-center gap-1.5"><Globe className="h-3 w-3" /><strong>Docs markdown:</strong> <code className="bg-muted px-1 rounded">docs/*.md</code> — actualizare automată via <code className="bg-muted px-1 rounded">DOC_REGISTRY.md</code>.</p>
      </div>
    </div>
  );
}

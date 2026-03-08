import { useState } from 'react';
import {
  HelpCircle, ChevronDown, ChevronRight, Users, BookOpen,
  ClipboardCheck, MessageSquare, FileText, UtensilsCrossed,
  Calendar, BookOpenCheck, Paintbrush, Megaphone, BarChart3,
  Monitor, Share2, School, UserCog, Settings, Star,
  HelpCircleIcon, Phone, Eye, Baby, Bell, Lock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';

/* ── Helpers ────────────────────────────────────────────────── */

interface DocSection {
  title: string;
  icon?: React.ReactNode;
  roles?: string[];
  content: React.ReactNode;
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    părinte: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    profesor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    director: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    administrator: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    secretară: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    sponsor: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${colors[role] || 'bg-muted text-muted-foreground'}`}>
      {role}
    </span>
  );
}

function DocGroup({ title, icon, children, defaultOpen = false }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="border-border/50">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 w-full p-4 text-left hover:bg-muted/30 transition-colors rounded-t-lg">
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          <span className="text-muted-foreground">{icon}</span>
          <span className="font-semibold text-sm">{title}</span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 space-y-3">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function DocItem({ title, roles, content }: DocSection) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 px-3 text-left hover:bg-muted/30 transition-colors rounded-lg text-sm">
        {open ? <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" /> : <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
        <span className="font-medium">{title}</span>
        {roles && <div className="flex gap-1 ml-auto">{roles.map(r => <RoleBadge key={r} role={r} />)}</div>}
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-8 pr-3 pb-2">
        {content}
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ── Content Sections ───────────────────────────────────────── */

const OVERVIEW: DocSection[] = [
  {
    title: 'Ce este TID4K?',
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p><strong className="text-foreground">TID4K</strong> este o platformă digitală pentru grădinițe și școli care centralizează comunicarea, prezența, documentele și activitățile într-o singură aplicație.</p>
        <p>Aplicația funcționează pe telefon, tabletă și calculator, și oferă funcționalități diferite în funcție de rolul utilizatorului.</p>
      </div>
    ),
  },
  {
    title: 'Tipuri de utilizatori',
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="grid gap-2">
          <div className="flex items-start gap-2"><RoleBadge role="părinte" /><span>Vizualizează prezența copilului, primește mesaje, accesează documente și meniul săptămânal.</span></div>
          <div className="flex items-start gap-2"><RoleBadge role="profesor" /><span>Marchează prezența, trimite mesaje, încarcă documente, gestionează povești și ateliere.</span></div>
          <div className="flex items-start gap-2"><RoleBadge role="director" /><span>Tot ce are profesorul + rapoarte detaliate, orar cancelarie, supervizare grupe.</span></div>
          <div className="flex items-start gap-2"><RoleBadge role="administrator" /><span>Acces total: gestionare școli, utilizatori, setări, sponsori, branding.</span></div>
          <div className="flex items-start gap-2"><RoleBadge role="secretară" /><span>Documente administrative, gestionare orar.</span></div>
          <div className="flex items-start gap-2"><RoleBadge role="sponsor" /><span>Dashboard propriu pentru gestionarea campaniilor de promovare.</span></div>
        </div>
      </div>
    ),
  },
  {
    title: 'Cum mă conectez?',
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ol className="list-decimal list-inside space-y-1">
          <li>Deschide aplicația pe telefon sau calculator.</li>
          <li>Introdu <strong className="text-foreground">numărul de telefon</strong> înregistrat la unitate.</li>
          <li>Introdu <strong className="text-foreground">codul PIN</strong> primit de la administrator.</li>
          <li>Dacă ai acces la mai multe unități, selectează unitatea dorită.</li>
        </ol>
        <p className="text-xs mt-2 p-2 rounded bg-muted/50">💡 <strong>Alternativă:</strong> Poți scana un cod QR afișat pe InfoDisplay pentru autentificare rapidă.</p>
      </div>
    ),
  },
];

const ROLE_GUIDES: DocSection[] = [
  {
    title: 'Ghid Părinte',
    roles: ['părinte'],
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">După autentificare, vei vedea dashboard-ul cu toate modulele disponibile:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong className="text-foreground">Prezența</strong> — vezi dacă copilul tău a fost marcat prezent azi și istoricul pe săptămână/lună.</li>
          <li><strong className="text-foreground">Mesaje</strong> — conversații directe cu educatoarea. Primești notificări pentru mesaje noi.</li>
          <li><strong className="text-foreground">Documente</strong> — accesează documente partajate de unitate (regulamente, fișe, etc.).</li>
          <li><strong className="text-foreground">Meniul Săptămânii</strong> — vezi ce mănâncă copilul în fiecare zi, inclusiv date nutriționale.</li>
          <li><strong className="text-foreground">Povești</strong> — ascultă povești educative cu ilustrații, disponibile și cu citire automată (TTS).</li>
          <li><strong className="text-foreground">Ateliere</strong> — vezi atelierele și activitățile organizate de unitate.</li>
        </ul>
        <p className="text-xs mt-2 p-2 rounded bg-muted/50">💡 Apasă pe cardul copilului din partea de sus a dashboard-ului pentru detalii complete.</p>
      </div>
    ),
  },
  {
    title: 'Ghid Profesor / Educator',
    roles: ['profesor'],
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Pe lângă funcțiile de bază, ai acces la:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong className="text-foreground">Marcare prezență</strong> — selectează copiii prezenți din lista grupei tale. Poți salva și modifica pe parcursul zilei.</li>
          <li><strong className="text-foreground">Trimitere mesaje</strong> — contactează părinții direct prin modulul de mesaje.</li>
          <li><strong className="text-foreground">Upload documente</strong> — încarcă fișe, fotografii sau documente în categoriile corespunzătoare.</li>
          <li><strong className="text-foreground">Povești</strong> — adaugă povești noi cu text, ilustrații și generare vocală automată.</li>
          <li><strong className="text-foreground">InfoDisplay</strong> — configurează conținutul afișat pe ecranele TV din unitate.</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Ghid Director',
    roles: ['director'],
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Funcționalități suplimentare față de profesor:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong className="text-foreground">Rapoarte</strong> — grafice de prezență pe zile/săptămâni/luni, statistici activități, export date.</li>
          <li><strong className="text-foreground">Orar cancelarie</strong> — vizualizare și editare orar pe ore, cu profesori asignați.</li>
          <li><strong className="text-foreground">Supervizare grupe</strong> — vezi prezența tuturor grupelor, nu doar grupa proprie.</li>
          <li><strong className="text-foreground">Anunțuri</strong> — creează anunțuri care apar pe banda de informare din aplicație.</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Ghid Administrator',
    roles: ['administrator'],
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Acces complet la panoul de administrare:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong className="text-foreground">Școli</strong> — adaugă, editează sau dezactivează unități de învățământ.</li>
          <li><strong className="text-foreground">Utilizatori</strong> — creează conturi, asignează roluri, resetează PIN-uri.</li>
          <li><strong className="text-foreground">Orar</strong> — configurează programul pe zile și ore pentru fiecare unitate.</li>
          <li><strong className="text-foreground">Meniu</strong> — editează meniul săptămânal cu preparate și informații nutriționale.</li>
          <li><strong className="text-foreground">Setări</strong> — configurații globale ale aplicației.</li>
          <li><strong className="text-foreground">Sponsori</strong> — gestionează campaniile de sponsorizare din aplicație.</li>
        </ul>
      </div>
    ),
  },
];

const MODULE_GUIDES: DocSection[] = [
  {
    title: 'Prezența',
    roles: ['profesor', 'părinte'],
    icon: <ClipboardCheck className="h-3.5 w-3.5" />,
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Cum funcționează:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Profesor:</strong> Deschide modulul Prezența → vezi lista copiilor din grupa ta → bifează copiii prezenți → apasă „Salvează".</li>
          <li><strong>Părinte:</strong> Deschide modulul Prezența → vezi statusul copilului tău (prezent/absent) pentru ziua curentă.</li>
          <li>Poți naviga între zile, săptămâni și luni pentru a vedea istoricul.</li>
          <li>Graficele de prezență sunt disponibile în modulul Rapoarte (doar directori).</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Mesaje',
    roles: ['profesor', 'părinte'],
    icon: <MessageSquare className="h-3.5 w-3.5" />,
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc list-inside space-y-1">
          <li>Conversațiile sunt private între părinte și educator.</li>
          <li>Mesajele noi sunt semnalate prin notificări și badge pe pictograma modulului.</li>
          <li>Poți trimite text. Fișierele se partajează prin modulul Documente.</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Documente',
    roles: ['profesor', 'părinte'],
    icon: <FileText className="h-3.5 w-3.5" />,
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Vizualizare:</strong> Documentele sunt organizate pe categorii (acte, regulamente, fișe).</li>
          <li><strong>Upload (profesor):</strong> Apasă „Încarcă document" → selectează categoria → alege fișierul → confirmă.</li>
          <li><strong>Ștergere (profesor):</strong> Apasă pe documentul dorit → confirma ștergerea.</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Meniul Săptămânii',
    roles: ['profesor', 'părinte', 'administrator'],
    icon: <UtensilsCrossed className="h-3.5 w-3.5" />,
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc list-inside space-y-1">
          <li>Meniul afișează preparatele pentru fiecare zi a săptămânii (mic dejun, prânz, gustare).</li>
          <li><strong>Editare (admin):</strong> Din panoul de administrare → tab „Meniu" → selectează ziua → completează preparatele.</li>
          <li>Datele nutriționale (calorii, proteine, etc.) se completează opțional pentru fiecare preparat.</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Orar',
    roles: ['profesor', 'director', 'administrator'],
    icon: <Calendar className="h-3.5 w-3.5" />,
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc list-inside space-y-1">
          <li>Orarul afișează programul zilnic pe intervale orare.</li>
          <li><strong>Vizualizare:</strong> Navigare pe zile și vizualizare activități/profesori asignați.</li>
          <li><strong>Editare (admin/director):</strong> Click pe o celulă din orar → completează activitatea și profesorul.</li>
          <li><strong>Orar cancelarie (director):</strong> Secțiune dedicată cu profesorii care au orar de cancelarie.</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Povești',
    roles: ['profesor', 'părinte'],
    icon: <BookOpenCheck className="h-3.5 w-3.5" />,
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc list-inside space-y-1">
          <li>Biblioteca de povești educative cu ilustrații și text.</li>
          <li><strong>Citire automată (TTS):</strong> Apasă butonul de redare pentru a asculta povestea.</li>
          <li>Poveștile sunt organizate pe categorii și personaje.</li>
          <li><strong>Adăugare (profesor):</strong> Creează o poveste nouă cu text, alege un personaj și generează vocea automată.</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Ateliere',
    roles: ['profesor', 'părinte'],
    icon: <Paintbrush className="h-3.5 w-3.5" />,
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc list-inside space-y-1">
          <li>Secțiune pentru activități creative și ateliere tematice.</li>
          <li><strong>Vizualizare:</strong> Lista atelierelor active, cu descriere și imagine.</li>
          <li><strong>Creare (profesor/admin):</strong> Adaugă atelier nou → completează titlul, descrierea, categoria → publică.</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Anunțuri',
    roles: ['director', 'administrator'],
    icon: <Megaphone className="h-3.5 w-3.5" />,
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc list-inside space-y-1">
          <li>Anunțurile apar pe banda de informare (ticker) din partea de jos a dashboard-ului.</li>
          <li><strong>Creare:</strong> Apasă „Anunț nou" → scrie textul → setează prioritatea (normal/urgent).</li>
          <li>Anunțurile urgente sunt evidențiate vizual pe ticker.</li>
          <li>Poți ascunde un anunț din ticker fără a-l șterge definitiv.</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Rapoarte',
    roles: ['director'],
    icon: <BarChart3 className="h-3.5 w-3.5" />,
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc list-inside space-y-1">
          <li>Grafice interactive de prezență (zilnică, săptămânală, lunară).</li>
          <li>Filtrare pe grupă, perioadă sau copil individual.</li>
          <li>Statistici de activitate: ateliere organizate, mesaje trimise, documente încărcate.</li>
          <li>Export date în format tabelar.</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'InfoDisplay',
    roles: ['profesor', 'administrator'],
    icon: <Monitor className="h-3.5 w-3.5" />,
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc list-inside space-y-1">
          <li>Configurează conținutul afișat pe ecranele TV din holul unității.</li>
          <li>Selectează ce informații se afișează: prezența zilei, meniul, anunțuri, orarul.</li>
          <li>Generare automată de conținut video pentru afișare.</li>
          <li>Codul QR de autentificare rapidă este afișat automat pe InfoDisplay.</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Social Media (Facebook & WhatsApp)',
    roles: ['administrator'],
    icon: <Share2 className="h-3.5 w-3.5" />,
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Facebook:</strong> Sincronizează anunțuri și activități pe pagina de Facebook a unității.</li>
          <li><strong>WhatsApp:</strong> Configurează maparea grupelor pe grupuri WhatsApp pentru notificări automate.</li>
          <li>Ambele necesită configurare inițială din setări de către administrator.</li>
        </ul>
      </div>
    ),
  },
];

const ADMIN_GUIDES: DocSection[] = [
  {
    title: 'Gestionare școli',
    roles: ['administrator'],
    icon: <School className="h-3.5 w-3.5" />,
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Adăugare:</strong> Panoul Admin → tab „Școli" → „Adaugă unitate" → completează numele, adresa, datele de contact.</li>
          <li><strong>Editare:</strong> Click pe unitate → modifică informațiile → salvează.</li>
          <li><strong>Dezactivare:</strong> O unitate dezactivată nu mai apare în aplicație, dar datele sunt păstrate.</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Gestionare utilizatori și roluri',
    roles: ['administrator'],
    icon: <UserCog className="h-3.5 w-3.5" />,
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Creare cont:</strong> Tab „Utilizatori" → „Adaugă utilizator" → completează numele, telefonul, PIN-ul, rolul.</li>
          <li><strong>Asignare rol:</strong> Un utilizator poate avea mai multe roluri (ex: profesor + director).</li>
          <li><strong>Resetare PIN:</strong> Selectează utilizatorul → „Resetare PIN" → comunică noul PIN.</li>
          <li><strong>Asociere copii:</strong> Pentru părinți, asociază copilul/copiii la contul lor.</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Setări sistem',
    roles: ['administrator'],
    icon: <Settings className="h-3.5 w-3.5" />,
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc list-inside space-y-1">
          <li>Configurează numele și sigla aplicației din tab-ul „Branding".</li>
          <li>Setează culorile temei, modulele active/inactive și ordinea lor.</li>
          <li>Configurează notificările push și intervalele de sincronizare.</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Gestionare sponsori',
    roles: ['administrator'],
    icon: <Star className="h-3.5 w-3.5" />,
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <ul className="list-disc list-inside space-y-1">
          <li>Sponsorii pot afișa campanii pe dashboard-ul aplicației (card, ticker, banner).</li>
          <li><strong>Adăugare:</strong> Tab „Sponsori" → creează cont sponsor → definește campania.</li>
          <li>Fiecare sponsor primește acces la un dashboard propriu pentru statistici.</li>
          <li>Rotația sponsorilor pe dashboard se configurează din setări.</li>
        </ul>
      </div>
    ),
  },
];

const FAQ_ITEMS: DocSection[] = [
  {
    title: 'Cum îmi schimb PIN-ul?',
    content: (
      <div className="text-sm text-muted-foreground">
        <p>Contactează administratorul unității tale. Din motive de securitate, PIN-ul poate fi resetat doar de un administrator din panoul de administrare.</p>
      </div>
    ),
  },
  {
    title: 'De ce nu văd un modul?',
    content: (
      <div className="text-sm text-muted-foreground space-y-1">
        <p>Modulele vizibile depind de rolul tău. De exemplu, un părinte nu vede modulul Rapoarte sau Panoul Admin.</p>
        <p>Dacă crezi că ar trebui să ai acces, contactează administratorul pentru a-ți verifica rolurile.</p>
      </div>
    ),
  },
  {
    title: 'Cum adaug un copil nou?',
    content: (
      <div className="text-sm text-muted-foreground">
        <p>Adăugarea copiilor se face de către administrator din secțiunea Utilizatori. Administratorul asociază copilul la grupa corectă și la contul părintelui.</p>
      </div>
    ),
  },
  {
    title: 'Cum funcționează notificările?',
    content: (
      <div className="text-sm text-muted-foreground space-y-1">
        <p>Aplicația trimite notificări push pentru: mesaje noi, anunțuri urgente și actualizări de prezență.</p>
        <p>Asigură-te că ai permis notificările în setările telefonului pentru această aplicație.</p>
      </div>
    ),
  },
  {
    title: 'Cum contactez suportul?',
    content: (
      <div className="text-sm text-muted-foreground">
        <p>Pentru probleme tehnice, contactează administratorul unității tale. Pentru probleme ale platformei, administratorul poate contacta echipa de suport TID4K prin secțiunea Setări → Suport.</p>
      </div>
    ),
  },
  {
    title: 'Pot folosi aplicația pe calculator?',
    content: (
      <div className="text-sm text-muted-foreground">
        <p>Da! TID4K funcționează pe orice dispozitiv cu browser web: telefon, tabletă sau calculator. Interfața se adaptează automat la dimensiunea ecranului.</p>
      </div>
    ),
  },
];

/* ── Main Component ─────────────────────────────────────────── */

export default function UserGuideTab() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Ghid Utilizare</h2>
        <Badge variant="secondary" className="text-[10px]">v1.0</Badge>
      </div>
      <p className="text-sm text-muted-foreground -mt-2 mb-4">
        Documentație practică pentru utilizarea aplicației, organizată pe roluri și module.
      </p>

      {/* 1. Overview */}
      <DocGroup title="Prezentare generală" icon={<BookOpen className="h-4 w-4" />} defaultOpen>
        {OVERVIEW.map((s, i) => <DocItem key={i} {...s} />)}
      </DocGroup>

      {/* 2. Role guides */}
      <DocGroup title="Ghid rapid per rol" icon={<Users className="h-4 w-4" />}>
        {ROLE_GUIDES.map((s, i) => <DocItem key={i} {...s} />)}
      </DocGroup>

      {/* 3. Module guides */}
      <DocGroup title="Ghiduri pe module" icon={<BookOpenCheck className="h-4 w-4" />}>
        {MODULE_GUIDES.map((s, i) => <DocItem key={i} {...s} />)}
      </DocGroup>

      {/* 4. Admin operations */}
      <DocGroup title="Administrare" icon={<Settings className="h-4 w-4" />}>
        {ADMIN_GUIDES.map((s, i) => <DocItem key={i} {...s} />)}
      </DocGroup>

      {/* 5. FAQ */}
      <DocGroup title="Întrebări frecvente (FAQ)" icon={<HelpCircleIcon className="h-4 w-4" />}>
        {FAQ_ITEMS.map((s, i) => <DocItem key={i} {...s} />)}
      </DocGroup>
    </div>
  );
}

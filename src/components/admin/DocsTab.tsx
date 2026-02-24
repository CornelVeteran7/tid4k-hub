import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';

interface DocSection {
  title: string;
  content: React.ReactNode;
}

const WORKSHOP_SECTIONS: DocSection[] = [
  {
    title: 'Crearea unui atelier',
    content: (
      <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
        <li>Mergi la <strong>Panou Admin → Ateliere</strong></li>
        <li>Click <strong>Atelier nou</strong></li>
        <li>Completează: titlu, descriere, categorie, lună, instructor, durată, materiale</li>
        <li>Alege destinația: <strong>Toate unitățile</strong> sau o școală specifică</li>
        <li>Click <strong>Creează</strong> — atelierul e salvat ca Draft</li>
      </ol>
    ),
  },
  {
    title: 'Publicarea unui atelier',
    content: (
      <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
        <li>Găsește cardul de atelier în stare Draft</li>
        <li>Click <strong>Publică</strong></li>
        <li>Selectează școlile țintă în dialogul de confirmare</li>
        <li>Click <strong>Publică și notifică</strong></li>
        <li>Atelierul devine vizibil pe dashboard-urile profesorilor + notificare push</li>
      </ol>
    ),
  },
  {
    title: 'Editare după publicare',
    content: (
      <p className="text-sm text-muted-foreground">
        Poți edita un atelier publicat. Modificările sunt reflectate imediat pe toate dashboard-urile.
      </p>
    ),
  },
];

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
    title: 'Canale de afișare',
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p><strong>Card Dashboard</strong> — Pe pagina principală, cu logo, titlu, descriere și buton CTA.</p>
        <p><strong>Ticker</strong> — Bară fixă în partea de jos, text scrollabil cu badge.</p>
        <p><strong>Inky Popup</strong> — Meniul asistentului virtual, buton cu logo sponsor.</p>
        <p><strong>Infodisplay</strong> — Ecranele TV din hol, panou dedicat cu QR code.</p>
      </div>
    ),
  },
  {
    title: 'Rotația sponsorilor',
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Rotația e <strong>complet automată</strong>. Un singur sponsor apare la un moment dat pe fiecare canal.</p>
        <p>Timpul de afișare e proporțional cu prețul planului: <code className="bg-muted px-1 rounded">timp = (preț_plan / suma_prețuri) × 60s</code></p>
        <p><strong>Exemplu</strong>: Kaufland (Enterprise, 3000 RON) = ~51s, Lidl (Basic, 500 RON) = ~9s dintr-un ciclu de 60s.</p>
      </div>
    ),
  },
  {
    title: 'Gestionarea campaniilor',
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Fiecare sponsor poate avea mai multe campanii simultane pe canale diferite.</p>
        <div className="flex flex-wrap gap-1.5 mt-1">
          <Badge variant="outline">draft — în pregătire</Badge>
          <Badge variant="outline">activ — rulează</Badge>
          <Badge variant="outline">pauza — oprită temporar</Badge>
          <Badge variant="outline">expirat — data a trecut</Badge>
          <Badge variant="outline">arhivat — scos din circulație</Badge>
        </div>
      </div>
    ),
  },
  {
    title: 'Statistici & Rapoarte',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong>Afișări</strong> — De câte ori a fost afișat cardul/mesajul.</p>
        <p><strong>Click-uri</strong> — Interacțiuni ale utilizatorilor.</p>
        <p><strong>CTR</strong> — Rata de click (click-uri / afișări × 100).</p>
        <p>Dashboard self-service accesibil la <code className="bg-muted px-1 rounded">/sponsor-dashboard</code>.</p>
      </div>
    ),
  },
];

const API_ENDPOINTS = [
  { method: 'GET', endpoint: '/ateliere.php?action=list', desc: 'Listare ateliere (filtre: school_id, luna)' },
  { method: 'GET', endpoint: '/ateliere.php?action=current', desc: 'Atelierul lunii curente' },
  { method: 'POST', endpoint: '/ateliere.php?action=create', desc: 'Creare atelier' },
  { method: 'POST', endpoint: '/ateliere.php?action=update', desc: 'Editare atelier' },
  { method: 'POST', endpoint: '/ateliere.php?action=publish', desc: 'Publicare + notificare' },
  { method: 'POST', endpoint: '/ateliere.php?action=delete', desc: 'Ștergere atelier' },
  { method: 'GET', endpoint: '/sponsors.php?action=sponsors', desc: 'Toți sponsorii' },
  { method: 'GET', endpoint: '/sponsors.php?action=active_promos', desc: 'Promo-uri active' },
  { method: 'GET', endpoint: '/sponsors.php?action=rotation_config', desc: 'Config rotație' },
  { method: 'POST', endpoint: '/sponsors.php?action=log_impression', desc: 'Log afișare' },
  { method: 'POST', endpoint: '/sponsors.php?action=log_click', desc: 'Log click' },
];

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

export default function DocsTab() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Documentație
        </h2>
        <p className="text-sm text-muted-foreground">Ghid de utilizare pentru funcționalitățile platformei</p>
      </div>

      <Card>
        <CardContent className="p-2 divide-y divide-border/50">
          <DocGroup title="Ateliere — Ghid Admin" badge="ateliere" sections={WORKSHOP_SECTIONS} />
          <DocGroup title="Sponsori — Ghid Operațional" badge="sponsori" sections={SPONSOR_SECTIONS} />
        </CardContent>
      </Card>

      {/* API Reference */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            Referință API
            <Badge variant="outline" className="text-[10px]">dev</Badge>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-1.5 pr-3 text-left font-medium">Metodă</th>
                  <th className="py-1.5 pr-3 text-left font-medium">Endpoint</th>
                  <th className="py-1.5 text-left font-medium">Descriere</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {API_ENDPOINTS.map((ep, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td className="py-1.5 pr-3">
                      <Badge variant={ep.method === 'GET' ? 'secondary' : 'default'} className="text-[10px] font-mono">
                        {ep.method}
                      </Badge>
                    </td>
                    <td className="py-1.5 pr-3 font-mono text-[11px]">{ep.endpoint}</td>
                    <td className="py-1.5">{ep.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

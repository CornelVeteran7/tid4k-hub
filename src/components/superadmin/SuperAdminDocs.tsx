import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocsTab from '@/components/admin/DocsTab';
import UserGuideTab from '@/components/admin/UserGuideTab';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Inline markdown docs content
const SPONSORS_DOC = `# Sistemul de Sponsorizare TID4K

## Pachete disponibile
- **Basic (500 RON/lună)**: Card Dashboard + Ticker
- **Premium (1.500 RON/lună)**: + Infodisplay + Inky Popup
- **Enterprise (3.000 RON/lună)**: + Branding custom Inky + Rapoarte complete

## Canale de afișare
1. **Card Dashboard** — vizibil pe pagina principală
2. **Ticker** — bandă fixă scrollabilă
3. **Inky Popup** — meniu asistent virtual
4. **Infodisplay** — ecrane TV din hol

## Rotația sponsorilor
- Doar UN sponsor afișat la un moment dat per canal
- Timpul proporțional cu prețul planului
- Ciclu implicit: 60 secunde

## Statistici: Afișări, Click-uri, CTR per campanie`;

const WORKSHOPS_DOC = `# Workshop (Ateliere) Management

## Flux de lucru
1. Creare atelier → status Draft
2. Publicare → selectare școli target → notificare push
3. Editare post-publicare → reflectare imediată

## Categorii: artă, știință, muzică, sport, natură

## API Endpoints
- GET /ateliere.php?action=list — listare ateliere
- POST /ateliere.php?action=create — creare
- POST /ateliere.php?action=publish — publicare + notificare`;

export default function SuperAdminDocs() {
  const [search, setSearch] = useState('');

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

      <Tabs defaultValue="architecture" className="space-y-4">
        <TabsList>
          <TabsTrigger value="architecture">Arhitectură & API</TabsTrigger>
          <TabsTrigger value="guides">Ghiduri Utilizator</TabsTrigger>
          <TabsTrigger value="modules">Module</TabsTrigger>
        </TabsList>

        <TabsContent value="architecture">
          <DocsTab />
        </TabsContent>

        <TabsContent value="guides">
          <UserGuideTab />
        </TabsContent>

        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">📢 Sponsorizare</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans">{SPONSORS_DOC}</pre>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🎨 Ateliere</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans">{WORKSHOPS_DOC}</pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

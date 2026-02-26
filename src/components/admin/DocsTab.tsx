import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight, Server, Shield, Layout, Globe } from 'lucide-react';
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
        <p><strong className="text-foreground">Frontend:</strong> React 18 + TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, React Query</p>
        <p><strong className="text-foreground">Backend:</strong> PHP / MariaDB (server propriu). Toate request-urile trec prin <code className="bg-muted px-1 rounded text-xs">apiFetch()</code> din <code className="bg-muted px-1 rounded text-xs">src/api/config.ts</code>.</p>
        <p><strong className="text-foreground">Mock mode:</strong> Variabila <code className="bg-muted px-1 rounded text-xs">USE_MOCK = true</code> în <code className="bg-muted px-1 rounded text-xs">config.ts</code> activează date simulate. Pentru producție, setează <code className="bg-muted px-1 rounded text-xs">USE_MOCK = false</code> și actualizează <code className="bg-muted px-1 rounded text-xs">BASE_URL</code>.</p>
        <p><strong className="text-foreground">Autentificare:</strong> Login cu telefon + PIN. Token JWT salvat în <code className="bg-muted px-1 rounded text-xs">localStorage</code> și trimis ca header <code className="bg-muted px-1 rounded text-xs">Authorization: Bearer</code>.</p>
      </div>
    ),
  },
  {
    title: 'Structura de fișiere API',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p>Fiecare modul are propriul fișier în <code className="bg-muted px-1 rounded text-xs">src/api/</code>:</p>
        <div className="font-mono text-xs bg-muted/50 rounded-lg p-3 space-y-0.5">
          <p>config.ts — BASE_URL, USE_MOCK, apiFetch(), getAuthHeaders()</p>
          <p>auth.ts — login, logout, qrLogin, validateSession</p>
          <p>attendance.ts — getAttendance, saveAttendance, getWeeklyAttendance</p>
          <p>announcements.ts — getAnnouncements, createAnnouncement, hideFromTicker</p>
          <p>children.ts — getChildren, getChildrenByGroup</p>
          <p>documents.ts — getDocuments, uploadDocument, deleteDocument</p>
          <p>menu.ts — getMenu, saveMenu, getNutritionalData</p>
          <p>messages.ts — getConversations, getMessages, sendMessage</p>
          <p>schedule.ts — getSchedule, saveSchedule, getCancelarieTeachers</p>
          <p>reports.ts — getAttendanceReport, getActivityReport</p>
          <p>schools.ts — getSchools, createSchool, updateSchool, deleteSchool</p>
          <p>users.ts — getUsers, getUser, createUser, updateUser, deleteUser</p>
          <p>stories.ts — getStories, createStory, generateTTS</p>
          <p>workshops.ts — getWorkshops, createWorkshop, publishWorkshop</p>
          <p>sponsors.ts — getSponsors, getActivePromos, getRotationConfig</p>
          <p>facebook.ts — getFacebookSettings, postToFacebook, getPostLog</p>
          <p>whatsapp.ts — getWhatsappMappings, createMapping, syncStatus</p>
          <p>infodisplay.ts — getInfodisplayContent, generateVideo</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Roluri utilizator',
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Rolurile sunt stocate ca CSV în câmpul <code className="bg-muted px-1 rounded text-xs">status</code> (ex: <code className="bg-muted px-1 rounded text-xs">"profesor,director"</code>).</p>
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
              <tr><td className="py-1 pr-3 font-medium">inky</td><td>Superuser — acces la toate funcționalitățile</td></tr>
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
        <p><strong className="text-foreground">AuthContext</strong> — Sesiunea utilizatorului, login/logout, roluri. Wraps toată aplicația.</p>
        <p><strong className="text-foreground">GroupContext</strong> — Grupa/clasa selectată curent. Determină ce date se afișează.</p>
        <p><strong className="text-foreground">NotificationContext</strong> — Contoare mesaje necitite, anunțuri noi.</p>
        <p><strong className="text-foreground">ExternalLinkContext</strong> — Dialog confirmare pentru link-uri externe (PWA safe).</p>
      </div>
    ),
  },
  {
    title: 'Baza de date — Convenții',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p>Backend-ul folosește <strong>tabel-naming dinamic</strong>: tabela de prezență se numește <code className="bg-muted px-1 rounded text-xs">prezenta_[group_id]</code> (ex: <code className="bg-muted px-1 rounded text-xs">prezenta_grupa_mare</code>).</p>
        <p>ID-urile grupelor au formatul <code className="bg-muted px-1 rounded text-xs">[school_id]_[group_name]</code> (ex: <code className="bg-muted px-1 rounded text-xs">1_grupa_mare</code>).</p>
        <p>Toate datele calendaristice sunt în format ISO 8601 (<code className="bg-muted px-1 rounded text-xs">YYYY-MM-DD</code>).</p>
      </div>
    ),
  },
];

// ===================================================================
// SECTION: PAGINI
// ===================================================================
const PAGE_SECTIONS: DocSection[] = [
  {
    title: '/ — Dashboard (pagina principală)',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/Dashboard.tsx</code></p>
        <p><strong className="text-foreground">Descriere:</strong> Hub central cu banner de bun venit, statistici rapide (prezență, fotografii, documente, mesaje), charts analitice (desktop), grila de module interactive și ticker anunțuri.</p>
        <p><strong className="text-foreground">Module:</strong> Carduri colorate care se deschid in-place (mobile: fullscreen, desktop: panel lateral) folosind Framer Motion layoutId.</p>
        <p><strong className="text-foreground">Fundal:</strong> SVG inline cu linii topografice, flori și albine decorative.</p>
        <p><strong className="text-foreground">Configurabil:</strong> Sidebar lateral permite ascunderea/afișarea modulelor (salvat în localStorage).</p>
        <p><strong className="text-foreground">Acces:</strong> Toți utilizatorii autentificați.</p>
      </div>
    ),
  },
  {
    title: '/login — Autentificare',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/Login.tsx</code></p>
        <p><strong className="text-foreground">Descriere:</strong> Formular login cu telefon + PIN, plus opțiune de login prin QR code.</p>
        <p><strong className="text-foreground">API:</strong> <code className="bg-muted px-1 rounded text-xs">POST /auth.php?action=login</code> — body: <code className="bg-muted px-1 rounded text-xs">{`{telefon, pin}`}</code></p>
        <p><strong className="text-foreground">API QR:</strong> <code className="bg-muted px-1 rounded text-xs">POST /auth.php?action=qr_login</code> — body: <code className="bg-muted px-1 rounded text-xs">{`{session_id}`}</code></p>
        <p><strong className="text-foreground">Răspuns:</strong> Obiect <code className="bg-muted px-1 rounded text-xs">UserSession</code> cu roluri, grupe disponibile, index grupă curentă.</p>
      </div>
    ),
  },
  {
    title: '/prezenta — Prezența',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/Attendance.tsx</code></p>
        <p><strong className="text-foreground">Descriere:</strong> Grid săptămânal (L-V) cu checkbox-uri per copil/zi. Header galben cu contor „Prezenți: X/Y". Suportă vizualizare lunară cu statistici, calcul contribuții financiare (25 RON/zi), export Excel/PDF. Optimizat pentru printare cu <code className="bg-muted px-1 rounded text-xs">@media print</code>.</p>
        <p><strong className="text-foreground">API GET:</strong> <code className="bg-muted px-1 rounded text-xs">GET /prezenta.php?action=get_weekly&grupa=X&data=YYYY-MM-DD</code></p>
        <p><strong className="text-foreground">API SAVE:</strong> <code className="bg-muted px-1 rounded text-xs">POST /prezenta.php?action=save_weekly</code> — body: <code className="bg-muted px-1 rounded text-xs">{`{grupa, saptamana_start, saptamana_end, records[]}`}</code></p>
        <p><strong className="text-foreground">API STATS:</strong> <code className="bg-muted px-1 rounded text-xs">GET /prezenta.php?action=stats&grupa=X&luna=M&an=Y</code></p>
        <p><strong className="text-foreground">Acces:</strong> profesor, director, administrator (parinte: doar vizualizare).</p>
      </div>
    ),
  },
  {
    title: '/documente — Documente',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/Documents.tsx</code></p>
        <p><strong className="text-foreground">Descriere:</strong> Galerie de fișiere cu filtrare pe categorii (activități, administrativ, teme, fotografii). Upload drag-and-drop, vizualizare thumbnail, ștergere.</p>
        <p><strong className="text-foreground">API LIST:</strong> <code className="bg-muted px-1 rounded text-xs">GET /documente.php?action=list&grupa=X&categorie=Y</code></p>
        <p><strong className="text-foreground">API UPLOAD:</strong> <code className="bg-muted px-1 rounded text-xs">POST /documente.php?action=upload</code> — FormData cu file, grupa, categorie</p>
        <p><strong className="text-foreground">API DELETE:</strong> <code className="bg-muted px-1 rounded text-xs">POST /documente.php?action=delete&id=N</code></p>
        <p><strong className="text-foreground">Tipuri acceptate:</strong> PDF, JPG, PNG, GIF, WEBP.</p>
        <p><strong className="text-foreground">Acces:</strong> Toți (upload: profesor+).</p>
      </div>
    ),
  },
  {
    title: '/mesaje — Mesaje',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/Messages.tsx</code></p>
        <p><strong className="text-foreground">Descriere:</strong> Chat în timp real între profesori și părinți. Lista conversații cu contor necitite, view detaliat cu bule de mesaj.</p>
        <p><strong className="text-foreground">API CONVERSATIONS:</strong> <code className="bg-muted px-1 rounded text-xs">GET /mesaje.php?action=conversations&id_utilizator=N</code></p>
        <p><strong className="text-foreground">API MESSAGES:</strong> <code className="bg-muted px-1 rounded text-xs">GET /mesaje.php?action=messages&grupa=X&id_utilizator=N</code></p>
        <p><strong className="text-foreground">API SEND:</strong> <code className="bg-muted px-1 rounded text-xs">POST /mesaje.php?action=send</code> — body: <code className="bg-muted px-1 rounded text-xs">{`{grupa, destinatar, mesaj}`}</code></p>
        <p><strong className="text-foreground">Acces:</strong> Toți utilizatorii autentificați.</p>
      </div>
    ),
  },
  {
    title: '/anunturi — Anunțuri',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/Announcements.tsx</code></p>
        <p><strong className="text-foreground">Descriere:</strong> Listă completă de anunțuri cu prioritate (normal/urgent). Anunțurile urgente au indicator roșu pulsant. Creare anunțuri noi, ascundere/restaurare din ticker.</p>
        <p><strong className="text-foreground">API LIST:</strong> <code className="bg-muted px-1 rounded text-xs">GET /anunturi.php?action=list&grupa=X</code></p>
        <p><strong className="text-foreground">API CREATE:</strong> <code className="bg-muted px-1 rounded text-xs">POST /anunturi.php?action=create</code></p>
        <p><strong className="text-foreground">API HIDE:</strong> <code className="bg-muted px-1 rounded text-xs">POST /anunturi.php?action=hide_banda&id=N</code></p>
        <p><strong className="text-foreground">API RESTORE:</strong> <code className="bg-muted px-1 rounded text-xs">POST /anunturi.php?action=restore_banda&id=N</code></p>
        <p><strong className="text-foreground">Ticker:</strong> Anunțurile cu <code className="bg-muted px-1 rounded text-xs">ascuns_banda=false</code> apar în bara fixă de jos, ordonate după <code className="bg-muted px-1 rounded text-xs">pozitie_banda</code>.</p>
      </div>
    ),
  },
  {
    title: '/orar — Orar',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/Schedule.tsx</code></p>
        <p><strong className="text-foreground">Descriere:</strong> Tabel orar săptămânal color-coded per materie. Editabil de profesor/administrator.</p>
        <p><strong className="text-foreground">API GET:</strong> <code className="bg-muted px-1 rounded text-xs">GET /orar.php?action=get&grupa=X</code></p>
        <p><strong className="text-foreground">API SAVE:</strong> <code className="bg-muted px-1 rounded text-xs">POST /orar.php?action=save</code> — body: <code className="bg-muted px-1 rounded text-xs">{`{grupa, cells[]}`}</code></p>
        <p><strong className="text-foreground">Date:</strong> Fiecare celulă: <code className="bg-muted px-1 rounded text-xs">{`{zi, ora, materie, profesor, culoare}`}</code></p>
        <p><strong className="text-foreground">Acces:</strong> Toți (editare: profesor+).</p>
      </div>
    ),
  },
  {
    title: '/orar-cancelarie — Orar Cancelarie',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/ScheduleCancelarie.tsx</code></p>
        <p><strong className="text-foreground">Descriere:</strong> Vizualizare profesori cu avatar, QR code personal, calendar absențe și activități. Destinat directorilor.</p>
        <p><strong className="text-foreground">API:</strong> <code className="bg-muted px-1 rounded text-xs">GET /orar.php?action=cancelarie</code></p>
        <p><strong className="text-foreground">Răspuns:</strong> Array de <code className="bg-muted px-1 rounded text-xs">CancelarieTeacher</code> cu <code className="bg-muted px-1 rounded text-xs">qr_data</code>, <code className="bg-muted px-1 rounded text-xs">absent_dates[]</code>, <code className="bg-muted px-1 rounded text-xs">activitati[]</code>.</p>
        <p><strong className="text-foreground">Acces:</strong> director, administrator.</p>
      </div>
    ),
  },
  {
    title: '/meniu — Meniul Săptămânii',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/WeeklyMenu.tsx</code></p>
        <p><strong className="text-foreground">Descriere:</strong> Meniu zilnic cu 4 mese (mic dejun, gustare 1, prânz, gustare 2), date nutriționale (kcal, proteine, etc.), lista alergeni, semnături digitale (director, asistent medical, administrator).</p>
        <p><strong className="text-foreground">API GET:</strong> <code className="bg-muted px-1 rounded text-xs">GET /meniu.php?action=get&saptamana=YYYY-WNN</code></p>
        <p><strong className="text-foreground">API SAVE:</strong> <code className="bg-muted px-1 rounded text-xs">POST /meniu.php?action=save</code> — body: obiect <code className="bg-muted px-1 rounded text-xs">WeeklyMenu</code> complet</p>
        <p><strong className="text-foreground">API NUTRITIONAL:</strong> <code className="bg-muted px-1 rounded text-xs">GET /meniu.php?action=nutritional&saptamana=YYYY-WNN</code></p>
        <p><strong className="text-foreground">Acces:</strong> Toți (editare: profesor+).</p>
      </div>
    ),
  },
  {
    title: '/povesti — Povești',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/Stories.tsx</code></p>
        <p><strong className="text-foreground">Descriere:</strong> Bibliotecă de povești pentru copii, categorizate (educative, morale, distractive) și filtrate pe vârstă (3-5, 5-7, 7-10). Suport TTS (text-to-speech) pentru citire audio.</p>
        <p><strong className="text-foreground">API LIST:</strong> <code className="bg-muted px-1 rounded text-xs">GET /povesti.php?action=list</code></p>
        <p><strong className="text-foreground">API CREATE:</strong> <code className="bg-muted px-1 rounded text-xs">POST /povesti.php?action=create</code></p>
        <p><strong className="text-foreground">API TTS:</strong> <code className="bg-muted px-1 rounded text-xs">POST /povesti.php?action=tts&id=N</code> — returnează <code className="bg-muted px-1 rounded text-xs">{`{audio_url}`}</code></p>
        <p><strong className="text-foreground">Acces:</strong> Toți.</p>
      </div>
    ),
  },
  {
    title: '/rapoarte — Rapoarte',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/Reports.tsx</code></p>
        <p><strong className="text-foreground">Descriere:</strong> Dashboard analitic cu grafice: tendințe prezență (line chart), activitate utilizatori (bar chart), documente pe categorii (pie chart). Filtrare pe grupă și perioadă.</p>
        <p><strong className="text-foreground">API:</strong> <code className="bg-muted px-1 rounded text-xs">GET /rapoarte.php?action=attendance&grupa=X&start=D1&end=D2</code></p>
        <p><strong className="text-foreground">API:</strong> <code className="bg-muted px-1 rounded text-xs">GET /rapoarte.php?action=activity</code></p>
        <p><strong className="text-foreground">Acces:</strong> director, administrator.</p>
      </div>
    ),
  },
  {
    title: '/admin — Panou Administrare',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/AdminPanel.tsx</code></p>
        <p><strong className="text-foreground">Descriere:</strong> Panou central cu taburi: Școli, Utilizatori, Orar, Meniu, Ateliere, Setări, Docs, Branding. Selector global de școală în header.</p>
        <p><strong className="text-foreground">Subcomponente:</strong></p>
        <p className="pl-3">• <code className="bg-muted px-1 rounded text-xs">SchoolsTab</code> — CRUD școli/grădinițe</p>
        <p className="pl-3">• <code className="bg-muted px-1 rounded text-xs">UsersTab</code> — Gestionare utilizatori și roluri</p>
        <p className="pl-3">• <code className="bg-muted px-1 rounded text-xs">ScheduleTab</code> — Editare orar pe școală</p>
        <p className="pl-3">• <code className="bg-muted px-1 rounded text-xs">MenuTab</code> — Editare meniu pe școală</p>
        <p className="pl-3">• <code className="bg-muted px-1 rounded text-xs">WorkshopsTab</code> — Creare/publicare ateliere</p>
        <p className="pl-3">• <code className="bg-muted px-1 rounded text-xs">SettingsTab</code> — API keys, notificări</p>
        <p className="pl-3">• <code className="bg-muted px-1 rounded text-xs">DocsTab</code> — Această documentație</p>
        <p className="pl-3">• <code className="bg-muted px-1 rounded text-xs">BrandingTab</code> — Ghid identitate vizuală</p>
        <p><strong className="text-foreground">Acces:</strong> administrator.</p>
      </div>
    ),
  },
  {
    title: '/sponsori — Gestionare Sponsori',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/SponsorAdmin.tsx</code></p>
        <p><strong className="text-foreground">Descriere:</strong> Interfață admin pentru sponsori. Listă cu statistici globale (afișări, click-uri, CTR), detaliu per sponsor cu campanii active, editor campanii cu preview live pe 3 canale (Card, Ticker, Inky).</p>
        <p><strong className="text-foreground">API:</strong> Vezi secțiunea API Sponsori mai jos.</p>
        <p><strong className="text-foreground">Rotație:</strong> Automată, proporțională cu prețul planului. Ciclu de 60s.</p>
        <p><strong className="text-foreground">Acces:</strong> administrator, sponsor (doar propriile campanii).</p>
      </div>
    ),
  },
  {
    title: '/infodisplay — InfoDisplay',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/Infodisplay.tsx</code></p>
        <p><strong className="text-foreground">Descriere:</strong> Ecran de avizier digital pentru TV-uri din holul școlii. Panouri rotative (anunțuri, meniu, orar, galerie foto) cu tranziții fade/slide, ticker în partea de jos, QR codes pentru acces rapid.</p>
        <p><strong className="text-foreground">API:</strong> <code className="bg-muted px-1 rounded text-xs">GET /infodisplay.php?action=content</code></p>
        <p><strong className="text-foreground">Răspuns:</strong> <code className="bg-muted px-1 rounded text-xs">InfodisplayConfig</code> cu panels[], ticker_messages[], qr_codes[], transition type.</p>
        <p><strong className="text-foreground">API Video:</strong> <code className="bg-muted px-1 rounded text-xs">POST /infodisplay.php?action=generate_video</code> — generare video recap.</p>
        <p><strong className="text-foreground">Acces:</strong> profesor, director, administrator.</p>
      </div>
    ),
  },
  {
    title: '/social-facebook — Social Media Facebook',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/SocialMediaFacebook.tsx</code></p>
        <p><strong className="text-foreground">Descriere:</strong> Publicare automată pe pagina de Facebook a școlii. Configurare page_id, format posting (text+image), log postări.</p>
        <p><strong className="text-foreground">API SETTINGS:</strong> <code className="bg-muted px-1 rounded text-xs">GET /facebook.php?action=settings</code></p>
        <p><strong className="text-foreground">API POST:</strong> <code className="bg-muted px-1 rounded text-xs">POST /facebook.php?action=post</code> — body: <code className="bg-muted px-1 rounded text-xs">{`{content, imageUrl}`}</code></p>
        <p><strong className="text-foreground">API LOG:</strong> <code className="bg-muted px-1 rounded text-xs">GET /facebook.php?action=log</code></p>
        <p><strong className="text-foreground">Notă:</strong> Necesită token Facebook Graph API valid (configurabil în Setări).</p>
      </div>
    ),
  },
  {
    title: '/social-whatsapp — Social Media WhatsApp',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/SocialMediaWhatsapp.tsx</code></p>
        <p><strong className="text-foreground">Descriere:</strong> Sincronizare mesaje între grupele din app și grupurile WhatsApp ale părinților. Mapare grupă → grup WhatsApp, cu opțiune bidirecțional sau one-way.</p>
        <p><strong className="text-foreground">API MAPPINGS:</strong> <code className="bg-muted px-1 rounded text-xs">GET /whatsapp.php?action=mappings</code></p>
        <p><strong className="text-foreground">API CREATE:</strong> <code className="bg-muted px-1 rounded text-xs">POST /whatsapp.php?action=create</code></p>
        <p><strong className="text-foreground">API STATUS:</strong> <code className="bg-muted px-1 rounded text-xs">GET /whatsapp.php?action=status</code> — returnează status sincronizare + last_sync.</p>
        <p><strong className="text-foreground">Notă:</strong> Necesită Twilio WhatsApp Business API (configurabil în Setări).</p>
      </div>
    ),
  },
  {
    title: '/profil — Profilul meu',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/pages/MyProfile.tsx</code></p>
        <p><strong className="text-foreground">Descriere:</strong> Pagina de profil personal cu editare date (nume, email, telefon), vizualizare roluri și grupe asignate.</p>
        <p><strong className="text-foreground">Acces:</strong> Toți utilizatorii autentificați.</p>
      </div>
    ),
  },
];

// ===================================================================
// SECTION: ATELIERE
// ===================================================================
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
    title: 'Categorii disponibile',
    content: (
      <div className="flex flex-wrap gap-1.5 text-sm">
        <Badge variant="outline">Artă</Badge>
        <Badge variant="outline">Știință</Badge>
        <Badge variant="outline">Muzică</Badge>
        <Badge variant="outline">Sport</Badge>
        <Badge variant="outline">Natură</Badge>
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
        <p>Sidebar fix pe desktop (64px larg), hamburger menu pe mobil. Header cu logo, search, notificări, selector grupă, avatar utilizator. Navigare role-based — meniurile se afișează conform rolurilor utilizatorului.</p>
      </div>
    ),
  },
  {
    title: 'ModuleHub + ModuleCard + ModulePanel',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișiere:</strong> <code className="bg-muted px-1 rounded text-xs">src/components/dashboard/Module*.tsx</code></p>
        <p><strong>ModuleHub</strong> — Grid de carduri module, filtrat prin visibility config + search.</p>
        <p><strong>ModuleCard</strong> — Card colorat cu icon, titlu, subtitle, contor, share button. Tap scale animation.</p>
        <p><strong>ModulePanel</strong> — Panel fullscreen (mobil) / lateral (desktop) cu Framer Motion layoutId morphing. Încarcă lazy componentele modulelor.</p>
      </div>
    ),
  },
  {
    title: 'AnnouncementsTicker — Bara de anunțuri',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/components/dashboard/AnnouncementsTicker.tsx</code></p>
        <p>Bară fixă în partea de jos cu marquee scrolling. 3 wave SVG layers deasupra pentru blending cu fundalul. Integrează promo-urile sponsorilor (inserate după al 3-lea anunț). Click duce la <code className="bg-muted px-1 rounded text-xs">/anunturi</code>.</p>
      </div>
    ),
  },
  {
    title: 'ChildrenScroller + ChildDetailDialog',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișiere:</strong> <code className="bg-muted px-1 rounded text-xs">src/components/dashboard/Children*.tsx</code></p>
        <p><strong>ChildrenScroller</strong> — Scroll orizontal cu avatar-uri copii, inițiale colorate.</p>
        <p><strong>ChildDetailDialog</strong> — Dialog cu toggle prezență, statistici lunare, contact părinte, calcul costuri mâncare (25 RON/zi).</p>
      </div>
    ),
  },
  {
    title: 'InkyAssistant — Asistent virtual',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/components/InkyAssistant.tsx</code></p>
        <p>Buton floating cu mascota Inky. Deschide meniu cu shortcut-uri, promo-uri sponsori (Inky popup), și acțiuni rapide.</p>
      </div>
    ),
  },
  {
    title: 'SponsorCard — Card sponsor pe dashboard',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/components/dashboard/SponsorCard.tsx</code></p>
        <p>Card cu branding sponsor (logo, gradient, CTA), integrat în grila de module după secțiunea Documente. Rotație automată între sponsori activi.</p>
      </div>
    ),
  },
  {
    title: 'CampaignEditor — Editor campanii sponsor',
    content: (
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Fișier:</strong> <code className="bg-muted px-1 rounded text-xs">src/components/sponsor/CampaignEditor.tsx</code></p>
        <p>Formular complet de editare campanie cu preview live pe 3 canale (CardPreview, TickerPreview, InkyPreview). Configurare stiluri per canal, selectare școli țintă, date start/end.</p>
      </div>
    ),
  },
];

// ===================================================================
// API REFERENCE — COMPLETE
// ===================================================================
const ALL_API_ENDPOINTS = [
  { group: 'Auth', method: 'POST', endpoint: '/auth.php?action=login', desc: 'Login cu telefon + PIN', body: '{telefon, pin}' },
  { group: 'Auth', method: 'POST', endpoint: '/auth.php?action=qr_login', desc: 'Login prin QR code', body: '{session_id}' },
  { group: 'Auth', method: 'POST', endpoint: '/auth.php?action=logout', desc: 'Logout', body: '' },
  { group: 'Auth', method: 'GET', endpoint: '/auth.php?action=validate', desc: 'Validare sesiune curentă', body: '' },
  { group: 'Prezență', method: 'GET', endpoint: '/prezenta.php?action=get&grupa=X&data=D', desc: 'Prezență pe zi', body: '' },
  { group: 'Prezență', method: 'POST', endpoint: '/prezenta.php?action=save', desc: 'Salvare prezență zilnică', body: '{grupa, data, prezente[]}' },
  { group: 'Prezență', method: 'GET', endpoint: '/prezenta.php?action=get_weekly&grupa=X&data=D', desc: 'Prezență săptămânală', body: '' },
  { group: 'Prezență', method: 'POST', endpoint: '/prezenta.php?action=save_weekly', desc: 'Salvare prezență săptămânală', body: '{grupa, records[]}' },
  { group: 'Prezență', method: 'GET', endpoint: '/prezenta.php?action=stats&grupa=X&luna=M&an=Y', desc: 'Statistici lunare', body: '' },
  { group: 'Copii', method: 'GET', endpoint: '/copii.php?action=list', desc: 'Toți copiii', body: '' },
  { group: 'Copii', method: 'GET', endpoint: '/copii.php?action=list&grupa=X', desc: 'Copii pe grupă', body: '' },
  { group: 'Anunțuri', method: 'GET', endpoint: '/anunturi.php?action=list&grupa=X', desc: 'Lista anunțuri', body: '' },
  { group: 'Anunțuri', method: 'POST', endpoint: '/anunturi.php?action=create', desc: 'Creare anunț', body: '{titlu, continut, prioritate, target}' },
  { group: 'Anunțuri', method: 'POST', endpoint: '/anunturi.php?action=hide_banda&id=N', desc: 'Ascunde din ticker', body: '' },
  { group: 'Anunțuri', method: 'POST', endpoint: '/anunturi.php?action=restore_banda&id=N', desc: 'Restaurare în ticker', body: '' },
  { group: 'Documente', method: 'GET', endpoint: '/documente.php?action=list&grupa=X&categorie=Y', desc: 'Lista documente', body: '' },
  { group: 'Documente', method: 'POST', endpoint: '/documente.php?action=upload', desc: 'Upload fișier (FormData)', body: 'file, grupa, categorie' },
  { group: 'Documente', method: 'POST', endpoint: '/documente.php?action=delete&id=N', desc: 'Ștergere document', body: '' },
  { group: 'Mesaje', method: 'GET', endpoint: '/mesaje.php?action=conversations&id_utilizator=N', desc: 'Lista conversații', body: '' },
  { group: 'Mesaje', method: 'GET', endpoint: '/mesaje.php?action=messages&grupa=X&id_utilizator=N', desc: 'Mesaje conversație', body: '' },
  { group: 'Mesaje', method: 'POST', endpoint: '/mesaje.php?action=send', desc: 'Trimitere mesaj', body: '{grupa, destinatar, mesaj}' },
  { group: 'Orar', method: 'GET', endpoint: '/orar.php?action=get&grupa=X', desc: 'Orar grupă', body: '' },
  { group: 'Orar', method: 'POST', endpoint: '/orar.php?action=save', desc: 'Salvare orar', body: '{grupa, cells[]}' },
  { group: 'Orar', method: 'GET', endpoint: '/orar.php?action=cancelarie', desc: 'Profesori cancelarie', body: '' },
  { group: 'Meniu', method: 'GET', endpoint: '/meniu.php?action=get&saptamana=W', desc: 'Meniu săptămânal', body: '' },
  { group: 'Meniu', method: 'POST', endpoint: '/meniu.php?action=save', desc: 'Salvare meniu', body: 'WeeklyMenu object' },
  { group: 'Meniu', method: 'GET', endpoint: '/meniu.php?action=nutritional&saptamana=W', desc: 'Date nutriționale', body: '' },
  { group: 'Povești', method: 'GET', endpoint: '/povesti.php?action=list', desc: 'Lista povești', body: '' },
  { group: 'Povești', method: 'POST', endpoint: '/povesti.php?action=create', desc: 'Creare poveste', body: '{titlu, continut, categorie, varsta}' },
  { group: 'Povești', method: 'POST', endpoint: '/povesti.php?action=tts&id=N', desc: 'Generare audio TTS', body: '' },
  { group: 'Rapoarte', method: 'GET', endpoint: '/rapoarte.php?action=attendance&...', desc: 'Raport prezență', body: '' },
  { group: 'Rapoarte', method: 'GET', endpoint: '/rapoarte.php?action=activity', desc: 'Raport activitate', body: '' },
  { group: 'Școli', method: 'GET', endpoint: '/scoli.php?action=list', desc: 'Lista școli', body: '' },
  { group: 'Școli', method: 'POST', endpoint: '/scoli.php?action=create', desc: 'Creare școală', body: 'School object' },
  { group: 'Școli', method: 'POST', endpoint: '/scoli.php?action=update', desc: 'Editare școală', body: 'Partial<School>' },
  { group: 'Școli', method: 'DELETE', endpoint: '/scoli.php?action=delete&id=N', desc: 'Ștergere școală', body: '' },
  { group: 'Utilizatori', method: 'GET', endpoint: '/utilizatori.php?action=list', desc: 'Lista utilizatori', body: '' },
  { group: 'Utilizatori', method: 'GET', endpoint: '/utilizatori.php?action=get&id=N', desc: 'Detalii utilizator', body: '' },
  { group: 'Utilizatori', method: 'POST', endpoint: '/utilizatori.php?action=create', desc: 'Creare utilizator', body: 'User object' },
  { group: 'Utilizatori', method: 'POST', endpoint: '/utilizatori.php?action=update', desc: 'Editare utilizator', body: 'Partial<User>' },
  { group: 'Utilizatori', method: 'POST', endpoint: '/utilizatori.php?action=delete&id=N', desc: 'Ștergere utilizator', body: '' },
  { group: 'Ateliere', method: 'GET', endpoint: '/ateliere.php?action=list', desc: 'Lista ateliere (filtre: school_id, luna)', body: '' },
  { group: 'Ateliere', method: 'GET', endpoint: '/ateliere.php?action=current', desc: 'Atelierul lunii curente', body: '' },
  { group: 'Ateliere', method: 'POST', endpoint: '/ateliere.php?action=create', desc: 'Creare atelier', body: 'WorkshopCreate object' },
  { group: 'Ateliere', method: 'POST', endpoint: '/ateliere.php?action=update', desc: 'Editare atelier', body: '{id, ...data}' },
  { group: 'Ateliere', method: 'POST', endpoint: '/ateliere.php?action=publish', desc: 'Publicare + notificare', body: '{id, scoli_target[]}' },
  { group: 'Ateliere', method: 'POST', endpoint: '/ateliere.php?action=delete', desc: 'Ștergere atelier', body: '{id}' },
  { group: 'Sponsori', method: 'GET', endpoint: '/sponsors.php?action=sponsors', desc: 'Lista sponsori', body: '' },
  { group: 'Sponsori', method: 'GET', endpoint: '/sponsors.php?action=active_promos&tip=X&school=N', desc: 'Promo-uri active', body: '' },
  { group: 'Sponsori', method: 'GET', endpoint: '/sponsors.php?action=rotation_config', desc: 'Configurare rotație', body: '' },
  { group: 'Sponsori', method: 'POST', endpoint: '/sponsors.php?action=log_impression', desc: 'Log afișare sponsor', body: '{id_promo, tip, school_id}' },
  { group: 'Sponsori', method: 'POST', endpoint: '/sponsors.php?action=log_click', desc: 'Log click sponsor', body: '{id_promo, tip, school_id}' },
  { group: 'Facebook', method: 'GET', endpoint: '/facebook.php?action=settings', desc: 'Setări Facebook', body: '' },
  { group: 'Facebook', method: 'POST', endpoint: '/facebook.php?action=post', desc: 'Publicare pe Facebook', body: '{content, imageUrl}' },
  { group: 'Facebook', method: 'GET', endpoint: '/facebook.php?action=log', desc: 'Log postări', body: '' },
  { group: 'WhatsApp', method: 'GET', endpoint: '/whatsapp.php?action=mappings', desc: 'Mapări WhatsApp', body: '' },
  { group: 'WhatsApp', method: 'POST', endpoint: '/whatsapp.php?action=create', desc: 'Creare mapare', body: 'WhatsappMapping' },
  { group: 'WhatsApp', method: 'GET', endpoint: '/whatsapp.php?action=status', desc: 'Status sincronizare', body: '' },
  { group: 'InfoDisplay', method: 'GET', endpoint: '/infodisplay.php?action=content', desc: 'Conținut avizier', body: '' },
  { group: 'InfoDisplay', method: 'POST', endpoint: '/infodisplay.php?action=generate_video', desc: 'Generare video recap', body: '{type}' },
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

// Group API endpoints by group name
function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item);
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

// ===================================================================
// MAIN COMPONENT
// ===================================================================
export default function DocsTab() {
  const [apiFilterGroup, setApiFilterGroup] = useState<string>('all');
  const groupedEndpoints = groupBy(ALL_API_ENDPOINTS, e => e.group);
  const groupNames = Object.keys(groupedEndpoints);
  const filteredEndpoints = apiFilterGroup === 'all' ? ALL_API_ENDPOINTS : ALL_API_ENDPOINTS.filter(e => e.group === apiFilterGroup);

  return (
    <div className="space-y-4 pb-10">
      <div>
        <h2 className="text-lg font-display font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Documentație completă TID4K
        </h2>
        <p className="text-sm text-muted-foreground">Ghid tehnic și operațional — arhitectură, pagini, API-uri, componente UI</p>
      </div>

      {/* Architecture */}
      <Card>
        <CardContent className="p-2 divide-y divide-border/50">
          <DocGroup title="Arhitectură & Configurare" badge="core" sections={ARCHITECTURE_SECTIONS} />
        </CardContent>
      </Card>

      {/* All Pages */}
      <Card>
        <CardContent className="p-2 divide-y divide-border/50">
          <DocGroup title="Pagini — Ghid complet (toate rutele)" badge={`${PAGE_SECTIONS.length} pagini`} sections={PAGE_SECTIONS} />
        </CardContent>
      </Card>

      {/* Workshops */}
      <Card>
        <CardContent className="p-2 divide-y divide-border/50">
          <DocGroup title="Ateliere — Ghid Admin" badge="ateliere" sections={WORKSHOP_SECTIONS} />
        </CardContent>
      </Card>

      {/* Sponsors */}
      <Card>
        <CardContent className="p-2 divide-y divide-border/50">
          <DocGroup title="Sponsori — Ghid Operațional" badge="sponsori" sections={SPONSOR_SECTIONS} />
        </CardContent>
      </Card>

      {/* UI Components */}
      <Card>
        <CardContent className="p-2 divide-y divide-border/50">
          <DocGroup title="Componente UI cheie" badge={`${UI_SECTIONS.length} componente`} sections={UI_SECTIONS} />
        </CardContent>
      </Card>

      {/* Complete API Reference */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-display font-semibold mb-3 flex items-center gap-2">
            <Server className="h-4 w-4 text-muted-foreground" />
            Referință API completă
            <Badge variant="outline" className="text-[10px]">{ALL_API_ENDPOINTS.length} endpoints</Badge>
          </h3>

          {/* Filter */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <button
              onClick={() => setApiFilterGroup('all')}
              className={`text-[10px] px-2 py-1 rounded-full font-medium transition-colors ${apiFilterGroup === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              Toate ({ALL_API_ENDPOINTS.length})
            </button>
            {groupNames.map(g => (
              <button
                key={g}
                onClick={() => setApiFilterGroup(g)}
                className={`text-[10px] px-2 py-1 rounded-full font-medium transition-colors ${apiFilterGroup === g ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              >
                {g} ({groupedEndpoints[g].length})
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-1.5 pr-2 text-left font-medium">Grup</th>
                  <th className="py-1.5 pr-2 text-left font-medium">Metodă</th>
                  <th className="py-1.5 pr-2 text-left font-medium">Endpoint</th>
                  <th className="py-1.5 pr-2 text-left font-medium">Descriere</th>
                  <th className="py-1.5 text-left font-medium">Body</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {filteredEndpoints.map((ep, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td className="py-1.5 pr-2 text-[10px] font-medium text-foreground/70">{ep.group}</td>
                    <td className="py-1.5 pr-2">
                      <Badge
                        variant={ep.method === 'GET' ? 'secondary' : ep.method === 'DELETE' ? 'destructive' : 'default'}
                        className="text-[9px] font-mono px-1.5 py-0"
                      >
                        {ep.method}
                      </Badge>
                    </td>
                    <td className="py-1.5 pr-2 font-mono text-[10px]">{ep.endpoint}</td>
                    <td className="py-1.5 pr-2">{ep.desc}</td>
                    <td className="py-1.5 font-mono text-[10px] text-muted-foreground/70">{ep.body || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground space-y-1">
            <p className="flex items-center gap-1.5"><Shield className="h-3 w-3" /><strong>Autentificare:</strong> Toate request-urile (în afară de login) necesită header <code className="bg-muted px-1 rounded">Authorization: Bearer [token]</code>.</p>
            <p className="flex items-center gap-1.5"><Globe className="h-3 w-3" /><strong>Base URL:</strong> Configurabil în <code className="bg-muted px-1 rounded">src/api/config.ts</code> → variabila <code className="bg-muted px-1 rounded">BASE_URL</code>.</p>
            <p className="flex items-center gap-1.5"><Server className="h-3 w-3" /><strong>Mock mode:</strong> <code className="bg-muted px-1 rounded">USE_MOCK = true</code> activează date simulate. Setează <code className="bg-muted px-1 rounded">false</code> pentru producție.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

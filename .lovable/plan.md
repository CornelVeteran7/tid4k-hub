

# Plan: Sistem de Management Ateliere + Notificări Admin & Documentație

## Prezentare generală

Acest plan adaugă un **sistem complet de management al Atelierelor** în Panoul de Administrare, permițând administratorilor să creeze, editeze și să publice ateliere către una sau toate unitățile școlare. Cardul modulului „ATELIERE" de pe dashboard va afișa previzualizarea atelierului lunii direct (fără deschidere), iar notificările push vor alerta profesorii despre atelierele noi.

---

## Ce se construiește

### 1. Modelul de date și API-ul pentru Ateliere

**Fișier nou: `src/api/workshops.ts`**

Tipuri și date mock pentru ateliere:

```text
Workshop {
  id_atelier: number
  titlu: string
  descriere: string
  luna: string (YYYY-MM)
  imagine_url: string
  categorie: 'arta' | 'stiinta' | 'muzica' | 'sport' | 'natura'
  materiale: string[]
  instructor: string
  durata_minute: number
  scoli_target: string[] (['all'] sau ID-uri specifice de școli)
  publicat: boolean
  data_creare: string
  data_publicare?: string
}
```

Funcții API:
- `getWorkshops(schoolId?, luna?)` -- obține atelierele, opțional filtrate
- `getWorkshopOfMonth(schoolId?)` -- returnează atelierul activ publicat al lunii curente
- `createWorkshop(data)` -- creare nou
- `updateWorkshop(id, data)` -- editare
- `deleteWorkshop(id)` -- ștergere
- `publishWorkshop(id, scoli_target)` -- marchează ca publicat + trimite către unități
- Date mock: 2-3 ateliere pentru luna curentă

### 2. Panoul de administrare: Tab nou „Ateliere"

**Fișier nou: `src/components/admin/WorkshopsTab.tsx`**

Un tab nou în Panoul de Administrare (`/admin`) cu:

- **Conștientizare selector școală**: respectă filtrul global „Toate unitatile" / școală specifică din partea de sus a paginii admin
- **Lista atelierelor**: carduri care arată titlul, luna, insigna categoriei, starea publicării, școlile țintă
- **Dialog creare/editare**: formular cu titlu, descriere, categorie, URL imagine, lista materiale, instructor, durată, școală țintă (una / toate)
- **Buton publicare**: marchează atelierul ca publicat; când ținta este „toate", trimite către fiecare școală. Afișează confirmare cu numărul de școli.
- **Indicatori de stare**: Ciornă (gri), Publicat (verde), arătând care școli l-au primit

Modificări în `src/pages/AdminPanel.tsx`:
- Adaugă `{ value: 'ateliere', label: 'Ateliere', icon: Paintbrush }` la TABS
- Importă și randează `<WorkshopsTab>` în noul TabsContent
- Tab-ul respectă `selectedSchoolId` (toate vs. specifică)

### 3. Dashboard: Previzualizare atelier pe cardul modulului

**Modificat: `src/components/dashboard/ModuleHub.tsx`**

Cardul „ATELIERE" arată în prezent doar un titlu și un contor. Se va schimba la:
- Obține `getWorkshopOfMonth()` la montare
- Afișează titlul atelierului + descriere scurtă direct pe card (sub subtitlu), astfel încât profesorii să o vadă fără a apăsa
- Adaugă o etichetă mică „Luna: Martie 2026" și insigna categoriei pe fața cardului
- Cardul rămâne apăsabil pentru a deschide detaliul complet al atelierului

**Modificat: `src/components/dashboard/ModuleCard.tsx`**

Adaugă prop opțional `preview` (ReactNode) care se randează sub subtitlu atunci când este furnizat. Doar cardul „ateliere" va folosi acest prop.

### 4. Sistemul de notificări: Notificări push pentru ateliere

**Modificat: `src/contexts/NotificationContext.tsx`**

- Importă `getWorkshopOfMonth` din API-ul de ateliere
- Adaugă `'workshop'` ca tip nou de notificare în `NotificationItem`
- În `refreshNotifications`, verifică dacă există un atelier publicat pentru luna curentă care nu a fost văzut (urmărit prin cheia localStorage `tid4k_seen_workshop_[id]`)
- Generează notificare: „Atelier nou: [titlu]" cu link pentru a deschide modulul de ateliere

**Modificat: `src/components/layout/AppLayout.tsx`**

- Adaugă gestionarea iconiței `Paintbrush` pentru tipul de notificare `workshop` în renderul popover (culoare violet distinctă)

### 5. Documentație

**Fișier nou: `docs/WORKSHOPS.md`**

Trei secțiuni:
1. **Pentru administratori**: Cum se creează atelierele, cum se vizează școli specifice sau toate, fluxul de publicare, editarea după publicare
2. **Pentru dezvoltatori/AI**: Tabel endpoint-uri API, interfețe TypeScript, arhitectura componentelor, integrarea notificărilor
3. **Referință API**: Specificație completă a endpoint-urilor pentru implementarea backend

```text
POST /ateliere.php?action=create        -- Creare atelier
POST /ateliere.php?action=update        -- Editare atelier
POST /ateliere.php?action=publish       -- Publicare + trimitere către școli
GET  /ateliere.php?action=list          -- Listare ateliere (filtre: school_id, luna)
GET  /ateliere.php?action=current       -- Atelierul activ al lunii curente
POST /ateliere.php?action=delete        -- Ștergere atelier
POST /ateliere.php?action=notify        -- Declanșare notificări push
```

---

## Detalii tehnice

### Rezumatul modificărilor de fișiere

| Fișier | Acțiune | Ce face |
|--------|---------|---------|
| `src/api/workshops.ts` | NOU | Tipuri atelier, date mock, funcții API |
| `src/components/admin/WorkshopsTab.tsx` | NOU | UI complet admin pentru CRUD ateliere + publicare |
| `docs/WORKSHOPS.md` | NOU | Documentație pentru administratori și dezvoltatori |
| `src/pages/AdminPanel.tsx` | EDITARE | Adaugă tab „Ateliere" (iconiță + TabsContent) |
| `src/components/dashboard/ModuleCard.tsx` | EDITARE | Adaugă prop opțional `preview` |
| `src/components/dashboard/ModuleHub.tsx` | EDITARE | Obține atelierul lunii, pasează preview către cardul ateliere |
| `src/contexts/NotificationContext.tsx` | EDITARE | Adaugă tip notificare atelier |
| `src/components/layout/AppLayout.tsx` | EDITARE | Randează iconiță notificare atelier în popover |

### Tipare respectate

- Același model de comutare `USE_MOCK` ca în toate celelalte fișiere API
- Același model UI admin cu carduri pliabile ca în SettingsTab/SchoolsTab
- Același model de element notificare cu `type`, `icon`, `navigateTo`
- Selectorul de școală `selectedSchoolId` pasat la fel ca în celelalte tab-uri admin
- Animații `framer-motion` consistente cu cardurile de modul existente

### Randarea previzualizării cardului atelier

Pe dashboard, cardul modulului ATELIERE va afișa:

```text
+------------------------------------------+
| [Iconiță Paintbrush]  ATELIERE           |
|                    Activitati creative     |
|   ┌─────────────────────────────┐         |
|   │ Pictură pe sticlă           │  [10]   |
|   │ Artă · Martie 2026          │         |
|   └─────────────────────────────┘         |
+------------------------------------------+
```

Această previzualizare apare doar când există un atelier al lunii.

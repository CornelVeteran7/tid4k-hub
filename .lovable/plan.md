

# Panou Admin Unificat - TID4K

## Obiectiv
Crearea unei pagini unice `/admin` care inlocuieste paginile separate (Utilizatori, Configurari, Sponsori, Dashboard Sponsor) si ofera management complet al unitatilor de invatamant, cu responsive design impecabil pe mobil si desktop.

## Structura paginii

```text
+--------------------------------------------------+
|  [Icon] Panou Administrare         [+ Scoala noua]|
|  Gestioneaza unitatile, utilizatorii si sponsorii  |
+--------------------------------------------------+
|  [Scoli] [Utilizatori] [Orar] [Meniu] [Sponsori] [Setari] |
+--------------------------------------------------+
|                                                    |
|  (continut tab activ)                              |
|                                                    |
+--------------------------------------------------+
```

Pe mobil, tab-urile vor fi un scroll orizontal (snap-x) pentru a evita overlapping.

## Tab-uri si continut

### 1. Scoli (nou)
- Lista carduri scoli existente (grid 1-3 coloane responsive)
- Card "+" pentru adaugare scoala noua
- Dialog/Sheet creare scoala: nume, adresa, tip (gradinita/scoala), logo upload
- Clic pe scoala -> se deschide un sub-panel cu:
  - Grupe/Clase alocate (lista editabila)
  - Copii per grupa (tabel compact)
  - Profesori asignati
  - Statistici rapide (nr copii, nr profesori)

### 2. Utilizatori (existent, integrat)
- Se muta continutul din `UserManagement.tsx` direct in tab
- Se adauga coloana "Scoala" in tabel
- Se adauga camp "Grupa/Clasa" editabil in dialogul de creare/editare
- Se adauga asociere copii (pentru parinti) - selector multi-copil

### 3. Orar (nou - quick editor)
- Selector scoala + grupa in header tab
- Tabel drag-and-drop simplificat (zilele pe coloane, orele pe randuri)
- Salvare rapida per scoala/grupa

### 4. Meniu (nou - quick editor)
- Selector saptamana
- Grid editabil: zile x mese
- Salvare cu preview

### 5. Sponsori (existent, integrat)
- Se combina `SponsorAdmin.tsx` si `SponsorDashboard.tsx`
- Sub-tab-uri interne: Sponsori | Campanii | Statistici | Planuri
- CampaignEditor ramane ca dialog

### 6. Setari (existent, integrat)
- Se muta continutul din `Settings.tsx`
- Sectiuni colapsabile: Info scoala, API Keys, WhatsApp, Facebook, Notificari, Mentenanta

## Responsive Design - Reguli stricte

| Element | Mobile (<768px) | Desktop (>=768px) |
|---------|-----------------|-------------------|
| Tab-uri | Scroll orizontal snap-x, text + icon mic | TabsList normal inline | 
| Grid scoli | 1 coloana | 2-3 coloane |
| Tabel utilizatori | Card-uri stivuite vertical | Tabel clasic |
| Orar editor | Scroll horizontal pe tabel | Tabel full vizibil |
| Dialog creare | Sheet full-screen bottom | Dialog centered |
| Sponsori sub-tabs | Accordion colapsabil | Tab-uri orizontale |

## Detalii tehnice

### Fisiere noi
- `src/pages/AdminPanel.tsx` - Pagina principala cu tab-uri
- `src/components/admin/SchoolsTab.tsx` - Tab-ul Scoli cu CRUD
- `src/components/admin/UsersTab.tsx` - Tab-ul Utilizatori (extras din UserManagement)
- `src/components/admin/ScheduleTab.tsx` - Editor rapid orar
- `src/components/admin/MenuTab.tsx` - Editor rapid meniu
- `src/components/admin/SponsorsTab.tsx` - Combina SponsorAdmin + SponsorDashboard
- `src/components/admin/SettingsTab.tsx` - Extras din Settings

### Fisiere modificate
- `src/App.tsx` - Inlocuieste rutele `/utilizatori`, `/configurari`, `/sponsori`, `/sponsor-dashboard` cu o singura ruta `/admin`
- `src/components/layout/AppLayout.tsx` - Actualizeaza navigarea: sterge link-urile vechi, adauga un singur link "Panou Admin" in sectiunea Admin
- `src/types/index.ts` - Adauga interfata `School` (id, nume, adresa, tip, logo_url, grupe)
- `src/api/schools.ts` (nou) - API mock pentru CRUD scoli

### Fisiere sterse (continutul mutat in tab-uri)
- `src/pages/UserManagement.tsx` - mutat in UsersTab
- `src/pages/Settings.tsx` - mutat in SettingsTab
- `src/pages/SponsorAdmin.tsx` - mutat in SponsorsTab
- `src/pages/SponsorDashboard.tsx` - mutat in SponsorsTab

### Prevenire overlapping
- Toate tab content-urile vor folosi `overflow-hidden` pe container si `overflow-y-auto` pe continut
- TabsList pe mobil: `flex overflow-x-auto scrollbar-hide gap-1` cu `flex-shrink-0` pe fiecare trigger
- Dialoguri pe mobil folosesc `Sheet` cu `side="bottom"` in loc de `Dialog` centrat
- Tabelele au `overflow-x-auto` wrapper
- Padding bottom `pb-20` pe container principal (evita overlap cu ticker-ul de anunturi)

## Flux de lucru

1. Creez tipurile si API-ul mock pentru scoli
2. Creez componentele tab (6 fisiere)
3. Creez pagina AdminPanel cu tab-uri responsive
4. Actualizez rutele in App.tsx
5. Actualizez navigarea in AppLayout.tsx
6. Sterg paginile vechi


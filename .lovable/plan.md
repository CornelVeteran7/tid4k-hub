

# Sistem Complet de Sponsorizare cu Conturi Sponsor

## Problema actuala

Sponsorii nu au control. Totul e hardcodat: culorile, textele, designul Inky. Un sponsor nu poate vedea statistici, crea campanii sau personaliza ce apare in aplicatie. Adminii trebuie sa faca totul manual.

## Ce construim

### A. Conturi Sponsor cu Dashboard Propriu

Fiecare sponsor (ex: Kaufland) primeste un cont cu rolul `sponsor` si acces la un dashboard dedicat unde poate:

```text
+==========================================+
|  Dashboard Kaufland                      |
+==========================================+
|  Planul tau: Premium    [Upgrade]        |
|  Scoli active: 12       Vizualizari: 4.2k|
+------------------------------------------+
|  CAMPANII ACTIVE           [+ Campanie]  |
|  ┌──────────────────────────────┐        |
|  │ Card Dashboard  ● Activ     │        |
|  │ Ticker          ● Activ     │        |
|  │ Inky Popup      ○ Pauza    │        |
|  └──────────────────────────────┘        |
+------------------------------------------+
|  CAMPANII VECHI (Arhiva)                 |
|  - Campania Craciun 2025                 |
|  - Back to School 2025                   |
+------------------------------------------+
|  STATISTICI                              |
|  Clickuri: 342  |  Afisari: 12.4k       |
|  CTR: 2.8%      |  Scoli: 12/15         |
+==========================================+
```

### B. Customizare Completa per Promo

Fiecare campanie/promo devine un obiect bogat cu campuri noi:

```text
SponsorPromo (extins):
  - stil_card: { background, text_color, border_radius, shadow }
  - stil_ticker: { background, text_color, badge_color, badge_text }
  - stil_inky: { background, text_color, icon_color, inky_costume_url }
  - imagine_banner_url (pentru card dashboard)
  - imagine_inky_costume (Inky imbracat in uniforma Kaufland)
  - documente_atasate: string[] (PDF-uri, flyere)
  - data_start_campanie / data_end_campanie
  - status: 'draft' | 'activ' | 'pauza' | 'expirat' | 'arhivat'
  - statistici: { afisari, clickuri, ctr }
```

### C. Customizare Inky per Sponsor

Pentru pachetul Enterprise, sponsorul poate "imbraca" Inky:
- Schimba imaginea butonului Inky cu o versiune branded (ex: Inky cu sapca Kaufland)
- Popup-ul Inky foloseste culorile sponsorului, nu culoarea generica amber
- Textul si CTA-ul sunt personalizabile
- Se poate adauga o imagine/banner in popup

### D. Customizare Ticker per Sponsor

Fiecare sponsor isi controleaza:
- Culoarea de fundal a badge-ului "Sponsor"
- Textul badge-ului (poate fi "Kaufland" in loc de "Sponsor")
- Culoarea textului mesajului
- Animatie speciala (pulse, glow) pentru pachetul Premium+

### E. Pagina Admin (pentru noi)

Pagina `/sponsori` existenta se extinde cu:
- Tab nou: **Campanii** (timeline cu toate campaniile active/arhivate per sponsor)
- Tab nou: **Statistici** (overview global: total afisari, clickuri, revenue)
- Posibilitatea de a vedea/edita orice campanie a oricarui sponsor
- Posibilitatea de a aproba/respinge campanii (workflow simplu)

---

## Plan Tehnic Detaliat

### 1. Extindere tipuri (`src/types/sponsor.ts`)

Adaugam interfete noi:

- `SponsorStyleCard` - culorile si stilul pentru cardul dashboard (background, text_color, border_color, border_radius, shadow_style)
- `SponsorStyleTicker` - culorile ticker (bg_color, text_color, badge_bg, badge_text, glow_effect)
- `SponsorStyleInky` - culorile popup Inky (bg_color, text_color, cta_bg, cta_text, icon_color, costume_url)
- `SponsorCampaign` - extinde SponsorPromo cu: status ('draft'|'activ'|'pauza'|'expirat'|'arhivat'), data_start_campanie, data_end_campanie, stil_card?, stil_ticker?, stil_inky?, documente_atasate[], statistici { afisari, clickuri, ctr }
- `SponsorStats` - statistici globale per sponsor

### 2. Extindere API (`src/api/sponsors.ts`)

Functii noi:
- `getSponsorCampaigns(sponsorId)` - campaniile unui sponsor (active + arhivate)
- `createCampaign(data)` - creaza campanie cu stiluri custom
- `updateCampaign(id, data)` - editeaza campanie + stiluri
- `getCampaignStats(campaignId)` - statistici per campanie
- `getSponsorStats(sponsorId)` - statistici globale sponsor
- `approveCampaign(id)` / `pauseCampaign(id)` - workflow admin

Mock data extins cu exemplu Kaufland care are stiluri personalizate.

### 3. Pagina Sponsor Dashboard (`src/pages/SponsorDashboard.tsx`) - FISIER NOU

Dashboard dedicat sponsorilor (ruta `/sponsor-dashboard`):
- Header cu logo sponsor, plan curent, buton upgrade
- Carduri statistici: afisari, clickuri, CTR, scoli active
- Lista campanii active cu status si toggle on/off
- Campanii arhivate (collapsible)
- Buton "Campanie noua" care deschide un editor

### 4. Editor Campanie (`src/components/sponsor/CampaignEditor.tsx`) - FISIER NOU

Dialog/pagina full-screen pentru creare/editare campanie:
- **Tab "Continut"**: titlu, descriere, CTA text, link URL, upload imagine, upload documente
- **Tab "Stil Card Dashboard"**: color pickers pentru background, text, border; preview live
- **Tab "Stil Ticker"**: color pickers; badge text custom; preview animat
- **Tab "Stil Inky"**: color pickers; upload costume imagine Inky; preview popup
- **Tab "Targetare"**: selectie scoli, prioritate, date start/end
- **Preview live**: un mini-preview care arata exact cum va aparea in fiecare locatie

### 5. Preview Components (`src/components/sponsor/previews/`) - FISIERE NOI

3 componente de preview pentru editor:
- `CardPreview.tsx` - preview cardul dashboard cu stilurile custom aplicate
- `TickerPreview.tsx` - preview ticker item cu animatie
- `InkyPreview.tsx` - preview popup Inky cu costume si culori

### 6. Actualizare `SponsorCard.tsx`

Citeste `stil_card` din promo si aplica:
- Background custom (in loc de gradient generic)
- Text color custom
- Border styling custom
- Shadow custom
- Imagine banner daca exista

### 7. Actualizare `AnnouncementsTicker.tsx`

Citeste `stil_ticker` din promo si aplica:
- Badge cu culoarea si textul sponsorului (nu generic "Sponsor" amber)
- Text color custom
- Efect glow/pulse optional

### 8. Actualizare `InkyAssistant.tsx`

Citeste `stil_inky` din promo si aplica:
- Popup cu culorile sponsorului (nu amber generic)
- Imagine costume Inky (butonul principal poate arata diferit cand e promo activa)
- CTA cu culoarea sponsorului
- Banner imagine in popup daca exista

### 9. Extindere `SponsorAdmin.tsx` (pagina admin)

- Tab **Campanii**: timeline cu toate campaniile din sistem, filtru per sponsor, status badges, butoane aprobare/pauza
- Tab **Statistici**: grafice recharts cu afisari si clickuri per campanie, per sponsor, per luna
- Acces la editorul de campanii pentru orice sponsor (admin override)

### 10. Routing (`src/App.tsx`)

Rute noi:
- `/sponsor-dashboard` - dashboard sponsor (protejat cu rol `sponsor`)
- `/sponsor-dashboard/campanie/:id` - editor campanie (protejat)

### 11. Navigare Conditionata (`src/components/layout/AppLayout.tsx`)

- Daca userul are rol `sponsor`, sidebar-ul arata: Dashboard Sponsor, Campaniile mele, Statistici, Planul meu
- Nu arata modulele de profesor/admin

---

## Fisiere Modificate/Create

| Fisier | Actiune |
|--------|---------|
| `src/types/sponsor.ts` | Extins cu SponsorStyleCard, SponsorStyleTicker, SponsorStyleInky, SponsorCampaign, SponsorStats |
| `src/api/sponsors.ts` | Functii noi + mock data extins cu stiluri |
| `src/pages/SponsorDashboard.tsx` | **Nou** - Dashboard sponsor cu statistici si campanii |
| `src/components/sponsor/CampaignEditor.tsx` | **Nou** - Editor campanie cu tabs pentru continut, stiluri si preview |
| `src/components/sponsor/previews/CardPreview.tsx` | **Nou** - Preview card dashboard |
| `src/components/sponsor/previews/TickerPreview.tsx` | **Nou** - Preview ticker |
| `src/components/sponsor/previews/InkyPreview.tsx` | **Nou** - Preview popup Inky |
| `src/components/dashboard/SponsorCard.tsx` | Aplica stiluri custom din promo |
| `src/components/dashboard/AnnouncementsTicker.tsx` | Aplica stiluri custom ticker |
| `src/components/InkyAssistant.tsx` | Aplica stiluri custom + costume Inky |
| `src/pages/SponsorAdmin.tsx` | Tabs noi: Campanii si Statistici |
| `src/components/layout/AppLayout.tsx` | Navigare conditionata per rol sponsor |
| `src/App.tsx` | Rute noi sponsor-dashboard |

## Ce primeste fiecare utilizator

- **Sponsorul**: dashboard propriu, editor campanii cu preview live, statistici, arhiva
- **Adminul tid4k**: vede totul, aproba campanii, statistici globale, override pe orice
- **Profesorul/parintele**: vede cardurile, ticker-ul si popup-urile Inky cu stilurile personalizate ale sponsorului — fara sa stie ca ceva s-a schimbat tehnic


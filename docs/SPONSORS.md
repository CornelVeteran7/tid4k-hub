# Sistemul de Sponsorizare TID4K — Documentație Completă

> Ultima actualizare: Februarie 2026

---

## Cuprins

1. [Pentru Sponsori — Ghid Comercial](#1-pentru-sponsori--ghid-comercial)
2. [Pentru Admini — Ghid Operațional](#2-pentru-admini--ghid-operațional)
3. [Pentru Dezvoltatori / AI — Ghid Tehnic](#3-pentru-dezvoltatori--ai--ghid-tehnic)

---

## 1. Pentru Sponsori — Ghid Comercial

### 1.1 Ce este TID4K Sponsors?

TID4K oferă partenerilor comerciali posibilitatea de a-și promova brandul direct în aplicația utilizată zilnic de părinți și educatori din grădinițe și școli. Promovarea este **neintruzivă**, integrată organic în experiența utilizatorilor.

### 1.2 Pachete disponibile

| Caracteristică | Basic (500 RON/lună) | Premium (1.500 RON/lună) | Enterprise (3.000 RON/lună) |
|---|---|---|---|
| **Card pe Dashboard** | ✅ | ✅ | ✅ |
| **Ticker (bandă anunțuri)** | ✅ | ✅ | ✅ |
| **Infodisplay (ecran TV)** | ❌ | ✅ | ✅ |
| **Inky Popup (asistent)** | ❌ | ✅ | ✅ |
| **Branding custom Inky** | ❌ | ❌ | ✅ (costum personalizat) |
| **Rapoarte detaliate** | Bază | Extinse | Complete + export |
| **Număr școli** | Max 5 | Nelimitat | Nelimitat |
| **Timp de afișare** | Proporțional cu planul | Proporțional cu planul | Proporțional cu planul |

### 1.3 Canale de afișare

#### Card Dashboard
- **Unde apare**: Pe pagina principală a aplicației, vizibilă imediat la deschidere
- **Format**: Card vizual cu logo, titlu, descriere și buton CTA (Call to Action)
- **Personalizare**: Background (gradient/culoare), border, shadow, banner imagine
- **Interacțiune**: Click deschide link-ul dvs. (confirmat de utilizator)

#### Ticker (Banda de anunțuri)
- **Unde apare**: Bară fixă în partea de jos a ecranului, vizibilă permanent
- **Format**: Text scrollabil cu badge-ul brandului
- **Personalizare**: Culoare badge, culoare text, efect de strălucire (glow)
- **Interacțiune**: Click pe zonă navighează la pagina de anunțuri

#### Inky Popup (Asistent)
- **Unde apare**: Meniul asistentului virtual Inky (buton flotant)
- **Format**: Buton acțiune cu logo-ul brandului și link
- **Personalizare**: Culori, text CTA, icon. Enterprise: costum Inky personalizat!
- **Interacțiune**: Click deschide link-ul dvs. într-un browser extern

#### Infodisplay (Ecran TV)
- **Unde apare**: Pe ecranele TV din holul grădiniței/școlii
- **Format**: Panou dedicat în rotația de informații (slide fullscreen)
- **Personalizare**: Logo, mesaj, culoare de brand + QR code automat
- **Interacțiune**: Vizualizare pasivă + scanare QR code

### 1.4 Cum funcționează rotația

Dacă pe o școală sunt mai mulți sponsori activi simultan:

- **Doar UN sponsor este afișat la un moment dat** pe fiecare canal
- Sponsorii se rotesc automat la intervale prestabilite
- **Timpul de afișare depinde de planul plătit**: cu cât planul este mai scump, cu atât sponsorul rămâne mai mult pe ecran
- Formula: `timp_afișare = (preț_plan / suma_prețuri_planuri_active) × ciclu_total`

**Exemplu concret** (ciclu de 60 secunde):

| Sponsor | Plan | Preț | Pondere | Timp afișare |
|---------|------|------|---------|-------------|
| Kaufland | Enterprise | 3.000 RON | 85.7% | ~51 secunde |
| Lidl | Basic | 500 RON | 14.3% | ~9 secunde |

### 1.5 Statistici disponibile

- **Afișări**: De câte ori a fost afișat cardul/mesajul dvs.
- **Click-uri**: De câte ori utilizatorii au interacționat
- **CTR (Click-Through Rate)**: Rata de click (click-uri / afișări × 100)
- **Dashboard self-service**: Accesibil la `/sponsor-dashboard` cu datele dvs. în timp real

### 1.6 Stiluri personalizabile

Fiecare canal suportă stiluri vizuale personalizate:

- **Card**: gradient de background, culoare text, border, border-radius, shadow, imagine banner
- **Ticker**: culoare badge, text badge, culoare text, efect glow animat
- **Inky**: culoare background, culoare text, culoare CTA, icon, costum Inky (Enterprise), banner

---

## 2. Pentru Admini — Ghid Operațional

### 2.1 Unde se gestionează sponsorii

Navigare: **Panou Admin** (`/admin`) → Tab **Sponsori**

Aici aveți acces la:
- Lista completă de sponsori (activi și inactivi)
- Campaniile fiecărui sponsor
- Statistici agregate

### 2.2 Crearea unui sponsor nou

1. Click **„Adaugă sponsor"**
2. Completați: Nume, Logo URL, Website, Culoare brand, Descriere
3. Selectați planul: Basic / Premium / Enterprise
4. Setați datele: Data start și Data expirare
5. Salvați → Sponsorul apare în listă ca **Activ**

### 2.3 Gestionarea campaniilor

Fiecare sponsor poate avea **mai multe campanii simultane**, de tipuri diferite:

| Tip campanie | Canal |
|-------------|-------|
| `card_dashboard` | Card pe pagina principală |
| `ticker` | Bandă de anunțuri |
| `inky_popup` | Meniu asistent Inky |
| `infodisplay` | Ecran TV |

**Statusurile campaniilor:**
- `draft` — În pregătire, nu e vizibilă
- `activ` — Rulează, sponsorul apare pe canale
- `pauza` — Oprită temporar
- `expirat` — Data de sfârșit a trecut
- `arhivat` — Scoasă din circulație definitiv

### 2.4 Targetarea pe școli

La crearea/editarea unei campanii:
- **„Toate"** → Campania apare pe toate școlile
- **Școli specifice** → Selectați ID-urile școlilor dorite din lista `scoli_target`

### 2.5 Cum funcționează rotația (pentru admini)

Rotația este **complet automată** — nu trebuie configurată manual.

- Sistemul calculează ponderea fiecărui sponsor pe baza prețului planului
- Ciclul total implicit este de **60 de secunde**
- Într-un ciclu, fiecare sponsor activ pe acea școală primește timp proporțional

**Ce puteți face:**
- Activați/dezactivați rapid un sponsor cu Switch-ul de pe card
- Schimbați prioritatea campaniilor (prioritate 1 = apare primul în ciclu)
- Monitorizați statisticile: afișări, click-uri, CTR

### 2.6 Monitorizare și rapoarte

- **Tab Sponsori** din Admin: statistici per campanie
- **Sponsor Dashboard** (`/sponsor-dashboard`): vizualizare self-service pentru sponsor
- Metrici cheie: Total afișări, Total click-uri, CTR mediu, Campanii active, Școli active

---

## 3. Pentru Dezvoltatori / AI — Ghid Tehnic

### 3.1 Arhitectura fișierelor

```
TIPURI (Types):
  src/types/sponsor.ts          — Toate interfețele: Sponsor, SponsorPromo, SponsorCampaign,
                                   SponsorPlan, SponsorStats, RotationConfig, RotationSlot,
                                   + stiluri: SponsorStyleCard, SponsorStyleTicker, SponsorStyleInky

API (Service Layer):
  src/api/sponsors.ts           — getSponsors(), getActivePromos(tip?, schoolId?),
                                   getRotationConfig(schoolId?), logImpression(), logClick(),
                                   getSponsorCampaigns(), getAllCampaigns(), etc.
  src/api/schools.ts            — Câmpul sponsori_activi pe fiecare School

HOOK ROTAȚIE:
  src/hooks/useSponsorRotation.ts — Hook reutilizabil pentru rotația automată pe toate canalele.
                                     Input: tip (canal), schoolId
                                     Output: { currentPromo, allPromos, isTransitioning, timeRemaining }

COMPONENTE CONSUMER (afișează sponsori):
  src/components/dashboard/SponsorCard.tsx         — Card pe dashboard (1 promo la un moment dat)
  src/components/dashboard/AnnouncementsTicker.tsx  — Ticker cu 1 sponsor activ din rotație
  src/components/InkyAssistant.tsx                  — Popup Inky (1 sponsor la un moment dat)
  src/pages/Infodisplay.tsx                         — Ecran TV (panouri sponsor în rotație)

COMPONENTE ADMIN (gestionare):
  src/components/admin/SponsorsTab.tsx              — Tab admin cu CRUD sponsori + campanii
  src/components/sponsor/CampaignEditor.tsx         — Dialog editare campanie + stiluri
  src/pages/SponsorDashboard.tsx                    — Dashboard self-service pentru sponsori
  src/pages/SponsorAdmin.tsx                        — Pagină admin dedicată sponsorilor
```

### 3.2 Tipuri TypeScript cheie

```typescript
// src/types/sponsor.ts — Tipuri noi pentru rotație

interface RotationConfig {
  ciclu_total_secunde: number;   // Default: 60. Durata unui ciclu complet de rotație
  sloturi: RotationSlot[];       // Array de sloturi ordonate
}

interface RotationSlot {
  id_sponsor: number;            // ID-ul sponsorului
  id_promo: number;              // ID-ul promoului/campaniei active
  durata_secunde: number;        // Cât stă afișat în cadrul ciclului
  pondere: number;               // Pondere calculată (0-1). Ex: 0.857
  promo: SponsorPromo;           // Obiectul complet al promoului (pentru render)
}
```

### 3.3 Endpoint-uri API (Backend PHP)

| Metodă | Endpoint | Parametri | Răspuns | Descriere |
|--------|----------|-----------|---------|-----------|
| `GET` | `/sponsors.php?action=sponsors` | — | `Sponsor[]` | Toți sponsorii |
| `GET` | `/sponsors.php?action=active_promos` | `tip`, `school_id` | `SponsorPromo[]` | Promo-uri active filtrate |
| `GET` | `/sponsors.php?action=rotation_config` | `school_id`, `tip` | `RotationConfig` | Config rotație calculată server-side |
| `POST` | `/sponsors.php?action=log_impression` | `{ id_promo, tip, school_id }` | `{ ok: true }` | Loghează o afișare |
| `POST` | `/sponsors.php?action=log_click` | `{ id_promo, tip, school_id }` | `{ ok: true }` | Loghează un click |
| `GET` | `/sponsors.php?action=campaigns` | `sponsor_id` | `SponsorCampaign[]` | Campaniile unui sponsor |
| `GET` | `/sponsors.php?action=stats` | `sponsor_id` | `SponsorStats` | Statistici sponsor |
| `GET` | `/sponsors.php?action=plans` | — | `SponsorPlan[]` | Planuri disponibile |

### 3.4 Formula de rotație (implementare)

```
Pentru o școală S cu sponsori activi [A, B, C]:

1. Obține prețul planului fiecărui sponsor activ pe școala S
   pret_A = 3000, pret_B = 1500, pret_C = 500

2. Calculează suma totală
   total = 3000 + 1500 + 500 = 5000

3. Calculează ponderea fiecăruia
   pondere_A = 3000 / 5000 = 0.60
   pondere_B = 1500 / 5000 = 0.30
   pondere_C =  500 / 5000 = 0.10

4. Aplică la ciclul total (ex: 60 secunde)
   durata_A = 0.60 × 60 = 36 secunde
   durata_B = 0.30 × 60 = 18 secunde
   durata_C = 0.10 × 60 =  6 secunde

5. Ordinea este: A → B → C → A → B → C → ... (ciclic)
```

### 3.5 Hook `useSponsorRotation` — Specificații

```typescript
// src/hooks/useSponsorRotation.ts

function useSponsorRotation(
  tip: SponsorPromo['tip'],    // 'card_dashboard' | 'ticker' | 'inky_popup' | 'infodisplay'
  schoolId?: number
): {
  currentPromo: SponsorPromo | null;     // Promo-ul curent afișat
  allPromos: SponsorPromo[];             // Toate promo-urile din rotație
  isTransitioning: boolean;              // True în timpul tranziției (pt animații)
  timeRemaining: number;                 // Secunde rămase pentru promo-ul curent
}
```

**Comportament intern:**
1. La mount: fetch `getRotationConfig(schoolId)` filtrat pe `tip`
2. Calculează sloturi cu durate proporționale
3. Porneste `setInterval` care incrementează indexul la expirarea duratei
4. La fiecare schimbare de promo: apelează `logImpression()` fire-and-forget
5. Setează `isTransitioning = true` cu 300ms înainte de schimbare (pentru AnimatePresence)
6. Dacă există un singur promo → nu rotează, afișează permanent
7. Dacă nu există promo-uri → returnează `currentPromo: null`

### 3.6 Integrarea în componente consumer

#### SponsorCard.tsx
```
Înainte: fetch promos[0] static
După:    useSponsorRotation('card_dashboard', schoolId)
         AnimatePresence key={currentPromo.id_promo} pentru tranziție fade
         logImpression la fiecare schimbare
         logClick la click pe CTA
```

#### AnnouncementsTicker.tsx
```
Înainte: afișează TOATE promo-urile sponsor intercalate cu anunțurile
După:    useSponsorRotation('ticker', schoolId)
         Inserează doar currentPromo (1 singur!) printre anunțuri
         Sponsorul se schimbă automat la intervalul calculat
```

#### InkyAssistant.tsx
```
Înainte: fetch promos[0] static → sponsorAction
După:    useSponsorRotation('inky_popup', schoolId)
         sponsorAction se actualizează automat la rotație
         Costumul Inky se schimbă cu sponsorul (stil_inky.costume_url)
```

#### Infodisplay.tsx
```
Înainte: nu are integrare sponsor
După:    useSponsorRotation('infodisplay', schoolId)
         Adaugă un panou virtual tip 'sponsor' în rotația existentă de panouri
         Panoul afișează: logo sponsor, mesaj, culoare brand, QR code
```

### 3.7 Logarea statisticilor

```typescript
// src/api/sponsors.ts

async function logImpression(data: {
  id_promo: number;
  tip: SponsorPromo['tip'];
  school_id?: number;
}): Promise<void>

async function logClick(data: {
  id_promo: number;
  tip: SponsorPromo['tip'];
  school_id?: number;
}): Promise<void>
```

**Reguli:**
- `logImpression` se apelează de fiecare dată când un promo devine vizibil (la rotație)
- `logClick` se apelează la click pe CTA sau pe card
- Ambele sunt fire-and-forget (nu blocheză UI-ul)
- În mod mock (`USE_MOCK = true`), doar loghează în consolă

### 3.8 Mock data pentru rotație

Când `USE_MOCK = true`, `getRotationConfig()` returnează configurație calculată local din `MOCK_PROMOS` și `MOCK_PLANS`:

```typescript
// Exemplu răspuns mock
{
  ciclu_total_secunde: 60,
  sloturi: [
    { id_sponsor: 1, id_promo: 1, durata_secunde: 51, pondere: 0.857, promo: {...} },
    { id_sponsor: 2, id_promo: 4, durata_secunde: 9,  pondere: 0.143, promo: {...} },
  ]
}
```

### 3.9 Reguli importante

1. **Niciodată 2 sponsori simultan** pe același canal pe același ecran
2. **Rotația este per-școală**: fiecare școală are propria configurație
3. **Rotația este per-canal**: `card_dashboard` rotează independent de `ticker`
4. **Dacă un singur sponsor** → se afișează permanent, fără timer
5. **Dacă 0 sponsori** → componenta nu se afișează (return null)
6. **Statisticile** trebuie logate la fiecare tranziție, nu doar la mount
7. **Tranziții animate** obligatorii: fade pentru card/infodisplay, slide pentru ticker/inky
8. **Fire-and-forget** pentru logare: nu blocați UI-ul așteptând răspunsul
9. **Cleanup** obligatoriu: `clearInterval` în `useEffect` return
10. **Prioritatea** determină ordinea în ciclu (1 = apare primul), NU durata

---

## Anexa: Diagrama fluxului de rotație

```
┌─────────────────────────────────────────────────────────┐
│                    CICLU DE 60 SECUNDE                   │
│                                                         │
│  ┌───────────────────────────────────┐ ┌──────────────┐ │
│  │     Kaufland (Enterprise)         │ │ Lidl (Basic) │ │
│  │         51 secunde                │ │  9 secunde   │ │
│  └───────────────────────────────────┘ └──────────────┘ │
│                                                         │
│  0s          ...          51s    52s  ...  60s → restart │
└─────────────────────────────────────────────────────────┘
```

```
┌──────────┐    ┌────────────────┐    ┌──────────────────┐
│  API     │───>│ useSponsor     │───>│ SponsorCard      │
│  /sponsors│   │ Rotation()     │    │ AnnouncementsTicker│
│  /rotation│   │                │    │ InkyAssistant    │
│  /log_*   │<──│ logImpression()│    │ Infodisplay      │
└──────────┘    └────────────────┘    └──────────────────┘
```

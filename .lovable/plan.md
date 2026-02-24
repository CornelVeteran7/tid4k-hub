

# Documentatie Completa: Sistemul de Rotatie Sponsori TID4K

Aceasta documentatie va fi creata ca un fisier Markdown in proiect (`docs/SPONSORS.md`) si va contine trei sectiuni principale, fiecare adresata unui public diferit.

---

## Structura Documentului

### SECTIUNEA 1: Pentru Sponsori (Ghid Comercial)
Explica ce primesc sponsorii in functie de pachetul ales:

**Pachete disponibile:**
- **Basic (500 RON/luna)** -- Card pe dashboard + ticker. Max 5 scoli.
- **Premium (1.500 RON/luna)** -- Dashboard + ticker + infodisplay + Inky popup. Scoli nelimitate.
- **Enterprise (3.000 RON/luna)** -- Toate de mai sus + branding custom Inky (costum personalizat) + rapoarte detaliate.

**Cum functioneaza rotatia:**
- Pe fiecare scoala pot fi mai multi sponsori activi simultan
- Doar UN sponsor este afisat la un moment dat pe fiecare canal (card, ticker, Inky, infodisplay)
- Sponsorii se rotesc automat la intervale prestabilite
- Intervalul de afisare depinde de plan: Enterprise = mai mult timp, Basic = mai putin
- Formula: `timp_afisare = (pret_plan / suma_preturi_planuri_active) * ciclu_total`
- Statistici in timp real: afisari, click-uri, CTR

**Canale de afisare:**
| Canal | Ce vede utilizatorul | Interactiune |
|-------|---------------------|-------------|
| Card Dashboard | Card vizual cu logo, titlu, descriere, buton CTA | Click deschide link sponsor |
| Ticker (banda anunturi) | Text scrollabil cu badge sponsor | Click navigheaza la anunturi |
| Inky Popup | Buton in meniul Inky cu logo si link | Click deschide link extern |
| Infodisplay (TV) | Panou dedicat pe ecranul TV din scoala | Vizualizare pasiva + QR code |

### SECTIUNEA 2: Pentru Admini (Ghid Operational)
Cum se gestioneaza sponsorii din panoul de administrare:

- Crearea/editarea sponsorilor si campaniilor
- Asignarea sponsorilor la scoli (tab Scoli -> Sponsori activi)
- Configurarea targetului per campanie (scoli specifice sau "Toate")
- Monitorizarea statisticilor (afisari, click-uri, CTR)
- Cum functioneaza rotatia: ce parametri se configureaza, ce inseamna prioritatea
- Activare/dezactivare rapida cu Switch

### SECTIUNEA 3: Pentru Dezvoltatori / AI (Ghid Tehnic de Integrare)

**Arhitectura curenta:**

```text
src/types/sponsor.ts        -- Toate interfetele (Sponsor, SponsorPromo, SponsorCampaign, SponsorPlan, etc.)
src/api/sponsors.ts         -- Functii API: getSponsors(), getActivePromos(tip?, schoolId?), etc.
src/api/schools.ts          -- Campul sponsori_activi pe fiecare School

COMPONENTE CONSUMER:
src/components/dashboard/SponsorCard.tsx       -- Card pe dashboard (1 promo la un moment dat)
src/components/dashboard/AnnouncementsTicker.tsx -- Ticker cu rotatia promourilor
src/components/InkyAssistant.tsx               -- Popup Inky (1 promo la un moment dat)
src/pages/Infodisplay.tsx                      -- Ecran TV (inca nu integrat cu sponsori)

COMPONENTE ADMIN:
src/components/admin/SponsorsTab.tsx            -- Tab admin cu toate sub-sectiunile
src/components/sponsor/CampaignEditor.tsx       -- Dialog editare campanie
src/pages/SponsorDashboard.tsx                  -- Dashboard self-service sponsor
```

**Sistemul de Rotatie -- Logica de Implementat:**

Fiecare componenta consumer (SponsorCard, AnnouncementsTicker, InkyAssistant) trebuie sa:
1. Fetch-uiasca TOATE promourile active pentru scoala curenta si tipul sau
2. Calculeze `durata_afisare` per promo pe baza planului sponsorului
3. Foloseasca un timer (`setInterval`) pentru a trece la urmatorul sponsor
4. Trimiterea evenimentului de "afisare" la backend la fiecare schimbare

**Endpoint-uri API necesare (backend PHP):**

| Metoda | Endpoint | Descriere |
|--------|----------|-----------|
| GET | `/sponsors.php?action=active_promos&tip=card_dashboard&school_id=1` | Promourile active filtrate |
| GET | `/sponsors.php?action=rotation_config&school_id=1` | Configuratia de rotatie per scoala |
| POST | `/sponsors.php?action=log_impression` | Logheaza o afisare (sponsor_id, tip, school_id, timestamp) |
| POST | `/sponsors.php?action=log_click` | Logheaza un click |
| GET | `/sponsors.php?action=stats&sponsor_id=1` | Statistici sponsor |

**Noi tipuri TypeScript necesare:**

```typescript
interface RotationConfig {
  ciclu_total_secunde: number;        // ex: 60 secunde per ciclu complet
  sponsori: RotationSlot[];
}

interface RotationSlot {
  id_sponsor: number;
  id_promo: number;
  durata_secunde: number;             // cat timp e afisat in cadrul ciclului
  pondere: number;                    // calculat din pret plan
}
```

**Formula de rotatie:**

```
pondere_sponsor = pret_plan_sponsor / SUM(pret_plan) pentru toti sponsorii activi pe acea scoala
durata_afisare = pondere_sponsor * ciclu_total_secunde
```

Exemplu cu ciclu de 60 secunde:
- Kaufland (Enterprise, 3000 RON): pondere = 3000/3500 = 85.7% -> 51 secunde
- Lidl (Basic, 500 RON): pondere = 500/3500 = 14.3% -> 9 secunde

**Modificari necesare in componente:**

1. **`SponsorCard.tsx`**: Adauga state `currentIndex` + `setInterval` care cicleaza prin array-ul de promouri, cu `durata_secunde` din `RotationConfig`. Adauga tranzitie `AnimatePresence` intre sponsori.

2. **`AnnouncementsTicker.tsx`**: In loc sa afiseze toate promourile simultan, afiseaza doar promo-ul activ din rotatie in fiecare moment. Celelalte sunt anunturi normale.

3. **`InkyAssistant.tsx`**: `sponsorAction` devine dinamic -- se schimba la interval. Costumul Inky se schimba cu sponsorul.

4. **`Infodisplay.tsx`**: Adauga un nou tip de panou `tip: 'sponsor'` care se integreaza in rotatia existenta de panouri. Afiseaza logo-ul, mesajul si QR code-ul sponsorului.

**Hook reutilizabil propus: `useSponsorRotation`**

```typescript
function useSponsorRotation(tip: SponsorPromo['tip'], schoolId?: number) {
  // Returns: { currentPromo, allPromos, nextPromo, timeRemaining }
  // Internally manages the timer and rotation logic
}
```

Acest hook va fi folosit de TOATE cele 4 componente consumer, eliminand duplicarea logicii.

---

## Ce se implementeaza concret

1. **Fisier nou**: `docs/SPONSORS.md` -- documentatia completa in cele 3 sectiuni
2. **Fisier nou**: `src/hooks/useSponsorRotation.ts` -- hook-ul de rotatie reutilizabil
3. **Tip nou in `src/types/sponsor.ts`**: `RotationConfig` si `RotationSlot`
4. **Functie noua in `src/api/sponsors.ts`**: `getRotationConfig(schoolId)` -- returneaza configuratia de rotatie
5. **Update `SponsorCard.tsx`**: foloseste `useSponsorRotation` + tranzitii animate
6. **Update `AnnouncementsTicker.tsx`**: afiseaza doar sponsorul curent din rotatie
7. **Update `InkyAssistant.tsx`**: roteste sponsorul afisat + schimba costumul
8. **Update `Infodisplay.tsx`**: adauga panouri sponsor in rotatia existenta


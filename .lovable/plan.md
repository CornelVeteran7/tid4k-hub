

# Analiza Gap: PHP (TID4K) vs React App + Plan de Implementare

## Build Errors (Fix Imediat)
Sunt 6 erori TypeScript in edge functions care trebuie rezolvate inainte de orice:
- `error` is of type `unknown` in 4 functii — adaugam `(error as Error).message`
- `.catch()` inexistent pe Supabase query in `seed-demo-data` — inlocuim cu try/catch

---

## Faza 1: Superadmin Cost Calculator (Tab Nou)

Portam calculatorul JSX uploadat ca tab **"Calculator"** in `SuperAdmin.tsx`.

**Ce construim:**
- Component nou `SuperAdminCostCalculator.tsx` cu 5 sub-taburi: Client Nou, Flota, Venit Tinta, Research Sponsori, Hardware BOM
- Adaptat la design system-ul existent (shadcn Card, Slider, Table, Tabs) in loc de inline styles
- Toata logica de calcul portata 1:1 din JSX (formule identice)
- Slidere cu +/- buttons si click-to-edit (ca in original)
- Metric cards colorate, P&L detaliat, tabel scenarii flota
- Responsive: 3 coloane desktop, stack pe mobile
- Date salvate in `localStorage` pentru persistenta intre sesiuni

**Estimare:** ~500 linii component, 0 modificari DB

---

## Faza 2: OMS Nutritie Completa

Sistemul PHP are un normator de alimente complet cu clasificare OMS/WHO. App-ul React are deja tabele (`menu_weeks`, `menu_meals`, `menu_dishes`, `menu_ingredients`) si validare partiala.

**Ce lipseste si construim:**
- **Baza de date alimente extinsa** — migratie cu 200+ alimente romanesti cu kcal/100g, proteine, lipide, glucide, categorie OMS
- **Cautare in normator** (`cauta_in_normator_alimente`) — autocomplete in WeeklyMenu cand adaugi ingredient
- **Clasificare OMS automata** — pe baza ingredientelor, meniul primeste badge: verde/galben/rosu
- **Verificare calorii pe zi** vs target pe grupe de varsta (exista partial, completam)
- **Lista alimente interzise** cu warning vizual (exista partial)
- **Export PDF meniu** — generare PDF printabil (lipseste complet)

**Estimare:** 1 migratie DB, 2-3 componente noi, update WeeklyMenu.tsx

---

## Faza 3: Text-to-Speech (ElevenLabs + fallback)

Sistemul PHP foloseste OpenAI TTS + Google TTS fallback. App-ul React nu are TTS deloc.

**Ce construim:**
- **Edge function `elevenlabs-tts`** — proxy catre ElevenLabs API cu cache in Supabase Storage
- **Fallback Google TTS** — pentru texte scurte / cand ElevenLabs e indisponibil
- **Integrare in Stories** — buton "Ascultă" pe fiecare poveste, narare cu vocea personajului (Inky = voce X, Vixie = voce Y)
- **Integrare in Announcements** — buton TTS pe anunturi
- **Cache audio** — hash MD5 al textului, stocat in bucket Supabase, reutilizat
- **Player audio** — component AudioPlayer cu progress bar, play/pause

**Prerequisite:** ElevenLabs API key (connector sau secret)

---

## Faza 4: Raspberry Pi Device Management (Backend Real)

`SuperAdminDisplayMonitor.tsx` exista dar cu date mock. Sistemul PHP are un lifecycle complet.

**Ce construim:**
- **Tabela `display_devices`** — uuid, organization_id, alias, raspberry_id, last_heartbeat, screenshot_url, status, created_at
- **Tabela `device_reports`** — device_id, report_data (JSON), reported_at
- **Edge function `device-heartbeat`** — endpoint public pentru Pi: primeste UUID, screenshot_url, actualizeaza last_heartbeat
- **Edge function `device-screenshot-upload`** — upload screenshot in Storage bucket
- **Status thresholds** (ca in PHP): ≤65min = verde, ≤125min = violet, >125min = gri, unreachable = rosu
- **UI real** in SuperAdminDisplayMonitor — grid cu status color-coded, screenshot preview, alias edit, delete
- **Live preview** — iframe cu `/display/:orgSlug` pentru fiecare device

**Estimare:** 2 tabele, 2 edge functions, 1 storage bucket, update component

---

## Faza 5: WhatsApp Twilio Bidirectional

**Ce construim:**
- **Conectare Twilio** via connector gateway
- **Edge function `whatsapp-send`** — trimite mesaj/imagine via Twilio WhatsApp API
- **Edge function `whatsapp-webhook`** — primeste mesaje incoming, le salveaza in `messages`
- **Tabela `whatsapp_group_mapping`** — organization_id, group_id, whatsapp_number
- **Tabela `whatsapp_sync_log`** — tracking sync bidirectional
- **UI** — update SocialMediaWhatsapp.tsx cu: mapping grupe, send test, sync status, rate limit display
- **Auto-post** — cand teacher uploadeaza imagine, optiune de share pe WhatsApp

**Prerequisite:** Twilio connector + WhatsApp Business number

---

## Faza 6: Facebook Auto-Post

**Ce construim:**
- **Edge function `facebook-post`** — post text+imagine pe pagina Facebook via Graph API
- **Edge function `facebook-oauth-callback`** — handle OAuth flow, store tokens
- **Tabela `facebook_config`** — organization_id, page_id, access_token, token_expires_at
- **Token refresh** — cron job via pg_cron care reinnoieste tokens
- **UI** — update SocialMediaFacebook.tsx cu: connect page, post preview, scheduled posts, token status
- **Programare posturi** — calendar picker pentru publish later

**Prerequisite:** Facebook App credentials (App ID + Secret)

---

## Faza 7: Web Push Notifications (VAPID)

**Ce construim:**
- **Tabela `push_subscriptions`** — user_id, endpoint, p256dh, auth, created_at
- **Edge function `push-subscribe`** — salveaza subscription
- **Edge function `push-send`** — trimite notificare la user/grup/organizatie
- **VAPID key generation** — stocate in Supabase secrets
- **Service Worker update** — subscribe la push in sw.js (PWA existent)
- **UI** — toggle notificari in profil, bell icon in header cu badge, notification center
- **Triggers** — push la mesaj nou, anunt nou, poveste noua

**Prerequisite:** VAPID keypair generation

---

## Faza 8: Video Generation

**Ce construim:**
- **Edge function `generate-video`** — apel catre VPS-ul Contabo existent (sau Puppeteer cloud)
- **Tabela `video_jobs`** — organization_id, status, video_url, type, created_at
- **UI** — update VideoGeneration.tsx cu: select tip video, trigger generare, progress, download
- **Integrare display** — video-urile generate disponibile in rotatie pe PublicDisplay

**Prerequisite:** VPS Contabo endpoint accesibil

---

## Faza 9: Wizard Configurare Server Nou

**Ce construim:**
- Update `SuperAdminNewClient.tsx` cu wizard multi-step:
  1. **Selectie vertical** + template (exista partial)
  2. **Configurare grupe** — adauga N grupe cu nume custom
  3. **Import utilizatori bulk** — CSV upload sau formular: director, profesori, parinti
  4. **Configurare hardware** — cate displayuri, Inky devices
  5. **Calcul pret automat** — integrat cu Cost Calculator din Faza 1
  6. **Review & Create** — genereaza organizatia, grupele, userii, device-urile
- **Edge function** pentru bulk user creation via admin API

---

## Faza 10: Sponsor Dashboard Dedicat

**Ce construim:**
- **Ruta noua `/sponsor-login`** — login separat pentru sponsori (telefon din tabela sponsors)
- **Pagina `SponsorDashboard.tsx`** — dashboard dedicat cu:
  - Statistici agregate cross-organizatii (copii, parinti, profesori, servere online)
  - Formular broadcast anunt (text + imagine) catre toate organizatiile
  - Preview display-uri live (iframe grid)
  - Rapoarte vizualizare campanii
- **Tabela `sponsor_sessions`** sau rol special in `user_roles`
- **RLS** — sponsorii vad doar statistici agregate, nu date individuale

---

## Ordine Recomandata de Implementare

```text
1. Fix build errors (5 min)
2. Cost Calculator Superadmin (standalone, 0 dependente)
3. Device Management (tabele + edge functions)
4. Wizard Server Nou (foloseste Cost Calculator)
5. OMS Nutritie (completare DB + UI)
6. TTS (ElevenLabs connector)
7. Web Push (VAPID + service worker)
8. WhatsApp Twilio (connector + webhook)
9. Facebook (OAuth + Graph API)
10. Video Generation (VPS integration)
11. Sponsor Dashboard (rol nou + pagina)
```


# API Layer Reference

> Last updated: 2026-03-12

## Arhitectura API (Dual Mode)

Aplicatia functioneaza in **doua moduri**:

### Modul TID4K Backend (PRODUCTIE - tid4kdemo.ro)
Toate API-urile din `src/api/` comunica cu backend-ul PHP real prin **`api_gateway.php`** via `tid4kClient.ts`.

**Flux:** React → `tid4kClient.call(action, params)` → `api_gateway.php` → endpoint PHP → MariaDB

### Modul Supabase (VIITOR - planificat)
Endpoint-urile vor migra treptat la Supabase. Pana atunci, Supabase NU este folosit in productie.

---

## Client HTTP Central: `tid4kClient.ts`

**FISIER PROTEJAT** - nu modifica din Lovable!

- Singleton `tid4kApi` partajat in toata aplicatia
- Trimite `X-TID4K-Session` header din localStorage
- Trimite `X-TID4K-API-Key` pentru autentificare gateway
- Fallback: daca gateway-ul nu raspunde, apeleaza endpoint-ul direct
- Metode: `call(action, params)`, `autentificareTelefon(telefon)`, `verificaSesiune()`

### `config.ts` — Configurare API
- `API_BASE_URL` — auto-detectie server pe baza hostname-ului
- `API_KEY` — cheie API pentru gateway
- `GATEWAY_PATH` — calea catre `api_gateway.php`
- `USE_TID4K_BACKEND = true` — flag pentru modul TID4K

## Core APIs

### `auth.ts` — Autentificare
- `autentificareTelefon(telefon)` — Login prin numar telefon via `api_auth.php`
- Superuser Inky: telefon `1313131313`, afisaj "Inky"
- Sesiunea salvata in localStorage ca `tid4k_session` (valoarea `id_cookie`)

## Content APIs (conectate la TID4K backend)

### `announcements.ts`
- `getAnnouncements()` — Fetch via `fetch_anunturi` endpoint
- Mapare campuri: `text_preview`, `text_complet`, `imagine`, `continut_html`

### `attendance.ts`
- `getWeeklyAttendance(grupa)` — via `fetch_prezenta_saptamana`
- `saveWeeklyAttendance(grupa, data)` — via `salveaza_prezenta_saptamana`
- `getAttendanceStats(grupa)` — via `fetch_prezenta_stats`

### `documents.ts`
- `getDocuments(grupa)` — Combina `fetch_iframes` (PDF) + `fetch_images` in paralel
- Trimite parametrul `grupa` pentru a selecta tabela corecta
- Construieste URL-uri via `serve_fisier_hub.php?id=X&grupa=Y`
- Thumbnails: `&thumb=1` (imagini din BD, PDF-uri generate cu Imagick)
- `uploadDocument(grupa, file, categorie)` — Upload via `upload_fisier_hub.php`
- `deleteDocument(id)` — De implementat

### `menu.ts` — Meniu Saptamanal
- `getMenuSaptamana(saptamana, an)` — via `fetch_meniuri`
- `getMenuTabs()` — via `fetch_meniuri` cu `lista_meniuri`
- `saveMenu(data)` — via `salveaza_meniuHTML`

### `messages.ts`
- `getMessages()` — via `fetch_mesaje` (necesita sesiune)

### `schedule.ts`
- `getSchedule()` — via `fetch_orar`
- `saveSchedule(data)` — via `salveaza_orar`
- `getCancelarie()` — via `fetch_cancelarie`

### `stories.ts`
- `getStories()` — via `fetch_povesti`
- `saveStory(data)` — via `salveaza_poveste`

## Endpoint-uri PHP pe Server (nu in repo)

Fisierele PHP sunt pe serverul tid4kdemo.ro, NU in repo-ul React:

| Endpoint | Fisier pe server | Descriere |
|----------|-----------------|-----------|
| Gateway | `pages/api_gateway.php` | Rutare centrala, session bridge |
| Auth | `pages/api_auth.php` | Login telefon, verificare sesiune |
| Imagini | `pages/fetch_images.php` | Imagini din `informatii_{grupa}` |
| PDF-uri | `pages/fetch_iframes.php` | Documente PDF din `informatii_{grupa}` |
| Servire fisier | `pages/serve_fisier_hub.php` | Serveste BLOB din BD |
| Thumbnail PDF | `pages/genereaza_thumbnail_hub.php` | Genereaza PNG din prima pagina PDF (Imagick) |
| Upload | `pages/upload_fisier_hub.php` | Upload fisier pe disc + BD |
| Anunturi | `pages/fetch_anunturi.php` | Anunturi per grupa |
| Meniu | `pages/fetch_meniuri.php` | Meniu saptamanal |
| Mesaje | `pages/fetch_mesaje.php` | Mesaje utilizator |
| Prezenta | `pages/fetch_prezenta_saptamana.php` | Prezenta saptamanala |
| Orar | `pages/fetch_orar.php` | Orar clasa/grupa |

## Gateway Session Bridge

`api_gateway.php` initializeaza `$_SESSION` din header-ul `X-TID4K-Session`:
1. Cauta utilizatorul in `utilizatori` dupa `id_cookie`
2. Seteaza `$_SESSION[id_utilizator]`, `$_SESSION[status]`, `$_SESSION[id_cookie]`, `$_SESSION[nume_prenume_curent]`
3. Seteaza `$_SESSION[grupa_clasa_copil]` si `$_SESSION[grupa_clasa_copil_]`
4. Daca request-ul contine `params.grupa`, suprascrie grupa din sesiune
5. Status compus (ex: "profesor,director,administrator") → se foloseste "director" (vizibilitate maxima)
6. Constanta `TID4K_GATEWAY_MODE` permite endpoint-urilor sa sara peste re-initializarea sesiunii

## Domain-Specific APIs

### `construction.ts`
- Sites: `getSites()`, `upsertSite()`, `deleteSite()`
- Teams: `getTeams()`, `upsertTeam()`, `deleteTeam()`
- Tasks: `getTasks()`, `createTask()`, `updateTask()`
- Costs: `getCosts()`, `createCost()`, `deleteCost()`
- Assignments: `getAssignments()`, `upsertAssignment()`, `deleteAssignment()`

### `culture.ts`
- Shows: `getShows()`, `createShow()`, `updateShow()`, `deleteShow()`, `getShowById()`
- Cast: `getCast()`, `upsertCast()`, `deleteCast()`
- Sponsors: `getShowSponsors()`, `upsertShowSponsor()`, `deleteShowSponsor()`
- Surtitles: `getSurtitleBlocks()`, `upsertSurtitleBlock()`, `deleteSurtitleBlock()`
- Live: `getLiveState()`, `setLiveState()` (realtime surtitle control)

### `surtitles.ts`
- Shows: `getShows()`, `createShow()`, `updateShow()`, `deleteShow()`
- Blocks: `getBlocks()`, `upsertBlock()`, `deleteBlock()`
- Realtime: `subscribeToShow()` — Listen for live surtitle updates

### `inventory.ts`
- `getInventoryItems(orgId)` / `createInventoryItem()` / `updateInventoryItem()` / `deleteInventoryItem()`
- `getMovements(itemId)` / `recordMovement()` — Stock in/out

### `ssm.ts`
- `getTemplates(orgId)` / `createTemplate()` / `deleteTemplate()`
- `getChecklists(orgId)` / `createChecklist()` / `updateChecklist()`

### `workshops.ts`
- `getVehicles()` / `createVehicle()` / `updateVehicle()` / `deleteVehicle()`
- `getAppointments()` / `createAppointment()` / `updateAppointment()` / `deleteAppointment()`

### `living.ts`
- `getApartments()` / `createApartment()` / `updateApartment()` / `deleteApartment()`
- `getExpenses()` / `createExpense()` / `deleteExpense()`
- `getExternalAdmins()` / `createExternalAdmin()` / `deleteExternalAdmin()`

### `magazine.ts`
- `getArticles(orgId)` / `createArticle()` / `updateArticle()` — School magazine

### `clubs.ts`
- `getClubs(orgId)` / `createClub()` / `deleteClub()`
- `getMyMemberships(userId)` / `joinClub()` / `leaveClub()`

## Integration APIs

### `sponsors.ts`
- `getSponsors()` — All sponsors
- `getActivePromos(location)` — Active promos by display location
- `getSponsorPlans()` — Available sponsor plans
- `getAllCampaigns()` / `createCampaign()` / `updateCampaign()` / `updateCampaignStatus()`
- `getSponsorStats(sponsorId)` — Impressions, clicks, CTR
- `logImpression(promoId)` / `logClick(promoId)` — Analytics

### `sponsorPolicies.ts`
- Organization-level sponsor placement policies

### `facebook.ts`
- `getFacebookSettings()` / `postToFacebook(content)` / `getPostLog()`

### `whatsapp.ts`
- `getWhatsappMappings()` / `createMapping()` / `syncStatus()`

### `websiteConfig.ts`
- `getWebsiteConfig(orgId)` / `saveWebsiteConfig(orgId, config)`

### `infodisplay.ts`
- `getInfodisplayContent()` — Panels, ticker, QR codes, settings
- `generateVideo(type)` — Video generation (edge function stub)

### `guestTokens.ts`
- `getDailyToken(orgId)` — Get or create today's guest QR token
- `validateGuestToken(orgId, token)` — Validate via edge function

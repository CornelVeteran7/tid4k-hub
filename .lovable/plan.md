

# InfoDisplay: Full System Analysis & Implementation Plan

## What the BI Document Defines vs What We Built

### Architecture Overview from BI v5

The BI document defines a **modular architecture** with:
- **8 CORE components** (shared across ALL verticals)
- **14 Extra modules** (M1-M14, activated per vertical)
- **8 verticals** with specific module combinations

---

## CORE Components (8) — Status in Current Build

| # | CORE Component | Status | Notes |
|---|---|---|---|
| C1 | Display fizic (Pi + ecran + continut) | **BUILT** | `PublicDisplay.tsx` + `Infodisplay.tsx` — panel rotation, ticker, QR codes |
| C2 | QR auth (fara email, PIN/telefon) | **PARTIAL** | Auth is email/password + Google OAuth. No QR/PIN auth. BI says "QR auth fara email" is CORE |
| C3 | QR Cancelarie | **BUILT** | `QRCancelarie.tsx` — public vs authenticated views |
| C4 | Anunturi banda stiri | **BUILT** | `Announcements.tsx` + `AnnouncementsTicker.tsx` — priority, expiry, hide/show |
| C5 | Mesagerie | **BUILT** | `Messages.tsx` — conversations, realtime, read status |
| C6 | Galerie foto + documente | **PARTIAL** | `Documents.tsx` has file upload to Supabase Storage. No gallery/lightbox, no thumbnails |
| C7 | NFC | **STUB** | Toggle in SettingsTab. No actual NFC Web API integration |
| C8 | Profil/Fisa | **PARTIAL** | `children` table has `alergii`, `note_medicale`, `info_extra` JSONB. `ChildDetailDialog` exists but basic |

---

## Extra Modules (M1-M14) — Status

| Module | Name | Verticals | Status | Notes |
|---|---|---|---|---|
| M1 | Meniu OMS (calcul nutritional) | kids | **BUILT** | `WeeklyMenu.tsx` — meals grid, allergens, nutritional data table exists. Missing: OMS validation, auto-calculation |
| M2 | Prezenta + Contributii | kids, schools | **BUILT** | `Attendance.tsx` — weekly grid, save. Missing: auto contribution calculation from attendance |
| M3 | Queue / Coada digitala | medicine, students | **NOT BUILT** | No queue management system |
| M4 | Orar avansat (multi-clasa) | schools | **BUILT** | `Schedule.tsx` + `ScheduleCancelarie.tsx` — basic schedule. Missing: multi-class propagation |
| M5 | TTS Povesti AI | kids | **BUILT** | `Stories.tsx` — story listing, categories, audio_url field. Missing: actual AI TTS generation |
| M6 | Video gen (MP4 display+social) | kids, schools, medicine, culture | **NOT BUILT** | No video generation pipeline (was Node.js + Puppeteer + FFmpeg in legacy) |
| M7 | WhatsApp + Facebook sync | kids, schools | **STUB** | `SocialMediaWhatsapp.tsx` + `SocialMediaFacebook.tsx` exist as pages but are placeholder UIs |
| M8 | Inventar QR (cross-vertical) | workshops, construction, kids, schools, living | **NOT BUILT** | No inventory system |
| M9 | SSM / Documente legale | construction | **NOT BUILT** | No SSM checklists |
| M10 | Revista scolara digitala | schools | **NOT BUILT** | No school magazine feature |
| M11 | Supratitrare telefon | culture | **NOT BUILT** | No surtitling system |
| M12 | Taskuri (management activitati) | construction | **NOT BUILT** | No task management |
| M13 | Echipe (programare pe locatii) | construction | **NOT BUILT** | No team scheduling |
| M14 | Costuri (tracking vs buget) | construction | **NOT BUILT** | No cost tracking |

---

## Vertical-Specific Readiness

| Vertical | Expected Modules | Built | Missing | Readiness |
|---|---|---|---|---|
| **Kids** | CORE + M1,M2,M5,M6,M7 | CORE(6/8) + M1,M2,M5 | QR auth, NFC, Gallery, M6 video, M7 social | ~65% |
| **Schools** | CORE + M2,M4,M6,M7,M8,M10 | CORE(6/8) + M2,M4 | QR auth, NFC, Gallery, M6,M7,M8,M10 | ~40% |
| **Medicine** | CORE + M3,M6 | CORE(6/8) | QR auth, NFC, Gallery, M3 queue, M6 | ~25% |
| **Living** | CORE + M8 | CORE(6/8) | QR auth, NFC, Gallery, M8 | ~25% |
| **Culture** | CORE + M6,M11 | CORE(6/8) | QR auth, NFC, Gallery, M6,M11 | ~25% |
| **Students** | CORE + M3 | CORE(6/8) | QR auth, NFC, Gallery, M3 | ~25% |
| **Construction** | CORE + M8,M9,M12,M13,M14 | CORE(6/8) | QR auth, NFC, Gallery, M8,M9,M12,M13,M14 | ~20% |
| **Workshops** | CORE + M8 | CORE(6/8) | QR auth, NFC, Gallery, M8 | ~25% |

---

## Critical Gaps (What BI Says is MUST HAVE but is Missing or Broken)

### 1. Vertical-Aware Module Visibility (HIGH PRIORITY)
`verticalConfig.ts` defines module lists per vertical, but the **Dashboard and navigation do NOT use it**. `AppLayout.tsx` hardcodes Kids-specific nav items. The dashboard always shows Kids modules regardless of org vertical type.

### 2. Organization-Scoped Data (HIGH PRIORITY)
Most tables lack `organization_id`. Data is not scoped per org — a user in org A can see org B's announcements, documents, etc. The `get_user_org_id()` function exists but only `organizations` and `modules_config` tables use it in RLS. All other tables (announcements, documents, children, attendance, messages, etc.) have **no org scoping**.

### 3. QR Auth (CORE C2) — Not Implemented
BI defines QR+PIN as a CORE component. Current auth is email/password only. For kindergartens, grandparents need a simpler method.

### 4. Gallery with Lightbox (CORE C6) — Incomplete
Documents page handles uploads but has no image gallery view, no lightbox, no thumbnail generation.

### 5. Contribution Calculation from Attendance (M2)
BI specifically calls out "Prezenta bifata -> contributie calculata automat" as a key differentiator. Not implemented.

### 6. OMS Nutritional Validation (M1)
Menu exists but doesn't auto-calculate calories/protein/fat per age group per OMS 541/2025.

---

## Implementation Plan (Prioritized)

### Phase 1: Fix Multi-Tenancy Foundation (CRITICAL)
1. **Add `organization_id` to all data tables** — announcements, documents, children, groups, attendance, schedule, menu_items, stories, infodisplay_*, conversations, messages
2. **Update RLS policies** to scope all reads/writes by `get_user_org_id(auth.uid())`
3. **Update all API files** to pass organization context
4. **Update `handle_new_user()` trigger** to assign org from invite/signup flow

### Phase 2: Vertical-Aware UI
5. **Wire `verticalConfig` into Dashboard** — show/hide module cards based on org's `vertical_type`
6. **Wire `verticalConfig` into AppLayout navigation** — dynamic sidebar items per vertical
7. **Update terminology** — use `entityLabel`/`memberLabel` from vertical config (e.g., "Copil" vs "Pacient" vs "Muncitor")

### Phase 3: Complete CORE Components
8. **C6 Gallery** — image lightbox, thumbnails via Supabase Storage transforms
9. **C7 NFC** — Web NFC API integration with fallback to QR+PIN
10. **C8 Profile/Record** — full JSONB editor for child/patient/vehicle profiles with allergy/medical fields

### Phase 4: Kids Vertical Completion (Keep TID4K Working)
11. **M2 Contributions** — auto-calculate food contribution from attendance days
12. **M1 OMS Validation** — nutritional calculator per OMS 541/2025 age groups

### Phase 5: New Vertical Modules
13. **M3 Queue Management** (medicine, students) — digital queue with QR check-in, "your turn" notifications
14. **M8 QR Inventory** (cross-vertical) — scan QR on items, track stock
15. **M12-M14 Construction modules** — tasks, teams, cost tracking

### Phase 6: Integration & Advanced
16. **M6 Video Generation** — Edge Function with Puppeteer/FFmpeg (or third-party API)
17. **M7 Social Sync** — WhatsApp Business API + Facebook Graph API integration
18. **M5 TTS** — ElevenLabs API integration for story narration

---

## What NOT to Change (TID4K Compatibility)
- Keep all existing Kids pages (`Attendance`, `WeeklyMenu`, `Stories`, `Documents`, `Messages`, `Schedule`, `Infodisplay`)
- Keep the current Dashboard layout for Kids vertical
- Keep Romanian language throughout
- Keep the existing auth flow (email/password + Google) as primary, add QR as secondary


# Types Reference

> Last updated: 2026-03-10

All types in `src/types/index.ts` and `src/types/sponsor.ts`.

## Core Types

```ts
UserSession {
  id, nume_prenume, telefon, email, status (CSV roles),
  avatar_url, grupa_clasa_copil, numar_grupe_clase_utilizator,
  index_grupa_clasa_curenta, grupe_disponibile: GroupInfo[],
  organization_id?, vertical_type?, org_name?
}

GroupInfo { id, nume, tip: 'gradinita' | 'scoala' }
Child { id, nume_prenume, group_id, data_nasterii?, parinte_id?, ... }
```

## Content Types

```ts
Announcement { id, titlu, continut, data_upload, autor, prioritate, target, citit, ascuns_banda, pozitie_banda? }
DocumentItem { id, nume_fisier, tip_fisier, categorie, url, thumbnail_url?, marime, ... }
ScheduleCell { id?, zi, ora, materie, profesor, sala?, culoare }
MenuItem { masa, zi, continut, emoji? }
WeeklyMenu { saptamana, items: MenuItem[], nutritional: NutritionalData[], alergeni, semnaturi }
Story { id, titlu, continut, categorie, varsta, audio_url?, video_url?, media_type?, favorit? }
Conversation { id, contact_nume, contact_id, ultimul_mesaj, data_ultimul_mesaj, necitite, grupa }
Message { id, expeditor, expeditor_nume, destinatar, mesaj, data, citit }
AttendanceRecord { id?, child_id, nume_prenume_copil, prezent, observatii }
```

## Domain Types

```ts
// Construction
ConstructionSite { id, nume, status, adresa, buget, progress_pct, contractor, ... }
ConstructionTeam { id, nume, specialitate, nr_membri, leader_name, members }
ConstructionTask { id, titlu, status, prioritate, site_id, team_id, assigned_workers, photo_url, ... }
ConstructionCost { id, site_id, descriere, categorie, suma_platita, total, furnizor, ... }

// Culture
CultureShow { id, title, show_date, show_time, duration_minutes, acts, language, status, synopsis, ... }
ShowCast { id, show_id, artist_name, role_name, artist_bio, artist_photo_url, sort_order }
CultureSurtitleBlock { id, show_id, sequence_number, text_ro, text_en, text_fr, text_de, act_number, scene_number, stage_direction }

// Medicine
MedicineService { id, name, description, price_from, price_to, duration_minutes, ordine, activ }
DoctorProfile { id, name, photo_url, specialization, credentials, bio, ordine, activ }

// Inventory
InventoryItem { id, nume, categorie, cantitate, unitate, locatie, pret_unitar, cod_qr }
InventoryMovement { id, item_id, tip: 'in'|'out', cantitate, motiv, efectuat_de }

// Sponsor
Sponsor { id, nume, logo_url, website, ... }
SponsorPromo { id, sponsor_id, tip, titlu, continut, activ, ... }
SponsorCampaign { id, sponsor_id, status, start_date, end_date, placements, ... }
```

## Infodisplay Types

```ts
InfodisplayPanel { id, tip, continut, durata, ordine }
InfodisplayConfig { panels, ticker_messages, qr_codes, transition: 'fade'|'slide' }
```

## Vertical Config Types

```ts
VerticalType = 'kids' | 'schools' | 'medicine' | 'living' | 'culture' | 'students' | 'construction' | 'workshops'

VerticalDefinition {
  label, description, defaultModules: string[],
  entityLabel, memberLabel, staffLabel, parentLabel (+ plurals),
  icon, groupTypeDefault,
  moduleLabels: { prezenta, imagini, documente, povesti, ateliere, meniu, mesaje },
  summaryLabels: { mealLabel, activityLabel, attendanceLabel, membersTitle }
}
```

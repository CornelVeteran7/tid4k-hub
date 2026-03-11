

# Plan: Ateliere din infodisplay.ro — Scrape, Cache & Display

## Obiectiv
Pagina Ateliere (Kids) afișează atelierele extrase automat de pe infodisplay.ro/ateliere, cu atelierul lunii curente evidențiat. Eliminăm Citește/Ascultă/Video din Ateliere (rămân doar în Povești). Card complet per atelier + buton "Programează" care deschide infodisplay.ro/ateliere în iframe-ul ExternalLinkContext.

## Ce există pe infodisplay.ro/ateliere
12 ateliere, câte unul pe lună (+ 2 Săptămâna Verde/Altfel), fiecare cu:
- Luna + personaj (Inky/Nuko/Vixie/Poki/Eli)
- Titlu, descriere, "Ce învățăm?", "Ce primim?"
- Imagine (URL: `infodisplay.ro/admin/uploads/...`)

Luna curentă (Martie) = "Mărțișor" cu Nuko.

---

## Modificări planificate

### 1. DB — Tabel cache ateliere externe

Tabel nou `external_workshops` pentru cache-ul datelor scrape-uite:

```sql
CREATE TABLE public.external_workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  luna TEXT NOT NULL,           -- 'Martie', 'Aprilie', etc.
  personaj TEXT,               -- 'Nuko', 'Inky', 'Vixie', 'Poki', 'Eli'
  titlu TEXT NOT NULL,
  descriere TEXT,
  ce_invatam TEXT,
  ce_primim TEXT,
  imagine_url TEXT,
  ordine INT DEFAULT 0,
  source_url TEXT DEFAULT 'https://infodisplay.ro/ateliere',
  scraped_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(titlu)
);
```

RLS: permite SELECT pentru toți utilizatorii autentificați. INSERT/UPDATE doar pentru service role (edge function).

### 2. Edge Function — `scrape-workshops`

**`supabase/functions/scrape-workshops/index.ts`**

- Fetch `https://infodisplay.ro/ateliere` ca HTML
- Parse cu regex/string manipulation (Deno nu are DOM nativ, dar putem folosi regex pe structura repetitivă)
- Extragem per atelier: luna, personaj, titlu, descriere, ce_invatam, ce_primim, imagine_url
- Upsert în `external_workshops` (ON CONFLICT pe titlu)
- Returnează lista de ateliere inserate

### 3. API Layer — `src/api/externalWorkshops.ts`

```typescript
// getExternalWorkshops() — citește din DB cache
// refreshWorkshops() — invocă edge function dacă cache > 24h
// getCurrentMonthWorkshop() — returnează atelierul lunii curente
```

Logica: la primul load, verifică `scraped_at` — dacă > 24h, invocă edge function-ul pentru refresh, apoi citește din DB. Returnează imediat datele existente din cache.

### 4. Pagina Ateliere refactorizată

**`src/pages/Stories.tsx`** — rămâne cu Citește/Ascultă/Video (neschimbat).

**Componentă nouă sau refactorizare a modulului `ateliere`** din `ModuleHub.tsx`:
- Când user-ul deschide modulul Ateliere, se deschide pagina cu atelierele externe
- **Atelierul lunii** = card mai mare, primul, cu badge "Atelierul Lunii" (mapare lună curentă: Martie → "Martie")
- **Restul atelierelor** = grid cards cu imagine, titlu, personaj, luna
- Click pe card → dialog/pagină detalii cu: imagine mare, descriere, ce învățăm, ce primim
- Buton **"PROGRAMEAZĂ ACEST ATELIER"** → `openExternalLink('https://infodisplay.ro/ateliere')` via ExternalLinkContext (iframe modal)

### 5. Eliminare din Ateliere

- Eliminarea secțiunilor Citește/Ascultă/Video din zona de Ateliere (dacă există acolo — din cod văd că sunt doar în Stories.tsx, deci nu e nevoie de schimbări)
- Asigurare că WorkshopsTab din Admin rămâne funcțional pentru atelierele custom create de admin (cele din DB `workshops`), separat de cele externe

### 6. Detectare lună curentă

Mapare simplă: `new Date().getMonth()` → numele lunii în română → match cu `external_workshops.luna`.

---

## Structura vizuală

```text
┌─────────────────────────────────┐
│ 🎨 Ateliere Educative           │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ⭐ ATELIERUL LUNII          │ │
│ │ [imagine mare Mărțișor]     │ │
│ │ Mărțișor — cu Nuko          │ │
│ │ Descriere scurtă...         │ │
│ │ [PROGRAMEAZĂ]               │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌──────────┐ ┌──────────┐      │
│ │ Aprilie  │ │ Mai      │      │
│ │ Catapul. │ │ Misiune  │      │
│ │ cu Vixie │ │ cu Vixie │      │
│ └──────────┘ └──────────┘      │
│ ...                             │
└─────────────────────────────────┘
```

## Ordine implementare
1. Migrare DB (tabel `external_workshops`)
2. Edge Function `scrape-workshops` (parse + upsert)
3. API layer `src/api/externalWorkshops.ts`
4. Pagină/componentă Ateliere refactorizată cu card detalii + buton programează
5. Integrare în ModuleHub

## Detalii tehnice

- **Scraping**: Edge function folosește `fetch()` pe `infodisplay.ro/ateliere`, primește HTML, extrage blocurile repetitive cu regex pe pattern-ul `### Titlu` + `**Ce învățăm?**` + `**Ce primim?**` + imagine URL
- **Cache 24h**: `scraped_at` verificat client-side; dacă expirat, se invocă edge function-ul async (user-ul vede datele vechi instant, refresh-ul e background)
- **ExternalLinkContext**: Folosit deja în app pentru link-uri externe — butonul "Programează" va folosi exact același pattern




# Plan: Mobile Dashboard — Rezumatul Zilei + Prezența Grid

## What the user wants

1. **Mobile welcome card** shows "Rezumatul zilei:" subtitle instead of generic group text
2. **Quick stat buttons** (Prezența, Fotografii, Documente) show real today counts
3. **Prezența button** opens a **full-screen avatar grid** (not the module panel) where teachers tap to toggle attendance — green circle = present, green name = QR-scanned. Tapping outside closes and auto-saves.
4. **Imagini/Documente buttons** open their respective module cards
5. Grid must fit ~30 children on one screen, auto-scale, scroll if more
6. Attendance timestamps tracked (DB needs `marked_at` column)

## DB Migration

Add `marked_at` timestamp to `attendance` table for time tracking:

```sql
ALTER TABLE public.attendance 
ADD COLUMN IF NOT EXISTS marked_at timestamptz DEFAULT now();

-- Also add a column to track QR-scanned presence (parent self-check-in)
ALTER TABLE public.attendance 
ADD COLUMN IF NOT EXISTS scanned_by_parent boolean DEFAULT false;
```

## Changes

### 1. `src/pages/Dashboard.tsx` — Mobile welcome card + quick stats

**Welcome card mobile section** (line ~433):
- Change `"Bun venit, {name}! 👋"` to include "Rezumatul zilei" as subtitle
- Keep name as heading, add `<p className="text-xs text-muted-foreground">Rezumatul zilei · {currentGroup?.nume}</p>`

**QuickStatsRow** (line ~92):
- Prezența button: instead of `open-module` event, opens a new `AttendanceGrid` overlay (state in Dashboard)
- Value: fetch real today attendance count via `getAttendance()` — show `{present}/{total}`
- Imagini/Documente: keep `open-module` behavior but show today's real count (fetch from documents API or keep mock for now)

### 2. New component: `src/components/dashboard/AttendanceGrid.tsx`

Full-screen overlay (not a dialog — a `fixed inset-0` overlay with backdrop) containing:

**Layout:**
- Header: "Prezența — {groupName}" + date + "{present}/{total}" counter
- Grid of child avatars using CSS grid that auto-scales:
  - `grid-cols-5` on small phones, `grid-cols-6` on larger — each cell ~60px
  - Each cell: circular avatar (initials + pastel color), name below, green ring if present
  - If `scanned_by_parent === true`: name text is green (QR self-check-in indicator)
  - Tap toggles `prezent`, shows green dot indicator (reuse AttendanceQuickCard pattern)
- Clicking the backdrop (outside grid) closes overlay and saves

**Behavior:**
- On open: load attendance via `getAttendance(groupId, today)` + children data for avatars
- On tap: toggle attendance locally, debounce save to DB via `saveAttendance()`
- On close (tap outside or X button): final save, show brief toast "Prezența confirmată! Prezenți: X | Absenți: Y" (green card like in screenshot 3)
- Each save updates `marked_at` to current time
- Re-opening same day loads existing state, allows re-toggling

**Grid sizing for 30 children:**
- 5 columns × 6 rows = 30 on screen
- Each avatar: `w-12 h-12` (48px) + 16px name = ~70px per row
- 6 rows × 70px = 420px — fits in mobile viewport
- If >30: `overflow-y-auto` scroll

### 3. `src/api/attendance.ts` — Update `saveAttendance`

Add `marked_at: new Date().toISOString()` to each upsert row so the timestamp gets tracked.

### 4. `src/types/index.ts` — Extend `AttendanceRecord`

Add optional `marked_at?: string` and `scanned_by_parent?: boolean` fields.

## Files to modify/create

| File | Action |
|------|--------|
| `supabase/migrations/new.sql` | Add `marked_at`, `scanned_by_parent` columns to attendance |
| `src/components/dashboard/AttendanceGrid.tsx` | **New** — full-screen attendance grid overlay |
| `src/pages/Dashboard.tsx` | Update welcome card subtitle, wire prezența button to grid overlay |
| `src/api/attendance.ts` | Include `marked_at` in saves |
| `src/types/index.ts` | Add new fields to AttendanceRecord |

## Implementation order
1. DB migration
2. Type + API updates
3. AttendanceGrid component
4. Dashboard integration




# Redesign Attendance Page - Weekly Tabular View

## Overview

Replace the current single-day attendance list (vertical scroll with individual cards per child) with a **weekly tabular grid** matching the screenshot: a compact table where each row is a child and each column is a weekday (L, Ma, Mi, J, V), with checkboxes at each intersection.

This format is faster for teachers (tick checkboxes across a row instead of scrolling), and prints cleanly on paper.

---

## Reference Screenshot Analysis

The uploaded image shows:

```text
+----------------------------------------------------------+
| PREZENTA                          Prezenti: 0/2    [^]   |
| clasa V                                                   |
| 24 February 2026                                          |
+----------------------------------------------------------+
| Saptamana curenta: 23-27 februarie 2026                   |
+--------+----------+----+----+----+----+----+              |
| Avatar | Nume     | L  | Ma | Mi | J  | V  |             |
+--------+----------+----+----+----+----+----+              |
|  [img] | CI_V_1   | [] | [] | [] | [] | [] |             |
|  [img] | CI_V_2   | [] | [] | [] | [] | [] |             |
+--------+----------+----+----+----+----+----+              |
|       [ Salveaza  ]                                       |
|       [ Printeaza ]                                       |
|       [ Adauga copil ]                                    |
+----------------------------------------------------------+
```

Key features:
- **Yellow header card** with module title, group name, date, and live "Prezenti: X/Y" counter
- **Week label** showing the date range
- **Table** with Avatar, Nume, and 5 weekday columns (L, Ma, Mi, J, V)
- **Today's column is highlighted** (light green/yellow tint)
- **Three action buttons**: Salveaza (green), Printeaza (purple), Adauga copil (gray)

---

## Data Model Changes

### `src/types/index.ts`

Add a new interface for weekly attendance:

```typescript
export interface WeeklyAttendanceRecord {
  id_copil: number;
  nume_prenume_copil: string;
  zile: {
    [date: string]: boolean; // e.g. "2026-02-24": true
  };
  observatii?: string;
}

export interface WeeklyAttendanceData {
  saptamana_start: string; // Monday date
  saptamana_end: string;   // Friday date
  records: WeeklyAttendanceRecord[];
}
```

### `src/api/attendance.ts`

Add a new mock function `getWeeklyAttendance(grupa, mondayDate)` that returns `WeeklyAttendanceData`. The mock generates 5 weekday dates from the given Monday and random presence booleans for each child. Also add `saveWeeklyAttendance(grupa, data)`.

---

## UI Rewrite

### `src/pages/Attendance.tsx` - Complete rewrite

**Header section** (yellow card, matching screenshot):
- Solid yellow (`#FFC107`) background with rounded corners
- "PREZENTA" title (bold), group name, formatted current date
- "Prezenti: X/Y" pill badge (counts today's column only)
- Collapse/expand chevron (optional)

**Week label**:
- "Saptamana curenta: DD-DD luna YYYY" text centered below header

**Table**:
- Columns: Avatar | Nume | L | Ma | Mi | J | V
- Avatar: pastel circle with initials (same pattern as ChildrenScroller)
- Nume: child's full name, bold, truncated
- L/Ma/Mi/J/V: Checkbox components from shadcn
- Today's column gets a highlighted background (e.g., `bg-yellow-50`)
- Table uses `overflow-x-auto` for small screens
- Sticky first two columns (Avatar + Nume) on mobile so names remain visible while scrolling horizontally

**Action buttons** (below table):
- "Salveaza" - solid green/teal button with save icon
- "Printeaza" - solid purple button with printer icon, triggers `window.print()`
- "Adauga copil" - outlined gray button with user-plus icon (shows toast "In curand")

**Week navigation**:
- Small left/right arrows to move between weeks
- Auto-detects current week on load

### Print styles (`src/index.css`)

Add `@media print` rules:
- Hide header, sidebar, FAB, action buttons
- Show only the table at full width
- Ensure borders render cleanly in black and white
- Add a print header with group name, week range, and school name

---

## Technical Details

### Week calculation logic

```typescript
// Get Monday of current week
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

// Generate 5 weekday dates from Monday
function getWeekDates(monday: Date): string[] {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return format(d, 'yyyy-MM-dd');
  });
}
```

### Today column highlighting

```typescript
const today = format(new Date(), 'yyyy-MM-dd');
// In table header and cells, add conditional bg:
className={date === today ? 'bg-yellow-50' : ''}
```

### Prezenti counter

Counts only today's column:
```typescript
const todayPresent = records.filter(r => r.zile[today]).length;
// Display: `Prezenti: ${todayPresent}/${records.length}`
```

---

## Files Summary

| File | Action | Purpose |
|---|---|---|
| `src/types/index.ts` | Edit | Add WeeklyAttendanceRecord and WeeklyAttendanceData types |
| `src/api/attendance.ts` | Edit | Add getWeeklyAttendance and saveWeeklyAttendance mock functions |
| `src/pages/Attendance.tsx` | Rewrite | Weekly tabular view with yellow header, checkboxes, action buttons |
| `src/index.css` | Edit | Add @media print styles for clean paper output |


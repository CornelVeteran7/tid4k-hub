

# Implementation Plan: Vertical Theming, Decorations, Sponsor Maps & Feature Toggles

## Overview

Three workstreams to make each of the 8 verticals visually and functionally distinct:

1. **Per-vertical color themes** applied on switch
2. **Vertical-specific decorative SVG elements** (both sidebar + background)
3. **Per-vertical sponsor page with interactive map**
4. **Feature toggle system** stored in Supabase `org_config`
5. **Fix notification errors** in demo mode

---

## 1. Fix Demo Notification Errors

**File**: `src/contexts/NotificationContext.tsx`

Add early return in `refreshNotifications` when `isDemo` is true. Return static mock notifications instead of hitting Supabase with invalid demo UUIDs.

---

## 2. Per-Vertical Color Themes

**Files**: `src/config/demoEnvironments.ts`, `src/components/WhiteLabelSwitcher.tsx`, `src/contexts/AuthContext.tsx`

Add `primaryColor` and `secondaryColor` to `DemoEnvironment` interface and each entry:

| Vertical | Primary | Secondary |
|---|---|---|
| Kids | `#1E3A4C` (navy) | `#2563b4` (blue) |
| Schools | `#4338ca` (indigo) | `#6366f1` (violet) |
| Medicine | `#b91c1c` (deep red) | `#ef4444` (red) |
| Construction | `#b45309` (amber-brown) | `#d97706` (amber) |
| Workshops | `#57534e` (stone) | `#78716c` (gray) |
| Living | `#166534` (deep green) | `#22c55e` (fresh green) |
| Culture | `#92400e` (gold) | `#b91c1c` (crimson) |
| Students | `#0e7490` (teal) | `#06b6d4` (cyan) |

In `WhiteLabelSwitcher.switchTo()`, call `applyBrandingColors(env.primaryColor, env.secondaryColor)` after setting the demo user. Persist colors in sessionStorage and re-apply on reload in AuthContext init.

---

## 3. Vertical-Specific Decorative SVGs

**New file**: `src/components/decorations/VerticalDecorations.tsx`

Two exported components:
- `BackgroundDecorations({ vertical })` — replaces flowers/bees in Dashboard `BackgroundShapes`
- `SidebarDecorations({ vertical })` — replaces flower/bee in AppLayout `SidebarDecoration`

Contour/topographic lines stay the SAME across all verticals. Only the themed objects change:

| Vertical | Decorative Elements |
|---|---|
| Kids | Flowers, bees, butterflies (current) |
| Schools | Books, pencils, rulers, graduation cap |
| Medicine | Tooth, stethoscope, pill, medical cross |
| Construction | Bricks, hard hat, crane hook, truck |
| Workshops | Wrench, gear, car silhouette, checklist |
| Living | Bed, sun, plant/leaf, house outline |
| Culture | Theater masks, musical note, spotlight, curtain |
| Students | Laptop, coffee cup, notebook, lightbulb |

Each set: 4-6 line-art SVG elements positioned at similar coordinates to current flowers/bees. All drawn with stroke-only (no fill) to match the existing aesthetic.

**Modified files**:
- `src/pages/Dashboard.tsx` — `BackgroundShapes()` keeps contour lines, delegates themed objects to `<BackgroundDecorations />`
- `src/components/layout/AppLayout.tsx` — `SidebarDecoration()` keeps contour lines, delegates to `<SidebarDecorations />`

---

## 4. Per-Vertical Sponsor Page with Interactive Map

**New dependency**: `leaflet` + `react-leaflet` (open-source, no API key needed)

**New file**: `src/pages/SponsorMap.tsx`

Each vertical gets a sponsor/locations page showing:
- An interactive Leaflet map with pins for relevant locations
- Demo data per vertical (schools, clinics, workshops, construction sites, etc.)
- Clicking a pin shows a popup with name, address, and vertical-specific details
- Below the map: a grid of location cards with photos and info

**New file**: `src/data/demoLocations.ts` — demo location data per vertical with lat/lng coordinates (Bucharest area)

**Route**: Add `/harta-locatii` route in `src/App.tsx`

**Navigation**: Add map link to sidebar nav, visible for all verticals

---

## 5. Feature Toggle System (Supabase org_config)

**Database**: No schema changes needed — uses existing `org_config` table with `config_key = 'feature_toggles'`

**New file**: `src/hooks/useFeatureToggles.ts`
- Reads `org_config` for key `feature_toggles` 
- Returns `{ isEnabled(featureKey): boolean, toggles, loading }`
- In demo mode, returns defaults from `verticalConfig.defaultModules`

**SuperAdmin UI**: Add a "Feature Toggles" section to `SuperAdminTemplates.tsx` or a new tab
- Grid of toggleable features: messaging, daily tasks, voting, attendance, documents, etc.
- Per-vertical assignment matrix
- Save to `org_config` via `upsertOrgConfig`

This creates an extensible system where new verticals can be added from SuperAdmin by selecting which features to enable, without code changes.

---

## 6. Files Summary

| File | Action |
|---|---|
| `src/contexts/NotificationContext.tsx` | Add demo mode guard |
| `src/config/demoEnvironments.ts` | Add color fields |
| `src/components/WhiteLabelSwitcher.tsx` | Apply branding on switch |
| `src/contexts/AuthContext.tsx` | Re-apply branding on demo reload |
| `src/components/decorations/VerticalDecorations.tsx` | NEW — 8 themed SVG sets |
| `src/pages/Dashboard.tsx` | Refactor BackgroundShapes |
| `src/components/layout/AppLayout.tsx` | Refactor SidebarDecoration |
| `src/pages/SponsorMap.tsx` | NEW — interactive map page |
| `src/data/demoLocations.ts` | NEW — demo location data |
| `src/hooks/useFeatureToggles.ts` | NEW — feature toggle hook |
| `src/App.tsx` | Add map route |
| `package.json` | Add leaflet, react-leaflet |

---

## 7. Execution Order

1. Fix notification errors (unblocks clean testing)
2. Add color themes + apply on switch
3. Create vertical decorations component
4. Refactor Dashboard + AppLayout to use decorations
5. Install Leaflet, build sponsor map page
6. Build feature toggle hook + SuperAdmin UI
7. Test all 8 verticals end-to-end



# Announcements Ticker Bar + Implementation Audit

## Audit Summary: Current State vs Requirements

| Requirement | Status | Notes |
|---|---|---|
| 1. Horizontal Children Scroller | Done | ChildrenScroller.tsx with snap-x, avatars, parent info |
| 2. Vibrant Card Stack (Hub) | Done | ModuleHub.tsx + ModuleCard.tsx with correct colors, AnimatePresence |
| 3. Configuration Sidebar | Done | ConfigSidebar.tsx with Sheet, Switch toggles, localStorage persistence, nav links |
| 4. Floating Inky Assistant | Done | InkyAssistant.tsx with FAB, context-aware actions, quick-action menu |
| 5. PWA & Tappable Feedback | Done | card-tappable CSS, overscroll-behavior: none, iOS safe-area |
| 6. Announcements Ticker Bar | MISSING | Not yet implemented |

Everything from requirements 1-5 is properly implemented. The only missing feature is the **sticky announcements ticker bar**.

---

## New Feature: Announcements Ticker Bar ("Banda de Anunturi")

A fixed-position horizontal scrolling marquee bar at the bottom of the Dashboard screen, above the Inky FAB. It displays active announcements as a continuously scrolling text ribbon, similar to a news ticker.

### Data Source

The `Announcement` type already has `ascuns_banda: boolean` and `pozitie_banda?: number` fields. Announcements where `ascuns_banda === false` will appear in the ticker, sorted by `pozitie_banda`.

### Visual Design

- Fixed to the bottom of the viewport, just above the safe-area inset
- Height: ~40px
- Background: gradient from primary color with slight transparency + backdrop blur (glass effect)
- Text: white, 13px, bold for urgent announcements
- Urgent items get a small pulsing red dot indicator
- Continuous CSS marquee animation (right-to-left scroll), pauses on touch/hover
- Small "Megaphone" icon at the left edge as a static label

### Component: `src/components/dashboard/AnnouncementsTicker.tsx` (new)

```text
+--------+------------------------------------------------------------+
| [Icon] |  Excursie la Gradina Botanica  *  Modificare program  *  ... |  (scrolling -->)
+--------+------------------------------------------------------------+
```

- Fetches announcements via `getAnnouncements()` from `src/api/announcements.ts`
- Filters to only `ascuns_banda === false` items
- Joins titles with a separator dot into a single scrolling string
- Uses CSS `@keyframes marquee` animation for smooth infinite scroll
- Tapping the bar navigates to `/anunturi`
- If no visible ticker announcements exist, the bar hides entirely

### CSS Animation (added to `src/index.css`)

```css
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-marquee {
  animation: marquee 20s linear infinite;
}
.animate-marquee:hover,
.animate-marquee:active {
  animation-play-state: paused;
}
```

The text content is duplicated inside the scrolling container so the loop appears seamless.

### Dashboard Integration (`src/pages/Dashboard.tsx`)

- Import and render `<AnnouncementsTicker />` at the bottom of the dashboard, as a fixed-position element
- Adjust `pb-20` to `pb-32` to make room for both the ticker bar and the Inky FAB

### Z-Index Stacking

- Ticker bar: `z-50` (below Inky)
- Inky FAB: `z-[70]` (already set, stays above)
- Ticker positioned at `bottom: env(safe-area-inset-bottom) + 56px` to sit above safe area but below Inky

---

## Files Summary

| File | Action | Purpose |
|---|---|---|
| `src/components/dashboard/AnnouncementsTicker.tsx` | Create | Sticky marquee bar component |
| `src/index.css` | Edit | Add marquee keyframes animation |
| `src/pages/Dashboard.tsx` | Edit | Add ticker + increase bottom padding |

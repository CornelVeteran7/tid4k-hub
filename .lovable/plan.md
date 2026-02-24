

# Add Announcement Ticker to Homepage

## What This Does

Adds a scrolling "news band" (bandă de anunțuri) at the bottom of the Dashboard/Homepage, showing active announcements that haven't been hidden from the ticker (`ascuns_banda: false`). This mirrors the ticker concept from the Infodisplay module but places it directly on the teacher's home screen.

## Visual Layout

The ticker will sit as a fixed bar at the very bottom of the Dashboard, above the Inky button. It will have a colored accent background and announcements will scroll continuously from right to left, like a news channel ticker.

```text
+------------------------------------------+
| Header                                   |
+------------------------------------------+
| Welcome Banner                           |
| Children Scroller                        |
| Module Cards                             |
|                                          |
+------------------------------------------+
| [Megaphone icon] Excursie la Gradina ... | <- scrolling ticker
+------------------------------------------+
|                                [Inky FAB]|
```

## Changes

### 1. New Component: `src/components/dashboard/AnnouncementTicker.tsx`

- Fetches announcements via `getAnnouncements()` from `src/api/announcements.ts`
- Filters to only those with `ascuns_banda === false`
- Renders a fixed-bottom bar with a CSS `@keyframes scroll-left` infinite animation
- Each announcement title separated by a dot or star separator
- Urgent announcements highlighted in a different color (red/orange text)
- Tapping the ticker navigates to `/anunturi`
- Styled with a semi-transparent dark or accent background, white text, and a small Megaphone icon on the left

### 2. Edit: `src/pages/Dashboard.tsx`

- Import and render `<AnnouncementTicker />` at the bottom of the Dashboard component
- The ticker is positioned as a sticky/fixed bar at the bottom of the dashboard view

### 3. Edit: `src/index.css`

- Add a `@keyframes scroll-left` animation that translates the ticker content from `100%` to `-100%` over ~20 seconds, looping infinitely
- Add a `.ticker-band` utility class

## Technical Details

| File | Action |
|------|--------|
| `src/components/dashboard/AnnouncementTicker.tsx` | New: scrolling ticker component |
| `src/pages/Dashboard.tsx` | Edit: add `<AnnouncementTicker />` at bottom |
| `src/index.css` | Edit: add `scroll-left` keyframes animation |

The ticker animation uses pure CSS (`translateX`) for smooth 60fps performance without JavaScript timers. The animation duration scales with the number of announcements to maintain readable scroll speed.


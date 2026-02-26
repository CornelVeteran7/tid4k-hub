
# Brand Refresh: Bec Restaurant-Inspired Design

## What Changes

### 1. Updated Color Palette
Shift the primary blue from the current teal (#2b516a) to a deeper, richer navy inspired by Bec Restaurant:
- **Primary**: Deep navy `#1E3A4C` (darker, more sophisticated)
- **Sidebar**: Even deeper `#162D3B`
- **Keep**: The existing accent colors for module cards (yellow, teal, orange, etc.)
- **Remove**: Any salmon/pink tones from the design system
- Update CSS custom properties in `src/index.css`

### 2. Serif Font for Select Elements
Add a serif font (Playfair Display or similar elegant serif) alongside existing Poppins:
- Use serif for section headings like "Rezumatul zilei", chart titles, and the welcome greeting
- Keep Poppins for body text, navigation, and buttons
- Add the font import in `index.html`
- Add it to Tailwind config as a `font-serif` or `font-display` option

### 3. Animated Organic SVG Background
Create a floating, slowly rotating SVG with organic flowing shapes (inspired by Bec's topographic-style line art) on the main content area's white background:
- Add an SVG component with organic curved paths (similar to the flowing lines on Bec's site)
- Apply a slow CSS rotation animation (~60-90s per revolution)
- Render it as a fixed/absolute background element behind the dashboard content
- Use very subtle stroke colors (light gray/muted foreground at ~8-12% opacity) so it doesn't compete with content
- Desktop only (hidden on mobile for performance)
- Placed in `src/pages/Dashboard.tsx` as a background layer

## Files to Modify

1. **`index.html`** -- Add Google Fonts import for a serif font (Playfair Display)
2. **`tailwind.config.ts`** -- Update `fontFamily.serif` to include Playfair Display
3. **`src/index.css`** -- Adjust CSS custom properties for the deeper navy palette (both light and dark themes)
4. **`src/pages/Dashboard.tsx`** -- Add the animated organic SVG background component behind content
5. **`src/components/layout/AppLayout.tsx`** -- Apply serif font to the desktop welcome greeting

## Technical Details

### SVG Background Animation
- Create a `BackgroundShapes` component with 3-4 organic curved paths
- Use CSS `@keyframes` for slow continuous rotation (~90s cycle)
- Position with `fixed` or `absolute` + `pointer-events-none` + low opacity
- Use `will-change: transform` for GPU-accelerated animation

### Color Shift (index.css)
Current sidebar: `204 42% 22%` -> New: `200 45% 16%` (deeper navy)
Current primary: `204 42% 29%` -> New: `200 42% 21%` (richer)
Adjust related border/ring/accent values to match

### Serif Application
Apply `font-serif` class to:
- Welcome heading ("Bun venit, ...")
- Chart section titles
- "Rezumatul zilei" heading
- Group name in the welcome card

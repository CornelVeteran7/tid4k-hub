
# Fix Desktop Dashboard: Logo Size, Card Text Truncation, and Layout

## Issues Identified (from browser inspection)

1. **Logo too small** -- Currently `h-9`, still not prominent enough for desktop
2. **Card subtitles truncated on desktop** -- "Fotografii activit...", "Activități creative pe...", "Meniul zilnic pentru c..." are all cut off by the `truncate` CSS class. The subtitle should wrap or the layout should accommodate it.
3. **Statistics panel** -- Already implemented and showing correctly. No changes needed.

## Plan

### 1. Make sidebar logo larger (AppLayout.tsx)
- Change the logo from `h-9` to `h-11` on line 122 for better desktop visibility

### 2. Fix card subtitle truncation (ModuleCard.tsx)
- Remove the `truncate` class from the subtitle text on line 36
- Allow subtitle text to wrap naturally on desktop so titles like "Activitati creative pentru copii" and "Meniul zilnic pentru copii" display fully
- The subtitle already has `hidden lg:block` so it only shows on desktop where there's more room

### 3. Ensure proper card spacing
- No grid changes needed -- removing `truncate` lets the text flow to a second line within the card, which works well with the current padding

## Files to modify:
- `src/components/layout/AppLayout.tsx` (line 122: logo size)
- `src/components/dashboard/ModuleCard.tsx` (line 36: remove truncate)

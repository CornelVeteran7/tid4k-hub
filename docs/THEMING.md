# Theming System

> Last updated: 2026-03-13

## Architecture

Three layers of theming, applied in order (later overrides earlier):

1. **Base theme** — `src/index.css` `:root` variables (default light theme)
2. **Vertical theme** — CSS attribute selectors `[data-vertical="culture"]` in `index.css`
3. **Org branding** — Inline CSS variables applied via `applyBrandingColors()` in `utils/branding.ts`

## Vertical Themes

Applied via `data-vertical` attribute on `<html>` element.

| Vertical | Theme | Palette |
|----------|-------|---------|
| `kids` | Default (no override) | Navy + warm tones |
| `schools` | Default (no override) | Same as kids |
| `culture` | **Dark opera noir** | Deep crimson `hsl(0,55%,35%)` + gold `hsl(40,60%,45%)`, dark background `hsl(0,0%,6%)` |
| `medicine` | **Clinical clean** | Trust blue `hsl(200,65%,38%)` + teal accent, white background |
| `construction` | **Earth industrial** | Brown `hsl(25,30%,30%)` + amber accent, warm gray background |
| `workshops` | **Steel professional** | Slate blue `hsl(215,25%,28%)`, cool gray background |
| `living` | Default (no override) | Uses org branding colors |
| `students` | Default (no override) | Uses org branding colors |

## CSS Variables

All themes override the same set of variables:
```
--background, --foreground, --card, --card-foreground,
--primary, --primary-foreground, --secondary, --secondary-foreground,
--muted, --muted-foreground, --accent, --accent-foreground,
--destructive, --border, --input, --ring,
--sidebar-background, --sidebar-foreground, --sidebar-accent, etc.
```

## Branding Application Flow

```
Login/DemoSwitch
  → fetchProfile() → getOrganization()
  → loadAndApplyBranding(org)
    → applyBrandingColors(primaryHex, secondaryHex)  // inline CSS vars
    → applyVerticalTheme(verticalType)                // data-vertical attr
```

## Admin Theme Editor

**File**: `src/components/admin/ThemeEditorTab.tsx`

Two sections:
1. **Per-Vertical Presets**: Select vertical type → edit primary/secondary colors → save to `org_config` as `vertical_theme_{type}`
2. **Per-Org Override**: Custom colors for this specific org → saved as `org_config.theme_override`

## Inky Costumes

Default costumes per vertical (in `src/assets/`):
- Kids/Schools/Living/Students: `inky-button.png` (default)
- Medicine: `inky-doctor.png` (lab coat + stethoscope)
- Construction: `inky-construction.png` (hard hat + safety vest)
- Workshops: `inky-mechanic.png` (mechanic overalls + wrench)
- Culture: `inky-opera.png` (red cape + top hat)

Override via `InkyAssistant.tsx` → `VERTICAL_COSTUMES` map or `stilInky.costume_url` from sponsor.

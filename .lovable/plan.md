

# Plan: Centralized Module Config with Admin Editor

## Goal
Create a single source of truth for module colors, labels, and subtitles that is shared between the quick-stat buttons (welcome card) and the module cards (ModuleHub). Add an interactive editor in the Admin Panel (Branding tab) so admins can change these values system-wide.

## Architecture

```text
src/config/moduleConfig.ts        <-- NEW: shared config + context
    |
    +-- DEFAULT_MODULE_CONFIG      (fallback colors/labels)
    +-- ModuleConfigProvider       (React context, reads/writes localStorage)
    +-- useModuleConfig()          (hook to consume config)
    |
    v
+-------------------+     +---------------------+
| Dashboard.tsx     |     | ModuleHub.tsx        |
| (QUICK_STATS)     |     | (MODULES array)     |
| reads colors/     |     | reads colors/        |
| labels from       |     | titles/subtitles     |
| useModuleConfig   |     | from useModuleConfig |
+-------------------+     +---------------------+
    ^
    |
+---------------------------+
| BrandingTab.tsx            |
| (Admin editor UI)          |
| color pickers + text       |
| inputs per module          |
+---------------------------+
```

## Steps

### 1. Create shared module config (new file: `src/config/moduleConfig.ts`)
- Define a `ModuleConfig` type: `Record<moduleKey, { color: string; title: string; subtitle: string }>`
- Set defaults matching current hardcoded values (e.g., prezenta = #FF69B4, "PREZENTA", "Cine a venit azi la grupa")
- Create a React Context (`ModuleConfigContext`) with a provider that:
  - Loads overrides from `localStorage` key `tid4k_module_config`
  - Exposes `config` (merged defaults + overrides) and `updateConfig(key, partial)` + `resetConfig()`
  - On `updateConfig`, saves to localStorage immediately
- Export a `useModuleConfig()` hook

### 2. Wrap app with ModuleConfigProvider
- In `src/App.tsx` or `src/main.tsx`, wrap the router with `<ModuleConfigProvider>`

### 3. Update ModuleHub.tsx to use shared config
- Import `useModuleConfig()`
- Instead of hardcoded `MODULES` colors/titles/subtitles, merge them from config at render time
- Keep icon, key, wide, showShare, countLabel as hardcoded (structural, not customizable)

### 4. Update Dashboard.tsx QUICK_STATS to use shared config
- Convert `QUICK_STATS` from a static const to a computed value inside the component using `useModuleConfig()`
- Map module keys (prezenta, imagini, documente, mesaje) to their config colors, generating `bg-[${color}]` dynamically via inline `style` instead of Tailwind classes (since colors are dynamic)

### 5. Transform BrandingTab.tsx into an interactive editor (admin-only)
- Keep the existing read-only documentation sections
- Replace the static "Culori Module Dashboard" section with an interactive editor:
  - For each module: a color input (HTML `<input type="color">`) + text inputs for title and subtitle
  - Live preview swatch next to each color picker
  - A "Salvează" (Save) button that calls `updateConfig()`
  - A "Resetează la implicit" (Reset) button that calls `resetConfig()`
- The editor is only shown on the Admin Panel (BrandingTab is already admin-only since it's inside AdminPanel which is role-gated to `administrator`)

### 6. No breaking changes
- All existing functionality (edit mode, drag-drop, visibility toggles, sponsor cards) remains untouched
- Default values exactly match current hardcoded values, so the app looks identical until an admin changes something
- The config only affects color, title, and subtitle -- icons, routing, and component mapping stay hardcoded

## Technical Details

- **Storage**: `localStorage` key `tid4k_module_config` stores a JSON object of overrides only (not the full config), so new modules added in code automatically get their defaults
- **Dynamic colors**: Since Tailwind can't handle runtime color values, quick-stat buttons will switch from `className="bg-[#FF69B4]"` to `style={{ backgroundColor: config.prezenta.color }}`
- **Type safety**: `ModuleConfig` will be strongly typed with the 7 module keys as a union type


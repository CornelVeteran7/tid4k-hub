

# Enhanced Superadmin Panel: Full Documentation Hub + Component Templates + Provisioning

## Overview

Rebuild the SuperAdminDocs component into a comprehensive documentation + visual template catalog that covers the entire design system, all whitelabel configurations, and every reusable component. The templates tab becomes an interactive catalog where each component can be previewed and used to pre-fill the provisioning wizard.

## What Changes

### 1. SuperAdminDocs.tsx — Complete Rewrite (~800 lines)

Replace the current thin wrapper with a 5-section tabbed documentation hub:

**Tab: Arhitectură** (keep existing DocsTab content)

**Tab: Design System** (NEW) — Documents:
- Color palette: all CSS variables from `index.css` (primary navy `#1E3A4C`, accent blue `hsl(210 80% 32%)`, success green, warning amber, destructive red)
- Typography: Playfair Display (headings/cards), Poppins (body), monospace (ticker) — with live rendered examples
- Glass tokens: `--glass-bg`, `--glass-border`, `--glass-blur` with example card
- Gradient tokens: `--gradient-primary`, `--gradient-warm`, `--gradient-cool`
- Spacing & radius: `--radius: 0.75rem`
- Dark mode: full dark variable table
- Decorative elements: SVG contour lines spec (opacity 0.08 main, 0.45 sidebar), flower + bee line art
- Per-vertical color assignments: the 8 color pairs from `DEFAULT_COLORS`

**Tab: Componente** (NEW) — Visual catalog of every reusable component pattern:
- **ModuleCard**: Color swatch, title/subtitle typography (Playfair, uppercase, tracking-wide), count badge, share button. Shows the card in 3 states: default, pressed (scale 0.97), edit mode (wiggle). Documents props: `icon`, `color`, `textColor`, `title`, `subtitle`, `count`, `showShare`, `editMode`
- **Dashboard Banner**: Liquid glass welcome card with stat buttons grid (Prezență, Fotografii, Documente, Meniu). Documents the meal-slot time logic
- **AnnouncementsTicker**: Fixed bottom bar, scrolling animation spec (CSS `display-ticker`, triple-duplicated content, `animation-duration` based on count)
- **Messages Layout**: Split-pane (conversation list + chat view), avatar colors, bubble styles, timestamp formatting
- **Schedule Grid**: Day × Hour table, color-coded cells, QR per teacher, edit mode
- **Attendance Table**: Weekly checkbox grid, yellow header with counter, monthly stats view
- **Document Gallery**: Category filters, thumbnail grid, upload drag-drop zone
- **Login Page**: Branded `/login/:orgSlug` with org logo, primary color gradient background
- **Public Display**: Fullscreen slideshow, ticker, QR corner, branding overlay — documents Puppeteer requirements
- **QR Cancelarie**: Tiered access (public vs authenticated), org-branded login link
- **Settings Tabs**: 7-tab layout (General, Branding, Modules, Users, Display, Integrations, Vertical)
- **Sidebar**: Desktop (280px, navy bg with SVG decorations) + mobile sheet, dynamic nav items from `SECONDARY_NAV`

Each component entry shows: description, file path, key props, a small inline preview rendered with actual component styles (colored divs, not screenshots), and vertical-specific variations.

**Tab: Whitelabel** (NEW) — Documents the multi-tenant system:
- How `vertical_type` drives module visibility, terminology, and branding
- Table of all 8 verticals with: icon, label, default modules, entity/member/staff/parent labels
- Branding cascade: `applyBrandingColors()` → CSS custom properties → entire UI
- Module toggle flow: `modules_config` table → `useActiveModules` hook → sidebar + dashboard filtering
- Terminology mapping table (all 8 verticals × 4 label types)
- Org isolation: `user_org_match()` → RLS on every table
- Slug system: `/login/:slug`, `/display/:slug`, `/qr/:slug`

**Tab: Ghiduri** (keep existing UserGuideTab content)

### 2. SuperAdminTemplates.tsx — Rewrite into Interactive Catalog (~600 lines)

Replace the current simple card grid with a full visual template catalog:

- Each of the 8 vertical templates becomes an expandable card showing:
  - **Preview section**: Inline rendering of how the dashboard looks (colored module cards in grid, correct terminology, branding gradient)
  - **Configuration display**: default modules (checkboxes, read-only), default groups, vertical_config fields, color pair
  - **"Folosește acest șablon" button** → navigates to the "Client Nou" tab with all values pre-filled

- Add a **"Component Templates"** section below verticals, organized by category:
  - **Dashboard**: ModuleCard grid layout, banner, stat buttons — with color/label customization preview
  - **Communication**: Messages split-view, announcements ticker
  - **Data Views**: Attendance grid, schedule table, document gallery
  - **Public Pages**: Display slideshow, QR portal, branded login
  - **Admin**: Settings tabs, user management table

Each component template shows a miniature visual preview (using actual Tailwind classes and the component's real styling) plus a description of when/how to use it.

### 3. SuperAdminNewClient.tsx — Minor Enhancement

- Add a `fromTemplate` URL parameter or prop that pre-fills all wizard fields when clicking "Use this template" from the Templates tab
- Keep existing 6-step wizard flow unchanged

### 4. SuperAdmin.tsx — Tab Communication

- Add state to track when Templates tab triggers "use template" → switch to "new" tab with pre-filled data
- Pass callback between tabs

## Files to Create/Edit

1. **`src/components/superadmin/SuperAdminDocs.tsx`** — Full rewrite with 5 documentation tabs
2. **`src/components/superadmin/SuperAdminTemplates.tsx`** — Rewrite with visual catalog + "use template" flow
3. **`src/components/superadmin/SuperAdminNewClient.tsx`** — Add template pre-fill support
4. **`src/pages/SuperAdmin.tsx`** — Add inter-tab state for template → wizard flow

## No Database Changes Required

All documentation is rendered inline from existing config files (`verticalConfig.ts`, `moduleConfig.tsx`, `index.css` variables). No new tables or migrations needed.

## Approach

- All documentation content is hardcoded JSX (not fetched) for instant load and searchability
- Component previews use real Tailwind classes to show accurate representations
- The search filter in docs searches across all 5 tabs (section titles + text content)
- Templates integrate with the existing provisioning wizard via shared state in the parent SuperAdmin page


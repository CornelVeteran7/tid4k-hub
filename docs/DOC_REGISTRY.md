# Documentation Auto-Update Registry

> This file tracks which doc files need updating when specific source files change.

## Registry

| Doc File | Trigger Files | Description |
|----------|--------------|-------------|
| `docs/APP_OVERVIEW.md` | `src/App.tsx`, `src/config/verticalConfig.ts`, `package.json` | Architecture, verticals, tech stack |
| `docs/PAGES.md` | `src/pages/*.tsx`, `src/App.tsx` | All page routes and features |
| `docs/API.md` | `src/api/*.ts` | API function signatures and behavior |
| `docs/HOOKS.md` | `src/hooks/*.ts`, `src/hooks/*.tsx`, `src/config/moduleConfig.tsx` | Custom hooks and context hooks |
| `docs/CONTEXTS.md` | `src/contexts/*.tsx`, `src/config/moduleConfig.tsx` | React context providers |
| `docs/TYPES.md` | `src/types/*.ts` | TypeScript interfaces |
| `docs/ROLES.md` | `src/utils/roles.ts`, `src/contexts/AuthContext.tsx` | Role system and access control |
| `docs/THEMING.md` | `src/index.css`, `src/utils/branding.ts`, `src/components/admin/ThemeEditorTab.tsx`, `src/components/InkyAssistant.tsx` | Theming system |
| `docs/GUEST_ACCESS.md` | `src/hooks/useGuestSession.ts`, `src/api/guestTokens.ts`, `src/pages/QRCancelarie.tsx`, `supabase/functions/validate-guest-token/` | Guest access system |
| `docs/DATABASE.md` | `src/integrations/supabase/types.ts` | Database schema |
| `docs/SPONSORS.md` | `src/api/sponsors.ts`, `src/pages/SponsorAdmin.tsx`, `src/components/sponsor/` | Sponsor system |
| `docs/WORKSHOPS.md` | `src/api/workshops.ts`, `src/pages/WorkshopDashboard.tsx` | Workshop system |

## How to Use

When modifying any source file, check this registry. If the file appears in a trigger column, the corresponding doc should be reviewed and updated.

**For AI assistants**: After modifying functionality, check `docs/DOC_REGISTRY.md` and update affected doc files with new behavior. Update the "Last updated" date in each modified doc.

## Convention

- All doc files use `> Last updated: YYYY-MM-DD` on line 3
- Tables use pipe-separated format
- Code examples use fenced blocks with language tags
- Function signatures include parameter types and return types
- Each doc is self-contained (can be read independently)

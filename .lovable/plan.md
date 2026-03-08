

# Superadmin Panel: Documentation Hub + Client Provisioning from Whitelabel Templates

## What We're Building

A new **Superadmin page** (`/superadmin`, accessible only to `inky` role users) that serves two purposes:

1. **Documentation Hub** -- consolidates all existing docs (from DocsTab, UserGuideTab, SPONSORS.md, WORKSHOPS.md) plus architecture/API reference into a searchable, organized knowledge base
2. **Client Provisioning** -- a wizard to create new organizations from the 8 vertical templates, pre-populating groups, modules, branding, and sample data based on the TID4K base app configuration

## Existing Assets to Leverage

- `DocsTab.tsx` (743 lines) -- full architecture, API, and page documentation
- `UserGuideTab.tsx` (510 lines) -- role-based user guides
- `docs/SPONSORS.md` and `docs/WORKSHOPS.md` -- feature documentation
- `verticalConfig.ts` -- all 8 vertical definitions with labels, modules, terminology
- `seed-demo-orgs` edge function -- template data for all 8 verticals (already has org names, slugs, colors, groups, vertical_config)
- `organizations`, `org_config`, `modules_config`, `groups`, `profiles` tables -- all exist

## Architecture

### Page: `/superadmin` (new route, inky-only)

**Tab 1: Documentație**
- Import and render existing `DocsTab` and `UserGuideTab` content as sub-sections
- Add a "Markdown Docs" section that renders SPONSORS.md and WORKSHOPS.md inline (hardcoded import since they're local files)
- Searchable: filter sections by text query
- Organized by category: Arhitectură, Module, Ghiduri, API Reference

**Tab 2: Clienți (Organizations)**
- Table listing all existing organizations with: name, vertical icon/label, slug, created_at, user count
- Query: `organizations` joined with profile count
- Actions: view/edit org, open org settings, impersonate (switch to org context)

**Tab 3: Client Nou (Provisioning Wizard)**
- Step 1: Select vertical type (8 cards with icon, label, description from VERTICAL_DEFINITIONS)
- Step 2: Fill org details (name, slug auto-generated, address, contact, logo upload)
- Step 3: Customize branding (primary/secondary color pickers, pre-filled from vertical defaults)
- Step 4: Configure modules (checkboxes, pre-checked from vertical's defaultModules)
- Step 5: Set vertical-specific config (dynamic fields from verticalConfig, e.g., daily_rate for Kids, specialties for Medicine)
- Step 6: Create initial groups (pre-filled from template, editable)
- Step 7: Review & Create

On submit, calls the `seed-demo-orgs` edge function (refactored to accept a single org config) OR does direct Supabase inserts:
- Insert into `organizations`
- Insert into `org_config` for vertical-specific settings
- Insert into `modules_config` for active modules
- Insert into `groups` for initial groups
- Optionally create an admin user invite

**Tab 4: Șabloane (Templates)**
- View/edit the 8 vertical templates (what defaults get applied when creating a new client)
- Each template card shows: vertical icon, default modules, default groups, default colors
- Non-editable in v1 (just reference display), but structured for future editing

## Files to Create/Edit

1. **`src/pages/SuperAdmin.tsx`** -- Main page with 4 tabs
2. **`src/components/superadmin/SuperAdminDocs.tsx`** -- Documentation hub (wraps existing DocsTab + UserGuideTab + markdown docs)
3. **`src/components/superadmin/SuperAdminClients.tsx`** -- Organization list with stats
4. **`src/components/superadmin/SuperAdminNewClient.tsx`** -- Multi-step provisioning wizard
5. **`src/components/superadmin/SuperAdminTemplates.tsx`** -- Template reference cards
6. **`src/App.tsx`** -- Add `/superadmin` route (protected, inky-only)

## Database Changes

- **Add `address` and `contact_info` columns to `organizations` table** (currently missing, needed for org details)

```sql
ALTER TABLE public.organizations 
  ADD COLUMN IF NOT EXISTS address text DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_info jsonb DEFAULT '{}';
```

## Access Control

- Route protected: only users with `inky` role can access `/superadmin`
- Client creation uses service role via edge function OR relies on existing `inky` RLS policies (which bypass org isolation via `user_org_match`)

## Key UX Decisions

- The provisioning wizard reuses the same template data structure from `seed-demo-orgs` but for a single org at a time
- Slug is auto-generated from org name (kebab-case, Romanian diacritics stripped)
- After creation, user is offered a link to the new org's settings page and a shareable `/login/:orgSlug` URL
- All documentation is rendered inline (no external links needed) with collapsible sections and search


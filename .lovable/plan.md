

# Seed All 8 Demo Verticals with Admin Credentials

## What We'll Do

Enhance the existing `seed-demo-orgs` edge function to also **create an admin user per organization** with known test credentials, assign them to the org, and grant them the `administrator` + `inky` roles. Then invoke it and verify results.

## Credentials to Generate

| Vertical | Org Name | Slug | Admin Email | Password |
|----------|----------|------|-------------|----------|
| Kids | Grădinița Fluturași Demo | fluturasi-demo | admin@fluturasi-demo.test | Demo2026! |
| Schools | Școala Nr. 1 Demo | scoala-1-demo | admin@scoala-1-demo.test | Demo2026! |
| Medicine | Cabinet Dr. Ionescu Demo | dr-ionescu-demo | admin@dr-ionescu-demo.test | Demo2026! |
| Living | Asociația Bloc A1 Demo | bloc-a1-demo | admin@bloc-a1-demo.test | Demo2026! |
| Culture | Teatrul Național Demo | teatru-national-demo | admin@teatru-national-demo.test | Demo2026! |
| Students | Universitatea Demo | universitate-demo | admin@universitate-demo.test | Demo2026! |
| Construction | Construcții Popescu Demo | constructii-demo | admin@constructii-demo.test | Demo2026! |
| Workshops | Service Auto Rapid Demo | service-rapid-demo | admin@service-rapid-demo.test | Demo2026! |

## Changes

### 1. Update `seed-demo-orgs` Edge Function

After creating each org, add:
- `supabase.auth.admin.createUser()` with email + password + `email_confirm: true`
- Update the new user's `profiles` row: set `organization_id` to the new org, `nume_prenume` to "Admin [OrgName]"
- Insert `user_roles` entries for `administrator` role
- Return the credentials in the response for verification

### 2. Invoke the Function

Call it via `supabase--curl_edge_functions` to trigger seeding. The function already skips existing orgs, so it's safe to re-run.

### 3. Verification Checklist (Code Review)

After seeding, I'll verify by:
- Querying `organizations` table to confirm all 8 exist
- Querying `profiles` to confirm admin users are linked
- Querying `user_roles` to confirm roles assigned
- Querying `groups` to confirm groups created per org
- Checking that login page renders with org branding at `/login/:slug`
- Checking that dashboard loads correct modules per vertical

## What I Cannot Test Programmatically

- Actual browser login flow (would need you to log in manually in the preview)
- Button click behavior on dashboard cards (needs manual interaction)
- I'll document what each vertical's dashboard should show based on `defaultModules` config

## No Frontend Changes

All changes are in the edge function only. The existing provisioning wizard, login page, and dashboard already support multi-org rendering.


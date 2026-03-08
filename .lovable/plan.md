

# Demo Mode — Access All Features Without Login

## Overview

Add a `/demo` public route that instantly logs you in with a fake "superadmin" user session, giving full access to every page (dashboard, infodisplay, sponsors, superadmin, admin panel) without needing real Supabase credentials. A prominent "DEMO MODE" banner will be visible at all times.

## How It Works

### 1. AuthContext — Add `setDemoUser` method

Add a new function to `AuthContextType` that directly sets a mock `UserSession` object into state, bypassing Supabase auth entirely. The mock user will have:
- `status: 'administrator,inky'` (unlocks SuperAdmin + Admin pages)
- `vertical_type: 'kids'`
- `organization_id: undefined` (no org scoping — sees everything)
- Predefined `grupe_disponibile` with sample groups

### 2. New `/demo` route in App.tsx

Add a public `<Route path="/demo" element={<DemoEntry />} />` that:
- Calls `setDemoUser()` on AuthContext
- Redirects to `/` immediately
- No login form needed

### 3. Demo banner component

A fixed top bar (orange/amber, 32px) showing "MOD DEMO — Datele nu sunt salvate" with a "Ieși din demo" button that calls `logout()` and redirects to `/login`.

### 4. API safety layer

For demo mode, the mock user has no real Supabase session token, so all write operations will naturally fail (RLS will block them). The existing `toast.error()` handlers in the UI will show appropriate messages. Read operations that don't require auth (announcements with `anon_read` policies, infodisplay tables) will still work, showing real seeded data.

## Files to Edit

1. **`src/contexts/AuthContext.tsx`** — Add `setDemoUser()` to context, add `isDemo` flag
2. **`src/App.tsx`** — Add `/demo` route with `DemoEntry` component
3. **`src/components/layout/AppLayout.tsx`** — Add demo mode banner at the top
4. **`src/pages/SuperAdmin.tsx`** — No change needed (already checks for `administrator` in status)

## What You'll Be Able to Test

- **Dashboard**: Full module hub with Kids vertical cards, children scroller, announcements ticker
- **Infodisplay**: Panel slideshow, ticker, QR codes, sponsor rotation (reads public data)
- **SuperAdmin**: All 4 tabs — Docs (5 sub-tabs), Clients list, New Client wizard, Templates catalog
- **Sponsor Admin**: Campaign list, editor UI, status toggles (writes will fail gracefully)
- **Admin Panel**: All admin tabs (schools, users, docs, branding, etc.)
- **All other pages**: Schedule, attendance, messages, documents, menu, etc.

## No Database Changes

This is purely a frontend mock. No migrations, no new tables. The demo user exists only in React state.


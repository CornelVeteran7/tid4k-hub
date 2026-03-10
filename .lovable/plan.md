

# Guest Access System — Plan

## Problem
Currently, the QR portal (`/qr/:orgSlug`) works for anonymous visitors and authenticated users, but there's no formal **guest session** system. There are no daily-rotating QR tokens, no bot protection, no session expiry, and role labels like "Spectator" or "Profesor" appear in places where guests shouldn't see them.

## What We're Building

### 1. Daily Rotating QR Tokens
- **New table**: `guest_tokens (id, org_id, token text unique, valid_date date, created_at)`
- Each org gets a new random token generated daily (via edge function or on-demand)
- The `/display/:orgSlug` page generates QR codes pointing to `/qr/:orgSlug?t=<daily_token>` instead of plain `/qr/:orgSlug`
- The QR portal validates the token against today's date — expired/invalid tokens show a "Scan the QR code on the display" message instead of content
- RLS: anon SELECT where `valid_date = current_date`

### 2. Guest Session Management
- When a valid token is verified, store `{ orgSlug, token, guestSessionStart }` in `localStorage`
- Sessions hard-expire at midnight (client-side check on every page load)
- After midnight, localStorage is cleared and guest must re-scan
- No Supabase auth session created for guests — purely client-side with server-validated token

### 3. Invisible Captcha (Cloudflare Turnstile)
- Add Turnstile widget on the QR landing page — fires once on first visit
- **Edge function** `validate-guest-token` handles: token validation + Turnstile response verification
- Returns a short-lived guest JWT (or signed cookie) on success
- Requires a Turnstile site key (public, in code) and secret key (in Supabase secrets)

### 4. QR Portal Refactor (`/qr/:orgSlug`)
- **Remove** role labels from guest view (no "Spectator", "Profesor" badges)
- **Landing state**: If no valid session, show org branding + two buttons:
  - "Continuă ca vizitator" → validates token + Turnstile → enters guest mode
  - "Autentificare" → redirects to `/login/:orgSlug`
- **Guest mode**: Shows vertical-appropriate public content (same data as display: announcements, schedule, menu, documents, sponsors, photos, events, queue)
- **Authenticated mode**: Shows everything guest sees + personal data (own child's attendance, own apartment balance, etc.)
- Content shown per vertical:
  - **Kids**: Announcements, menu, schedule, photos, documents, sponsors
  - **Schools**: Announcements, timetable, magazine, documents, sponsors
  - **Medicine**: Announcements, queue (take ticket), doctors, services, sponsors
  - **Construction**: Announcements, SSM status, active tasks (no names), site info
  - **Workshops**: Announcements, services list, appointment slots, sponsors
  - **Living**: Announcements, maintenance schedule, emergency contacts, sponsors
  - **Culture**: Announcements, show program, surtitle links, sponsors
  - **Students**: Announcements, queue, events, documents, sponsors

### 5. Display QR Code Update
- `PublicDisplay.tsx` generates QR using today's token URL instead of static slug
- Token is fetched/created on display load via `guest_tokens` table
- QR refreshes at midnight automatically

### 6. Security Measures
- **Rate limiting**: The `validate-guest-token` edge function limits requests per IP (60/min) using a simple in-memory counter (or Supabase table for persistence)
- **Token entropy**: 12-character alphanumeric tokens (62^12 combinations)
- **No token reuse**: Each org gets exactly one valid token per day
- **Turnstile**: Blocks automated scrapers from consuming API calls

## Files to Create/Edit

| File | Action |
|------|--------|
| `supabase/migrations/xxx_guest_tokens.sql` | Create `guest_tokens` table + RLS |
| `supabase/functions/validate-guest-token/index.ts` | Token + Turnstile validation edge function |
| `supabase/config.toml` | Add `verify_jwt = false` for the new function |
| `src/pages/QRCancelarie.tsx` | Refactor: add landing screen, remove role labels, token validation flow |
| `src/pages/PublicDisplay.tsx` | Update QR generation to use daily token |
| `src/hooks/useGuestSession.ts` | New hook: manage guest localStorage session + midnight expiry |
| `src/api/guestTokens.ts` | API helpers for token fetch/create |

## Required Secrets
- **Cloudflare Turnstile Site Key** (public — goes in code)
- **Cloudflare Turnstile Secret Key** (private — goes in Supabase secrets)

We'll need to ask you for these keys before implementing the Turnstile integration.

## What This Does NOT Change
- No changes to existing authenticated flows
- No changes to admin panel, dashboard, or any existing page design
- No new roles or role labels
- Existing `/qr/:orgSlug` content logic stays the same — just wrapped in the guest session gate


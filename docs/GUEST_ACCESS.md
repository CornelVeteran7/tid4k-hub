# Guest Access System

> Last updated: 2026-03-10

## Overview

Anonymous visitors can access public content via QR codes without authentication.

## Flow

```
Display TV shows QR code → Visitor scans → /qr/:orgSlug?t=<token>
  → Token validated via edge function → Guest session created in localStorage
  → Public content displayed (announcements, schedule, menu, etc.)
```

## Daily Rotating Tokens

- **Table**: `guest_tokens (id, organization_id, token, valid_date, created_at)`
- **Token format**: 12-character alphanumeric (62^12 combinations)
- **Generation**: `get_or_create_daily_token` RPC — creates one token per org per day
- **RLS**: Anonymous SELECT only where `valid_date = current_date`

## Token Validation

**Edge Function**: `supabase/functions/validate-guest-token/index.ts`
- Validates token exists and matches today's date
- Rate limiting: 60 requests per IP per minute (in-memory counter)
- Prepared for Cloudflare Turnstile verification (needs site key + secret key)
- Returns `{ valid: true, organization_id }` or `{ valid: false, error }`

## Guest Session Hook

**File**: `src/hooks/useGuestSession.ts`

```ts
const { guestSession, isGuest, isValidating, validateAndCreateSession, clearSession } = useGuestSession(orgSlug);
```

- Stores in `localStorage`: `{ orgSlug, token, guestSessionStart }`
- Key: `guest_session_{orgSlug}`
- **Midnight expiry**: Checks `guestSessionStart` against current date on every access
- Auto-clears expired sessions

## QR Code Generation

**File**: `src/pages/PublicDisplay.tsx`

- Fetches/creates daily token via `getDailyToken(orgId)`
- QR points to: `${origin}/qr/${orgSlug}?t=${token}`
- Refreshes at midnight via `setTimeout` to next midnight

## Content Visibility

| Content | Guest | Authenticated |
|---------|-------|---------------|
| Announcements | ✅ | ✅ |
| Schedule/Timetable | ✅ | ✅ |
| Menu | ✅ | ✅ |
| Documents | ✅ | ✅ |
| Sponsors | ✅ | ✅ |
| Own children data | ❌ | ✅ |
| Own apartment data | ❌ | ✅ |
| Messaging | ❌ | ✅ |
| Admin features | ❌ | ✅ (role-based) |

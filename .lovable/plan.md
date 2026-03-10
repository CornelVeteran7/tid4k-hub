

# White-Label Switcher for Demo Mode

## What This Builds

A floating switcher component that lets you instantly switch between all 8 InfoDisplay verticals with different roles, transforming the entire app's branding, sidebar modules, terminology, and sample data context — all within the existing demo mode (no real Supabase accounts needed).

## Architecture

The switcher extends the existing demo mode system. Instead of a single `DEMO_SESSION`, `setDemoUser` will accept parameters to configure which vertical/role to impersonate.

```text
┌─────────────────────────────────────────┐
│  WhiteLabelSwitcher (fixed bottom-left) │
│  Click → Sheet/Panel with 8 verticals  │
│  Click vertical → see role accounts    │
│  Click account → setDemoUser(config)   │
│  App re-renders with new branding      │
└─────────────────────────────────────────┘
```

## Files to Create/Edit

### 1. `src/components/WhiteLabelSwitcher.tsx` (NEW)
- Fixed pill button bottom-left showing current vertical icon + role
- Click opens: mobile = bottom Sheet, desktop = side panel
- Level 1: 8 vertical cards (2×4 grid) with icon, name, color accent, account count
- Level 2: Click vertical → role list with descriptions
- Click role → 300ms branded transition overlay → switch session → navigate
- Keyboard shortcuts: `Ctrl+Shift+D` toggle, `Ctrl+Shift+1-8` quick-switch, `Ctrl+Shift+0` for Inky
- INKY superadmin always shown at top separately
- All environment data defined in a single `ENVIRONMENTS` config array (8 verticals × 3-5 accounts each)

### 2. `src/contexts/AuthContext.tsx` (EDIT)
- Change `setDemoUser` signature to accept optional config: `setDemoUser(config?: { vertical, role, orgName, groups, status })`
- Default (no args) keeps current behavior
- With args: builds a custom `UserSession` with the specified vertical, status, org name, and mock groups matching that vertical
- Store current demo config in sessionStorage for persistence

### 3. `src/components/layout/AppLayout.tsx` (EDIT)
- Render `<WhiteLabelSwitcher />` when `isDemo` is true
- Position it above the demo banner area

### 4. `src/pages/DemoEntry.tsx` (EDIT)
- Accept optional `?vertical=medicine&role=medic` query params
- If present, pass config to `setDemoUser`

## Switching Flow

1. User clicks account in switcher
2. 300ms full-screen overlay (target vertical's color + icon + org name) fades in
3. `setDemoUser({ vertical: 'medicine', status: 'profesor', orgName: 'Clinica DentArt', ... })` called
4. Overlay fades out, app re-renders with new sidebar, branding, terminology
5. Navigate to account's redirect path

## Environment Data (embedded in WhiteLabelSwitcher, not hardcoded credentials)

Since this uses demo mode (no real auth), each "account" is just a config object describing:
- `vertical`: VerticalType
- `status`: role string (maps to existing role system)
- `orgName`: display name
- `groups`: mock GroupInfo[] appropriate for that vertical
- `redirect`: target path after switch

No real emails/passwords — this is purely client-side session mocking.

## Transition Animation

A `DemoTransition` overlay component:
- Absolute positioned, full screen, z-50
- Background = target vertical color
- Center: large icon (64px) + org name in white
- 300ms fade-in → 200ms hold → 300ms fade-out via framer-motion

## Mobile Considerations

- Switcher button: 48px height, clearly tappable
- Panel opens as bottom Sheet (existing Vaul drawer)
- Grid cards use `grid-cols-2` on mobile, no horizontal scroll
- All text minimum 14px

## No Database Changes

Purely frontend. Extends the existing demo mode session mocking.


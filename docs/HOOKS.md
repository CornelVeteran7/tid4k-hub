# Hooks Reference

> Last updated: 2026-03-13

## Custom Hooks

### `useActiveModules(orgId, verticalType)` — `src/hooks/useActiveModules.ts`
Loads active modules from `modules_config` table. Falls back to vertical defaults.
- Returns `{ activeModules: Set<string>, loaded: boolean }`
- Subscribes to realtime changes on `modules_config` table
- Used by dashboard and navigation to show/hide features

### `useFeatureToggles()` — `src/hooks/useFeatureToggles.ts`
Higher-level feature toggle system using `org_config` key-value store.
- Returns `{ toggles, loading, isEnabled(key), setToggle(key, enabled) }`
- In demo mode, uses vertical defaults without DB calls
- Persists to `org_config` with key `feature_toggles`

### `useGuestSession(orgSlug)` — `src/hooks/useGuestSession.ts`
Manages guest access sessions for QR portal.
- Returns `{ guestSession, isGuest, isValidating, validateAndCreateSession(token), clearSession }`
- Stores session in `localStorage` with `guestSessionStart` timestamp
- Hard-expires at midnight (client-side check)
- Validates token via backend API

### `useSponsorRotation(location)` — `src/hooks/useSponsorRotation.ts`
Rotates through active sponsor promos for a display location.
- Returns `{ currentPromo: SponsorPromo | null }`
- Locations: `'dashboard'`, `'infodisplay'`, `'ticker'`, `'inky_popup'`
- Auto-rotates on timer, logs impressions

### `useTouchReorder()` — `src/hooks/useTouchReorder.ts`
Touch/drag reorder for mobile lists (used in module hub).

### `use-mobile()` — `src/hooks/use-mobile.tsx`
Media query hook for responsive design.
- Returns `boolean` — true if viewport ≤ 768px

### `use-toast()` — `src/hooks/use-toast.ts`
Toast notification hook (shadcn/ui wrapper).

## Context Hooks

### `useAuth()` — `src/contexts/AuthContext.tsx`
Central auth context providing:
```ts
{
  user: UserSession | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  isDemo: boolean,
  login(email, password),
  signUp(email, password, fullName),
  loginWithGoogle(),
  logout(),
  setDemoUser(config?),
  qrLogin(sessionId),
}
```
- **Login principal**: cu număr de telefon via `tid4kApi.autentificareTelefon()` (în Login.tsx)
- **Restaurare sesiune**: la mount, verifică `sessionStorage('demo_config')` și `localStorage('tid4k_session')`
- Dacă `tid4k_session` există dar `demo_config` nu → verifică sesiunea pe server via `tid4kApi.verificaSesiune()`
- **Superuser Inky**: detectat prin telefon 1313131313, primește acces complet
- **Demo mode**: doar pe `tid4kdemo.ro`, creează mock user din `demoEnvironments.ts`
- **Logout**: șterge `tid4k_session`, `demo_config`, `demo_branding`, `demo_mode`

### `useGroup()` — `src/contexts/GroupContext.tsx`
Group/class selection:
```ts
{
  currentGroup: GroupInfo | null,
  availableGroups: GroupInfo[],
  switchGroup(groupId),
}
```
- Sourced from `user.grupe_disponibile`

### `useNotifications()` — `src/contexts/NotificationContext.tsx`
Notification aggregation:
```ts
{
  unreadMessages: number,
  newAnnouncements: number,
  notifications: NotificationItem[],
  markAsRead(id), markAllAsRead(), refreshNotifications(),
}
```
- Polls conversations and announcements periodically
- Stores read state in localStorage

### `useExternalLink()` — `src/contexts/ExternalLinkContext.tsx`
Opens external URLs in an in-app iframe dialog:
```ts
{ openLink(url: string) }
```
- 3-second fallback to "open in new tab" if iframe fails

### `useModuleConfig()` — `src/config/moduleConfig.tsx`
Module appearance config:
```ts
{
  config: ModuleConfig,        // colors, titles, subtitles per module
  updateModule(key, partial),  // override module settings
  resetConfig(),               // reset to vertical defaults
}
```
- Persists overrides in localStorage
- Base config built from vertical definition

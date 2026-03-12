# Contexts & State Management

> Last updated: 2026-03-13

## Provider Tree

```
QueryClientProvider (React Query)
└── TooltipProvider (shadcn)
    └── ExternalLinkProvider
        └── BrowserRouter
            └── AuthProvider
                └── GroupProvider (protected routes only)
                    └── NotificationProvider
                        └── ModuleConfigProvider
                            └── AppLayout
                                └── <Routes />
```

## AuthContext (`src/contexts/AuthContext.tsx`)

**Purpose**: Central auth state, user session, demo mode

**State**:
- `user: UserSession | null` — Current user with roles, org, groups
- `isAuthenticated: boolean`
- `isLoading: boolean`
- `isDemo: boolean` — True when using demo mode

**Key Behaviors**:
1. On mount: verifica sesiunea TID4K din localStorage (`tid4k_session`)
2. On login: `tid4kApi.autentificareTelefon(telefon)` → seteaza sesiunea → builds UserSession
3. Grupele vin din `toate_grupele_clase` (array din raspunsul auth)
4. Applies `loadAndApplyBranding()` with org colors + vertical theme
5. Demo mode: date simulate din `demoEnvironments.ts`, fara apeluri server
6. **FISIER PROTEJAT** - `AuthContext.tsx` contine logica critica de sesiune TID4K

## GroupContext (`src/contexts/GroupContext.tsx`)

**Purpose**: Current group/class selection

Reads `user.grupe_disponibile` from AuthContext. Dashboard header allows switching groups.

## NotificationContext (`src/contexts/NotificationContext.tsx`)

**Purpose**: Aggregated notification feed

Polls:
- Unread message count from conversations
- New announcements since last check
- Workshop reminders

Stores read state in localStorage (`tid4k_notif_read`). Max 15 notifications.

## ExternalLinkContext (`src/contexts/ExternalLinkContext.tsx`)

**Purpose**: In-app browser for sponsor links and external URLs

Opens URLs in a Dialog with iframe. Falls back to `window.open` after 3 seconds if iframe doesn't load (X-Frame-Options blocking).

## ModuleConfigProvider (`src/config/moduleConfig.tsx`)

**Purpose**: Module appearance customization (colors, titles)

Per-module settings stored in localStorage (`tid4k_module_config`). Base config derived from `VERTICAL_DEFINITIONS[vertical].moduleLabels`.

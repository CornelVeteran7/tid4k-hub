# Infodisplay Platform — App Overview

> Last updated: 2026-03-10

## What is this?

A **multi-vertical white-label SaaS platform** for digital signage, communication, and management. One codebase serves 8 different verticals (industries), each with customized terminology, modules, theming, and workflows.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions + Realtime)
- **State**: React Query, React Context (Auth, Group, Notifications, ExternalLink, ModuleConfig)
- **Routing**: react-router-dom v6
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Maps**: Leaflet + react-leaflet
- **QR**: qrcode.react
- **PWA**: vite-plugin-pwa

## Verticals

| Key | Label | Entity | Member | Staff |
|-----|-------|--------|--------|-------|
| `kids` | Grădinițe | Grupă | Copil | Educatoare |
| `schools` | Școli | Clasă | Elev | Profesor |
| `medicine` | Medicină | Cabinet | Pacient | Medic |
| `living` | Rezidențial | Bloc | Locatar | Administrator |
| `culture` | Cultură | Sală | Vizitator | Regizor |
| `students` | Universități | Facultate | Student | Profesor |
| `construction` | Construcții | Șantier | Muncitor | Inginer |
| `workshops` | Service Auto | Service | Client | Mecanic |

## Architecture

```
src/
├── api/           # Supabase data access layer (one file per domain)
├── components/    # Reusable UI components
│   ├── admin/     # Admin panel tab components
│   ├── dashboard/ # Dashboard widgets
│   ├── layout/    # AppLayout, sidebar, nav
│   ├── settings/  # Settings page tabs
│   ├── sponsor/   # Sponsor management components
│   ├── superadmin/ # Superadmin panel components
│   └── ui/        # shadcn/ui components
├── config/        # verticalConfig, moduleConfig, demoEnvironments
├── contexts/      # React contexts (Auth, Group, Notification, ExternalLink)
├── data/          # Demo/mock data
├── hooks/         # Custom hooks
├── pages/         # Route page components
├── types/         # TypeScript interfaces
└── utils/         # Utilities (roles, branding)
```

## Authentication & Roles

- **Supabase Auth** with email/password + Google OAuth
- Roles stored as CSV in `profiles.status` field: `"profesor,director"`, `"parinte"`, `"administrator"`
- Role hierarchy: `inky` (superuser) > `administrator`/`director` > `profesor` > `parinte`
- Guest access via daily-rotating QR tokens (no auth session)
- Demo mode: localStorage-based mock user, no Supabase calls

## Multi-tenancy

- Each user belongs to one `organization_id`
- All data tables have `organization_id` foreign key
- Organizations have `vertical_type` enum determining which modules/labels are active
- Org-level config stored in `org_config` table (key-value JSON)

## Theming System

- Vertical-specific CSS themes via `data-vertical` attribute on `<html>`
- Per-org color overrides via `org_config.theme_override`
- Applied automatically on login via `loadAndApplyBranding()` in `utils/branding.ts`
- Admin editor in Admin Panel → "Teme" tab

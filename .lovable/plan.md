

# CRM Engine for SuperAdmin Panel — Multi-Phase Plan

## Overview

Build a full CRM system inside the existing SuperAdmin sidebar with new Supabase tables for persistent tracking of clients, contracts, revenue, tasks, and activity notes. Three phases: database foundation, core CRM UI, and automation/intelligence layer.

---

## Phase 1: Database Schema (Migration)

Create 4 new tables with RLS policies allowing only `inky` role access via the existing `has_role()` function.

### Tables

**`crm_clients`** — Extends organizations with CRM-specific metadata
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| organization_id | uuid FK → organizations | unique, 1:1 |
| status | text | `lead`, `onboarding`, `active`, `at_risk`, `churned` |
| health_score | int | 0-100, auto-calculated |
| owner_name | text | Account manager name |
| onboarding_completed_at | timestamptz | |
| churned_at | timestamptz | |
| tags | text[] | Custom tags |
| created_at / updated_at | timestamptz | |

**`crm_contracts`** — Subscription and revenue tracking
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| client_id | uuid FK → crm_clients | |
| contract_type | text | `subscription`, `hardware`, `one_time` |
| amount_ron | numeric | Monthly or total |
| currency | text | default `RON` |
| start_date | date | |
| end_date | date | nullable |
| renewal_date | date | nullable, for alerts |
| status | text | `active`, `expired`, `cancelled` |
| notes | text | |
| created_at | timestamptz | |

**`crm_notes`** — Activity log / notes per client
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| client_id | uuid FK → crm_clients | |
| author_name | text | |
| content | text | |
| note_type | text | `call`, `email`, `meeting`, `internal`, `system` |
| created_at | timestamptz | |

**`crm_tasks`** — Follow-ups, onboarding steps, reminders
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| client_id | uuid FK → crm_clients | nullable (global tasks) |
| title | text | |
| description | text | |
| due_date | date | |
| priority | text | `low`, `medium`, `high`, `urgent` |
| status | text | `todo`, `in_progress`, `done`, `cancelled` |
| assigned_to | text | |
| task_type | text | `follow_up`, `onboarding`, `nps`, `renewal`, `custom` |
| created_at / completed_at | timestamptz | |

### RLS Policies
All 4 tables: `SELECT/INSERT/UPDATE/DELETE` for authenticated users with `has_role(auth.uid(), 'inky')`. This restricts CRM access to superadmins only.

---

## Phase 2: CRM UI Components (Inside SuperAdmin Sidebar)

Add 3 new nav sections to the existing `NAV_SECTIONS` in `SuperAdmin.tsx`:

### 2a. **CRM Dashboard** (nav key: `crm-dashboard`)
- KPI cards: Total clients, MRR, Active contracts, Overdue tasks, At-risk clients
- Mini pipeline funnel chart (lead → onboarding → active → churned)
- Revenue trend line chart (last 12 months from contracts)
- Upcoming renewals list (next 30 days)
- Overdue tasks alert list

### 2b. **Client Pipeline** (nav key: `crm-pipeline`)
- Kanban board with columns: Lead → Onboarding → Active → At Risk → Churned
- Each card shows: org name, vertical badge, health score bar, MRR, days since last activity
- Drag-and-drop to change status (or click to update)
- Click card → slide-out detail panel with:
  - Contract history
  - Notes timeline
  - Tasks list
  - Quick actions (add note, create task, change status)
- Bulk actions: select multiple → change status, assign owner

### 2c. **Tasks & Follow-ups** (nav key: `crm-tasks`)
- Filtered task list: by status, priority, due date, client
- Quick-create task form with client selector
- Overdue highlighting
- Calendar-style view toggle (list vs. week grid)

### 2d. **Contracts & Revenue** (nav key: `crm-contracts`)
- Table view of all contracts across clients
- Filters: status, type, amount range, renewal window
- MRR/ARR summary cards
- Add/edit contract dialog
- Renewal alerts (contracts expiring in 7/30/60 days)

### New files:
- `src/components/superadmin/crm/CRMDashboard.tsx`
- `src/components/superadmin/crm/CRMPipeline.tsx`
- `src/components/superadmin/crm/CRMTasks.tsx`
- `src/components/superadmin/crm/CRMContracts.tsx`
- `src/components/superadmin/crm/CRMClientDetail.tsx` (slide-out panel)

### Modified files:
- `src/pages/SuperAdmin.tsx` — Add CRM nav group + render cases

---

## Phase 3: Intelligence & Automation

### Auto Health Score
A utility function that computes `health_score` based on:
- Days since last document upload (from `documents` table)
- Days since last announcement
- Number of active display devices online
- Contract renewal proximity
- Task completion rate

Runs on-demand when viewing client detail, updates `crm_clients.health_score`.

### System Notes
Auto-generate `crm_notes` entries (note_type=`system`) when:
- A new organization is created via the wizard → auto-create `crm_clients` row + system note
- Display goes offline for >24h → system note on that client
- Contract approaches renewal → system note

### Onboarding Checklist Templates
Pre-built task sets per vertical that auto-create when a client enters `onboarding` status:
- Kids: "Upload logo", "Configure groups", "Test display", "Train director", "First parent message"
- Each vertical gets ~5 default onboarding tasks

---

## Implementation Order

1. **Database migration** — Create 4 tables + RLS (single migration)
2. **SuperAdmin nav update** — Add CRM group to sidebar
3. **CRM Dashboard** — KPIs + charts from new tables
4. **CRM Pipeline** — Kanban with client cards + detail panel
5. **CRM Contracts** — Revenue tracking table + dialogs
6. **CRM Tasks** — Task management with filters
7. **Health score calculator** — Auto-compute from cross-table data
8. **System auto-notes** — Hook into existing creation flows

Phases 1-6 are the core deliverable. Phases 7-8 are enhancements that build on top.

---

## Technical Notes

- All CRM queries use `supabase` client with `@tanstack/react-query` for caching
- Kanban drag uses existing framer-motion (already installed) for animations, with onClick fallback
- Client detail panel uses `Sheet` component (already in UI library)
- Charts use `recharts` (already installed)
- No edge functions needed — all logic is client-side with RLS-protected tables
- The `crm_clients.organization_id` FK creates a clean bridge between existing org data and CRM metadata


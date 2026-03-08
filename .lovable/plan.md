

# Plan: Workshop Management System + Admin Push & Documentation

## Overview

This plan adds a complete **Workshop (Ateliere) management system** to the Admin Panel, enabling admins to create, edit, and push workshops to one or all school units. The dashboard "ATELIERE" module card will show this month's workshop preview directly (without opening), and push notifications will alert teachers about new workshops.

---

## What Gets Built

### 1. Workshop Data Model & API

**New file: `src/api/workshops.ts`**

Types and mock data for workshops:

```text
Workshop {
  id_atelier: number
  titlu: string
  descriere: string
  luna: string (YYYY-MM)
  imagine_url: string
  categorie: 'arta' | 'stiinta' | 'muzica' | 'sport' | 'natura'
  materiale: string[]
  instructor: string
  durata_minute: number
  scoli_target: string[] (['all'] or specific school IDs)
  publicat: boolean
  data_creare: string
  data_publicare?: string
}
```

API functions:
- `getWorkshops(schoolId?, luna?)` -- fetch workshops, optionally filtered
- `getWorkshopOfMonth(schoolId?)` -- returns this month's active published workshop
- `createWorkshop(data)` -- create new
- `updateWorkshop(id, data)` -- edit
- `deleteWorkshop(id)` -- remove
- `publishWorkshop(id, scoli_target)` -- mark as published + push to units
- Mock data: 2-3 workshops for the current month

### 2. Admin Panel: New "Ateliere" Tab

**New file: `src/components/admin/WorkshopsTab.tsx`**

A new tab in the Admin Panel (`/admin`) with:

- **School selector awareness**: respects the global "Toate unitatile" / specific school filter at top of admin page
- **Workshop list**: cards showing title, month, category badge, publish status, target schools
- **Create/Edit dialog**: form with title, description, category, image URL, materials list, instructor, duration, school target (one / all)
- **Publish button**: marks workshop as published; when target is "all", pushes to every school. Shows confirmation with school count.
- **Status indicators**: Draft (gray), Published (green), showing which schools received it

Changes to `src/pages/AdminPanel.tsx`:
- Add `{ value: 'ateliere', label: 'Ateliere', icon: Paintbrush }` to TABS
- Import and render `<WorkshopsTab>` in the new TabsContent
- The tab respects `selectedSchoolId` (all vs specific)

### 3. Dashboard: Workshop Preview on Module Card

**Modified: `src/components/dashboard/ModuleHub.tsx`**

The "ATELIERE" card currently shows just a title and count. Change it to:
- Fetch `getWorkshopOfMonth()` on mount
- Display workshop title + short description directly on the card (below the subtitle), so teachers see it without tapping
- Add a small "Luna: Martie 2026" label and category badge on the card face
- Keep the card tappable to open full workshop detail

**Modified: `src/components/dashboard/ModuleCard.tsx`**

Add optional `preview` prop (ReactNode) that renders below the subtitle when provided. Only the "ateliere" card will use this prop.

### 4. Notification System: Workshop Push Notifications

**Modified: `src/contexts/NotificationContext.tsx`**

- Import `getWorkshopOfMonth` from workshops API
- Add `'workshop'` as a new notification type in `NotificationItem`
- In `refreshNotifications`, check if there's a published workshop for this month that hasn't been seen (track via localStorage key `tid4k_seen_workshop_[id]`)
- Generate notification: "Atelier nou: [titlu]" with link to open the ateliere module

**Modified: `src/components/layout/AppLayout.tsx`**

- Add `Paintbrush` icon handling for `workshop` notification type in the popover renderer (distinct purple color)

### 5. Documentation

**New file: `docs/WORKSHOPS.md`**

Three sections:
1. **For Admins**: How to create workshops, target specific schools or all, publish flow, editing after publish
2. **For Developers/AI**: API endpoints table, TypeScript interfaces, component architecture, notification integration
3. **API Reference**: Full endpoint spec for backend implementation

```text
POST /ateliere.php?action=create        -- Create workshop
POST /ateliere.php?action=update        -- Edit workshop
POST /ateliere.php?action=publish       -- Publish + push to schools
GET  /ateliere.php?action=list          -- List workshops (filters: school_id, luna)
GET  /ateliere.php?action=current       -- This month's active workshop
POST /ateliere.php?action=delete        -- Delete workshop
POST /ateliere.php?action=notify        -- Trigger push notifications
```

---

## Technical Details

### File Changes Summary

| File | Action | What |
|------|--------|------|
| `src/api/workshops.ts` | NEW | Workshop types, mock data, API functions |
| `src/components/admin/WorkshopsTab.tsx` | NEW | Full admin UI for workshop CRUD + publish |
| `docs/WORKSHOPS.md` | NEW | Documentation for admins and devs |
| `src/pages/AdminPanel.tsx` | EDIT | Add "Ateliere" tab (icon + TabsContent) |
| `src/components/dashboard/ModuleCard.tsx` | EDIT | Add optional `preview` prop |
| `src/components/dashboard/ModuleHub.tsx` | EDIT | Fetch workshop of month, pass preview to ateliere card |
| `src/contexts/NotificationContext.tsx` | EDIT | Add workshop notification type |
| `src/components/layout/AppLayout.tsx` | EDIT | Render workshop notification icon in popover |

### Patterns Followed

- Same `USE_MOCK` toggle pattern as all other API files
- Same collapsible card admin UI pattern as SettingsTab/SchoolsTab
- Same notification item pattern with `type`, `icon`, `navigateTo`
- School selector `selectedSchoolId` passed through just like other admin tabs
- `framer-motion` animations consistent with existing module cards

### Workshop Card Preview Rendering

On the dashboard, the ATELIERE module card will show:

```text
+------------------------------------------+
| [Paintbrush icon]  ATELIERE              |
|                    Activitati creative     |
|   ┌─────────────────────────────┐         |
|   │ Pictură pe sticlă           │  [10]   |
|   │ Artă · Martie 2026          │         |
|   └─────────────────────────────┘         |
+------------------------------------------+
```

This preview text appears only when a workshop-of-the-month exists.


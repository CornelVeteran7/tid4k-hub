
# App UX Audit and Improvements

## Issues Found

### 1. Redundant Group Selector in Header
The header shows a "Grupa Mare" dropdown for ALL users. But teachers typically have 1 group, and that info is already displayed in the welcome banner ("Grupa Mare -- Gradinita"). The dropdown should only appear for users with the `director` or `administrator` role who manage multiple groups. For single-group teachers, the header space is wasted.

**Fix**: Show the group selector only when the user has `director`/`administrator` role OR has more than 1 group. Otherwise, hide it entirely (the welcome banner already displays the group name).

### 2. Sidebar Navigation Duplicates the Hub
The left sidebar (desktop) and burger menu (mobile) list: Prezenta, Documente, Mesaje, Povesti, Meniu, Orar, etc. These are the same items as the colorful module cards on the homepage. For the "zero learning curve" philosophy, the homepage IS the navigation. The sidebar creates confusion.

**Fix**: 
- On mobile: Remove the burger menu entirely. The homepage hub cards ARE the navigation. Add a small back-to-home button on inner pages instead.
- On desktop: Keep the sidebar but make it minimal -- only show admin/management links (Rapoarte, Utilizatori, Configurari, Infodisplay) that don't have hub cards. The hub cards handle the main modules.

### 3. Module Cards Should Expand In-Place (Full-Screen Panels)
Currently, tapping a module card navigates to a completely separate page (e.g., `/prezenta`), losing the hub context. The user wants a "reveal" behavior: tapping a card should expand it smoothly to fill the screen (below the header, above the ticker), showing the module's content. A close/collapse button slides it back down.

**Fix**: Create a `ModulePanel` overlay system:
- Tapping a card triggers a full-screen panel that slides up from the card's position
- The panel fills the area between header and ticker
- A close button (X or swipe-down) collapses it back
- The header and announcements ticker remain visible
- Uses `framer-motion` `AnimatePresence` with `layoutId` for a smooth card-to-panel transition

### 4. Desktop Layout Needs Refinement
On desktop (1920px), the module cards stretch the full width which looks awkward. The children scroller cards are tiny relative to the space. The layout should use the extra space better.

**Fix**: On desktop, constrain the hub content to `max-w-4xl mx-auto` and optionally show a 2-column grid for module cards.

---

## Technical Implementation Plan

### Step 1: Create `ModulePanel` Component
**New file: `src/components/dashboard/ModulePanel.tsx`**

A full-screen overlay panel that:
- Receives the module key, color, title, and children (the page content)
- Animates from the bottom up using framer-motion (`y: "100%"` to `y: 0`)
- Fills `position: fixed; inset: 0; top: [header-height]; bottom: [ticker-height]`
- Has a colored header bar matching the module color with title + close button
- Scrollable content area inside
- Close button triggers exit animation

### Step 2: Refactor `ModuleCard` to Open Panel Instead of Navigate
**Edit: `src/components/dashboard/ModuleCard.tsx`**

- Remove `useNavigate` and the `onClick={() => navigate(route)}` behavior
- Instead, accept an `onOpen` callback prop
- The parent (`ModuleHub`) manages which panel is open via state

### Step 3: Refactor `ModuleHub` to Manage Panel State
**Edit: `src/components/dashboard/ModuleHub.tsx`**

- Add `openModule` state (string | null)
- Pass `onOpen` to each `ModuleCard`
- Render the corresponding `ModulePanel` with the matching page component as children
- Lazy-load the page content inside the panel

### Step 4: Embed Page Components Inside Panels
**Edit: `src/pages/Attendance.tsx`, `Documents.tsx`, `Messages.tsx`, etc.**

- These pages need to work both standalone (via sidebar/direct URL) and embedded inside a panel
- Add an optional `embedded` prop that hides redundant headers (the panel already shows the module title)

### Step 5: Simplify Header -- Conditional Group Selector
**Edit: `src/components/layout/AppLayout.tsx`**

- Show group selector only when `areRol(userStatus, 'director') || areRol(userStatus, 'administrator') || availableGroups.length > 1`
- On mobile: Replace the burger menu button with a simple back arrow (visible only on non-home pages)
- On desktop: Strip the sidebar to only show admin-level links (Rapoarte, Utilizatori, Configurari, Infodisplay), hiding items that have hub cards

### Step 6: Add Back Navigation for Inner Pages
**Edit: `src/components/layout/AppLayout.tsx`**

- On mobile, when not on `/`, show a back arrow that goes to `/` instead of the hamburger
- This replaces the need for a full sidebar on mobile

### Step 7: Desktop Layout Polish
**Edit: `src/pages/Dashboard.tsx`**

- Wrap the dashboard content in `max-w-4xl mx-auto` on large screens
- Module cards: use a 2-column grid on `lg:` breakpoint

---

## Files Summary

| File | Action | Purpose |
|---|---|---|
| `src/components/dashboard/ModulePanel.tsx` | Create | Full-screen sliding panel overlay for module content |
| `src/components/dashboard/ModuleCard.tsx` | Edit | Accept `onOpen` prop instead of navigating |
| `src/components/dashboard/ModuleHub.tsx` | Edit | Manage open panel state, render panels with page content |
| `src/components/layout/AppLayout.tsx` | Edit | Conditional group selector, mobile back button, simplified sidebar |
| `src/pages/Dashboard.tsx` | Edit | Desktop max-width constraint, 2-col grid |
| `src/pages/Attendance.tsx` | Edit | Add `embedded` prop to hide redundant header |
| `src/pages/Documents.tsx` | Edit | Add `embedded` prop |
| `src/pages/Messages.tsx` | Edit | Add `embedded` prop |
| `src/pages/Stories.tsx` | Edit | Add `embedded` prop |
| `src/pages/WeeklyMenu.tsx` | Edit | Add `embedded` prop |

---

## UX Flow After Changes

```text
MOBILE (390px):
+------------------+
| [<-]  Grupa Mare  [bell] [home] |   <- back arrow only on inner pages; group selector only for directors
+------------------+
| Bun venit, Maria!|
| [stat pills]     |
+------------------+
| [children scroll] |
+------------------+
| [PREZENTA card]  |  <- tap opens full-screen panel
| [IMAGINI card]   |
| [DOCUMENTE card] |
| ...              |
+------------------+
| [ticker bar]     |
+------------------+

When card is tapped:
+------------------+
| [header stays]   |
+------------------+
| [yellow bar] PREZENTA  [X close] |
| +------------------------------+ |
| | (Attendance page content)    | |
| | Weekly table, checkboxes...  | |
| +------------------------------+ |
+------------------+
| [ticker stays]   |
+------------------+

DESKTOP (1920px):
+----------+---------------------------+
| Sidebar  | [header with group sel.]  |
| (admin   |--------------------------|
|  links   | Dashboard (max-w-4xl)    |
|  only)   | [welcome] [stats]        |
|          | [children scroller]      |
|          | [2-col module grid]      |
|          |                          |
+----------+---------------------------+
```

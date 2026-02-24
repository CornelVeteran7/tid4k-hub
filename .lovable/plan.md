
# Social Media Hub Redesign -- Complete Rewrite

## Overview

Transform the Dashboard from its current "welcome card + activity feed" layout into an Instagram/TikTok-style **Social Media Hub** that serves as the teacher's single navigation surface. Based on the uploaded screenshots of the previous app, the design preserves the colorful module card approach, the children scroller, and the toggle-based sidebar configuration.

---

## What the Screenshots Show (Reference)

The uploaded images reveal the previous app had:
- **Screenshot 1 (Home)**: A vertical stack of colorful rounded module cards (Prezenta in yellow, Imagini in green, Documente in blue, etc.) with icons, titles, subtitles, and item count badges. A horizontal children scroller sits above them.
- **Screenshot 2 (Sidebar)**: A clean white drawer with toggle switches next to each module name. Toggles control which cards appear on the home page. Below the toggles are standard nav links (Istoric prezenta, Statistici, Profilul meu, Adauga copii).
- **Screenshot 3 (Child Card)**: Vertical cards with rounded avatar circles, child name in bold, parent contact info below in small light text.
- **Screenshot 4 (Inky)**: The floating owl FAB in the bottom-right corner with a quick-action tooltip menu.

---

## Files to Create

### 1. `src/components/dashboard/ChildrenScroller.tsx` (new)

Horizontal scroll area showing children from the current group.

- Uses `getChildrenByGroup(currentGroup.id)` to fetch children
- Each child renders as a vertical card (~100px wide):
  - Pastel-colored circle avatar generated from initials
  - Child's name (bold, truncated)
  - Parent name, phone, email in 10px light text
  - Card styling: `rounded-2xl border border-border/60 shadow-sm p-3`
- Scroll container: `overflow-x-auto snap-x snap-mandatory` with hidden scrollbar CSS
- Wraps children in a flex row with `gap-3`

### 2. `src/components/dashboard/ModuleCard.tsx` (new)

A single vibrant module card component.

Props: `icon`, `title`, `subtitle`, `color` (hex), `count`, `route`, `onTap`

Layout:
```text
+--------------------------------------------------+
| [Icon]  Title              [Count Badge]  [>]    |
|         Subtitle                                  |
+--------------------------------------------------+
```

- Card has `rounded-3xl` (24px radius), background uses the module's color at ~15% opacity, left border or accent strip in full color
- Icon circle in full color on the left
- Title in bold, subtitle in muted text
- Count badge (pill) on the right
- Chevron icon (far right)
- Tap feedback: `framer-motion` `whileTap={{ scale: 0.97 }}` + `-webkit-tap-highlight-color: transparent`
- On tap: short 150ms scale animation, then `navigate(route)`

### 3. `src/components/dashboard/ModuleHub.tsx` (new)

Renders the vertical stack of module cards, filtered by visibility.

Module definitions:

| Key | Title | Subtitle | Color | Icon | Route |
|-----|-------|----------|-------|------|-------|
| prezenta | PREZENTA | Inregistreaza prezenta | #FFC107 | ClipboardList | /prezenta |
| imagini | IMAGINI | Fotografii si activitati | #2ECC71 | Image | /documente |
| documente | DOCUMENTE | Fisiere si materiale | #3498DB | FileText | /documente |
| povesti | POVESTI / ATELIERE | Povesti interactive | #9B59B6 | BookOpen | /povesti |
| meniu | MENIU | Meniul saptamanii | #F39C12 | UtensilsCrossed | /meniu |
| mesaje | MESAJE | Conversatii cu parintii | #E91E63 | MessageSquare | /mesaje |

- Reads `visibleModules` from `localStorage` key `tid4k_visible_modules`
- Default: all modules visible
- Uses `AnimatePresence` for smooth show/hide when toggled
- Each card is wrapped in `motion.div` with `layout` prop for smooth reorder

### 4. `src/components/dashboard/ConfigSidebar.tsx` (new)

A right-side Sheet (using shadcn Sheet component) with:

**Top section -- Module toggles:**
- Each module listed with its colored icon + name + Switch toggle
- Toggling ON/OFF updates `localStorage` and re-renders the hub
- Uses the existing `Switch` component from `src/components/ui/switch.tsx`

**Bottom section -- Navigation links:**
- "Istoric prezenta" -> `/prezenta`
- "Statistici" -> `/rapoarte`  
- "Profilul meu" -> placeholder (shows toast "In curand")
- "Adauga copii" -> placeholder (shows toast "In curand")

Each link has an icon and chevron, styled as list items.

---

## Files to Modify

### 5. `src/types/index.ts` (edit)

Add parent contact fields to the `Child` interface:

```typescript
export interface Child {
  id_copil: number;
  nume_prenume_copil: string;
  grupa_clasa_copil: string;
  data_nasterii?: string;
  parinte_id?: number;
  parinte_nume?: string;
  parinte_telefon?: string;
  parinte_email?: string;
}
```

### 6. `src/api/children.ts` (edit)

Add parent contact mock data to each child entry:

```typescript
{ id_copil: 1, nume_prenume_copil: 'Alexia Ionescu', ..., parinte_nume: 'Elena Ionescu', parinte_telefon: '0721234567', parinte_email: 'elena.i@email.com' },
```

### 7. `src/pages/Dashboard.tsx` (rewrite)

Replace the entire current dashboard with:

```text
<div>
  {/* Compact welcome banner */}
  <WelcomeBanner />        // user name + group info, small gradient strip

  {/* Children scroller */}
  <ChildrenScroller />     // horizontal cards

  {/* Settings gear button (opens ConfigSidebar) */}
  <div className="flex justify-end">
    <Button variant="ghost" onClick={openSidebar}>
      <Settings icon />
    </Button>
  </div>

  {/* Module card stack */}
  <ModuleHub visibleModules={visibleModules} />

  {/* Config sidebar (Sheet) */}
  <ConfigSidebar open={sidebarOpen} onToggle={handleToggle} />
</div>
```

- The welcome banner is kept minimal: user first name, group name, and a small gradient accent (no inline attendance panel -- attendance is accessed via the PREZENTA card)
- Remove the "Activitate recenta" section entirely
- Remove the inline attendance panel

### 8. `src/index.css` (edit)

Add these utilities:

```css
/* Tappable card feedback */
.card-tappable {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

/* Hide scrollbar for children scroller */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* iOS scroll bounce prevention */
html, body {
  overscroll-behavior: none;
}
```

---

## Summary Table

| File | Action | Purpose |
|------|--------|---------|
| `src/types/index.ts` | Edit | Add parent fields to Child |
| `src/api/children.ts` | Edit | Add parent mock data |
| `src/index.css` | Edit | Add tappable + scrollbar-hide + iOS bounce CSS |
| `src/components/dashboard/ChildrenScroller.tsx` | Create | Horizontal child card scroller |
| `src/components/dashboard/ModuleCard.tsx` | Create | Single vibrant module card |
| `src/components/dashboard/ModuleHub.tsx` | Create | Filtered card stack with AnimatePresence |
| `src/components/dashboard/ConfigSidebar.tsx` | Create | Toggle sidebar (Sheet) with nav links |
| `src/pages/Dashboard.tsx` | Rewrite | New hub layout replacing old dashboard |

No changes to `AppLayout.tsx`, `InkyAssistant.tsx`, or any other page -- this is a Dashboard-only redesign.

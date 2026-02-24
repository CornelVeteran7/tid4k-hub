
# Tutorial Overlay for Teachers

## What We're Building

A step-by-step guided tutorial that highlights each part of the app with clear Romanian explanations. It appears automatically the first time a teacher logs in, walks them through every key feature, and can be re-triggered from the menu anytime.

## How It Works

### First-time experience
- When a teacher logs in for the first time, the tutorial starts automatically
- A semi-transparent dark overlay covers the screen, with one UI element "spotlighted" (cut out from the overlay)
- A tooltip card next to the spotlight explains what that feature does, in simple Romanian
- Navigation: "Inapoi" / "Urmatorul" buttons + a step counter (e.g. "2 din 8") + "Sari peste tutorial"
- When the user finishes all steps, we save `tid4k_tutorial_done = true` in localStorage
- The tutorial never auto-shows again after completion

### Re-triggering
- A new "Tutorial" button in the burger menu (mobile) and desktop sidebar lets users replay it anytime
- This dispatches a custom event that the tutorial component listens to

### Tutorial Steps (all in Romanian)

```text
Step 1: Welcome card (glass card)
  "Aici vezi un sumar rapid al zilei: prezenta, fotografii, documente si mesaje. Apasa pe orice buton pentru a deschide modulul."

Step 2: Children scroller
  "Aici sunt copiii din grupa ta. Apasa pe un copil pentru a vedea prezenta, costul hranei si pentru a trimite un mesaj parintilor."

Step 3: Module cards area
  "Acestea sunt modulele tale de lucru. Apasa pe oricare card pentru a deschide functia respectiva."

Step 4: Configurare button
  "De aici poti alege ce module sa fie vizibile pe ecranul tau."

Step 5: Group selector (header)
  "Selecteaza grupa cu care lucrezi. Toate datele se schimba automat."

Step 6: Notifications bell
  "Aici primesti notificari pentru mesaje noi si anunturi importante."

Step 7: Burger menu (mobile) / Sidebar (desktop)
  "Din meniu accesezi Orar, Anunturi si setarile de administrare."

Step 8: Announcements ticker (bottom)
  "Aici apar anunturile importante care ruleaza automat."
```

## Technical Plan

### 1. Create `src/components/TutorialOverlay.tsx`

This is the main component. It renders:
- A full-screen fixed overlay (`z-50`, `position: fixed`, dark semi-transparent background)
- A "spotlight" cutout using CSS `clip-path` or a transparent box-shadow trick to reveal the target element
- A tooltip card positioned near the spotlight with the step description
- Navigation buttons at the bottom of the tooltip

**How spotlighting works:**
- Each step has a CSS selector or `data-tutorial` attribute target
- On each step, we query the DOM for the target element, get its `getBoundingClientRect()`, and position the spotlight + tooltip accordingly
- Uses `framer-motion` for smooth transitions between steps

**State management:**
- `currentStep` (number) tracks which step we're on
- `isActive` (boolean) controls visibility
- Reads/writes `localStorage` key `tid4k_tutorial_done`
- Listens for `restart-tutorial` custom event

### 2. Add `data-tutorial="step-name"` attributes to target elements

Minimal changes to existing components:
- `Dashboard.tsx`: Add `data-tutorial="welcome-card"` to the glass card div, `data-tutorial="children-scroller"` to the ChildrenScroller wrapper, `data-tutorial="module-hub"` to the module cards area, `data-tutorial="config-button"` to the Configurare button
- `AppLayout.tsx`: Add `data-tutorial="group-selector"` to the group selector, `data-tutorial="notifications"` to the bell button, `data-tutorial="menu-button"` to the burger/sidebar, `data-tutorial="announcements"` to the ticker area (via AnnouncementsTicker)
- `AnnouncementsTicker.tsx`: Add `data-tutorial="announcements"` to the root element

### 3. Mount TutorialOverlay in `AppLayout.tsx`

- Import and render `<TutorialOverlay />` at the end of the layout, so it sits above everything
- It self-manages its visibility based on localStorage

### 4. Add "Tutorial" button to navigation

- In `AppLayout.tsx`, add a "Tutorial" button (with a `GraduationCap` or `HelpCircle` icon) in both the desktop sidebar and mobile sheet menu
- On click, dispatch `restart-tutorial` event and close the menu

### 5. Responsive behavior

- On mobile, the tooltip card appears below or above the spotlight (whichever has more space)
- On desktop, it appears to the side when possible
- The spotlight recalculates position on window resize

## Files Changed

| File | Change |
|---|---|
| `src/components/TutorialOverlay.tsx` | **New** - Main tutorial component with overlay, spotlight, tooltip, and step logic |
| `src/pages/Dashboard.tsx` | Add 4 `data-tutorial` attributes to existing elements |
| `src/components/layout/AppLayout.tsx` | Add 3 `data-tutorial` attributes + mount TutorialOverlay + add "Tutorial" menu item |
| `src/components/dashboard/AnnouncementsTicker.tsx` | Add 1 `data-tutorial` attribute |
| `src/components/dashboard/ChildrenScroller.tsx` | Add 1 `data-tutorial` attribute |

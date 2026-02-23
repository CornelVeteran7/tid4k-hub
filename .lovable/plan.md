
# Inky Floating Assistant Button + Stories Character Selection

## Part 1: Inky Floating Button (Global Smart Quick Actions)

### What it does
A floating button in the bottom-right corner of every page showing the Inky owl image. When tapped, it opens a popover/sheet with context-aware quick actions that change based on:
- Which page the user is currently on
- What role the user has (teacher, parent, director, admin)

### Implementation

**1. Copy the Inky image asset**
- Copy `user-uploads://inky_pentru_buton_smart.png` to `src/assets/inky-button.png`

**2. Create `src/components/InkyAssistant.tsx`**
- A floating button fixed at `bottom-6 right-6` (accounting for safe-area-inset-bottom)
- Uses the Inky owl image (round, with subtle shadow and a gentle bounce/pulse animation)
- On click, opens a popover or bottom sheet with a list of smart action buttons
- Actions are determined by `useLocation()` (current route) and `useAuth()` (user role)

**3. Context-aware actions per page and role:**

| Page | Teacher Actions | Parent Actions |
|------|----------------|----------------|
| `/` (Dashboard) | "Inregistreaza prezenta", "Trimite mesaj", "Incarca document" | "Vezi mesaje", "Vezi anunturi" |
| `/prezenta` | "Selecteaza toti copiii", "Salveaza prezenta", "Vezi statistici" | -- |
| `/mesaje` | "Mesaj nou", "Mesaj catre toti parintii" | "Mesaj nou catre profesor" |
| `/povesti` | "Adauga poveste noua", "Citeste o poveste aleatoare" | "Citeste o poveste aleatoare" |
| `/meniu` | "Vezi meniul de saptamana aceasta" | "Vezi meniul de saptamana aceasta" |
| `/documente` | "Incarca document", "Cauta document" | "Cauta document" |
| `/anunturi` | "Creeaza anunt nou" | "Marcheaza toate ca citite" |
| Other pages | Contextual fallback actions | Contextual fallback actions |

**4. Integration in `AppLayout.tsx`**
- Add `<InkyAssistant />` inside the main content area, after `{children}`, as a fixed-position element
- Remove the "Actiuni rapide" card from `Dashboard.tsx` (lines 213-229)

### Visual Design
- Round button (64x64px) with the Inky owl image, white background, shadow-lg
- Subtle scale animation on hover
- When open: a card/sheet appears above the button with the action list
- Each action has an icon + label, styled consistently with the app theme

---

## Part 2: Stories Character Selection

### What it does
Add 5 storyteller characters to the Stories page. When reading/listening to a story, the user picks which character "tells" the story, each with a distinct personality and TTS voice.

### Characters
1. **Inky** - Owl (wise, calm) 
2. **Vixie** - Fox (playful, energetic)
3. **Nuko** - Hedgehog (gentle, warm)
4. **Eli** - Butterfly (dreamy, soft)
5. **Poki** - Fish (bubbly, funny)

### Implementation

**1. Create `src/data/storyCharacters.ts`**
- Export an array of character objects with: `id`, `name`, `animal`, `description`, `color` (theme color for each), and `voiceDescription` (text describing the voice style for future TTS integration)
- No actual TTS integration yet (mock only), but the structure is ready for when voice IDs are assigned

**2. Update `src/pages/Stories.tsx`**
- Add a character selector in the story reader view (below the title, above the audio player)
- Show 5 small circular character avatars (using colored initials or emoji icons since we don't have character images yet: owl emoji, fox emoji, hedgehog emoji, butterfly emoji, fish emoji)
- Selected character is highlighted with a colored ring
- The character name appears below: "Povestita de Inky"
- Store selected character in state; pass to TTS call when implemented

**3. Update the `Story` type** (optional)
- No type changes needed; character selection is a UI-only feature for now

---

## Technical Summary

| File | Action |
|------|--------|
| `src/assets/inky-button.png` | New - copy uploaded Inky image |
| `src/components/InkyAssistant.tsx` | New - floating button + smart actions popover |
| `src/components/layout/AppLayout.tsx` | Edit - add `<InkyAssistant />` |
| `src/pages/Dashboard.tsx` | Edit - remove "Actiuni rapide" card (lines 213-229) |
| `src/data/storyCharacters.ts` | New - character definitions |
| `src/pages/Stories.tsx` | Edit - add character selector in reader view |



# Fix Header, Inky Button & General Mobile Alignment

## Issues Found

1. **Header cramped on mobile**: The group selector, notification bell, and favicon logo are competing for space in the header bar, causing the right side to get cut off on narrow screens (390px).
2. **Inky button image too small**: The owl image is `h-12 w-12` inside a `h-16 w-16` circle -- too much white border around it. The image should fill more of the button.
3. **Inky button position**: Currently placed inside `<main>` (line 232 of AppLayout), which means it scrolls with page content. It should be outside `<main>`, directly in the flex container, so it stays truly fixed on screen regardless of scroll position.

## Changes

### 1. Fix header layout (AppLayout.tsx)

- Reduce the favicon logo from `h-8 w-8` to `h-7 w-7`
- Reduce the group selector width from `w-[200px]` to `w-[160px]`
- These small adjustments prevent the right-side elements from being cut off on 390px screens

### 2. Make Inky image larger (InkyAssistant.tsx)

- Change the Inky image from `h-12 w-12` to `h-14 w-14` (or even removing the border and making the image fill edge-to-edge)
- This keeps the `h-16 w-16` circle but fills it more with the owl character

### 3. Move Inky outside main scroll area (AppLayout.tsx)

- Move `<InkyAssistant />` from inside `<main>` (where it scrolls) to after `<main>`, still inside the flex column container
- This ensures the fixed-position button is always visible and not affected by scroll context

### Technical Details

| File | Change |
|------|--------|
| `src/components/layout/AppLayout.tsx` | Move `<InkyAssistant />` outside `<main>`, shrink group selector width, shrink favicon size |
| `src/components/InkyAssistant.tsx` | Increase owl image from `h-12 w-12` to `h-14 w-14`, reduce border to `border` (from `border-2`) |




# Header Layout Adjustments

Rearrange the top header bar in `src/components/layout/AppLayout.tsx` (lines 154-177):

**Current layout:** `[Hamburger] [Logo (left-aligned, flex-1)] [Group selector (right)]`

**New layout:** `[Hamburger] [spacer] [Group selector (centered)] [Logo (right-aligned, bigger)]`

### Changes (single file: `AppLayout.tsx`)

1. **Restructure header to 3 sections** using a flex layout with `justify-between`:
   - Left: hamburger menu button (mobile only) + empty spacer
   - Center: group selector (centered with `mx-auto` or absolute centering)
   - Right: InfoDisplay logo as a home link

2. **Make logo bigger**: increase from `h-7` to `h-9`

3. **Center the group selector**: position it in the middle of the header using flex centering (absolute center technique so it stays centered regardless of left/right content width)

### Technical approach

The header will use a 3-column grid or flex with absolute centering:
- Left column: hamburger button
- Center column (absolute): group selector
- Right column: logo link (slightly larger at `h-9`)


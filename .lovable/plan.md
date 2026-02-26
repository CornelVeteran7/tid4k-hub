
# Fix Background SVG: Generate Topographic Contour Lines

## Problem
The current `organic-bg-v1.svg` file is not a vector SVG -- it's a massive raster image embedded inside SVG markup (with c2pa metadata). This means the CSS mask approach produces nothing visible. The background is completely broken.

## Solution
Replace the broken external SVG mask approach with an **inline SVG component** that generates topographic contour lines procedurally. This guarantees it works, looks correct, and is lightweight.

## What Changes

### 1. Replace `BackgroundShapes` in `src/pages/Dashboard.tsx`
- Remove the current CSS-mask-based approach entirely (the two `div` layers referencing `/images/organic-bg-v1.svg`)
- Replace with a new `BackgroundShapes` component that renders an inline `<svg>` element containing ~15-20 hand-crafted organic flowing contour paths
- SVG specs:
  - `viewBox="0 0 1440 1024"`, `preserveAspectRatio="xMidYMid slice"` for edge-to-edge coverage
  - Stroke color: `#0B3F56` (deep teal blue, close to the app's primary)
  - Stroke width: 1.2, round caps, round joins
  - No fill, no gradients -- clean line art only
  - Opacity ~8-10% for subtle background effect
- Container: `position: fixed`, `inset: 0`, `-z-10`, `pointer-events-none` so it stays visible during scroll and extends edge to edge

### 2. Clean up unused SVG files (optional)
The files `public/images/organic-bg-v1.svg` and `public/images/organic-bg.svg` are no longer needed but can be left in place since removing them has no impact.

### 3. Remove related CSS
Clean up any `animate-slow-rotate` references if still present in `index.css` that were previously used for the background rotation (which was already removed).

## Technical Details
- The inline SVG will contain approximately 15-20 `<path>` elements with smooth cubic bezier curves (`C` commands) forming irregular, organic contour shapes at different vertical positions
- Each path flows horizontally across the full width with gentle undulations
- The container uses `position: fixed` instead of `absolute` so it persists during scroll without needing oversized dimensions
- No external file dependencies -- everything is self-contained in the component

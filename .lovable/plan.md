

# Plan: Replace MESAJE Button with Dynamic Current Meal Display

## What Changes

Replace the 4th quick-stat button ("MESAJE") in the welcome card with a live meal indicator that automatically shows what's being served right now, based on the current day and time of day.

## How It Works

**Time-based meal detection logic:**
- Before 09:00 and until 09:00 -- shows "Mic dejun" (breakfast)
- 09:01 - 10:30 -- shows "Gustare 1" (morning snack)
- 10:31 - 13:00 -- shows "Pranz" (lunch)
- 13:01 onwards -- shows "Gustare 2" (afternoon snack)
- Weekends -- shows "Weekend" with a rest emoji

**Day mapping:** Uses the current day of the week (Mon-Fri) mapped to Romanian day names (Luni, Marti, etc.) to find the correct menu item from the weekly menu data.

**Data source:** Fetches the menu for the current ISO week using the existing `getMenu()` API function, which already returns structured `MenuItem[]` with meal type (`masa`), day (`zi`), and content (`continut`) with emojis.

## Files Modified

### 1. `src/pages/Dashboard.tsx`
- Remove the `MessageSquare` import (no longer needed for quick stats)
- Add `Utensils` to the quick-stat icon set (already imported)
- Replace the 4th item in `QUICK_STATS_BASE` from `mesaje` to `meniu`
- Create a new helper hook `useCurrentMeal()` that:
  - Calls `getMenu()` with the current ISO week string
  - Determines current day (Romanian name) and current meal slot based on hour
  - Returns `{ mealLabel, mealContent, mealEmoji }` (e.g., "Pranz", "Supa de legume, piept de pui cu piure", food emojis)
  - Updates every minute via `setInterval` to handle meal transitions in real-time
- Modify the quick-stats rendering so the 4th button shows the meal emoji and a truncated food description instead of a static count
- The button uses the `meniu` module color from the centralized config
- Clicking it opens the weekly menu module (dispatches `open-module` with `meniu`)

### 2. Desktop "Rezumatul zilei" section (same file)
- The existing hardcoded "Supa de legume, Pui" text on line 450 will also be updated to use the same `useCurrentMeal()` data, making it dynamic and accurate

## What Stays the Same
- The other 3 quick-stat buttons (Prezenta, Imagini, Documente) remain unchanged
- All module cards, edit mode, drag-drop, visibility toggles -- untouched
- The weekly menu page itself -- untouched
- The centralized module config system -- reused (meniu color/title already exists)

## Technical Details

- The `useCurrentMeal` hook will use `useState` + `useEffect` with the menu API, plus a 60-second interval timer to re-check the current meal slot
- ISO week string is computed with `date-fns` (already installed): `format(new Date(), "yyyy-'W'II")`
- Romanian day names are mapped from `getDay()`: `['Duminica','Luni','Marti','Miercuri','Joi','Vineri','Sambata']`
- The meal slot thresholds are configurable constants at the top of the file
- On weekends, the button shows a friendly "Weekend" label with the meniu color


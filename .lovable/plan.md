

# Per-School Filtering for Admin Panel

## What changes
A **global school selector** will be added to the Admin Panel header, so every tab automatically filters its data to the selected school. No more scrolling through menus or users from all schools -- you pick one and everything updates.

## How it will look

```text
+--------------------------------------------------+
|  Panou Administrare                               |
|  [  Gradinita Floarea Soarelui  v ]  <-- global  |
+--------------------------------------------------+
|  [Scoli] [Utilizatori] [Orar] [Meniu] [Sponsori] |
+--------------------------------------------------+
|  (content filtered to selected school)            |
+--------------------------------------------------+
```

- The selector also includes an "Toate" (All) option for a global view when needed
- On mobile, the selector is full-width below the title
- On desktop, it sits inline next to the subtitle

## Tab-by-tab impact

| Tab | Current | After |
|-----|---------|-------|
| Scoli | Shows all schools | When a specific school is selected, auto-expands its detail panel. "Toate" shows the grid |
| Utilizatori | Shows all users | Filters users to selected school. Adds a "scoala" field to user data |
| Orar | Has its own school selector | Removes its own selector, uses the global one. Only shows group picker |
| Meniu | No school filter at all | Filters menus by selected school. Adds group selector within the tab |
| Sponsori | No filtering | No change (sponsors are global, not per-school) |
| Setari | No filtering | Shows settings for the selected school when one is chosen |

## Technical details

### AdminPanel.tsx
- Add state: `selectedSchoolId` (string, default `'all'`)
- Fetch schools list at the top level via `getSchools()`
- Render a `Select` component in the header with all schools + "Toate" option
- Pass `selectedSchoolId` and `schools` as props to each tab component

### MenuTab.tsx
- Accept `schoolId` and `schools` props
- Find the current school's groups from the schools array
- Add a group selector (like ScheduleTab already has)
- Pass `schoolId` + `grupa` to `getMenu()` calls

### UsersTab.tsx
- Accept `schoolId` prop
- Filter the users list by school when `schoolId !== 'all'`
- Add "Scoala" column to the desktop table view

### ScheduleTab.tsx
- Accept `schoolId` and `schools` props
- Remove the internal school selector -- use the global one
- Only show the group picker within the tab

### SchoolsTab.tsx
- Accept `selectedSchoolId` prop
- When a specific school is selected globally, auto-open its detail panel
- When "Toate", show the normal grid

### SettingsTab.tsx
- Accept `schoolId` prop
- Show school-specific settings when a school is selected

### Types
- No type changes needed -- existing `School` type has `id_scoala` which works as the filter key


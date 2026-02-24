

# Sponsor Switching per School

## The Problem
Right now, every school dashboard shows the same sponsor (Kaufland, because it's `promos[0]`). There's no way to assign different sponsors to different schools or switch which sponsor is displayed.

## Solution
Add a **sponsor assignment system** where each school can have one or more active sponsors, and the dashboard dynamically shows the correct sponsor content based on the logged-in user's school.

## How It Works

### 1. Admin Panel -- Assign sponsors to schools
In the **Sponsors tab**, add a "Scoli target" section when viewing a sponsor. Admins can pick which schools see that sponsor's content.

In the **Schools tab**, when viewing a school's details, show a "Sponsori activi" section listing which sponsors are assigned, with the ability to add/remove.

### 2. Data model update
Add a `sponsori_activi` field to the `School` type -- an array of sponsor IDs. The `scoli_target` field already exists on `SponsorPromo` and `SponsorCampaign` (currently set to `['all']`).

### 3. Dashboard shows the right sponsor
`SponsorCard` and `AnnouncementsTicker` will filter promos by the current user's school ID, matching against `scoli_target`.

## Technical Changes

### Types (`src/types/index.ts`)
- Add `sponsori_activi: number[]` to the `School` interface

### API (`src/api/sponsors.ts`)
- Update `getActivePromos()` to accept an optional `schoolId` parameter
- Filter promos where `scoli_target` includes `'all'` OR the specific school ID

### Schools mock data (`src/api/schools.ts`)
- Add `sponsori_activi` to mock schools (e.g., School 1 gets `[1]` for Kaufland, School 2 gets `[2]` for Lidl)

### Dashboard components
- **`SponsorCard.tsx`**: Read the user's school from `AuthContext`, pass school ID to `getActivePromos('card_dashboard', schoolId)` so it returns only that school's sponsor
- **`AnnouncementsTicker.tsx`**: Same filter -- only show ticker promos matching the user's school

### Admin Panel -- SchoolsTab detail panel
- Add a "Sponsori activi" section showing assigned sponsors with brand colors/logos
- Add a dropdown to assign additional sponsors

### Admin Panel -- SponsorsTab
- When editing a sponsor or campaign, show a multi-select for target schools (replace the hardcoded `['all']`)
- Add visual indicators showing which schools each sponsor is assigned to

## User Flow

1. Admin opens `/admin` and selects "Sponsori" tab
2. Clicks on Kaufland, then edits a campaign
3. In the campaign editor, selects target schools (e.g., only "Gradinita Floarea Soarelui")
4. Saves -- now only that school's dashboard shows Kaufland content
5. Creates a Lidl campaign targeting "Scoala Nr. 5"
6. Parents at School 5 see Lidl on their dashboard, parents at Gradinita see Kaufland


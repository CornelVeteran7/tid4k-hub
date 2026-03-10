

# Stories Media Filter Layer — Plan

## What We're Building

Add a **media mode filter** to the Stories page (Kids vertical) so users can choose between three consumption modes before browsing:

1. **Citește** (Read) — text stories, current default behavior
2. **Audio** (Listen) — stories with generated audio narrated by Inky & friends, using TTS or pre-recorded audio
3. **Video** (Watch) — pre-made video stories from the database, playable inline

This appears as a top-level filter row (above the category pills), using visually distinct cards/buttons with icons representing each mode.

## Implementation

### 1. Update Story Type (`src/types/index.ts`)

Add `video_url?: string` and `media_type?: 'text' | 'audio' | 'video'` fields to the `Story` interface.

### 2. Update API (`src/api/stories.ts`)

Map `video_url` from the database response. Add the `media_type` field mapping (default to `'text'` if not set).

### 3. Refactor Stories Page (`src/pages/Stories.tsx`)

**New state**: `mediaMode: 'all' | 'read' | 'audio' | 'video'` (default `'all'`).

**New UI section** — three illustrated mode cards above the category pills:

| Mode | Icon | Label | Description |
|---|---|---|---|
| Citește | BookOpen | Citește | Descoperă povești scrise |
| Ascultă | Volume2 / Headphones | Ascultă | Inky și prietenii povestesc |
| Privește | Play / Video | Video | Povești animate din colecția noastră |

Each card shows Inky's emoji (🦉) plus a mode-specific icon. Selected card gets primary ring + scale effect.

**Filtering logic**:
- `read` mode: shows stories that are text-based (no video_url), opens to reader view
- `audio` mode: shows stories with audio_url or TTS-capable, opens to reader with auto-play audio and character selector prominent
- `video` mode: shows stories with video_url, clicking opens an inline video player instead of the text reader

**Video player**: When a video story is selected, render a `<video>` element with controls, poster thumbnail, and a character avatar overlay showing which character narrates.

**Grid card updates**: Each story card gets a small media-type badge icon (book/headphone/play) in the corner so users can see the type at a glance.

### 4. Demo Data

Add 2-3 demo video stories with placeholder video_url values and thumbnails to ensure the video tab isn't empty in demo mode. These can be static entries returned when `isDemo` is true, supplementing whatever comes from Supabase.

### Files Changed

| File | Change |
|---|---|
| `src/types/index.ts` | Add `video_url`, `media_type` to Story |
| `src/api/stories.ts` | Map new fields |
| `src/pages/Stories.tsx` | Add media mode filter, video player view, demo stories |


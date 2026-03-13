

# Character Voice Configuration in Admin Panel

## Current State

- **5 characters** are hardcoded in `src/data/storyCharacters.ts` (Inky, Vixie, Nuko, Eli, Poki) with basic display data
- **Voice mappings** are hardcoded in the `elevenlabs-tts` edge function (voice IDs + settings per character)
- **No database table** for characters exists -- no `characters` table in Supabase
- Changes to voice settings require code deployments, not admin UI updates

## Goal

Create a centralized character management system where admin updates voice settings and character profiles, which are stored in Supabase and consumed by all client organizations in real-time.

## Plan

### Phase 1: Database Table + Migration

Create a `story_characters` table (global, not org-scoped):

| Column | Type | Notes |
|---|---|---|
| id | text PK | `inky`, `vixie`, etc. |
| name | text | Display name |
| animal | text | Species |
| emoji | text | |
| description | text | Short personality |
| color | text | Tailwind ring class |
| bg_color | text | Tailwind bg class |
| voice_description | text | |
| voice_id | text | ElevenLabs voice ID |
| voice_provider | text | `elevenlabs` |
| voice_settings | jsonb | `{stability, similarity_boost, style, speed}` |
| role_title | text | |
| gender | text | |
| vibe_style | text | |
| focus_areas | text[] | |
| motto | text | |
| greeting | text | |
| backstory | text | |
| bio | text | |
| micro_intro | text | |
| team_role | text | |
| sort_order | int | |
| updated_at | timestamptz | |

RLS: SELECT for all authenticated users, INSERT/UPDATE/DELETE for `inky` role only.

Seed with the 5 existing characters + current voice settings from the edge function.

### Phase 2: Admin Tab -- "Personaje" in AdminPanel

New component `src/components/admin/CharactersTab.tsx`:

- **Character cards** showing emoji, name, animal, personality
- Click to expand/edit: voice settings sliders (stability, similarity_boost, style, speed), voice ID input, all extended profile fields (motto, greeting, backstory, bio, etc.)
- **Voice preview button** -- calls `elevenlabs-tts` edge function with a sample text to test the voice
- **Drag-and-drop reorder** via sort_order
- Saves to `story_characters` table

Add a new tab `{ value: 'personaje', label: 'Personaje', icon: Users }` to AdminPanel's TABS array, visible for `kids` vertical.

### Phase 3: Update Edge Function to Read from DB

Modify `supabase/functions/elevenlabs-tts/index.ts`:
- Instead of hardcoded maps, fetch character voice config from `story_characters` table using service role key
- Cache the config in-memory for the function invocation
- Fallback to hardcoded defaults if DB query fails

### Phase 4: Update Client-Side to Read from DB

- Replace `src/data/storyCharacters.ts` static export with a hook `useStoryCharacters()` that fetches from `story_characters` table
- Update `src/pages/Stories.tsx` to use the hook instead of the static import
- This means when admin updates a character, all clients see the change on next load

### Files Summary

| File | Action |
|---|---|
| Migration SQL | CREATE `story_characters` + seed data + RLS |
| `src/components/admin/CharactersTab.tsx` | NEW: Full character editor with voice sliders and preview |
| `src/pages/AdminPanel.tsx` | Add "Personaje" tab |
| `supabase/functions/elevenlabs-tts/index.ts` | Read voice config from DB instead of hardcoded |
| `src/pages/Stories.tsx` | Fetch characters from DB instead of static import |
| `src/data/storyCharacters.ts` | Keep as fallback/type definition |


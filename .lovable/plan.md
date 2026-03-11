

# Polls Feature — Integrated into Messages Module

## Overview
Add a **Polls** system inside the Messages page, toggled via tabs (Mesaje | Sondaje). Polls are created by admins, voted on by all users, and generate notifications. The feature is toggleable per vertical via `feature_toggles` (`polls` key), enabled by default for all verticals.

## Database Schema (3 new tables)

### `polls`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| organization_id | uuid FK → organizations | RLS partitioning |
| title | text NOT NULL | Poll question |
| description | text | Optional context |
| poll_type | text NOT NULL | `single`, `multiple`, `free_text` |
| results_visibility | text NOT NULL | `always`, `after_vote`, `after_close` |
| deadline | timestamptz NOT NULL | Always required |
| created_by | uuid FK → profiles | Admin who created |
| is_closed | boolean DEFAULT false | Manual close option |
| created_at | timestamptz DEFAULT now() | |

### `poll_options`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| poll_id | uuid FK → polls ON DELETE CASCADE | |
| label | text NOT NULL | Option text |
| position | int DEFAULT 0 | Display order |

### `poll_votes`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| poll_id | uuid FK → polls ON DELETE CASCADE | |
| option_id | uuid FK → poll_options (nullable) | NULL for free_text votes |
| user_id | uuid FK → profiles | |
| free_text | text | Only for free_text type |
| created_at | timestamptz DEFAULT now() | |
| UNIQUE(poll_id, option_id, user_id) | | Prevent duplicate votes per option |

### RLS Policies
- SELECT: `user_org_match(organization_id)` on all 3 tables
- INSERT on `polls`: only admin/director/inky roles
- INSERT on `poll_votes`: authenticated users in same org, poll not closed, deadline not passed
- UPDATE/DELETE on `polls`: only creator or admin

## API Layer — `src/api/polls.ts`
Functions:
- `getPolls(orgId)` — list active + recent closed polls
- `getPollById(pollId)` — full poll with options and vote counts
- `createPoll(data)` — admin creates poll with options
- `votePoll(pollId, optionIds, freeText?)` — cast vote(s)
- `closePoll(pollId)` — manually close
- `getUserVote(pollId, userId)` — check if already voted
- `getPollResults(pollId)` — vote counts per option

## Types — additions to `src/types/index.ts`
```typescript
export interface Poll {
  id: string;
  title: string;
  description?: string;
  poll_type: 'single' | 'multiple' | 'free_text';
  results_visibility: 'always' | 'after_vote' | 'after_close';
  deadline: string;
  created_by: string;
  creator_name?: string;
  is_closed: boolean;
  created_at: string;
  options: PollOption[];
  total_votes: number;
  user_voted: boolean;
}

export interface PollOption {
  id: string;
  label: string;
  position: number;
  vote_count: number;
}

export interface PollVote {
  id: string;
  poll_id: string;
  option_id?: string;
  free_text?: string;
  user_id: string;
}
```

## UI Changes

### Messages Page (`src/pages/Messages.tsx`)
- Add **Tabs** at the top: `Mesaje` | `Sondaje` (using existing shadcn Tabs)
- Tab visibility controlled by `feature_toggles`: if only `mesaje` enabled → no tabs, just messages. If only `polls` → no tabs, just polls. If both → tabs shown.
- The Mesaje tab contains the existing chat UI unchanged
- The Sondaje tab shows a poll list + create button (for admins)

### Poll List View (new component `src/components/polls/PollList.tsx`)
- Cards showing: title, type badge, deadline countdown, vote count, status (active/closed/expired)
- Admin sees a "+" FAB to create new poll
- Clicking a poll opens `PollDetail`

### Poll Detail (new component `src/components/polls/PollDetail.tsx`)
- Shows question, options with radio/checkbox/textarea depending on type
- Submit vote button
- Results bar chart (shown based on `results_visibility` setting)
- Deadline display with countdown

### Poll Creator Dialog (new component `src/components/polls/PollCreator.tsx`)
- Form: title, description, type selector, options list (add/remove), deadline picker, results visibility toggle
- Validation with zod

### Demo Data (`src/data/demoMessages.ts`)
- Add `getDemoPolls(vertical)` returning 2-3 sample polls per vertical with contextual questions

## Notifications
- Add `'poll'` to `NotificationItem.type` union
- Add `'vote'` to the icon union
- In `NotificationContext.tsx`: fetch recent polls, generate notification items for new unvoted polls
- Poll notifications link to `/mesaje` (which will auto-switch to Sondaje tab)

## Feature Toggle Integration
- Add `'polls'` to all vertical `defaultModules` arrays in `verticalConfig.ts`
- Add `'sondaje'` as a feature toggle key in `useFeatureToggles`
- The Messages page checks both `mesaje` and `sondaje` toggles to determine tab visibility

## Module Config Update
- Update `moduleLabels.mesaje` subtitle to mention polls where both are enabled (e.g., "Mesaje și sondaje")

## Files to Create
1. `src/api/polls.ts`
2. `src/components/polls/PollList.tsx`
3. `src/components/polls/PollDetail.tsx`
4. `src/components/polls/PollCreator.tsx`
5. `src/data/demoPolls.ts`

## Files to Modify
1. `src/types/index.ts` — add Poll types
2. `src/pages/Messages.tsx` — add tabs, integrate polls
3. `src/contexts/NotificationContext.tsx` — add poll notifications
4. `src/config/verticalConfig.ts` — add `sondaje` to all defaultModules
5. `src/config/moduleConfig.tsx` — update mesaje subtitle
6. Migration SQL for 3 tables + RLS policies


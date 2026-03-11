

# Plan: Messaging System Overhaul — Mobile Fix, Polls, Guest Inbox, Role-Based Access

## Overview

Five workstreams: (1) fix mobile UI cutoffs, (2) make polls fully functional with history, (3) add guest message inbox, (4) enforce role-based messaging rules, (5) add group broadcast channel.

---

## 1. Mobile UI Fixes (`Messages.tsx`)

The main container uses `h-[calc(100vh-200px)]` which causes cutoff on mobile (390px viewport). Fixes:
- Change to `h-[calc(100vh-160px)]` or use `flex-1 min-h-0` pattern
- Ensure the input bar stays above the keyboard (add `pb-safe` / adjust bottom padding)
- Fix tabs overflow on narrow screens — make `TabsList` scrollable or full-width
- Message bubbles `max-w-[75%]` is fine, but check avatar + text doesn't overflow

## 2. Polls — Full Functionality + History

Current polls work for voting but need:
- **Active/Closed filter tabs** in `PollList`: "Active" (default) | "Istoric" — separate active polls from expired/closed ones
- **Duplicate vote prevention** at DB level — add `UNIQUE(poll_id, user_id)` constraint on `poll_votes` (or at least check before insert)
- **Poll refresh after voting** — `onVoted` callback already calls `loadPolls`, verify it re-fetches fresh data including updated vote counts
- **Creator name display** — join `profiles` table in `getPolls()` to get `created_by` name

### DB Migration
```sql
-- Prevent duplicate votes per user per poll
CREATE UNIQUE INDEX IF NOT EXISTS idx_poll_votes_user_poll 
ON public.poll_votes(poll_id, user_id) WHERE option_id IS NOT NULL;
```

## 3. Guest Message System (Inbox Separat)

### New DB Table: `guest_messages`
```sql
CREATE TABLE public.guest_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) NOT NULL,
  sender_name text NOT NULL,
  sender_email text NOT NULL,
  mesaj text NOT NULL,
  read boolean DEFAULT false,
  replied boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```
- RLS: anonymous INSERT (with org_id), authenticated SELECT/UPDATE for directors only
- No Supabase auth needed for guests — they fill a form with name, email, message

### UI Changes
- **Guest view** (in Messages page when `isGuest`): simple form — Nume, Email, Mesaj, Submit. No conversation list, no polls tab.
- **Director view**: new tab "Vizitatori" alongside Mesaje/Sondaje showing guest messages with read/unread status, reply button (opens email client via `mailto:`)

## 4. Role-Based Contact Restrictions

### New "Conversație nouă" button + contact picker dialog:
- **Teachers**: Show contacts from:
  - Other staff in same org (teachers, directors, secretaries)
  - Parents whose children are in teacher's assigned groups
  - "Anunț de grup" option for broadcast
- **Directors**: Show all profiles in organization
- **Parents**: Show only teacher(s) assigned to their children's group(s)

### API: `getAvailableContacts(userId, role, groupIds, orgId)`
New function in `src/api/messages.ts` that queries `profiles` filtered by role rules:
- For teachers: staff profiles + parent profiles linked to their groups via `children` table
- For directors: all org profiles
- For parents: teacher profiles linked to their children's groups

### UI: Contact picker dialog
- Search input + filtered list of available contacts
- Click to start conversation (find or create)

## 5. Group Broadcast (Canal read-only)

### DB Changes
Add columns to `conversations`:
```sql
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS is_group boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES public.groups(id),
ADD COLUMN IF NOT EXISTS group_name text;
```

For group broadcasts, `participant_1` = teacher (sender), `participant_2` = NULL (or teacher ID again). Messages go to this special conversation. Parents see it as read-only.

### New DB table for group conversation members:
```sql
CREATE TABLE public.conversation_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(conversation_id, user_id)
);
```
- RLS: members can SELECT their conversations; only teachers/directors can INSERT group conversations

### UI
- Group conversations appear in conversation list with a "Grup" badge and group name
- Parents see messages but input bar is hidden (read-only)
- Teachers see a "Mesaj de grup" button that sends to the group conversation

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/migrations/new.sql` | DB migration: guest_messages, conversation_members, poll_votes unique, conversations columns |
| `src/pages/Messages.tsx` | Mobile fixes, guest form, director guest inbox tab, contact picker, group chat UI |
| `src/api/messages.ts` | `getAvailableContacts()`, `sendGuestMessage()`, `getGuestMessages()`, group message support |
| `src/components/polls/PollList.tsx` | Active/Istoric filter tabs |
| `src/api/polls.ts` | Join creator name |
| New: `src/components/messages/ContactPicker.tsx` | Contact selection dialog |
| New: `src/components/messages/GuestMessageForm.tsx` | Guest name+email+message form |
| New: `src/components/messages/GuestInbox.tsx` | Director view of guest messages |

## Implementation Order
1. DB migration (all schema changes)
2. Mobile UI fixes in Messages.tsx
3. Poll history filter + duplicate vote prevention
4. Contact picker with role-based filtering
5. Group broadcast conversations
6. Guest message form + director inbox


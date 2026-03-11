
-- 1. Guest messages table
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

ALTER TABLE public.guest_messages ENABLE ROW LEVEL SECURITY;

-- Anonymous users can insert guest messages
CREATE POLICY "Anyone can send guest messages"
  ON public.guest_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Directors can read guest messages for their org
CREATE POLICY "Directors can read guest messages"
  ON public.guest_messages FOR SELECT
  TO authenticated
  USING (
    organization_id = public.get_user_org_id(auth.uid())
    AND (public.has_role(auth.uid(), 'director') OR public.has_role(auth.uid(), 'inky'))
  );

-- Directors can update (mark as read/replied)
CREATE POLICY "Directors can update guest messages"
  ON public.guest_messages FOR UPDATE
  TO authenticated
  USING (
    organization_id = public.get_user_org_id(auth.uid())
    AND (public.has_role(auth.uid(), 'director') OR public.has_role(auth.uid(), 'inky'))
  )
  WITH CHECK (
    organization_id = public.get_user_org_id(auth.uid())
    AND (public.has_role(auth.uid(), 'director') OR public.has_role(auth.uid(), 'inky'))
  );

-- 2. Add group conversation columns to conversations
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS is_group boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES public.groups(id),
  ADD COLUMN IF NOT EXISTS group_name text;

-- 3. Conversation members for group chats
CREATE TABLE public.conversation_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

-- Members can see their own memberships
CREATE POLICY "Members can see their memberships"
  ON public.conversation_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Staff can insert members (for group creation)
CREATE POLICY "Staff can add members"
  ON public.conversation_members FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'profesor') 
    OR public.has_role(auth.uid(), 'director')
    OR public.has_role(auth.uid(), 'inky')
  );

-- 4. Prevent duplicate votes per user per poll (allow multiple option selections but not re-voting)
CREATE UNIQUE INDEX IF NOT EXISTS idx_poll_votes_user_poll_option
  ON public.poll_votes(poll_id, user_id, option_id);

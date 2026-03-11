
-- Polls tables
CREATE TABLE IF NOT EXISTS public.polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) NOT NULL,
  title text NOT NULL,
  description text,
  poll_type text NOT NULL DEFAULT 'single',
  results_visibility text NOT NULL DEFAULT 'after_vote',
  deadline timestamptz NOT NULL,
  created_by uuid REFERENCES public.profiles(id) NOT NULL,
  is_closed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.poll_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  label text NOT NULL,
  position int NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  option_id uuid REFERENCES public.poll_options(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  free_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(poll_id, option_id, user_id)
);

-- RLS
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- SELECT policies
CREATE POLICY "Users can view polls in their org"
  ON public.polls FOR SELECT TO authenticated
  USING (public.user_org_match(organization_id));

CREATE POLICY "Users can view poll options in their org"
  ON public.poll_options FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.polls p WHERE p.id = poll_id AND public.user_org_match(p.organization_id)
  ));

CREATE POLICY "Users can view poll votes in their org"
  ON public.poll_votes FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.polls p WHERE p.id = poll_id AND public.user_org_match(p.organization_id)
  ));

-- INSERT polls: only administrator/director/inky
CREATE POLICY "Admins can create polls"
  ON public.polls FOR INSERT TO authenticated
  WITH CHECK (
    public.user_org_match(organization_id) AND (
      public.has_role(auth.uid(), 'administrator') OR
      public.has_role(auth.uid(), 'inky')
    )
  );

-- INSERT poll_options: only via poll creator
CREATE POLICY "Admins can add poll options"
  ON public.poll_options FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.polls p
    WHERE p.id = poll_id AND p.created_by = auth.uid()
  ));

-- INSERT votes: authenticated users, poll not closed, deadline not passed
CREATE POLICY "Users can vote on active polls"
  ON public.poll_votes FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.polls p
      WHERE p.id = poll_id
        AND public.user_org_match(p.organization_id)
        AND p.is_closed = false
        AND p.deadline > now()
    )
  );

-- UPDATE/DELETE polls: creator or administrator
CREATE POLICY "Admins can update polls"
  ON public.polls FOR UPDATE TO authenticated
  USING (
    public.user_org_match(organization_id) AND (
      created_by = auth.uid() OR
      public.has_role(auth.uid(), 'administrator') OR
      public.has_role(auth.uid(), 'inky')
    )
  );

CREATE POLICY "Admins can delete polls"
  ON public.polls FOR DELETE TO authenticated
  USING (
    public.user_org_match(organization_id) AND (
      created_by = auth.uid() OR
      public.has_role(auth.uid(), 'administrator') OR
      public.has_role(auth.uid(), 'inky')
    )
  );

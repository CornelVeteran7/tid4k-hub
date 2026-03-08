
-- FIX CRITICAL: Restrict profiles SELECT - hide email/phone from non-staff
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;

-- Users can read their own profile fully
CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- Staff can read all profiles (needed for messaging, attendance, etc.)
CREATE POLICY "Staff read all profiles"
  ON public.profiles FOR SELECT
  USING (
    has_role(auth.uid(), 'profesor') OR
    has_role(auth.uid(), 'director') OR
    has_role(auth.uid(), 'administrator') OR
    has_role(auth.uid(), 'secretara') OR
    has_role(auth.uid(), 'inky')
  );

-- FIX CRITICAL: Restrict children SELECT - parents see only their children
DROP POLICY IF EXISTS "Authenticated can read children" ON public.children;

CREATE POLICY "Parents read own children"
  ON public.children FOR SELECT
  USING (parinte_id = auth.uid());

CREATE POLICY "Staff read all children"
  ON public.children FOR SELECT
  USING (
    has_role(auth.uid(), 'profesor') OR
    has_role(auth.uid(), 'director') OR
    has_role(auth.uid(), 'administrator') OR
    has_role(auth.uid(), 'inky')
  );

-- FIX WARN: Restrict attendance - parents see only their children's attendance
DROP POLICY IF EXISTS "Authenticated can read attendance" ON public.attendance;

CREATE POLICY "Parents read own children attendance"
  ON public.attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = attendance.child_id AND c.parinte_id = auth.uid()
    )
  );

CREATE POLICY "Staff read all attendance"
  ON public.attendance FOR SELECT
  USING (
    has_role(auth.uid(), 'profesor') OR
    has_role(auth.uid(), 'director') OR
    has_role(auth.uid(), 'administrator') OR
    has_role(auth.uid(), 'inky')
  );

-- FIX WARN: Restrict user_groups - users see only their own memberships
DROP POLICY IF EXISTS "Authenticated can read user_groups" ON public.user_groups;

CREATE POLICY "Users read own groups"
  ON public.user_groups FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Staff read all user_groups"
  ON public.user_groups FOR SELECT
  USING (
    has_role(auth.uid(), 'administrator') OR
    has_role(auth.uid(), 'inky')
  );

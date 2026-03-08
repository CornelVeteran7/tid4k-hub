
-- Profiles RLS
create policy "Anyone can read profiles" on public.profiles for select to authenticated using (true);
create policy "Users can update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "Users can insert own profile" on public.profiles for insert to authenticated with check (id = auth.uid());

-- User roles RLS
create policy "Users can read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admins can insert roles" on public.user_roles for insert to authenticated with check (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admins can update roles" on public.user_roles for update to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admins can delete roles" on public.user_roles for delete to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));

-- Schools RLS
create policy "Authenticated can read schools" on public.schools for select to authenticated using (true);
create policy "Admins can insert schools" on public.schools for insert to authenticated with check (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admins can update schools" on public.schools for update to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admins can delete schools" on public.schools for delete to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));

-- Groups RLS
create policy "Authenticated can read groups" on public.groups for select to authenticated using (true);
create policy "Admins can insert groups" on public.groups for insert to authenticated with check (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admins can update groups" on public.groups for update to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admins can delete groups" on public.groups for delete to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));

-- User groups RLS
create policy "Authenticated can read user_groups" on public.user_groups for select to authenticated using (true);
create policy "Admins can insert user_groups" on public.user_groups for insert to authenticated with check (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admins can update user_groups" on public.user_groups for update to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admins can delete user_groups" on public.user_groups for delete to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));

-- Children RLS
create policy "Authenticated can read children" on public.children for select to authenticated using (true);
create policy "Staff can insert children" on public.children for insert to authenticated with check (public.has_role(auth.uid(), 'profesor') or public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Staff can update children" on public.children for update to authenticated using (public.has_role(auth.uid(), 'profesor') or public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Staff can delete children" on public.children for delete to authenticated using (public.has_role(auth.uid(), 'profesor') or public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));

-- Attendance RLS
create policy "Authenticated can read attendance" on public.attendance for select to authenticated using (true);
create policy "Staff can insert attendance" on public.attendance for insert to authenticated with check (public.has_role(auth.uid(), 'profesor') or public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Staff can update attendance" on public.attendance for update to authenticated using (public.has_role(auth.uid(), 'profesor') or public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Staff can delete attendance" on public.attendance for delete to authenticated using (public.has_role(auth.uid(), 'profesor') or public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));

-- Conversations RLS
create policy "Participants can read conversations" on public.conversations for select to authenticated using (participant_1 = auth.uid() or participant_2 = auth.uid());
create policy "Authenticated can create conversations" on public.conversations for insert to authenticated with check (participant_1 = auth.uid() or participant_2 = auth.uid());
create policy "Participants can update conversations" on public.conversations for update to authenticated using (participant_1 = auth.uid() or participant_2 = auth.uid());

-- Messages RLS
create policy "Conversation participants can read messages" on public.messages for select to authenticated using (
  exists (select 1 from public.conversations c where c.id = conversation_id and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid()))
);
create policy "Authenticated can send messages" on public.messages for insert to authenticated with check (sender_id = auth.uid());
create policy "Participants can update messages" on public.messages for update to authenticated using (
  exists (select 1 from public.conversations c where c.id = conversation_id and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid()))
);

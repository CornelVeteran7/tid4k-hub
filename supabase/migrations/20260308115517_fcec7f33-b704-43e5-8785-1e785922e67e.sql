
-- Fix ALL RLS policies to be PERMISSIVE (the default) instead of RESTRICTIVE
-- This is critical: RESTRICTIVE policies cannot grant access on their own

-- PROFILES
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Staff read all profiles" ON public.profiles FOR SELECT USING (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'secretara') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- CHILDREN
DROP POLICY IF EXISTS "Parents read own children" ON public.children;
DROP POLICY IF EXISTS "Staff read all children" ON public.children;
DROP POLICY IF EXISTS "Staff can insert children" ON public.children;
DROP POLICY IF EXISTS "Staff can update children" ON public.children;
DROP POLICY IF EXISTS "Staff can delete children" ON public.children;

CREATE POLICY "Parents read own children" ON public.children FOR SELECT USING (parinte_id = auth.uid());
CREATE POLICY "Staff read all children" ON public.children FOR SELECT USING (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Staff can insert children" ON public.children FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Staff can update children" ON public.children FOR UPDATE USING (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Staff can delete children" ON public.children FOR DELETE USING (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

-- ATTENDANCE
DROP POLICY IF EXISTS "Parents read own children attendance" ON public.attendance;
DROP POLICY IF EXISTS "Staff read all attendance" ON public.attendance;
DROP POLICY IF EXISTS "Staff can insert attendance" ON public.attendance;
DROP POLICY IF EXISTS "Staff can update attendance" ON public.attendance;
DROP POLICY IF EXISTS "Staff can delete attendance" ON public.attendance;

CREATE POLICY "Parents read own children attendance" ON public.attendance FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.children c WHERE c.id = attendance.child_id AND c.parinte_id = auth.uid())
);
CREATE POLICY "Staff read all attendance" ON public.attendance FOR SELECT USING (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Staff can insert attendance" ON public.attendance FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Staff can update attendance" ON public.attendance FOR UPDATE USING (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Staff can delete attendance" ON public.attendance FOR DELETE USING (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

-- USER_GROUPS
DROP POLICY IF EXISTS "Users read own groups" ON public.user_groups;
DROP POLICY IF EXISTS "Staff read all user_groups" ON public.user_groups;
DROP POLICY IF EXISTS "Admins can insert user_groups" ON public.user_groups;
DROP POLICY IF EXISTS "Admins can update user_groups" ON public.user_groups;
DROP POLICY IF EXISTS "Admins can delete user_groups" ON public.user_groups;

CREATE POLICY "Users read own groups" ON public.user_groups FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Staff read all user_groups" ON public.user_groups FOR SELECT USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admins can insert user_groups" ON public.user_groups FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admins can update user_groups" ON public.user_groups FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admins can delete user_groups" ON public.user_groups FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

-- USER_ROLES
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT USING (
  user_id = auth.uid() OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

-- ANNOUNCEMENTS
DROP POLICY IF EXISTS "Authenticated can read announcements" ON public.announcements;
DROP POLICY IF EXISTS "Staff can insert announcements" ON public.announcements;
DROP POLICY IF EXISTS "Staff can update announcements" ON public.announcements;
DROP POLICY IF EXISTS "Staff can delete announcements" ON public.announcements;

CREATE POLICY "Authenticated can read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Staff can insert announcements" ON public.announcements FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Staff can update announcements" ON public.announcements FOR UPDATE USING (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Staff can delete announcements" ON public.announcements FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

-- ANNOUNCEMENT_READS
DROP POLICY IF EXISTS "Users manage own reads" ON public.announcement_reads;
CREATE POLICY "Users manage own reads" ON public.announcement_reads FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- CONVERSATIONS
DROP POLICY IF EXISTS "Participants can read conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Participants can update conversations" ON public.conversations;

CREATE POLICY "Participants can read conversations" ON public.conversations FOR SELECT USING (
  participant_1 = auth.uid() OR participant_2 = auth.uid()
);
CREATE POLICY "Authenticated can create conversations" ON public.conversations FOR INSERT WITH CHECK (
  participant_1 = auth.uid() OR participant_2 = auth.uid()
);
CREATE POLICY "Participants can update conversations" ON public.conversations FOR UPDATE USING (
  participant_1 = auth.uid() OR participant_2 = auth.uid()
);

-- MESSAGES
DROP POLICY IF EXISTS "Conversation participants can read messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated can send messages" ON public.messages;
DROP POLICY IF EXISTS "Participants can update messages" ON public.messages;

CREATE POLICY "Conversation participants can read messages" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()))
);
CREATE POLICY "Authenticated can send messages" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Participants can update messages" ON public.messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()))
);

-- DOCUMENTS
DROP POLICY IF EXISTS "Authenticated can read documents" ON public.documents;
DROP POLICY IF EXISTS "Staff can insert documents" ON public.documents;
DROP POLICY IF EXISTS "Staff can update documents" ON public.documents;
DROP POLICY IF EXISTS "Staff can delete documents" ON public.documents;

CREATE POLICY "Authenticated can read documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Staff can insert documents" ON public.documents FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Staff can update documents" ON public.documents FOR UPDATE USING (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Staff can delete documents" ON public.documents FOR DELETE USING (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

-- GROUPS
DROP POLICY IF EXISTS "Authenticated can read groups" ON public.groups;
DROP POLICY IF EXISTS "Admins can insert groups" ON public.groups;
DROP POLICY IF EXISTS "Admins can update groups" ON public.groups;
DROP POLICY IF EXISTS "Admins can delete groups" ON public.groups;

CREATE POLICY "Authenticated can read groups" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Admins can insert groups" ON public.groups FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admins can update groups" ON public.groups FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admins can delete groups" ON public.groups FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

-- ORGANIZATIONS
DROP POLICY IF EXISTS "Users see own organization" ON public.organizations;
DROP POLICY IF EXISTS "Admins can insert organizations" ON public.organizations;
DROP POLICY IF EXISTS "Admins can update organizations" ON public.organizations;
DROP POLICY IF EXISTS "Admins can delete organizations" ON public.organizations;

CREATE POLICY "Users see own organization" ON public.organizations FOR SELECT USING (
  id = get_user_org_id(auth.uid()) OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admins can insert organizations" ON public.organizations FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admins can update organizations" ON public.organizations FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admins can delete organizations" ON public.organizations FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

-- MODULES_CONFIG
DROP POLICY IF EXISTS "Users see own org modules" ON public.modules_config;
DROP POLICY IF EXISTS "Admins can insert modules_config" ON public.modules_config;
DROP POLICY IF EXISTS "Admins can update modules_config" ON public.modules_config;
DROP POLICY IF EXISTS "Admins can delete modules_config" ON public.modules_config;

CREATE POLICY "Users see own org modules" ON public.modules_config FOR SELECT USING (
  organization_id = get_user_org_id(auth.uid()) OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admins can insert modules_config" ON public.modules_config FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admins can update modules_config" ON public.modules_config FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admins can delete modules_config" ON public.modules_config FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

-- SCHOOLS
DROP POLICY IF EXISTS "Authenticated can read schools" ON public.schools;
DROP POLICY IF EXISTS "Admins can insert schools" ON public.schools;
DROP POLICY IF EXISTS "Admins can update schools" ON public.schools;
DROP POLICY IF EXISTS "Admins can delete schools" ON public.schools;

CREATE POLICY "Authenticated can read schools" ON public.schools FOR SELECT USING (true);
CREATE POLICY "Admins can insert schools" ON public.schools FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admins can update schools" ON public.schools FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admins can delete schools" ON public.schools FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

-- SCHEDULE
DROP POLICY IF EXISTS "Authenticated can read schedule" ON public.schedule;
DROP POLICY IF EXISTS "Staff can insert schedule" ON public.schedule;
DROP POLICY IF EXISTS "Staff can update schedule" ON public.schedule;
DROP POLICY IF EXISTS "Staff can delete schedule" ON public.schedule;

CREATE POLICY "Authenticated can read schedule" ON public.schedule FOR SELECT USING (true);
CREATE POLICY "Staff can insert schedule" ON public.schedule FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Staff can update schedule" ON public.schedule FOR UPDATE USING (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Staff can delete schedule" ON public.schedule FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

-- STORIES
DROP POLICY IF EXISTS "Authenticated can read stories" ON public.stories;
DROP POLICY IF EXISTS "Admin can insert stories" ON public.stories;
DROP POLICY IF EXISTS "Admin can update stories" ON public.stories;
DROP POLICY IF EXISTS "Admin can delete stories" ON public.stories;

CREATE POLICY "Authenticated can read stories" ON public.stories FOR SELECT USING (true);
CREATE POLICY "Admin can insert stories" ON public.stories FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can update stories" ON public.stories FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can delete stories" ON public.stories FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

-- STORY_FAVORITES
DROP POLICY IF EXISTS "Users manage own favorites" ON public.story_favorites;
CREATE POLICY "Users manage own favorites" ON public.story_favorites FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- SPONSORS + PROMOS + CAMPAIGNS + PLANS + IMPRESSIONS
DROP POLICY IF EXISTS "Authenticated can read sponsors" ON public.sponsors;
DROP POLICY IF EXISTS "Admin can insert sponsors" ON public.sponsors;
DROP POLICY IF EXISTS "Admin can update sponsors" ON public.sponsors;
DROP POLICY IF EXISTS "Admin can delete sponsors" ON public.sponsors;

CREATE POLICY "Authenticated can read sponsors" ON public.sponsors FOR SELECT USING (true);
CREATE POLICY "Admin can insert sponsors" ON public.sponsors FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can update sponsors" ON public.sponsors FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can delete sponsors" ON public.sponsors FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

DROP POLICY IF EXISTS "Authenticated can read sponsor_promos" ON public.sponsor_promos;
DROP POLICY IF EXISTS "Admin can insert sponsor_promos" ON public.sponsor_promos;
DROP POLICY IF EXISTS "Admin can update sponsor_promos" ON public.sponsor_promos;
DROP POLICY IF EXISTS "Admin can delete sponsor_promos" ON public.sponsor_promos;

CREATE POLICY "Authenticated can read sponsor_promos" ON public.sponsor_promos FOR SELECT USING (true);
CREATE POLICY "Admin can insert sponsor_promos" ON public.sponsor_promos FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can update sponsor_promos" ON public.sponsor_promos FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can delete sponsor_promos" ON public.sponsor_promos FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

DROP POLICY IF EXISTS "Authenticated can read sponsor_campaigns" ON public.sponsor_campaigns;
DROP POLICY IF EXISTS "Admin can insert sponsor_campaigns" ON public.sponsor_campaigns;
DROP POLICY IF EXISTS "Admin can update sponsor_campaigns" ON public.sponsor_campaigns;
DROP POLICY IF EXISTS "Admin can delete sponsor_campaigns" ON public.sponsor_campaigns;

CREATE POLICY "Authenticated can read sponsor_campaigns" ON public.sponsor_campaigns FOR SELECT USING (true);
CREATE POLICY "Admin can insert sponsor_campaigns" ON public.sponsor_campaigns FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can update sponsor_campaigns" ON public.sponsor_campaigns FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can delete sponsor_campaigns" ON public.sponsor_campaigns FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

DROP POLICY IF EXISTS "Authenticated can read sponsor_plans" ON public.sponsor_plans;
DROP POLICY IF EXISTS "Admin can insert sponsor_plans" ON public.sponsor_plans;
DROP POLICY IF EXISTS "Admin can update sponsor_plans" ON public.sponsor_plans;

CREATE POLICY "Authenticated can read sponsor_plans" ON public.sponsor_plans FOR SELECT USING (true);
CREATE POLICY "Admin can insert sponsor_plans" ON public.sponsor_plans FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can update sponsor_plans" ON public.sponsor_plans FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

DROP POLICY IF EXISTS "Authenticated can insert impressions" ON public.sponsor_impressions;
DROP POLICY IF EXISTS "Admin can read impressions" ON public.sponsor_impressions;

CREATE POLICY "Authenticated can insert impressions" ON public.sponsor_impressions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can read impressions" ON public.sponsor_impressions FOR SELECT USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

-- MENU
DROP POLICY IF EXISTS "Authenticated can read menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "Admin can insert menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "Admin can update menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "Admin can delete menu_items" ON public.menu_items;

CREATE POLICY "Authenticated can read menu_items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Admin can insert menu_items" ON public.menu_items FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can update menu_items" ON public.menu_items FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can delete menu_items" ON public.menu_items FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

DROP POLICY IF EXISTS "Authenticated can read menu_metadata" ON public.menu_metadata;
DROP POLICY IF EXISTS "Admin can insert menu_metadata" ON public.menu_metadata;
DROP POLICY IF EXISTS "Admin can update menu_metadata" ON public.menu_metadata;
DROP POLICY IF EXISTS "Admin can delete menu_metadata" ON public.menu_metadata;

CREATE POLICY "Authenticated can read menu_metadata" ON public.menu_metadata FOR SELECT USING (true);
CREATE POLICY "Admin can insert menu_metadata" ON public.menu_metadata FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can update menu_metadata" ON public.menu_metadata FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can delete menu_metadata" ON public.menu_metadata FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

-- NUTRITIONAL DATA
DROP POLICY IF EXISTS "Authenticated can read nutritional_data" ON public.nutritional_data;
DROP POLICY IF EXISTS "Admin can insert nutritional_data" ON public.nutritional_data;
DROP POLICY IF EXISTS "Admin can update nutritional_data" ON public.nutritional_data;
DROP POLICY IF EXISTS "Admin can delete nutritional_data" ON public.nutritional_data;

CREATE POLICY "Authenticated can read nutritional_data" ON public.nutritional_data FOR SELECT USING (true);
CREATE POLICY "Admin can insert nutritional_data" ON public.nutritional_data FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can update nutritional_data" ON public.nutritional_data FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can delete nutritional_data" ON public.nutritional_data FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

-- INFODISPLAY tables
DROP POLICY IF EXISTS "Authenticated can read infodisplay_panels" ON public.infodisplay_panels;
DROP POLICY IF EXISTS "Admin can insert infodisplay_panels" ON public.infodisplay_panels;
DROP POLICY IF EXISTS "Admin can update infodisplay_panels" ON public.infodisplay_panels;
DROP POLICY IF EXISTS "Admin can delete infodisplay_panels" ON public.infodisplay_panels;

CREATE POLICY "Authenticated can read infodisplay_panels" ON public.infodisplay_panels FOR SELECT USING (true);
CREATE POLICY "Admin can insert infodisplay_panels" ON public.infodisplay_panels FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can update infodisplay_panels" ON public.infodisplay_panels FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can delete infodisplay_panels" ON public.infodisplay_panels FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

DROP POLICY IF EXISTS "Authenticated can read infodisplay_ticker" ON public.infodisplay_ticker;
DROP POLICY IF EXISTS "Admin can insert infodisplay_ticker" ON public.infodisplay_ticker;
DROP POLICY IF EXISTS "Admin can update infodisplay_ticker" ON public.infodisplay_ticker;
DROP POLICY IF EXISTS "Admin can delete infodisplay_ticker" ON public.infodisplay_ticker;

CREATE POLICY "Authenticated can read infodisplay_ticker" ON public.infodisplay_ticker FOR SELECT USING (true);
CREATE POLICY "Admin can insert infodisplay_ticker" ON public.infodisplay_ticker FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can update infodisplay_ticker" ON public.infodisplay_ticker FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can delete infodisplay_ticker" ON public.infodisplay_ticker FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

DROP POLICY IF EXISTS "Authenticated can read infodisplay_qr" ON public.infodisplay_qr;
DROP POLICY IF EXISTS "Admin can insert infodisplay_qr" ON public.infodisplay_qr;
DROP POLICY IF EXISTS "Admin can update infodisplay_qr" ON public.infodisplay_qr;
DROP POLICY IF EXISTS "Admin can delete infodisplay_qr" ON public.infodisplay_qr;

CREATE POLICY "Authenticated can read infodisplay_qr" ON public.infodisplay_qr FOR SELECT USING (true);
CREATE POLICY "Admin can insert infodisplay_qr" ON public.infodisplay_qr FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can update infodisplay_qr" ON public.infodisplay_qr FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can delete infodisplay_qr" ON public.infodisplay_qr FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

DROP POLICY IF EXISTS "Authenticated can read infodisplay_settings" ON public.infodisplay_settings;
DROP POLICY IF EXISTS "Admin can insert infodisplay_settings" ON public.infodisplay_settings;
DROP POLICY IF EXISTS "Admin can update infodisplay_settings" ON public.infodisplay_settings;

CREATE POLICY "Authenticated can read infodisplay_settings" ON public.infodisplay_settings FOR SELECT USING (true);
CREATE POLICY "Admin can insert infodisplay_settings" ON public.infodisplay_settings FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can update infodisplay_settings" ON public.infodisplay_settings FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

-- CANCELARIE
DROP POLICY IF EXISTS "Authenticated can read cancelarie_teachers" ON public.cancelarie_teachers;
DROP POLICY IF EXISTS "Admin can insert cancelarie_teachers" ON public.cancelarie_teachers;
DROP POLICY IF EXISTS "Admin can update cancelarie_teachers" ON public.cancelarie_teachers;
DROP POLICY IF EXISTS "Admin can delete cancelarie_teachers" ON public.cancelarie_teachers;

CREATE POLICY "Authenticated can read cancelarie_teachers" ON public.cancelarie_teachers FOR SELECT USING (true);
CREATE POLICY "Admin can insert cancelarie_teachers" ON public.cancelarie_teachers FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can update cancelarie_teachers" ON public.cancelarie_teachers FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can delete cancelarie_teachers" ON public.cancelarie_teachers FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

DROP POLICY IF EXISTS "Authenticated can read cancelarie_activities" ON public.cancelarie_activities;
DROP POLICY IF EXISTS "Admin can insert cancelarie_activities" ON public.cancelarie_activities;
DROP POLICY IF EXISTS "Admin can update cancelarie_activities" ON public.cancelarie_activities;
DROP POLICY IF EXISTS "Admin can delete cancelarie_activities" ON public.cancelarie_activities;

CREATE POLICY "Authenticated can read cancelarie_activities" ON public.cancelarie_activities FOR SELECT USING (true);
CREATE POLICY "Admin can insert cancelarie_activities" ON public.cancelarie_activities FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can update cancelarie_activities" ON public.cancelarie_activities FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can delete cancelarie_activities" ON public.cancelarie_activities FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

-- FACEBOOK
DROP POLICY IF EXISTS "Admin can read facebook_posts" ON public.facebook_posts;
DROP POLICY IF EXISTS "Admin can insert facebook_posts" ON public.facebook_posts;
DROP POLICY IF EXISTS "Admin can update facebook_posts" ON public.facebook_posts;

CREATE POLICY "Admin can read facebook_posts" ON public.facebook_posts FOR SELECT USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can insert facebook_posts" ON public.facebook_posts FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can update facebook_posts" ON public.facebook_posts FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

DROP POLICY IF EXISTS "Admin can read facebook_settings" ON public.facebook_settings;
DROP POLICY IF EXISTS "Admin can insert facebook_settings" ON public.facebook_settings;
DROP POLICY IF EXISTS "Admin can update facebook_settings" ON public.facebook_settings;

CREATE POLICY "Admin can read facebook_settings" ON public.facebook_settings FOR SELECT USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can insert facebook_settings" ON public.facebook_settings FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can update facebook_settings" ON public.facebook_settings FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

-- WHATSAPP
DROP POLICY IF EXISTS "Admin can read whatsapp_mappings" ON public.whatsapp_mappings;
DROP POLICY IF EXISTS "Admin can insert whatsapp_mappings" ON public.whatsapp_mappings;
DROP POLICY IF EXISTS "Admin can delete whatsapp_mappings" ON public.whatsapp_mappings;

CREATE POLICY "Admin can read whatsapp_mappings" ON public.whatsapp_mappings FOR SELECT USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can insert whatsapp_mappings" ON public.whatsapp_mappings FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "Admin can delete whatsapp_mappings" ON public.whatsapp_mappings FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

-- WORKSHOPS
DROP POLICY IF EXISTS "Authenticated can read workshops" ON public.workshops;
CREATE POLICY "Authenticated can read workshops" ON public.workshops FOR SELECT USING (true);

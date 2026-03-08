
-- ============================================================
-- Phase 1: Fix multi-tenancy foundation
-- 1. Drop ALL RESTRICTIVE policies (critical bug fix)
-- 2. Add organization_id to all data tables
-- 3. Recreate all policies as PERMISSIVE
-- 4. Create handle_new_user trigger
-- 5. Add constraints and indexes
-- ============================================================

-- Step 1: Drop ALL existing RESTRICTIVE policies (clean slate)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- Step 2: Add organization_id to all data tables
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.schedule ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.menu_metadata ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.nutritional_data ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.infodisplay_panels ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.infodisplay_qr ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.infodisplay_settings ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.infodisplay_ticker ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.cancelarie_teachers ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.cancelarie_activities ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.facebook_posts ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.facebook_settings ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.sponsor_promos ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.sponsor_campaigns ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.workshops ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.whatsapp_mappings ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- Step 3: Unique constraints for upserts
DO $$ BEGIN
  ALTER TABLE public.attendance ADD CONSTRAINT attendance_child_data_unique UNIQUE (child_id, data);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.menu_metadata ADD CONSTRAINT menu_metadata_saptamana_unique UNIQUE (saptamana);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Step 4: Create handle_new_user trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Helper function for org membership check
CREATE OR REPLACE FUNCTION public.user_org_match(_org_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT _org_id IS NULL OR _org_id = get_user_org_id(auth.uid()) OR has_role(auth.uid(), 'inky')
$$;

-- Step 6: Recreate ALL policies as PERMISSIVE

-- === PROFILES ===
CREATE POLICY "read_own" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "staff_read" ON public.profiles FOR SELECT USING (
  (has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'secretara') OR has_role(auth.uid(), 'inky'))
  AND (organization_id IS NULL OR organization_id = get_user_org_id(auth.uid()) OR has_role(auth.uid(), 'inky'))
);
CREATE POLICY "insert_own" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "update_own" ON public.profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- === USER_ROLES ===
CREATE POLICY "read_own_roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "admin_read_roles" ON public.user_roles FOR SELECT USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_insert_roles" ON public.user_roles FOR INSERT WITH CHECK (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_update_roles" ON public.user_roles FOR UPDATE USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_delete_roles" ON public.user_roles FOR DELETE USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === ORGANIZATIONS ===
CREATE POLICY "read_own_org" ON public.organizations FOR SELECT USING (id = get_user_org_id(auth.uid()) OR has_role(auth.uid(), 'inky'));
CREATE POLICY "anon_read_org" ON public.organizations FOR SELECT TO anon USING (true);
CREATE POLICY "admin_update_org" ON public.organizations FOR UPDATE USING (has_role(auth.uid(), 'administrator') AND id = get_user_org_id(auth.uid()));
CREATE POLICY "inky_all_org" ON public.organizations FOR ALL USING (has_role(auth.uid(), 'inky')) WITH CHECK (has_role(auth.uid(), 'inky'));

-- === MODULES_CONFIG ===
CREATE POLICY "read_org_modules" ON public.modules_config FOR SELECT USING (organization_id = get_user_org_id(auth.uid()) OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_manage_modules" ON public.modules_config FOR INSERT WITH CHECK (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_update_modules" ON public.modules_config FOR UPDATE USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_delete_modules" ON public.modules_config FOR DELETE USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === ANNOUNCEMENTS ===
CREATE POLICY "auth_read_ann" ON public.announcements FOR SELECT USING (user_org_match(organization_id));
CREATE POLICY "anon_read_ann" ON public.announcements FOR SELECT TO anon USING (true);
CREATE POLICY "staff_insert_ann" ON public.announcements FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_ann" ON public.announcements FOR UPDATE USING (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_delete_ann" ON public.announcements FOR DELETE USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === ANNOUNCEMENT_READS ===
CREATE POLICY "own_reads" ON public.announcement_reads FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- === GROUPS ===
CREATE POLICY "auth_read_groups" ON public.groups FOR SELECT USING (user_org_match(organization_id));
CREATE POLICY "admin_insert_groups" ON public.groups FOR INSERT WITH CHECK (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_update_groups" ON public.groups FOR UPDATE USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_delete_groups" ON public.groups FOR DELETE USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === USER_GROUPS ===
CREATE POLICY "read_own_ug" ON public.user_groups FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "admin_read_ug" ON public.user_groups FOR SELECT USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_insert_ug" ON public.user_groups FOR INSERT WITH CHECK (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_update_ug" ON public.user_groups FOR UPDATE USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_delete_ug" ON public.user_groups FOR DELETE USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === CHILDREN ===
CREATE POLICY "parent_read_ch" ON public.children FOR SELECT USING (parinte_id = auth.uid());
CREATE POLICY "staff_read_ch" ON public.children FOR SELECT USING (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_insert_ch" ON public.children FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_ch" ON public.children FOR UPDATE USING (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_ch" ON public.children FOR DELETE USING (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === ATTENDANCE ===
CREATE POLICY "parent_read_att" ON public.attendance FOR SELECT USING (
  EXISTS (SELECT 1 FROM children c WHERE c.id = attendance.child_id AND c.parinte_id = auth.uid()));
CREATE POLICY "staff_read_att" ON public.attendance FOR SELECT USING (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_insert_att" ON public.attendance FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_att" ON public.attendance FOR UPDATE USING (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_att" ON public.attendance FOR DELETE USING (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === DOCUMENTS ===
CREATE POLICY "auth_read_docs" ON public.documents FOR SELECT USING (user_org_match(organization_id));
CREATE POLICY "staff_insert_docs" ON public.documents FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_docs" ON public.documents FOR UPDATE USING (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_docs" ON public.documents FOR DELETE USING (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === SCHEDULE ===
CREATE POLICY "auth_read_sched" ON public.schedule FOR SELECT USING (user_org_match(organization_id));
CREATE POLICY "staff_insert_sched" ON public.schedule FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_sched" ON public.schedule FOR UPDATE USING (
  has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_sched" ON public.schedule FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === MENU_ITEMS ===
CREATE POLICY "auth_read_menu" ON public.menu_items FOR SELECT USING (user_org_match(organization_id));
CREATE POLICY "staff_insert_menu" ON public.menu_items FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_menu" ON public.menu_items FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_menu" ON public.menu_items FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === MENU_METADATA ===
CREATE POLICY "auth_read_mmeta" ON public.menu_metadata FOR SELECT USING (user_org_match(organization_id));
CREATE POLICY "staff_insert_mmeta" ON public.menu_metadata FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_mmeta" ON public.menu_metadata FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_mmeta" ON public.menu_metadata FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === NUTRITIONAL_DATA ===
CREATE POLICY "auth_read_nutri" ON public.nutritional_data FOR SELECT USING (user_org_match(organization_id));
CREATE POLICY "staff_insert_nutri" ON public.nutritional_data FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_nutri" ON public.nutritional_data FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_nutri" ON public.nutritional_data FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === STORIES ===
CREATE POLICY "auth_read_stories" ON public.stories FOR SELECT USING (user_org_match(organization_id));
CREATE POLICY "admin_insert_stories" ON public.stories FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_update_stories" ON public.stories FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_delete_stories" ON public.stories FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === STORY_FAVORITES ===
CREATE POLICY "own_favs" ON public.story_favorites FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- === INFODISPLAY_PANELS (anon access for public display) ===
CREATE POLICY "auth_read_panels" ON public.infodisplay_panels FOR SELECT USING (user_org_match(organization_id));
CREATE POLICY "anon_read_panels" ON public.infodisplay_panels FOR SELECT TO anon USING (true);
CREATE POLICY "admin_insert_panels" ON public.infodisplay_panels FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_update_panels" ON public.infodisplay_panels FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_delete_panels" ON public.infodisplay_panels FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === INFODISPLAY_QR ===
CREATE POLICY "auth_read_iqr" ON public.infodisplay_qr FOR SELECT USING (user_org_match(organization_id));
CREATE POLICY "anon_read_iqr" ON public.infodisplay_qr FOR SELECT TO anon USING (true);
CREATE POLICY "admin_insert_iqr" ON public.infodisplay_qr FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_update_iqr" ON public.infodisplay_qr FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_delete_iqr" ON public.infodisplay_qr FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === INFODISPLAY_SETTINGS ===
CREATE POLICY "auth_read_iset" ON public.infodisplay_settings FOR SELECT USING (user_org_match(organization_id));
CREATE POLICY "anon_read_iset" ON public.infodisplay_settings FOR SELECT TO anon USING (true);
CREATE POLICY "admin_insert_iset" ON public.infodisplay_settings FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_update_iset" ON public.infodisplay_settings FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === INFODISPLAY_TICKER ===
CREATE POLICY "auth_read_itick" ON public.infodisplay_ticker FOR SELECT USING (user_org_match(organization_id));
CREATE POLICY "anon_read_itick" ON public.infodisplay_ticker FOR SELECT TO anon USING (true);
CREATE POLICY "admin_insert_itick" ON public.infodisplay_ticker FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_update_itick" ON public.infodisplay_ticker FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_delete_itick" ON public.infodisplay_ticker FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === CANCELARIE_TEACHERS ===
CREATE POLICY "auth_read_ct" ON public.cancelarie_teachers FOR SELECT USING (user_org_match(organization_id));
CREATE POLICY "admin_insert_ct" ON public.cancelarie_teachers FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_update_ct" ON public.cancelarie_teachers FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_delete_ct" ON public.cancelarie_teachers FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === CANCELARIE_ACTIVITIES ===
CREATE POLICY "auth_read_ca" ON public.cancelarie_activities FOR SELECT USING (user_org_match(organization_id));
CREATE POLICY "admin_insert_ca" ON public.cancelarie_activities FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_update_ca" ON public.cancelarie_activities FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_delete_ca" ON public.cancelarie_activities FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === FACEBOOK_POSTS ===
CREATE POLICY "admin_read_fb" ON public.facebook_posts FOR SELECT USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_insert_fb" ON public.facebook_posts FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_update_fb" ON public.facebook_posts FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === FACEBOOK_SETTINGS ===
CREATE POLICY "admin_read_fbs" ON public.facebook_settings FOR SELECT USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_insert_fbs" ON public.facebook_settings FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_update_fbs" ON public.facebook_settings FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === CONVERSATIONS ===
CREATE POLICY "participants_read_conv" ON public.conversations FOR SELECT USING (
  participant_1 = auth.uid() OR participant_2 = auth.uid());
CREATE POLICY "participants_insert_conv" ON public.conversations FOR INSERT WITH CHECK (
  participant_1 = auth.uid() OR participant_2 = auth.uid());
CREATE POLICY "participants_update_conv" ON public.conversations FOR UPDATE USING (
  participant_1 = auth.uid() OR participant_2 = auth.uid());

-- === MESSAGES ===
CREATE POLICY "participants_read_msg" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())));
CREATE POLICY "auth_send_msg" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "participants_update_msg" ON public.messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())));

-- === SCHOOLS ===
CREATE POLICY "auth_read_schools" ON public.schools FOR SELECT USING (user_org_match(organization_id));
CREATE POLICY "admin_insert_schools" ON public.schools FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_update_schools" ON public.schools FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_delete_schools" ON public.schools FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === SPONSORS (cross-org, readable by all authenticated) ===
CREATE POLICY "auth_read_sponsors" ON public.sponsors FOR SELECT USING (true);
CREATE POLICY "admin_insert_sponsors" ON public.sponsors FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_update_sponsors" ON public.sponsors FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_delete_sponsors" ON public.sponsors FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === SPONSOR_PROMOS ===
CREATE POLICY "auth_read_promos" ON public.sponsor_promos FOR SELECT USING (true);
CREATE POLICY "admin_insert_promos" ON public.sponsor_promos FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_update_promos" ON public.sponsor_promos FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_delete_promos" ON public.sponsor_promos FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === SPONSOR_CAMPAIGNS ===
CREATE POLICY "auth_read_campaigns" ON public.sponsor_campaigns FOR SELECT USING (true);
CREATE POLICY "admin_insert_campaigns" ON public.sponsor_campaigns FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_update_campaigns" ON public.sponsor_campaigns FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_delete_campaigns" ON public.sponsor_campaigns FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === SPONSOR_IMPRESSIONS ===
CREATE POLICY "admin_read_imp" ON public.sponsor_impressions FOR SELECT USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "auth_insert_imp" ON public.sponsor_impressions FOR INSERT WITH CHECK (true);

-- === SPONSOR_PLANS ===
CREATE POLICY "auth_read_plans" ON public.sponsor_plans FOR SELECT USING (true);
CREATE POLICY "admin_insert_plans" ON public.sponsor_plans FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_update_plans" ON public.sponsor_plans FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === WORKSHOPS ===
CREATE POLICY "auth_read_ws" ON public.workshops FOR SELECT USING (user_org_match(organization_id));
CREATE POLICY "admin_insert_ws" ON public.workshops FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_update_ws" ON public.workshops FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_delete_ws" ON public.workshops FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- === WHATSAPP_MAPPINGS ===
CREATE POLICY "auth_read_wm" ON public.whatsapp_mappings FOR SELECT USING (user_org_match(organization_id));
CREATE POLICY "admin_insert_wm" ON public.whatsapp_mappings FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_update_wm" ON public.whatsapp_mappings FOR UPDATE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_delete_wm" ON public.whatsapp_mappings FOR DELETE USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- Step 7: Performance indexes
CREATE INDEX IF NOT EXISTS idx_announcements_org ON public.announcements(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_org ON public.documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_groups_org ON public.groups(organization_id);
CREATE INDEX IF NOT EXISTS idx_children_org ON public.children(organization_id);
CREATE INDEX IF NOT EXISTS idx_schedule_org ON public.schedule(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_org ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_infodisplay_panels_org ON public.infodisplay_panels(organization_id);
CREATE INDEX IF NOT EXISTS idx_stories_org ON public.stories(organization_id);

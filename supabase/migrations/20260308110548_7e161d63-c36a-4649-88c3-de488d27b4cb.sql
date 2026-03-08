
-- Remaining RLS policies for all tables

-- Announcements
create policy "Authenticated can read announcements" on public.announcements for select to authenticated using (true);
create policy "Staff can insert announcements" on public.announcements for insert to authenticated with check (public.has_role(auth.uid(), 'profesor') or public.has_role(auth.uid(), 'director') or public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Staff can update announcements" on public.announcements for update to authenticated using (public.has_role(auth.uid(), 'profesor') or public.has_role(auth.uid(), 'director') or public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Staff can delete announcements" on public.announcements for delete to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));

-- Announcement reads
create policy "Users manage own reads" on public.announcement_reads for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Documents
create policy "Authenticated can read documents" on public.documents for select to authenticated using (true);
create policy "Staff can insert documents" on public.documents for insert to authenticated with check (public.has_role(auth.uid(), 'profesor') or public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Staff can update documents" on public.documents for update to authenticated using (public.has_role(auth.uid(), 'profesor') or public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Staff can delete documents" on public.documents for delete to authenticated using (public.has_role(auth.uid(), 'profesor') or public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));

-- Menu items
create policy "Authenticated can read menu_items" on public.menu_items for select to authenticated using (true);
create policy "Admin can insert menu_items" on public.menu_items for insert to authenticated with check (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'director') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can update menu_items" on public.menu_items for update to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'director') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can delete menu_items" on public.menu_items for delete to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));

-- Nutritional data
create policy "Authenticated can read nutritional_data" on public.nutritional_data for select to authenticated using (true);
create policy "Admin can insert nutritional_data" on public.nutritional_data for insert to authenticated with check (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'director') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can update nutritional_data" on public.nutritional_data for update to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'director') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can delete nutritional_data" on public.nutritional_data for delete to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));

-- Menu metadata
create policy "Authenticated can read menu_metadata" on public.menu_metadata for select to authenticated using (true);
create policy "Admin can insert menu_metadata" on public.menu_metadata for insert to authenticated with check (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'director') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can update menu_metadata" on public.menu_metadata for update to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'director') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can delete menu_metadata" on public.menu_metadata for delete to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));

-- Schedule
create policy "Authenticated can read schedule" on public.schedule for select to authenticated using (true);
create policy "Staff can insert schedule" on public.schedule for insert to authenticated with check (public.has_role(auth.uid(), 'profesor') or public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Staff can update schedule" on public.schedule for update to authenticated using (public.has_role(auth.uid(), 'profesor') or public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Staff can delete schedule" on public.schedule for delete to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));

-- Cancelarie
create policy "Authenticated can read cancelarie_teachers" on public.cancelarie_teachers for select to authenticated using (true);
create policy "Admin can insert cancelarie_teachers" on public.cancelarie_teachers for insert to authenticated with check (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can update cancelarie_teachers" on public.cancelarie_teachers for update to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can delete cancelarie_teachers" on public.cancelarie_teachers for delete to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Authenticated can read cancelarie_activities" on public.cancelarie_activities for select to authenticated using (true);
create policy "Admin can insert cancelarie_activities" on public.cancelarie_activities for insert to authenticated with check (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can update cancelarie_activities" on public.cancelarie_activities for update to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can delete cancelarie_activities" on public.cancelarie_activities for delete to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));

-- Stories
create policy "Authenticated can read stories" on public.stories for select to authenticated using (true);
create policy "Admin can insert stories" on public.stories for insert to authenticated with check (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can update stories" on public.stories for update to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can delete stories" on public.stories for delete to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Users manage own favorites" on public.story_favorites for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Workshops
create policy "Authenticated can read workshops" on public.workshops for select to authenticated using (true);
create policy "Admin can insert workshops" on public.workshops for insert to authenticated with check (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can update workshops" on public.workshops for update to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can delete workshops" on public.workshops for delete to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));

-- Sponsors
create policy "Authenticated can read sponsors" on public.sponsors for select to authenticated using (true);
create policy "Admin can insert sponsors" on public.sponsors for insert to authenticated with check (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can update sponsors" on public.sponsors for update to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can delete sponsors" on public.sponsors for delete to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));

create policy "Authenticated can read sponsor_promos" on public.sponsor_promos for select to authenticated using (true);
create policy "Admin can insert sponsor_promos" on public.sponsor_promos for insert to authenticated with check (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can update sponsor_promos" on public.sponsor_promos for update to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can delete sponsor_promos" on public.sponsor_promos for delete to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));

create policy "Authenticated can read sponsor_campaigns" on public.sponsor_campaigns for select to authenticated using (true);
create policy "Admin can insert sponsor_campaigns" on public.sponsor_campaigns for insert to authenticated with check (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can update sponsor_campaigns" on public.sponsor_campaigns for update to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can delete sponsor_campaigns" on public.sponsor_campaigns for delete to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));

create policy "Authenticated can read sponsor_plans" on public.sponsor_plans for select to authenticated using (true);
create policy "Admin can insert sponsor_plans" on public.sponsor_plans for insert to authenticated with check (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can update sponsor_plans" on public.sponsor_plans for update to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));

create policy "Authenticated can insert impressions" on public.sponsor_impressions for insert to authenticated with check (true);
create policy "Admin can read impressions" on public.sponsor_impressions for select to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));

-- Infodisplay
create policy "Authenticated can read infodisplay_panels" on public.infodisplay_panels for select to authenticated using (true);
create policy "Admin can insert infodisplay_panels" on public.infodisplay_panels for insert to authenticated with check (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can update infodisplay_panels" on public.infodisplay_panels for update to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can delete infodisplay_panels" on public.infodisplay_panels for delete to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));

create policy "Authenticated can read infodisplay_ticker" on public.infodisplay_ticker for select to authenticated using (true);
create policy "Admin can insert infodisplay_ticker" on public.infodisplay_ticker for insert to authenticated with check (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can update infodisplay_ticker" on public.infodisplay_ticker for update to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can delete infodisplay_ticker" on public.infodisplay_ticker for delete to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));

create policy "Authenticated can read infodisplay_qr" on public.infodisplay_qr for select to authenticated using (true);
create policy "Admin can insert infodisplay_qr" on public.infodisplay_qr for insert to authenticated with check (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can update infodisplay_qr" on public.infodisplay_qr for update to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can delete infodisplay_qr" on public.infodisplay_qr for delete to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));

create policy "Authenticated can read infodisplay_settings" on public.infodisplay_settings for select to authenticated using (true);
create policy "Admin can insert infodisplay_settings" on public.infodisplay_settings for insert to authenticated with check (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can update infodisplay_settings" on public.infodisplay_settings for update to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));

-- Facebook
create policy "Admin can read facebook_settings" on public.facebook_settings for select to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can insert facebook_settings" on public.facebook_settings for insert to authenticated with check (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can update facebook_settings" on public.facebook_settings for update to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can read facebook_posts" on public.facebook_posts for select to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can insert facebook_posts" on public.facebook_posts for insert to authenticated with check (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can update facebook_posts" on public.facebook_posts for update to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));

-- WhatsApp
create policy "Admin can read whatsapp_mappings" on public.whatsapp_mappings for select to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can insert whatsapp_mappings" on public.whatsapp_mappings for insert to authenticated with check (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can update whatsapp_mappings" on public.whatsapp_mappings for update to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));
create policy "Admin can delete whatsapp_mappings" on public.whatsapp_mappings for delete to authenticated using (public.has_role(auth.uid(), 'administrator') or public.has_role(auth.uid(), 'inky'));

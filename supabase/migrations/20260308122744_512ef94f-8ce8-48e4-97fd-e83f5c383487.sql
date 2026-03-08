
-- Update slugs on existing demo orgs
UPDATE public.organizations SET slug = 'gradinita-albinutele' WHERE id = 'a0000000-0000-0000-0000-000000000001' AND slug IS NULL;
UPDATE public.organizations SET slug = 'scoala-42' WHERE id = 'a0000000-0000-0000-0000-000000000002' AND slug IS NULL;
UPDATE public.organizations SET slug = 'clinica-medvital' WHERE id = 'a0000000-0000-0000-0000-000000000003' AND slug IS NULL;
UPDATE public.organizations SET slug = 'bloc-residence-park' WHERE id = 'a0000000-0000-0000-0000-000000000004' AND slug IS NULL;
UPDATE public.organizations SET slug = 'teatrul-national' WHERE id = 'a0000000-0000-0000-0000-000000000005' AND slug IS NULL;
UPDATE public.organizations SET slug = 'universitatea-poli' WHERE id = 'a0000000-0000-0000-0000-000000000006' AND slug IS NULL;
UPDATE public.organizations SET slug = 'constructpro' WHERE id = 'a0000000-0000-0000-0000-000000000007' AND slug IS NULL;
UPDATE public.organizations SET slug = 'autoservice-expert' WHERE id = 'a0000000-0000-0000-0000-000000000008' AND slug IS NULL;

-- Seed org_config for vertical-specific customizations
-- Kids
INSERT INTO public.org_config (organization_id, config_key, config_value) VALUES
('a0000000-0000-0000-0000-000000000001', 'vertical_settings', '{"daily_contribution_rate": 25, "meal_plan_enabled": true, "tts_stories_enabled": true, "video_monitoring": false}'),
('a0000000-0000-0000-0000-000000000001', 'display_settings', '{"slide_duration": 8, "ticker_speed": 30, "show_menu": true, "show_schedule": true, "show_qr": true}')
ON CONFLICT (organization_id, config_key) DO NOTHING;

-- Schools
INSERT INTO public.org_config (organization_id, config_key, config_value) VALUES
('a0000000-0000-0000-0000-000000000002', 'vertical_settings', '{"timetable_periods": 7, "grading_enabled": false, "parent_portal": true}'),
('a0000000-0000-0000-0000-000000000002', 'display_settings', '{"slide_duration": 10, "ticker_speed": 25, "show_schedule": true, "show_qr": true}')
ON CONFLICT (organization_id, config_key) DO NOTHING;

-- Medicine
INSERT INTO public.org_config (organization_id, config_key, config_value) VALUES
('a0000000-0000-0000-0000-000000000003', 'vertical_settings', '{"specialties": ["dental", "dermatologie", "medicina generala"], "service_list": [{"name": "Consultatie", "price": 150}, {"name": "Ecografie", "price": 200}], "queue_enabled": true}'),
('a0000000-0000-0000-0000-000000000003', 'display_settings', '{"slide_duration": 5, "ticker_speed": 20, "show_queue": true, "show_qr": true}')
ON CONFLICT (organization_id, config_key) DO NOTHING;

-- Living
INSERT INTO public.org_config (organization_id, config_key, config_value) VALUES
('a0000000-0000-0000-0000-000000000004', 'vertical_settings', '{"apartments_count": 120, "expense_categories": ["intretinere", "reparatii", "curatenie", "lift", "iluminat"], "hoa_meetings": true}'),
('a0000000-0000-0000-0000-000000000004', 'display_settings', '{"slide_duration": 12, "ticker_speed": 30, "show_qr": true}')
ON CONFLICT (organization_id, config_key) DO NOTHING;

-- Culture
INSERT INTO public.org_config (organization_id, config_key, config_value) VALUES
('a0000000-0000-0000-0000-000000000005', 'vertical_settings', '{"shows_per_week": 5, "surtitle_languages": ["ro", "en", "fr"], "sponsors_on_display": true}'),
('a0000000-0000-0000-0000-000000000005', 'display_settings', '{"slide_duration": 8, "ticker_speed": 25, "show_qr": true}')
ON CONFLICT (organization_id, config_key) DO NOTHING;

-- Students
INSERT INTO public.org_config (organization_id, config_key, config_value) VALUES
('a0000000-0000-0000-0000-000000000006', 'vertical_settings', '{"faculties": ["Inginerie", "Informatica", "Electronica"], "secretariat_windows": 4, "exam_schedule": true}'),
('a0000000-0000-0000-0000-000000000006', 'display_settings', '{"slide_duration": 10, "ticker_speed": 20, "show_queue": true, "show_qr": true}')
ON CONFLICT (organization_id, config_key) DO NOTHING;

-- Construction
INSERT INTO public.org_config (organization_id, config_key, config_value) VALUES
('a0000000-0000-0000-0000-000000000007', 'vertical_settings', '{"active_sites": 3, "team_count": 12, "budget_tracking": true, "ssm_enabled": true}'),
('a0000000-0000-0000-0000-000000000007', 'display_settings', '{"slide_duration": 6, "ticker_speed": 20, "show_tasks": true, "show_ssm": true, "show_qr": true}')
ON CONFLICT (organization_id, config_key) DO NOTHING;

-- Workshops
INSERT INTO public.org_config (organization_id, config_key, config_value) VALUES
('a0000000-0000-0000-0000-000000000008', 'vertical_settings', '{"type": "repairs_and_dismantling", "part_categories": ["motor", "caroserie", "suspensie", "electrica"], "client_portal": true}'),
('a0000000-0000-0000-0000-000000000008', 'display_settings', '{"slide_duration": 8, "ticker_speed": 25, "show_qr": true}')
ON CONFLICT (organization_id, config_key) DO NOTHING;

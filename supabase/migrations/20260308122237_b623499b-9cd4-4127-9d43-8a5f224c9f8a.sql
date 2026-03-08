
-- Seed 8 demo organizations, one per vertical
-- Use ON CONFLICT to be idempotent

INSERT INTO public.organizations (id, name, vertical_type, primary_color, secondary_color) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Grădinița Albinuțele', 'kids', '#1E3A4C', '#3B82F6'),
  ('a0000000-0000-0000-0000-000000000002', 'Școala Nr. 42', 'schools', '#1D4ED8', '#6366F1'),
  ('a0000000-0000-0000-0000-000000000003', 'Clinica MedVital', 'medicine', '#059669', '#10B981'),
  ('a0000000-0000-0000-0000-000000000004', 'Bloc Residence Park', 'living', '#7C3AED', '#8B5CF6'),
  ('a0000000-0000-0000-0000-000000000005', 'Teatrul Național', 'culture', '#DC2626', '#EF4444'),
  ('a0000000-0000-0000-0000-000000000006', 'Universitatea Politehnică', 'students', '#0891B2', '#06B6D4'),
  ('a0000000-0000-0000-0000-000000000007', 'ConstructPro SRL', 'construction', '#D97706', '#F59E0B'),
  ('a0000000-0000-0000-0000-000000000008', 'AutoService Expert', 'workshops', '#4B5563', '#6B7280')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, 
  vertical_type = EXCLUDED.vertical_type,
  primary_color = EXCLUDED.primary_color,
  secondary_color = EXCLUDED.secondary_color;

-- Seed groups for each org
INSERT INTO public.groups (id, organization_id, nume, slug, tip) VALUES
  -- Kids
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Grupa Fluturașilor', 'fluturasilor', 'gradinita'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Grupa Albinuțelor', 'albinutelor', 'gradinita'),
  -- Schools
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'Clasa a V-a A', 'clasa-5a', 'scoala'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'Clasa a VI-a B', 'clasa-6b', 'scoala'),
  -- Medicine
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 'Cabinet 1 - Medicină Generală', 'cabinet-1', 'scoala'),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'Cabinet 2 - Pediatrie', 'cabinet-2', 'scoala'),
  -- Construction
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000007', 'Șantier Centru', 'santier-centru', 'scoala'),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000007', 'Șantier Nord', 'santier-nord', 'scoala')
ON CONFLICT (id) DO UPDATE SET 
  organization_id = EXCLUDED.organization_id,
  nume = EXCLUDED.nume;

-- Seed announcements for each org
INSERT INTO public.announcements (organization_id, titlu, continut, prioritate) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Excursie la Zoo', 'Pe 15 martie mergem la Zoo. Pregătiți hăinuțe de exterior!', 'normal'),
  ('a0000000-0000-0000-0000-000000000001', 'Serbare de Primăvară', 'Invităm toți părinții la serbarea din 20 martie!', 'urgent'),
  ('a0000000-0000-0000-0000-000000000002', 'Olimpiada de Matematică', 'Înscrierile se fac până pe 25 martie.', 'normal'),
  ('a0000000-0000-0000-0000-000000000003', 'Program Modificat', 'În perioada 10-15 martie, programul se modifică: 08:00-14:00.', 'urgent'),
  ('a0000000-0000-0000-0000-000000000004', 'Ședință Asociație', 'Ședința trimestrială a asociației de proprietari — 18 martie, ora 18.', 'normal'),
  ('a0000000-0000-0000-0000-000000000005', 'Premieră: Hamlet', 'Premiera spectacolului Hamlet, 22 martie, ora 19:00.', 'normal'),
  ('a0000000-0000-0000-0000-000000000007', 'Verificare SSM', 'Inspectoratul va veni pentru verificare SSM pe 20 martie.', 'urgent');

-- Seed infodisplay panels
INSERT INTO public.infodisplay_panels (organization_id, tip, continut, durata, ordine) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'info', 'Bun venit la Grădinița Albinuțele! 🐝', 10, 1),
  ('a0000000-0000-0000-0000-000000000001', 'anunț', 'Excursie la Zoo pe 15 martie', 8, 2),
  ('a0000000-0000-0000-0000-000000000002', 'info', 'Școala Nr. 42 — Excelență în educație', 10, 1),
  ('a0000000-0000-0000-0000-000000000003', 'info', 'Clinica MedVital — Cabinet Medicină Generală', 12, 1),
  ('a0000000-0000-0000-0000-000000000005', 'eveniment', 'Premieră: Hamlet — 22 martie 2026', 15, 1),
  ('a0000000-0000-0000-0000-000000000007', 'info', 'ConstructPro — Șantier activ', 10, 1);

-- Seed ticker messages
INSERT INTO public.infodisplay_ticker (organization_id, mesaj, ordine) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Program: Luni-Vineri 07:30-17:30 ● Telefon: 0721 123 456', 1),
  ('a0000000-0000-0000-0000-000000000002', 'Examen Bacalaureat — sesiunea de primăvară', 1),
  ('a0000000-0000-0000-0000-000000000003', 'Program consultații: L-V 08:00-16:00 ● Urgențe: 0722 333 444', 1),
  ('a0000000-0000-0000-0000-000000000007', 'Poartă EIP! ● Nu uitați casca și vestă reflectorizantă', 1);

-- Seed construction tasks
INSERT INTO public.construction_tasks (organization_id, titlu, status, prioritate, locatie, assignee) VALUES
  ('a0000000-0000-0000-0000-000000000007', 'Turnare fundație corp B', 'in_progress', 'high', 'Corp B - Etaj 0', 'Echipa Ionescu'),
  ('a0000000-0000-0000-0000-000000000007', 'Montare cofraj scară', 'todo', 'normal', 'Scara principală', 'Echipa Popescu'),
  ('a0000000-0000-0000-0000-000000000007', 'Verificare armătură', 'todo', 'urgent', 'Corp A - Etaj 2', 'Ing. Marinescu');

-- Seed SSM reminders
INSERT INTO public.ssm_reminders (organization_id, mesaj, tip, ordine) VALUES
  ('a0000000-0000-0000-0000-000000000007', 'Obligatoriu: cască de protecție în zona de construcție', 'danger', 1),
  ('a0000000-0000-0000-0000-000000000007', 'Verificați zilnic starea schelelor', 'warning', 2),
  ('a0000000-0000-0000-0000-000000000007', 'Hidratare: beți apă la fiecare 30 minute', 'reminder', 3);

-- Seed queue entries for medicine demo
INSERT INTO public.queue_entries (organization_id, numar_tichet, status, cabinet) VALUES
  ('a0000000-0000-0000-0000-000000000003', 1, 'serving', 'Cabinet 1 - Medicină Generală'),
  ('a0000000-0000-0000-0000-000000000003', 2, 'waiting', NULL),
  ('a0000000-0000-0000-0000-000000000003', 3, 'waiting', NULL),
  ('a0000000-0000-0000-0000-000000000003', 4, 'waiting', NULL);

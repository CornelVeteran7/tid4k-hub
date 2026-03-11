
-- Add groups for orgs that have none
INSERT INTO public.groups (organization_id, slug, nume, tip) VALUES
-- Grădinița Floarea Soarelui (kids)
('4fdbb834-876f-45c9-a4fe-513d3528d716', 'fluturasi', 'Grupa Fluturași', 'gradinita'),
('4fdbb834-876f-45c9-a4fe-513d3528d716', 'albinute', 'Grupa Albinuțe', 'gradinita'),
('4fdbb834-876f-45c9-a4fe-513d3528d716', 'buburuze', 'Grupa Buburuze', 'gradinita'),
-- Bloc Residence Park (living)
('a0000000-0000-0000-0000-000000000004', 'scara-a-brp', 'Scara A', 'scoala'),
('a0000000-0000-0000-0000-000000000004', 'scara-b-brp', 'Scara B', 'scoala'),
-- Teatrul Național (culture)
('a0000000-0000-0000-0000-000000000005', 'sala-mare-tn', 'Sala Mare', 'scoala'),
('a0000000-0000-0000-0000-000000000005', 'sala-mica-tn', 'Sala Mică', 'scoala'),
-- Universitatea Politehnică (students)
('a0000000-0000-0000-0000-000000000006', 'fac-automatica', 'Automatică și Calculatoare', 'scoala'),
('a0000000-0000-0000-0000-000000000006', 'fac-electronica', 'Electronică', 'scoala'),
-- AutoService Expert (workshops)
('a0000000-0000-0000-0000-000000000008', 'atelier-mec', 'Atelier Mecanică', 'scoala'),
('a0000000-0000-0000-0000-000000000008', 'atelier-elec', 'Atelier Electrică', 'scoala'),
-- Clinica MedPlus (medicine) — add slug first
('e3d9aedb-50e9-40fa-b3ec-3cd530237cda', 'cab-general', 'Cabinet General', 'scoala'),
('e3d9aedb-50e9-40fa-b3ec-3cd530237cda', 'cab-pediatrie', 'Cabinet Pediatrie', 'scoala');

-- Fix missing slug for Clinica MedPlus
UPDATE public.organizations SET slug = 'clinica-medplus' WHERE id = 'e3d9aedb-50e9-40fa-b3ec-3cd530237cda' AND slug IS NULL;

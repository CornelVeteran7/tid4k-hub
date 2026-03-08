
-- Seed construction demo data for org a0000000-0000-0000-0000-000000000007 (ConstructPro SRL)

-- Sites
INSERT INTO public.construction_sites (id, organization_id, nume, adresa, buget, status, progress_pct, data_start, data_estimare_finalizare) VALUES
('c1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000007', 'Bloc Residentialul Nou', 'Str. Constructorilor nr. 15, București', 500000, 'activ', 35, '2026-01-15', '2026-12-30'),
('c1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000007', 'Vila Popescu', 'Str. Primăverii nr. 8, Otopeni', 200000, 'activ', 60, '2025-11-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;

-- Teams
INSERT INTO public.construction_teams (id, organization_id, nume, nr_membri, specialitate) VALUES
('c2000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000007', 'Echipa Zidari', 5, 'zidarie'),
('c2000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000007', 'Echipa Instalatii', 3, 'instalatii'),
('c2000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000007', 'Echipa Finisaje', 4, 'finisaje')
ON CONFLICT (id) DO NOTHING;

-- Team assignments
INSERT INTO public.construction_team_assignments (organization_id, team_id, site_id, saptamana_start, saptamana_end) VALUES
('a0000000-0000-0000-0000-000000000007', 'c2000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', '2026-03-09', '2026-03-15'),
('a0000000-0000-0000-0000-000000000007', 'c2000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', '2026-03-09', '2026-03-15'),
('a0000000-0000-0000-0000-000000000007', 'c2000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', '2026-03-16', '2026-03-22')
ON CONFLICT (id) DO NOTHING;

-- Tasks for Site 1
INSERT INTO public.construction_tasks (organization_id, site_id, team_id, titlu, descriere, status, prioritate, assignee, locatie, data_limita) VALUES
('a0000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000001', 'Turnare placa etaj 2', 'Turnare beton armat placa peste etaj 2 cu pompa', 'todo', 'urgent', 'Ion Marinescu', 'Etaj 2', '2026-03-10'),
('a0000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000002', 'Trasare instalatii etaj 1', 'Trasare trasee apa + canalizare etaj 1', 'in_progress', 'normal', 'Gheorghe Popa', 'Etaj 1', '2026-03-12'),
('a0000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000001', 'Zidarie compartimentari etaj 1', 'Ridicare pereti despartitori BCA etaj 1', 'todo', 'normal', 'Vasile Ionescu', 'Etaj 1', '2026-03-14'),
('a0000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000001', 'Cofrare stalpi etaj 3', 'Pregatire cofraj stalpi si grinzi etaj 3', 'todo', 'normal', 'Ion Marinescu', 'Etaj 3', '2026-03-15'),
('a0000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000001', 'Verificare armatura placa etaj 1', 'Task completat saptamana trecuta', 'done', 'normal', 'Ion Marinescu', 'Etaj 1', '2026-03-05')
ON CONFLICT (id) DO NOTHING;

-- Overdue task (due yesterday)
INSERT INTO public.construction_tasks (organization_id, site_id, team_id, titlu, descriere, status, prioritate, assignee, locatie, data_limita) VALUES
('a0000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000002', 'Montaj centrala termica', 'Montaj si racordare centrala termica Vila Popescu', 'todo', 'urgent', 'Gheorghe Popa', 'Subsol', '2026-03-07');

-- Costs for Site 1
INSERT INTO public.construction_costs (organization_id, site_id, categorie, descriere, cantitate, pret_unitar, furnizor, suma_platita, data_inregistrare) VALUES
('a0000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000001', 'materiale', 'Ciment Holcim', 50, 32, 'Dedeman', 1600, '2026-03-01'),
('a0000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000001', 'materiale', 'Fier beton OB37 Ø12', 2000, 4.5, 'ArcelorMittal', 9000, '2026-03-02'),
('a0000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000001', 'manopera', 'Echipa Zidari - saptamana 9', 200, 35, '', 7000, '2026-03-07'),
('a0000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000001', 'subcontractare', 'SC Instalatii SRL - contract partial', 1, 25000, 'SC Instalatii SRL', 10000, '2026-02-15');

-- Costs for Site 2 (push to near 80% of 200k budget)
INSERT INTO public.construction_costs (organization_id, site_id, categorie, descriere, cantitate, pret_unitar, furnizor, suma_platita, data_inregistrare) VALUES
('a0000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000002', 'materiale', 'Caramida Porotherm', 5000, 8, 'Wienerberger', 40000, '2025-12-01'),
('a0000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000002', 'materiale', 'Lemn structura acoperis', 1, 35000, 'Holzindustrie', 35000, '2026-01-10'),
('a0000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000002', 'manopera', 'Echipa Zidari - 8 saptamani', 1600, 35, '', 56000, '2026-02-28'),
('a0000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000002', 'subcontractare', 'SC Acoperisuri SRL', 1, 45000, 'SC Acoperisuri SRL', 45000, '2026-01-20'),
('a0000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000002', 'materiale', 'Tigla ceramica', 200, 25, 'Bramac', 5000, '2026-02-01');

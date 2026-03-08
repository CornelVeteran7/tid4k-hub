
-- Seed schools
INSERT INTO public.schools (id, nume, adresa, tip, logo_url, nr_copii, nr_profesori, activ) VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Grădinița Floarea Soarelui', 'Str. Exemplu nr. 1, București', 'gradinita', '/placeholder.svg', 45, 8, true),
  ('a1b2c3d4-0001-0001-0001-000000000002', 'Școala Primară Nr. 5', 'Bd. Libertății nr. 22, București', 'scoala', '/placeholder.svg', 120, 15, true),
  ('a1b2c3d4-0001-0001-0001-000000000003', 'Grădinița Licurici', 'Str. Plopilor nr. 10, Cluj-Napoca', 'gradinita', '/placeholder.svg', 28, 5, false);

-- Seed groups
INSERT INTO public.groups (id, school_id, slug, nume, tip) VALUES
  ('b1b2c3d4-0002-0002-0002-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001', 'grupa_mare', 'Grupa Mare', 'gradinita'),
  ('b1b2c3d4-0002-0002-0002-000000000002', 'a1b2c3d4-0001-0001-0001-000000000002', 'clasa_1a', 'Clasa I-A', 'scoala'),
  ('b1b2c3d4-0002-0002-0002-000000000003', 'a1b2c3d4-0001-0001-0001-000000000001', 'grupa_mica', 'Grupa Mică', 'gradinita');

-- Seed children
INSERT INTO public.children (id, nume_prenume, group_id, data_nasterii) VALUES
  ('c1000001-0000-0000-0000-000000000001', 'Alexia Ionescu', 'b1b2c3d4-0002-0002-0002-000000000001', '2020-03-15'),
  ('c1000001-0000-0000-0000-000000000002', 'Matei Popescu', 'b1b2c3d4-0002-0002-0002-000000000001', '2020-06-22'),
  ('c1000001-0000-0000-0000-000000000003', 'Sofia Marinescu', 'b1b2c3d4-0002-0002-0002-000000000001', '2020-01-10'),
  ('c1000001-0000-0000-0000-000000000004', 'David Radu', 'b1b2c3d4-0002-0002-0002-000000000001', '2020-09-05'),
  ('c1000001-0000-0000-0000-000000000005', 'Emma Vasilescu', 'b1b2c3d4-0002-0002-0002-000000000001', '2020-11-30'),
  ('c1000001-0000-0000-0000-000000000006', 'Andrei Munteanu', 'b1b2c3d4-0002-0002-0002-000000000002', '2019-04-12'),
  ('c1000001-0000-0000-0000-000000000007', 'Ioana Dragomir', 'b1b2c3d4-0002-0002-0002-000000000002', '2019-07-18');

-- Seed announcements
INSERT INTO public.announcements (titlu, continut, autor_nume, prioritate, target, ascuns_banda, pozitie_banda) VALUES
  ('Excursie la Grădina Botanică', 'Dragi părinți, vă anunțăm că pe data de 5 martie vom organiza o excursie la Grădina Botanică.', 'Maria Popescu', 'normal', 'grupa_mare', false, 1),
  ('Atenție! Modificare program', 'Din cauza condițiilor meteo, programul de mâine va fi modificat.', 'Vasile Georgescu', 'urgent', 'scoala', false, 2),
  ('Ședință cu părinții', 'Vă invităm la ședința cu părinții care va avea loc joi, 27 februarie.', 'Maria Popescu', 'normal', 'grupa_mare', true, null),
  ('Meniu nou pentru luna martie', 'Meniul pentru luna martie a fost actualizat.', 'Vasile Georgescu', 'normal', 'scoala', false, 3);

-- Seed stories
INSERT INTO public.stories (titlu, continut, categorie, varsta) VALUES
  ('Capra cu Trei Iezi', 'A fost odată ca niciodată o capră care avea trei iezi...', 'morale', '3-5'),
  ('Ursul Păcălit de Vulpe', 'Într-o pădure mare, trăia un urs voinic dar cam naiv...', 'distractive', '3-5'),
  ('Făt-Frumos din Lacrimă', 'A fost odată un împărat care nu avea copii...', 'educative', '5-7'),
  ('Povestea Albinuței Hărnicuțe', 'Într-o grădină plină de flori, trăia o albinuță mică...', 'educative', '3-5'),
  ('Aventurile lui Harap-Alb', 'Într-un ținut îndepărtat, trăia un împărat cu trei feciori...', 'morale', '7-10');

-- Seed workshops
INSERT INTO public.workshops (titlu, descriere, luna, categorie, materiale, instructor, durata_minute, scoli_target, publicat) VALUES
  ('Pictură pe sticlă', 'Copiii vor învăța tehnici de pictură pe sticlă.', '2026-03', 'arta', ARRAY['Vopsele pentru sticlă', 'Pensule', 'Borcane de sticlă'], 'Maria Ionescu', 45, ARRAY['all'], true),
  ('Explorăm magnetismul', 'Experimente interactive cu magneți.', '2026-03', 'stiinta', ARRAY['Magneți', 'Pilitură de fier', 'Compas'], 'Andrei Popescu', 40, ARRAY['1'], false),
  ('Ritmuri din natură', 'Atelierul de percuție cu instrumente naturale.', '2026-03', 'muzica', ARRAY['Bețe de lemn', 'Nuci de cocos', 'Semințe uscate'], 'Elena Dumitrescu', 35, ARRAY['all'], false);

-- Seed menu items
INSERT INTO public.menu_items (saptamana, masa, zi, continut, emoji) VALUES
  ('2026-W10', 'mic_dejun', 'Luni', 'Lapte cu cereale, pâine cu unt', '🥣🧈'),
  ('2026-W10', 'gustare_1', 'Luni', 'Măr', '🍎'),
  ('2026-W10', 'pranz', 'Luni', 'Supă de legume, piept de pui cu piure', '🥕🍗'),
  ('2026-W10', 'gustare_2', 'Luni', 'Biscuiți cu lapte', '🍪'),
  ('2026-W10', 'mic_dejun', 'Marți', 'Omletă cu brânză, pâine', '🧀🍞'),
  ('2026-W10', 'gustare_1', 'Marți', 'Banană', '🍌'),
  ('2026-W10', 'pranz', 'Marți', 'Ciorbă de perișoare, paste cu sos', '🍝'),
  ('2026-W10', 'gustare_2', 'Marți', 'Iaurt cu fructe', '🫐');

-- Seed nutritional data
INSERT INTO public.nutritional_data (saptamana, zi, kcal, carbohidrati, proteine, grasimi, fibre) VALUES
  ('2026-W10', 'Luni', 1450, 180, 55, 52, 18),
  ('2026-W10', 'Marți', 1520, 195, 58, 48, 20);

-- Seed menu metadata
INSERT INTO public.menu_metadata (saptamana, alergeni, semnatura_director, semnatura_asistent, semnatura_administrator) VALUES
  ('2026-W10', ARRAY['Gluten', 'Lapte', 'Ouă'], 'Dir. Popescu', 'Dr. Ionescu', 'Admin. Georgescu');

-- Seed sponsors
INSERT INTO public.sponsors (id, nume, logo_url, website, culoare_brand, descriere, activ, data_start, data_expirare, plan) VALUES
  ('d1000001-0000-0000-0000-000000000001', 'Kaufland', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Kaufland_201x_logo.svg/800px-Kaufland_201x_logo.svg.png', 'https://www.kaufland.ro', '#e1001a', 'Kaufland susține educația.', true, '2025-01-01', '2026-12-31', 'Enterprise'),
  ('d1000001-0000-0000-0000-000000000002', 'Lidl', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Lidl-Logo.svg/800px-Lidl-Logo.svg.png', 'https://www.lidl.ro', '#0050aa', 'Lidl investește în comunități.', true, '2025-06-01', '2026-06-01', 'Basic');

-- Seed sponsor plans
INSERT INTO public.sponsor_plans (nume_plan, pret, include_dashboard, include_infodisplay, include_ticker, include_inky, include_custom_inky, numar_scoli, descriere) VALUES
  ('Basic', 500, true, false, true, false, false, 5, 'Card pe dashboard + anunț în ticker'),
  ('Premium', 1500, true, true, true, true, false, -1, 'Toate integrările, școli nelimitate'),
  ('Enterprise', 3000, true, true, true, true, true, -1, 'Premium + branding custom Inky + rapoarte');

-- Seed infodisplay
INSERT INTO public.infodisplay_panels (tip, continut, durata, ordine) VALUES
  ('anunt', 'Excursie la Grădina Botanică - 5 Martie 2026', 8, 1),
  ('meniu', 'Meniul zilei: Supă de legume, Piept de pui cu piure', 10, 2),
  ('orar', 'Program: 08:00 - 16:00', 8, 3),
  ('foto', 'Galerie activități recent', 12, 4);

INSERT INTO public.infodisplay_ticker (mesaj, ordine) VALUES
  ('Bine ați venit la Grădinița Floarea Soarelui! 🌻', 1),
  ('Atenție: Modificare program mâine - deschidere la 8:30', 2),
  ('Meniul pentru luna martie a fost actualizat', 3);

INSERT INTO public.infodisplay_qr (label, url) VALUES
  ('TID4K App', 'https://tid4k.ro'),
  ('Meniu Săptămânal', 'https://tid4k.ro/meniu');

INSERT INTO public.infodisplay_settings (transition) VALUES ('fade');

-- Seed schedule
INSERT INTO public.schedule (group_id, zi, ora, materie, profesor, culoare) VALUES
  ('b1b2c3d4-0002-0002-0002-000000000001', 'Luni', '08:00', 'Limba Română', 'Maria Popescu', '#E3F2FD'),
  ('b1b2c3d4-0002-0002-0002-000000000001', 'Luni', '09:00', 'Matematică', 'Ana Dumitrescu', '#FFF3E0'),
  ('b1b2c3d4-0002-0002-0002-000000000001', 'Luni', '10:00', 'Educație fizică', 'Dan Marin', '#E8F5E9'),
  ('b1b2c3d4-0002-0002-0002-000000000001', 'Marți', '08:00', 'Matematică', 'Ana Dumitrescu', '#FFF3E0'),
  ('b1b2c3d4-0002-0002-0002-000000000001', 'Marți', '09:00', 'Științe', 'Maria Popescu', '#E8F5E9');

-- Seed documents
INSERT INTO public.documents (nume_fisier, tip_fisier, categorie, uploadat_de_nume, url, marime, group_id) VALUES
  ('activitate_pictura.jpg', 'jpg', 'activitati', 'Maria Popescu', '/placeholder.svg', 245000, 'b1b2c3d4-0002-0002-0002-000000000001'),
  ('regulament_intern.pdf', 'pdf', 'administrativ', 'Vasile Georgescu', '/placeholder.svg', 1200000, 'b1b2c3d4-0002-0002-0002-000000000001'),
  ('tema_matematica.pdf', 'pdf', 'teme', 'Maria Popescu', '/placeholder.svg', 350000, 'b1b2c3d4-0002-0002-0002-000000000001');

-- Seed WhatsApp mappings
INSERT INTO public.whatsapp_mappings (grupa, whatsapp_group, consent, sync_type) VALUES
  ('grupa_mare', 'Grupa Mare - Padinti', true, 'bidirectional'),
  ('clasa_1a', 'Clasa I-A Comunicare', true, 'one-way');

-- Seed Facebook settings
INSERT INTO public.facebook_settings (page_id, token_status, posting_format) VALUES ('123456789', 'activ', 'text+image');

-- Seed Facebook posts
INSERT INTO public.facebook_posts (content, posted_at, status) VALUES
  ('Activitate de pictură - Grupa Mare', '2026-02-23T09:30:00', 'posted'),
  ('Excursie planificată pentru luna martie', '2026-02-22T14:00:00', 'posted');


INSERT INTO public.nutritional_reference (ingredient_name, calories_per_100g, protein, fat, carbs, fiber, category, is_banned, ban_reason) VALUES
-- Lactate
('Lapte integral 3.5%', 64, 3.3, 3.5, 4.8, 0, 'lactate', false, null),
('Lapte degresat 1.5%', 47, 3.4, 1.5, 4.9, 0, 'lactate', false, null),
('Iaurt natural', 61, 3.5, 3.3, 4.7, 0, 'lactate', false, null),
('Brânză de vaci', 98, 11, 4.3, 3.4, 0, 'lactate', false, null),
('Cașcaval', 350, 25, 27, 1.3, 0, 'lactate', false, null),
('Smântână 20%', 204, 2.8, 20, 3.4, 0, 'lactate', false, null),
('Unt', 717, 0.9, 81, 0.1, 0, 'lactate', false, null),
('Telemea de vacă', 250, 17, 19, 2, 0, 'lactate', false, null),

-- Carne și pește
('Carne de pui (piept)', 165, 31, 3.6, 0, 0, 'carne', false, null),
('Carne de pui (pulpă)', 209, 26, 10.9, 0, 0, 'carne', false, null),
('Carne de vită', 250, 26, 15, 0, 0, 'carne', false, null),
('Carne de porc slabă', 143, 26, 3.5, 0, 0, 'carne', false, null),
('Ficat de pui', 119, 16.9, 4.8, 0.7, 0, 'carne', false, null),
('Pește alb (cod/pangasius)', 82, 18, 0.7, 0, 0, 'peste', false, null),
('Somon', 208, 20, 13, 0, 0, 'peste', false, null),

-- Ouă
('Ou de găină', 155, 13, 11, 1.1, 0, 'oua', false, null),

-- Cereale și paste
('Orez', 130, 2.7, 0.3, 28, 0.4, 'cereale', false, null),
('Paste făinoase', 131, 5, 1.1, 25, 1.8, 'cereale', false, null),
('Pâine albă', 265, 9, 3.2, 49, 2.7, 'cereale', false, null),
('Pâine integrală', 247, 13, 3.4, 41, 7, 'cereale', false, null),
('Griș', 360, 12.7, 1.1, 73, 3.9, 'cereale', false, null),
('Făină albă', 364, 10, 1, 76, 2.7, 'cereale', false, null),
('Mălai', 362, 8.1, 3.6, 73, 7.3, 'cereale', false, null),
('Cereale mic dejun (fulgi ovăz)', 379, 13.2, 6.5, 67, 10.1, 'cereale', false, null),
('Fidea', 138, 4.5, 1.6, 25, 1.2, 'cereale', false, null),
('Biscuiți simpli', 430, 7, 13, 72, 2, 'cereale', false, null),

-- Legume
('Cartofi', 77, 2, 0.1, 17, 2.2, 'legume', false, null),
('Morcovi', 41, 0.9, 0.2, 10, 2.8, 'legume', false, null),
('Ceapă', 40, 1.1, 0.1, 9.3, 1.7, 'legume', false, null),
('Roșii', 18, 0.9, 0.2, 3.9, 1.2, 'legume', false, null),
('Castraveți', 15, 0.7, 0.1, 3.6, 0.5, 'legume', false, null),
('Ardei gras', 31, 1, 0.3, 6, 2.1, 'legume', false, null),
('Fasole verde', 31, 1.8, 0.1, 7, 3.4, 'legume', false, null),
('Mazăre verde', 81, 5.4, 0.4, 14.5, 5.7, 'legume', false, null),
('Dovlecei', 17, 1.2, 0.3, 3.1, 1, 'legume', false, null),
('Spanac', 23, 2.9, 0.4, 3.6, 2.2, 'legume', false, null),
('Conopidă', 25, 1.9, 0.3, 5, 2, 'legume', false, null),
('Varză albă', 25, 1.3, 0.1, 5.8, 2.5, 'legume', false, null),
('Sfeclă roșie', 43, 1.6, 0.2, 10, 2.8, 'legume', false, null),
('Țelină rădăcină', 42, 1.5, 0.3, 9.2, 1.8, 'legume', false, null),
('Pătrunjel verde', 36, 3, 0.8, 6.3, 3.3, 'legume', false, null),
('Usturoi', 149, 6.4, 0.5, 33, 2.1, 'legume', false, null),

-- Fructe
('Mere', 52, 0.3, 0.2, 14, 2.4, 'fructe', false, null),
('Pere', 57, 0.4, 0.1, 15, 3.1, 'fructe', false, null),
('Banane', 89, 1.1, 0.3, 23, 2.6, 'fructe', false, null),
('Portocale', 47, 0.9, 0.1, 12, 2.4, 'fructe', false, null),
('Caise', 48, 1.4, 0.4, 11, 2, 'fructe', false, null),
('Piersici', 39, 0.9, 0.3, 10, 1.5, 'fructe', false, null),
('Prune', 46, 0.7, 0.3, 11, 1.4, 'fructe', false, null),
('Struguri', 69, 0.7, 0.2, 18, 0.9, 'fructe', false, null),
('Căpșuni', 32, 0.7, 0.3, 7.7, 2, 'fructe', false, null),
('Lămâie', 29, 1.1, 0.3, 9.3, 2.8, 'fructe', false, null),
('Compot de mere (fără zahăr)', 42, 0.2, 0.1, 11, 1, 'fructe', false, null),

-- Grăsimi și uleiuri
('Ulei de floarea soarelui', 884, 0, 100, 0, 0, 'grasimi', false, null),
('Ulei de măsline', 884, 0, 100, 0, 0, 'grasimi', false, null),

-- Zahăr și dulciuri
('Zahăr', 387, 0, 0, 100, 0, 'zahar', false, null),
('Miere de albine', 304, 0.3, 0, 82, 0.2, 'zahar', false, null),
('Gem de fructe', 250, 0.4, 0.1, 63, 1, 'zahar', false, null),

-- Leguminoase
('Fasole uscată', 333, 21, 1.2, 60, 15.2, 'leguminoase', false, null),
('Linte', 352, 25, 1, 63, 10.7, 'leguminoase', false, null),

-- Condimente
('Sare', 0, 0, 0, 0, 0, 'condimente', false, null),
('Boia dulce', 282, 14, 13, 54, 35, 'condimente', false, null),
('Dafin', 313, 7.6, 8.4, 48.7, 26.3, 'condimente', false, null),

-- Alimente INTERZISE conform OMS
('Băuturi carbogazoase', 42, 0, 0, 10.6, 0, 'bauturi', true, 'Interzise conform OMS 541/2025 - conțin zahăr adăugat excesiv'),
('Sucuri cu zahăr adăugat', 45, 0.1, 0, 11, 0, 'bauturi', true, 'Interzise conform OMS 541/2025'),
('Chipsuri', 536, 7, 35, 50, 4.4, 'snacks', true, 'Interzise conform OMS 541/2025 - conțin grăsimi trans și sare excesivă'),
('Ciocolată', 546, 5, 31, 60, 7, 'dulciuri', true, 'Interzise conform OMS 541/2025 - conținut ridicat de zahăr'),
('Napolitane', 480, 5, 20, 70, 1, 'dulciuri', true, 'Interzise conform OMS 541/2025'),
('Pateu de ficat', 319, 11, 28, 6, 0, 'carne', true, 'Interzise conform OMS 541/2025 - conținut ridicat de grăsimi saturate'),
('Cârnați', 301, 12, 25, 8, 0, 'carne', true, 'Interzise conform OMS 541/2025 - produs procesat'),
('Parizer', 250, 11, 20, 7, 0, 'carne', true, 'Interzise conform OMS 541/2025 - produs procesat'),
('Salam', 336, 13, 28, 8, 0, 'carne', true, 'Interzise conform OMS 541/2025 - produs procesat'),
('Ketchup', 112, 1.7, 0.1, 26, 0.3, 'condimente', true, 'Interzise conform OMS 541/2025 - zahăr adăugat'),
('Maioneză', 680, 1, 75, 0.6, 0, 'condimente', true, 'Interzise conform OMS 541/2025 - conținut ridicat de grăsimi');

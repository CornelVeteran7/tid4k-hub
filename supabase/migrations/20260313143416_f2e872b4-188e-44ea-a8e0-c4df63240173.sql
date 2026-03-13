
CREATE TABLE public.story_characters (
  id text PRIMARY KEY,
  name text NOT NULL,
  animal text NOT NULL,
  emoji text NOT NULL DEFAULT '🐾',
  description text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT 'ring-primary',
  bg_color text NOT NULL DEFAULT 'bg-primary/15',
  voice_description text,
  voice_id text,
  voice_provider text NOT NULL DEFAULT 'elevenlabs',
  voice_settings jsonb NOT NULL DEFAULT '{"stability": 0.5, "similarity_boost": 0.75, "style": 0.3, "speed": 1.0}'::jsonb,
  role_title text,
  gender text,
  vibe_style text,
  focus_areas text[],
  motto text,
  greeting text,
  backstory text,
  bio text,
  micro_intro text,
  team_role text,
  sort_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.story_characters ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read
CREATE POLICY "Anyone can read characters"
  ON public.story_characters FOR SELECT
  TO authenticated
  USING (true);

-- Only inky (superadmin) role can modify
CREATE POLICY "Inky can insert characters"
  ON public.story_characters FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'inky'));

CREATE POLICY "Inky can update characters"
  ON public.story_characters FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'inky'))
  WITH CHECK (public.has_role(auth.uid(), 'inky'));

CREATE POLICY "Inky can delete characters"
  ON public.story_characters FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'inky'));

-- Seed data
INSERT INTO public.story_characters (id, name, animal, emoji, description, color, bg_color, voice_description, voice_id, voice_settings, motto, role_title, gender, sort_order) VALUES
('inky', 'Inky', 'Hobotnic', '🦉', 'Prietenos, energic, curios, plin de entuziasm', 'ring-primary', 'bg-primary/15',
 'Voce caldă, lentă, cu ton grav și pauze dramatice.',
 'JBFqnCBsd6RMkjVDRZzb',
 '{"stability": 0.75, "similarity_boost": 0.75, "style": 0.3, "speed": 1.0}'::jsonb,
 'Dacă înveți din trecut, poți lumina viitorul.',
 'Investigatorul Tradițional și Tehnic', 'masculin', 0),
('vixie', 'Vixie', 'Vulpe', '🦊', 'Inteligent, creativ, ingenios, curios', 'ring-orange-500', 'bg-orange-500/15',
 'Voce vioi, rapidă, plină de entuziasm.',
 'pFZP5JQG7iQjIQuC4Bku',
 '{"stability": 0.75, "similarity_boost": 0.8, "style": 0.6, "speed": 1.1}'::jsonb,
 'Fiecare lucru poate fi refăcut, dacă ai curajul să-l privești altfel.',
 'Creatorul Ingenios', 'feminin', 1),
('poki', 'Poki', 'Peștișor mov', '🐟', 'Energic, aventuros, jucăuș, vesel', 'ring-cyan-500', 'bg-cyan-500/15',
 'Voce bubbly, comică, cu efecte sonore și glume.',
 'IKne3meq5aSn9XLyUdCD',
 '{"stability": 0.7, "similarity_boost": 0.7, "style": 0.7, "speed": 1.3}'::jsonb,
 'Curiozitatea e cheia tuturor descoperirilor.',
 'Aventurierul Jucăuș', 'masculin', 2),
('eli', 'Eli', 'Fluture', '🦋', 'Blând, protector, grijuliu, pozitiv', 'ring-violet-500', 'bg-violet-500/15',
 'Voce eterică, moale, perfectă pentru povești de noapte bună.',
 'Xb7hH8MSUJpSbSDYk0k2',
 '{"stability": 0.8, "similarity_boost": 0.75, "style": 0.5, "speed": 0.85}'::jsonb,
 'Frumusețea se naște atunci când împarți din lumină și altora.',
 'Protectorul Blând', 'feminin', 3),
('nuko', 'Nuko', 'Arici', '🦔', 'Calm, înțelept, răbdător, grijuliu', 'ring-amber-700', 'bg-amber-700/15',
 'Voce blândă, caldă, ca un prieten care te mângâie pe creștet.',
 'onwK4e9ZLuTAKqWW03F9',
 '{"stability": 0.85, "similarity_boost": 0.8, "style": 0.4, "speed": 0.9}'::jsonb,
 'Cunoașterea e o comoară pe care o strângi puțin câte puțin, ca un arici grijuliu.',
 'Înțeleptul Calm', 'masculin', 4);


CREATE TABLE public.external_workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  luna TEXT NOT NULL,
  personaj TEXT,
  titlu TEXT NOT NULL,
  descriere TEXT,
  ce_invatam TEXT,
  ce_primim TEXT,
  imagine_url TEXT,
  ordine INT DEFAULT 0,
  source_url TEXT DEFAULT 'https://infodisplay.ro/ateliere',
  scraped_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(titlu)
);

ALTER TABLE public.external_workshops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read external workshops"
  ON public.external_workshops
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage external workshops"
  ON public.external_workshops
  FOR ALL
  USING (true)
  WITH CHECK (true);

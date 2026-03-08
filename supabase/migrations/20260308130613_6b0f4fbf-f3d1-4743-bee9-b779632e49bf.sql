
-- Nutritional reference table (pre-populated ingredients)
CREATE TABLE public.nutritional_reference (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_name text NOT NULL,
  calories_per_100g numeric NOT NULL DEFAULT 0,
  protein numeric NOT NULL DEFAULT 0,
  fat numeric NOT NULL DEFAULT 0,
  carbs numeric NOT NULL DEFAULT 0,
  fiber numeric NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'general',
  is_banned boolean NOT NULL DEFAULT false,
  ban_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nutritional_reference ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_read_nutref" ON public.nutritional_reference FOR SELECT USING (true);
CREATE POLICY "admin_manage_nutref" ON public.nutritional_reference FOR ALL
  USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'))
  WITH CHECK (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- Menu weeks
CREATE TABLE public.menu_weeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  week_start_date date NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  age_group text NOT NULL DEFAULT '4-5',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, week_start_date)
);

ALTER TABLE public.menu_weeks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_read_mw" ON public.menu_weeks FOR SELECT TO authenticated
  USING (user_org_match(organization_id));
CREATE POLICY "anon_read_mw" ON public.menu_weeks FOR SELECT TO anon
  USING (status = 'published');
CREATE POLICY "staff_insert_mw" ON public.menu_weeks FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_mw" ON public.menu_weeks FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "admin_delete_mw" ON public.menu_weeks FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- Menu meals (each day+meal_type combo)
CREATE TABLE public.menu_meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_week_id uuid NOT NULL REFERENCES public.menu_weeks(id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 1 AND 5),
  meal_type text NOT NULL CHECK (meal_type IN ('mic_dejun', 'gustare_1', 'pranz', 'gustare_2')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(menu_week_id, day_of_week, meal_type)
);

ALTER TABLE public.menu_meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_mm" ON public.menu_meals FOR SELECT USING (true);
CREATE POLICY "staff_insert_mm" ON public.menu_meals FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_mm" ON public.menu_meals FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_mm" ON public.menu_meals FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- Menu dishes
CREATE TABLE public.menu_dishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_meal_id uuid NOT NULL REFERENCES public.menu_meals(id) ON DELETE CASCADE,
  dish_name text NOT NULL,
  ordine smallint NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_dishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_md" ON public.menu_dishes FOR SELECT USING (true);
CREATE POLICY "staff_insert_md" ON public.menu_dishes FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_md" ON public.menu_dishes FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_md" ON public.menu_dishes FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- Menu ingredients (linking dishes to nutritional reference)
CREATE TABLE public.menu_dish_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_dish_id uuid NOT NULL REFERENCES public.menu_dishes(id) ON DELETE CASCADE,
  ingredient_ref_id uuid REFERENCES public.nutritional_reference(id),
  ingredient_name text NOT NULL,
  quantity_grams numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_dish_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_mdi" ON public.menu_dish_ingredients FOR SELECT USING (true);
CREATE POLICY "staff_insert_mdi" ON public.menu_dish_ingredients FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_mdi" ON public.menu_dish_ingredients FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_mdi" ON public.menu_dish_ingredients FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

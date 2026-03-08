
-- Fix contributions_config INSERT to also check org match
DROP POLICY IF EXISTS "admin_insert_cc" ON public.contributions_config;
CREATE POLICY "admin_insert_cc" ON public.contributions_config FOR INSERT TO authenticated
  WITH CHECK (
    user_org_match(organization_id) AND (
      has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'secretara') OR
      has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky')
    )
  );

-- Fix contributions_monthly INSERT to also check org match  
DROP POLICY IF EXISTS "staff_insert_cm" ON public.contributions_monthly;
CREATE POLICY "staff_insert_cm" ON public.contributions_monthly FOR INSERT TO authenticated
  WITH CHECK (
    user_org_match(organization_id) AND (
      has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'secretara') OR
      has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky')
    )
  );

-- Add parent read policy for contributions_monthly (only their own children)
CREATE POLICY "parent_read_cm" ON public.contributions_monthly FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children c
      WHERE c.id = contributions_monthly.child_id AND c.parinte_id = auth.uid()
    )
  );

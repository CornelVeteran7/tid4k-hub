
-- Enhance construction_teams with leader_name and members JSONB
ALTER TABLE public.construction_teams 
  ADD COLUMN IF NOT EXISTS leader_name text,
  ADD COLUMN IF NOT EXISTS members jsonb DEFAULT '[]'::jsonb;

-- Add notes to team_assignments
ALTER TABLE public.construction_team_assignments
  ADD COLUMN IF NOT EXISTS notes text;

-- Add site_id to ssm_checklists for per-site tracking
ALTER TABLE public.ssm_checklists
  ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES public.construction_sites(id);

-- Add site identification fields (Legea 50/1991) to construction_sites
ALTER TABLE public.construction_sites
  ADD COLUMN IF NOT EXISTS beneficiar text,
  ADD COLUMN IF NOT EXISTS contractor text,
  ADD COLUMN IF NOT EXISTS numar_autorizatie text;

-- Add assigned_workers to construction_tasks
ALTER TABLE public.construction_tasks
  ADD COLUMN IF NOT EXISTS assigned_workers text[] DEFAULT '{}';

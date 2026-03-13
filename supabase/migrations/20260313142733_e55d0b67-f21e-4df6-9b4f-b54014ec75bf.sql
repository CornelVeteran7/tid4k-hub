
-- CRM Clients
CREATE TABLE public.crm_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'lead',
  health_score integer DEFAULT 50,
  owner_name text,
  onboarding_completed_at timestamptz,
  churned_at timestamptz,
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- CRM Contracts
CREATE TABLE public.crm_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.crm_clients(id) ON DELETE CASCADE NOT NULL,
  contract_type text NOT NULL DEFAULT 'subscription',
  amount_ron numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'RON',
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  renewal_date date,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- CRM Notes
CREATE TABLE public.crm_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.crm_clients(id) ON DELETE CASCADE NOT NULL,
  author_name text,
  content text NOT NULL,
  note_type text NOT NULL DEFAULT 'internal',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- CRM Tasks
CREATE TABLE public.crm_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.crm_clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date date,
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'todo',
  assigned_to text,
  task_type text NOT NULL DEFAULT 'custom',
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- RLS Policies (inky only)
ALTER TABLE public.crm_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inky_all_crm_clients" ON public.crm_clients FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'inky')) WITH CHECK (public.has_role(auth.uid(), 'inky'));
CREATE POLICY "inky_all_crm_contracts" ON public.crm_contracts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'inky')) WITH CHECK (public.has_role(auth.uid(), 'inky'));
CREATE POLICY "inky_all_crm_notes" ON public.crm_notes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'inky')) WITH CHECK (public.has_role(auth.uid(), 'inky'));
CREATE POLICY "inky_all_crm_tasks" ON public.crm_tasks FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'inky')) WITH CHECK (public.has_role(auth.uid(), 'inky'));

import { supabase } from '@/integrations/supabase/client';

// ===== Sites =====
export interface ConstructionSite {
  id: string;
  organization_id: string;
  nume: string;
  adresa: string;
  buget: number;
  status: string;
  progress_pct: number;
  data_start: string | null;
  data_estimare_finalizare: string | null;
  beneficiar: string | null;
  contractor: string | null;
  numar_autorizatie: string | null;
}

export async function getSites(orgId: string): Promise<ConstructionSite[]> {
  const { data, error } = await supabase
    .from('construction_sites')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at');
  if (error) throw error;
  return (data || []) as ConstructionSite[];
}

export async function upsertSite(site: Partial<ConstructionSite> & { organization_id: string }) {
  if (site.id) {
    const { id, ...rest } = site;
    const { error } = await supabase.from('construction_sites').update(rest).eq('id', id);
    if (error) throw error;
  } else {
    const { id, ...rest } = site;
    const { error } = await supabase.from('construction_sites').insert({ ...rest, nume: rest.nume || 'Șantier nou' });
    if (error) throw error;
  }
}

export async function deleteSite(id: string) {
  const { error } = await supabase.from('construction_sites').delete().eq('id', id);
  if (error) throw error;
}

// ===== Teams =====
export interface TeamMember {
  name: string;
  phone: string;
  role: string;
}

export interface ConstructionTeam {
  id: string;
  organization_id: string;
  nume: string;
  nr_membri: number;
  specialitate: string;
  leader_name: string | null;
  members: TeamMember[];
}

export async function getTeams(orgId: string): Promise<ConstructionTeam[]> {
  const { data, error } = await supabase
    .from('construction_teams')
    .select('*')
    .eq('organization_id', orgId)
    .order('nume');
  if (error) throw error;
  return (data || []).map((d: any) => ({
    ...d,
    members: Array.isArray(d.members) ? d.members : [],
  })) as ConstructionTeam[];
}

export async function upsertTeam(team: Partial<ConstructionTeam> & { organization_id: string }) {
  const { id, members, ...rest } = team as any;
  const payload = { ...rest, members: members ? JSON.parse(JSON.stringify(members)) : undefined };
  if (id) {
    const { error } = await supabase.from('construction_teams').update(payload).eq('id', id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('construction_teams').insert({ ...payload, nume: payload.nume || 'Echipă nouă' });
    if (error) throw error;
  }
}

export async function deleteTeam(id: string) {
  const { error } = await supabase.from('construction_teams').delete().eq('id', id);
  if (error) throw error;
}

// ===== Team Assignments =====
export interface TeamAssignment {
  id: string;
  team_id: string;
  site_id: string;
  saptamana_start: string;
  saptamana_end: string;
  notes: string | null;
}

export async function getAssignments(orgId: string): Promise<TeamAssignment[]> {
  const { data, error } = await supabase
    .from('construction_team_assignments')
    .select('*')
    .eq('organization_id', orgId)
    .order('saptamana_start');
  if (error) throw error;
  return (data || []) as TeamAssignment[];
}

export async function upsertAssignment(a: Partial<TeamAssignment> & { organization_id: string; team_id: string; site_id: string; saptamana_start: string; saptamana_end: string }) {
  if (a.id) {
    const { id, ...rest } = a;
    const { error } = await supabase.from('construction_team_assignments').update(rest).eq('id', id);
    if (error) throw error;
  } else {
    const { id, ...rest } = a;
    const { error } = await supabase.from('construction_team_assignments').insert(rest);
    if (error) throw error;
  }
}

export async function deleteAssignment(id: string) {
  const { error } = await supabase.from('construction_team_assignments').delete().eq('id', id);
  if (error) throw error;
}

// ===== Tasks (enhanced) =====
export interface ConstructionTask {
  id: string;
  organization_id: string;
  site_id: string | null;
  team_id: string | null;
  titlu: string;
  descriere: string;
  status: string;
  prioritate: string;
  assignee: string;
  assigned_workers: string[];
  locatie: string;
  data_limita: string | null;
  photo_url: string;
  completed_by: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function getTasks(orgId: string, siteId?: string): Promise<ConstructionTask[]> {
  let q = supabase
    .from('construction_tasks')
    .select('*')
    .eq('organization_id', orgId)
    .order('data_limita', { ascending: true, nullsFirst: false });
  if (siteId) q = q.eq('site_id', siteId);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map((d: any) => ({
    ...d,
    assigned_workers: d.assigned_workers || [],
  })) as ConstructionTask[];
}

export async function updateTask(id: string, update: Partial<ConstructionTask>) {
  const { error } = await supabase.from('construction_tasks').update({ ...update, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function createTask(task: Partial<ConstructionTask> & { organization_id: string; titlu: string }) {
  const { error } = await supabase.from('construction_tasks').insert(task);
  if (error) throw error;
}

// ===== Costs =====
export interface ConstructionCost {
  id: string;
  organization_id: string;
  site_id: string;
  categorie: string;
  descriere: string;
  cantitate: number;
  pret_unitar: number;
  total: number;
  furnizor: string;
  suma_platita: number;
  data_inregistrare: string;
}

export async function getCosts(orgId: string, siteId?: string): Promise<ConstructionCost[]> {
  let q = supabase
    .from('construction_costs')
    .select('*')
    .eq('organization_id', orgId)
    .order('data_inregistrare', { ascending: false });
  if (siteId) q = q.eq('site_id', siteId);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as ConstructionCost[];
}

export async function createCost(cost: Omit<ConstructionCost, 'id'>) {
  // Ensure total is computed
  const total = cost.cantitate * cost.pret_unitar;
  const { error } = await supabase.from('construction_costs').insert({ ...cost, total });
  if (error) throw error;
}

export async function deleteCost(id: string) {
  const { error } = await supabase.from('construction_costs').delete().eq('id', id);
  if (error) throw error;
}

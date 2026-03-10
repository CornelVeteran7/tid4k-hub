import { supabase } from '@/integrations/supabase/client';

/* ═══════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════ */

export interface LivingExpense {
  id: string;
  organization_id: string;
  month: number;
  year: number;
  category: 'utilitati' | 'fond_reparatii' | 'curatenie' | 'administrativ' | 'alte';
  description: string;
  amount: number;
  created_at: string;
}

export interface LivingApartment {
  id: string;
  organization_id: string;
  apartment_number: string;
  floor: number;
  owner_name: string;
  owner_user_id: string | null;
  balance: number;
  created_at: string;
}

export interface ExternalAdmin {
  id: string;
  organization_id: string;
  entity_name: string;
  entity_type: 'primarie' | 'politie' | 'anpc' | 'anaf' | 'other';
  user_id: string | null;
  can_post_announcements: boolean;
  created_at: string;
}

/* ═══════════════════════════════════════════════════
   Expenses CRUD
   ═══════════════════════════════════════════════════ */

export async function getExpenses(orgId: string, year?: number, month?: number): Promise<LivingExpense[]> {
  let q = supabase.from('living_expenses').select('*').eq('organization_id', orgId).order('year', { ascending: false }).order('month', { ascending: false }) as any;
  if (year) q = q.eq('year', year);
  if (month) q = q.eq('month', month);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as LivingExpense[];
}

export async function createExpense(e: Partial<LivingExpense> & { organization_id: string; month: number; year: number; amount: number }) {
  const { data, error } = await supabase.from('living_expenses').insert(e).select().single() as any;
  if (error) throw error;
  return data as LivingExpense;
}

export async function deleteExpense(id: string) {
  const { error } = await supabase.from('living_expenses').delete().eq('id', id) as any;
  if (error) throw error;
}

/* ═══════════════════════════════════════════════════
   Apartments CRUD
   ═══════════════════════════════════════════════════ */

export async function getApartments(orgId: string): Promise<LivingApartment[]> {
  const { data, error } = await supabase.from('living_apartments').select('*').eq('organization_id', orgId).order('apartment_number') as any;
  if (error) throw error;
  return (data || []) as LivingApartment[];
}

export async function createApartment(a: Partial<LivingApartment> & { organization_id: string; apartment_number: string }) {
  const { data, error } = await supabase.from('living_apartments').insert(a).select().single() as any;
  if (error) throw error;
  return data as LivingApartment;
}

export async function updateApartment(id: string, update: Partial<LivingApartment>) {
  const { error } = await supabase.from('living_apartments').update(update).eq('id', id) as any;
  if (error) throw error;
}

export async function deleteApartment(id: string) {
  const { error } = await supabase.from('living_apartments').delete().eq('id', id) as any;
  if (error) throw error;
}

/* ═══════════════════════════════════════════════════
   External Admins CRUD
   ═══════════════════════════════════════════════════ */

export async function getExternalAdmins(orgId: string): Promise<ExternalAdmin[]> {
  const { data, error } = await supabase.from('external_admins').select('*').eq('organization_id', orgId).order('entity_name') as any;
  if (error) throw error;
  return (data || []) as ExternalAdmin[];
}

export async function createExternalAdmin(ea: Partial<ExternalAdmin> & { organization_id: string; entity_name: string }) {
  const { data, error } = await supabase.from('external_admins').insert(ea).select().single() as any;
  if (error) throw error;
  return data as ExternalAdmin;
}

export async function deleteExternalAdmin(id: string) {
  const { error } = await supabase.from('external_admins').delete().eq('id', id) as any;
  if (error) throw error;
}

/* ═══════════════════════════════════════════════════
   Public queries (for display)
   ═══════════════════════════════════════════════════ */

export async function getMonthlyTotals(orgId: string, year: number, month: number): Promise<Record<string, number>> {
  const expenses = await getExpenses(orgId, year, month);
  const totals: Record<string, number> = {};
  expenses.forEach(e => {
    totals[e.category] = (totals[e.category] || 0) + Number(e.amount);
  });
  return totals;
}

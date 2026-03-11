import { supabase } from '@/integrations/supabase/client';

async function getUserOrgId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
  return profile?.organization_id || null;
}

// ── Parent Children with group info ──

export interface ParentChild {
  id: string;
  nume_prenume: string;
  group_id: string;
  group_name: string;
  group_slug: string;
}

export async function getParentChildren(parentId: string): Promise<ParentChild[]> {
  const { data, error } = await supabase
    .from('children')
    .select('id, nume_prenume, group_id, groups(id, nume, slug)')
    .eq('parinte_id', parentId)
    .order('nume_prenume');
  if (error) throw error;
  return (data || []).map(c => ({
    id: c.id,
    nume_prenume: c.nume_prenume,
    group_id: c.group_id || '',
    group_name: (c.groups as any)?.nume || '',
    group_slug: (c.groups as any)?.slug || '',
  }));
}

// ── Child Monthly Calendar ──

export interface CalendarDay {
  date: string;
  prezent: boolean | null; // null = no data
}

export async function getChildMonthlyCalendar(
  childId: string,
  month: number,
  year: number
): Promise<CalendarDay[]> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

  const { data } = await supabase
    .from('attendance')
    .select('data, prezent')
    .eq('child_id', childId)
    .gte('data', startDate)
    .lte('data', endDate)
    .order('data');

  const attMap = new Map((data || []).map(a => [a.data, a.prezent]));

  // Generate all days in month
  const daysInMonth = new Date(year, month, 0).getDate();
  const days: CalendarDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayOfWeek = new Date(dateStr).getDay();
    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    days.push({
      date: dateStr,
      prezent: attMap.has(dateStr) ? (attMap.get(dateStr) ?? false) : null,
    });
  }
  return days;
}

// ── Cash Declarations ──

export interface CashDeclaration {
  id: string;
  child_id: string;
  child_name?: string;
  group_name?: string;
  month: number;
  year: number;
  amount: number;
  notes: string | null;
  declared_by: string | null;
  declared_by_name?: string;
  confirmed_by: string | null;
  status: string;
  created_at: string;
  confirmed_at: string | null;
}

export async function declareCashPayment(
  childId: string,
  month: number,
  year: number,
  amount: number,
  notes: string
): Promise<void> {
  const orgId = await getUserOrgId();
  if (!orgId) throw new Error('No organization');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('contribution_cash_declarations').insert({
    organization_id: orgId,
    child_id: childId,
    month,
    year,
    amount,
    notes: notes || null,
    declared_by: user.id,
    status: 'declared',
  });
  if (error) throw error;
}

export async function getCashDeclarations(
  month: number,
  year: number,
  groupId?: string
): Promise<CashDeclaration[]> {
  const orgId = await getUserOrgId();
  if (!orgId) return [];

  let query = supabase
    .from('contribution_cash_declarations')
    .select('*, children(nume_prenume, group_id, groups(nume)), profiles!contribution_cash_declarations_declared_by_fkey(nume_prenume)')
    .eq('organization_id', orgId)
    .eq('month', month)
    .eq('year', year)
    .order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  let results = (data || []).map(d => ({
    id: d.id,
    child_id: d.child_id,
    child_name: (d.children as any)?.nume_prenume || '',
    group_name: (d.children as any)?.groups?.nume || '',
    month: d.month,
    year: d.year,
    amount: Number(d.amount),
    notes: d.notes,
    declared_by: d.declared_by,
    declared_by_name: (d.profiles as any)?.nume_prenume || '',
    confirmed_by: d.confirmed_by,
    status: d.status,
    created_at: d.created_at,
    confirmed_at: d.confirmed_at,
  }));

  if (groupId) {
    // Filter by group — need to check child's group_id
    const childGroupIds = new Set(
      (data || [])
        .filter(d => (d.children as any)?.group_id === groupId)
        .map(d => d.child_id)
    );
    results = results.filter(r => childGroupIds.has(r.child_id));
  }

  return results;
}

export async function confirmCashDeclaration(
  declarationId: string,
  confirmed: boolean
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('contribution_cash_declarations')
    .update({
      status: confirmed ? 'confirmed' : 'rejected',
      confirmed_by: user.id,
      confirmed_at: new Date().toISOString(),
    })
    .eq('id', declarationId);
  if (error) throw error;
}

// ── All Groups Contributions (cross-group for admin) ──

export interface AllGroupContribution {
  child_id: string;
  child_name: string;
  group_name: string;
  group_id: string;
  days_present: number;
  total: number;
  amount_paid: number;
  status: string;
  payment_method: string;
}

export async function getAllGroupsContributions(
  month: number,
  year: number,
  dailyRate: number
): Promise<AllGroupContribution[]> {
  const orgId = await getUserOrgId();
  if (!orgId) return [];

  // Get all children with groups
  const { data: children } = await supabase
    .from('children')
    .select('id, nume_prenume, group_id, groups(nume)')
    .eq('organization_id', orgId)
    .order('nume_prenume');

  if (!children || children.length === 0) return [];

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

  const { data: attendance } = await supabase
    .from('attendance')
    .select('child_id, prezent')
    .in('child_id', children.map(c => c.id))
    .gte('data', startDate)
    .lte('data', endDate)
    .eq('prezent', true);

  const countMap = new Map<string, number>();
  (attendance || []).forEach(a => {
    countMap.set(a.child_id, (countMap.get(a.child_id) || 0) + 1);
  });

  // Get payment statuses
  const { data: payments } = await supabase
    .from('contributions_monthly')
    .select('child_id, amount_paid, status, payment_method')
    .eq('organization_id', orgId)
    .eq('month', month)
    .eq('year', year);

  const paymentMap = new Map((payments || []).map(p => [p.child_id, p]));

  return children.map(c => {
    const days = countMap.get(c.id) || 0;
    const payment = paymentMap.get(c.id);
    return {
      child_id: c.id,
      child_name: c.nume_prenume,
      group_name: (c.groups as any)?.nume || '',
      group_id: c.group_id || '',
      days_present: days,
      total: days * dailyRate,
      amount_paid: Number(payment?.amount_paid || 0),
      status: payment?.status || 'pending',
      payment_method: (payment as any)?.payment_method || 'pending',
    };
  });
}

// ── Stripe Connect placeholder ──

export interface StripeConnectStatus {
  status: string;
  bank_name: string | null;
  stripe_account_id: string | null;
}

export async function getStripeConnectStatus(): Promise<StripeConnectStatus | null> {
  const orgId = await getUserOrgId();
  if (!orgId) return null;
  const { data } = await supabase
    .from('stripe_connect_accounts')
    .select('*')
    .eq('organization_id', orgId)
    .maybeSingle();
  if (!data) return null;
  return {
    status: data.status,
    bank_name: data.bank_name,
    stripe_account_id: data.stripe_account_id,
  };
}

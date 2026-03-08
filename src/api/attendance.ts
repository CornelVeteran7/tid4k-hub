import { supabase } from '@/integrations/supabase/client';
import type { AttendanceRecord, AttendanceDay, AttendanceStats, WeeklyAttendanceData, WeeklyAttendanceRecord } from '@/types';

// ── Helper: resolve group slug → UUID ──
async function resolveGroupId(slugOrId: string): Promise<string | null> {
  // Try slug first
  const { data: bySlug } = await supabase.from('groups').select('id').eq('slug', slugOrId).maybeSingle();
  if (bySlug) return bySlug.id;
  // Fall back to direct UUID
  const { data: byId } = await supabase.from('groups').select('id').eq('id', slugOrId).maybeSingle();
  return byId?.id || null;
}

async function getUserOrgId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
  return profile?.organization_id || null;
}

export async function getAttendance(grupa: string, data: string): Promise<AttendanceDay> {
  const groupId = await resolveGroupId(grupa);
  if (!groupId) return { data, records: [] };

  const { data: children } = await supabase
    .from('children')
    .select('id, nume_prenume')
    .eq('group_id', groupId)
    .order('nume_prenume');

  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('data', data)
    .in('child_id', (children || []).map(c => c.id));

  const attendanceMap = new Map((attendance || []).map(a => [a.child_id, a]));

  const records: AttendanceRecord[] = (children || []).map(c => ({
    child_id: c.id,
    nume_prenume_copil: c.nume_prenume,
    prezent: attendanceMap.get(c.id)?.prezent ?? false,
    observatii: attendanceMap.get(c.id)?.observatii ?? '',
  }));

  return { data, records };
}

export async function saveAttendance(grupa: string, data: string, records: AttendanceRecord[]): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  const rows = records.map(r => ({
    child_id: r.child_id,
    data,
    prezent: r.prezent,
    observatii: r.observatii,
    marked_by: user?.id || null,
  }));

  for (const row of rows) {
    await supabase.from('attendance').upsert(row, { onConflict: 'child_id,data' });
  }
}

export async function getAttendanceStats(grupa: string, luna: number, an: number): Promise<AttendanceStats> {
  const groupId = await resolveGroupId(grupa);
  if (!groupId) return { luna, an, zile: [], per_copil: [] };

  const { data: children } = await supabase
    .from('children')
    .select('id, nume_prenume')
    .eq('group_id', groupId);

  const startDate = `${an}-${String(luna).padStart(2, '0')}-01`;
  const endDate = `${an}-${String(luna).padStart(2, '0')}-31`;

  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .in('child_id', (children || []).map(c => c.id))
    .gte('data', startDate)
    .lte('data', endDate);

  const dayMap = new Map<string, { prezenti: number; absenti: number }>();
  (attendance || []).forEach(a => {
    const day = dayMap.get(a.data) || { prezenti: 0, absenti: 0 };
    if (a.prezent) day.prezenti++;
    else day.absenti++;
    dayMap.set(a.data, day);
  });
  const zile = Array.from(dayMap.entries()).map(([data, stats]) => ({ data, ...stats })).sort((a, b) => a.data.localeCompare(b.data));

  const childMap = new Map<string, { prezent: number; absent: number }>();
  (attendance || []).forEach(a => {
    const stats = childMap.get(a.child_id) || { prezent: 0, absent: 0 };
    if (a.prezent) stats.prezent++;
    else stats.absent++;
    childMap.set(a.child_id, stats);
  });

  const per_copil = (children || []).map(c => {
    const stats = childMap.get(c.id) || { prezent: 0, absent: 0 };
    const total = stats.prezent + stats.absent;
    return {
      id_copil: c.id,
      nume: c.nume_prenume,
      zile_prezent: stats.prezent,
      zile_absent: stats.absent,
      procent: total > 0 ? Math.round((stats.prezent / total) * 100) : 0,
    };
  });

  return { luna, an, zile, per_copil };
}

export async function getWeeklyAttendance(grupa: string, mondayDate: string): Promise<WeeklyAttendanceData> {
  const groupId = await resolveGroupId(grupa);
  const monday = new Date(mondayDate);
  const weekDates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
  const friday = weekDates[4];

  if (!groupId) return { saptamana_start: mondayDate, saptamana_end: friday, records: [] };

  const { data: children } = await supabase
    .from('children')
    .select('id, nume_prenume')
    .eq('group_id', groupId)
    .order('nume_prenume');

  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .in('child_id', (children || []).map(c => c.id))
    .gte('data', mondayDate)
    .lte('data', friday);

  const attMap = new Map<string, Map<string, { prezent: boolean; observatii: string }>>();
  (attendance || []).forEach(a => {
    if (!attMap.has(a.child_id)) attMap.set(a.child_id, new Map());
    attMap.get(a.child_id)!.set(a.data, { prezent: a.prezent ?? false, observatii: a.observatii || '' });
  });

  const records: WeeklyAttendanceRecord[] = (children || []).map(c => {
    const childAtt = attMap.get(c.id);
    return {
      id_copil: c.id,
      nume_prenume_copil: c.nume_prenume,
      zile: Object.fromEntries(weekDates.map(d => [d, childAtt?.get(d)?.prezent ?? false])),
      observatii_zile: Object.fromEntries(weekDates.map(d => [d, childAtt?.get(d)?.observatii || ''])),
    };
  });

  return { saptamana_start: mondayDate, saptamana_end: friday, records };
}

export async function saveWeeklyAttendance(grupa: string, data: WeeklyAttendanceData): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  for (const record of data.records) {
    for (const [date, prezent] of Object.entries(record.zile)) {
      const observatii = record.observatii_zile?.[date] || '';
      await supabase.from('attendance').upsert({
        child_id: record.id_copil,
        data: date,
        prezent,
        observatii,
        marked_by: user?.id || null,
      }, { onConflict: 'child_id,data' });
    }
  }
}

/**
 * Parent-specific: get attendance only for their own children
 */
export async function getParentChildAttendance(parentId: string, mondayDate: string): Promise<WeeklyAttendanceData> {
  const monday = new Date(mondayDate);
  const weekDates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
  const friday = weekDates[4];

  const { data: children } = await supabase
    .from('children')
    .select('id, nume_prenume')
    .eq('parinte_id', parentId)
    .order('nume_prenume');

  if (!children || children.length === 0) {
    return { saptamana_start: mondayDate, saptamana_end: friday, records: [] };
  }

  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .in('child_id', children.map(c => c.id))
    .gte('data', mondayDate)
    .lte('data', friday);

  const attMap = new Map<string, Map<string, { prezent: boolean; observatii: string }>>();
  (attendance || []).forEach(a => {
    if (!attMap.has(a.child_id)) attMap.set(a.child_id, new Map());
    attMap.get(a.child_id)!.set(a.data, { prezent: a.prezent ?? false, observatii: a.observatii || '' });
  });

  const records: WeeklyAttendanceRecord[] = children.map(c => {
    const childAtt = attMap.get(c.id);
    return {
      id_copil: c.id,
      nume_prenume_copil: c.nume_prenume,
      zile: Object.fromEntries(weekDates.map(d => [d, childAtt?.get(d)?.prezent ?? false])),
      observatii_zile: Object.fromEntries(weekDates.map(d => [d, childAtt?.get(d)?.observatii || ''])),
    };
  });

  return { saptamana_start: mondayDate, saptamana_end: friday, records };
}

// ── Contributions API ──

export async function getContributionConfig(): Promise<{ daily_rate: number; effective_from: string } | null> {
  const orgId = await getUserOrgId();
  if (!orgId) return null;
  const { data } = await supabase
    .from('contributions_config')
    .select('*')
    .eq('organization_id', orgId)
    .order('effective_from', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? { daily_rate: Number(data.daily_rate), effective_from: data.effective_from } : null;
}

export async function saveContributionConfig(dailyRate: number): Promise<void> {
  const orgId = await getUserOrgId();
  if (!orgId) return;
  await supabase.from('contributions_config').upsert({
    organization_id: orgId,
    daily_rate: dailyRate,
    effective_from: new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString(),
  }, { onConflict: 'organization_id,effective_from' });
}

export async function getContributions(
  groupSlugOrId: string,
  month: number,
  year: number,
  dailyRate: number
): Promise<{ children: { id: string; nume: string; zile_prezent: number; total: number }[]; grandTotal: number }> {
  const groupId = await resolveGroupId(groupSlugOrId);
  if (!groupId) return { children: [], grandTotal: 0 };

  const { data: children } = await supabase
    .from('children')
    .select('id, nume_prenume')
    .eq('group_id', groupId)
    .order('nume_prenume');

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

  const { data: attendance } = await supabase
    .from('attendance')
    .select('child_id, prezent')
    .in('child_id', (children || []).map(c => c.id))
    .gte('data', startDate)
    .lte('data', endDate)
    .eq('prezent', true);

  const countMap = new Map<string, number>();
  (attendance || []).forEach(a => {
    countMap.set(a.child_id, (countMap.get(a.child_id) || 0) + 1);
  });

  const result = (children || []).map(c => {
    const days = countMap.get(c.id) || 0;
    return { id: c.id, nume: c.nume_prenume, zile_prezent: days, total: days * dailyRate };
  });

  return { children: result, grandTotal: result.reduce((s, c) => s + c.total, 0) };
}

export async function saveMonthlyContributions(
  groupSlugOrId: string,
  month: number,
  year: number,
  dailyRate: number,
  rows: { id: string; zile_prezent: number; total: number }[]
): Promise<void> {
  const orgId = await getUserOrgId();
  if (!orgId) return;

  for (const row of rows) {
    await supabase.from('contributions_monthly').upsert({
      organization_id: orgId,
      child_id: row.id,
      month,
      year,
      days_present: row.zile_prezent,
      daily_rate: dailyRate,
      amount_calculated: row.total,
      status: 'pending',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'organization_id,child_id,month,year' });
  }
}

export async function getMonthlyContributions(
  month: number,
  year: number
): Promise<{ child_id: string; amount_paid: number; status: string }[]> {
  const orgId = await getUserOrgId();
  if (!orgId) return [];
  const { data } = await supabase
    .from('contributions_monthly')
    .select('child_id, amount_paid, status')
    .eq('organization_id', orgId)
    .eq('month', month)
    .eq('year', year);
  return (data || []).map(d => ({
    child_id: d.child_id,
    amount_paid: Number(d.amount_paid),
    status: d.status,
  }));
}

export async function updateContributionPayment(
  childId: string,
  month: number,
  year: number,
  amountPaid: number,
  status: string
): Promise<void> {
  const orgId = await getUserOrgId();
  if (!orgId) return;
  await supabase.from('contributions_monthly')
    .update({ amount_paid: amountPaid, status, updated_at: new Date().toISOString() })
    .eq('organization_id', orgId)
    .eq('child_id', childId)
    .eq('month', month)
    .eq('year', year);
}

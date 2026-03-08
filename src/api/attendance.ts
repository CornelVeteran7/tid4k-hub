import { supabase } from '@/integrations/supabase/client';
import type { AttendanceRecord, AttendanceDay, AttendanceStats, WeeklyAttendanceData, WeeklyAttendanceRecord } from '@/types';

async function getGroupId(slug: string): Promise<string | null> {
  const { data } = await supabase.from('groups').select('id').eq('slug', slug).single();
  return data?.id || null;
}

export async function getAttendance(grupa: string, data: string): Promise<AttendanceDay> {
  const groupId = await getGroupId(grupa);
  if (!groupId) return { data, records: [] };

  // Get children in this group
  const { data: children } = await supabase
    .from('children')
    .select('id, nume_prenume')
    .eq('group_id', groupId)
    .order('nume_prenume');

  // Get attendance for this date
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
  const groupId = await getGroupId(grupa);
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

  // Build daily stats
  const dayMap = new Map<string, { prezenti: number; absenti: number }>();
  (attendance || []).forEach(a => {
    const day = dayMap.get(a.data) || { prezenti: 0, absenti: 0 };
    if (a.prezent) day.prezenti++;
    else day.absenti++;
    dayMap.set(a.data, day);
  });
  const zile = Array.from(dayMap.entries()).map(([data, stats]) => ({ data, ...stats })).sort((a, b) => a.data.localeCompare(b.data));

  // Build per-child stats
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
  const groupId = await getGroupId(grupa);
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

  const attMap = new Map<string, Map<string, boolean>>();
  (attendance || []).forEach(a => {
    if (!attMap.has(a.child_id)) attMap.set(a.child_id, new Map());
    attMap.get(a.child_id)!.set(a.data, a.prezent);
  });

  const records: WeeklyAttendanceRecord[] = (children || []).map(c => ({
    id_copil: c.id,
    nume_prenume_copil: c.nume_prenume,
    zile: Object.fromEntries(weekDates.map(d => [d, attMap.get(c.id)?.get(d) ?? false])),
  }));

  return { saptamana_start: mondayDate, saptamana_end: friday, records };
}

export async function saveWeeklyAttendance(grupa: string, data: WeeklyAttendanceData): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  for (const record of data.records) {
    for (const [date, prezent] of Object.entries(record.zile)) {
      await supabase.from('attendance').upsert({
        child_id: record.id_copil,
        data: date,
        prezent,
        marked_by: user?.id || null,
      }, { onConflict: 'child_id,data' });
    }
  }
}

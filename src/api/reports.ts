import { supabase } from '@/integrations/supabase/client';
import type { ReportData } from '@/types';

export async function getAttendanceReport(grupa?: string, startDate?: string, endDate?: string): Promise<ReportData> {
  // Get attendance data
  let query = supabase.from('attendance').select('*, children(nume_prenume, group_id, groups(slug))');

  if (startDate) query = query.gte('data', startDate);
  if (endDate) query = query.lte('data', endDate);

  const { data: attendance } = await query;

  // Filter by group if specified
  let filtered = attendance || [];
  if (grupa) {
    filtered = filtered.filter(a => (a.children as any)?.groups?.slug === grupa);
  }

  // Build attendance trends
  const dayMap = new Map<string, { prezenti: number; absenti: number }>();
  filtered.forEach(a => {
    const day = dayMap.get(a.data) || { prezenti: 0, absenti: 0 };
    if (a.prezent) day.prezenti++;
    else day.absenti++;
    dayMap.set(a.data, day);
  });
  const attendance_trends = Array.from(dayMap.entries())
    .map(([data, stats]) => ({ data, ...stats }))
    .sort((a, b) => a.data.localeCompare(b.data));

  // Get documents by category
  const { data: docs } = await supabase.from('documents').select('categorie');
  const catMap = new Map<string, number>();
  (docs || []).forEach(d => {
    catMap.set(d.categorie || 'altele', (catMap.get(d.categorie || 'altele') || 0) + 1);
  });
  const documents_by_category = Array.from(catMap.entries()).map(([categorie, numar]) => ({ categorie, numar }));

  return {
    attendance_trends,
    user_activity: [], // Would need activity tracking
    documents_by_category,
  };
}

export async function getActivityReport(): Promise<ReportData> {
  return getAttendanceReport();
}

import { supabase } from '@/integrations/supabase/client';
import type { ScheduleCell, CancelarieTeacher } from '@/types';

export async function getSchedule(grupa: string): Promise<ScheduleCell[]> {
  const { data: group } = await supabase.from('groups').select('id').eq('slug', grupa).single();
  if (!group) return [];

  const { data, error } = await supabase
    .from('schedule')
    .select('*')
    .eq('group_id', group.id)
    .order('zi')
    .order('ora');

  if (error) throw error;

  return (data || []).map(s => ({
    id: s.id,
    zi: s.zi,
    ora: s.ora,
    materie: s.materie,
    profesor: s.profesor || '',
    culoare: s.culoare || '#E3F2FD',
  }));
}

export async function saveSchedule(grupa: string, cells: ScheduleCell[]): Promise<void> {
  const { data: group } = await supabase.from('groups').select('id').eq('slug', grupa).single();
  if (!group) return;

  // Delete existing schedule for this group
  await supabase.from('schedule').delete().eq('group_id', group.id);

  // Insert new cells
  if (cells.length > 0) {
    await supabase.from('schedule').insert(
      cells.map(c => ({
        group_id: group.id,
        zi: c.zi,
        ora: c.ora,
        materie: c.materie,
        profesor: c.profesor,
        culoare: c.culoare,
      }))
    );
  }
}

export async function getCancelarieTeachers(): Promise<CancelarieTeacher[]> {
  const { data: teachers, error } = await supabase
    .from('cancelarie_teachers')
    .select('*, cancelarie_activities(*)')
    .order('nume');

  if (error) throw error;

  return (teachers || []).map(t => ({
    id: t.id,
    nume: t.nume,
    avatar_url: t.avatar_url || '/placeholder.svg',
    qr_data: t.qr_data || '',
    absent_dates: (t.absent_dates || []).map((d: any) => String(d)),
    activitati: ((t.cancelarie_activities as any[]) || []).map((a: any) => ({
      data: a.data,
      descriere: a.descriere,
    })),
  }));
}

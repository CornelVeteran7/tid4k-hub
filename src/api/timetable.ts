import { supabase } from '@/integrations/supabase/client';

export interface TimetableConfig {
  id: string;
  organization_id: string;
  periods_per_day: number;
  period_duration_minutes: number;
  break_durations: number[];
  start_time: string;
}

export interface TimetableEntry {
  id?: string;
  organization_id?: string;
  class_id: string;
  day_of_week: number;
  period_number: number;
  subject: string;
  teacher_name: string;
  room: string;
}

export interface TeacherProfile {
  id: string;
  organization_id: string;
  name: string;
  avatar_url: string;
  qr_code_url: string;
  subjects: string[];
  bio: string;
}

export async function getTimetableConfig(orgId: string): Promise<TimetableConfig | null> {
  const { data, error } = await supabase
    .from('timetable_config')
    .select('*')
    .eq('organization_id', orgId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    organization_id: data.organization_id,
    periods_per_day: data.periods_per_day,
    period_duration_minutes: data.period_duration_minutes,
    break_durations: (data.break_durations as number[]) || [],
    start_time: data.start_time,
  };
}

export async function saveTimetableConfig(orgId: string, config: Partial<TimetableConfig>): Promise<void> {
  const { error } = await supabase
    .from('timetable_config')
    .upsert({
      organization_id: orgId,
      periods_per_day: config.periods_per_day || 7,
      period_duration_minutes: config.period_duration_minutes || 50,
      break_durations: config.break_durations || [10, 10, 20, 10, 10, 10],
      start_time: config.start_time || '08:00',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'organization_id' });
  if (error) throw error;
}

export async function getTimetableEntries(orgId: string, classId?: string): Promise<TimetableEntry[]> {
  let q = supabase
    .from('timetable_entries')
    .select('*')
    .eq('organization_id', orgId)
    .order('day_of_week')
    .order('period_number');
  if (classId) q = q.eq('class_id', classId);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map(e => ({
    id: e.id,
    organization_id: e.organization_id || undefined,
    class_id: e.class_id,
    day_of_week: e.day_of_week,
    period_number: e.period_number,
    subject: e.subject,
    teacher_name: e.teacher_name || '',
    room: e.room || '',
  }));
}

export async function saveTimetableEntries(orgId: string, classId: string, entries: TimetableEntry[]): Promise<void> {
  // Delete existing for this class
  await supabase.from('timetable_entries').delete().eq('organization_id', orgId).eq('class_id', classId);
  
  if (entries.length > 0) {
    const { error } = await supabase.from('timetable_entries').insert(
      entries.map(e => ({
        organization_id: orgId,
        class_id: classId,
        day_of_week: e.day_of_week,
        period_number: e.period_number,
        subject: e.subject,
        teacher_name: e.teacher_name,
        room: e.room,
      }))
    );
    if (error) throw error;
  }
}

export async function propagateTeacherRename(orgId: string, oldName: string, newName: string): Promise<number> {
  const { data } = await supabase
    .from('timetable_entries')
    .select('id')
    .eq('organization_id', orgId)
    .eq('teacher_name', oldName);
  
  if (data && data.length > 0) {
    await supabase
      .from('timetable_entries')
      .update({ teacher_name: newName })
      .eq('organization_id', orgId)
      .eq('teacher_name', oldName);
  }
  return data?.length || 0;
}

export async function getTeacherScheduleAcrossClasses(orgId: string, teacherName: string): Promise<TimetableEntry[]> {
  const { data, error } = await supabase
    .from('timetable_entries')
    .select('*')
    .eq('organization_id', orgId)
    .eq('teacher_name', teacherName)
    .order('day_of_week')
    .order('period_number');
  if (error) throw error;
  return (data || []) as TimetableEntry[];
}

export async function getRoomSchedule(orgId: string, room: string): Promise<TimetableEntry[]> {
  const { data, error } = await supabase
    .from('timetable_entries')
    .select('*')
    .eq('organization_id', orgId)
    .eq('room', room)
    .order('day_of_week')
    .order('period_number');
  if (error) throw error;
  return (data || []) as TimetableEntry[];
}

// Teacher profiles
export async function getTeacherProfiles(orgId: string): Promise<TeacherProfile[]> {
  const { data, error } = await supabase
    .from('teacher_profiles')
    .select('*')
    .eq('organization_id', orgId)
    .order('name');
  if (error) throw error;
  return (data || []) as TeacherProfile[];
}

export async function saveTeacherProfile(profile: Partial<TeacherProfile> & { organization_id: string; name: string }): Promise<void> {
  if (profile.id) {
    const { error } = await supabase.from('teacher_profiles').update(profile).eq('id', profile.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('teacher_profiles').insert(profile);
    if (error) throw error;
  }
}

export async function deleteTeacherProfile(id: string): Promise<void> {
  const { error } = await supabase.from('teacher_profiles').delete().eq('id', id);
  if (error) throw error;
}

/** Compute period start/end times from config */
export function computePeriodTimes(config: TimetableConfig): { start: string; end: string }[] {
  const times: { start: string; end: string }[] = [];
  const [startH, startM] = config.start_time.split(':').map(Number);
  let currentMinutes = startH * 60 + startM;
  
  for (let p = 0; p < config.periods_per_day; p++) {
    const endMinutes = currentMinutes + config.period_duration_minutes;
    times.push({
      start: `${Math.floor(currentMinutes / 60).toString().padStart(2, '0')}:${(currentMinutes % 60).toString().padStart(2, '0')}`,
      end: `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`,
    });
    const breakDur = config.break_durations[p] || 10;
    currentMinutes = endMinutes + breakDur;
  }
  return times;
}

/** Get current period number (1-based) or 0 if outside school hours */
export function getCurrentPeriod(config: TimetableConfig): { period: number; remaining: number; isBreak: boolean } {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const times = computePeriodTimes(config);
  
  for (let i = 0; i < times.length; i++) {
    const [sH, sM] = times[i].start.split(':').map(Number);
    const [eH, eM] = times[i].end.split(':').map(Number);
    const start = sH * 60 + sM;
    const end = eH * 60 + eM;
    
    if (nowMinutes >= start && nowMinutes < end) {
      return { period: i + 1, remaining: end - nowMinutes, isBreak: false };
    }
    // Check if in break after this period
    if (i < times.length - 1) {
      const [nsH, nsM] = times[i + 1].start.split(':').map(Number);
      const nextStart = nsH * 60 + nsM;
      if (nowMinutes >= end && nowMinutes < nextStart) {
        return { period: i + 1, remaining: nextStart - nowMinutes, isBreak: true };
      }
    }
  }
  return { period: 0, remaining: 0, isBreak: false };
}

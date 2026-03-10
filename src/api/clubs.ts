import { supabase } from '@/integrations/supabase/client';

export interface SchoolClub {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  advisor_teacher_id: string | null;
  logo_url: string;
  created_at: string;
  advisor_name?: string;
}

export interface ClubMembership {
  id: string;
  club_id: string;
  user_id: string;
  role: 'member' | 'leader';
  joined_at: string;
  club_name?: string;
}

export async function getClubs(orgId: string): Promise<SchoolClub[]> {
  const { data, error } = await supabase
    .from('school_clubs')
    .select('*, teacher_profiles(name)')
    .eq('organization_id', orgId)
    .order('name');
  if (error) throw error;
  return (data || []).map((c: any) => ({
    id: c.id,
    organization_id: c.organization_id,
    name: c.name,
    description: c.description || '',
    advisor_teacher_id: c.advisor_teacher_id,
    logo_url: c.logo_url || '',
    created_at: c.created_at,
    advisor_name: c.teacher_profiles?.name || '',
  }));
}

export async function createClub(club: { organization_id: string; name: string; description?: string; advisor_teacher_id?: string; logo_url?: string }): Promise<void> {
  const { error } = await supabase.from('school_clubs').insert(club);
  if (error) throw error;
}

export async function updateClub(id: string, update: Partial<SchoolClub>): Promise<void> {
  const { error } = await supabase.from('school_clubs').update(update).eq('id', id);
  if (error) throw error;
}

export async function deleteClub(id: string): Promise<void> {
  const { error } = await supabase.from('school_clubs').delete().eq('id', id);
  if (error) throw error;
}

export async function getMyMemberships(userId: string): Promise<ClubMembership[]> {
  const { data, error } = await supabase
    .from('club_memberships')
    .select('*, school_clubs(name)')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map((m: any) => ({
    id: m.id,
    club_id: m.club_id,
    user_id: m.user_id,
    role: m.role,
    joined_at: m.joined_at,
    club_name: m.school_clubs?.name || '',
  }));
}

export async function joinClub(clubId: string, userId: string, role: 'member' | 'leader' = 'member'): Promise<void> {
  const { error } = await supabase.from('club_memberships').insert({ club_id: clubId, user_id: userId, role });
  if (error) throw error;
}

export async function leaveClub(clubId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('club_memberships').delete().eq('club_id', clubId).eq('user_id', userId);
  if (error) throw error;
}

export async function getClubMembers(clubId: string): Promise<{ user_id: string; role: string; name: string }[]> {
  const { data, error } = await supabase
    .from('club_memberships')
    .select('user_id, role, profiles(nume_prenume)')
    .eq('club_id', clubId);
  if (error) throw error;
  return (data || []).map((m: any) => ({
    user_id: m.user_id,
    role: m.role,
    name: m.profiles?.nume_prenume || '',
  }));
}

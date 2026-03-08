import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/types';

export async function getUsers(): Promise<User[]> {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('nume_prenume');

  if (error) throw error;

  // Fetch roles and groups separately
  const userIds = (profiles || []).map(p => p.id);
  
  const { data: allRoles } = await supabase
    .from('user_roles')
    .select('user_id, role')
    .in('user_id', userIds);

  const { data: allUserGroups } = await supabase
    .from('user_groups')
    .select('user_id, groups(slug)')
    .in('user_id', userIds);

  const rolesMap = new Map<string, string[]>();
  (allRoles || []).forEach(r => {
    const arr = rolesMap.get(r.user_id) || [];
    arr.push(r.role);
    rolesMap.set(r.user_id, arr);
  });

  const groupsMap = new Map<string, string[]>();
  (allUserGroups || []).forEach((ug: any) => {
    const arr = groupsMap.get(ug.user_id) || [];
    if (ug.groups?.slug) arr.push(ug.groups.slug);
    groupsMap.set(ug.user_id, arr);
  });

  return (profiles || []).map(p => ({
    id: p.id,
    nume_prenume: p.nume_prenume || '',
    telefon: p.telefon || '',
    email: p.email || '',
    status: (rolesMap.get(p.id) || ['parinte']).join(','),
    grupe: groupsMap.get(p.id) || [],
  }));
}

export async function getUser(id: string): Promise<User> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', id);
  const { data: userGroups } = await supabase.from('user_groups').select('groups(slug)').eq('user_id', id);

  return {
    id: data.id,
    nume_prenume: data.nume_prenume || '',
    telefon: data.telefon || '',
    email: data.email || '',
    status: (roles || []).map((r: any) => r.role).join(',') || 'parinte',
    grupe: (userGroups || []).map((ug: any) => ug.groups?.slug).filter(Boolean),
  };
}

export async function createUser(user: Partial<User>): Promise<User> {
  throw new Error('User creation requires admin privileges. Use Supabase Dashboard.');
}

export async function updateUser(user: Partial<User>): Promise<User> {
  if (!user.id) throw new Error('User ID required');
  await supabase.from('profiles').update({
    nume_prenume: user.nume_prenume,
    telefon: user.telefon,
    email: user.email,
  }).eq('id', user.id);
  return user as User;
}

export async function deleteUser(id: string): Promise<void> {
  throw new Error('User deletion requires admin privileges. Use Supabase Dashboard.');
}

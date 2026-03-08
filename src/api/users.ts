import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/types';

export async function getUsers(): Promise<User[]> {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*, user_roles(role), user_groups(groups(slug))')
    .order('nume_prenume');

  if (error) throw error;

  return (profiles || []).map(p => ({
    id: p.id,
    nume_prenume: p.nume_prenume || '',
    telefon: p.telefon || '',
    email: p.email || '',
    status: ((p.user_roles as any[]) || []).map((r: any) => r.role).join(',') || 'parinte',
    grupe: ((p.user_groups as any[]) || []).map((ug: any) => ug.groups?.slug).filter(Boolean),
  }));
}

export async function getUser(id: string): Promise<User> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, user_roles(role), user_groups(groups(slug))')
    .eq('id', id)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    nume_prenume: data.nume_prenume || '',
    telefon: data.telefon || '',
    email: data.email || '',
    status: ((data.user_roles as any[]) || []).map((r: any) => r.role).join(',') || 'parinte',
    grupe: ((data.user_groups as any[]) || []).map((ug: any) => ug.groups?.slug).filter(Boolean),
  };
}

export async function createUser(user: Partial<User>): Promise<User> {
  // Can't create auth users from client — return partial for now
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
  // Can't delete auth users from client
  throw new Error('User deletion requires admin privileges. Use Supabase Dashboard.');
}

import { supabase } from '@/integrations/supabase/client';
import type { Child } from '@/types';

export async function getChildren(): Promise<Child[]> {
  const { data, error } = await supabase
    .from('children')
    .select('*, groups(slug, nume), profiles(nume_prenume, telefon, email)')
    .order('nume_prenume');
  if (error) throw error;
  return (data || []).map(c => ({
    id: c.id,
    nume_prenume: c.nume_prenume,
    group_id: (c.groups as any)?.slug || '',
    data_nasterii: c.data_nasterii || undefined,
    parinte_id: c.parinte_id || undefined,
    parinte_nume: (c.profiles as any)?.nume_prenume || undefined,
    parinte_telefon: (c.profiles as any)?.telefon || undefined,
    parinte_email: (c.profiles as any)?.email || undefined,
  }));
}

export async function getChildrenByGroup(grupa: string): Promise<Child[]> {
  const { data: group } = await supabase.from('groups').select('id').eq('slug', grupa).single();
  if (!group) return [];
  const { data, error } = await supabase
    .from('children')
    .select('*, profiles(nume_prenume, telefon, email)')
    .eq('group_id', group.id)
    .order('nume_prenume');
  if (error) throw error;
  return (data || []).map(c => ({
    id: c.id,
    nume_prenume: c.nume_prenume,
    group_id: grupa,
    data_nasterii: c.data_nasterii || undefined,
    parinte_id: c.parinte_id || undefined,
    parinte_nume: (c.profiles as any)?.nume_prenume || undefined,
    parinte_telefon: (c.profiles as any)?.telefon || undefined,
    parinte_email: (c.profiles as any)?.email || undefined,
  }));
}

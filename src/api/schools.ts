import { supabase } from '@/integrations/supabase/client';
import type { School } from '@/types';

export async function getSchools(): Promise<School[]> {
  const { data, error } = await supabase
    .from('schools')
    .select('*, groups(slug, nume)')
    .order('nume');

  if (error) throw error;

  return (data || []).map(s => ({
    id: s.id,
    nume: s.nume,
    adresa: s.adresa || '',
    tip: s.tip as 'gradinita' | 'scoala',
    logo_url: s.logo_url || '/placeholder.svg',
    grupe: ((s.groups as any[]) || []).map((g: any) => g.nume),
    nr_copii: s.nr_copii || 0,
    nr_profesori: s.nr_profesori || 0,
    activ: s.activ ?? true,
    sponsori_activi: (s.sponsori_activi || []).map(String),
  }));
}

export async function createSchool(data: Partial<School>): Promise<School> {
  const { data: school, error } = await supabase.from('schools').insert({
    nume: data.nume || '',
    adresa: data.adresa || '',
    tip: data.tip || 'gradinita',
    logo_url: data.logo_url || '/placeholder.svg',
    nr_copii: 0,
    nr_profesori: 0,
    activ: true,
  }).select().single();

  if (error) throw error;

  return {
    id: school.id,
    nume: school.nume,
    adresa: school.adresa || '',
    tip: school.tip as 'gradinita' | 'scoala',
    logo_url: school.logo_url || '/placeholder.svg',
    grupe: [],
    nr_copii: 0,
    nr_profesori: 0,
    activ: true,
    sponsori_activi: [],
  };
}

export async function updateSchool(data: Partial<School>): Promise<void> {
  if (!data.id) return;
  const { error } = await supabase.from('schools').update({
    nume: data.nume,
    adresa: data.adresa,
    tip: data.tip,
    logo_url: data.logo_url,
    activ: data.activ,
  }).eq('id', data.id);
  if (error) throw error;
}

export async function deleteSchool(id: string): Promise<void> {
  const { error } = await supabase.from('schools').delete().eq('id', id);
  if (error) throw error;
}

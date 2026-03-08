import { supabase } from '@/integrations/supabase/client';

export interface SurtitleShow {
  id: string;
  organization_id: string;
  titlu: string;
  data_spectacol: string;
  status: 'pregatire' | 'live' | 'terminat';
  current_block: number;
  created_at: string;
}

export interface SurtitleBlock {
  id: string;
  show_id: string;
  sequence_nr: number;
  text_ro: string;
  text_en: string;
  text_fr: string;
  nota_operator: string;
  created_at: string;
}

export async function getShows(orgId: string): Promise<SurtitleShow[]> {
  const { data, error } = await supabase
    .from('surtitle_shows')
    .select('*')
    .eq('organization_id', orgId)
    .order('data_spectacol', { ascending: false });
  if (error) throw error;
  return (data || []) as SurtitleShow[];
}

export async function createShow(s: { organization_id: string; titlu: string; data_spectacol: string }) {
  const { data, error } = await supabase.from('surtitle_shows').insert(s).select().single();
  if (error) throw error;
  return data as SurtitleShow;
}

export async function updateShow(id: string, update: Partial<SurtitleShow>) {
  const { error } = await supabase.from('surtitle_shows').update(update).eq('id', id);
  if (error) throw error;
}

export async function deleteShow(id: string) {
  const { error } = await supabase.from('surtitle_shows').delete().eq('id', id);
  if (error) throw error;
}

export async function getBlocks(showId: string): Promise<SurtitleBlock[]> {
  const { data, error } = await supabase
    .from('surtitle_blocks')
    .select('*')
    .eq('show_id', showId)
    .order('sequence_nr');
  if (error) throw error;
  return (data || []) as SurtitleBlock[];
}

export async function upsertBlock(block: Partial<SurtitleBlock> & { show_id: string }) {
  if (block.id) {
    const { id, ...rest } = block;
    const { error } = await supabase.from('surtitle_blocks').update(rest).eq('id', id);
    if (error) throw error;
  } else {
    const { id, ...rest } = block;
    const { error } = await supabase.from('surtitle_blocks').insert(rest);
    if (error) throw error;
  }
}

export async function deleteBlock(id: string) {
  const { error } = await supabase.from('surtitle_blocks').delete().eq('id', id);
  if (error) throw error;
}

export function subscribeToShow(showId: string, callback: (show: SurtitleShow) => void) {
  return supabase
    .channel(`show-${showId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'surtitle_shows',
      filter: `id=eq.${showId}`,
    }, (payload) => {
      callback(payload.new as SurtitleShow);
    })
    .subscribe();
}

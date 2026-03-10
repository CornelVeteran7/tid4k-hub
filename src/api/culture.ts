import { supabase } from '@/integrations/supabase/client';

/* ═══════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════ */

export interface CultureShow {
  id: string;
  organization_id: string;
  title: string;
  show_date: string;
  show_time: string;
  duration_minutes: number;
  acts: number;
  language: string;
  has_surtitles: boolean;
  status: 'draft' | 'upcoming' | 'live' | 'archived';
  synopsis: string;
  director_note: string;
  house_info: Record<string, any>;
  created_at: string;
}

export interface ShowCast {
  id: string;
  show_id: string;
  role_name: string;
  artist_name: string;
  artist_bio: string;
  artist_photo_url: string;
  sort_order: number;
}

export interface ShowSponsor {
  id: string;
  show_id: string;
  sponsor_name: string;
  sponsor_logo_url: string;
  sponsor_url: string;
  tier: 'main' | 'partner' | 'media';
  sort_order: number;
}

export interface CultureSurtitleBlock {
  id: string;
  show_id: string;
  sequence_number: number;
  text_ro: string;
  text_en: string;
  text_fr: string;
  text_de: string;
  stage_direction: string;
  act_number: number;
  scene_number: number;
}

export interface SurtitleLive {
  id: string;
  show_id: string;
  current_block_id: string | null;
  is_live: boolean;
  is_blackout: boolean;
  updated_at: string;
}

/* ═══════════════════════════════════════════════════
   Shows CRUD
   ═══════════════════════════════════════════════════ */

export async function getShows(orgId: string): Promise<CultureShow[]> {
  const { data, error } = await supabase
    .from('culture_shows')
    .select('*')
    .eq('organization_id', orgId)
    .order('show_date', { ascending: false }) as any;
  if (error) throw error;
  return (data || []) as CultureShow[];
}

export async function getShowById(showId: string): Promise<CultureShow | null> {
  const { data, error } = await supabase
    .from('culture_shows')
    .select('*')
    .eq('id', showId)
    .maybeSingle() as any;
  if (error) throw error;
  return data as CultureShow | null;
}

export async function createShow(show: Partial<CultureShow> & { organization_id: string; title: string; show_date: string }): Promise<CultureShow> {
  const { data, error } = await supabase.from('culture_shows').insert(show).select().single() as any;
  if (error) throw error;
  return data as CultureShow;
}

export async function updateShow(id: string, update: Partial<CultureShow>) {
  const { error } = await supabase.from('culture_shows').update(update).eq('id', id) as any;
  if (error) throw error;
}

export async function deleteShow(id: string) {
  const { error } = await supabase.from('culture_shows').delete().eq('id', id) as any;
  if (error) throw error;
}

/* ═══════════════════════════════════════════════════
   Cast CRUD
   ═══════════════════════════════════════════════════ */

export async function getCast(showId: string): Promise<ShowCast[]> {
  const { data, error } = await supabase
    .from('show_cast')
    .select('*')
    .eq('show_id', showId)
    .order('sort_order') as any;
  if (error) throw error;
  return (data || []) as ShowCast[];
}

export async function upsertCast(cast: Partial<ShowCast> & { show_id: string; artist_name: string }) {
  if (cast.id) {
    const { id, ...rest } = cast;
    const { error } = await supabase.from('show_cast').update(rest).eq('id', id) as any;
    if (error) throw error;
  } else {
    const { error } = await supabase.from('show_cast').insert(cast) as any;
    if (error) throw error;
  }
}

export async function deleteCast(id: string) {
  const { error } = await supabase.from('show_cast').delete().eq('id', id) as any;
  if (error) throw error;
}

/* ═══════════════════════════════════════════════════
   Sponsors CRUD
   ═══════════════════════════════════════════════════ */

export async function getShowSponsors(showId: string): Promise<ShowSponsor[]> {
  const { data, error } = await supabase
    .from('show_sponsors')
    .select('*')
    .eq('show_id', showId)
    .order('sort_order') as any;
  if (error) throw error;
  return (data || []) as ShowSponsor[];
}

export async function upsertShowSponsor(s: Partial<ShowSponsor> & { show_id: string; sponsor_name: string }) {
  if (s.id) {
    const { id, ...rest } = s;
    const { error } = await supabase.from('show_sponsors').update(rest).eq('id', id) as any;
    if (error) throw error;
  } else {
    const { error } = await supabase.from('show_sponsors').insert(s) as any;
    if (error) throw error;
  }
}

export async function deleteShowSponsor(id: string) {
  const { error } = await supabase.from('show_sponsors').delete().eq('id', id) as any;
  if (error) throw error;
}

/* ═══════════════════════════════════════════════════
   Surtitle Blocks CRUD
   ═══════════════════════════════════════════════════ */

export async function getSurtitleBlocks(showId: string): Promise<CultureSurtitleBlock[]> {
  const { data, error } = await supabase
    .from('culture_surtitle_blocks')
    .select('*')
    .eq('show_id', showId)
    .order('sequence_number') as any;
  if (error) throw error;
  return (data || []) as CultureSurtitleBlock[];
}

export async function upsertSurtitleBlock(block: Partial<CultureSurtitleBlock> & { show_id: string }) {
  if (block.id) {
    const { id, ...rest } = block;
    const { error } = await supabase.from('culture_surtitle_blocks').update(rest).eq('id', id) as any;
    if (error) throw error;
  } else {
    const { error } = await supabase.from('culture_surtitle_blocks').insert(block) as any;
    if (error) throw error;
  }
}

export async function deleteSurtitleBlock(id: string) {
  const { error } = await supabase.from('culture_surtitle_blocks').delete().eq('id', id) as any;
  if (error) throw error;
}

/* ═══════════════════════════════════════════════════
   Surtitle Live Control
   ═══════════════════════════════════════════════════ */

export async function getLiveState(showId: string): Promise<SurtitleLive | null> {
  const { data, error } = await supabase
    .from('surtitle_live')
    .select('*')
    .eq('show_id', showId)
    .maybeSingle() as any;
  if (error) throw error;
  return data as SurtitleLive | null;
}

export async function setLiveState(showId: string, update: Partial<SurtitleLive>) {
  // Upsert: try update first, then insert
  const { data: existing } = await supabase
    .from('surtitle_live')
    .select('id')
    .eq('show_id', showId)
    .maybeSingle() as any;

  if (existing) {
    const { error } = await supabase
      .from('surtitle_live')
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq('show_id', showId) as any;
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('surtitle_live')
      .insert({ show_id: showId, ...update, updated_at: new Date().toISOString() }) as any;
    if (error) throw error;
  }
}

export function subscribeToLive(showId: string, callback: (live: SurtitleLive) => void) {
  return supabase
    .channel(`surtitle-live-${showId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'surtitle_live',
      filter: `show_id=eq.${showId}`,
    }, (payload) => {
      callback(payload.new as SurtitleLive);
    })
    .subscribe();
}

/* ═══════════════════════════════════════════════════
   Public queries (for audience/program/display)
   ═══════════════════════════════════════════════════ */

export async function getShowsByOrg(orgSlug: string) {
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .single() as any;
  if (!org) return [];
  return getShows(org.id);
}

export async function getUpcomingShow(orgId: string): Promise<CultureShow | null> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('culture_shows')
    .select('*')
    .eq('organization_id', orgId)
    .in('status', ['upcoming', 'live'])
    .gte('show_date', today)
    .order('show_date')
    .limit(1) as any;
  if (error) throw error;
  return data?.[0] as CultureShow | null;
}

export async function getTonightShow(orgId: string): Promise<CultureShow | null> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('culture_shows')
    .select('*')
    .eq('organization_id', orgId)
    .eq('show_date', today)
    .in('status', ['upcoming', 'live'])
    .limit(1) as any;
  if (error) throw error;
  return data?.[0] as CultureShow | null;
}

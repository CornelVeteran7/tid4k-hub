import { supabase } from '@/integrations/supabase/client';
import type { Announcement } from '@/types';

export async function getAnnouncements(grupa?: string): Promise<Announcement[]> {
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase.from('announcements').select('*').order('created_at', { ascending: false });
  if (grupa) {
    query = query.or(`target.eq.${grupa},target.eq.scoala`);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Check read status
  let readIds = new Set<string>();
  if (user) {
    const { data: reads } = await supabase
      .from('announcement_reads')
      .select('announcement_id')
      .eq('user_id', user.id);
    readIds = new Set((reads || []).map(r => r.announcement_id));
  }

  return (data || []).map(a => ({
    id: a.id,
    titlu: a.titlu,
    continut: a.continut,
    data_upload: a.created_at,
    autor: a.autor_nume || '',
    prioritate: a.prioritate as 'normal' | 'urgent',
    target: a.target || 'scoala',
    citit: readIds.has(a.id),
    ascuns_banda: a.ascuns_banda || false,
    pozitie_banda: a.pozitie_banda || undefined,
  }));
}

export async function createAnnouncement(ann: Partial<Announcement>): Promise<Announcement> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('nume_prenume').eq('id', user?.id).single();

  const { data, error } = await supabase.from('announcements').insert({
    titlu: ann.titlu || '',
    continut: ann.continut || '',
    autor_id: user?.id || null,
    autor_nume: profile?.nume_prenume || ann.autor || '',
    prioritate: ann.prioritate || 'normal',
    target: ann.target || 'scoala',
    ascuns_banda: ann.ascuns_banda || false,
    pozitie_banda: ann.pozitie_banda || null,
  }).select().single();

  if (error) throw error;

  return {
    id: data.id,
    titlu: data.titlu,
    continut: data.continut,
    data_upload: data.created_at,
    autor: data.autor_nume || '',
    prioritate: data.prioritate as 'normal' | 'urgent',
    target: data.target || 'scoala',
    citit: false,
    ascuns_banda: data.ascuns_banda || false,
    pozitie_banda: data.pozitie_banda || undefined,
  };
}

export async function hideFromTicker(id: string): Promise<void> {
  await supabase.from('announcements').update({ ascuns_banda: true, pozitie_banda: null }).eq('id', id);
}

export async function restoreToTicker(id: string): Promise<void> {
  await supabase.from('announcements').update({ ascuns_banda: false }).eq('id', id);
}

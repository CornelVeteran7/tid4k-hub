import { supabase } from '@/integrations/supabase/client';
import type { DocumentItem } from '@/types';

export async function getDocuments(grupa: string, categorie?: string): Promise<DocumentItem[]> {
  const { data: group } = await supabase.from('groups').select('id').eq('slug', grupa).single();
  
  let query = supabase.from('documents').select('*').order('created_at', { ascending: false });
  if (group) query = query.eq('group_id', group.id);
  if (categorie) query = query.eq('categorie', categorie);

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map(d => ({
    id: d.id,
    nume_fisier: d.nume_fisier,
    tip_fisier: d.tip_fisier as DocumentItem['tip_fisier'],
    categorie: d.categorie as DocumentItem['categorie'],
    data_upload: d.created_at,
    uploadat_de: d.uploadat_de_nume || '',
    uploadat_de_id: d.uploadat_de_id || '',
    url: d.url,
    thumbnail_url: d.thumbnail_url || undefined,
    marime: d.marime || 0,
  }));
}

export async function uploadDocument(grupa: string, file: File, categorie: string): Promise<DocumentItem> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('nume_prenume').eq('id', user?.id).single();
  const { data: group } = await supabase.from('groups').select('id').eq('slug', grupa).single();

  // For now, store URL as placeholder — real file upload would use Supabase Storage
  const { data, error } = await supabase.from('documents').insert({
    nume_fisier: file.name,
    tip_fisier: file.name.split('.').pop() || 'pdf',
    categorie,
    uploadat_de_id: user?.id || null,
    uploadat_de_nume: profile?.nume_prenume || '',
    url: '/placeholder.svg',
    marime: file.size,
    group_id: group?.id || null,
  }).select().single();

  if (error) throw error;

  return {
    id: data.id,
    nume_fisier: data.nume_fisier,
    tip_fisier: data.tip_fisier as DocumentItem['tip_fisier'],
    categorie: data.categorie as DocumentItem['categorie'],
    data_upload: data.created_at,
    uploadat_de: data.uploadat_de_nume || '',
    uploadat_de_id: data.uploadat_de_id || '',
    url: data.url,
    marime: data.marime || 0,
  };
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase.from('documents').delete().eq('id', id);
  if (error) throw error;
}

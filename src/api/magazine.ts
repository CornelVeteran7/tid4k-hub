import { supabase } from '@/integrations/supabase/client';

export interface MagazineArticle {
  id: string;
  organization_id: string;
  titlu: string;
  continut: string;
  categorie: string;
  autor_id: string;
  autor_nume: string;
  photos: string[];
  status: 'draft' | 'review' | 'published' | 'rejected';
  reviewer_id: string | null;
  reviewer_comment: string;
  published_at: string | null;
  created_at: string;
}

export async function getArticles(orgId: string, statusFilter?: string): Promise<MagazineArticle[]> {
  let q = supabase
    .from('magazine_articles')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });
  if (statusFilter) q = q.eq('status', statusFilter);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as MagazineArticle[];
}

export async function createArticle(a: { organization_id: string; titlu: string; continut: string; categorie: string; autor_id: string; autor_nume: string; photos?: string[]; status?: string }) {
  const { error } = await supabase.from('magazine_articles').insert({ ...a, status: a.status || 'review' });
  if (error) throw error;
}

export async function updateArticle(id: string, update: Partial<MagazineArticle>) {
  const { error } = await supabase.from('magazine_articles').update({ ...update, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function deleteArticle(id: string) {
  const { error } = await supabase.from('magazine_articles').delete().eq('id', id);
  if (error) throw error;
}

import { supabase } from '@/integrations/supabase/client';

export interface FacebookSettings {
  page_id: string;
  token_status: 'activ' | 'expirat';
  posting_format: string;
}

export interface FacebookPost {
  id: string;
  content: string;
  posted_at: string;
  status: 'posted' | 'scheduled' | 'failed';
}

export async function getFacebookSettings(): Promise<FacebookSettings> {
  const { data } = await supabase.from('facebook_settings').select('*').limit(1).maybeSingle();
  return {
    page_id: data?.page_id || '',
    token_status: (data?.token_status as 'activ' | 'expirat') || 'activ',
    posting_format: data?.posting_format || 'text+image',
  };
}

export async function postToFacebook(content: string, imageUrl?: string): Promise<FacebookPost> {
  const { data, error } = await supabase.from('facebook_posts').insert({
    content,
    status: 'posted',
  }).select().single();

  if (error) throw error;

  return {
    id: data.id,
    content: data.content,
    posted_at: data.posted_at || data.created_at,
    status: data.status as FacebookPost['status'],
  };
}

export async function getPostLog(): Promise<FacebookPost[]> {
  const { data } = await supabase
    .from('facebook_posts')
    .select('*')
    .order('posted_at', { ascending: false });

  return (data || []).map(p => ({
    id: p.id,
    content: p.content,
    posted_at: p.posted_at || p.created_at,
    status: p.status as FacebookPost['status'],
  }));
}

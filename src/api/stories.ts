import { supabase } from '@/integrations/supabase/client';
import type { Story } from '@/types';

export async function getStories(): Promise<Story[]> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Get favorites
  let favIds = new Set<string>();
  if (user) {
    const { data: favs } = await supabase
      .from('story_favorites')
      .select('story_id')
      .eq('user_id', user.id);
    favIds = new Set((favs || []).map(f => f.story_id));
  }

  return (data || []).map(s => {
    const hasVideo = !!(s as any).video_url;
    const hasAudio = !!s.audio_url;
    const media_type: Story['media_type'] = hasVideo ? 'video' : hasAudio ? 'audio' : 'text';
    return {
      id: s.id,
      titlu: s.titlu,
      continut: s.continut,
      categorie: s.categorie as Story['categorie'],
      varsta: s.varsta as Story['varsta'],
      thumbnail: s.thumbnail || undefined,
      audio_url: s.audio_url || undefined,
      video_url: (s as any).video_url || undefined,
      media_type,
      favorit: favIds.has(s.id),
    };
  });
}

export async function createStory(story: Partial<Story>): Promise<Story> {
  const { data, error } = await supabase.from('stories').insert({
    titlu: story.titlu || '',
    continut: story.continut || '',
    categorie: story.categorie || 'educative',
    varsta: story.varsta || '3-5',
    thumbnail: story.thumbnail || null,
    audio_url: story.audio_url || null,
  }).select().single();

  if (error) throw error;

  return {
    id: data.id,
    titlu: data.titlu,
    continut: data.continut,
    categorie: data.categorie as Story['categorie'],
    varsta: data.varsta as Story['varsta'],
    thumbnail: data.thumbnail || undefined,
    audio_url: data.audio_url || undefined,
    favorit: false,
  };
}

export async function generateTTS(id: string): Promise<{ audio_url: string }> {
  // TTS not yet implemented — would be an Edge Function
  return { audio_url: '' };
}

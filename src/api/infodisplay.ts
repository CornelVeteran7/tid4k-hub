import { supabase } from '@/integrations/supabase/client';
import type { InfodisplayConfig } from '@/types';

export async function getInfodisplayContent(): Promise<InfodisplayConfig> {
  const [
    { data: panels },
    { data: ticker },
    { data: qr },
    { data: settings },
  ] = await Promise.all([
    supabase.from('infodisplay_panels').select('*').order('ordine'),
    supabase.from('infodisplay_ticker').select('*').order('ordine'),
    supabase.from('infodisplay_qr').select('*'),
    supabase.from('infodisplay_settings').select('*').limit(1).single(),
  ]);

  return {
    panels: (panels || []).map(p => ({
      id: p.id,
      tip: p.tip,
      continut: p.continut,
      durata: p.durata || 8,
      ordine: p.ordine || 1,
    })),
    ticker_messages: (ticker || []).map(t => t.mesaj),
    qr_codes: (qr || []).map(q => ({ label: q.label, url: q.url })),
    transition: (settings?.transition as 'fade' | 'slide') || 'fade',
  };
}

export async function generateVideo(type: string): Promise<{ video_url: string }> {
  // Would be an Edge Function
  return { video_url: '' };
}

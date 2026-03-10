import { supabase } from '@/integrations/supabase/client';

/**
 * Get or create today's daily token for an org.
 * Called from PublicDisplay to generate QR codes.
 */
export async function getDailyToken(orgId: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('get_or_create_daily_token', {
    _org_id: orgId,
  });

  if (error) {
    console.error('Failed to get daily token:', error);
    return null;
  }

  return data as string;
}

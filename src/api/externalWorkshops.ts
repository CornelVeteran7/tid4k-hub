import { supabase } from '@/integrations/supabase/client';

export interface ExternalWorkshop {
  id: string;
  luna: string;
  personaj: string;
  titlu: string;
  descriere: string;
  ce_invatam: string;
  ce_primim: string;
  imagine_url: string;
  ordine: number;
  scraped_at: string;
}

const ROMANIAN_MONTHS: Record<number, string> = {
  0: 'Ianuarie', 1: 'Februarie', 2: 'Martie', 3: 'Aprilie',
  4: 'Mai', 5: 'Iunie', 6: 'Iulie', 7: 'August',
  8: 'Septembrie', 9: 'Octombrie', 10: 'Noiembrie', 11: 'Decembrie',
};

export function getCurrentMonthName(): string {
  return ROMANIAN_MONTHS[new Date().getMonth()];
}

export async function getExternalWorkshops(): Promise<ExternalWorkshop[]> {
  const { data, error } = await supabase
    .from('external_workshops')
    .select('*')
    .order('ordine', { ascending: true }) as any;

  if (error) throw error;
  return (data || []) as ExternalWorkshop[];
}

export async function refreshWorkshopsIfStale(): Promise<void> {
  // Check the latest scraped_at
  const { data } = await supabase
    .from('external_workshops')
    .select('scraped_at')
    .order('scraped_at', { ascending: false })
    .limit(1) as any;

  const lastScraped = data?.[0]?.scraped_at;
  const isStale = !lastScraped || 
    (Date.now() - new Date(lastScraped).getTime()) > 24 * 60 * 60 * 1000;

  if (isStale) {
    // Fire and forget — don't block UI
    supabase.functions.invoke('scrape-workshops').catch(err => {
      console.warn('Background workshop refresh failed:', err);
    });
  }
}

export function getCurrentMonthWorkshop(workshops: ExternalWorkshop[]): ExternalWorkshop | null {
  const currentMonth = getCurrentMonthName();
  return workshops.find(w => w.luna === currentMonth) || null;
}

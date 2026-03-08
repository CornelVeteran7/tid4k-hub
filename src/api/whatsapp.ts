import { supabase } from '@/integrations/supabase/client';

export interface WhatsappMapping {
  id: string;
  grupa: string;
  whatsapp_group: string;
  consent: boolean;
  sync_type: 'bidirectional' | 'one-way';
}

export async function getWhatsappMappings(): Promise<WhatsappMapping[]> {
  const { data, error } = await (supabase as any).from('whatsapp_mappings').select('*');
  if (error) throw error;
  return (data || []).map(m => ({
    id: m.id,
    grupa: m.grupa,
    whatsapp_group: m.whatsapp_group,
    consent: m.consent ?? true,
    sync_type: m.sync_type as 'bidirectional' | 'one-way',
  }));
}

export async function createMapping(mapping: Partial<WhatsappMapping>): Promise<WhatsappMapping> {
  const { data, error } = await (supabase as any).from('whatsapp_mappings').insert({
    grupa: mapping.grupa || '',
    whatsapp_group: mapping.whatsapp_group || '',
    consent: mapping.consent ?? true,
    sync_type: mapping.sync_type || 'bidirectional',
  }).select().single();

  if (error) throw error;
  return {
    id: data.id,
    grupa: data.grupa,
    whatsapp_group: data.whatsapp_group,
    consent: data.consent ?? true,
    sync_type: data.sync_type as 'bidirectional' | 'one-way',
  };
}

export async function syncStatus(): Promise<{ status: string; last_sync: string }> {
  // Would need real sync tracking
  return { status: 'activ', last_sync: new Date().toISOString() };
}

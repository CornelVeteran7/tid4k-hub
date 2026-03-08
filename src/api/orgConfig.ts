import { supabase } from '@/integrations/supabase/client';

export interface OrgConfigRow {
  id: string;
  organization_id: string;
  config_key: string;
  config_value: Record<string, any>;
}

export async function getOrgConfig(organizationId: string): Promise<OrgConfigRow[]> {
  const { data, error } = await supabase
    .from('org_config')
    .select('*')
    .eq('organization_id', organizationId);
  if (error) throw error;
  return (data || []) as OrgConfigRow[];
}

export async function getOrgConfigByKey(organizationId: string, key: string): Promise<Record<string, any> | null> {
  const { data, error } = await supabase
    .from('org_config')
    .select('config_value')
    .eq('organization_id', organizationId)
    .eq('config_key', key)
    .maybeSingle();
  if (error) throw error;
  return (data?.config_value as Record<string, any>) || null;
}

export async function upsertOrgConfig(organizationId: string, key: string, value: Record<string, any>): Promise<void> {
  const { error } = await supabase
    .from('org_config')
    .upsert({
      organization_id: organizationId,
      config_key: key,
      config_value: value,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'organization_id,config_key' });
  if (error) throw error;
}

export async function updateOrganization(id: string, data: {
  name?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  slug?: string;
  nfc_enabled?: boolean;
}): Promise<void> {
  const { error } = await supabase.from('organizations').update(data).eq('id', id);
  if (error) throw error;
}

export async function getOrganization(id: string) {
  const { data, error } = await supabase.from('organizations').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

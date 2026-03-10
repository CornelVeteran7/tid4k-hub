import { supabase } from '@/integrations/supabase/client';

export interface SponsorPolicy {
  id: string;
  organization_id: string;
  max_sponsor_share_percent: number;
  allowed_categories: string[];
  blocked_categories: string[];
  requires_approval: boolean;
  no_cameras_declaration: boolean;
  created_at: string;
}

export async function getSponsorPolicy(orgId: string): Promise<SponsorPolicy | null> {
  const { data, error } = await supabase
    .from('sponsor_policies')
    .select('*')
    .eq('organization_id', orgId)
    .maybeSingle() as any;
  if (error) throw error;
  return data as SponsorPolicy | null;
}

export async function upsertSponsorPolicy(orgId: string, policy: Partial<SponsorPolicy>) {
  const existing = await getSponsorPolicy(orgId);
  if (existing) {
    const { error } = await supabase
      .from('sponsor_policies')
      .update(policy)
      .eq('organization_id', orgId) as any;
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('sponsor_policies')
      .insert({ organization_id: orgId, ...policy }) as any;
    if (error) throw error;
  }
}

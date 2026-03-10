import { supabase } from '@/integrations/supabase/client';

export interface WebsiteConfig {
  id: string;
  organization_id: string;
  is_published: boolean;
  custom_domain: string;
  template: string;
  pages_enabled: string[];
  custom_css: string;
  hero_title: string;
  hero_subtitle: string;
  created_at: string;
}

export async function getWebsiteConfig(orgId: string): Promise<WebsiteConfig | null> {
  const { data, error } = await supabase
    .from('website_config')
    .select('*')
    .eq('organization_id', orgId)
    .maybeSingle() as any;
  if (error) throw error;
  return data as WebsiteConfig | null;
}

export async function upsertWebsiteConfig(orgId: string, config: Partial<WebsiteConfig>) {
  const existing = await getWebsiteConfig(orgId);
  if (existing) {
    const { error } = await supabase
      .from('website_config')
      .update(config)
      .eq('organization_id', orgId) as any;
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('website_config')
      .insert({ organization_id: orgId, ...config }) as any;
    if (error) throw error;
  }
}

export async function getPublishedWebsite(orgSlug: string): Promise<{ config: WebsiteConfig; org: any } | null> {
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', orgSlug)
    .single();
  if (!org) return null;

  const { data: config } = await supabase
    .from('website_config')
    .select('*')
    .eq('organization_id', org.id)
    .eq('is_published', true)
    .maybeSingle() as any;
  if (!config) return null;

  return { config: config as WebsiteConfig, org };
}

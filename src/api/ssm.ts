import { supabase } from '@/integrations/supabase/client';

export interface SSMTemplate {
  id: string;
  organization_id: string;
  nume: string;
  items: { text: string }[];
  created_at: string;
}

export interface SSMChecklist {
  id: string;
  organization_id: string;
  template_id: string;
  data: string;
  completat_de: string;
  completat_de_id: string;
  items: { text: string; checked: boolean }[];
  semnatura_data: string;
  status: 'incomplete' | 'completed';
  completed_at: string | null;
  created_at: string;
}

export async function getTemplates(orgId: string): Promise<SSMTemplate[]> {
  const { data, error } = await supabase
    .from('ssm_templates')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at');
  if (error) throw error;
  return (data || []).map((d: any) => ({ ...d, items: d.items || [] })) as SSMTemplate[];
}

export async function createTemplate(t: { organization_id: string; nume: string; items: { text: string }[] }) {
  const { error } = await supabase.from('ssm_templates').insert(t);
  if (error) throw error;
}

export async function deleteTemplate(id: string) {
  const { error } = await supabase.from('ssm_templates').delete().eq('id', id);
  if (error) throw error;
}

export async function getChecklists(orgId: string): Promise<SSMChecklist[]> {
  const { data, error } = await supabase
    .from('ssm_checklists')
    .select('*')
    .eq('organization_id', orgId)
    .order('data', { ascending: false });
  if (error) throw error;
  return (data || []).map((d: any) => ({ ...d, items: d.items || [] })) as SSMChecklist[];
}

export async function createChecklist(c: { organization_id: string; template_id: string; data: string; completat_de: string; completat_de_id: string; items: { text: string; checked: boolean }[] }) {
  const { error } = await supabase.from('ssm_checklists').insert(c);
  if (error) throw error;
}

export async function updateChecklist(id: string, update: Partial<SSMChecklist>) {
  const { error } = await supabase.from('ssm_checklists').update(update).eq('id', id);
  if (error) throw error;
}

import { supabase } from '@/integrations/supabase/client';
import type { Sponsor, SponsorPromo, SponsorPlan, SponsorCampaign, SponsorStats, CampaignStatus, RotationConfig } from '@/types/sponsor';

// ===== API Functions =====
export async function getSponsors(): Promise<Sponsor[]> {
  const { data, error } = await supabase.from('sponsors').select('*').order('nume');
  if (error) throw error;
  return (data || []).map(s => ({
    id: s.id, nume: s.nume, logo_url: s.logo_url || '', website: s.website || '',
    culoare_brand: s.culoare_brand || '#000000', descriere: s.descriere || '',
    activ: s.activ ?? true, data_start: s.data_start || '', data_expirare: s.data_expirare || '', plan: s.plan || 'Basic',
  }));
}

export async function getSponsor(id: string): Promise<Sponsor | null> {
  const { data } = await supabase.from('sponsors').select('*').eq('id', id).single();
  if (!data) return null;
  return { id: data.id, nume: data.nume, logo_url: data.logo_url || '', website: data.website || '', culoare_brand: data.culoare_brand || '#000000', descriere: data.descriere || '', activ: data.activ ?? true, data_start: data.data_start || '', data_expirare: data.data_expirare || '', plan: data.plan || 'Basic' };
}

export async function getActivePromos(tip?: SponsorPromo['tip'], schoolId?: string): Promise<SponsorPromo[]> {
  let query = supabase.from('sponsor_promos').select('*, sponsors(*)').eq('activ', true).order('prioritate');
  if (tip) query = query.eq('tip', tip);
  const { data } = await query;
  let promos = (data || []).map(p => {
    const s = p.sponsors as any;
    return {
      id: p.id, sponsor_id: p.sponsor_id, sponsor_nume: s?.nume, sponsor_logo: s?.logo_url, sponsor_culoare: s?.culoare_brand,
      tip: p.tip as any, titlu: p.titlu, descriere: p.descriere || '', link_url: p.link_url || '', cta_text: p.cta_text || '',
      prioritate: p.prioritate || 1, activ: p.activ ?? true, scoli_target: p.scoli_target || ['all'],
      stil_card: p.stil_card as any, stil_inky: p.stil_inky as any, stil_ticker: p.stil_ticker as any,
    };
  });
  if (schoolId) promos = promos.filter(p => p.scoli_target.includes('all') || p.scoli_target.includes(schoolId));
  return promos;
}

export async function getSponsorPlans(): Promise<SponsorPlan[]> {
  const { data } = await supabase.from('sponsor_plans').select('*');
  return (data || []).map(p => ({
    id: p.id, nume_plan: p.nume_plan, pret: p.pret || 0, include_dashboard: p.include_dashboard ?? true,
    include_infodisplay: p.include_infodisplay ?? false, include_ticker: p.include_ticker ?? true,
    include_inky: p.include_inky ?? false, include_custom_inky: p.include_custom_inky ?? false,
    numar_scoli: p.numar_scoli || 5, descriere: p.descriere || '',
  }));
}

export async function createSponsor(data: Omit<Sponsor, 'id'>): Promise<Sponsor> {
  const { data: s, error } = await supabase.from('sponsors').insert(data).select().single();
  if (error) throw error;
  return { ...data, id: s.id };
}

export async function updateSponsor(id: string, data: Partial<Sponsor>): Promise<Sponsor> {
  const { data: s, error } = await supabase.from('sponsors').update(data).eq('id', id).select().single();
  if (error) throw error;
  return { id: s.id, nume: s.nume, logo_url: s.logo_url || '', website: s.website || '', culoare_brand: s.culoare_brand || '', descriere: s.descriere || '', activ: s.activ ?? true, data_start: s.data_start || '', data_expirare: s.data_expirare || '', plan: s.plan || 'Basic' };
}

export async function createPromo(data: Omit<SponsorPromo, 'id'>): Promise<SponsorPromo> {
  const { data: p, error } = await supabase.from('sponsor_promos').insert({
    sponsor_id: data.sponsor_id, tip: data.tip, titlu: data.titlu, descriere: data.descriere,
    link_url: data.link_url, cta_text: data.cta_text, prioritate: data.prioritate, activ: data.activ,
    scoli_target: data.scoli_target, stil_card: data.stil_card as any, stil_inky: data.stil_inky as any, stil_ticker: data.stil_ticker as any,
  }).select().single();
  if (error) throw error;
  return { ...data, id: p.id };
}

export async function updatePromo(id: string, data: Partial<SponsorPromo>): Promise<SponsorPromo> {
  const { data: p, error } = await supabase.from('sponsor_promos').update(data as any).eq('id', id).select().single();
  if (error) throw error;
  return { id: p.id, sponsor_id: p.sponsor_id, tip: p.tip as any, titlu: p.titlu, descriere: p.descriere || '', link_url: p.link_url || '', cta_text: p.cta_text || '', prioritate: p.prioritate || 1, activ: p.activ ?? true, scoli_target: p.scoli_target || ['all'], stil_card: p.stil_card as any, stil_inky: p.stil_inky as any, stil_ticker: p.stil_ticker as any };
}

export async function deletePromo(id: string): Promise<void> {
  await supabase.from('sponsor_promos').delete().eq('id', id);
}

export async function getSponsorCampaigns(sponsorId: string): Promise<SponsorCampaign[]> {
  const { data } = await supabase.from('sponsor_campaigns').select('*, sponsors(*)').eq('sponsor_id', sponsorId).order('created_at', { ascending: false });
  return (data || []).map(c => {
    const s = c.sponsors as any;
    return { id: c.id, sponsor_id: c.sponsor_id, sponsor_nume: s?.nume, sponsor_logo: s?.logo_url, sponsor_culoare: s?.culoare_brand, tip: c.tip as any, titlu: c.titlu, descriere: c.descriere || '', link_url: c.link_url || '', cta_text: c.cta_text || '', prioritate: c.prioritate || 1, scoli_target: c.scoli_target || ['all'], status: c.status as CampaignStatus, data_start_campanie: c.data_start_campanie || '', data_end_campanie: c.data_end_campanie || '', stil_card: c.stil_card as any, stil_inky: c.stil_inky as any, stil_ticker: c.stil_ticker as any, documente_atasate: c.documente_atasate || [], statistici: { afisari: c.afisari || 0, clickuri: c.clickuri || 0, ctr: Number(c.ctr) || 0 } };
  });
}

export async function getAllCampaigns(): Promise<SponsorCampaign[]> {
  const { data } = await supabase.from('sponsor_campaigns').select('*, sponsors(*)').order('created_at', { ascending: false });
  return (data || []).map(c => {
    const s = c.sponsors as any;
    return { id: c.id, sponsor_id: c.sponsor_id, sponsor_nume: s?.nume, sponsor_logo: s?.logo_url, sponsor_culoare: s?.culoare_brand, tip: c.tip as any, titlu: c.titlu, descriere: c.descriere || '', link_url: c.link_url || '', cta_text: c.cta_text || '', prioritate: c.prioritate || 1, scoli_target: c.scoli_target || ['all'], status: c.status as CampaignStatus, data_start_campanie: c.data_start_campanie || '', data_end_campanie: c.data_end_campanie || '', stil_card: c.stil_card as any, stil_inky: c.stil_inky as any, stil_ticker: c.stil_ticker as any, documente_atasate: c.documente_atasate || [], statistici: { afisari: c.afisari || 0, clickuri: c.clickuri || 0, ctr: Number(c.ctr) || 0 } };
  });
}

export async function createCampaign(data: Omit<SponsorCampaign, 'id'>): Promise<SponsorCampaign> {
  const { data: c, error } = await supabase.from('sponsor_campaigns').insert({
    sponsor_id: data.sponsor_id, tip: data.tip, titlu: data.titlu, descriere: data.descriere, link_url: data.link_url, cta_text: data.cta_text, prioritate: data.prioritate, scoli_target: data.scoli_target, status: data.status, data_start_campanie: data.data_start_campanie, data_end_campanie: data.data_end_campanie, stil_card: data.stil_card as any, stil_inky: data.stil_inky as any, stil_ticker: data.stil_ticker as any, documente_atasate: data.documente_atasate,
  }).select().single();
  if (error) throw error;
  return { ...data, id: c.id };
}

export async function updateCampaign(id: string, data: Partial<SponsorCampaign>): Promise<SponsorCampaign> {
  const { data: c, error } = await supabase.from('sponsor_campaigns').update(data as any).eq('id', id).select('*, sponsors(*)').single();
  if (error) throw error;
  const s = c.sponsors as any;
  return { id: c.id, sponsor_id: c.sponsor_id, sponsor_nume: s?.nume, sponsor_logo: s?.logo_url, sponsor_culoare: s?.culoare_brand, tip: c.tip as any, titlu: c.titlu, descriere: c.descriere || '', link_url: c.link_url || '', cta_text: c.cta_text || '', prioritate: c.prioritate || 1, scoli_target: c.scoli_target || ['all'], status: c.status as CampaignStatus, data_start_campanie: c.data_start_campanie || '', data_end_campanie: c.data_end_campanie || '', stil_card: c.stil_card as any, stil_inky: c.stil_inky as any, stil_ticker: c.stil_ticker as any, documente_atasate: c.documente_atasate || [], statistici: { afisari: c.afisari || 0, clickuri: c.clickuri || 0, ctr: Number(c.ctr) || 0 } };
}

export async function updateCampaignStatus(id: string, status: CampaignStatus): Promise<void> {
  await supabase.from('sponsor_campaigns').update({ status }).eq('id', id);
}

export async function getSponsorStats(sponsorId: string): Promise<SponsorStats> {
  const { data: campaigns } = await supabase.from('sponsor_campaigns').select('status, afisari, clickuri').eq('sponsor_id', sponsorId);
  const active = (campaigns || []).filter(c => c.status === 'activ').length;
  const totalAfisari = (campaigns || []).reduce((sum, c) => sum + (c.afisari || 0), 0);
  const totalClickuri = (campaigns || []).reduce((sum, c) => sum + (c.clickuri || 0), 0);
  return { total_afisari: totalAfisari, total_clickuri: totalClickuri, ctr_mediu: totalAfisari > 0 ? (totalClickuri / totalAfisari) * 100 : 0, campanii_active: active, campanii_totale: (campaigns || []).length, scoli_active: 0 };
}

export async function getRotationConfig(tip?: SponsorPromo['tip'], schoolId?: string): Promise<RotationConfig> {
  const promos = await getActivePromos(tip, schoolId);
  const plans = await getSponsorPlans();
  const sponsors = await getSponsors();
  const sloturiWithPrices = promos.map(p => {
    const sponsor = sponsors.find(s => s.id === p.sponsor_id);
    const plan = plans.find(pl => pl.nume_plan === sponsor?.plan);
    return { promo: p, pret: plan?.pret || 500 };
  });
  const totalPret = sloturiWithPrices.reduce((sum, s) => sum + s.pret, 0) || 1;
  const ciclu = 60;
  const sloturi = sloturiWithPrices.map(s => ({
    id_sponsor: s.promo.sponsor_id, id_promo: s.promo.id,
    pondere: s.pret / totalPret, durata_secunde: Math.max(5, Math.round((s.pret / totalPret) * ciclu)), promo: s.promo,
  }));
  return { ciclu_total_secunde: ciclu, sloturi };
}

export async function logImpression(data: { id_promo: string; tip: string; school_id?: string }): Promise<void> {
  await supabase.from('sponsor_impressions').insert({ promo_id: data.id_promo, tip: data.tip, school_id: data.school_id || null, is_click: false });
}

export async function logClick(data: { id_promo: string; tip: string; school_id?: string }): Promise<void> {
  await supabase.from('sponsor_impressions').insert({ promo_id: data.id_promo, tip: data.tip, school_id: data.school_id || null, is_click: true });
}

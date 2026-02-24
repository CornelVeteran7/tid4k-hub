import { USE_MOCK } from './config';
import type { Sponsor, SponsorPromo, SponsorPlan, SponsorCampaign, SponsorStats, CampaignStatus } from '@/types/sponsor';

// ===== Mock Data =====
const MOCK_SPONSORS: Sponsor[] = [
  {
    id_sponsor: 1,
    nume: 'Kaufland',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Kaufland_201x_logo.svg/800px-Kaufland_201x_logo.svg.png',
    website: 'https://www.kaufland.ro',
    culoare_brand: '#e1001a',
    descriere: 'Kaufland susține educația prin programe dedicate copiilor și profesorilor din România.',
    activ: true,
    data_start: '2025-01-01',
    data_expirare: '2026-12-31',
    plan: 'Enterprise',
  },
  {
    id_sponsor: 2,
    nume: 'Lidl',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Lidl-Logo.svg/800px-Lidl-Logo.svg.png',
    website: 'https://www.lidl.ro',
    culoare_brand: '#0050aa',
    descriere: 'Lidl investește în comunitățile locale prin parteneriate educaționale.',
    activ: true,
    data_start: '2025-06-01',
    data_expirare: '2026-06-01',
    plan: 'Basic',
  },
];

const MOCK_PROMOS: SponsorPromo[] = [
  {
    id_promo: 1,
    id_sponsor: 1,
    sponsor_nume: 'Kaufland',
    sponsor_logo: MOCK_SPONSORS[0].logo_url,
    sponsor_culoare: '#e1001a',
    tip: 'card_dashboard',
    titlu: 'Kaufland pentru Educație',
    descriere: 'Descoperă pachetele educaționale Kaufland pentru grădiniță — caiete, creioane și materiale didactice gratuite!',
    link_url: 'https://www.kaufland.ro/educatie',
    cta_text: 'Vezi oferta',
    prioritate: 1,
    activ: true,
    scoli_target: ['1'],
    stil_card: {
      background: 'linear-gradient(135deg, #e1001a08 0%, #e1001a18 50%, #fff5f5 100%)',
      text_color: '#1a1a1a',
      border_color: '#e1001a40',
      border_radius: '16px',
      shadow_style: '0 4px 20px rgba(225, 0, 26, 0.12)',
      banner_url: '',
    },
  },
  {
    id_promo: 2,
    id_sponsor: 1,
    sponsor_nume: 'Kaufland',
    sponsor_logo: MOCK_SPONSORS[0].logo_url,
    sponsor_culoare: '#e1001a',
    tip: 'inky_popup',
    titlu: 'Află cum Kaufland susține educația!',
    descriere: 'Kaufland oferă materiale educaționale gratuite pentru grădinițe. Apasă pentru detalii.',
    link_url: 'https://www.kaufland.ro/educatie',
    cta_text: 'Descoperă',
    prioritate: 1,
    activ: true,
    scoli_target: ['1'],
    stil_inky: {
      bg_color: '#e1001a',
      text_color: '#ffffff',
      cta_bg: '#c4000e',
      cta_text: '#ffffff',
      icon_color: '#e1001a',
      costume_url: '',
      banner_url: '',
    },
  },
  {
    id_promo: 3,
    id_sponsor: 1,
    sponsor_nume: 'Kaufland',
    sponsor_logo: MOCK_SPONSORS[0].logo_url,
    sponsor_culoare: '#e1001a',
    tip: 'ticker',
    titlu: '🏷️ Kaufland — Materiale educaționale gratuite pentru grădiniță! Înscrie-te acum.',
    descriere: '',
    link_url: 'https://www.kaufland.ro/educatie',
    prioritate: 1,
    activ: true,
    scoli_target: ['1'],
    stil_ticker: {
      bg_color: '#e1001a',
      text_color: '#ffffff',
      badge_bg: '#e1001a',
      badge_text: 'Kaufland',
      glow_effect: true,
    },
  },
  {
    id_promo: 4,
    id_sponsor: 2,
    sponsor_nume: 'Lidl',
    sponsor_logo: MOCK_SPONSORS[1].logo_url,
    sponsor_culoare: '#0050aa',
    tip: 'ticker',
    titlu: '🏷️ Lidl — Fructe proaspete pentru copii, livrate săptămânal!',
    descriere: '',
    link_url: 'https://www.lidl.ro',
    prioritate: 2,
    activ: true,
    scoli_target: ['2'],
    stil_ticker: {
      bg_color: '#0050aa',
      text_color: '#ffffff',
      badge_bg: '#0050aa',
      badge_text: 'Lidl',
      glow_effect: false,
    },
  },
];

const MOCK_CAMPAIGNS: SponsorCampaign[] = [
  {
    id_campanie: 101,
    id_sponsor: 1,
    sponsor_nume: 'Kaufland',
    sponsor_logo: MOCK_SPONSORS[0].logo_url,
    sponsor_culoare: '#e1001a',
    tip: 'card_dashboard',
    titlu: 'Kaufland pentru Educație',
    descriere: 'Pachet educațional complet pentru grădinițe.',
    link_url: 'https://www.kaufland.ro/educatie',
    cta_text: 'Vezi oferta',
    prioritate: 1,
    scoli_target: ['all'],
    status: 'activ',
    data_start_campanie: '2025-09-01',
    data_end_campanie: '2026-06-30',
    stil_card: {
      background: 'linear-gradient(135deg, #e1001a08 0%, #e1001a18 50%, #fff5f5 100%)',
      text_color: '#1a1a1a',
      border_color: '#e1001a40',
      border_radius: '16px',
      shadow_style: '0 4px 20px rgba(225, 0, 26, 0.12)',
    },
    documente_atasate: ['flyer-kaufland-educatie.pdf'],
    statistici: { afisari: 4200, clickuri: 342, ctr: 8.1 },
  },
  {
    id_campanie: 102,
    id_sponsor: 1,
    sponsor_nume: 'Kaufland',
    sponsor_logo: MOCK_SPONSORS[0].logo_url,
    sponsor_culoare: '#e1001a',
    tip: 'ticker',
    titlu: 'Materiale educaționale gratuite Kaufland',
    descriere: '',
    link_url: 'https://www.kaufland.ro/educatie',
    prioritate: 1,
    scoli_target: ['all'],
    status: 'activ',
    data_start_campanie: '2025-09-01',
    data_end_campanie: '2026-06-30',
    stil_ticker: {
      bg_color: '#e1001a',
      text_color: '#ffffff',
      badge_bg: '#e1001a',
      badge_text: 'Kaufland',
      glow_effect: true,
    },
    documente_atasate: [],
    statistici: { afisari: 12400, clickuri: 0, ctr: 0 },
  },
  {
    id_campanie: 103,
    id_sponsor: 1,
    sponsor_nume: 'Kaufland',
    sponsor_logo: MOCK_SPONSORS[0].logo_url,
    sponsor_culoare: '#e1001a',
    tip: 'inky_popup',
    titlu: 'Află cum Kaufland susține educația!',
    descriere: 'Kaufland oferă materiale educaționale gratuite.',
    link_url: 'https://www.kaufland.ro/educatie',
    cta_text: 'Descoperă',
    prioritate: 1,
    scoli_target: ['all'],
    status: 'pauza',
    data_start_campanie: '2025-09-01',
    data_end_campanie: '2026-06-30',
    stil_inky: {
      bg_color: '#e1001a',
      text_color: '#ffffff',
      cta_bg: '#c4000e',
      cta_text: '#ffffff',
      icon_color: '#e1001a',
    },
    documente_atasate: [],
    statistici: { afisari: 890, clickuri: 67, ctr: 7.5 },
  },
  {
    id_campanie: 104,
    id_sponsor: 1,
    sponsor_nume: 'Kaufland',
    sponsor_logo: MOCK_SPONSORS[0].logo_url,
    sponsor_culoare: '#e1001a',
    tip: 'card_dashboard',
    titlu: 'Campania Crăciun 2025',
    descriere: 'Cadouri educaționale pentru Crăciun.',
    link_url: 'https://www.kaufland.ro/craciun',
    cta_text: 'Vezi cadourile',
    prioritate: 2,
    scoli_target: ['all'],
    status: 'arhivat',
    data_start_campanie: '2025-12-01',
    data_end_campanie: '2025-12-31',
    documente_atasate: [],
    statistici: { afisari: 8500, clickuri: 620, ctr: 7.3 },
  },
];

const MOCK_PLANS: SponsorPlan[] = [
  { id_plan: 1, nume_plan: 'Basic', pret: 500, include_dashboard: true, include_infodisplay: false, include_ticker: true, include_inky: false, include_custom_inky: false, numar_scoli: 5, descriere: 'Card pe dashboard + anunț în ticker' },
  { id_plan: 2, nume_plan: 'Premium', pret: 1500, include_dashboard: true, include_infodisplay: true, include_ticker: true, include_inky: true, include_custom_inky: false, numar_scoli: -1, descriere: 'Toate integrările, școli nelimitate' },
  { id_plan: 3, nume_plan: 'Enterprise', pret: 3000, include_dashboard: true, include_infodisplay: true, include_ticker: true, include_inky: true, include_custom_inky: true, numar_scoli: -1, descriere: 'Premium + branding custom Inky + rapoarte' },
];

const MOCK_STATS: Record<number, SponsorStats> = {
  1: { total_afisari: 17490, total_clickuri: 1029, ctr_mediu: 5.9, campanii_active: 2, campanii_totale: 4, scoli_active: 12 },
  2: { total_afisari: 3200, total_clickuri: 89, ctr_mediu: 2.8, campanii_active: 1, campanii_totale: 1, scoli_active: 5 },
};

// ===== API Functions =====
export async function getSponsors(): Promise<Sponsor[]> {
  if (USE_MOCK) return MOCK_SPONSORS;
  return [];
}

export async function getSponsor(id: number): Promise<Sponsor | null> {
  if (USE_MOCK) return MOCK_SPONSORS.find(s => s.id_sponsor === id) || null;
  return null;
}

export async function getActivePromos(tip?: SponsorPromo['tip'], schoolId?: number): Promise<SponsorPromo[]> {
  if (USE_MOCK) {
    let promos = MOCK_PROMOS.filter(p => p.activ);
    if (tip) promos = promos.filter(p => p.tip === tip);
    if (schoolId) {
      promos = promos.filter(p => p.scoli_target.includes('all') || p.scoli_target.includes(schoolId.toString()));
    }
    return promos.sort((a, b) => a.prioritate - b.prioritate);
  }
  return [];
}

export async function getSponsorPlans(): Promise<SponsorPlan[]> {
  if (USE_MOCK) return MOCK_PLANS;
  return [];
}

export async function createSponsor(data: Omit<Sponsor, 'id_sponsor'>): Promise<Sponsor> {
  if (USE_MOCK) return { ...data, id_sponsor: Date.now() };
  throw new Error('Not implemented');
}

export async function updateSponsor(id: number, data: Partial<Sponsor>): Promise<Sponsor> {
  if (USE_MOCK) {
    const existing = MOCK_SPONSORS.find(s => s.id_sponsor === id);
    if (!existing) throw new Error('Sponsor not found');
    return { ...existing, ...data };
  }
  throw new Error('Not implemented');
}

export async function createPromo(data: Omit<SponsorPromo, 'id_promo'>): Promise<SponsorPromo> {
  if (USE_MOCK) return { ...data, id_promo: Date.now() };
  throw new Error('Not implemented');
}

export async function updatePromo(id: number, data: Partial<SponsorPromo>): Promise<SponsorPromo> {
  if (USE_MOCK) {
    const existing = MOCK_PROMOS.find(p => p.id_promo === id);
    if (!existing) throw new Error('Promo not found');
    return { ...existing, ...data };
  }
  throw new Error('Not implemented');
}

export async function deletePromo(id: number): Promise<void> {
  if (USE_MOCK) return;
  throw new Error('Not implemented');
}

// ===== Campaign Functions =====
export async function getSponsorCampaigns(sponsorId: number): Promise<SponsorCampaign[]> {
  if (USE_MOCK) return MOCK_CAMPAIGNS.filter(c => c.id_sponsor === sponsorId);
  return [];
}

export async function getAllCampaigns(): Promise<SponsorCampaign[]> {
  if (USE_MOCK) return MOCK_CAMPAIGNS;
  return [];
}

export async function createCampaign(data: Omit<SponsorCampaign, 'id_campanie'>): Promise<SponsorCampaign> {
  if (USE_MOCK) return { ...data, id_campanie: Date.now() };
  throw new Error('Not implemented');
}

export async function updateCampaign(id: number, data: Partial<SponsorCampaign>): Promise<SponsorCampaign> {
  if (USE_MOCK) {
    const existing = MOCK_CAMPAIGNS.find(c => c.id_campanie === id);
    if (!existing) throw new Error('Campaign not found');
    return { ...existing, ...data };
  }
  throw new Error('Not implemented');
}

export async function updateCampaignStatus(id: number, status: CampaignStatus): Promise<void> {
  if (USE_MOCK) return;
  throw new Error('Not implemented');
}

export async function getSponsorStats(sponsorId: number): Promise<SponsorStats> {
  if (USE_MOCK) return MOCK_STATS[sponsorId] || { total_afisari: 0, total_clickuri: 0, ctr_mediu: 0, campanii_active: 0, campanii_totale: 0, scoli_active: 0 };
  throw new Error('Not implemented');
}

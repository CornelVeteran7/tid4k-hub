import { USE_MOCK } from './config';
import type { Sponsor, SponsorPromo, SponsorPlan } from '@/types/sponsor';

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
    plan: 'Premium',
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
    scoli_target: ['all'],
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
    scoli_target: ['all'],
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
    scoli_target: ['all'],
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
    scoli_target: ['all'],
  },
];

const MOCK_PLANS: SponsorPlan[] = [
  { id_plan: 1, nume_plan: 'Basic', pret: 500, include_dashboard: true, include_infodisplay: false, include_ticker: true, include_inky: false, numar_scoli: 5, descriere: 'Card pe dashboard + anunț în ticker' },
  { id_plan: 2, nume_plan: 'Premium', pret: 1500, include_dashboard: true, include_infodisplay: true, include_ticker: true, include_inky: true, numar_scoli: -1, descriere: 'Toate integrările, școli nelimitate' },
  { id_plan: 3, nume_plan: 'Enterprise', pret: 3000, include_dashboard: true, include_infodisplay: true, include_ticker: true, include_inky: true, numar_scoli: -1, descriere: 'Premium + branding custom + rapoarte' },
];

// ===== API Functions =====
export async function getSponsors(): Promise<Sponsor[]> {
  if (USE_MOCK) return MOCK_SPONSORS;
  // TODO: apiFetch<Sponsor[]>('/sponsors')
  return [];
}

export async function getSponsor(id: number): Promise<Sponsor | null> {
  if (USE_MOCK) return MOCK_SPONSORS.find(s => s.id_sponsor === id) || null;
  return null;
}

export async function getActivePromos(tip?: SponsorPromo['tip']): Promise<SponsorPromo[]> {
  if (USE_MOCK) {
    let promos = MOCK_PROMOS.filter(p => p.activ);
    if (tip) promos = promos.filter(p => p.tip === tip);
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
  // TODO: apiFetch<Sponsor>('/sponsors', { method: 'POST', body: JSON.stringify(data) })
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

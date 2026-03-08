// ===== Sponsors =====
export interface Sponsor {
  id: string;
  nume: string;
  logo_url: string;
  website: string;
  culoare_brand: string;
  descriere: string;
  activ: boolean;
  data_start: string;
  data_expirare: string;
  plan: string;
}

// ===== Custom Styles =====
export interface SponsorStyleCard {
  background?: string;
  text_color?: string;
  border_color?: string;
  border_radius?: string;
  shadow_style?: string;
  banner_url?: string;
}

export interface SponsorStyleTicker {
  bg_color?: string;
  text_color?: string;
  badge_bg?: string;
  badge_text?: string;
  glow_effect?: boolean;
}

export interface SponsorStyleInky {
  bg_color?: string;
  text_color?: string;
  cta_bg?: string;
  cta_text?: string;
  icon_color?: string;
  costume_url?: string;
  banner_url?: string;
}

// ===== Campaigns =====
export type CampaignStatus = 'draft' | 'activ' | 'pauza' | 'expirat' | 'arhivat';

export interface SponsorCampaign {
  id: string;
  sponsor_id: string;
  sponsor_nume?: string;
  sponsor_logo?: string;
  sponsor_culoare?: string;
  tip: 'card_dashboard' | 'infodisplay' | 'ticker' | 'inky_popup';
  titlu: string;
  descriere: string;
  imagine_url?: string;
  link_url?: string;
  cta_text?: string;
  prioritate: number;
  scoli_target: string[];
  status: CampaignStatus;
  data_start_campanie: string;
  data_end_campanie: string;
  stil_card?: SponsorStyleCard;
  stil_ticker?: SponsorStyleTicker;
  stil_inky?: SponsorStyleInky;
  documente_atasate: string[];
  statistici: {
    afisari: number;
    clickuri: number;
    ctr: number;
  };
}

// ===== Promos =====
export interface SponsorPromo {
  id: string;
  sponsor_id: string;
  sponsor_nume?: string;
  sponsor_logo?: string;
  sponsor_culoare?: string;
  tip: 'card_dashboard' | 'infodisplay' | 'ticker' | 'inky_popup';
  titlu: string;
  descriere: string;
  imagine_url?: string;
  link_url?: string;
  cta_text?: string;
  prioritate: number;
  activ: boolean;
  scoli_target: string[];
  stil_card?: SponsorStyleCard;
  stil_ticker?: SponsorStyleTicker;
  stil_inky?: SponsorStyleInky;
}

export interface SponsorPlan {
  id: string;
  nume_plan: string;
  pret: number;
  include_dashboard: boolean;
  include_infodisplay: boolean;
  include_ticker: boolean;
  include_inky: boolean;
  include_custom_inky: boolean;
  numar_scoli: number;
  descriere: string;
}

export interface SponsorStats {
  total_afisari: number;
  total_clickuri: number;
  ctr_mediu: number;
  campanii_active: number;
  campanii_totale: number;
  scoli_active: number;
}

// ===== Rotation System =====
export interface RotationConfig {
  ciclu_total_secunde: number;
  sloturi: RotationSlot[];
}

export interface RotationSlot {
  id_sponsor: string;
  id_promo: string;
  durata_secunde: number;
  pondere: number;
  promo: SponsorPromo;
}

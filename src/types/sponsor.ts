// ===== Sponsors =====
export interface Sponsor {
  id_sponsor: number;
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

export interface SponsorPromo {
  id_promo: number;
  id_sponsor: number;
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
}

export interface SponsorPlan {
  id_plan: number;
  nume_plan: string;
  pret: number;
  include_dashboard: boolean;
  include_infodisplay: boolean;
  include_ticker: boolean;
  include_inky: boolean;
  numar_scoli: number;
  descriere: string;
}

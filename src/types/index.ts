// ===== Authentication =====
export interface LoginCredentials {
  telefon: string;
  pin: string;
}

export interface UserSession {
  id_utilizator: number;
  nume_prenume: string;
  telefon: string;
  email: string;
  status: string; // CSV: "profesor,director", "parinte", "administrator", etc.
  grupa_clasa_copil: string;
  numar_grupe_clase_utilizator: number;
  index_grupa_clasa_curenta: number;
  grupe_disponibile: GroupInfo[];
}

export type UserRole = 'parinte' | 'profesor' | 'director' | 'administrator' | 'secretara' | 'inky';

// ===== Groups & Children =====
export interface GroupInfo {
  id: string;
  nume: string;
  tip: 'gradinita' | 'scoala';
}

export interface Child {
  id_copil: number;
  nume_prenume_copil: string;
  grupa_clasa_copil: string;
  data_nasterii?: string;
  parinte_id?: number;
  parinte_nume?: string;
  parinte_telefon?: string;
  parinte_email?: string;
}

// ===== Attendance =====
export interface AttendanceRecord {
  id_copil: number;
  nume_prenume_copil: string;
  prezent: boolean;
  observatii: string;
}

export interface AttendanceDay {
  data: string;
  records: AttendanceRecord[];
}

export interface AttendanceStats {
  luna: number;
  an: number;
  zile: { data: string; prezenti: number; absenti: number }[];
  per_copil: { id_copil: number; nume: string; zile_prezent: number; zile_absent: number; procent: number }[];
}

// ===== Messages =====
export interface Conversation {
  id: number;
  contact_nume: string;
  contact_id: number;
  ultimul_mesaj: string;
  data_ultimul_mesaj: string;
  necitite: number;
  grupa: string;
}

export interface Message {
  id_mesaj: number;
  expeditor: number;
  expeditor_nume: string;
  destinatar: number;
  mesaj: string;
  data: string;
  citit: boolean;
}

// ===== Announcements =====
export interface Announcement {
  id_info: number;
  titlu: string;
  continut: string;
  data_upload: string;
  autor: string;
  prioritate: 'normal' | 'urgent';
  target: string; // 'scoala' or group name
  citit: boolean;
  ascuns_banda: boolean;
  pozitie_banda?: number;
}

// ===== Documents =====
export interface DocumentItem {
  id_info: number;
  nume_fisier: string;
  tip_fisier: 'pdf' | 'jpg' | 'png' | 'gif' | 'webp';
  categorie: 'activitati' | 'administrativ' | 'teme' | 'fotografii';
  data_upload: string;
  uploadat_de: string;
  uploadat_de_id: number;
  url: string;
  thumbnail_url?: string;
  marime: number;
}

// ===== Schedule =====
export interface ScheduleCell {
  zi: string;
  ora: string;
  materie: string;
  profesor: string;
  culoare: string;
}

export interface CancelarieTeacher {
  id: number;
  nume: string;
  avatar_url: string;
  qr_data: string;
  absent_dates: string[];
  activitati: { data: string; descriere: string }[];
}

// ===== Menu =====
export interface MenuItem {
  masa: 'mic_dejun' | 'gustare_1' | 'pranz' | 'gustare_2';
  zi: string;
  continut: string;
  emoji?: string;
}

export interface NutritionalData {
  zi: string;
  kcal: number;
  carbohidrati: number;
  proteine: number;
  grasimi: number;
  fibre: number;
}

export interface WeeklyMenu {
  saptamana: string;
  items: MenuItem[];
  nutritional: NutritionalData[];
  alergeni: string[];
  semnaturi: {
    director: string;
    asistent_medical: string;
    administrator: string;
  };
}

// ===== Stories =====
export interface Story {
  id_poveste: number;
  titlu: string;
  continut: string;
  categorie: 'educative' | 'morale' | 'distractive';
  varsta: '3-5' | '5-7' | '7-10';
  thumbnail?: string;
  audio_url?: string;
  favorit?: boolean;
}

// ===== Reports =====
export interface ReportData {
  attendance_trends: { data: string; prezenti: number; absenti: number }[];
  user_activity: { nume: string; actiuni: number }[];
  documents_by_category: { categorie: string; numar: number }[];
}

// ===== Users =====
export interface User {
  id_utilizator: number;
  nume_prenume: string;
  telefon: string;
  email: string;
  status: string;
  grupe: string[];
  CANCELARIE?: boolean;
  ADMINISTRATIV?: boolean;
}

// ===== Settings =====
export interface SchoolSettings {
  nume_scoala: string;
  adresa: string;
  logo_url: string;
  api_keys: {
    cloudmersive: string;
    openai: string;
    twilio: string;
  };
  whatsapp: {
    mappings: { grupa: string; whatsapp_group: string }[];
    consent: boolean;
    sync_type: 'bidirectional' | 'one-way';
  };
  facebook: {
    page_id: string;
    token_status: 'activ' | 'expirat';
    format: string;
  };
  notifications: {
    email: boolean;
    sms: boolean;
  };
}

// ===== Infodisplay =====
export interface InfodisplayPanel {
  id: number;
  tip: string;
  continut: string;
  durata: number;
  ordine: number;
}

export interface InfodisplayConfig {
  panels: InfodisplayPanel[];
  ticker_messages: string[];
  qr_codes: { label: string; url: string }[];
  transition: 'fade' | 'slide';
}

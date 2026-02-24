import { USE_MOCK, apiFetch } from './config';

export interface Workshop {
  id_atelier: number;
  titlu: string;
  descriere: string;
  luna: string; // YYYY-MM
  imagine_url: string;
  categorie: 'arta' | 'stiinta' | 'muzica' | 'sport' | 'natura';
  materiale: string[];
  instructor: string;
  durata_minute: number;
  scoli_target: string[]; // ['all'] or specific school IDs
  publicat: boolean;
  data_creare: string;
  data_publicare?: string;
}

export type WorkshopCreate = Omit<Workshop, 'id_atelier' | 'data_creare' | 'data_publicare' | 'publicat'>;

const CATEGORY_LABELS: Record<Workshop['categorie'], string> = {
  arta: 'Artă',
  stiinta: 'Știință',
  muzica: 'Muzică',
  sport: 'Sport',
  natura: 'Natură',
};

export function getCategoryLabel(cat: Workshop['categorie']) {
  return CATEGORY_LABELS[cat] || cat;
}

// Current month in YYYY-MM
function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const MOCK_WORKSHOPS: Workshop[] = [
  {
    id_atelier: 1,
    titlu: 'Pictură pe sticlă',
    descriere: 'Copiii vor învăța tehnici de pictură pe sticlă, creând decorațiuni colorate pentru ferestre.',
    luna: currentMonth(),
    imagine_url: '',
    categorie: 'arta',
    materiale: ['Vopsele pentru sticlă', 'Pensule', 'Borcane de sticlă'],
    instructor: 'Maria Ionescu',
    durata_minute: 45,
    scoli_target: ['all'],
    publicat: true,
    data_creare: '2026-02-01T10:00:00',
    data_publicare: '2026-02-03T08:00:00',
  },
  {
    id_atelier: 2,
    titlu: 'Explorăm magnetismul',
    descriere: 'Experimente interactive cu magneți pentru a descoperi forțele invizibile din natură.',
    luna: currentMonth(),
    imagine_url: '',
    categorie: 'stiinta',
    materiale: ['Magneți', 'Pilitură de fier', 'Compas'],
    instructor: 'Andrei Popescu',
    durata_minute: 40,
    scoli_target: ['1'],
    publicat: false,
    data_creare: '2026-02-10T14:00:00',
  },
  {
    id_atelier: 3,
    titlu: 'Ritmuri din natură',
    descriere: 'Atelierul de percuție cu instrumente fabricate din materiale naturale.',
    luna: '2026-03',
    imagine_url: '',
    categorie: 'muzica',
    materiale: ['Bețe de lemn', 'Nuci de cocos', 'Semințe uscate'],
    instructor: 'Elena Dumitrescu',
    durata_minute: 35,
    scoli_target: ['all'],
    publicat: false,
    data_creare: '2026-02-20T09:00:00',
  },
];

let workshops = [...MOCK_WORKSHOPS];
let nextId = 4;

export async function getWorkshops(schoolId?: string, luna?: string): Promise<Workshop[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 200));
    let result = [...workshops];
    if (luna) result = result.filter(w => w.luna === luna);
    if (schoolId && schoolId !== 'all') {
      result = result.filter(w => w.scoli_target.includes('all') || w.scoli_target.includes(schoolId));
    }
    return result.sort((a, b) => new Date(b.data_creare).getTime() - new Date(a.data_creare).getTime());
  }
  const params = new URLSearchParams({ action: 'list' });
  if (schoolId && schoolId !== 'all') params.set('school_id', schoolId);
  if (luna) params.set('luna', luna);
  return apiFetch(`/ateliere.php?${params}`);
}

export async function getWorkshopOfMonth(schoolId?: string): Promise<Workshop | null> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 100));
    const month = currentMonth();
    const found = workshops.find(w => w.luna === month && w.publicat && (w.scoli_target.includes('all') || (schoolId && w.scoli_target.includes(schoolId))));
    return found || null;
  }
  const params = new URLSearchParams({ action: 'current' });
  if (schoolId && schoolId !== 'all') params.set('school_id', schoolId);
  return apiFetch(`/ateliere.php?${params}`);
}

export async function createWorkshop(data: WorkshopCreate): Promise<Workshop> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    const w: Workshop = { ...data, id_atelier: nextId++, publicat: false, data_creare: new Date().toISOString() };
    workshops.push(w);
    return w;
  }
  return apiFetch('/ateliere.php?action=create', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateWorkshop(id: number, data: Partial<WorkshopCreate>): Promise<Workshop> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    const idx = workshops.findIndex(w => w.id_atelier === id);
    if (idx === -1) throw new Error('Workshop not found');
    workshops[idx] = { ...workshops[idx], ...data };
    return workshops[idx];
  }
  return apiFetch('/ateliere.php?action=update', { method: 'POST', body: JSON.stringify({ id, ...data }) });
}

export async function deleteWorkshop(id: number): Promise<void> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 200));
    workshops = workshops.filter(w => w.id_atelier !== id);
    return;
  }
  await apiFetch('/ateliere.php?action=delete', { method: 'POST', body: JSON.stringify({ id }) });
}

export async function publishWorkshop(id: number, scoli_target: string[]): Promise<Workshop> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    const idx = workshops.findIndex(w => w.id_atelier === id);
    if (idx === -1) throw new Error('Workshop not found');
    workshops[idx] = { ...workshops[idx], publicat: true, scoli_target, data_publicare: new Date().toISOString() };
    return workshops[idx];
  }
  return apiFetch('/ateliere.php?action=publish', { method: 'POST', body: JSON.stringify({ id, scoli_target }) });
}

import { USE_MOCK, apiFetch } from './config';
import type { School } from '@/types';

const mockSchools: School[] = [
  {
    id_scoala: 1,
    nume: 'Grădinița Floarea Soarelui',
    adresa: 'Str. Exemplu nr. 1, București',
    tip: 'gradinita',
    logo_url: '/placeholder.svg',
    grupe: ['Grupa Mică', 'Grupa Mijlocie', 'Grupa Mare'],
    nr_copii: 45,
    nr_profesori: 8,
    activ: true,
    sponsori_activi: [1],
  },
  {
    id_scoala: 2,
    nume: 'Școala Primară Nr. 5',
    adresa: 'Bd. Libertății nr. 22, București',
    tip: 'scoala',
    logo_url: '/placeholder.svg',
    grupe: ['Clasa I-A', 'Clasa I-B', 'Clasa a II-a', 'Clasa a III-a'],
    nr_copii: 120,
    nr_profesori: 15,
    activ: true,
    sponsori_activi: [2],
  },
  {
    id_scoala: 3,
    nume: 'Grădinița Licurici',
    adresa: 'Str. Plopilor nr. 10, Cluj-Napoca',
    tip: 'gradinita',
    logo_url: '/placeholder.svg',
    grupe: ['Grupa Mică', 'Grupa Mare'],
    nr_copii: 28,
    nr_profesori: 5,
    activ: false,
    sponsori_activi: [],
  },
];

export async function getSchools(): Promise<School[]> {
  if (USE_MOCK) return mockSchools;
  return apiFetch<School[]>('/scoli.php?action=list');
}

export async function createSchool(data: Partial<School>): Promise<School> {
  if (USE_MOCK) {
    const newSchool: School = {
      id_scoala: Date.now(),
      nume: data.nume || '',
      adresa: data.adresa || '',
      tip: data.tip || 'gradinita',
      logo_url: data.logo_url || '/placeholder.svg',
      grupe: data.grupe || [],
      nr_copii: 0,
      nr_profesori: 0,
      activ: true,
      sponsori_activi: data.sponsori_activi || [],
    };
    return newSchool;
  }
  return apiFetch<School>('/scoli.php?action=create', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateSchool(data: Partial<School>): Promise<void> {
  if (USE_MOCK) return;
  await apiFetch('/scoli.php?action=update', { method: 'POST', body: JSON.stringify(data) });
}

export async function deleteSchool(id: number): Promise<void> {
  if (USE_MOCK) return;
  await apiFetch(`/scoli.php?action=delete&id=${id}`, { method: 'DELETE' });
}

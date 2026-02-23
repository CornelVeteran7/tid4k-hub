import { USE_MOCK, apiFetch } from './config';
import type { DocumentItem } from '@/types';

const mockDocuments: DocumentItem[] = [
  { id_info: 1, nume_fisier: 'activitate_pictura.jpg', tip_fisier: 'jpg', categorie: 'activitati', data_upload: '2026-02-23T09:00:00', uploadat_de: 'Maria Popescu', uploadat_de_id: 1, url: '/placeholder.svg', marime: 245000 },
  { id_info: 2, nume_fisier: 'regulament_intern.pdf', tip_fisier: 'pdf', categorie: 'administrativ', data_upload: '2026-02-20T11:00:00', uploadat_de: 'Vasile Georgescu', uploadat_de_id: 4, url: '/placeholder.svg', marime: 1200000 },
  { id_info: 3, nume_fisier: 'tema_matematica.pdf', tip_fisier: 'pdf', categorie: 'teme', data_upload: '2026-02-22T08:30:00', uploadat_de: 'Maria Popescu', uploadat_de_id: 1, url: '/placeholder.svg', marime: 350000 },
  { id_info: 4, nume_fisier: 'sarbatoare_craciun.jpg', tip_fisier: 'jpg', categorie: 'fotografii', data_upload: '2026-02-18T16:00:00', uploadat_de: 'Ana Dumitrescu', uploadat_de_id: 3, url: '/placeholder.svg', marime: 890000 },
  { id_info: 5, nume_fisier: 'excursie_parc.png', tip_fisier: 'png', categorie: 'fotografii', data_upload: '2026-02-15T14:00:00', uploadat_de: 'Maria Popescu', uploadat_de_id: 1, url: '/placeholder.svg', marime: 1450000 },
];

export async function getDocuments(grupa: string, categorie?: string): Promise<DocumentItem[]> {
  if (USE_MOCK) return categorie ? mockDocuments.filter((d) => d.categorie === categorie) : mockDocuments;
  return apiFetch<DocumentItem[]>(`/documente.php?action=list&grupa=${grupa}${categorie ? `&categorie=${categorie}` : ''}`);
}

export async function uploadDocument(grupa: string, file: File, categorie: string): Promise<DocumentItem> {
  if (USE_MOCK) {
    return {
      id_info: Date.now(), nume_fisier: file.name,
      tip_fisier: file.name.split('.').pop() as DocumentItem['tip_fisier'],
      categorie: categorie as DocumentItem['categorie'],
      data_upload: new Date().toISOString(), uploadat_de: 'Maria Popescu', uploadat_de_id: 1,
      url: '/placeholder.svg', marime: file.size,
    };
  }
  const formData = new FormData();
  formData.append('file', file);
  formData.append('grupa', grupa);
  formData.append('categorie', categorie);
  const res = await fetch(`/documente.php?action=upload`, { method: 'POST', body: formData });
  return res.json();
}

export async function deleteDocument(id: number): Promise<void> {
  if (USE_MOCK) return;
  await apiFetch(`/documente.php?action=delete&id=${id}`, { method: 'POST' });
}

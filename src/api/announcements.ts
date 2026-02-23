import { USE_MOCK, apiFetch } from './config';
import type { Announcement } from '@/types';

const mockAnnouncements: Announcement[] = [
  { id_info: 1, titlu: 'Excursie la Grădina Botanică', continut: 'Dragi părinți, vă anunțăm că pe data de 5 martie vom organiza o excursie la Grădina Botanică. Vă rugăm să completați acordul parental.', data_upload: '2026-02-23T08:00:00', autor: 'Maria Popescu', prioritate: 'normal', target: 'grupa_mare', citit: false, ascuns_banda: false, pozitie_banda: 1 },
  { id_info: 2, titlu: 'Atenție! Modificare program', continut: 'Din cauza condițiilor meteo, programul de mâine va fi modificat. Grădinița se va deschide la ora 8:30 în loc de 8:00.', data_upload: '2026-02-22T14:00:00', autor: 'Vasile Georgescu', prioritate: 'urgent', target: 'scoala', citit: true, ascuns_banda: false, pozitie_banda: 2 },
  { id_info: 3, titlu: 'Ședință cu părinții', continut: 'Vă invităm la ședința cu părinții care va avea loc joi, 27 februarie, ora 17:00.', data_upload: '2026-02-20T10:00:00', autor: 'Maria Popescu', prioritate: 'normal', target: 'grupa_mare', citit: true, ascuns_banda: true },
  { id_info: 4, titlu: 'Meniu nou pentru luna martie', continut: 'Meniul pentru luna martie a fost actualizat. Îl puteți consulta în secțiunea Meniul Săptămânal.', data_upload: '2026-02-19T09:00:00', autor: 'Vasile Georgescu', prioritate: 'normal', target: 'scoala', citit: false, ascuns_banda: false, pozitie_banda: 3 },
];

export async function getAnnouncements(grupa?: string): Promise<Announcement[]> {
  if (USE_MOCK) return grupa ? mockAnnouncements.filter((a) => a.target === grupa || a.target === 'scoala') : mockAnnouncements;
  return apiFetch<Announcement[]>(`/anunturi.php?action=list${grupa ? `&grupa=${grupa}` : ''}`);
}

export async function createAnnouncement(ann: Partial<Announcement>): Promise<Announcement> {
  if (USE_MOCK) return { ...ann, id_info: Date.now(), data_upload: new Date().toISOString(), citit: false, ascuns_banda: false } as Announcement;
  return apiFetch<Announcement>('/anunturi.php?action=create', { method: 'POST', body: JSON.stringify(ann) });
}

export async function hideFromTicker(id: number): Promise<void> {
  if (USE_MOCK) return;
  await apiFetch(`/anunturi.php?action=hide_banda&id=${id}`, { method: 'POST' });
}

export async function restoreToTicker(id: number): Promise<void> {
  if (USE_MOCK) return;
  await apiFetch(`/anunturi.php?action=restore_banda&id=${id}`, { method: 'POST' });
}

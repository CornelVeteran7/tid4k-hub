import { USE_MOCK, apiFetch } from './config';
import type { ScheduleCell, CancelarieTeacher } from '@/types';

const mockSchedule: ScheduleCell[] = [
  { zi: 'Luni', ora: '08:00', materie: 'Limba Română', profesor: 'Maria Popescu', culoare: '#E3F2FD' },
  { zi: 'Luni', ora: '09:00', materie: 'Matematică', profesor: 'Ana Dumitrescu', culoare: '#FFF3E0' },
  { zi: 'Luni', ora: '10:00', materie: 'Educație fizică', profesor: 'Dan Marin', culoare: '#E8F5E9' },
  { zi: 'Luni', ora: '11:00', materie: 'Muzică', profesor: 'Elena Stanescu', culoare: '#F3E5F5' },
  { zi: 'Marți', ora: '08:00', materie: 'Matematică', profesor: 'Ana Dumitrescu', culoare: '#FFF3E0' },
  { zi: 'Marți', ora: '09:00', materie: 'Științe', profesor: 'Maria Popescu', culoare: '#E8F5E9' },
  { zi: 'Marți', ora: '10:00', materie: 'Limba Română', profesor: 'Maria Popescu', culoare: '#E3F2FD' },
  { zi: 'Miercuri', ora: '08:00', materie: 'Arte plastice', profesor: 'Ana Dumitrescu', culoare: '#FCE4EC' },
  { zi: 'Miercuri', ora: '09:00', materie: 'Limba Română', profesor: 'Maria Popescu', culoare: '#E3F2FD' },
  { zi: 'Joi', ora: '08:00', materie: 'Matematică', profesor: 'Ana Dumitrescu', culoare: '#FFF3E0' },
  { zi: 'Joi', ora: '09:00', materie: 'Educație fizică', profesor: 'Dan Marin', culoare: '#E8F5E9' },
  { zi: 'Vineri', ora: '08:00', materie: 'Limba Română', profesor: 'Maria Popescu', culoare: '#E3F2FD' },
  { zi: 'Vineri', ora: '09:00', materie: 'Științe', profesor: 'Maria Popescu', culoare: '#E8F5E9' },
];

const mockTeachers: CancelarieTeacher[] = [
  { id: 1, nume: 'Maria Popescu', avatar_url: '/placeholder.svg', qr_data: 'TEACHER_1_QR', absent_dates: ['2026-02-10'], activitati: [{ data: '2026-02-23', descriere: 'Curs formare' }] },
  { id: 2, nume: 'Ana Dumitrescu', avatar_url: '/placeholder.svg', qr_data: 'TEACHER_2_QR', absent_dates: [], activitati: [] },
  { id: 3, nume: 'Dan Marin', avatar_url: '/placeholder.svg', qr_data: 'TEACHER_3_QR', absent_dates: ['2026-02-05', '2026-02-06'], activitati: [{ data: '2026-02-20', descriere: 'Pregătire concurs' }] },
];

export async function getSchedule(grupa: string): Promise<ScheduleCell[]> {
  if (USE_MOCK) return mockSchedule;
  return apiFetch<ScheduleCell[]>(`/orar.php?action=get&grupa=${grupa}`);
}

export async function saveSchedule(grupa: string, cells: ScheduleCell[]): Promise<void> {
  if (USE_MOCK) return;
  await apiFetch('/orar.php?action=save', { method: 'POST', body: JSON.stringify({ grupa, cells }) });
}

export async function getCancelarieTeachers(): Promise<CancelarieTeacher[]> {
  if (USE_MOCK) return mockTeachers;
  return apiFetch<CancelarieTeacher[]>('/orar.php?action=cancelarie');
}

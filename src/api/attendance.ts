import { USE_MOCK, apiFetch } from './config';
import type { AttendanceRecord, AttendanceDay, AttendanceStats } from '@/types';

const mockAttendance: AttendanceRecord[] = [
  { id_copil: 1, nume_prenume_copil: 'Alexia Ionescu', prezent: true, observatii: '' },
  { id_copil: 2, nume_prenume_copil: 'Matei Popescu', prezent: true, observatii: '' },
  { id_copil: 3, nume_prenume_copil: 'Sofia Marinescu', prezent: false, observatii: 'Bolnavă' },
  { id_copil: 4, nume_prenume_copil: 'David Radu', prezent: true, observatii: '' },
  { id_copil: 5, nume_prenume_copil: 'Emma Vasilescu', prezent: true, observatii: '' },
];

export async function getAttendance(grupa: string, data: string): Promise<AttendanceDay> {
  if (USE_MOCK) return { data, records: mockAttendance };
  return apiFetch<AttendanceDay>(`/prezenta.php?action=get&grupa=${grupa}&data=${data}`);
}

export async function saveAttendance(grupa: string, data: string, records: AttendanceRecord[]): Promise<void> {
  if (USE_MOCK) return;
  await apiFetch('/prezenta.php?action=save', {
    method: 'POST',
    body: JSON.stringify({ grupa, data, prezente: records }),
  });
}

export async function getAttendanceStats(grupa: string, luna: number, an: number): Promise<AttendanceStats> {
  if (USE_MOCK) {
    const days = Array.from({ length: 22 }, (_, i) => ({
      data: `${an}-${String(luna).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
      prezenti: Math.floor(Math.random() * 3) + 3,
      absenti: Math.floor(Math.random() * 2),
    }));
    return {
      luna, an, zile: days,
      per_copil: mockAttendance.map((r) => ({
        id_copil: r.id_copil, nume: r.nume_prenume_copil,
        zile_prezent: Math.floor(Math.random() * 5) + 17,
        zile_absent: Math.floor(Math.random() * 5),
        procent: Math.floor(Math.random() * 15) + 85,
      })),
    };
  }
  return apiFetch<AttendanceStats>(`/prezenta.php?action=stats&grupa=${grupa}&luna=${luna}&an=${an}`);
}

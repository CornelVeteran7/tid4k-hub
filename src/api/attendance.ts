import { USE_MOCK, apiFetch } from './config';
import type { AttendanceRecord, AttendanceDay, AttendanceStats, WeeklyAttendanceData, WeeklyAttendanceRecord } from '@/types';

const mockChildren = [
  { id_copil: 1, nume_prenume_copil: 'Alexia Ionescu' },
  { id_copil: 2, nume_prenume_copil: 'Matei Popescu' },
  { id_copil: 3, nume_prenume_copil: 'Sofia Marinescu' },
  { id_copil: 4, nume_prenume_copil: 'David Radu' },
  { id_copil: 5, nume_prenume_copil: 'Emma Vasilescu' },
];

const mockAttendance: AttendanceRecord[] = mockChildren.map((c) => ({
  ...c,
  prezent: Math.random() > 0.3,
  observatii: '',
}));

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
      per_copil: mockChildren.map((c) => ({
        id_copil: c.id_copil, nume: c.nume_prenume_copil,
        zile_prezent: Math.floor(Math.random() * 5) + 17,
        zile_absent: Math.floor(Math.random() * 5),
        procent: Math.floor(Math.random() * 15) + 85,
      })),
    };
  }
  return apiFetch<AttendanceStats>(`/prezenta.php?action=stats&grupa=${grupa}&luna=${luna}&an=${an}`);
}

export async function getWeeklyAttendance(grupa: string, mondayDate: string): Promise<WeeklyAttendanceData> {
  if (USE_MOCK) {
    const monday = new Date(mondayDate);
    const weekDates = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split('T')[0];
    });
    const friday = weekDates[4];
    const today = new Date().toISOString().split('T')[0];
    const records: WeeklyAttendanceRecord[] = mockChildren.map((c) => ({
      id_copil: c.id_copil,
      nume_prenume_copil: c.nume_prenume_copil,
      zile: Object.fromEntries(
        weekDates.map((d) => [d, d <= today ? Math.random() > 0.2 : false])
      ),
    }));
    return { saptamana_start: mondayDate, saptamana_end: friday, records };
  }
  return apiFetch<WeeklyAttendanceData>(`/prezenta.php?action=get_weekly&grupa=${grupa}&data=${mondayDate}`);
}

export async function saveWeeklyAttendance(grupa: string, data: WeeklyAttendanceData): Promise<void> {
  if (USE_MOCK) return;
  await apiFetch('/prezenta.php?action=save_weekly', {
    method: 'POST',
    body: JSON.stringify({ grupa, ...data }),
  });
}

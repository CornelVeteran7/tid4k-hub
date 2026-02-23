import { USE_MOCK, apiFetch } from './config';
import type { ReportData } from '@/types';

const mockReport: ReportData = {
  attendance_trends: Array.from({ length: 30 }, (_, i) => ({
    data: `2026-02-${String(i + 1).padStart(2, '0')}`,
    prezenti: Math.floor(Math.random() * 8) + 15,
    absenti: Math.floor(Math.random() * 5) + 1,
  })),
  user_activity: [
    { nume: 'Maria Popescu', actiuni: 145 },
    { nume: 'Ion Ionescu', actiuni: 89 },
    { nume: 'Ana Dumitrescu', actiuni: 112 },
    { nume: 'Andrei Parinte', actiuni: 67 },
    { nume: 'Elena Stanescu', actiuni: 34 },
  ],
  documents_by_category: [
    { categorie: 'Activități', numar: 45 },
    { categorie: 'Administrativ', numar: 23 },
    { categorie: 'Teme', numar: 31 },
    { categorie: 'Fotografii', numar: 67 },
  ],
};

export async function getAttendanceReport(grupa?: string, startDate?: string, endDate?: string): Promise<ReportData> {
  if (USE_MOCK) return mockReport;
  return apiFetch<ReportData>(`/rapoarte.php?action=attendance${grupa ? `&grupa=${grupa}` : ''}${startDate ? `&start=${startDate}` : ''}${endDate ? `&end=${endDate}` : ''}`);
}

export async function getActivityReport(): Promise<ReportData> {
  if (USE_MOCK) return mockReport;
  return apiFetch<ReportData>('/rapoarte.php?action=activity');
}

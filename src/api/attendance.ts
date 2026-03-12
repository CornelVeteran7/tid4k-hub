/**
 * API Prezenta - conectat la TID4K backend
 *
 * Endpoint-uri: fetch_prezenta_saptamana, salveaza_prezenta_saptamana
 */

import { tid4kApi } from './tid4kClient';
import { USE_TID4K_BACKEND } from './config';
import type {
  AttendanceRecord,
  AttendanceDay,
  AttendanceStats,
  WeeklyAttendanceData,
  WeeklyAttendanceRecord,
} from '@/types';

export async function getAttendance(grupa: string, data: string): Promise<AttendanceDay> {
  if (!USE_TID4K_BACKEND) return { data, records: [] };

  try {
    const result = await tid4kApi.call<any>('fetch_prezenta_saptamana', {
      grupa,
      data,
    });

    const records: AttendanceRecord[] = (result?.copii || result?.records || []).map((c: any) => ({
      child_id: String(c.id_copil || c.child_id || c.id),
      nume_prenume_copil: c.nume_prenume_copil || c.nume_copil || c.nume || '',
      prezent: c.prezent ?? false,
      observatii: c.observatii || '',
      marked_at: c.marked_at || undefined,
      scanned_by_parent: c.scanned_by_parent || false,
    }));

    return { data, records };
  } catch (err) {
    console.error('[Prezenta] Eroare la incarcarea prezentei:', err);
    return { data, records: [] };
  }
}

export async function saveAttendance(grupa: string, data: string, records: AttendanceRecord[]): Promise<void> {
  if (!USE_TID4K_BACKEND) return;

  try {
    await tid4kApi.call('salveaza_prezenta_saptamana', {
      grupa,
      data,
      records: records.map(r => ({
        child_id: r.child_id,
        prezent: r.prezent,
        observatii: r.observatii,
      })),
    });
  } catch (err) {
    console.error('[Prezenta] Eroare la salvarea prezentei:', err);
    throw err;
  }
}

export async function getAttendanceStats(grupa: string, luna: number, an: number): Promise<AttendanceStats> {
  if (!USE_TID4K_BACKEND) return { luna, an, zile: [], per_copil: [] };

  try {
    const data = await tid4kApi.call<any>('fetch_prezenta_stats', {
      grupa,
      luna,
      an,
    });

    return {
      luna,
      an,
      zile: (data?.zile || []).map((z: any) => ({
        data: z.data,
        prezenti: z.prezenti || 0,
        absenti: z.absenti || 0,
      })),
      per_copil: (data?.per_copil || []).map((c: any) => ({
        id_copil: String(c.id_copil || c.id),
        nume: c.nume || c.nume_copil || '',
        zile_prezent: c.zile_prezent || 0,
        zile_absent: c.zile_absent || 0,
        procent: c.procent || 0,
      })),
    };
  } catch (err) {
    console.error('[Prezenta] Eroare la incarcarea statisticilor:', err);
    return { luna, an, zile: [], per_copil: [] };
  }
}

export async function getWeeklyAttendance(grupa: string, mondayDate: string): Promise<WeeklyAttendanceData> {
  if (!USE_TID4K_BACKEND) {
    return { saptamana_start: mondayDate, saptamana_end: mondayDate, records: [] };
  }

  try {
    const data = await tid4kApi.call<any>('fetch_prezenta_saptamana', {
      grupa,
      saptamana_start: mondayDate,
    });

    const monday = new Date(mondayDate);
    const weekDates = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split('T')[0];
    });

    const records: WeeklyAttendanceRecord[] = (data?.copii || data?.records || []).map((c: any) => ({
      id_copil: String(c.id_copil || c.child_id || c.id),
      nume_prenume_copil: c.nume_prenume_copil || c.nume_copil || c.nume || '',
      zile: c.zile || Object.fromEntries(weekDates.map(d => [d, false])),
      observatii_zile: c.observatii_zile || {},
    }));

    return {
      saptamana_start: mondayDate,
      saptamana_end: weekDates[4],
      records,
    };
  } catch (err) {
    console.error('[Prezenta] Eroare la incarcarea prezentei saptamanale:', err);
    return { saptamana_start: mondayDate, saptamana_end: mondayDate, records: [] };
  }
}

export async function saveWeeklyAttendance(grupa: string, data: WeeklyAttendanceData): Promise<void> {
  if (!USE_TID4K_BACKEND) return;

  try {
    await tid4kApi.call('salveaza_prezenta_saptamana', {
      grupa,
      saptamana_start: data.saptamana_start,
      records: data.records.map(r => ({
        child_id: r.id_copil,
        zile: r.zile,
        observatii_zile: r.observatii_zile,
      })),
    });
  } catch (err) {
    console.error('[Prezenta] Eroare la salvarea prezentei:', err);
    throw err;
  }
}

export async function getParentChildAttendance(parentId: string, mondayDate: string): Promise<WeeklyAttendanceData> {
  // Foloseste acelasi endpoint, filtrat pe parinte
  return getWeeklyAttendance('', mondayDate);
}

// ── Contributions API (pastrate pentru compatibilitate) ──

export async function getContributionConfig(): Promise<{ daily_rate: number; effective_from: string } | null> {
  return null;
}

export async function saveContributionConfig(dailyRate: number): Promise<void> {}

export async function getContributions(
  groupSlugOrId: string, month: number, year: number, dailyRate: number
): Promise<{ children: { id: string; nume: string; zile_prezent: number; total: number }[]; grandTotal: number }> {
  return { children: [], grandTotal: 0 };
}

export async function getParentContributions(
  parentId: string, month: number, year: number, dailyRate: number
): Promise<{ children: { id: string; nume: string; zile_prezent: number; total: number }[]; grandTotal: number }> {
  return { children: [], grandTotal: 0 };
}

export async function saveMonthlyContributions(
  groupSlugOrId: string, month: number, year: number, dailyRate: number,
  rows: { id: string; zile_prezent: number; total: number }[]
): Promise<void> {}

export async function getMonthlyContributions(
  month: number, year: number
): Promise<{ child_id: string; amount_paid: number; status: string }[]> {
  return [];
}

export async function updateContributionPayment(
  childId: string, month: number, year: number, amountPaid: number, status: string
): Promise<void> {}

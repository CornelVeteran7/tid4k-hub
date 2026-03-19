/**
 * API Prezenta - conectat la TID4K backend
 *
 * Endpoint-uri: fetch_prezenta_saptamana, salveaza_prezenta_saptamana
 *
 * IMPORTANT: PHP-ul foloseste format cu zile romanesti:
 *   copii: [{ id_copil, nume_copil, prezenta: { luni: true, marti: null, ... } }]
 *   zile: { luni: "2026-03-09", marti: "2026-03-10", ... }
 */

import { tid4kApi } from './tid4kClient';
import { USE_TID4K_BACKEND } from './config';
import { emitAttendanceUpdated } from '@/utils/attendanceSync';
import type {
  AttendanceRecord,
  AttendanceDay,
  AttendanceStats,
  WeeklyAttendanceData,
  WeeklyAttendanceRecord,
} from '@/types';

// Mapare zile romanesti -> index (0=luni, 4=vineri)
const ZILE_RO = ['luni', 'marti', 'miercuri', 'joi', 'vineri'] as const;

/**
 * Determina numele zilei romanesti dintr-o data ISO (yyyy-MM-dd)
 */
function getZiRo(dateStr: string): string | null {
  const d = new Date(dateStr + 'T12:00:00'); // evitam probleme timezone
  const dayOfWeek = d.getDay(); // 0=duminica, 1=luni, ...
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    return ZILE_RO[dayOfWeek - 1];
  }
  return null;
}

/**
 * Incarca prezenta pentru o singura zi.
 * PHP-ul returneaza saptamana intreaga - noi extragem doar ziua ceruta.
 */
export async function getAttendance(grupa: string, data: string): Promise<AttendanceDay> {
  if (!USE_TID4K_BACKEND) return { data, records: [] };

  try {
    const result = await tid4kApi.call<any>('fetch_prezenta_saptamana', {
      grupa,
    });

    if (result?.error === 'Neautentificat' || result?.error) {
      console.warn('[Prezenta] Backend-ul a returnat eroare:', result.error);
      return { data, records: [] };
    }

    const rawCopii = result?.copii || [];
    if (!Array.isArray(rawCopii) || rawCopii.length === 0) {
      return { data, records: [] };
    }

    // Determina ce zi romaneasca corespunde datei cerute
    const ziRo = getZiRo(data);

    const records: AttendanceRecord[] = rawCopii.map((c: any) => ({
      child_id: String(c.id_copil || c.child_id || c.id),
      nume_prenume_copil: c.nume_copil || c.nume_prenume_copil || c.nume || '',
      prezent: ziRo && c.prezenta ? (c.prezenta[ziRo] === true) : false,
      observatii: '',
      marked_at: undefined,
      scanned_by_parent: false,
    }));

    return { data, records };
  } catch (err) {
    console.error('[Prezenta] Eroare la incarcarea prezentei:', err);
    return { data, records: [] };
  }
}

/**
 * Salveaza prezenta pentru o singura zi.
 * Construieste formatul asteptat de salveaza_prezenta_saptamana.php:
 *   { copii: [{id_copil, prezenta: {luni: true}}], zile: {luni: "2026-03-09"} }
 */
export async function saveAttendance(grupa: string, data: string, records: AttendanceRecord[]): Promise<void> {
  if (!USE_TID4K_BACKEND) return;

  const ziRo = getZiRo(data);
  if (!ziRo) {
    console.warn('[Prezenta] Data nu e in zilele lucratoare:', data);
    return;
  }

  // Construim formatul PHP: copii cu prezenta pe zile romanesti
  const copii = records.map(r => ({
    id_copil: parseInt(r.child_id, 10) || r.child_id,
    prezenta: { [ziRo]: r.prezent },
  }));

  // Zile: doar ziua curenta
  const zile: Record<string, string> = { [ziRo]: data };

  try {
    await tid4kApi.call('salveaza_prezenta_saptamana', {
      grupa,
      copii,
      zile,
    });
    emitAttendanceUpdated(grupa, data);
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

/**
 * Incarca prezenta saptamanala.
 * PHP returneaza prezenta: { luni: true/false/null, ... } si zile: { luni: "2026-03-09", ... }
 * React are nevoie de zile: { "2026-03-09": true, ... }
 */
export async function getWeeklyAttendance(grupa: string, mondayDate: string): Promise<WeeklyAttendanceData> {
  if (!USE_TID4K_BACKEND) {
    return { saptamana_start: mondayDate, saptamana_end: mondayDate, records: [] };
  }

  try {
    const result = await tid4kApi.call<any>('fetch_prezenta_saptamana', {
      grupa,
    });

    // PHP returneaza zile: { luni: "2026-03-09", ... }
    const zilePHP = result?.zile || {};

    const monday = new Date(mondayDate);
    const weekDates = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split('T')[0];
    });

    const rawCopii = result?.copii || [];

    const records: WeeklyAttendanceRecord[] = rawCopii.map((c: any) => {
      // Convertim prezenta din format { luni: true } la { "2026-03-09": true }
      const zileConverted: Record<string, boolean> = {};
      for (const zi of ZILE_RO) {
        const dateForZi = zilePHP[zi];
        if (dateForZi) {
          zileConverted[dateForZi] = c.prezenta?.[zi] === true;
        }
      }
      // Asiguram ca toate zilele saptamanii sunt prezente
      for (const d of weekDates) {
        if (!(d in zileConverted)) {
          zileConverted[d] = false;
        }
      }

      return {
        id_copil: String(c.id_copil || c.child_id || c.id),
        nume_prenume_copil: c.nume_copil || c.nume_prenume_copil || c.nume || '',
        zile: zileConverted,
        observatii_zile: c.observatii_zile || {},
      };
    });

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

/**
 * Salveaza prezenta saptamanala.
 * Converteste din formatul React { zile: { "2026-03-09": true } }
 * in formatul PHP { copii: [{ id_copil, prezenta: { luni: true } }], zile: { luni: "2026-03-09" } }
 */
export async function saveWeeklyAttendance(grupa: string, data: WeeklyAttendanceData): Promise<void> {
  if (!USE_TID4K_BACKEND) return;

  // Construim maparea inversa: data ISO -> zi romaneasca
  const dateToZiRo: Record<string, string> = {};
  const zilePHP: Record<string, string> = {};

  // Calculam zilele saptamanii
  const monday = new Date(data.saptamana_start);
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const zi = ZILE_RO[i];
    dateToZiRo[dateStr] = zi;
    zilePHP[zi] = dateStr;
  }

  const copii = data.records.map(r => {
    const prezenta: Record<string, boolean> = {};
    for (const [dateStr, val] of Object.entries(r.zile)) {
      const zi = dateToZiRo[dateStr];
      if (zi) {
        prezenta[zi] = val;
      }
    }
    return {
      id_copil: parseInt(r.id_copil, 10) || r.id_copil,
      prezenta,
    };
  });

  try {
    await tid4kApi.call('salveaza_prezenta_saptamana', {
      grupa,
      copii,
      zile: zilePHP,
    });
    // Emit pentru fiecare zi din saptamana - permite sync instant
    const today = new Date().toISOString().split('T')[0];
    emitAttendanceUpdated(grupa, today);
  } catch (err) {
    console.error('[Prezenta] Eroare la salvarea prezentei:', err);
    throw err;
  }
}

export async function getParentChildAttendance(parentId: string, mondayDate: string): Promise<WeeklyAttendanceData> {
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

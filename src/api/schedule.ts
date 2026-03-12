/**
 * API Orar - conectat la TID4K backend
 *
 * Orarul este citit din tabelele TID4K existente.
 * Cancelaria foloseste endpoint-uri dedicate.
 */

import { tid4kApi } from './tid4kClient';
import { USE_TID4K_BACKEND } from './config';
import type { ScheduleCell, CancelarieTeacher } from '@/types';

export async function getSchedule(groupId: string): Promise<ScheduleCell[]> {
  if (!USE_TID4K_BACKEND) return [];

  try {
    // Apelam gateway-ul - endpoint de creat pentru orar
    const data = await tid4kApi.call<any>('fetch_orar', {
      grupa: groupId,
    });

    const celule = Array.isArray(data) ? data : (data?.orar || data?.celule || []);

    return celule.map((c: any) => ({
      id: String(c.id || `${c.zi}-${c.ora}`),
      zi: c.zi || '',
      ora: c.ora || '',
      materie: c.materie || c.disciplina || '',
      profesor: c.profesor || c.nume_profesor || '',
      sala: c.sala || '',
      culoare: c.culoare || '#E3F2FD',
    }));
  } catch (err) {
    console.error('[Orar] Eroare la incarcarea orarului:', err);
    return [];
  }
}

export async function saveSchedule(groupId: string, cells: ScheduleCell[]): Promise<void> {
  if (!USE_TID4K_BACKEND) return;

  try {
    await tid4kApi.call('salveaza_orar', {
      grupa: groupId,
      celule: cells.map(c => ({
        zi: c.zi,
        ora: c.ora,
        materie: c.materie,
        profesor: c.profesor,
        sala: c.sala || '',
        culoare: c.culoare,
      })),
    });
  } catch (err) {
    console.error('[Orar] Eroare la salvarea orarului:', err);
    throw err;
  }
}

export async function getCancelarieTeachers(): Promise<CancelarieTeacher[]> {
  if (!USE_TID4K_BACKEND) return [];

  try {
    // Cancelaria - endpoint dedicat existent
    const data = await tid4kApi.call<any>('fetch_cancelarie', {});

    const profesori = Array.isArray(data) ? data : (data?.profesori || []);

    return profesori.map((t: any) => ({
      id: String(t.id || t.id_profesor || ''),
      nume: t.nume || t.nume_prenume || '',
      avatar_url: t.avatar_url || t.avatar || '/placeholder.svg',
      qr_data: t.qr_data || t.qr_code || '',
      absent_dates: (t.absent_dates || t.zile_absenta || []).map(String),
      activitati: (t.activitati || []).map((a: any) => ({
        data: a.data || '',
        descriere: a.descriere || '',
      })),
    }));
  } catch (err) {
    console.error('[Orar] Eroare la incarcarea cancelariei:', err);
    return [];
  }
}

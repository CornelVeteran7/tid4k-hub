/**
 * API Orar - conectat la TID4K backend
 *
 * Orarul este citit din tabelele TID4K existente.
 * Cancelaria foloseste endpoint-uri dedicate.
 */

import { tid4kApi } from './tid4kClient';
import { USE_TID4K_BACKEND } from './config';
import type { ScheduleCell, ScheduleEntry, CancelarieTeacher } from '@/types';

// Paleta de culori per materie
const CULORI = ['#E3F2FD', '#E8F5E9', '#FFF3E0', '#F3E5F5', '#FFEBEE', '#E0F7FA', '#FFF8E1', '#F1F8E9'];

function mapCelule(data: any): ScheduleCell[] {
  const celule = Array.isArray(data) ? data : (data?.celule || []);
  const culoareMaterie: Record<string, string> = {};
  let idx = 0;

  // Grupam celulele cu aceeasi zi+ora (multiple materii per slot)
  const grupeZiOra: Record<string, any[]> = {};
  for (const c of celule) {
    const key = `${c.zi || ''}-${c.ora || ''}`;
    if (!grupeZiOra[key]) grupeZiOra[key] = [];
    grupeZiOra[key].push(c);
  }

  return Object.values(grupeZiOra).map((group) => {
    const first = group[0];
    const materie = first.materie || first.disciplina || '';
    if (materie && !culoareMaterie[materie]) {
      culoareMaterie[materie] = CULORI[idx % CULORI.length];
      idx++;
    }

    const entries: ScheduleEntry[] = group.map((c: any) => ({
      materie: c.materie || c.disciplina || '',
      profesor: c.profesor || c.nume_profesor || '',
      sala: c.sala || '',
      clasa: c.clasa || '',
    }));

    return {
      id: String(first.id || `${first.zi}-${first.ora}`),
      zi: first.zi || '',
      ora: first.ora || '',
      materie,
      profesor: first.profesor || first.nume_profesor || '',
      sala: first.sala || '',
      clasa: first.clasa || '',
      culoare: first.culoare || culoareMaterie[materie] || '#E3F2FD',
      entries: entries.length > 1 ? entries : undefined,
    };
  });
}

export interface ScheduleData {
  cells: ScheduleCell[];
  profesorAvatars: Record<string, string>;
  profesorQrcodes: Record<string, string>;
}

export async function getSchedule(): Promise<ScheduleCell[]> {
  const data = await getScheduleWithAvatars();
  return data.cells;
}

export async function getScheduleWithAvatars(): Promise<ScheduleData> {
  if (!USE_TID4K_BACKEND) return { cells: [], profesorAvatars: {}, profesorQrcodes: {} };

  try {
    const data = await tid4kApi.call<any>('fetch_orar', {
      clasa_grupa: 'CANCELARIE',
    });

    if (data?.success !== false) {
      return {
        cells: mapCelule(data),
        profesorAvatars: data?.profesor_avatars || {},
        profesorQrcodes: data?.profesor_qrcodes || {},
      };
    }

    return { cells: [], profesorAvatars: {}, profesorQrcodes: {} };
  } catch (err) {
    console.error('[Orar] Eroare la incarcarea orarului:', err);
    return { cells: [], profesorAvatars: {}, profesorQrcodes: {} };
  }
}

export async function saveSchedule(cells: ScheduleCell[], profesorAvatars?: Record<string, string>): Promise<void> {
  if (!USE_TID4K_BACKEND) return;

  try {
    // Orarul este unic per unitate scolara - intotdeauna CANCELARIE
    // Expandam entries inapoi in celule individuale (multiple materii per slot)
    const celuleExpandate: any[] = [];
    for (const c of cells) {
      if (c.entries && c.entries.length > 0) {
        for (const entry of c.entries) {
          celuleExpandate.push({
            zi: c.zi,
            ora: c.ora,
            materie: entry.materie,
            profesor: entry.profesor,
            sala: entry.sala || '',
            clasa: entry.clasa || '',
            culoare: c.culoare,
          });
        }
      } else {
        celuleExpandate.push({
          zi: c.zi,
          ora: c.ora,
          materie: c.materie,
          profesor: c.profesor,
          sala: c.sala || '',
          clasa: c.clasa || '',
          culoare: c.culoare,
        });
      }
    }

    const params: Record<string, any> = {
      clasa_grupa: 'CANCELARIE',
      celule: celuleExpandate,
    };

    if (profesorAvatars && Object.keys(profesorAvatars).length > 0) {
      params.profesor_avatars = profesorAvatars;
    }

    await tid4kApi.call('salveaza_orar_structurat', params);
  } catch (err) {
    console.error('[Orar] Eroare la salvarea orarului:', err);
    throw err;
  }
}

export async function getCancelarieTeachers(): Promise<CancelarieTeacher[]> {
  if (!USE_TID4K_BACKEND) return [];

  try {
    const data = await tid4kApi.call<any>('fetch_orar', {
      clasa_grupa: 'CANCELARIE',
    });

    if (data?.success === false) return [];

    const profesori = data?.profesori || [];
    const qrcodes: Record<string, string> = data?.profesor_qrcodes || {};
    const avatars: Record<string, string> = data?.profesor_avatars || {};

    return profesori.map((nume: string, i: number) => ({
      id: String(i + 1),
      nume,
      avatar_url: avatars[nume] || '',
      qr_data: qrcodes[nume] || '',
      absent_dates: [],
      activitati: [],
    }));
  } catch (err) {
    console.error('[Orar] Eroare la incarcarea cancelariei:', err);
    return [];
  }
}

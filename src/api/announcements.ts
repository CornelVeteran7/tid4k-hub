/**
 * API Anunturi - conectat la TID4K backend
 *
 * Endpoint-uri: fetch_anunturi, salveaza_anuntul
 */

import { tid4kApi } from './tid4kClient';
import { USE_TID4K_BACKEND } from './config';
import type { Announcement } from '@/types';

export async function getAnnouncements(grupa?: string): Promise<Announcement[]> {
  if (!USE_TID4K_BACKEND) return [];

  try {
    const data = await tid4kApi.call<any>('fetch_anunturi', {
      all: '1',
      include_expirate: '0',
    });

    // Adapteaza raspunsul TID4K la formatul Announcement
    const anunturi = Array.isArray(data) ? data : (data?.anunturi || data?.lista || []);

    return anunturi.map((a: any, index: number) => ({
      id: String(a.id || a.id_anunt || index),
      titlu: a.titlu || a.text_preview || a.text_complet || a.subiect || '',
      continut: a.text_complet || a.text_preview || a.continut || a.mesaj || '',
      continut_html: a.continut_html || '',
      imagine: a.imagine || '',
      data_upload: a.data_upload || a.data || a.created_at || new Date().toISOString(),
      data_expirare: a.data_expirare || '',
      autor: a.autor || a.autor_nume || a.expeditor || '',
      prioritate: (a.prioritate === 'urgent' ? 'urgent' : 'normal') as 'normal' | 'urgent',
      target: a.target || a.destinatar || grupa || 'scoala',
      citit: a.citit || false,
      ascuns_banda: a.ascuns_banda ? true : false,
      pozitie_banda: a.pozitie_banda || undefined,
    }));
  } catch (err) {
    console.error('[Anunturi] Eroare la incarcarea anunturilor:', err);
    return [];
  }
}

export async function createAnnouncement(ann: Partial<Announcement>): Promise<Announcement> {
  if (!USE_TID4K_BACKEND) {
    throw new Error('Backend indisponibil');
  }

  try {
    const data = await tid4kApi.call<any>('salveaza_anuntul', {
      continut: ann.continut || '',
      titlu: ann.titlu || '',
      prioritate: ann.prioritate || 'normal',
      target: ann.target || 'scoala',
    });

    return {
      id: String(data?.id || Date.now()),
      titlu: ann.titlu || '',
      continut: ann.continut || '',
      data_upload: new Date().toISOString(),
      autor: ann.autor || '',
      prioritate: (ann.prioritate || 'normal') as 'normal' | 'urgent',
      target: ann.target || 'scoala',
      citit: false,
      ascuns_banda: false,
    };
  } catch (err) {
    console.error('[Anunturi] Eroare la crearea anuntului:', err);
    throw err;
  }
}

export async function markAsRead(announcementId: string): Promise<void> {
  // TODO: endpoint de marcare ca citit pe server
  console.log('[Anunturi] markAsRead:', announcementId);
}

export async function hideFromTicker(id: string): Promise<void> {
  console.log('[Anunturi] hideFromTicker:', id);
}

export async function restoreToTicker(id: string): Promise<void> {
  console.log('[Anunturi] restoreToTicker:', id);
}

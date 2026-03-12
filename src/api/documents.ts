/**
 * API Documente - conectat la TID4K backend
 *
 * Endpoint-uri: fetch_iframes, fetch_images
 */

import { tid4kApi } from './tid4kClient';
import { USE_TID4K_BACKEND, API_BASE_URL } from './config';
import type { DocumentItem } from '@/types';

/** Construieste URL pentru servire fisier din BD */
function urlFisier(idInfo: string, grupa: string, thumb = false): string {
  const grupaEncoded = encodeURIComponent(grupa.replace(/ /g, '_'));
  return `${API_BASE_URL}/pages/serve_fisier_hub.php?id=${idInfo}&grupa=${grupaEncoded}${thumb ? '&thumb=1' : ''}`;
}

export async function getDocuments(grupa: string): Promise<DocumentItem[]> {
  if (!USE_TID4K_BACKEND) return [];

  try {
    // Incarcam si documente (PDF) si imagini in paralel
    // Trimitem grupa ca parametru pentru a suprascrie grupa din sesiune
    const [dataIframes, dataImages] = await Promise.all([
      tid4kApi.call<any>('fetch_iframes', { grupa }).catch(() => ({ files_utilizator: [], files_profesor: [] })),
      tid4kApi.call<any>('fetch_images', { grupa }).catch(() => ({ files_utilizator: [], files_profesor: [] })),
    ]);

    // Combina fisiere din ambele surse
    // fetch_iframes returneaza fisiere_utilizator/fisiere_profesor
    // fetch_images returneaza files_utilizator/files_profesor
    const toateIframes = [
      ...(dataIframes?.fisiere_utilizator || dataIframes?.files_utilizator || []),
      ...(dataIframes?.fisiere_profesor || dataIframes?.files_profesor || []),
    ];
    const toateImages = [
      ...(dataImages?.files_utilizator || []),
      ...(dataImages?.files_profesor || []),
    ];

    const toate = [...toateIframes, ...toateImages];

    // Grupa pentru URL-uri (format cu underscore pt tabela)
    // grupa vine din GroupContext ca "grupa mare C" sau "clasa I"
    const grupaUrl = grupa.replace(/ /g, '_');

    // Filtram pe categorie daca e specificata
    return toate.map((d: any, index: number) => {
      const ext = d.extensie || '';
      const tipFisier = d.tip_fisier || '';
      const esteImagine = tipFisier.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
      const catAuto = esteImagine ? 'fotografii' : 'activitati';
      const idInfo = String(d.id_info || d.id || index);

      return {
        id: idInfo,
        nume_fisier: d.nume_fisier || '',
        tip_fisier: (ext || 'pdf') as DocumentItem['tip_fisier'],
        categorie: (catAuto) as DocumentItem['categorie'],
        data_upload: d.data_upload || '',
        uploadat_de: d.nume_prenume || '',
        uploadat_de_id: String(d.id_utilizator || ''),
        url: urlFisier(idInfo, grupaUrl),
        thumbnail_url: esteImagine ? urlFisier(idInfo, grupaUrl, true) : undefined,
        marime: 0,
      };
    });
  } catch (err) {
    console.error('[Documente] Eroare la incarcarea documentelor:', err);
    return [];
  }
}

export async function uploadDocument(grupa: string, file: File, categorie: string): Promise<DocumentItem> {
  console.warn('[Documente] uploadDocument - de implementat endpoint pe server');
  throw new Error('Upload documente nu este implementat inca');
}

export async function deleteDocument(id: string): Promise<void> {
  console.warn('[Documente] deleteDocument - de implementat endpoint pe server');
}

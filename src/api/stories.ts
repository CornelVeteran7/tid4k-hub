/**
 * API Povesti - conectat la TID4K backend
 *
 * Endpoint-uri: fetch_povesti, salveaza_poveste
 */

import { tid4kApi } from './tid4kClient';
import { USE_TID4K_BACKEND } from './config';
import type { Story } from '@/types';

export async function getStories(): Promise<Story[]> {
  if (!USE_TID4K_BACKEND) return [];

  try {
    const data = await tid4kApi.call<any>('fetch_povesti', {
      all: '1',
    });

    const povesti = Array.isArray(data) ? data : (data?.povesti || data?.lista || []);

    return povesti.map((p: any, index: number) => {
      const hasVideo = !!p.video_url;
      const hasAudio = !!p.audio_url || !!p.citeste_povestea;
      const media_type: Story['media_type'] = hasVideo ? 'video' : hasAudio ? 'audio' : 'text';

      return {
        id: String(p.id || p.id_infobox || p.id_poveste || index),
        titlu: p.titlu || p.nume_fisier || p.titlu_poveste || '',
        continut: p.continut || p.text_complet || p.text_preview || p.text || '',
        categorie: (p.categorie || 'educative') as Story['categorie'],
        varsta: (p.varsta || '3-5') as Story['varsta'],
        thumbnail: p.thumbnail || p.imagine || undefined,
        audio_url: p.audio_url || undefined,
        video_url: p.video_url || undefined,
        media_type,
        favorit: p.favorit || false,
        data_upload: p.data_upload || undefined,
        autor: p.uploader || undefined,
      };
    });
  } catch (err) {
    console.error('[Povesti] Eroare la incarcarea povestilor:', err);
    return [];
  }
}

export async function createStory(story: Partial<Story>): Promise<Story> {
  if (!USE_TID4K_BACKEND) {
    throw new Error('Backend indisponibil');
  }

  try {
    const data = await tid4kApi.call<any>('salveaza_poveste', {
      titlu: story.titlu || '',
      text: story.continut || '',
      nou: '1',
      categorie: story.categorie || 'educative',
      varsta: story.varsta || '3-5',
    });

    return {
      id: String(data?.id || Date.now()),
      titlu: story.titlu || '',
      continut: story.continut || '',
      categorie: (story.categorie || 'educative') as Story['categorie'],
      varsta: (story.varsta || '3-5') as Story['varsta'],
      thumbnail: story.thumbnail || undefined,
      audio_url: story.audio_url || undefined,
      favorit: false,
    };
  } catch (err) {
    console.error('[Povesti] Eroare la crearea povestii:', err);
    throw err;
  }
}

export async function updateStory(id: string, text: string): Promise<boolean> {
  if (!USE_TID4K_BACKEND) throw new Error('Backend indisponibil');

  const data = await tid4kApi.call<any>('salveaza_poveste', {
    id,
    text,
  });

  console.log('[Povesti] Răspuns salvare:', data);

  if (data?.succes === false) {
    throw new Error(data?.mesaj || 'Eroare la salvarea poveștii');
  }

  return true;
}

export async function deleteStory(id: string): Promise<boolean> {
  if (!USE_TID4K_BACKEND) throw new Error('Backend indisponibil');

  const data = await tid4kApi.call<any>('delete_povesti', { id });

  if (data?.success === false) {
    throw new Error(data?.message || 'Eroare la ștergerea poveștii');
  }

  return true;
}

export async function generateTTS(text: string, characterId: string = 'inky', speed: number = 1): Promise<string> {
  // Apelează PHP openai_tts.php prin gateway — cache pe server per text+voce+speed
  const data = await tid4kApi.call<{ succes: boolean; urlAudio: string; dinCache: boolean }>('openai_tts', {
    text,
    characterId,
    speed,
  });

  if (!data?.succes || !data?.urlAudio) {
    throw new Error('TTS: răspuns invalid de la server');
  }

  return data.urlAudio;
}

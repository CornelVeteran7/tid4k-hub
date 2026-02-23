import { USE_MOCK, apiFetch } from './config';

export interface FacebookSettings {
  page_id: string;
  token_status: 'activ' | 'expirat';
  posting_format: string;
}

export interface FacebookPost {
  id: number;
  content: string;
  posted_at: string;
  status: 'posted' | 'scheduled' | 'failed';
}

export async function getFacebookSettings(): Promise<FacebookSettings> {
  if (USE_MOCK) return { page_id: '123456789', token_status: 'activ', posting_format: 'text+image' };
  return apiFetch<FacebookSettings>('/facebook.php?action=settings');
}

export async function postToFacebook(content: string, imageUrl?: string): Promise<FacebookPost> {
  if (USE_MOCK) return { id: Date.now(), content, posted_at: new Date().toISOString(), status: 'posted' };
  return apiFetch<FacebookPost>('/facebook.php?action=post', { method: 'POST', body: JSON.stringify({ content, imageUrl }) });
}

export async function getPostLog(): Promise<FacebookPost[]> {
  if (USE_MOCK) {
    return [
      { id: 1, content: 'Activitate de pictură - Grupa Mare', posted_at: '2026-02-23T09:30:00', status: 'posted' },
      { id: 2, content: 'Excursie planificată pentru luna martie', posted_at: '2026-02-22T14:00:00', status: 'posted' },
    ];
  }
  return apiFetch<FacebookPost[]>('/facebook.php?action=log');
}

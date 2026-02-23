import { USE_MOCK, apiFetch } from './config';
import type { InfodisplayConfig } from '@/types';

const mockConfig: InfodisplayConfig = {
  panels: [
    { id: 1, tip: 'anunt', continut: 'Excursie la Grădina Botanică - 5 Martie 2026', durata: 8, ordine: 1 },
    { id: 2, tip: 'meniu', continut: 'Meniul zilei: Supă de legume, Piept de pui cu piure', durata: 10, ordine: 2 },
    { id: 3, tip: 'orar', continut: 'Program: 08:00 - 16:00', durata: 8, ordine: 3 },
    { id: 4, tip: 'foto', continut: 'Galerie activități recent', durata: 12, ordine: 4 },
  ],
  ticker_messages: [
    'Bine ați venit la Grădinița Floarea Soarelui! 🌻',
    'Atenție: Modificare program mâine - deschidere la 8:30',
    'Meniul pentru luna martie a fost actualizat',
    'Înscrieri pentru activitatea de dans - până pe 28 februarie',
  ],
  qr_codes: [
    { label: 'TID4K App', url: 'https://tid4k.ro' },
    { label: 'Meniu Săptămânal', url: 'https://tid4k.ro/meniu' },
  ],
  transition: 'fade',
};

export async function getInfodisplayContent(): Promise<InfodisplayConfig> {
  if (USE_MOCK) return mockConfig;
  return apiFetch<InfodisplayConfig>('/infodisplay.php?action=content');
}

export async function generateVideo(type: string): Promise<{ video_url: string }> {
  if (USE_MOCK) return { video_url: '' };
  return apiFetch('/infodisplay.php?action=generate_video', { method: 'POST', body: JSON.stringify({ type }) });
}

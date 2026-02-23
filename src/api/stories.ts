import { USE_MOCK, apiFetch } from './config';
import type { Story } from '@/types';

const mockStories: Story[] = [
  { id_poveste: 1, titlu: 'Capra cu Trei Iezi', continut: 'A fost odată ca niciodată o capră care avea trei iezi. Într-o zi, capra trebuia să plece la piață și le-a spus iezilor să nu deschidă ușa nimănui...\n\nIezii au rămas singuri acasă. Lupul cel rău a venit și a încercat să intre în casă. A bătut la ușă și a spus cu voce groasă: "Deschideți, dragii mamei, că v-am adus lapte proaspăt!"\n\nDar iezii au recunoscut vocea lupului și nu au deschis. Lupul s-a dus la fierar și și-a subțiat vocea...', categorie: 'morale', varsta: '3-5', favorit: true },
  { id_poveste: 2, titlu: 'Ursul Păcălit de Vulpe', continut: 'Într-o pădure mare, trăia un urs voinic dar cam naiv. Într-o zi, vulpea cea șireată l-a păcălit să-și bage coada în lac ca să prindă pește...\n\nUrsul a stat toată noaptea cu coada în apă, până când lacul a înghețat. Dimineața, când a vrut să se ridice, coada i s-a rupt.', categorie: 'distractive', varsta: '3-5', favorit: false },
  { id_poveste: 3, titlu: 'Făt-Frumos din Lacrimă', continut: 'A fost odată un împărat care nu avea copii. Un vrăjitor i-a dăruit o lacrimă magică din care s-a născut un băiat frumos și viteaz...', categorie: 'educative', varsta: '5-7', favorit: false },
  { id_poveste: 4, titlu: 'Povestea Albinuței Hărnicuțe', continut: 'Într-o grădină plină de flori, trăia o albinuță mică dar foarte harnică. În fiecare dimineață, ea zbura din floare în floare, colectând polen și nectar...', categorie: 'educative', varsta: '3-5', favorit: true },
  { id_poveste: 5, titlu: 'Aventurile lui Harap-Alb', continut: 'Într-un ținut îndepărtat, trăia un împărat cu trei feciori. Cel mai mic, deși părăa cel mai slab, era de fapt cel mai curajos și deștept...', categorie: 'morale', varsta: '7-10', favorit: false },
];

export async function getStories(): Promise<Story[]> {
  if (USE_MOCK) return mockStories;
  return apiFetch<Story[]>('/povesti.php?action=list');
}

export async function createStory(story: Partial<Story>): Promise<Story> {
  if (USE_MOCK) return { ...story, id_poveste: Date.now() } as Story;
  return apiFetch<Story>('/povesti.php?action=create', { method: 'POST', body: JSON.stringify(story) });
}

export async function generateTTS(id: number): Promise<{ audio_url: string }> {
  if (USE_MOCK) return { audio_url: '' };
  return apiFetch(`/povesti.php?action=tts&id=${id}`, { method: 'POST' });
}

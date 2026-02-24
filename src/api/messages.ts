import { USE_MOCK, apiFetch } from './config';
import type { Conversation, Message } from '@/types';

const mockConversations: Conversation[] = [
  {
    id: 1,
    contact_nume: 'Ion Ionescu',
    contact_id: 2,
    ultimul_mesaj: 'Bună ziua, voiam să întreb despre tema de azi.',
    data_ultimul_mesaj: '2026-02-24T10:30:00',
    necitite: 2,
    grupa: 'grupa_mare',
  },
  {
    id: 2,
    contact_nume: 'Andrei Pârvu',
    contact_id: 6,
    ultimul_mesaj: 'Mulțumesc pentru informații! O zi bună.',
    data_ultimul_mesaj: '2026-02-23T15:45:00',
    necitite: 0,
    grupa: 'grupa_mare',
  },
  {
    id: 3,
    contact_nume: 'Ana Dumitrescu',
    contact_id: 3,
    ultimul_mesaj: 'Am pregătit materialele pentru mâine.',
    data_ultimul_mesaj: '2026-02-21T09:15:00',
    necitite: 1,
    grupa: 'grupa_mare',
  },
  {
    id: 4,
    contact_nume: 'Elena Marinescu',
    contact_id: 7,
    ultimul_mesaj: 'Putem programa o întâlnire săptămâna viitoare?',
    data_ultimul_mesaj: '2026-02-20T14:20:00',
    necitite: 0,
    grupa: 'grupa_mica',
  },
  {
    id: 5,
    contact_nume: 'Mihai Georgescu',
    contact_id: 8,
    ultimul_mesaj: 'Radu a fost foarte cuminte azi! 🌟',
    data_ultimul_mesaj: '2026-02-19T16:00:00',
    necitite: 0,
    grupa: 'grupa_mare',
  },
];

const mockMessagesByConvo: Record<number, Message[]> = {
  1: [
    { id_mesaj: 1, expeditor: 2, expeditor_nume: 'Ion Ionescu', destinatar: 1, mesaj: 'Bună ziua, doamna Maria!', data: '2026-02-23T10:25:00', citit: true },
    { id_mesaj: 2, expeditor: 1, expeditor_nume: 'Maria Popescu', destinatar: 2, mesaj: 'Bună ziua! Cu ce vă pot ajuta?', data: '2026-02-23T10:27:00', citit: true },
    { id_mesaj: 3, expeditor: 2, expeditor_nume: 'Ion Ionescu', destinatar: 1, mesaj: 'Voiam să întreb dacă Alexia are ceva temă specială pentru mâine.', data: '2026-02-23T10:30:00', citit: true },
    { id_mesaj: 4, expeditor: 1, expeditor_nume: 'Maria Popescu', destinatar: 2, mesaj: 'Da, trebuie să facă un desen cu tema "Primăvara". Are nevoie de creioane colorate și o coală A3.', data: '2026-02-23T10:32:00', citit: true },
    { id_mesaj: 5, expeditor: 2, expeditor_nume: 'Ion Ionescu', destinatar: 1, mesaj: 'Perfect, mulțumesc! Le pregătim diseară.', data: '2026-02-23T10:33:00', citit: true },
    { id_mesaj: 6, expeditor: 1, expeditor_nume: 'Maria Popescu', destinatar: 2, mesaj: 'Cu plăcere! Alexia e foarte talentată la desen 🎨', data: '2026-02-23T10:34:00', citit: true },
    { id_mesaj: 7, expeditor: 2, expeditor_nume: 'Ion Ionescu', destinatar: 1, mesaj: 'Bună ziua! Încă o întrebare — la ce oră se termină programul mâine?', data: '2026-02-24T09:15:00', citit: false },
    { id_mesaj: 8, expeditor: 2, expeditor_nume: 'Ion Ionescu', destinatar: 1, mesaj: 'Voiam să întreb despre tema de azi.', data: '2026-02-24T10:30:00', citit: false },
  ],
  2: [
    { id_mesaj: 20, expeditor: 1, expeditor_nume: 'Maria Popescu', destinatar: 6, mesaj: 'Bună ziua! Vreau să vă informez că mâine avem activitate de pictură.', data: '2026-02-22T14:00:00', citit: true },
    { id_mesaj: 21, expeditor: 6, expeditor_nume: 'Andrei Pârvu', destinatar: 1, mesaj: 'Mulțumesc pentru informare! Trebuie să aducă ceva materiale?', data: '2026-02-22T14:30:00', citit: true },
    { id_mesaj: 22, expeditor: 1, expeditor_nume: 'Maria Popescu', destinatar: 6, mesaj: 'Nu, avem toate materialele la grădiniță. Doar un șorțuleț de protecție dacă aveți.', data: '2026-02-22T15:00:00', citit: true },
    { id_mesaj: 23, expeditor: 6, expeditor_nume: 'Andrei Pârvu', destinatar: 1, mesaj: 'Mulțumesc pentru informații! O zi bună.', data: '2026-02-22T15:45:00', citit: true },
  ],
  3: [
    { id_mesaj: 30, expeditor: 3, expeditor_nume: 'Ana Dumitrescu', destinatar: 1, mesaj: 'Bună! Am terminat de pregătit fișele pentru activitatea de matematică.', data: '2026-02-21T08:45:00', citit: true },
    { id_mesaj: 31, expeditor: 1, expeditor_nume: 'Maria Popescu', destinatar: 3, mesaj: 'Super, mulțumesc Ana! Câte copii avem confirmați?', data: '2026-02-21T09:00:00', citit: true },
    { id_mesaj: 32, expeditor: 3, expeditor_nume: 'Ana Dumitrescu', destinatar: 1, mesaj: 'Am pregătit materialele pentru mâine. 18 copii confirmați.', data: '2026-02-21T09:15:00', citit: false },
  ],
  4: [
    { id_mesaj: 40, expeditor: 7, expeditor_nume: 'Elena Marinescu', destinatar: 1, mesaj: 'Bună ziua! Aș vrea să discut despre progresul Mariei la grupa mică.', data: '2026-02-20T13:00:00', citit: true },
    { id_mesaj: 41, expeditor: 1, expeditor_nume: 'Maria Popescu', destinatar: 7, mesaj: 'Sigur! Maria se descurcă excelent, s-a integrat foarte bine în grup.', data: '2026-02-20T13:30:00', citit: true },
    { id_mesaj: 42, expeditor: 7, expeditor_nume: 'Elena Marinescu', destinatar: 1, mesaj: 'Putem programa o întâlnire săptămâna viitoare?', data: '2026-02-20T14:20:00', citit: true },
  ],
  5: [
    { id_mesaj: 50, expeditor: 8, expeditor_nume: 'Mihai Georgescu', destinatar: 1, mesaj: 'Bună! Voiam să vă spun că Radu a povestit acasă despre activitatea cu planetele 🪐', data: '2026-02-19T15:30:00', citit: true },
    { id_mesaj: 51, expeditor: 1, expeditor_nume: 'Maria Popescu', destinatar: 8, mesaj: 'Ce drăguț! Radu a fost foarte atent și a participat activ. A făcut și o machetă frumoasă!', data: '2026-02-19T15:45:00', citit: true },
    { id_mesaj: 52, expeditor: 8, expeditor_nume: 'Mihai Georgescu', destinatar: 1, mesaj: 'Radu a fost foarte cuminte azi! 🌟', data: '2026-02-19T16:00:00', citit: true },
  ],
};

export async function getConversations(userId: number): Promise<Conversation[]> {
  if (USE_MOCK) return mockConversations;
  return apiFetch<Conversation[]>(`/mesaje.php?action=conversations&id_utilizator=${userId}`);
}

export async function getMessages(grupa: string, userId: number, conversationId?: number): Promise<Message[]> {
  if (USE_MOCK) {
    // Return messages for the specific conversation if we have them
    if (conversationId && mockMessagesByConvo[conversationId]) {
      return mockMessagesByConvo[conversationId];
    }
    // Fallback to convo 1
    return mockMessagesByConvo[1];
  }
  return apiFetch<Message[]>(`/mesaje.php?action=messages&grupa=${grupa}&id_utilizator=${userId}`);
}

export async function sendMessage(grupa: string, destinatar: number, mesaj: string): Promise<Message> {
  if (USE_MOCK) {
    return {
      id_mesaj: Date.now(),
      expeditor: 1,
      expeditor_nume: 'Maria Popescu',
      destinatar,
      mesaj,
      data: new Date().toISOString(),
      citit: false,
    };
  }
  return apiFetch<Message>('/mesaje.php?action=send', {
    method: 'POST',
    body: JSON.stringify({ grupa, destinatar, mesaj }),
  });
}

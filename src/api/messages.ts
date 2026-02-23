import { USE_MOCK, apiFetch } from './config';
import type { Conversation, Message } from '@/types';

const mockConversations: Conversation[] = [
  { id: 1, contact_nume: 'Ion Ionescu', contact_id: 2, ultimul_mesaj: 'Bună ziua, voiam să întreb despre tema de azi.', data_ultimul_mesaj: '2026-02-23T10:30:00', necitite: 2, grupa: 'grupa_mare' },
  { id: 2, contact_nume: 'Andrei Parinte', contact_id: 6, ultimul_mesaj: 'Mulțumesc pentru informații!', data_ultimul_mesaj: '2026-02-22T15:45:00', necitite: 0, grupa: 'grupa_mare' },
  { id: 3, contact_nume: 'Ana Dumitrescu', contact_id: 3, ultimul_mesaj: 'Am pregătit materialele pentru mâine.', data_ultimul_mesaj: '2026-02-21T09:15:00', necitite: 1, grupa: 'grupa_mare' },
];

const mockMessages: Message[] = [
  { id_mesaj: 1, expeditor: 2, expeditor_nume: 'Ion Ionescu', destinatar: 1, mesaj: 'Bună ziua, doamna Maria!', data: '2026-02-23T10:25:00', citit: true },
  { id_mesaj: 2, expeditor: 1, expeditor_nume: 'Maria Popescu', destinatar: 2, mesaj: 'Bună ziua! Cu ce vă pot ajuta?', data: '2026-02-23T10:27:00', citit: true },
  { id_mesaj: 3, expeditor: 2, expeditor_nume: 'Ion Ionescu', destinatar: 1, mesaj: 'Voiam să întreb despre tema de azi.', data: '2026-02-23T10:30:00', citit: false },
  { id_mesaj: 4, expeditor: 2, expeditor_nume: 'Ion Ionescu', destinatar: 1, mesaj: 'Alexia a spus că trebuie să facă un desen.', data: '2026-02-23T10:30:30', citit: false },
];

export async function getConversations(userId: number): Promise<Conversation[]> {
  if (USE_MOCK) return mockConversations;
  return apiFetch<Conversation[]>(`/mesaje.php?action=conversations&id_utilizator=${userId}`);
}

export async function getMessages(grupa: string, userId: number): Promise<Message[]> {
  if (USE_MOCK) return mockMessages;
  return apiFetch<Message[]>(`/mesaje.php?action=messages&grupa=${grupa}&id_utilizator=${userId}`);
}

export async function sendMessage(grupa: string, destinatar: number, mesaj: string): Promise<Message> {
  if (USE_MOCK) {
    return { id_mesaj: Date.now(), expeditor: 1, expeditor_nume: 'Maria Popescu', destinatar, mesaj, data: new Date().toISOString(), citit: false };
  }
  return apiFetch<Message>('/mesaje.php?action=send', {
    method: 'POST',
    body: JSON.stringify({ grupa, destinatar, mesaj }),
  });
}

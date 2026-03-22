/**
 * API Mesaje - conectat la TID4K backend
 *
 * Endpoint-uri: fetch_mesaje
 */

import { tid4kApi } from './tid4kClient';
import { USE_TID4K_BACKEND } from './config';
import type { Conversation, Message } from '@/types';

export async function getConversations(userId: string): Promise<Conversation[]> {
  if (!USE_TID4K_BACKEND) return [];

  try {
    // Folosim preia_mesajele_chat — include mesaje trimise + primite + nume
    const data = await tid4kApi.call<any>('preia_mesajele_chat', {});

    // TID4K returneaza: {mesaje_utilizator: [...], numar_mesaje_nou: N}
    const mesaje = Array.isArray(data) ? data
      : (data?.mesaje_utilizator || data?.conversatii || data?.mesaje || []);

    // Grupeaza mesajele pe conversatii (dupa expeditor)
    const convMap = new Map<string, Conversation>();

    for (const m of mesaje) {
      // TID4K fields: id_mesaj, id_expeditor, id_destinatar, mesaj, data_trimitere, citit, vizualizat
      const expId = String(m.id_expeditor || m.expeditor || '');
      const destId = String(m.id_destinatar || m.destinatar || '');
      const contactId = expId === userId ? destId : expId;
      const contactNume = expId === userId
        ? (m.destinatar_nume || m.nume_destinatar || 'Utilizator')
        : (m.expeditor_nume || m.nume_expeditor || 'Utilizator');

      if (!convMap.has(contactId)) {
        convMap.set(contactId, {
          id: `conv-${contactId}`,
          contact_nume: contactNume,
          contact_id: contactId,
          ultimul_mesaj: m.mesaj || m.continut || '',
          data_ultimul_mesaj: m.data_trimitere || m.data || m.created_at || '',
          necitite: 0,
          grupa: m.grupa || '',
        });
      }

      const conv = convMap.get(contactId)!;
      // Actualizeaza cu cel mai recent mesaj
      const dataMsg = m.data_trimitere || m.data || '';
      if (dataMsg > conv.data_ultimul_mesaj) {
        conv.ultimul_mesaj = m.mesaj || m.continut || '';
        conv.data_ultimul_mesaj = dataMsg;
      }
      if (!m.citit && m.vizualizat === null && expId !== userId) {
        conv.necitite++;
      }
    }

    return Array.from(convMap.values()).sort(
      (a, b) => new Date(b.data_ultimul_mesaj).getTime() - new Date(a.data_ultimul_mesaj).getTime()
    );
  } catch (err) {
    console.error('[Mesaje] Eroare la incarcarea conversatiilor:', err);
    return [];
  }
}

export async function getMessages(grupa: string, userId: string, conversationId?: string): Promise<Message[]> {
  if (!USE_TID4K_BACKEND) return [];

  try {
    // Folosim preia_mesajele_chat care returnează și numele expeditorului/destinatarului
    const data = await tid4kApi.call<any>('preia_mesajele_chat', {});

    const mesaje = Array.isArray(data) ? data : (data?.mesaje || data?.mesaje_utilizator || []);

    // Extragem contactId din conversationId (format: "conv-{contactId}")
    const contactId = conversationId?.replace('conv-', '').replace('new-', '') || '';

    // Filtrăm mesajele pentru conversația selectată
    return mesaje
      .filter((m: any) => {
        const expId = String(m.id_expeditor || '');
        const destId = String(m.id_destinatar || '');
        return (expId === contactId || destId === contactId);
      })
      .map((m: any) => ({
        id: String(m.id_mesaj || m.id || Date.now()),
        expeditor: String(m.id_expeditor || ''),
        expeditor_nume: m.nume_expeditor || '',
        destinatar: String(m.id_destinatar || ''),
        mesaj: m.mesaj || '',
        data: m.data_trimitere || m.data || '',
        citit: !!m.citit,
      }))
      .sort((a: Message, b: Message) => new Date(a.data).getTime() - new Date(b.data).getTime());
  } catch (err) {
    console.error('[Mesaje] Eroare la incarcarea mesajelor:', err);
    return [];
  }
}

export async function sendMessage(grupa: string, destinatar: string, mesaj: string, existingConvoId?: string): Promise<Message> {
  if (!USE_TID4K_BACKEND) throw new Error('Backend indisponibil');

  const data = await tid4kApi.call<any>('trimite_mesaj', {
    mesaj,
    destinatari: destinatar,
  });

  if (data?.success === false) {
    throw new Error(data?.error || 'Eroare la trimiterea mesajului');
  }

  return {
    id: String(Date.now()),
    expeditor: '',
    expeditor_nume: '',
    destinatar,
    mesaj,
    data: new Date().toISOString(),
    citit: false,
  };
}

export async function getOrCreateGroupConversation(teacherId: string, groupId: string, groupName: string): Promise<string> {
  // Conversațiile de grup nu au tabel separat — se folosește broadcast la toți destinatarii
  return `group-${groupId}`;
}

export interface Contact {
  id: string;
  nume_prenume: string;
  status: string;
}

export async function getContacts(): Promise<Contact[]> {
  if (!USE_TID4K_BACKEND) return [];

  try {
    const data = await tid4kApi.call<any>('fetch_contacte', {});
    const contacte = data?.contacte || [];
    return contacte.map((c: any) => ({
      id: String(c.id),
      nume_prenume: c.nume_prenume || '',
      status: c.status || '',
    }));
  } catch (err) {
    console.error('[Mesaje] Eroare la incarcarea contactelor:', err);
    return [];
  }
}

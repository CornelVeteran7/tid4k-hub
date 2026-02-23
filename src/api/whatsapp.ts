import { USE_MOCK, apiFetch } from './config';

export interface WhatsappMapping {
  id: number;
  grupa: string;
  whatsapp_group: string;
  consent: boolean;
  sync_type: 'bidirectional' | 'one-way';
}

const mockMappings: WhatsappMapping[] = [
  { id: 1, grupa: 'grupa_mare', whatsapp_group: 'Grupa Mare - Padinti', consent: true, sync_type: 'bidirectional' },
  { id: 2, grupa: 'clasa_1a', whatsapp_group: 'Clasa I-A Comunicare', consent: true, sync_type: 'one-way' },
];

export async function getWhatsappMappings(): Promise<WhatsappMapping[]> {
  if (USE_MOCK) return mockMappings;
  return apiFetch<WhatsappMapping[]>('/whatsapp.php?action=mappings');
}

export async function createMapping(mapping: Partial<WhatsappMapping>): Promise<WhatsappMapping> {
  if (USE_MOCK) return { ...mapping, id: Date.now() } as WhatsappMapping;
  return apiFetch<WhatsappMapping>('/whatsapp.php?action=create', { method: 'POST', body: JSON.stringify(mapping) });
}

export async function syncStatus(): Promise<{ status: string; last_sync: string }> {
  if (USE_MOCK) return { status: 'activ', last_sync: '2026-02-23T10:00:00' };
  return apiFetch('/whatsapp.php?action=status');
}

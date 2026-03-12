/**
 * API Meniuri - conectat la TID4K backend
 *
 * Inlocuieste apelurile Supabase cu apeluri catre api_gateway.php
 * Endpoint-uri: fetch_meniuri, salveaza_meniuHTML
 */

import { tid4kApi } from './tid4kClient';
import { USE_TID4K_BACKEND } from './config';
import type { WeeklyMenu, NutritionalData } from '@/types';

export async function getMenu(saptamana: string): Promise<WeeklyMenu> {
  if (!USE_TID4K_BACKEND) {
    return { saptamana, items: [], nutritional: [], alergeni: [], semnaturi: { director: '', asistent_medical: '', administrator: '' } };
  }

  try {
    // saptamana vine ca "2026-W12" sau "2026-03-17" - extragem saptamana si anul
    const an = new Date().getFullYear();
    const saptNr = parseInt(saptamana.replace(/\D/g, '').slice(-2)) || 1;

    const data = await tid4kApi.call<any>('fetch_meniuri', {
      saptamana: saptNr,
      an: an,
    });

    // Adapteaza raspunsul TID4K la formatul WeeklyMenu
    if (!data) {
      return { saptamana, items: [], nutritional: [], alergeni: [], semnaturi: { director: '', asistent_medical: '', administrator: '' } };
    }

    // Daca raspunsul contine HTML brut (formatul vechi TID4K)
    if (data.raw_output || typeof data === 'string') {
      return parseazaMeniuHTML(saptamana, data.raw_output || data);
    }

    // Daca raspunsul e deja structurat cu items
    if (data.items) {
      return data as WeeklyMenu;
    }

    // Format TID4K: array de obiecte {id_info, continut, data_expirare, data_upload}
    // fetch_meniuri.php returneaza direct un array JSON
    if (Array.isArray(data) && data.length > 0) {
      // Gaseste meniul cel mai recent sau cel care corespunde saptamanii cerute
      const meniu = data[0]; // Primul e cel mai recent (ORDER BY data_upload DESC)
      if (meniu.continut) {
        return parseazaMeniuHTML(saptamana, meniu.continut);
      }
    }

    // Format cu proprietatea meniuri
    if (data.meniuri) {
      return convertesteMeniuriTID4K(saptamana, data);
    }

    return { saptamana, items: [], nutritional: [], alergeni: [], semnaturi: { director: '', asistent_medical: '', administrator: '' } };
  } catch (err) {
    console.error('[Menu] Eroare la incarcarea meniului:', err);
    return { saptamana, items: [], nutritional: [], alergeni: [], semnaturi: { director: '', asistent_medical: '', administrator: '' } };
  }
}

/**
 * Returneaza toate meniurile TID4K raw (cu HTML) pentru afisare in viewer
 * Fiecare meniu are: id_info, continut (HTML), data_expirare, data_upload, denumire_meniu
 */
export interface TID4KMenuEntry {
  id_info: string;
  continut: string;
  data_expirare: string;
  data_upload: string;
  denumire_meniu: string | null;
}

export async function getMeniuriTID4K(): Promise<TID4KMenuEntry[]> {
  if (!USE_TID4K_BACKEND) return [];

  try {
    const data = await tid4kApi.call<any>('fetch_meniuri', {});

    if (Array.isArray(data)) {
      return data as TID4KMenuEntry[];
    }
    return [];
  } catch (err) {
    console.error('[Menu] Eroare la incarcarea meniurilor TID4K:', err);
    return [];
  }
}

export async function saveMenu(menu: WeeklyMenu): Promise<void> {
  if (!USE_TID4K_BACKEND) return;

  try {
    // Construieste continutul HTML din items (formatul asteptat de salveaza_meniuHTML.php)
    const continut = construiesteHTMLdinMenu(menu);

    await tid4kApi.call('salveaza_meniuHTML', {
      continut: continut,
      data: menu.saptamana,
      denumire_meniu: null, // Tab default
    });
  } catch (err) {
    console.error('[Menu] Eroare la salvarea meniului:', err);
    throw err;
  }
}

export async function getNutritionalData(saptamana: string): Promise<NutritionalData[]> {
  // Datele nutritionale vin impreuna cu meniul
  const menu = await getMenu(saptamana);
  return menu.nutritional || [];
}

// ============================================================================
// CONVERSIE FORMATE
// ============================================================================

const ZILE = ['Luni', 'Marti', 'Miercuri', 'Joi', 'Vineri'];
const MESE: Array<{ id: string; label: string }> = [
  { id: 'mic_dejun', label: 'Mic dejun' },
  { id: 'gustare_1', label: 'Gustare 1' },
  { id: 'pranz', label: 'Prânz' },
  { id: 'gustare_2', label: 'Gustare 2' },
];

/**
 * Mapare ore din tabelul TID4K la tipuri de mese
 * Orele variaza usor pe fiecare server (07:00, 08:00, 08:15, etc.)
 */
function detecteazaMasa(ora: string): string | null {
  const oraNum = parseInt(ora.replace(/[^0-9]/g, '').substring(0, 2));
  if (oraNum >= 7 && oraNum <= 8) return 'mic_dejun';
  if (oraNum >= 9 && oraNum <= 10) return 'gustare_1';
  if (oraNum >= 11 && oraNum <= 13) return 'pranz';
  if (oraNum >= 14 && oraNum <= 16) return 'gustare_2';
  return null;
}

function parseazaMeniuHTML(saptamana: string, html: string): WeeklyMenu {
  // Formatul TID4K: tabel HTML cu coloane pe zile si randuri pe ore
  // <tr><th>Ora</th><th>Luni (09 martie)</th>...</tr>
  // <tr><td>08:15</td><td>ceai cu lamaie...</td>...</tr>
  const items: WeeklyMenu['items'] = [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const rows = doc.querySelectorAll('tr');

  if (rows.length === 0) {
    return { saptamana, items, nutritional: [], alergeni: [], semnaturi: { director: '', asistent_medical: '', administrator: '' } };
  }

  // Parcurge randurile (skip header)
  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r].querySelectorAll('td, th');
    if (cells.length < 2) continue;

    // Prima celula contine ora (ex: "08:15", "12:00")
    const oraText = (cells[0].textContent || '').trim();
    const tipMasa = detecteazaMasa(oraText);
    if (!tipMasa) continue;

    // Celulele 1-5 corespund zilelor Luni-Vineri
    for (let zi = 0; zi < ZILE.length && zi + 1 < cells.length; zi++) {
      const continut = (cells[zi + 1].textContent || '').trim();
      if (continut) {
        items.push({
          masa: tipMasa as any,
          zi: ZILE[zi],
          continut: continut,
        });
      }
    }
  }

  return {
    saptamana,
    items,
    nutritional: [],
    alergeni: [],
    semnaturi: { director: '', asistent_medical: '', administrator: '' },
  };
}

function convertesteMeniuriTID4K(saptamana: string, data: any): WeeklyMenu {
  const items: WeeklyMenu['items'] = [];

  // Daca data e un array de meniuri
  const meniuri = Array.isArray(data) ? data : (data.meniuri || []);

  for (const meniu of meniuri) {
    if (meniu.continut) {
      items.push({
        masa: (meniu.masa || 'pranz') as any,
        zi: meniu.zi || '',
        continut: meniu.continut,
        emoji: meniu.emoji || undefined,
      });
    }
  }

  return {
    saptamana,
    items,
    nutritional: [],
    alergeni: [],
    semnaturi: { director: '', asistent_medical: '', administrator: '' },
  };
}

function construiesteHTMLdinMenu(menu: WeeklyMenu): string {
  // Construieste un HTML simplu din structura menu
  // Acest format e compatibil cu salveaza_meniuHTML.php
  let html = '<table>';
  for (const zi of ZILE) {
    const itemsZi = menu.items.filter(i => i.zi === zi);
    if (itemsZi.length > 0) {
      html += `<tr><td><strong>${zi}</strong></td>`;
      for (const item of itemsZi) {
        html += `<td>${item.continut}</td>`;
      }
      html += '</tr>';
    }
  }
  html += '</table>';
  return html;
}

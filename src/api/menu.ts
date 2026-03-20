/**
 * API Meniuri - conectat la TID4K backend
 *
 * Inlocuieste apelurile Supabase cu apeluri catre api_gateway.php
 * Endpoint-uri: fetch_meniuri, salveaza_meniuHTML
 */

import { tid4kApi } from './tid4kClient';
import { USE_TID4K_BACKEND, API_BASE_URL } from './config';
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

/**
 * Meniu structurat din PHP (parsat din HTML)
 * Folosit de interfata Lovable pentru afisare tabelara
 */
export interface MeniuStructurat {
  success: boolean;
  saptamana: string;
  data_expirare: string;
  denumire_meniu: string | null;
  id_info: number;
  total_meniuri: number;
  index_curent: number;
  mese: Array<{
    masa: string;
    label: string;
    ora: string;
    zile: Record<string, string>;
  }>;
  alergeni: Record<string, string[]>;
  alergeni_unici: string[];
  semnaturi: Record<string, string>;
  nutrienti_medie: Record<string, { valoare: number; unitate: string }>;
  calorii_per_zi: Record<string, number>;
}

export async function getMeniuStructurat(index: number = 0): Promise<MeniuStructurat | null> {
  if (!USE_TID4K_BACKEND) return null;

  try {
    const data = await tid4kApi.call<any>('fetch_meniu_structurat', { index });
    if (data?.success === false) return null;
    return data as MeniuStructurat;
  } catch (err) {
    console.error('[Menu] Eroare la incarcarea meniului structurat:', err);
    return null;
  }
}

export interface MeniuDisponibil {
  id_info: string;
  data_expirare: string;
  denumire_meniu: string | null;
  saptamana: string;
}

export async function getListaMeniuri(): Promise<MeniuDisponibil[]> {
  if (!USE_TID4K_BACKEND) return [];

  try {
    const data = await tid4kApi.call<any>('fetch_meniu_structurat', { lista: 1 });
    return data?.meniuri || [];
  } catch (err) {
    console.error('[Menu] Eroare la incarcarea listei meniuri:', err);
    return [];
  }
}

/**
 * Limite OMS din baza de date (Strat 2: apeleaza endpoint PHP existent)
 */
export interface LimiteOMS {
  calorii_min: number;
  calorii_max: number;
  proteine_min: number;
  proteine_max: number;
  lipide_min: number;
  lipide_max: number;
  carbohidrati_min: number;
  carbohidrati_max: number;
  [key: string]: any;
}

export async function getLimiteOMS(): Promise<LimiteOMS | null> {
  if (!USE_TID4K_BACKEND) return null;
  try {
    const data = await tid4kApi.call<any>('get_limite_oms', {});
    return data?.limite || null;
  } catch (err) {
    console.error('[Menu] Eroare la incarcarea limitelor OMS:', err);
    return null;
  }
}

/**
 * Aliment din normator (Strat 2: apeleaza endpoint PHP existent)
 */
export interface AlimentNormator {
  id: number;
  denumire: string;
  emoji: string;
  alergeni: string;
  calorii: number;
  proteine: number;
  lipide: number;
  carbohidrati: number;
  glucide: number;
  cantitate: string;
  cuvinte_cheie: string;
  /** Camp calculat in Strat 2: "🍌 banană (100gr)" — asamblat din emoji+denumire+cantitate */
  textComplet: string;
}

/**
 * Strat 2 conversie: asambleaza textul complet din campurile separate ale normatorului
 * Format identic cu cuvinte_cheie_meniu.php: "🍌 Banană (100gr)"
 */
function asambleazaTextComplet(aliment: any): string {
  const emoji = aliment.emoji || '';
  const denumire = aliment.denumire || '';
  const cantitate = aliment.cantitate || '';
  return (emoji ? emoji + ' ' : '') + denumire + (cantitate ? ' (' + cantitate + ')' : '');
}

export async function cautaInNormator(cuvant: string): Promise<AlimentNormator | null> {
  if (!USE_TID4K_BACKEND) return null;
  try {
    const data = await tid4kApi.call<any>('cauta_in_normator_alimente', { cuvant });
    const aliment = data?.aliment;
    if (!aliment) return null;
    return { ...aliment, textComplet: asambleazaTextComplet(aliment) };
  } catch (err) {
    return null;
  }
}

export async function getToateAlimentele(): Promise<AlimentNormator[]> {
  if (!USE_TID4K_BACKEND) return [];
  try {
    const data = await tid4kApi.call<any>('cauta_in_normator_alimente', { toate: 1 });
    const alimente = data?.alimente || [];
    // Strat 2: asambleaza textComplet pentru fiecare aliment
    return alimente.map((a: any) => ({ ...a, textComplet: asambleazaTextComplet(a) }));
  } catch (err) {
    console.error('[Menu] Eroare la incarcarea normatorului:', err);
    return [];
  }
}

/**
 * Construieste URL-ul pentru print PDF meniu (deschis in tab nou)
 * Foloseste mecanismul PHP existent print_meniu_saptamana.php
 */
export function getPrintMeniuURL(dataVineri: string): string {
  return `${API_BASE_URL}/pages/print_meniu_saptamana.php?data_vineri=${encodeURIComponent(dataVineri)}`;
}

/**
 * Salvare meniu structurat: reconstruieste HTML din celule si trimite la backend
 * Folosit de editorul React (TID4KMenuViewer in mod editare)
 */
export async function salvareMeniuStructurat(
  mese: Array<{ masa: string; label: string; ora: string; zile: Record<string, string> }>,
  dataVineri: string,
  denumireMeniu?: string | null,
  nutrientiText?: string,
  semnaturi?: Record<string, string>,
): Promise<void> {
  if (!USE_TID4K_BACKEND) return;

  const ZILE_HEAD: Record<string, string> = {
    luni: 'Luni', marti: 'Marți', miercuri: 'Miercuri', joi: 'Joi', vineri: 'Vineri',
  };
  const ZILE_ORD = ['luni', 'marti', 'miercuri', 'joi', 'vineri'];

  // Calculeaza datele calendaristice Luni-Vineri din vineri
  const vineriDate = new Date(dataVineri + 'T12:00:00');
  const LUNI = ['ianuarie','februarie','martie','aprilie','mai','iunie',
    'iulie','august','septembrie','octombrie','noiembrie','decembrie'];
  const dateZile: Record<string, string> = {};
  const offset: Record<string, number> = { luni: -4, marti: -3, miercuri: -2, joi: -1, vineri: 0 };
  for (const [zi, diff] of Object.entries(offset)) {
    const d = new Date(vineriDate);
    d.setDate(vineriDate.getDate() + diff);
    dateZile[zi] = `${d.getDate()} ${LUNI[d.getMonth()]}`;
  }

  // Construieste HTML identic cu formatul vechi
  let html = '<table id="tabelMeniuSaptamanal" class="tabel-meniu">';
  // Header
  html += '<tr>';
  html += '<th class="coloana-ore"><div class="inputText oraInput">Ora</div></th>';
  for (const zi of ZILE_ORD) {
    html += `<th><div class="inputText">${ZILE_HEAD[zi]} (${dateZile[zi]})</div></th>`;
  }
  html += '</tr>';

  // Mese
  for (const masa of mese) {
    html += '<tr>';
    html += `<td class="coloana-ore"><div class="inputText oraInput">${masa.ora}</div></td>`;
    for (const zi of ZILE_ORD) {
      const continut = masa.zile[zi] || '';
      html += `<td><div class="inputText">${continut}</div></td>`;
    }
    html += '</tr>';
  }

  // Nutrienti
  if (nutrientiText) {
    html += `<div id="NutrientiSiCalorii">Nutrienti si Calorii (medie/zi): ${nutrientiText}</div>`;
  }

  // Semnaturi
  if (semnaturi && Object.keys(semnaturi).length > 0) {
    html += '<div id="semnaturi">';
    for (const [functie, nume] of Object.entries(semnaturi)) {
      const titlu = functie.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      html += `<div class="functie-container"><div class="functie-titlu">${titlu}:</div><div class="nume-prenume">${nume}</div></div>`;
    }
    html += '</div>';
  }

  html += '</table>';

  await tid4kApi.call('salveaza_meniuHTML', {
    html: html,
    data_vineri: dataVineri,
    denumire_meniu: denumireMeniu || null,
  });
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

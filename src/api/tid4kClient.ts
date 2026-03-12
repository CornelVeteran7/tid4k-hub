/**
 * TID4K API Client
 *
 * Client HTTP central care comunica cu api_gateway.php de pe serverul TID4K.
 * Inlocuieste Supabase ca layer de comunicare cu backend-ul.
 *
 * Folosire:
 *   import { tid4kApi } from '@/api/tid4kClient';
 *   const meniuri = await tid4kApi.call('fetch_meniuri', { saptamana: 5, an: 2026 });
 */

import { API_BASE_URL, API_KEY, GATEWAY_PATH, GATEWAY_TIMEOUT } from './config';

// ============================================================================
// TIPURI
// ============================================================================

export interface TID4KResponse<T = any> {
  success: boolean;
  timestamp: string;
  server: string;
  data?: T;
  error?: string;
}

export interface TID4KSessionData {
  id_utilizator: number;
  nume_prenume: string;
  telefon: string;
  email: string;
  status: string;
  grupa_clasa_copil: string;
  numar_grupe_clase_utilizator: number;
  index_grupa_clasa_curenta: number;
  toate_grupele_clase: string[];
  avatar_url: string;
  id_cookie: string;
}

// ============================================================================
// CLIENT
// ============================================================================

class TID4KClient {
  private baseUrl: string;
  private apiKey: string;
  private gatewayPath: string;
  private timeout: number;
  private sessionCookie: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.apiKey = API_KEY;
    this.gatewayPath = GATEWAY_PATH;
    this.timeout = GATEWAY_TIMEOUT;

    // Restaureaza sesiunea din localStorage
    this.sessionCookie = localStorage.getItem('tid4k_session') || null;
  }

  /**
   * URL-ul complet al gateway-ului
   */
  private get gatewayUrl(): string {
    return `${this.baseUrl}/${this.gatewayPath}`;
  }

  /**
   * Headers standard pentru request-uri
   */
  private get headers(): Record<string, string> {
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-TID4K-API-Key': this.apiKey,
    };
    if (this.sessionCookie) {
      h['X-TID4K-Session'] = this.sessionCookie;
    }
    return h;
  }

  /**
   * Apel principal catre gateway
   *
   * @param action - Numele endpoint-ului (ex: 'fetch_meniuri')
   * @param params - Parametrii pentru endpoint
   * @returns Datele din raspuns
   */
  async call<T = any>(action: string, params: Record<string, any> = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.gatewayUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ action, params }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        throw new Error('Rate limit depasit. Asteapta 1 minut.');
      }

      if (response.status === 401) {
        throw new Error('API Key invalid sau sesiune expirata.');
      }

      const json: TID4KResponse<T> = await response.json();

      if (!json.success) {
        throw new Error(json.error || 'Eroare necunoscuta de la server');
      }

      return json.data as T;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Fallback: apel direct la endpoint (fara gateway)
        console.warn(`[TID4K] Gateway timeout pentru ${action}, incerc fallback direct...`);
        return this.callDirect<T>(action, params);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Fallback: apel direct la endpoint (fara gateway)
   * Se foloseste cand gateway-ul nu raspunde in timp util
   */
  private async callDirect<T = any>(action: string, params: Record<string, any> = {}): Promise<T> {
    // Construieste URL cu parametri GET
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      queryParams.set(key, String(value));
    }

    const url = `${this.baseUrl}/pages/${action}.php?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-TID4K-API-Key': this.apiKey,
      },
    });

    const text = await response.text();

    // Incearca sa parseze ca JSON
    try {
      const json = JSON.parse(text);
      // Daca raspunsul are structura gateway (success/data), extrage data
      if (json.success !== undefined && json.data !== undefined) {
        return json.data as T;
      }
      return json as T;
    } catch {
      // Returneaza textul brut daca nu e JSON
      return { raw_output: text } as any;
    }
  }

  /**
   * Autentificare prin numar de telefon (mecanismul actual TID4K)
   */
  async autentificareTelefon(telefon: string): Promise<TID4KSessionData> {
    const response = await fetch(`${this.baseUrl}/pages/api_auth.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-TID4K-API-Key': this.apiKey,
      },
      body: JSON.stringify({
        action: 'login_telefon',
        telefon: telefon,
      }),
    });

    const json: TID4KResponse<TID4KSessionData> = await response.json();

    if (!json.success || !json.data) {
      throw new Error(json.error || 'Numar de telefon necunoscut');
    }

    // Salveaza sesiunea
    this.sessionCookie = json.data.id_cookie;
    localStorage.setItem('tid4k_session', json.data.id_cookie);

    return json.data;
  }

  /**
   * Verifica daca sesiunea curenta e valida
   */
  async verificaSesiune(): Promise<TID4KSessionData | null> {
    if (!this.sessionCookie) return null;

    try {
      const response = await fetch(`${this.baseUrl}/pages/api_auth.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-TID4K-API-Key': this.apiKey,
        },
        body: JSON.stringify({
          action: 'verifica_sesiune',
          id_cookie: this.sessionCookie,
        }),
      });

      const json: TID4KResponse<TID4KSessionData> = await response.json();

      if (!json.success || !json.data) {
        this.delogare();
        return null;
      }

      return json.data;
    } catch {
      return null;
    }
  }

  /**
   * Delogare - sterge sesiunea locala
   */
  delogare(): void {
    this.sessionCookie = null;
    localStorage.removeItem('tid4k_session');
  }

  /**
   * Verifica daca utilizatorul e autentificat (are sesiune salvata)
   */
  get esteAutentificat(): boolean {
    return this.sessionCookie !== null;
  }

  /**
   * Returneaza id-ul sesiunii curente
   */
  get sesiuneCurenta(): string | null {
    return this.sessionCookie;
  }
}

// Singleton - o singura instanta partajata in toata aplicatia
export const tid4kApi = new TID4KClient();

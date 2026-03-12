/**
 * Configurare API TID4K
 *
 * Determina automat serverul pe baza hostname-ului curent.
 * Daca aplicatia ruleaza pe tid4kdemo.ro/app/ → foloseste tid4kdemo.ro ca backend.
 * Daca ruleaza local (localhost) → foloseste tid4kdemo.ro ca backend de dezvoltare.
 */

// Detecteaza serverul pe baza hostname-ului
function detecteazaServer(): string {
  if (typeof window === 'undefined') return 'https://tid4kdemo.ro';

  const hostname = window.location.hostname;

  // Daca suntem pe un server TID4K, folosim acelasi domeniu
  if (hostname.includes('tid4k')) {
    return `${window.location.protocol}//${hostname}`;
  }

  // Daca suntem pe Lovable preview sau localhost, folosim serverul demo
  return 'https://tid4kdemo.ro';
}

/** URL-ul de baza al serverului TID4K (fara trailing slash) */
export const API_BASE_URL = detecteazaServer();

/** API Key pentru autentificare la gateway */
export const API_KEY = 'TID4K_LOVABLE_2026_DEMO';

/** Calea relativa catre gateway (din radacina serverului) */
export const GATEWAY_PATH = 'pages/api_gateway.php';

/** Timeout pentru request-uri gateway (ms) - 10 secunde */
export const GATEWAY_TIMEOUT = 10_000;

/** Flag care indica daca backend-ul TID4K e disponibil (vs. demo mode) */
export const USE_TID4K_BACKEND = true;

/** Flag pentru modul demo (date hardcodate, fara server) */
export const USE_MOCK = false;

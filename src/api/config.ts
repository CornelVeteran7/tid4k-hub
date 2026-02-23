// Base URL for the PHP backend API. Update this to your server.
export const BASE_URL = 'https://YOUR-SERVER.ro/api';

// Whether to use mock data instead of real API calls.
export const USE_MOCK = true;

/**
 * Returns authorization headers for API requests.
 */
export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('tid4k_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Generic API fetch wrapper with error handling.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Eroare API: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

import { USE_MOCK, apiFetch } from './config';
import type { LoginCredentials, UserSession } from '@/types';

const mockUser: UserSession = {
  id_utilizator: 1,
  nume_prenume: 'Maria Popescu',
  telefon: '0721234567',
  email: 'maria@scoala.ro',
  status: 'profesor,director',
  grupa_clasa_copil: 'grupa_mare',
  numar_grupe_clase_utilizator: 2,
  index_grupa_clasa_curenta: 0,
  grupe_disponibile: [
    { id: 'grupa_mare', nume: 'Grupa Mare', tip: 'gradinita' },
    { id: 'clasa_1a', nume: 'Clasa I-A', tip: 'scoala' },
  ],
};

export async function login(credentials: LoginCredentials): Promise<UserSession> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800));
    return mockUser;
  }
  const data = await apiFetch<UserSession>('/auth.php?action=login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  return data;
}

export async function qrLogin(sessionId: string): Promise<UserSession> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800));
    return mockUser;
  }
  return apiFetch<UserSession>('/auth.php?action=qr_login', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId }),
  });
}

export async function logout(): Promise<void> {
  if (USE_MOCK) return;
  await apiFetch('/auth.php?action=logout', { method: 'POST' });
}

export async function validateSession(): Promise<UserSession | null> {
  if (USE_MOCK) {
    const stored = localStorage.getItem('tid4k_session');
    return stored ? JSON.parse(stored) : null;
  }
  try {
    return await apiFetch<UserSession>('/auth.php?action=validate');
  } catch {
    return null;
  }
}

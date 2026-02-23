import { USE_MOCK, apiFetch } from './config';
import type { User } from '@/types';

const mockUsers: User[] = [
  { id_utilizator: 1, nume_prenume: 'Maria Popescu', telefon: '0721234567', email: 'maria@scoala.ro', status: 'profesor,director', grupe: ['grupa_mare', 'clasa_1a'] },
  { id_utilizator: 2, nume_prenume: 'Ion Ionescu', telefon: '0732345678', email: 'ion@scoala.ro', status: 'parinte', grupe: ['grupa_mare'] },
  { id_utilizator: 3, nume_prenume: 'Ana Dumitrescu', telefon: '0743456789', email: 'ana@scoala.ro', status: 'profesor', grupe: ['grupa_mica'] },
  { id_utilizator: 4, nume_prenume: 'Vasile Georgescu', telefon: '0754567890', email: 'vasile@scoala.ro', status: 'administrator', grupe: [] },
  { id_utilizator: 5, nume_prenume: 'Elena Stanescu', telefon: '0765678901', email: 'elena@scoala.ro', status: 'secretara', grupe: [] },
  { id_utilizator: 6, nume_prenume: 'Andrei Parinte', telefon: '0776789012', email: 'andrei@email.ro', status: 'parinte', grupe: ['grupa_mare'] },
];

export async function getUsers(): Promise<User[]> {
  if (USE_MOCK) return mockUsers;
  return apiFetch<User[]>('/utilizatori.php?action=list');
}

export async function getUser(id: number): Promise<User> {
  if (USE_MOCK) return mockUsers.find((u) => u.id_utilizator === id)!;
  return apiFetch<User>(`/utilizatori.php?action=get&id=${id}`);
}

export async function createUser(user: Partial<User>): Promise<User> {
  if (USE_MOCK) {
    const newUser = { ...user, id_utilizator: Date.now() } as User;
    mockUsers.push(newUser);
    return newUser;
  }
  return apiFetch<User>('/utilizatori.php?action=create', { method: 'POST', body: JSON.stringify(user) });
}

export async function updateUser(user: Partial<User>): Promise<User> {
  if (USE_MOCK) return user as User;
  return apiFetch<User>('/utilizatori.php?action=update', { method: 'POST', body: JSON.stringify(user) });
}

export async function deleteUser(id: number): Promise<void> {
  if (USE_MOCK) return;
  await apiFetch(`/utilizatori.php?action=delete&id=${id}`, { method: 'POST' });
}

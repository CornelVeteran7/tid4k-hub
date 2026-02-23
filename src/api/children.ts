import { USE_MOCK, apiFetch } from './config';
import type { Child } from '@/types';

const mockChildren: Record<string, Child[]> = {
  grupa_mare: [
    { id_copil: 1, nume_prenume_copil: 'Alexia Ionescu', grupa_clasa_copil: 'grupa_mare', data_nasterii: '2020-03-15', parinte_id: 2 },
    { id_copil: 2, nume_prenume_copil: 'Matei Popescu', grupa_clasa_copil: 'grupa_mare', data_nasterii: '2020-06-22', parinte_id: 6 },
    { id_copil: 3, nume_prenume_copil: 'Sofia Marinescu', grupa_clasa_copil: 'grupa_mare', data_nasterii: '2020-01-10' },
    { id_copil: 4, nume_prenume_copil: 'David Radu', grupa_clasa_copil: 'grupa_mare', data_nasterii: '2020-09-05' },
    { id_copil: 5, nume_prenume_copil: 'Emma Vasilescu', grupa_clasa_copil: 'grupa_mare', data_nasterii: '2020-11-30' },
  ],
  clasa_1a: [
    { id_copil: 6, nume_prenume_copil: 'Andrei Munteanu', grupa_clasa_copil: 'clasa_1a', data_nasterii: '2019-04-12' },
    { id_copil: 7, nume_prenume_copil: 'Ioana Dragomir', grupa_clasa_copil: 'clasa_1a', data_nasterii: '2019-07-18' },
  ],
};

export async function getChildren(): Promise<Child[]> {
  if (USE_MOCK) return Object.values(mockChildren).flat();
  return apiFetch<Child[]>('/copii.php?action=list');
}

export async function getChildrenByGroup(grupa: string): Promise<Child[]> {
  if (USE_MOCK) return mockChildren[grupa] || [];
  return apiFetch<Child[]>(`/copii.php?action=list&grupa=${grupa}`);
}

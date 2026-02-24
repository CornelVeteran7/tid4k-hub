import { USE_MOCK, apiFetch } from './config';
import type { Child } from '@/types';

const mockChildren: Record<string, Child[]> = {
  grupa_mare: [
    { id_copil: 1, nume_prenume_copil: 'Alexia Ionescu', grupa_clasa_copil: 'grupa_mare', data_nasterii: '2020-03-15', parinte_id: 2, parinte_nume: 'Elena Ionescu', parinte_telefon: '0721234567', parinte_email: 'elena.i@email.com' },
    { id_copil: 2, nume_prenume_copil: 'Matei Popescu', grupa_clasa_copil: 'grupa_mare', data_nasterii: '2020-06-22', parinte_id: 6, parinte_nume: 'Ana Popescu', parinte_telefon: '0731456789', parinte_email: 'ana.p@email.com' },
    { id_copil: 3, nume_prenume_copil: 'Sofia Marinescu', grupa_clasa_copil: 'grupa_mare', data_nasterii: '2020-01-10', parinte_nume: 'Cristina Marinescu', parinte_telefon: '0741567890', parinte_email: 'cristina.m@email.com' },
    { id_copil: 4, nume_prenume_copil: 'David Radu', grupa_clasa_copil: 'grupa_mare', data_nasterii: '2020-09-05', parinte_nume: 'Mihai Radu', parinte_telefon: '0751678901', parinte_email: 'mihai.r@email.com' },
    { id_copil: 5, nume_prenume_copil: 'Emma Vasilescu', grupa_clasa_copil: 'grupa_mare', data_nasterii: '2020-11-30', parinte_nume: 'Laura Vasilescu', parinte_telefon: '0761789012', parinte_email: 'laura.v@email.com' },
  ],
  clasa_1a: [
    { id_copil: 6, nume_prenume_copil: 'Andrei Munteanu', grupa_clasa_copil: 'clasa_1a', data_nasterii: '2019-04-12', parinte_nume: 'Gheorghe Munteanu', parinte_telefon: '0771890123', parinte_email: 'gheorghe.m@email.com' },
    { id_copil: 7, nume_prenume_copil: 'Ioana Dragomir', grupa_clasa_copil: 'clasa_1a', data_nasterii: '2019-07-18', parinte_nume: 'Maria Dragomir', parinte_telefon: '0781901234', parinte_email: 'maria.d@email.com' },
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

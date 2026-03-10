import type { VerticalType } from '@/config/verticalConfig';
import type { GroupInfo } from '@/types';

export interface DemoAccount {
  label: string;
  description: string;
  status: string;
  redirect: string;
  orgName: string;
  vertical: VerticalType;
  groups: GroupInfo[];
  userName: string;
}

export interface DemoEnvironment {
  key: VerticalType;
  name: string;
  orgName: string;
  icon: string;
  color: string;
  primaryColor: string;
  secondaryColor: string;
  accounts: DemoAccount[];
}

const g = (id: string, nume: string, tip: 'gradinita' | 'scoala' = 'gradinita'): GroupInfo => ({ id, nume, tip });

export const DEMO_ENVIRONMENTS: DemoEnvironment[] = [
  {
    key: 'kids',
    name: 'Kids',
    orgName: 'Grădinița Floarea Soarelui',
    icon: '🏫',
    color: '#3b82f6',
    primaryColor: '#1E3A4C',
    secondaryColor: '#2563b4',
    accounts: [
      { label: 'Părinte', description: 'Vede copilul, meniul, prezența', status: 'parinte', redirect: '/', orgName: 'Grădinița Floarea Soarelui', vertical: 'kids', groups: [g('fluturasi', 'Grupa Mică')], userName: 'Maria Ionescu' },
      { label: 'Educatoare', description: 'Gestionează grupa, postează', status: 'profesor', redirect: '/', orgName: 'Grădinița Floarea Soarelui', vertical: 'kids', groups: [g('fluturasi', 'Grupa Mică'), g('albinute', 'Grupa Mijlocie')], userName: 'Elena Popescu' },
      { label: 'Director', description: 'Vede toate grupele, rapoarte', status: 'director', redirect: '/', orgName: 'Grădinița Floarea Soarelui', vertical: 'kids', groups: [g('fluturasi', 'Grupa Mică'), g('albinute', 'Grupa Mijlocie'), g('buburuze', 'Grupa Mare')], userName: 'Ana Dumitrescu' },
      { label: 'Secretară', description: 'Contribuții, export, rapoarte', status: 'secretara', redirect: '/', orgName: 'Grădinița Floarea Soarelui', vertical: 'kids', groups: [g('fluturasi', 'Grupa Mică'), g('albinute', 'Grupa Mijlocie'), g('buburuze', 'Grupa Mare')], userName: 'Ioana Marinescu' },
      { label: 'Administrator', description: 'Setări complete, utilizatori', status: 'administrator', redirect: '/admin', orgName: 'Grădinița Floarea Soarelui', vertical: 'kids', groups: [g('fluturasi', 'Grupa Mică'), g('albinute', 'Grupa Mijlocie'), g('buburuze', 'Grupa Mare')], userName: 'Admin Floarea Soarelui' },
    ],
  },
  {
    key: 'schools',
    name: 'Schools',
    orgName: 'Școala Gimnazială Nr. 183',
    icon: '📚',
    color: '#6366f1',
    primaryColor: '#4338ca',
    secondaryColor: '#6366f1',
    accounts: [
      { label: 'Părinte', description: 'Vede copilul, orarul, mesaje', status: 'parinte', redirect: '/', orgName: 'Școala Gimnazială Nr. 183', vertical: 'schools', groups: [g('cls-1a', 'Clasa I-A', 'scoala')], userName: 'Ion Popescu' },
      { label: 'Profesor', description: 'Orar, prezență, revistă', status: 'profesor', redirect: '/', orgName: 'Școala Gimnazială Nr. 183', vertical: 'schools', groups: [g('cls-1a', 'Clasa I-A', 'scoala'), g('cls-5a', 'Clasa a V-a A', 'scoala')], userName: 'Prof. Andrei Popa' },
      { label: 'Director', description: 'Toate clasele, rapoarte', status: 'director', redirect: '/admin', orgName: 'Școala Gimnazială Nr. 183', vertical: 'schools', groups: [g('cls-1a', 'Clasa I-A', 'scoala'), g('cls-1b', 'Clasa I-B', 'scoala'), g('cls-5a', 'Clasa a V-a A', 'scoala'), g('cls-8b', 'Clasa a VIII-a B', 'scoala')], userName: 'Director Vasilescu' },
    ],
  },
  {
    key: 'medicine',
    name: 'Medicine',
    orgName: 'Clinica DentArt',
    icon: '🏥',
    color: '#ef4444',
    primaryColor: '#b91c1c',
    secondaryColor: '#ef4444',
    accounts: [
      { label: 'Pacient', description: 'Vede poziția în coadă', status: 'parinte', redirect: '/', orgName: 'Clinica DentArt', vertical: 'medicine', groups: [g('cab-1', 'Cabinet 1 - Ortodonție', 'scoala')], userName: 'Mihai Stanescu' },
      { label: 'Recepționist', description: 'Controlează coada, cheamă', status: 'secretara', redirect: '/', orgName: 'Clinica DentArt', vertical: 'medicine', groups: [g('cab-1', 'Cabinet 1', 'scoala'), g('cab-2', 'Cabinet 2', 'scoala'), g('cab-3', 'Cabinet 3', 'scoala')], userName: 'Laura Radu' },
      { label: 'Medic', description: 'Profil, program, pacienți', status: 'profesor', redirect: '/', orgName: 'Clinica DentArt', vertical: 'medicine', groups: [g('cab-2', 'Cabinet 2 - Implantologie', 'scoala')], userName: 'Dr. Alexandru Marin' },
      { label: 'Admin Clinică', description: 'Setări, servicii, prețuri', status: 'administrator', redirect: '/admin', orgName: 'Clinica DentArt', vertical: 'medicine', groups: [g('cab-1', 'Cabinet 1', 'scoala'), g('cab-2', 'Cabinet 2', 'scoala'), g('cab-3', 'Cabinet 3', 'scoala')], userName: 'Admin DentArt' },
    ],
  },
  {
    key: 'construction',
    name: 'Construction',
    orgName: 'SC Constructorul SRL',
    icon: '🏗️',
    color: '#22c55e',
    primaryColor: '#b45309',
    secondaryColor: '#d97706',
    accounts: [
      { label: 'Patron', description: 'Toate șantierele, costuri, echipe', status: 'director', redirect: '/', orgName: 'SC Constructorul SRL', vertical: 'construction', groups: [g('sant-1', 'Bloc Rezidențial Nou', 'scoala'), g('sant-2', 'Vila Popescu', 'scoala')], userName: 'Gheorghe Dobre' },
      { label: 'Șef Echipă', description: 'Taskuri echipă, programare', status: 'profesor', redirect: '/', orgName: 'SC Constructorul SRL', vertical: 'construction', groups: [g('sant-1', 'Bloc Rezidențial Nou', 'scoala')], userName: 'Vasile Niță' },
      { label: 'Muncitor', description: 'Taskurile mele azi (UI simplu)', status: 'parinte', redirect: '/', orgName: 'SC Constructorul SRL', vertical: 'construction', groups: [g('sant-1', 'Bloc Rezidențial Nou', 'scoala')], userName: 'Cosmin Lungu' },
      { label: 'Diriginte Șantier', description: 'Documente, SSM, progres', status: 'profesor,director', redirect: '/', orgName: 'SC Constructorul SRL', vertical: 'construction', groups: [g('sant-1', 'Bloc Rezidențial Nou', 'scoala'), g('sant-2', 'Vila Popescu', 'scoala')], userName: 'Ing. Florin Barbu' },
    ],
  },
  {
    key: 'workshops',
    name: 'Workshops',
    orgName: 'Auto Service Popescu',
    icon: '🔧',
    color: '#78716c',
    primaryColor: '#57534e',
    secondaryColor: '#78716c',
    accounts: [
      { label: 'Proprietar', description: 'Inventar, programări, facturi', status: 'director', redirect: '/', orgName: 'Auto Service Popescu', vertical: 'workshops', groups: [g('atelier-1', 'Atelier Principal', 'scoala')], userName: 'Marian Popescu' },
      { label: 'Mecanic', description: 'Inventar piese, fișe vehicul', status: 'profesor', redirect: '/', orgName: 'Auto Service Popescu', vertical: 'workshops', groups: [g('atelier-1', 'Atelier Principal', 'scoala')], userName: 'Dan Stoica' },
      { label: 'Client', description: 'Status vehicul, programări', status: 'parinte', redirect: '/', orgName: 'Auto Service Popescu', vertical: 'workshops', groups: [g('atelier-1', 'Atelier Principal', 'scoala')], userName: 'Adrian Neagu' },
    ],
  },
  {
    key: 'living',
    name: 'Living',
    orgName: 'Bloc A3 Militari Residence',
    icon: '🏢',
    color: '#f59e0b',
    primaryColor: '#166534',
    secondaryColor: '#22c55e',
    accounts: [
      { label: 'Locatar', description: 'Cheltuieli proprii, anunțuri', status: 'parinte', redirect: '/', orgName: 'Bloc A3 Militari Residence', vertical: 'living', groups: [g('sc-a', 'Scara A', 'scoala')], userName: 'Cristian Enache' },
      { label: 'Administrator Bloc', description: 'Financiar, anunțuri, setări', status: 'administrator', redirect: '/admin', orgName: 'Bloc A3 Militari Residence', vertical: 'living', groups: [g('sc-a', 'Scara A', 'scoala'), g('sc-b', 'Scara B', 'scoala'), g('sc-c', 'Scara C', 'scoala'), g('sc-d', 'Scara D', 'scoala')], userName: 'Admin Bloc A3' },
    ],
  },
  {
    key: 'culture',
    name: 'Culture',
    orgName: 'Opera Națională București',
    icon: '🎭',
    color: '#a855f7',
    accounts: [
      { label: 'Spectator', description: 'Program, bilete, supratitrare', status: 'parinte', redirect: '/', orgName: 'Opera Națională București', vertical: 'culture', groups: [g('sala-mare', 'Sala Mare', 'scoala')], userName: 'Spectator Demo' },
      { label: 'Operator', description: 'Controlează supratitrarea live', status: 'profesor', redirect: '/', orgName: 'Opera Națională București', vertical: 'culture', groups: [g('sala-mare', 'Sala Mare', 'scoala')], userName: 'Operator Supratitrare' },
      { label: 'Director Artistic', description: 'Program, spectacole, setări', status: 'director', redirect: '/admin', orgName: 'Opera Națională București', vertical: 'culture', groups: [g('sala-mare', 'Sala Mare', 'scoala'), g('sala-mica', 'Sala Mică', 'scoala')], userName: 'Dir. Artistic' },
    ],
  },
  {
    key: 'students',
    name: 'Students',
    orgName: 'ASE București',
    icon: '🎓',
    color: '#06b6d4',
    accounts: [
      { label: 'Student', description: 'Coadă secretariat, orar, anunțuri', status: 'parinte', redirect: '/', orgName: 'ASE București', vertical: 'students', groups: [g('fac-eg', 'Economie Generală', 'scoala')], userName: 'Student Demo' },
      { label: 'Secretar', description: 'Controlează coada, documente', status: 'secretara', redirect: '/', orgName: 'ASE București', vertical: 'students', groups: [g('fac-eg', 'Economie Generală', 'scoala'), g('fac-ie', 'Informatică Economică', 'scoala')], userName: 'Secretar ASE' },
      { label: 'Decan', description: 'Admin facultate', status: 'director', redirect: '/admin', orgName: 'ASE București', vertical: 'students', groups: [g('fac-eg', 'Economie Generală', 'scoala'), g('fac-ie', 'Informatică Economică', 'scoala')], userName: 'Decan Facultate' },
    ],
  },
];

export const INKY_ACCOUNT: DemoAccount = {
  label: 'INKY (Superadmin)',
  description: 'Acces la TOATE organizațiile și modulele',
  status: 'administrator,inky',
  redirect: '/superadmin',
  orgName: 'InfoDisplay Platform',
  vertical: 'kids',
  groups: [g('fluturasi', 'Grupa Fluturași'), g('albinute', 'Grupa Albinuțe')],
  userName: 'Inky Superadmin',
};

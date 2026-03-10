import type { VerticalType } from '@/config/verticalConfig';

export interface DemoLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: string;
  description: string;
  phone?: string;
}

const KIDS_LOCATIONS: DemoLocation[] = [
  { id: 'k1', name: 'Grădinița Floarea Soarelui', address: 'Str. Primăverii 12, Sector 1', lat: 44.4547, lng: 26.0857, type: 'Grădiniță', description: '3 grupe, 60 copii' },
  { id: 'k2', name: 'Grădinița Albinuțe', address: 'Bd. Aviatorilor 45, Sector 1', lat: 44.4627, lng: 26.0817, type: 'Grădiniță', description: '4 grupe, 80 copii' },
  { id: 'k3', name: 'Grădinița Piticot', address: 'Str. Dorobanți 78, Sector 2', lat: 44.4507, lng: 26.1017, type: 'Grădiniță', description: '2 grupe, 40 copii' },
  { id: 'k4', name: 'Grădinița Curcubeu', address: 'Str. Victoriei 23, Sector 3', lat: 44.4350, lng: 26.1150, type: 'Grădiniță', description: '5 grupe, 100 copii' },
];

const SCHOOLS_LOCATIONS: DemoLocation[] = [
  { id: 's1', name: 'Școala Gimnazială Nr. 183', address: 'Str. Vulturilor 60, Sector 3', lat: 44.4300, lng: 26.1180, type: 'Școală', description: '12 clase, 320 elevi' },
  { id: 's2', name: 'Liceul Teoretic Dimitrie Cantemir', address: 'Bd. Unirii 15, Sector 5', lat: 44.4250, lng: 26.0900, type: 'Liceu', description: '24 clase, 680 elevi' },
  { id: 's3', name: 'Colegiul Național Sfântul Sava', address: 'Str. Sfântul Sava 2, Sector 3', lat: 44.4320, lng: 26.1060, type: 'Colegiu', description: '30 clase, 900 elevi' },
];

const MEDICINE_LOCATIONS: DemoLocation[] = [
  { id: 'm1', name: 'Clinica DentArt', address: 'Str. Polizu 10, Sector 1', lat: 44.4470, lng: 26.0780, type: 'Cabinet Dentar', description: '3 cabinete, 5 medici', phone: '021-123-4567' },
  { id: 'm2', name: 'MedCenter Plus', address: 'Bd. Magheru 35, Sector 1', lat: 44.4420, lng: 26.0960, type: 'Clinică', description: 'Medicină generală și specialități', phone: '021-234-5678' },
  { id: 'm3', name: 'Oftalmologie Premium', address: 'Calea Victoriei 120, Sector 1', lat: 44.4500, lng: 26.0920, type: 'Cabinet Oftalmologic', description: '2 cabinete, 3 medici' },
];

const CONSTRUCTION_LOCATIONS: DemoLocation[] = [
  { id: 'c1', name: 'Bloc Rezidențial Nou', address: 'Str. Fabricii 22, Sector 6', lat: 44.4350, lng: 26.0500, type: 'Șantier Activ', description: 'Progres: 65%, 3 echipe' },
  { id: 'c2', name: 'Vila Popescu', address: 'Str. Agronom. Gh. Ionescu-Sisești', lat: 44.4800, lng: 26.0600, type: 'Șantier Activ', description: 'Progres: 30%, 1 echipă' },
  { id: 'c3', name: 'Renovare Clădire Istorică', address: 'Str. Lipscani 45, Sector 3', lat: 44.4310, lng: 26.1000, type: 'Restaurare', description: 'Progres: 80%, 2 echipe' },
];

const WORKSHOPS_LOCATIONS: DemoLocation[] = [
  { id: 'w1', name: 'Auto Service Popescu', address: 'Șos. Colentina 200, Sector 2', lat: 44.4600, lng: 26.1300, type: 'Service Auto', description: 'Reparații mecanice și electrice', phone: '021-345-6789' },
  { id: 'w2', name: 'Vulcanizare Rapidă', address: 'Bd. Timișoara 80, Sector 6', lat: 44.4200, lng: 26.0400, type: 'Vulcanizare', description: 'Anvelope și geometrie', phone: '021-456-7890' },
  { id: 'w3', name: 'Tinichigerie & Vopsitorie Pro', address: 'Str. Ziduri Moși 35, Sector 2', lat: 44.4450, lng: 26.1100, type: 'Tinichigerie', description: 'Caroserie și vopsitorie' },
];

const LIVING_LOCATIONS: DemoLocation[] = [
  { id: 'l1', name: 'Bloc A3 Militari Residence', address: 'Bd. Iuliu Maniu 220, Sector 6', lat: 44.4300, lng: 26.0200, type: 'Bloc Rezidențial', description: '4 scări, 120 apartamente' },
  { id: 'l2', name: 'Bloc B7 Novum Residence', address: 'Str. Prelungirea Ghencea', lat: 44.4100, lng: 26.0500, type: 'Bloc Rezidențial', description: '2 scări, 60 apartamente' },
  { id: 'l3', name: 'Cartier Verde Baneasa', address: 'Șos. București-Ploiești 42', lat: 44.4900, lng: 26.0800, type: 'Complex Rezidențial', description: '8 blocuri, 480 apartamente' },
];

const CULTURE_LOCATIONS: DemoLocation[] = [
  { id: 'cu1', name: 'Opera Națională București', address: 'Bd. Mihail Kogălniceanu 70-72', lat: 44.4370, lng: 26.0870, type: 'Operă', description: 'Sala Mare + Sala Mică' },
  { id: 'cu2', name: 'Teatrul Național', address: 'Bd. Nicolae Bălcescu 2', lat: 44.4360, lng: 26.1020, type: 'Teatru', description: 'Sala Mare — 900 locuri' },
  { id: 'cu3', name: 'Ateneul Român', address: 'Str. Benjamin Franklin 1-3', lat: 44.4410, lng: 26.0970, type: 'Filarmonică', description: 'Sala George Enescu' },
];

const STUDENTS_LOCATIONS: DemoLocation[] = [
  { id: 'st1', name: 'ASE București', address: 'Piața Romană 6, Sector 1', lat: 44.4460, lng: 26.0990, type: 'Universitate', description: '12 facultăți, 22.000 studenți' },
  { id: 'st2', name: 'Universitatea București', address: 'Bd. M. Kogălniceanu 36-46', lat: 44.4360, lng: 26.0850, type: 'Universitate', description: '18 facultăți, 30.000 studenți' },
  { id: 'st3', name: 'Politehnica București', address: 'Splaiul Independenței 313', lat: 44.4380, lng: 26.0510, type: 'Universitate', description: '15 facultăți, 25.000 studenți' },
];

export const DEMO_LOCATIONS: Record<VerticalType, DemoLocation[]> = {
  kids: KIDS_LOCATIONS,
  schools: SCHOOLS_LOCATIONS,
  medicine: MEDICINE_LOCATIONS,
  construction: CONSTRUCTION_LOCATIONS,
  workshops: WORKSHOPS_LOCATIONS,
  living: LIVING_LOCATIONS,
  culture: CULTURE_LOCATIONS,
  students: STUDENTS_LOCATIONS,
};

export const VERTICAL_MAP_LABELS: Record<VerticalType, { title: string; subtitle: string; pinLabel: string }> = {
  kids: { title: 'Harta Grădinițelor', subtitle: 'Toate grădinițele din rețea', pinLabel: 'Grădiniță' },
  schools: { title: 'Harta Școlilor', subtitle: 'Instituții de învățământ partenere', pinLabel: 'Școală' },
  medicine: { title: 'Harta Clinicilor', subtitle: 'Cabinete și clinici partenere', pinLabel: 'Clinică' },
  construction: { title: 'Harta Șantierelor', subtitle: 'Locații active de construcție', pinLabel: 'Șantier' },
  workshops: { title: 'Harta Service-urilor', subtitle: 'Service-uri auto partenere', pinLabel: 'Service' },
  living: { title: 'Harta Blocurilor', subtitle: 'Asociații de proprietari membre', pinLabel: 'Bloc' },
  culture: { title: 'Harta Culturală', subtitle: 'Instituții culturale partenere', pinLabel: 'Instituție' },
  students: { title: 'Harta Universitară', subtitle: 'Universități partenere', pinLabel: 'Universitate' },
};

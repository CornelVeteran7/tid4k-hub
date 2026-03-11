/**
 * Multi-vertical configuration system.
 * WHITELABEL_TYPE determines which modules are available per vertical.
 */

export type VerticalType = 'kids' | 'schools' | 'medicine' | 'living' | 'culture' | 'students' | 'construction' | 'workshops';

export interface VerticalDefinition {
  label: string;
  description: string;
  defaultModules: string[];
  entityLabel: string;       // What the "group" is called in this vertical
  entityLabelPlural: string; // Plural form
  memberLabel: string;       // What the "child/student/patient" is called
  memberLabelPlural: string; // Plural form
  staffLabel: string;        // What the "teacher/doctor" is called
  staffLabelPlural: string;  // Plural form
  parentLabel: string;       // What the "parent/guardian" is called
  parentLabelPlural: string; // Plural form
  icon: string;
  groupTypeDefault: string;  // Default group.tip value
  // Vertical-aware module labels
  moduleLabels: {
    prezenta: { title: string; subtitle: string };
    imagini: { title: string; subtitle: string };
    documente: { title: string; subtitle: string };
    povesti: { title: string; subtitle: string };
    ateliere: { title: string; subtitle: string };
    meniu: { title: string; subtitle: string };
    mesaje: { title: string; subtitle: string };
  };
  // Dashboard summary labels
  summaryLabels: {
    mealLabel: string;        // "Mic dejun" vs "Program" vs "Task curent"
    activityLabel: string;    // "Activitate" vs "Curs curent" vs "Cabinet activ"
    attendanceLabel: string;  // "Tendințe prezență" vs "Progres taskuri"
    membersTitle: string;     // "Copiii grupei" vs "Pacienții cabinetului"
  };
}

export const VERTICAL_DEFINITIONS: Record<VerticalType, VerticalDefinition> = {
  kids: {
    label: 'Grădinițe',
    description: 'Digital signage & comunicare pentru grădinițe',
    defaultModules: ['prezenta', 'imagini', 'documente', 'povesti', 'ateliere', 'meniu', 'mesaje', 'orar', 'anunturi', 'video', 'social', 'inventar', 'sondaje'],
    entityLabel: 'Grupă',
    entityLabelPlural: 'Grupe',
    memberLabel: 'Copil',
    memberLabelPlural: 'Copii',
    staffLabel: 'Educatoare',
    staffLabelPlural: 'Educatoare',
    parentLabel: 'Părinte',
    parentLabelPlural: 'Părinți',
    icon: '🧒',
    groupTypeDefault: 'gradinita',
    moduleLabels: {
      prezenta: { title: 'PREZENȚA ȘI CONTRIBUȚIE', subtitle: 'Prezență, contribuții și plată online' },
      imagini: { title: 'IMAGINI', subtitle: 'Fotografii din activități' },
      documente: { title: 'DOCUMENTE', subtitle: 'Fișiere PDF partajate' },
      povesti: { title: 'POVEȘTI', subtitle: 'Citește, ascultă sau privește povești cu Inky' },
      ateliere: { title: 'ATELIERE', subtitle: 'Activități creative pentru copii' },
      meniu: { title: 'MENIUL SĂPTĂMÂNII', subtitle: 'Meniul zilnic pentru copii' },
      mesaje: { title: 'MESAJE', subtitle: 'Comunicare și sondaje' },
    },
    summaryLabels: {
      mealLabel: 'Mic dejun',
      activityLabel: 'Activitate',
      attendanceLabel: 'Tendințe prezență (ultimele 30 zile)',
      membersTitle: 'Copiii grupei',
    },
  },
  schools: {
    label: 'Școli',
    description: 'Platformă de comunicare pentru școli',
    defaultModules: ['prezenta', 'documente', 'mesaje', 'orar', 'orar_avansat', 'anunturi', 'rapoarte', 'imagini', 'video', 'social', 'inventar', 'revista', 'cluburi', 'sondaje'],
    entityLabel: 'Clasă',
    entityLabelPlural: 'Clase',
    memberLabel: 'Elev',
    memberLabelPlural: 'Elevi',
    staffLabel: 'Profesor',
    staffLabelPlural: 'Profesori',
    parentLabel: 'Părinte',
    parentLabelPlural: 'Părinți',
    icon: '🏫',
    groupTypeDefault: 'scoala',
    moduleLabels: {
      prezenta: { title: 'PREZENȚA', subtitle: 'Prezența elevilor la clasă' },
      imagini: { title: 'GALERIE', subtitle: 'Fotografii din activități școlare' },
      documente: { title: 'DOCUMENTE', subtitle: 'Materiale didactice și fișiere' },
      povesti: { title: 'LECTURĂ', subtitle: 'Resurse de lectură suplimentară' },
      ateliere: { title: 'PROIECTE', subtitle: 'Proiecte și activități extrașcolare' },
      meniu: { title: 'CANTINA', subtitle: 'Meniul cantinei școlare' },
      mesaje: { title: 'MESAJE', subtitle: 'Comunicare și sondaje' },
    },
    summaryLabels: {
      mealLabel: 'Cantina',
      activityLabel: 'Curs curent',
      attendanceLabel: 'Tendințe prezență elevi (ultimele 30 zile)',
      membersTitle: 'Elevii clasei',
    },
  },
  medicine: {
    label: 'Medicină',
    description: 'Infodisplay pentru cabinete și clinici',
    defaultModules: ['documente', 'mesaje', 'orar', 'anunturi', 'imagini', 'coada', 'video', 'sondaje'],
    entityLabel: 'Cabinet',
    entityLabelPlural: 'Cabinete',
    memberLabel: 'Pacient',
    memberLabelPlural: 'Pacienți',
    staffLabel: 'Medic',
    staffLabelPlural: 'Medici',
    parentLabel: 'Aparținător',
    parentLabelPlural: 'Aparținători',
    icon: '🏥',
    groupTypeDefault: 'scoala',
    moduleLabels: {
      prezenta: { title: 'PROGRAMĂRI', subtitle: 'Programările zilei' },
      imagini: { title: 'GALERIE', subtitle: 'Imagini cabinet și echipă' },
      documente: { title: 'DOCUMENTE', subtitle: 'Formulare și documente medicale' },
      povesti: { title: 'INFORMAȚII', subtitle: 'Sfaturi și informații medicale' },
      ateliere: { title: 'SERVICII', subtitle: 'Lista de servicii disponibile' },
      meniu: { title: 'PROGRAM', subtitle: 'Programul cabinetelor' },
      mesaje: { title: 'MESAJE', subtitle: 'Comunicare și sondaje' },
    },
    summaryLabels: {
      mealLabel: 'Program',
      activityLabel: 'Cabinet activ',
      attendanceLabel: 'Pacienți consultați (ultimele 30 zile)',
      membersTitle: 'Pacienții cabinetului',
    },
  },
  living: {
    label: 'Rezidențial',
    description: 'Comunicare pentru asociații de proprietari',
    defaultModules: ['documente', 'mesaje', 'anunturi', 'rapoarte', 'inventar', 'sondaje'],
    entityLabel: 'Bloc',
    entityLabelPlural: 'Blocuri',
    memberLabel: 'Locatar',
    memberLabelPlural: 'Locatari',
    staffLabel: 'Administrator',
    staffLabelPlural: 'Administratori',
    parentLabel: 'Proprietar',
    parentLabelPlural: 'Proprietari',
    icon: '🏢',
    groupTypeDefault: 'scoala',
    moduleLabels: {
      prezenta: { title: 'ÎNTREȚINERE', subtitle: 'Situația plăților lunare' },
      imagini: { title: 'GALERIE', subtitle: 'Fotografii bloc și spații comune' },
      documente: { title: 'DOCUMENTE', subtitle: 'Procese-verbale și acte' },
      povesti: { title: 'INFORMAȚII', subtitle: 'Regulament și informații utile' },
      ateliere: { title: 'LUCRĂRI', subtitle: 'Lucrări de întreținere și reparații' },
      meniu: { title: 'CHELTUIELI', subtitle: 'Situația cheltuielilor comune' },
      mesaje: { title: 'MESAJE', subtitle: 'Comunicare și sondaje' },
    },
    summaryLabels: {
      mealLabel: 'Cheltuieli',
      activityLabel: 'Lucrare curentă',
      attendanceLabel: 'Activitate locatari (ultimele 30 zile)',
      membersTitle: 'Locatarii blocului',
    },
  },
  culture: {
    label: 'Cultură',
    description: 'Digital signage pentru teatre și muzee',
    defaultModules: ['anunturi', 'documente', 'imagini', 'orar', 'video', 'supratitrare', 'sondaje'],
    entityLabel: 'Sală',
    entityLabelPlural: 'Săli',
    memberLabel: 'Vizitator',
    memberLabelPlural: 'Vizitatori',
    staffLabel: 'Regizor',
    staffLabelPlural: 'Regizori',
    parentLabel: 'Spectator',
    parentLabelPlural: 'Spectatori',
    icon: '🎭',
    groupTypeDefault: 'scoala',
    moduleLabels: {
      prezenta: { title: 'BILETE', subtitle: 'Vânzări și rezervări bilete' },
      imagini: { title: 'GALERIE', subtitle: 'Fotografii spectacole și repetiții' },
      documente: { title: 'DOCUMENTE', subtitle: 'Programe și materiale' },
      povesti: { title: 'REPERTORIU', subtitle: 'Spectacole din repertoriu' },
      ateliere: { title: 'EVENIMENTE', subtitle: 'Evenimente și gale speciale' },
      meniu: { title: 'PROGRAM', subtitle: 'Programul spectacolelor' },
      mesaje: { title: 'MESAJE', subtitle: 'Comunicare cu echipa artistică' },
    },
    summaryLabels: {
      mealLabel: 'Spectacol',
      activityLabel: 'Repetiție curentă',
      attendanceLabel: 'Spectatori (ultimele 30 zile)',
      membersTitle: 'Echipa artistică',
    },
  },
  students: {
    label: 'Universități',
    description: 'Platformă pentru universități',
    defaultModules: ['prezenta', 'documente', 'mesaje', 'orar', 'anunturi', 'rapoarte', 'coada'],
    entityLabel: 'Facultate',
    entityLabelPlural: 'Facultăți',
    memberLabel: 'Student',
    memberLabelPlural: 'Studenți',
    staffLabel: 'Profesor',
    staffLabelPlural: 'Profesori',
    parentLabel: 'Student',
    parentLabelPlural: 'Studenți',
    icon: '🎓',
    groupTypeDefault: 'scoala',
    moduleLabels: {
      prezenta: { title: 'PREZENȚA', subtitle: 'Prezența studenților la cursuri' },
      imagini: { title: 'GALERIE', subtitle: 'Fotografii campus și evenimente' },
      documente: { title: 'DOCUMENTE', subtitle: 'Cursuri și materiale didactice' },
      povesti: { title: 'BIBLIOTECĂ', subtitle: 'Resurse bibliografice' },
      ateliere: { title: 'CERCETARE', subtitle: 'Proiecte de cercetare' },
      meniu: { title: 'CANTINA', subtitle: 'Meniul cantinei studențești' },
      mesaje: { title: 'MESAJE', subtitle: 'Comunicare cu secretariatul' },
    },
    summaryLabels: {
      mealLabel: 'Cantina',
      activityLabel: 'Curs curent',
      attendanceLabel: 'Prezență studenți (ultimele 30 zile)',
      membersTitle: 'Studenții facultății',
    },
  },
  construction: {
    label: 'Construcții',
    description: 'Comunicare pentru șantiere',
    defaultModules: ['documente', 'mesaje', 'anunturi', 'rapoarte', 'inventar', 'ssm'],
    entityLabel: 'Șantier',
    entityLabelPlural: 'Șantiere',
    memberLabel: 'Muncitor',
    memberLabelPlural: 'Muncitori',
    staffLabel: 'Inginer',
    staffLabelPlural: 'Ingineri',
    parentLabel: 'Șef echipă',
    parentLabelPlural: 'Șefi echipă',
    icon: '🏗️',
    groupTypeDefault: 'scoala',
    moduleLabels: {
      prezenta: { title: 'PONTAJ', subtitle: 'Pontajul echipei pe șantier' },
      imagini: { title: 'FOTO PROGRES', subtitle: 'Fotografii progres lucrări' },
      documente: { title: 'DOCUMENTE', subtitle: 'Planuri și autorizații' },
      povesti: { title: 'PROCEDURI', subtitle: 'Proceduri și instrucțiuni SSM' },
      ateliere: { title: 'TASKURI', subtitle: 'Taskuri active pe șantier' },
      meniu: { title: 'PROGRAM', subtitle: 'Programul echipelor' },
      mesaje: { title: 'MESAJE', subtitle: 'Comunicare cu echipele' },
    },
    summaryLabels: {
      mealLabel: 'Program azi',
      activityLabel: 'Task curent',
      attendanceLabel: 'Progres taskuri (ultimele 30 zile)',
      membersTitle: 'Echipa de pe șantier',
    },
  },
  workshops: {
    label: 'Service Auto',
    description: 'Management service auto',
    defaultModules: ['documente', 'mesaje', 'anunturi', 'orar', 'rapoarte', 'inventar'],
    entityLabel: 'Service',
    entityLabelPlural: 'Service-uri',
    memberLabel: 'Client',
    memberLabelPlural: 'Clienți',
    staffLabel: 'Mecanic',
    staffLabelPlural: 'Mecanici',
    parentLabel: 'Client',
    parentLabelPlural: 'Clienți',
    icon: '🔧',
    groupTypeDefault: 'scoala',
    moduleLabels: {
      prezenta: { title: 'PROGRAMĂRI', subtitle: 'Programările zilei în service' },
      imagini: { title: 'GALERIE', subtitle: 'Fotografii lucrări și piese' },
      documente: { title: 'DOCUMENTE', subtitle: 'Fișe tehnice și facturi' },
      povesti: { title: 'CATALOG', subtitle: 'Catalog piese și accesorii' },
      ateliere: { title: 'LUCRĂRI', subtitle: 'Lucrări active în service' },
      meniu: { title: 'TARIFE', subtitle: 'Lista de tarife și servicii' },
      mesaje: { title: 'MESAJE', subtitle: 'Comunicare cu clienții' },
    },
    summaryLabels: {
      mealLabel: 'Programare',
      activityLabel: 'Lucrare curentă',
      attendanceLabel: 'Vehicule procesate (ultimele 30 zile)',
      membersTitle: 'Clienții service-ului',
    },
  },
};

/** Get the current vertical from env or default to kids */
export function getWhitelabelType(): VerticalType {
  const envVal = (import.meta.env.VITE_WHITELABEL_TYPE || 'kids') as string;
  if (envVal in VERTICAL_DEFINITIONS) return envVal as VerticalType;
  return 'kids';
}

/** Check if a module should be active for a given vertical */
export function isModuleActiveForVertical(moduleKey: string, vertical: VerticalType): boolean {
  return VERTICAL_DEFINITIONS[vertical]?.defaultModules.includes(moduleKey) ?? false;
}

/** Get vertical-aware role labels */
export function getVerticalRoleLabel(role: string, vertical: VerticalType): string {
  const def = VERTICAL_DEFINITIONS[vertical];
  if (!def) return role;
  
  const mapping: Record<string, string> = {
    parinte: def.parentLabel,
    profesor: def.staffLabel,
    director: 'Director',
    administrator: 'Administrator',
    secretara: 'Secretară',
    sponsor: 'Sponsor',
    inky: 'Superuser',
  };
  return mapping[role.toLowerCase()] || role;
}

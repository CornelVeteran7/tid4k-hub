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
}

export const VERTICAL_DEFINITIONS: Record<VerticalType, VerticalDefinition> = {
  kids: {
    label: 'Grădinițe',
    description: 'Digital signage & comunicare pentru grădinițe',
    defaultModules: ['prezenta', 'imagini', 'documente', 'povesti', 'ateliere', 'meniu', 'mesaje', 'orar', 'anunturi', 'video', 'social'],
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
  },
  schools: {
    label: 'Școli',
    description: 'Platformă de comunicare pentru școli',
    defaultModules: ['prezenta', 'documente', 'mesaje', 'orar', 'anunturi', 'rapoarte', 'imagini', 'video', 'social', 'inventar', 'revista'],
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
  },
  medicine: {
    label: 'Medicină',
    description: 'Infodisplay pentru cabinete și clinici',
    defaultModules: ['documente', 'mesaje', 'orar', 'anunturi', 'imagini', 'coada', 'video'],
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
  },
  living: {
    label: 'Rezidențial',
    description: 'Comunicare pentru asociații de proprietari',
    defaultModules: ['documente', 'mesaje', 'anunturi', 'rapoarte', 'inventar'],
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
  },
  culture: {
    label: 'Cultură',
    description: 'Digital signage pentru teatre și muzee',
    defaultModules: ['anunturi', 'documente', 'imagini', 'orar', 'video', 'supratitrare'],
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
  },
  construction: {
    label: 'Construcții',
    description: 'Comunicare pentru șantiere',
    defaultModules: ['documente', 'mesaje', 'anunturi', 'rapoarte'],
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
  },
  workshops: {
    label: 'Service Auto',
    description: 'Management service auto',
    defaultModules: ['documente', 'mesaje', 'anunturi', 'orar', 'rapoarte'],
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

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
  memberLabel: string;       // What the "child/student/patient" is called
  icon: string;
}

export const VERTICAL_DEFINITIONS: Record<VerticalType, VerticalDefinition> = {
  kids: {
    label: 'Grădinițe',
    description: 'Digital signage & comunicare pentru grădinițe',
    defaultModules: ['prezenta', 'imagini', 'documente', 'povesti', 'ateliere', 'meniu', 'mesaje', 'orar', 'anunturi'],
    entityLabel: 'Grupă',
    memberLabel: 'Copil',
    icon: '🧒',
  },
  schools: {
    label: 'Școli',
    description: 'Platformă de comunicare pentru școli',
    defaultModules: ['prezenta', 'documente', 'mesaje', 'orar', 'anunturi', 'rapoarte'],
    entityLabel: 'Clasă',
    memberLabel: 'Elev',
    icon: '🏫',
  },
  medicine: {
    label: 'Medicină',
    description: 'Infodisplay pentru cabinete și clinici',
    defaultModules: ['documente', 'mesaje', 'orar', 'anunturi', 'imagini'],
    entityLabel: 'Cabinet',
    memberLabel: 'Pacient',
    icon: '🏥',
  },
  living: {
    label: 'Rezidențial',
    description: 'Comunicare pentru asociații de proprietari',
    defaultModules: ['documente', 'mesaje', 'anunturi', 'rapoarte'],
    entityLabel: 'Bloc',
    memberLabel: 'Locatar',
    icon: '🏢',
  },
  culture: {
    label: 'Cultură',
    description: 'Digital signage pentru teatre și muzee',
    defaultModules: ['anunturi', 'documente', 'imagini', 'orar'],
    entityLabel: 'Sală',
    memberLabel: 'Vizitator',
    icon: '🎭',
  },
  students: {
    label: 'Universități',
    description: 'Platformă pentru universități',
    defaultModules: ['prezenta', 'documente', 'mesaje', 'orar', 'anunturi', 'rapoarte'],
    entityLabel: 'Facultate',
    memberLabel: 'Student',
    icon: '🎓',
  },
  construction: {
    label: 'Construcții',
    description: 'Comunicare pentru șantiere',
    defaultModules: ['documente', 'mesaje', 'anunturi', 'rapoarte'],
    entityLabel: 'Șantier',
    memberLabel: 'Muncitor',
    icon: '🏗️',
  },
  workshops: {
    label: 'Service Auto',
    description: 'Management service auto',
    defaultModules: ['documente', 'mesaje', 'anunturi', 'orar', 'rapoarte'],
    entityLabel: 'Service',
    memberLabel: 'Client',
    icon: '🔧',
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

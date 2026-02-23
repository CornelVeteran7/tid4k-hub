export interface StoryCharacter {
  id: string;
  name: string;
  animal: string;
  emoji: string;
  description: string;
  color: string; // tailwind ring color class
  bgColor: string; // tailwind bg color class
  voiceDescription: string;
}

export const storyCharacters: StoryCharacter[] = [
  {
    id: 'inky',
    name: 'Inky',
    animal: 'Bufniță',
    emoji: '🦉',
    description: 'Înțeleaptă și calmă',
    color: 'ring-primary',
    bgColor: 'bg-primary/15',
    voiceDescription: 'Voce caldă, lentă, cu ton grav și pauze dramatice — ca un bunic care știe toate secretele pădurii.',
  },
  {
    id: 'vixie',
    name: 'Vixie',
    animal: 'Vulpe',
    emoji: '🦊',
    description: 'Jucăușă și energică',
    color: 'ring-orange-500',
    bgColor: 'bg-orange-500/15',
    voiceDescription: 'Voce vioi, rapidă, plină de entuziasm — sare de la un cuvânt la altul cu bucurie.',
  },
  {
    id: 'nuko',
    name: 'Nuko',
    animal: 'Arici',
    emoji: '🦔',
    description: 'Blând și cald',
    color: 'ring-amber-700',
    bgColor: 'bg-amber-700/15',
    voiceDescription: 'Voce blândă, caldă, ca un prieten care te mângâie pe creștet când ești trist.',
  },
  {
    id: 'eli',
    name: 'Eli',
    animal: 'Fluture',
    emoji: '🦋',
    description: 'Visătoare și delicată',
    color: 'ring-violet-500',
    bgColor: 'bg-violet-500/15',
    voiceDescription: 'Voce eterică, moale, ca o adiere de vânt printre flori — perfectă pentru povești de noapte bună.',
  },
  {
    id: 'poki',
    name: 'Poki',
    animal: 'Pește',
    emoji: '🐟',
    description: 'Vesel și amuzant',
    color: 'ring-cyan-500',
    bgColor: 'bg-cyan-500/15',
    voiceDescription: 'Voce bubbly, comică, cu efecte sonore și glume — face copiii să râdă la fiecare propoziție.',
  },
];

import type { Conversation, Message } from '@/types';
import type { VerticalType } from '@/config/verticalConfig';

interface DemoMessageSet {
  conversations: Conversation[];
  messages: Record<string, Message[]>; // keyed by conversation id
}

function buildSet(convos: { id: string; contact: string; contactId: string; grupa: string; lastMsg: string; time: string; unread: number }[], msgs: Record<string, { from: string; fromName: string; to: string; text: string; time: string; read: boolean }[]>): DemoMessageSet {
  return {
    conversations: convos.map(c => ({
      id: c.id,
      contact_nume: c.contact,
      contact_id: c.contactId,
      ultimul_mesaj: c.lastMsg,
      data_ultimul_mesaj: c.time,
      necitite: c.unread,
      grupa: c.grupa,
    })),
    messages: Object.fromEntries(
      Object.entries(msgs).map(([convId, arr]) => [
        convId,
        arr.map((m, i) => ({
          id: `demo-msg-${convId}-${i}`,
          expeditor: m.from,
          expeditor_nume: m.fromName,
          destinatar: m.to,
          mesaj: m.text,
          data: m.time,
          citit: m.read,
        })),
      ])
    ),
  };
}

const today = new Date().toISOString().slice(0, 10);
const t = (h: number, m: number) => `${today}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00.000Z`;

const DEMO_MESSAGES: Record<VerticalType, DemoMessageSet> = {
  kids: buildSet(
    [
      { id: 'k1', contact: 'Elena Popescu (Educatoare)', contactId: 'demo-edu-1', grupa: 'fluturasi', lastMsg: 'Da, mâine are nevoie de șosete de schimb', time: t(9, 30), unread: 1 },
      { id: 'k2', contact: 'Ana Dumitrescu (Director)', contactId: 'demo-dir-1', grupa: 'fluturasi', lastMsg: 'Am primit documentele. Mulțumim!', time: t(8, 15), unread: 0 },
      { id: 'k3', contact: 'Ioana Marinescu (Secretară)', contactId: 'demo-sec-1', grupa: 'fluturasi', lastMsg: 'Contribuția pe luna aceasta a fost înregistrată', time: `${today}T07:45:00.000Z`, unread: 0 },
    ],
    {
      k1: [
        { from: 'demo-user-00000000', fromName: 'Maria Ionescu', to: 'demo-edu-1', text: 'Bună dimineața! Andrei a dormit puțin noaptea trecută, s-ar putea să fie mai obosit azi.', time: t(7, 30), read: true },
        { from: 'demo-edu-1', fromName: 'Elena Popescu', to: 'demo-user-00000000', text: 'Am înțeles, o să am grijă de el. Îl las să se odihnească dacă e nevoie.', time: t(7, 45), read: true },
        { from: 'demo-user-00000000', fromName: 'Maria Ionescu', to: 'demo-edu-1', text: 'Mulțumesc mult! Are nevoie de ceva pentru mâine?', time: t(9, 0), read: true },
        { from: 'demo-edu-1', fromName: 'Elena Popescu', to: 'demo-user-00000000', text: 'Da, mâine are nevoie de șosete de schimb', time: t(9, 30), read: false },
      ],
      k2: [
        { from: 'demo-dir-1', fromName: 'Ana Dumitrescu', to: 'demo-user-00000000', text: 'Bună ziua! Vă rog să trimiteți o copie a certificatului de naștere pentru dosarul actualizat.', time: t(7, 50), read: true },
        { from: 'demo-user-00000000', fromName: 'Maria Ionescu', to: 'demo-dir-1', text: 'Am trimis documentul prin secțiunea Documente.', time: t(8, 10), read: true },
        { from: 'demo-dir-1', fromName: 'Ana Dumitrescu', to: 'demo-user-00000000', text: 'Am primit documentele. Mulțumim!', time: t(8, 15), read: true },
      ],
      k3: [
        { from: 'demo-sec-1', fromName: 'Ioana Marinescu', to: 'demo-user-00000000', text: 'Contribuția pe luna aceasta a fost înregistrată', time: t(7, 45), read: true },
      ],
    }
  ),
  schools: buildSet(
    [
      { id: 's1', contact: 'Prof. Andrei Popa', contactId: 'demo-prof-1', grupa: 'cls-1a', lastMsg: 'Tema de la matematică trebuie predată vineri', time: t(10, 0), unread: 1 },
      { id: 's2', contact: 'Secretariat', contactId: 'demo-sec-s1', grupa: 'cls-1a', lastMsg: 'Adeverința este gata de ridicat', time: t(8, 30), unread: 0 },
    ],
    {
      s1: [
        { from: 'demo-user-00000000', fromName: 'Ion Popescu', to: 'demo-prof-1', text: 'Bună ziua! Maria a lipsit ieri - poate primi tema?', time: t(9, 0), read: true },
        { from: 'demo-prof-1', fromName: 'Prof. Andrei Popa', to: 'demo-user-00000000', text: 'Tema de la matematică trebuie predată vineri', time: t(10, 0), read: false },
      ],
      s2: [
        { from: 'demo-sec-s1', fromName: 'Secretariat', to: 'demo-user-00000000', text: 'Adeverința este gata de ridicat', time: t(8, 30), read: true },
      ],
    }
  ),
  medicine: buildSet(
    [
      { id: 'm1', contact: 'Dr. Alexandru Marin', contactId: 'demo-dr-1', grupa: 'cab-1', lastMsg: 'Controlul de mâine este la ora 14:00', time: t(11, 0), unread: 1 },
      { id: 'm2', contact: 'Recepție', contactId: 'demo-rec-1', grupa: 'cab-1', lastMsg: 'Programarea dvs. a fost confirmată', time: t(9, 0), unread: 0 },
    ],
    {
      m1: [
        { from: 'demo-user-00000000', fromName: 'Mihai Stanescu', to: 'demo-dr-1', text: 'Bună ziua, doctor. Am o întrebare despre tratament.', time: t(10, 30), read: true },
        { from: 'demo-dr-1', fromName: 'Dr. Alexandru Marin', to: 'demo-user-00000000', text: 'Controlul de mâine este la ora 14:00', time: t(11, 0), read: false },
      ],
      m2: [
        { from: 'demo-rec-1', fromName: 'Recepție', to: 'demo-user-00000000', text: 'Programarea dvs. a fost confirmată', time: t(9, 0), read: true },
      ],
    }
  ),
  construction: buildSet(
    [
      { id: 'c1', contact: 'Ing. Florin Barbu', contactId: 'demo-ing-1', grupa: 'sant-1', lastMsg: 'Betonul a fost turnat în lot 3', time: t(14, 0), unread: 0 },
      { id: 'c2', contact: 'Vasile Niță (Șef Echipă)', contactId: 'demo-sef-1', grupa: 'sant-1', lastMsg: 'Avem nevoie de 20 saci ciment mâine', time: t(12, 30), unread: 1 },
    ],
    {
      c1: [
        { from: 'demo-ing-1', fromName: 'Ing. Florin Barbu', to: 'demo-user-00000000', text: 'Betonul a fost turnat în lot 3', time: t(14, 0), read: true },
      ],
      c2: [
        { from: 'demo-sef-1', fromName: 'Vasile Niță', to: 'demo-user-00000000', text: 'Avem nevoie de 20 saci ciment mâine', time: t(12, 30), read: false },
      ],
    }
  ),
  workshops: buildSet(
    [
      { id: 'w1', contact: 'Dan Stoica (Mecanic)', contactId: 'demo-mec-1', grupa: 'atelier-1', lastMsg: 'Piesa a sosit, putem programa montajul', time: t(15, 0), unread: 1 },
    ],
    {
      w1: [
        { from: 'demo-user-00000000', fromName: 'Adrian Neagu', to: 'demo-mec-1', text: 'Când sosește piesa comandată?', time: t(13, 0), read: true },
        { from: 'demo-mec-1', fromName: 'Dan Stoica', to: 'demo-user-00000000', text: 'Piesa a sosit, putem programa montajul', time: t(15, 0), read: false },
      ],
    }
  ),
  living: buildSet(
    [
      { id: 'l1', contact: 'Admin Bloc A3', contactId: 'demo-admin-l1', grupa: 'sc-a', lastMsg: 'Apa caldă va fi oprită vineri între 10-14', time: t(8, 0), unread: 1 },
    ],
    {
      l1: [
        { from: 'demo-admin-l1', fromName: 'Admin Bloc A3', to: 'demo-user-00000000', text: 'Apa caldă va fi oprită vineri între 10-14', time: t(8, 0), read: false },
      ],
    }
  ),
  culture: buildSet(
    [
      { id: 'cu1', contact: 'Dir. Artistic', contactId: 'demo-dart-1', grupa: 'sala-mare', lastMsg: 'Repetiția generală e sâmbătă la 10:00', time: t(16, 0), unread: 0 },
    ],
    {
      cu1: [
        { from: 'demo-dart-1', fromName: 'Dir. Artistic', to: 'demo-user-00000000', text: 'Repetiția generală e sâmbătă la 10:00', time: t(16, 0), read: true },
      ],
    }
  ),
  students: buildSet(
    [
      { id: 'st1', contact: 'Secretar ASE', contactId: 'demo-sec-st1', grupa: 'fac-eg', lastMsg: 'Adeverința de student e gata', time: t(10, 30), unread: 1 },
    ],
    {
      st1: [
        { from: 'demo-user-00000000', fromName: 'Student Demo', to: 'demo-sec-st1', text: 'Bună ziua, am solicitat o adeverință de student acum 3 zile.', time: t(9, 0), read: true },
        { from: 'demo-sec-st1', fromName: 'Secretar ASE', to: 'demo-user-00000000', text: 'Adeverința de student e gata', time: t(10, 30), read: false },
      ],
    }
  ),
};

export function getDemoConversations(vertical: VerticalType): Conversation[] {
  return DEMO_MESSAGES[vertical]?.conversations || DEMO_MESSAGES.kids.conversations;
}

export function getDemoMessages(vertical: VerticalType, conversationId: string): Message[] {
  const set = DEMO_MESSAGES[vertical] || DEMO_MESSAGES.kids;
  return set.messages[conversationId] || [];
}

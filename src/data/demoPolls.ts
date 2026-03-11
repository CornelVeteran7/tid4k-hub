import type { Poll } from '@/types/poll';
import type { VerticalType } from '@/config/verticalConfig';

const now = new Date();
const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();
const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

const DEMO_POLLS: Record<VerticalType, Poll[]> = {
  kids: [
    {
      id: 'poll-k1', title: 'Ce temă preferați pentru serbarea de Crăciun?', description: 'Votați pentru tema preferată a serbării din decembrie.',
      poll_type: 'single', results_visibility: 'after_vote', deadline: inFiveDays, created_by: 'demo-dir-1',
      creator_name: 'Ana Dumitrescu', is_closed: false, created_at: now.toISOString(), organization_id: 'demo-org',
      options: [
        { id: 'opt-k1a', label: 'Poveste de iarnă', position: 0, vote_count: 12 },
        { id: 'opt-k1b', label: 'Moș Crăciun și elfii', position: 1, vote_count: 8 },
        { id: 'opt-k1c', label: 'Animale polare', position: 2, vote_count: 5 },
      ],
      total_votes: 25, user_voted: false,
    },
    {
      id: 'poll-k2', title: 'Excursia de primăvară - destinație', description: 'Alegeți destinația preferată pentru excursia de primăvară.',
      poll_type: 'single', results_visibility: 'always', deadline: inTwoDays, created_by: 'demo-edu-1',
      creator_name: 'Elena Popescu', is_closed: false, created_at: new Date(now.getTime() - 3600000).toISOString(), organization_id: 'demo-org',
      options: [
        { id: 'opt-k2a', label: 'Grădina Botanică', position: 0, vote_count: 15 },
        { id: 'opt-k2b', label: 'Zoo Băneasa', position: 1, vote_count: 20 },
        { id: 'opt-k2c', label: 'Muzeul Antipa', position: 2, vote_count: 10 },
      ],
      total_votes: 45, user_voted: true,
    },
  ],
  schools: [
    {
      id: 'poll-s1', title: 'Uniforma școlară - culoare preferată', poll_type: 'single',
      results_visibility: 'after_close', deadline: inFiveDays, created_by: 'demo-dir-1',
      creator_name: 'Director Școală', is_closed: false, created_at: now.toISOString(), organization_id: 'demo-org',
      options: [
        { id: 'opt-s1a', label: 'Bleumarin', position: 0, vote_count: 30 },
        { id: 'opt-s1b', label: 'Gri', position: 1, vote_count: 25 },
        { id: 'opt-s1c', label: 'Verde închis', position: 2, vote_count: 15 },
      ],
      total_votes: 70, user_voted: false,
    },
    {
      id: 'poll-s2', title: 'Ce activități extrașcolare doriți?', poll_type: 'multiple',
      results_visibility: 'always', deadline: inTwoDays, created_by: 'demo-prof-1',
      creator_name: 'Prof. Andrei Popa', is_closed: false, created_at: now.toISOString(), organization_id: 'demo-org',
      options: [
        { id: 'opt-s2a', label: 'Robotică', position: 0, vote_count: 40 },
        { id: 'opt-s2b', label: 'Teatru', position: 1, vote_count: 25 },
        { id: 'opt-s2c', label: 'Fotbal', position: 2, vote_count: 35 },
        { id: 'opt-s2d', label: 'Pictură', position: 3, vote_count: 20 },
      ],
      total_votes: 60, user_voted: true,
    },
  ],
  medicine: [
    {
      id: 'poll-m1', title: 'Preferați programări online sau telefonice?', poll_type: 'single',
      results_visibility: 'after_vote', deadline: inFiveDays, created_by: 'demo-dr-1',
      creator_name: 'Dr. Alexandru Marin', is_closed: false, created_at: now.toISOString(), organization_id: 'demo-org',
      options: [
        { id: 'opt-m1a', label: 'Online (website/app)', position: 0, vote_count: 45 },
        { id: 'opt-m1b', label: 'Telefonic', position: 1, vote_count: 20 },
        { id: 'opt-m1c', label: 'Ambele', position: 2, vote_count: 30 },
      ],
      total_votes: 95, user_voted: false,
    },
  ],
  construction: [
    {
      id: 'poll-c1', title: 'Programul de lucru pe sâmbătă', poll_type: 'single',
      results_visibility: 'always', deadline: inTwoDays, created_by: 'demo-ing-1',
      creator_name: 'Ing. Florin Barbu', is_closed: false, created_at: now.toISOString(), organization_id: 'demo-org',
      options: [
        { id: 'opt-c1a', label: '6:00 - 14:00', position: 0, vote_count: 8 },
        { id: 'opt-c1b', label: '7:00 - 15:00', position: 1, vote_count: 12 },
        { id: 'opt-c1c', label: 'Nu lucrăm sâmbătă', position: 2, vote_count: 5 },
      ],
      total_votes: 25, user_voted: false,
    },
  ],
  workshops: [
    {
      id: 'poll-w1', title: 'Ce echipament nou ar fi cel mai util?', poll_type: 'multiple',
      results_visibility: 'after_vote', deadline: inFiveDays, created_by: 'demo-mec-1',
      creator_name: 'Dan Stoica', is_closed: false, created_at: now.toISOString(), organization_id: 'demo-org',
      options: [
        { id: 'opt-w1a', label: 'Elevator 4 coloane', position: 0, vote_count: 6 },
        { id: 'opt-w1b', label: 'Tester diagnoză OBD', position: 1, vote_count: 8 },
        { id: 'opt-w1c', label: 'Aparat climatizare', position: 2, vote_count: 4 },
      ],
      total_votes: 10, user_voted: false,
    },
  ],
  living: [
    {
      id: 'poll-l1', title: 'Renovarea scării de bloc - culoare pereți', poll_type: 'single',
      results_visibility: 'after_close', deadline: inFiveDays, created_by: 'demo-admin-l1',
      creator_name: 'Admin Bloc A3', is_closed: false, created_at: now.toISOString(), organization_id: 'demo-org',
      options: [
        { id: 'opt-l1a', label: 'Alb clasic', position: 0, vote_count: 10 },
        { id: 'opt-l1b', label: 'Crem deschis', position: 1, vote_count: 15 },
        { id: 'opt-l1c', label: 'Galben pal', position: 2, vote_count: 5 },
      ],
      total_votes: 30, user_voted: false,
    },
  ],
  culture: [
    {
      id: 'poll-cu1', title: 'Ce spectacol doriți în stagiunea următoare?', poll_type: 'free_text',
      results_visibility: 'after_close', deadline: inFiveDays, created_by: 'demo-dart-1',
      creator_name: 'Dir. Artistic', is_closed: false, created_at: now.toISOString(), organization_id: 'demo-org',
      options: [],
      total_votes: 12, user_voted: false,
    },
  ],
  students: [
    {
      id: 'poll-st1', title: 'Sesiunea de examene - program preferat', poll_type: 'single',
      results_visibility: 'always', deadline: inTwoDays, created_by: 'demo-sec-st1',
      creator_name: 'Secretar ASE', is_closed: false, created_at: now.toISOString(), organization_id: 'demo-org',
      options: [
        { id: 'opt-st1a', label: 'Dimineața (8-12)', position: 0, vote_count: 35 },
        { id: 'opt-st1b', label: 'După-amiaza (14-18)', position: 1, vote_count: 50 },
      ],
      total_votes: 85, user_voted: false,
    },
  ],
};

export function getDemoPolls(vertical: VerticalType): Poll[] {
  return DEMO_POLLS[vertical] || DEMO_POLLS.kids;
}

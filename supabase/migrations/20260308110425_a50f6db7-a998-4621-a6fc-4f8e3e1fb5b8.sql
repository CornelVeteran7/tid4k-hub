
-- Conversations and Messages
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_1 uuid references public.profiles(id) on delete cascade not null,
  participant_2 uuid references public.profiles(id) on delete cascade not null,
  grupa text default '',
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);
alter table public.conversations enable row level security;

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  mesaj text not null,
  citit boolean default false,
  created_at timestamptz default now()
);
alter table public.messages enable row level security;

-- Announcements
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  titlu text not null,
  continut text not null,
  autor_id uuid references public.profiles(id) on delete set null,
  autor_nume text default '',
  prioritate text default 'normal',
  target text default 'scoala',
  ascuns_banda boolean default false,
  pozitie_banda int,
  created_at timestamptz default now()
);
alter table public.announcements enable row level security;

create table public.announcement_reads (
  id uuid primary key default gen_random_uuid(),
  announcement_id uuid references public.announcements(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (announcement_id, user_id)
);
alter table public.announcement_reads enable row level security;

-- Documents
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  nume_fisier text not null,
  tip_fisier text default 'pdf',
  categorie text default 'activitati',
  uploadat_de_id uuid references public.profiles(id) on delete set null,
  uploadat_de_nume text default '',
  url text not null,
  thumbnail_url text,
  marime int default 0,
  group_id uuid references public.groups(id) on delete set null,
  created_at timestamptz default now()
);
alter table public.documents enable row level security;

-- Menu
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  saptamana text not null,
  masa text not null,
  zi text not null,
  continut text not null,
  emoji text default '',
  created_at timestamptz default now()
);
alter table public.menu_items enable row level security;

create table public.nutritional_data (
  id uuid primary key default gen_random_uuid(),
  saptamana text not null,
  zi text not null,
  kcal int default 0,
  carbohidrati int default 0,
  proteine int default 0,
  grasimi int default 0,
  fibre int default 0
);
alter table public.nutritional_data enable row level security;

create table public.menu_metadata (
  id uuid primary key default gen_random_uuid(),
  saptamana text not null unique,
  alergeni text[] default '{}',
  semnatura_director text default '',
  semnatura_asistent text default '',
  semnatura_administrator text default '',
  created_at timestamptz default now()
);
alter table public.menu_metadata enable row level security;

-- Schedule
create table public.schedule (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade,
  zi text not null,
  ora text not null,
  materie text not null,
  profesor text default '',
  culoare text default '#E3F2FD',
  created_at timestamptz default now()
);
alter table public.schedule enable row level security;

-- Cancelarie
create table public.cancelarie_teachers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  nume text not null,
  avatar_url text default '/placeholder.svg',
  qr_data text default '',
  absent_dates date[] default '{}',
  created_at timestamptz default now()
);
alter table public.cancelarie_teachers enable row level security;

create table public.cancelarie_activities (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references public.cancelarie_teachers(id) on delete cascade not null,
  data date not null,
  descriere text not null,
  created_at timestamptz default now()
);
alter table public.cancelarie_activities enable row level security;

-- Stories
create table public.stories (
  id uuid primary key default gen_random_uuid(),
  titlu text not null,
  continut text not null,
  categorie text default 'educative',
  varsta text default '3-5',
  thumbnail text,
  audio_url text,
  created_at timestamptz default now()
);
alter table public.stories enable row level security;

create table public.story_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  story_id uuid references public.stories(id) on delete cascade not null,
  unique (user_id, story_id)
);
alter table public.story_favorites enable row level security;

-- Workshops
create table public.workshops (
  id uuid primary key default gen_random_uuid(),
  titlu text not null,
  descriere text default '',
  luna text not null,
  imagine_url text default '',
  categorie text default 'arta',
  materiale text[] default '{}',
  instructor text default '',
  durata_minute int default 30,
  scoli_target text[] default '{all}',
  publicat boolean default false,
  data_publicare timestamptz,
  created_at timestamptz default now()
);
alter table public.workshops enable row level security;

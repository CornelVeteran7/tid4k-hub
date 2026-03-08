
-- Role enum and core tables
create type public.app_role as enum ('parinte', 'profesor', 'director', 'administrator', 'secretara', 'sponsor', 'inky');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nume_prenume text not null default '',
  telefon text default '',
  email text default '',
  avatar_url text default '',
  status text default '',
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, nume_prenume)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')
  );
  insert into public.user_roles (user_id, role) values (new.id, 'parinte');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.schools (
  id uuid primary key default gen_random_uuid(),
  nume text not null,
  adresa text default '',
  tip text default 'gradinita',
  logo_url text default '/placeholder.svg',
  nr_copii int default 0,
  nr_profesori int default 0,
  activ boolean default true,
  sponsori_activi uuid[] default '{}',
  created_at timestamptz default now()
);
alter table public.schools enable row level security;

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete cascade,
  slug text not null unique,
  nume text not null,
  tip text default 'gradinita',
  created_at timestamptz default now()
);
alter table public.groups enable row level security;

create table public.user_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  group_id uuid references public.groups(id) on delete cascade not null,
  unique (user_id, group_id)
);
alter table public.user_groups enable row level security;

create table public.children (
  id uuid primary key default gen_random_uuid(),
  nume_prenume text not null,
  group_id uuid references public.groups(id) on delete set null,
  data_nasterii date,
  parinte_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);
alter table public.children enable row level security;

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references public.children(id) on delete cascade not null,
  data date not null,
  prezent boolean default false,
  observatii text default '',
  marked_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  unique (child_id, data)
);
alter table public.attendance enable row level security;

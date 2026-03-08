
-- Sponsors
create table public.sponsors (
  id uuid primary key default gen_random_uuid(),
  nume text not null,
  logo_url text default '',
  website text default '',
  culoare_brand text default '#000000',
  descriere text default '',
  activ boolean default true,
  data_start date,
  data_expirare date,
  plan text default 'Basic',
  created_at timestamptz default now()
);
alter table public.sponsors enable row level security;

create table public.sponsor_promos (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid references public.sponsors(id) on delete cascade not null,
  tip text not null,
  titlu text not null,
  descriere text default '',
  link_url text default '',
  cta_text text default '',
  prioritate int default 1,
  activ boolean default true,
  scoli_target text[] default '{all}',
  stil_card jsonb,
  stil_inky jsonb,
  stil_ticker jsonb,
  created_at timestamptz default now()
);
alter table public.sponsor_promos enable row level security;

create table public.sponsor_campaigns (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid references public.sponsors(id) on delete cascade not null,
  tip text not null,
  titlu text not null,
  descriere text default '',
  link_url text default '',
  cta_text text default '',
  prioritate int default 1,
  scoli_target text[] default '{all}',
  status text default 'draft',
  data_start_campanie date,
  data_end_campanie date,
  stil_card jsonb,
  stil_inky jsonb,
  stil_ticker jsonb,
  documente_atasate text[] default '{}',
  afisari int default 0,
  clickuri int default 0,
  ctr numeric(5,2) default 0,
  created_at timestamptz default now()
);
alter table public.sponsor_campaigns enable row level security;

create table public.sponsor_plans (
  id uuid primary key default gen_random_uuid(),
  nume_plan text not null,
  pret int default 0,
  include_dashboard boolean default true,
  include_infodisplay boolean default false,
  include_ticker boolean default true,
  include_inky boolean default false,
  include_custom_inky boolean default false,
  numar_scoli int default 5,
  descriere text default ''
);
alter table public.sponsor_plans enable row level security;

create table public.sponsor_impressions (
  id uuid primary key default gen_random_uuid(),
  promo_id uuid references public.sponsor_promos(id) on delete cascade,
  tip text not null,
  school_id uuid references public.schools(id) on delete set null,
  is_click boolean default false,
  created_at timestamptz default now()
);
alter table public.sponsor_impressions enable row level security;

-- Infodisplay
create table public.infodisplay_panels (
  id uuid primary key default gen_random_uuid(),
  tip text not null,
  continut text not null,
  durata int default 8,
  ordine int default 1,
  created_at timestamptz default now()
);
alter table public.infodisplay_panels enable row level security;

create table public.infodisplay_ticker (
  id uuid primary key default gen_random_uuid(),
  mesaj text not null,
  ordine int default 1,
  created_at timestamptz default now()
);
alter table public.infodisplay_ticker enable row level security;

create table public.infodisplay_qr (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  created_at timestamptz default now()
);
alter table public.infodisplay_qr enable row level security;

create table public.infodisplay_settings (
  id uuid primary key default gen_random_uuid(),
  transition text default 'fade',
  created_at timestamptz default now()
);
alter table public.infodisplay_settings enable row level security;

-- Facebook
create table public.facebook_settings (
  id uuid primary key default gen_random_uuid(),
  page_id text default '',
  token_status text default 'activ',
  posting_format text default 'text+image',
  created_at timestamptz default now()
);
alter table public.facebook_settings enable row level security;

create table public.facebook_posts (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  posted_at timestamptz default now(),
  status text default 'posted',
  created_at timestamptz default now()
);
alter table public.facebook_posts enable row level security;

-- WhatsApp
create table public.whatsapp_mappings (
  id uuid primary key default gen_random_uuid(),
  grupa text not null,
  whatsapp_group text not null,
  consent boolean default true,
  sync_type text default 'bidirectional',
  created_at timestamptz default now()
);
alter table public.whatsapp_mappings enable row level security;

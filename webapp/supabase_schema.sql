-- Schéma Supabase (PostgreSQL + Temps réel + RLS + Storage privé) — Collectif Tombola

-- 1. Membres du collectif (11 co-usagers)
create table if not exists public.members (
  id text primary key,
  name text not null,
  short text not null,
  color text not null,
  role text default '',
  created_at timestamptz default now()
);

insert into public.members (id, name, short, color, role) values
  ('amande', 'Amande', 'Am', '#2a7f62', 'Animation & Chantier'),
  ('anthony', 'Anthony', 'An', '#1b5e7a', 'Chantier & Web App'),
  ('jeanne', 'Jeanne', 'Je', '#8f4f2b', 'Convention & Charte'),
  ('julie', 'Julie', 'Ju', '#6b4c9a', 'Navigation & Armement'),
  ('tom', 'Tom', 'To', '#2b6cb0', 'Voile & Coque'),
  ('fred', 'Fred', 'Fr', '#b45309', 'Finitions & Mesure'),
  ('didi', 'Lydie (Didi)', 'Di', '#be185d', 'Co-utilisatrice'),
  ('nicolas', 'Nicolas', 'Ni', '#0f766e', 'Co-utilisateur'),
  ('dimitri', 'Dimitri', 'Dm', '#4338ca', 'Co-utilisateur'),
  ('pascal', 'Pascal', 'Pa', '#047857', 'Co-utilisateur'),
  ('stephane', 'Stéphane', 'St', '#475569', 'Co-utilisateur')
on conflict (id) do update set
  name = excluded.name,
  short = excluded.short,
  color = excluded.color,
  role = excluded.role;

-- 2. Statut en temps réel du bateau Tombola, écopage hebdomadaire & config carburant
create table if not exists public.boat_status (
  id int primary key default 1 check (id = 1),
  state text not null default 'mooring' check (state in ('mooring', 'water', 'chantier')),
  crew jsonb not null default '[]'::jsonb,
  last_water_crew jsonb not null default '[]'::jsonb,
  outing_type text not null default 'open' check (outing_type in ('open', 'private')),
  max_seats int not null default 4,
  return_time text default '',
  note text default '',
  location jsonb not null default '{}'::jsonb,
  ecopage jsonb not null default '{}'::jsonb,
  fuel_config jsonb not null default '{"mode":"scale","emptyTankKg":1.8,"fullTankKg":10.8,"densityKgPerL":0.75,"pricePerLiter":1.85,"currentWeightKg":9.3}'::jsonb,
  updated_by text references public.members(id),
  updated_at timestamptz default now()
);
create index if not exists boat_status_updated_by_idx on public.boat_status (updated_by);

-- 3. Planning partagé (sorties ouvertes, privées, bivouacs et chantiers)
create table if not exists public.bookings (
  id text primary key,
  title text not null,
  date date not null,
  end_date date not null,
  start_time text not null,
  end_time text not null,
  type text not null check (type in ('open', 'private', 'chantier')),
  author_id text references public.members(id),
  participants jsonb not null default '[]'::jsonb,
  max_seats int not null default 4,
  is_last_minute boolean not null default false,
  note text default '',
  created_at timestamptz default now()
);
create index if not exists bookings_author_id_idx on public.bookings (author_id);
create index if not exists bookings_date_idx on public.bookings (date);

-- 4. Journal carburant
create table if not exists public.fuel_logs (
  id text primary key,
  kind text not null check (kind in ('outing', 'refill')),
  date date not null,
  member_id text references public.members(id),
  booking_id text references public.bookings(id) on delete set null,
  participants jsonb not null default '[]'::jsonb,
  crew_names text default '',
  start_kg numeric(5,2),
  end_kg numeric(5,2),
  liters_used numeric(5,2) not null,
  cost_eur numeric(6,2) not null,
  note text default '',
  created_at timestamptz default now()
);
create index if not exists fuel_logs_member_id_idx on public.fuel_logs (member_id);
create index if not exists fuel_logs_booking_id_idx on public.fuel_logs (booking_id);
create index if not exists fuel_logs_created_at_idx on public.fuel_logs (created_at desc);

-- 5. Charte collaborative
create table if not exists public.charter_sections (
  id text primary key,
  title text not null,
  content text not null,
  updated_by text references public.members(id),
  updated_at timestamptz default now(),
  created_at timestamptz not null default now(),
  history jsonb not null default '[]'::jsonb
);
create index if not exists charter_sections_updated_by_idx on public.charter_sections (updated_by);

-- 6. Frigo à idées
create table if not exists public.ideas (
  id text primary key,
  title text not null,
  description text default '',
  author_id text references public.members(id),
  status text not null default 'discussion' check (status in ('discussion', 'test', 'acte')),
  votes jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);
create index if not exists ideas_author_id_idx on public.ideas (author_id);

-- 7. Journal de bord
create table if not exists public.logbook_entries (
  id text primary key,
  date date not null,
  title text not null,
  author_id text references public.members(id),
  crew jsonb not null default '[]'::jsonb,
  weather text default '',
  story text not null,
  boat_notes text default '',
  image_url text default '',
  created_at timestamptz default now()
);
create index if not exists logbook_entries_author_id_idx on public.logbook_entries (author_id);
create index if not exists logbook_entries_date_idx on public.logbook_entries (date desc);

-- 8. Documents collaboratifs type Trello
create table if not exists public.collab_docs (
  id text primary key,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'review', 'validated')),
  author_id text references public.members(id),
  updated_by text references public.members(id),
  updated_at timestamptz default now(),
  created_at timestamptz not null default now(),
  content text not null,
  history jsonb not null default '[]'::jsonb,
  proposals jsonb not null default '[]'::jsonb
);
create index if not exists collab_docs_author_id_idx on public.collab_docs (author_id);
create index if not exists collab_docs_updated_by_idx on public.collab_docs (updated_by);

-- 9. Discussion en direct
create table if not exists public.messages (
  id text primary key,
  author_id text references public.members(id),
  category text not null default 'info' check (category in ('info', 'sortie', 'materiel', 'photo')),
  pinned boolean not null default false,
  reactions jsonb not null default '{"👍":[],"⛵":[],"🛠️":[]}'::jsonb,
  text text not null,
  image_url text default '',
  created_at timestamptz default now()
);
create index if not exists messages_author_id_idx on public.messages (author_id);
create index if not exists messages_created_at_idx on public.messages (created_at desc);

-- Publication Realtime
alter publication supabase_realtime add table
  public.boat_status,
  public.bookings,
  public.fuel_logs,
  public.charter_sections,
  public.ideas,
  public.logbook_entries,
  public.collab_docs,
  public.messages;

-- Privilèges SQL (moindre privilège)
revoke all on
  public.members,
  public.boat_status,
  public.bookings,
  public.fuel_logs,
  public.charter_sections,
  public.ideas,
  public.logbook_entries,
  public.collab_docs,
  public.messages
from anon, authenticated;

grant select on public.members to authenticated;
grant select, update on public.boat_status to authenticated;
grant select, insert, update, delete on public.bookings to authenticated;
grant select, insert on public.fuel_logs to authenticated;
grant select, insert, update on public.charter_sections to authenticated;
grant select, insert, update on public.ideas to authenticated;
grant select, insert on public.logbook_entries to authenticated;
grant select, insert, update on public.collab_docs to authenticated;
grant select, insert, update on public.messages to authenticated;

-- Activation RLS
alter table public.members enable row level security;
alter table public.boat_status enable row level security;
alter table public.bookings enable row level security;
alter table public.fuel_logs enable row level security;
alter table public.charter_sections enable row level security;
alter table public.ideas enable row level security;
alter table public.logbook_entries enable row level security;
alter table public.collab_docs enable row level security;
alter table public.messages enable row level security;

-- Politiques RLS strictes TO authenticated
create policy members_select on public.members
  for select to authenticated
  using ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'));

create policy boat_status_select on public.boat_status
  for select to authenticated
  using ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'));

create policy boat_status_update on public.boat_status
  for update to authenticated
  using ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'))
  with check ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'));

create policy bookings_select on public.bookings
  for select to authenticated
  using ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'));

create policy bookings_insert on public.bookings
  for insert to authenticated
  with check ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'));

create policy bookings_update on public.bookings
  for update to authenticated
  using ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'))
  with check ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'));

create policy bookings_delete on public.bookings
  for delete to authenticated
  using ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'));

create policy fuel_logs_select on public.fuel_logs
  for select to authenticated
  using ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'));

create policy fuel_logs_insert on public.fuel_logs
  for insert to authenticated
  with check ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'));

create policy charter_sections_select on public.charter_sections
  for select to authenticated
  using ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'));

create policy charter_sections_insert on public.charter_sections
  for insert to authenticated
  with check ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'));

create policy charter_sections_update on public.charter_sections
  for update to authenticated
  using ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'))
  with check ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'));

create policy ideas_select on public.ideas
  for select to authenticated
  using ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'));

create policy ideas_insert on public.ideas
  for insert to authenticated
  with check ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'));

create policy ideas_update on public.ideas
  for update to authenticated
  using ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'))
  with check ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'));

create policy logbook_entries_select on public.logbook_entries
  for select to authenticated
  using ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'));

create policy logbook_entries_insert on public.logbook_entries
  for insert to authenticated
  with check ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'));

create policy collab_docs_select on public.collab_docs
  for select to authenticated
  using ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'));

create policy collab_docs_insert on public.collab_docs
  for insert to authenticated
  with check ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'));

create policy collab_docs_update on public.collab_docs
  for update to authenticated
  using ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'))
  with check ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'));

create policy messages_select on public.messages
  for select to authenticated
  using ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'));

create policy messages_insert on public.messages
  for insert to authenticated
  with check ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'));

create policy messages_update on public.messages
  for update to authenticated
  using ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'))
  with check ((((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola'));

-- Schéma privé & vérification du code collectif (hash configuré en base hors Git)
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.collective_config (
  id int primary key default 1 check (id = 1),
  code_hash text not null,
  auth_email text not null,
  updated_at timestamptz not null default now()
);
alter table private.collective_config enable row level security;

create or replace function public.verify_collective_code(candidate text)
returns text
language sql
security definer
set search_path = ''
as $$
  select c.auth_email
  from private.collective_config c
  where c.id = 1
    and candidate is not null
    and extensions.crypt(lower(trim(candidate)), c.code_hash) = c.code_hash;
$$;

revoke all on function public.verify_collective_code(text) from public, anon, authenticated;
grant execute on function public.verify_collective_code(text) to service_role;

-- Bucket Storage PRIVÉ tombola-docs (documents officiels en lecture seule + photos dans photos/)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tombola-docs',
  'tombola-docs',
  false,
  5242880,
  array['application/pdf', 'text/markdown', 'text/plain', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy tombola_docs_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'tombola-docs'
    and (((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola')
  );

create policy tombola_docs_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'tombola-docs'
    and (storage.foldername(name))[1] = 'photos'
    and (((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola')
  );

create policy tombola_docs_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'tombola-docs'
    and (storage.foldername(name))[1] = 'photos'
    and (((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola')
  )
  with check (
    bucket_id = 'tombola-docs'
    and (storage.foldername(name))[1] = 'photos'
    and (((select auth.jwt()) -> 'app_metadata' ->> 'collective') = 'tombola')
  );

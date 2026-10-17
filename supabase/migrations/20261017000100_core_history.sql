-- Category 02: identity and immutable solve history. No client access until 02A.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function private.set_updated_at() from public, anon, authenticated;

create function private.reject_scramble_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'scramble snapshots are immutable' using errcode = '23514';
end;
$$;
revoke all on function private.reject_scramble_update() from public, anon, authenticated;

create function private.restrict_session_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if row(old.id, old.owner_id, old.puzzle, old.created_at)
     is distinct from row(new.id, new.owner_id, new.puzzle, new.created_at) then
    raise exception 'session identity and puzzle are immutable' using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function private.restrict_session_update() from public, anon, authenticated;

create function private.restrict_solve_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if row(old.id, old.owner_id, old.session_id, old.scramble_id, old.puzzle,
         old.raw_time_ms, old.timing_source, old.inspection_ms, old.started_at,
         old.completed_at, old.created_at)
     is distinct from
     row(new.id, new.owner_id, new.session_id, new.scramble_id, new.puzzle,
         new.raw_time_ms, new.timing_source, new.inspection_ms, new.started_at,
         new.completed_at, new.created_at) then
    raise exception 'solve evidence and references are immutable' using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function private.restrict_solve_update() from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or length(btrim(display_name)) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_timestamp_order check (updated_at >= created_at)
);
alter table public.profiles enable row level security;
revoke all on table public.profiles from public, anon, authenticated;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();

create table public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  settings_version integer not null default 1 check (settings_version > 0),
  settings_json jsonb not null default '{}'::jsonb check (jsonb_typeof(settings_json) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_settings_timestamp_order check (updated_at >= created_at)
);
alter table public.user_settings enable row level security;
revoke all on table public.user_settings from public, anon, authenticated;
create trigger user_settings_updated_at before update on public.user_settings
  for each row execute function private.set_updated_at();

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete restrict,
  puzzle text not null check (puzzle in ('222', '333', '444', '555', '666', '777')),
  name text not null check (length(btrim(name)) between 1 and 120),
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sessions_timestamp_order check (updated_at >= created_at),
  constraint sessions_owner_id_puzzle_key unique (owner_id, id, puzzle)
);
create index sessions_owner_created_idx on public.sessions (owner_id, created_at desc, id);
alter table public.sessions enable row level security;
revoke all on table public.sessions from public, anon, authenticated;
create trigger sessions_updated_at before update on public.sessions
  for each row execute function private.set_updated_at();
create trigger sessions_restrict_update before update on public.sessions
  for each row execute function private.restrict_session_update();

create table public.scrambles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete restrict,
  puzzle text not null check (puzzle in ('222', '333', '444', '555', '666', '777')),
  notation text not null check (length(btrim(notation)) between 1 and 4096),
  generator_version text not null check (length(btrim(generator_version)) between 1 and 128),
  created_at timestamptz not null default now(),
  constraint scrambles_owner_id_puzzle_key unique (owner_id, id, puzzle)
);
create index scrambles_owner_created_idx on public.scrambles (owner_id, created_at desc, id);
alter table public.scrambles enable row level security;
revoke all on table public.scrambles from public, anon, authenticated;
create trigger scrambles_immutable before update on public.scrambles
  for each row execute function private.reject_scramble_update();

create table public.solves (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete restrict,
  session_id uuid not null,
  scramble_id uuid not null,
  puzzle text not null check (puzzle in ('222', '333', '444', '555', '666', '777')),
  raw_time_ms integer not null check (raw_time_ms >= 0),
  penalty text not null default 'none' check (penalty in ('none', 'plus2', 'dnf')),
  timing_source text not null check (timing_source in ('KEYBOARD', 'TOUCH', 'SMART_CUBE')),
  inspection_ms integer check (inspection_ms is null or inspection_ms >= 0),
  started_at timestamptz not null,
  completed_at timestamptz not null,
  notes text check (notes is null or length(notes) <= 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint solves_time_order check (completed_at >= started_at),
  constraint solves_timestamp_order check (updated_at >= created_at),
  constraint solves_owner_id_key unique (owner_id, id),
  constraint solves_one_use_per_scramble unique (owner_id, scramble_id),
  constraint solves_session_owner_puzzle_fk foreign key (owner_id, session_id, puzzle)
    references public.sessions (owner_id, id, puzzle) on delete restrict,
  constraint solves_scramble_owner_puzzle_fk foreign key (owner_id, scramble_id, puzzle)
    references public.scrambles (owner_id, id, puzzle) on delete restrict
);
create index solves_owner_created_idx on public.solves (owner_id, created_at desc, id);
create index solves_owner_session_created_idx on public.solves (owner_id, session_id, created_at desc, id);
alter table public.solves enable row level security;
revoke all on table public.solves from public, anon, authenticated;
create trigger solves_updated_at before update on public.solves
  for each row execute function private.set_updated_at();
create trigger solves_restrict_update before update on public.solves
  for each row execute function private.restrict_solve_update();

-- Later policies must restrict mutable solve columns to penalty and notes.
-- No effective_time_ms column exists: DNF is null, plus2 adds 2000, none is raw.

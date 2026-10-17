-- Category 02: narrow metadata only. No binary media, model weights, or raw datasets.
create extension if not exists btree_gist with schema extensions;
set search_path = public, extensions;
create table public.recordings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete restrict,
  solve_id uuid,
  duration_ms integer not null check (duration_ms >= 0),
  timer_start_offset_ms integer not null default 0 check (timer_start_offset_ms >= 0),
  mime_type text not null check (length(btrim(mime_type)) between 1 and 255),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  storage_path text,
  consented_at timestamptz,
  uploaded_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recordings_offset_in_duration check (timer_start_offset_ms <= duration_ms),
  constraint recordings_storage_consent check (
    storage_path is null or
    (consented_at is not null and uploaded_at is not null and
     uploaded_at >= consented_at and size_bytes is not null and
     storage_path like owner_id::text || '/%' and
     length(storage_path) > length(owner_id::text) + 1)
  ),
  constraint recordings_timestamp_order check (updated_at >= created_at),
  constraint recordings_owner_id_key unique (owner_id, id),
  constraint recordings_owner_id_solve_key unique (owner_id, id, solve_id),
  constraint recordings_solve_owner_fk foreign key (owner_id, solve_id)
    references public.solves (owner_id, id) on delete restrict
);
create index recordings_owner_created_idx on public.recordings (owner_id, created_at desc, id);
create index recordings_owner_solve_idx on public.recordings (owner_id, solve_id)
  where solve_id is not null;
alter table public.recordings enable row level security;
revoke all on table public.recordings from public, anon, authenticated;
create trigger recordings_updated_at before update on public.recordings
  for each row execute function private.set_updated_at();

create function private.restrict_recording_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if row(old.id, old.owner_id, old.duration_ms, old.timer_start_offset_ms,
         old.mime_type, old.width, old.height, old.created_at)
     is distinct from
     row(new.id, new.owner_id, new.duration_ms, new.timer_start_offset_ms,
         new.mime_type, new.width, new.height, new.created_at)
     or (old.solve_id is not null and old.solve_id is distinct from new.solve_id)
     or (old.size_bytes is not null and old.size_bytes is distinct from new.size_bytes) then
    raise exception 'recording evidence and linked solve are immutable' using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function private.restrict_recording_update() from public, anon, authenticated;
create trigger recordings_restrict_update before update on public.recordings
  for each row execute function private.restrict_recording_update();

create function private.validate_recording_interval()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  recording_duration integer;
begin
  select duration_ms into recording_duration
  from public.recordings
  where id = new.recording_id and owner_id = new.owner_id;

  if recording_duration is null or new.end_ms > recording_duration then
    raise exception 'interval exceeds owned recording duration' using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function private.validate_recording_interval() from public, anon, authenticated;

create table public.dataset_metadata (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete restrict,
  name text not null check (length(btrim(name)) between 1 and 120),
  version text not null check (length(btrim(version)) between 1 and 80),
  schema_version integer not null check (schema_version > 0),
  description text,
  created_at timestamptz not null default now(),
  constraint dataset_metadata_owner_id_key unique (owner_id, id),
  constraint dataset_metadata_owner_name_version_key unique (owner_id, name, version)
);
create index dataset_metadata_owner_created_idx on public.dataset_metadata (owner_id, created_at desc, id);
alter table public.dataset_metadata enable row level security;
revoke all on table public.dataset_metadata from public, anon, authenticated;

create table public.annotations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete restrict,
  recording_id uuid not null,
  dataset_id uuid,
  start_ms integer not null check (start_ms >= 0),
  end_ms integer not null,
  label text not null check (label in ('MOVEMENT', 'PAUSE', 'UNCERTAIN')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint annotations_interval check (end_ms > start_ms),
  constraint annotations_timestamp_order check (updated_at >= created_at),
  constraint annotations_recording_owner_fk foreign key (owner_id, recording_id)
    references public.recordings (owner_id, id) on delete restrict,
  constraint annotations_dataset_owner_fk foreign key (owner_id, dataset_id)
    references public.dataset_metadata (owner_id, id) on delete restrict
);
create index annotations_owner_recording_start_idx
  on public.annotations (owner_id, recording_id, start_ms, id);
create index annotations_owner_dataset_idx on public.annotations (owner_id, dataset_id)
  where dataset_id is not null;
alter table public.annotations enable row level security;
revoke all on table public.annotations from public, anon, authenticated;
create trigger annotations_updated_at before update on public.annotations
  for each row execute function private.set_updated_at();
create trigger annotations_interval_bounds before insert or update on public.annotations
  for each row execute function private.validate_recording_interval();

create table public.model_versions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete restrict,
  name text not null check (length(btrim(name)) between 1 and 120),
  version text not null check (length(btrim(version)) between 1 and 80),
  feature_schema_version text not null check (length(btrim(feature_schema_version)) between 1 and 80),
  manifest_sha256 text not null check (manifest_sha256 ~ '^[0-9a-f]{64}$'),
  manifest_json jsonb not null check (jsonb_typeof(manifest_json) = 'object'),
  created_at timestamptz not null default now(),
  constraint model_versions_owner_id_key unique (owner_id, id),
  constraint model_versions_owner_id_feature_key unique (owner_id, id, feature_schema_version),
  constraint model_versions_owner_name_version_key unique (owner_id, name, version)
);
create index model_versions_owner_created_idx on public.model_versions (owner_id, created_at desc, id);
alter table public.model_versions enable row level security;
revoke all on table public.model_versions from public, anon, authenticated;

create table public.analysis_runs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete restrict,
  solve_id uuid not null,
  recording_id uuid not null,
  model_version_id uuid,
  method text not null check (method in ('BASELINE', 'MODEL')),
  feature_schema_version text not null check (length(btrim(feature_schema_version)) between 1 and 80),
  quality_warnings jsonb not null default '[]'::jsonb
    check (jsonb_typeof(quality_warnings) = 'array'),
  created_at timestamptz not null default now(),
  constraint analysis_runs_method_model_check check (
    (method = 'BASELINE' and model_version_id is null) or
    (method = 'MODEL' and model_version_id is not null)
  ),
  constraint analysis_runs_owner_id_recording_key unique (owner_id, id, recording_id),
  constraint analysis_runs_recording_solve_owner_fk foreign key (owner_id, recording_id, solve_id)
    references public.recordings (owner_id, id, solve_id) on delete restrict,
  constraint analysis_runs_model_owner_feature_fk
    foreign key (owner_id, model_version_id, feature_schema_version)
    references public.model_versions (owner_id, id, feature_schema_version) on delete restrict
);
create index analysis_runs_owner_solve_created_idx
  on public.analysis_runs (owner_id, solve_id, created_at desc, id);
create index analysis_runs_owner_recording_idx on public.analysis_runs (owner_id, recording_id);
alter table public.analysis_runs enable row level security;
revoke all on table public.analysis_runs from public, anon, authenticated;

create table public.analysis_segments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete restrict,
  analysis_run_id uuid not null,
  recording_id uuid not null,
  start_ms integer not null check (start_ms >= 0),
  end_ms integer not null,
  label text not null check (label in ('MOVEMENT', 'PAUSE', 'UNCERTAIN')),
  confidence numeric(5,4) check (confidence is null or confidence between 0 and 1),
  created_at timestamptz not null default now(),
  constraint analysis_segments_interval check (end_ms > start_ms),
  constraint analysis_segments_no_overlap exclude using gist (
    analysis_run_id with =,
    int4range(start_ms, end_ms, '[)') with &&
  ),
  constraint analysis_segments_run_recording_owner_fk
    foreign key (owner_id, analysis_run_id, recording_id)
    references public.analysis_runs (owner_id, id, recording_id) on delete restrict
);
create index analysis_segments_owner_run_start_idx
  on public.analysis_segments (owner_id, analysis_run_id, start_ms, id);
alter table public.analysis_segments enable row level security;
revoke all on table public.analysis_segments from public, anon, authenticated;
create trigger analysis_segments_interval_bounds before insert or update on public.analysis_segments
  for each row execute function private.validate_recording_interval();

create table public.experiment_runs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete restrict,
  dataset_id uuid not null,
  model_version_id uuid,
  method text not null check (method in ('BASELINE', 'MODEL')),
  code_version text not null check (length(btrim(code_version)) between 1 and 128),
  random_seed bigint,
  config_schema_version integer not null check (config_schema_version > 0),
  metrics_schema_version integer not null check (metrics_schema_version > 0),
  config_json jsonb not null check (jsonb_typeof(config_json) = 'object'),
  metrics_json jsonb not null check (jsonb_typeof(metrics_json) = 'object'),
  created_at timestamptz not null default now(),
  constraint experiment_runs_method_model_check check (
    (method = 'BASELINE' and model_version_id is null) or
    (method = 'MODEL' and model_version_id is not null)
  ),
  constraint experiment_runs_dataset_owner_fk foreign key (owner_id, dataset_id)
    references public.dataset_metadata (owner_id, id) on delete restrict,
  constraint experiment_runs_model_owner_fk foreign key (owner_id, model_version_id)
    references public.model_versions (owner_id, id) on delete restrict
);
create index experiment_runs_owner_dataset_created_idx
  on public.experiment_runs (owner_id, dataset_id, created_at desc, id);
alter table public.experiment_runs enable row level security;
revoke all on table public.experiment_runs from public, anon, authenticated;

reset search_path;

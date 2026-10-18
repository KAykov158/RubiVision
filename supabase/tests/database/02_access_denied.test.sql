begin;
create extension if not exists pgtap with schema extensions;
select plan(28);

create temp table category02_owned_tables (name text primary key) on commit drop;
insert into category02_owned_tables (name) values
  ('profiles'), ('user_settings'), ('sessions'), ('scrambles'), ('solves'),
  ('recordings'), ('annotations'), ('analysis_runs'), ('analysis_segments'),
  ('model_versions'), ('dataset_metadata'), ('experiment_runs');

select ok(
  (select count(*) = 12 and bool_and(c.relrowsecurity)
   from category02_owned_tables t
   join pg_class c on c.relname = t.name
   join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public'),
  'RLS is enabled on every user-owned table'
);
select ok((select count(*) >= 42 from pg_policies p
  join category02_owned_tables t on t.name = p.tablename where p.schemaname = 'public'),
  'owner SELECT, INSERT, UPDATE and DELETE policies exist for mutable tables');
select ok((select count(*) = 11 from pg_policies p
  join category02_owned_tables t on t.name = p.tablename
  where p.schemaname = 'public' and p.cmd = 'INSERT' and p.with_check is not null),
  'every insert policy requires an owner WITH CHECK');
select ok((select count(*) = 11 from pg_policies p
  join category02_owned_tables t on t.name = p.tablename
  where p.schemaname = 'public' and p.cmd = 'UPDATE' and p.with_check is not null),
  'every update policy requires an owner WITH CHECK');
select ok((select bool_and(not has_table_privilege('anon', format('public.%I', name), 'SELECT'))
  from category02_owned_tables), 'anon has no SELECT grants');
select ok((select bool_and(not has_table_privilege('anon', format('public.%I', name), 'INSERT'))
  from category02_owned_tables), 'anon has no INSERT grants');
select ok((select bool_and(not has_table_privilege('anon', format('public.%I', name), 'UPDATE'))
  from category02_owned_tables), 'anon has no UPDATE grants');
select ok((select bool_and(not has_table_privilege('anon', format('public.%I', name), 'DELETE'))
  from category02_owned_tables), 'anon has no DELETE grants');
select ok(not has_schema_privilege('anon', 'private', 'USAGE'), 'anon cannot use private trigger schema');
select ok(not has_schema_privilege('authenticated', 'private', 'USAGE'), 'authenticated cannot use private trigger schema');
select ok(not (select public from storage.buckets where id = 'recordings'), 'recordings bucket is private');
select is((select file_size_limit::bigint from storage.buckets where id = 'recordings'),
  52428800::bigint, 'recordings bucket matches the 50 MiB Free-plan maximum');

insert into auth.users (id, email) values
  ('31111111-1111-1111-1111-111111111111', 'category02a-owner@example.test'),
  ('32222222-2222-2222-2222-222222222222', 'category02a-other@example.test');
insert into public.sessions (id, owner_id, puzzle, name) values
  ('31aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '31111111-1111-1111-1111-111111111111', '333', 'Owner'),
  ('32bbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '32222222-2222-2222-2222-222222222222', '333', 'Other');
insert into public.scrambles (id, owner_id, puzzle, notation, generator_version) values
  ('31dddddd-dddd-dddd-dddd-dddddddddddd', '31111111-1111-1111-1111-111111111111', '333', 'R U', 'test-v1'),
  ('32eeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '32222222-2222-2222-2222-222222222222', '333', 'F U', 'test-v1');
insert into public.solves (id, owner_id, session_id, scramble_id, puzzle, raw_time_ms,
  timing_source, started_at, completed_at) values
  ('31ffffff-ffff-ffff-ffff-ffffffffffff', '31111111-1111-1111-1111-111111111111',
    '31aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '31dddddd-dddd-dddd-dddd-dddddddddddd', '333', 12345,
    'KEYBOARD', '2026-10-18T12:00:00Z', '2026-10-18T12:00:12.345Z'),
  ('32ffffff-ffff-ffff-ffff-ffffffffffff', '32222222-2222-2222-2222-222222222222',
    '32bbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '32eeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '333', 23456,
    'KEYBOARD', '2026-10-18T12:01:00Z', '2026-10-18T12:01:23.456Z');
insert into public.dataset_metadata (id, owner_id, name, version, schema_version)
values ('33cccccc-cccc-cccc-cccc-cccccccccccc', '31111111-1111-1111-1111-111111111111', 'Owner data', 'v1', 1);

set local role anon;
select throws_ok($$select count(*) from public.sessions$$, '42501', null, 'anonymous cannot read sessions');
select throws_ok($$insert into public.sessions (owner_id, puzzle, name) values (gen_random_uuid(), '333', 'Anon')$$,
  '42501', null, 'anonymous cannot insert sessions');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '31111111-1111-1111-1111-111111111111', true);
select set_config('request.jwt.claims', '{"sub":"31111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
select is((select count(*)::integer from public.sessions), 1, 'account A reads only its own session');
select is((select count(*)::integer from public.profiles), 1, 'account A reads its trigger-created profile');
select is((select count(*)::integer from public.user_settings), 1, 'account A reads its trigger-created settings');
select is((select count(*)::integer from public.solves), 1, 'account A cannot read account B solve history');
select lives_ok($$update public.solves set penalty = 'plus2' where id = '31ffffff-ffff-ffff-ffff-ffffffffffff'$$,
  'account A can update the allowed penalty field on its solve');
select lives_ok($$insert into public.sessions (owner_id, puzzle, name)
  values ('31111111-1111-1111-1111-111111111111', '444', 'New owner session')$$,
  'account A can insert its own session');
select throws_ok($$insert into public.sessions (owner_id, puzzle, name)
  values ('32222222-2222-2222-2222-222222222222', '444', 'Spoofed owner')$$,
  '42501', null, 'account A cannot insert for account B');
select throws_ok($$insert into public.solves (owner_id, session_id, scramble_id, puzzle, raw_time_ms,
  timing_source, started_at, completed_at) values ('32222222-2222-2222-2222-222222222222',
  '32bbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '32eeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '333', 15000,
  'KEYBOARD', '2026-10-18T12:02:00Z', '2026-10-18T12:02:15Z')$$,
  '42501', null, 'account A cannot insert a solve for account B');
select throws_ok($$update public.dataset_metadata set owner_id = '32222222-2222-2222-2222-222222222222'
  where id = '33cccccc-cccc-cccc-cccc-cccccccccccc'$$,
  '42501', null, 'WITH CHECK prevents changing a row to another owner');
select is((select count(*)::integer from storage.objects where bucket_id = 'recordings'), 0,
  'account A sees no recording objects before upload');
select throws_ok($$insert into storage.objects (bucket_id, name)
  values ('recordings', '32222222-2222-2222-2222-222222222222/spoofed.webm')$$,
  '42501', null, 'account A cannot upload into account B storage path');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '32222222-2222-2222-2222-222222222222', true);
select set_config('request.jwt.claims', '{"sub":"32222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
select is((select count(*)::integer from public.sessions), 1, 'account B reads only its own session');
select is((select count(*)::integer from public.profiles), 1, 'account B reads its own profile');
select is((select count(*)::integer from public.solves), 1, 'account B reads only its own solve history');
reset role;

select * from finish();
rollback;

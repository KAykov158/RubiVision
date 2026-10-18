begin;
create extension if not exists pgtap with schema extensions;
select plan(39);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'category02-owner@example.test'),
  ('22222222-2222-2222-2222-222222222222', 'category02-other@example.test');

-- The Category 02A trusted auth trigger creates profiles and settings on signup.
insert into public.sessions (id, owner_id, puzzle, name) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '333', 'Main'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', '333', 'Other'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', '444', '4x4');
insert into public.scrambles (id, owner_id, puzzle, notation, generator_version) values
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', '333', 'R U', 'test-v1'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', '333', 'R F', 'test-v1'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', '444', 'Rw U', 'test-v1'),
  ('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', '333', 'F U', 'test-v1');
insert into public.solves (
  id, owner_id, session_id, scramble_id, puzzle, raw_time_ms, penalty,
  timing_source, started_at, completed_at
) values (
  '00000000-0000-0000-0000-000000000101',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '333', 12345, 'none', 'KEYBOARD',
  '2026-10-17T12:00:00Z', '2026-10-17T12:00:12Z'
);
insert into public.recordings (
  id, owner_id, solve_id, duration_ms, timer_start_offset_ms, mime_type
) values (
  '00000000-0000-0000-0000-000000000201',
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000101',
  20000, 1000, 'video/webm'
);
insert into public.dataset_metadata (id, owner_id, name, version, schema_version)
values ('00000000-0000-0000-0000-000000000301',
        '11111111-1111-1111-1111-111111111111', 'Fixture', 'v1', 1);
insert into public.model_versions (
  id, owner_id, name, version, feature_schema_version, manifest_sha256, manifest_json
) values (
  '00000000-0000-0000-0000-000000000401',
  '11111111-1111-1111-1111-111111111111', 'Fixture', 'v1', 'features-v1',
  repeat('a', 64), '{}'
);
insert into public.analysis_runs (
  id, owner_id, solve_id, recording_id, method, feature_schema_version
) values (
  '00000000-0000-0000-0000-000000000501',
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000201', 'BASELINE', 'features-v1'
);

select is((select count(*) from public.solves), 1::bigint, 'valid solve inserted');
select is((select count(*) from public.analysis_runs), 1::bigint, 'valid linked analysis inserted');
select hasnt_column('public', 'solves', 'effective_time_ms', 'effective time is not stored');

select throws_ok(
  $$insert into public.sessions (owner_id, puzzle, name)
    values ('11111111-1111-1111-1111-111111111111', '888', 'Invalid')$$,
  '23514', null, 'unsupported puzzle is rejected'
);
select throws_ok(
  $$insert into public.solves (owner_id, session_id, scramble_id, puzzle, raw_time_ms,
      timing_source, started_at, completed_at)
    values ('11111111-1111-1111-1111-111111111111',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'ffffffff-ffff-ffff-ffff-ffffffffffff', '333', 1000,
      'KEYBOARD', now(), now())$$,
  '23503', null, 'scramble puzzle mismatch is rejected'
);
select throws_ok(
  $$insert into public.solves (owner_id, session_id, scramble_id, puzzle, raw_time_ms,
      timing_source, started_at, completed_at)
    values ('11111111-1111-1111-1111-111111111111',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      'ffffffff-ffff-ffff-ffff-ffffffffffff', '333', 1000,
      'KEYBOARD', now(), now())$$,
  '23503', null, 'cross-owner session is rejected'
);
select throws_ok(
  $$insert into public.solves (owner_id, session_id, scramble_id, puzzle, raw_time_ms,
      timing_source, started_at, completed_at)
    values ('11111111-1111-1111-1111-111111111111',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '333', 1000,
      'KEYBOARD', now(), now())$$,
  '23503', null, 'cross-owner scramble is rejected'
);
select throws_ok(
  $$update public.solves set raw_time_ms = -1
    where id = '00000000-0000-0000-0000-000000000101'$$,
  '23514', null, 'raw time cannot change after capture'
);
select throws_ok(
  $$insert into public.solves (owner_id, session_id, scramble_id, puzzle, raw_time_ms,
      timing_source, started_at, completed_at)
    values ('11111111-1111-1111-1111-111111111111',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      '99999999-9999-9999-9999-999999999999', '333', -1,
      'KEYBOARD', now(), now())$$,
  '23514', null, 'negative raw time is rejected on insert'
);
select throws_ok(
  $$update public.solves set penalty = 'INVALID'
    where id = '00000000-0000-0000-0000-000000000101'$$,
  '23514', null, 'invalid penalty is rejected'
);
select throws_ok(
  $$update public.solves set timing_source = 'CLOCK'
    where id = '00000000-0000-0000-0000-000000000101'$$,
  '23514', null, 'timing source cannot change after capture'
);
select throws_ok(
  $$insert into public.solves (owner_id, session_id, scramble_id, puzzle, raw_time_ms,
      timing_source, started_at, completed_at)
    values ('11111111-1111-1111-1111-111111111111',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      '99999999-9999-9999-9999-999999999999', '333', 1000,
      'CLOCK', now(), now())$$,
  '23514', null, 'unsupported timing source is rejected on insert'
);
select throws_ok(
  $$insert into public.solves (owner_id, session_id, scramble_id, puzzle, raw_time_ms,
      timing_source, started_at, completed_at)
    values ('11111111-1111-1111-1111-111111111111',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      '99999999-9999-9999-9999-999999999999', '333', 1000,
      'KEYBOARD', '2026-10-17T12:00:01Z', '2026-10-17T12:00:00Z')$$,
  '23514', null, 'completion cannot precede start'
);
select throws_ok(
  $$insert into public.solves (owner_id, session_id, scramble_id, puzzle, raw_time_ms,
      timing_source, started_at, completed_at)
    values ('11111111-1111-1111-1111-111111111111',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'dddddddd-dddd-dddd-dddd-dddddddddddd', '333', 1000,
      'KEYBOARD', now(), now())$$,
  '23505', null, 'one scramble snapshot cannot back two solves'
);
select throws_ok(
  $$update public.scrambles set notation = 'F R'
    where id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'$$,
  '23514', null, 'scramble snapshot is immutable'
);
select throws_ok(
  $$update public.solves set scramble_id = 'ffffffff-ffff-ffff-ffff-ffffffffffff'
    where id = '00000000-0000-0000-0000-000000000101'$$,
  '23514', null, 'solve scramble reference is immutable'
);
select throws_ok(
  $$delete from public.sessions where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$$,
  '23503', null, 'session deletion is restricted while it has solves'
);
select throws_ok(
  $$delete from public.scrambles where id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'$$,
  '23503', null, 'referenced scramble deletion is restricted'
);
select throws_ok(
  $$insert into public.recordings (owner_id, solve_id, duration_ms, mime_type)
    values ('22222222-2222-2222-2222-222222222222',
      '00000000-0000-0000-0000-000000000101', 1000, 'video/webm')$$,
  '23503', null, 'recording cannot link another owner solve'
);
select throws_ok(
  $$insert into public.recordings
      (owner_id, duration_ms, mime_type, storage_path, consented_at, uploaded_at, size_bytes)
    values ('11111111-1111-1111-1111-111111111111', 1000, 'video/webm',
      '22222222-2222-2222-2222-222222222222/video.webm', now(), now(), 1000)$$,
  '23514', null, 'storage path must use owner prefix'
);
select throws_ok(
  $$insert into public.recordings
      (owner_id, duration_ms, mime_type, storage_path, uploaded_at, size_bytes)
    values ('11111111-1111-1111-1111-111111111111', 1000, 'video/webm',
      '11111111-1111-1111-1111-111111111111/video.webm', now(), 1000)$$,
  '23514', null, 'uploaded metadata requires a recorded consent instant'
);
select throws_ok(
  $$update public.recordings set duration_ms = 500
    where id = '00000000-0000-0000-0000-000000000201'$$,
  '23514', null, 'recording duration cannot change after capture'
);
select lives_ok(
  $$update public.recordings set
      size_bytes = 1000,
      consented_at = now(),
      uploaded_at = now(),
      storage_path = '11111111-1111-1111-1111-111111111111/video.webm'
    where id = '00000000-0000-0000-0000-000000000201'$$,
  'consented upload metadata may be added after capture'
);
select throws_ok(
  $$update public.recordings set size_bytes = 2000
    where id = '00000000-0000-0000-0000-000000000201'$$,
  '23514', null, 'captured uploaded size cannot be changed later'
);
select throws_ok(
  $$insert into public.annotations (owner_id, recording_id, start_ms, end_ms, label)
    values ('11111111-1111-1111-1111-111111111111',
      '00000000-0000-0000-0000-000000000201', 19000, 21000, 'MOVEMENT')$$,
  '23514', null, 'annotation interval cannot exceed recording'
);
select throws_ok(
  $$insert into public.analysis_segments
      (owner_id, analysis_run_id, recording_id, start_ms, end_ms, label)
    values ('11111111-1111-1111-1111-111111111111',
      '00000000-0000-0000-0000-000000000501',
      '00000000-0000-0000-0000-000000000201', 20000, 21000, 'PAUSE')$$,
  '23514', null, 'analysis segment cannot exceed recording'
);
select throws_ok(
  $$insert into public.analysis_runs
      (owner_id, solve_id, recording_id, method, feature_schema_version)
    values ('22222222-2222-2222-2222-222222222222',
      '00000000-0000-0000-0000-000000000101',
      '00000000-0000-0000-0000-000000000201', 'BASELINE', 'features-v1')$$,
  '23503', null, 'analysis cannot link another owner recording and solve'
);
select throws_ok(
  $$insert into public.experiment_runs
      (owner_id, dataset_id, method, code_version,
       config_schema_version, metrics_schema_version, config_json, metrics_json)
    values ('22222222-2222-2222-2222-222222222222',
      '00000000-0000-0000-0000-000000000301', 'BASELINE', 'test-commit',
      1, 1, '{}', '{}')$$,
  '23503', null, 'experiment cannot link another owner dataset'
);
select lives_ok(
  $$insert into public.solves
      (id, owner_id, session_id, scramble_id, puzzle, raw_time_ms,
       timing_source, started_at, completed_at)
    values ('00000000-0000-0000-0000-000000000102',
      '11111111-1111-1111-1111-111111111111',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      '99999999-9999-9999-9999-999999999999', '333', 15000,
      'TOUCH', '2026-10-17T13:00:00Z', '2026-10-17T13:00:15Z')$$,
  'a second solve with a distinct scramble inserts'
);
select throws_ok(
  $$insert into public.analysis_runs
      (owner_id, solve_id, recording_id, method, feature_schema_version)
    values ('11111111-1111-1111-1111-111111111111',
      '00000000-0000-0000-0000-000000000102',
      '00000000-0000-0000-0000-000000000201', 'BASELINE', 'features-v1')$$,
  '23503', null, 'analysis must use the solve linked to its recording'
);
select lives_ok(
  $$update public.solves set penalty = 'plus2', notes = 'reviewed'
    where id = '00000000-0000-0000-0000-000000000101'$$,
  'penalty and notes may be edited'
);
select is((select penalty from public.solves where id = '00000000-0000-0000-0000-000000000101'),
  'plus2', 'valid penalty edit persists');
select lives_ok(
  $$insert into public.annotations (owner_id, recording_id, start_ms, end_ms, label)
    values ('11111111-1111-1111-1111-111111111111',
      '00000000-0000-0000-0000-000000000201', 0, 1000, 'MOVEMENT')$$,
  'valid annotation interval inserts'
);
select lives_ok(
  $$insert into public.analysis_segments
      (owner_id, analysis_run_id, recording_id, start_ms, end_ms, label, confidence)
    values ('11111111-1111-1111-1111-111111111111',
      '00000000-0000-0000-0000-000000000501',
      '00000000-0000-0000-0000-000000000201', 0, 1000, 'MOVEMENT', 0.9)$$,
  'valid analysis segment inserts'
);
select lives_ok(
  $$insert into public.analysis_runs
      (owner_id, solve_id, recording_id, model_version_id, method, feature_schema_version)
    values ('11111111-1111-1111-1111-111111111111',
      '00000000-0000-0000-0000-000000000101',
      '00000000-0000-0000-0000-000000000201',
      '00000000-0000-0000-0000-000000000401', 'MODEL', 'features-v1')$$,
  'valid model-linked analysis inserts'
);
select throws_ok(
  $$insert into public.analysis_runs
      (owner_id, solve_id, recording_id, model_version_id, method, feature_schema_version)
    values ('11111111-1111-1111-1111-111111111111',
      '00000000-0000-0000-0000-000000000101',
      '00000000-0000-0000-0000-000000000201',
      '00000000-0000-0000-0000-000000000401', 'MODEL', 'wrong-features')$$,
  '23503', null, 'model analysis must use its declared feature schema'
);
select lives_ok(
  $$insert into public.experiment_runs
      (owner_id, dataset_id, model_version_id, method, code_version,
       config_schema_version, metrics_schema_version, config_json, metrics_json)
    values ('11111111-1111-1111-1111-111111111111',
      '00000000-0000-0000-0000-000000000301',
      '00000000-0000-0000-0000-000000000401', 'MODEL', 'test-commit',
      1, 1, '{}', '{}')$$,
  'valid model-linked experiment inserts'
);
select lives_ok(
  $$insert into public.analysis_segments
      (owner_id, analysis_run_id, recording_id, start_ms, end_ms, label)
    values ('11111111-1111-1111-1111-111111111111',
      '00000000-0000-0000-0000-000000000501',
      '00000000-0000-0000-0000-000000000201', 1000, 2000, 'PAUSE')$$,
  'adjacent half-open analysis segment inserts'
);
select throws_ok(
  $$insert into public.analysis_segments
      (owner_id, analysis_run_id, recording_id, start_ms, end_ms, label)
    values ('11111111-1111-1111-1111-111111111111',
      '00000000-0000-0000-0000-000000000501',
      '00000000-0000-0000-0000-000000000201', 500, 1500, 'PAUSE')$$,
  '23P01', null, 'analysis segments cannot overlap'
);

select * from finish();
rollback;

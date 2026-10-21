begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

select has_column('public', 'scrambles', 'generator_provider', 'scrambles store provider provenance');
select has_column('public', 'scrambles', 'generation_method', 'scrambles store generation method');

insert into auth.users (id, email) values
  ('43111111-1111-1111-1111-111111111111', 'category03-provenance@example.test');

insert into public.scrambles (id, owner_id, puzzle, notation, generator_version,
    generator_provider, generation_method)
values ('43aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '43111111-1111-1111-1111-111111111111',
    '333', E'R  U\nR\' ', '0.66.1', 'cubing.js', 'RANDOM_STATE');
select is((select generator_provider || ':' || generation_method
  from public.scrambles where id = '43aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  'cubing.js:RANDOM_STATE', 'provider and method persist on new rows');
select is((select notation from public.scrambles where id = '43aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  E'R  U\nR\' ', 'notation whitespace is preserved exactly');

insert into public.scrambles (id, owner_id, puzzle, notation, generator_version)
values ('43bbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '43111111-1111-1111-1111-111111111111',
    '333', 'F U', 'legacy-v1');
select is((select generator_provider is null and generation_method is null
  from public.scrambles where id = '43bbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  true, 'legacy rows can retain unknown provenance as NULL');

select throws_ok($$insert into public.scrambles (owner_id, puzzle, notation, generator_version, generation_method)
  values ('43111111-1111-1111-1111-111111111111', '333', 'R U', 'v1', 'UNKNOWN')$$,
  '23514', null, 'unsupported generation methods are rejected');
select throws_ok($$insert into public.scrambles (owner_id, puzzle, notation, generator_version, generator_provider)
  values ('43111111-1111-1111-1111-111111111111', '333', 'R U', 'v1', '  ')$$,
  '23514', null, 'blank provider names are rejected');
select throws_ok($$update public.scrambles set generation_method = 'RANDOM_MOVE'
  where id = '43aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$$,
  '23514', null, 'scramble provenance remains immutable');

select * from finish();
rollback;

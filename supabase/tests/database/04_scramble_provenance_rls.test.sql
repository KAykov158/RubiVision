begin;
create extension if not exists pgtap with schema extensions;
select plan(4);

insert into auth.users (id, email) values
  ('44111111-1111-1111-1111-111111111111', 'category03-rls-a@example.test'),
  ('44222222-2222-2222-2222-222222222222', 'category03-rls-b@example.test');
insert into public.scrambles (id, owner_id, puzzle, notation, generator_version,
    generator_provider, generation_method) values
  ('44aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44111111-1111-1111-1111-111111111111',
    '333', 'R U', '0.66.1', 'cubing.js', 'RANDOM_STATE'),
  ('44bbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44222222-2222-2222-2222-222222222222',
    '333', 'F U', '0.66.1', 'cubing.js', 'RANDOM_STATE');

set local role anon;
select throws_ok($$select count(*) from public.scrambles$$,
  '42501', null, 'anonymous users cannot read scramble provenance');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '44111111-1111-1111-1111-111111111111', true);
select set_config('request.jwt.claims', '{"sub":"44111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
select is((select count(*)::integer from public.scrambles), 1,
  'account A reads only its own scramble and provenance');
select throws_ok($$insert into public.scrambles (owner_id, puzzle, notation, generator_version,
    generator_provider, generation_method)
  values ('44222222-2222-2222-2222-222222222222', '333', 'L U', 'v1', 'cubing.js', 'RANDOM_STATE')$$,
  '42501', null, 'account A cannot insert scramble provenance for account B');
select lives_ok($$insert into public.scrambles (owner_id, puzzle, notation, generator_version,
    generator_provider, generation_method)
  values ('44111111-1111-1111-1111-111111111111', '333', 'L U', 'v1', 'cubing.js', 'RANDOM_STATE')$$,
  'account A can insert its own scramble provenance');
reset role;

select * from finish();
rollback;

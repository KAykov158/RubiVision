begin;
create extension if not exists pgtap with schema extensions;
select plan(20);

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
  'RLS is enabled on every owned table'
);
select is(
  (select count(*) from pg_policies p
   join category02_owned_tables t on t.name = p.tablename
   where p.schemaname = 'public'),
  0::bigint, 'Category 02 has no client access policies'
);

select ok((select bool_and(not has_table_privilege('anon', format('public.%I', name), 'SELECT'))
           from category02_owned_tables), 'anon has no select grants');
select ok((select bool_and(not has_table_privilege('anon', format('public.%I', name), 'INSERT'))
           from category02_owned_tables), 'anon has no insert grants');
select ok((select bool_and(not has_table_privilege('anon', format('public.%I', name), 'UPDATE'))
           from category02_owned_tables), 'anon has no update grants');
select ok((select bool_and(not has_table_privilege('anon', format('public.%I', name), 'DELETE'))
           from category02_owned_tables), 'anon has no delete grants');
select ok((select bool_and(not has_table_privilege('authenticated', format('public.%I', name), 'SELECT'))
           from category02_owned_tables), 'authenticated has no select grants');
select ok((select bool_and(not has_table_privilege('authenticated', format('public.%I', name), 'INSERT'))
           from category02_owned_tables), 'authenticated has no insert grants');
select ok((select bool_and(not has_table_privilege('authenticated', format('public.%I', name), 'UPDATE'))
           from category02_owned_tables), 'authenticated has no update grants');
select ok((select bool_and(not has_table_privilege('authenticated', format('public.%I', name), 'DELETE'))
           from category02_owned_tables), 'authenticated has no delete grants');
select ok(not has_schema_privilege('anon', 'private', 'USAGE'),
  'anon cannot use private trigger schema');
select ok(not has_schema_privilege('authenticated', 'private', 'USAGE'),
  'authenticated cannot use private trigger schema');

set local role anon;
select throws_ok($$select count(*) from public.solves$$, '42501', null,
  'anon cannot read solves');
select throws_ok($$insert into public.solves default values$$, '42501', null,
  'anon cannot insert solves');
select throws_ok($$update public.solves set penalty = 'dnf'$$, '42501', null,
  'anon cannot update solves');
select throws_ok($$delete from public.solves$$, '42501', null,
  'anon cannot delete solves');
reset role;

set local role authenticated;
select throws_ok($$select count(*) from public.solves$$, '42501', null,
  'authenticated cannot read solves before 02A');
select throws_ok($$insert into public.solves default values$$, '42501', null,
  'authenticated cannot insert solves before 02A');
select throws_ok($$update public.solves set penalty = 'dnf'$$, '42501', null,
  'authenticated cannot update solves before 02A');
select throws_ok($$delete from public.solves$$, '42501', null,
  'authenticated cannot delete solves before 02A');
reset role;

select * from finish();
rollback;

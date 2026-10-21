import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { checkDatabaseTest, checkDbStatic, countPgTapAssertions, inspectMigration } from './check-db-static.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rlsMigrationName = '20261018000100_auth_rls_storage.sql';
const rlsMigration = readFileSync(resolve(root, 'supabase/migrations', rlsMigrationName), 'utf8');

test('accepts the current migration phases and pgTAP suite', () => {
  const result = checkDbStatic(root);
  assert.deepEqual(result.failures, []);
  assert.equal(result.migrationCount, 5);
});

test('rejects policies outside the authorized Category 02A migration', () => {
  const failures = inspectMigration('20261019000100_scramble_generation_provenance.sql',
    'create policy unexpected_policy on public.scrambles for select to authenticated using (true);');
  assert.match(failures.join('\n'), /allowed only in 20261018000100_auth_rls_storage\.sql/u);
});

test('rejects an unapproved policy added to the authorized migration', () => {
  const failures = inspectMigration(rlsMigrationName,
    `${rlsMigration}\ncreate policy unexpected_policy on public.scrambles for select to authenticated using (true);`);
  assert.match(failures.join('\n'), /unauthorized policy unexpected_policy/u);
  assert.match(failures.join('\n'), /does not enforce auth\.uid\(\) ownership/u);
});

test('rejects SECURITY DEFINER outside the authorized auth trigger migration', () => {
  const failures = inspectMigration('20261019000100_scramble_generation_provenance.sql',
    'create function public.unexpected() returns void language sql security definer as $$ select 1 $$;');
  assert.match(failures.join('\n'), /allowed only in 20261018000100_auth_rls_storage\.sql/u);
});

test('rejects an additional SECURITY DEFINER function inside the authorized migration', () => {
  const failures = inspectMigration(rlsMigrationName,
    `${rlsMigration}\ncreate function public.unexpected() returns void language sql security definer as $$ select 1 $$;`);
  assert.match(failures.join('\n'), /only private\.handle_new_auth_user/u);
});

test('counts has_column and every pgTAP assertion used by the database suite', () => {
  const sql = `select plan(6);\nselect has_column('public', 'scrambles', 'id');\nselect hasnt_column('public', 'solves', 'effective_time_ms');\nselect ok(true, 'ok');\nselect is(1, 1, 'is');\nselect throws_ok('select 1', '23514', null, 'throws');\nselect lives_ok('select 1', 'lives');\nselect set_config('request.jwt.claim.sub', 'user', true);\nselect * from finish();`;
  assert.equal(countPgTapAssertions(sql), 6);
  assert.deepEqual(checkDatabaseTest('fixture.sql', sql), []);
});

test('reports incorrect pgTAP plan counts', () => {
  const failures = checkDatabaseTest('fixture.sql', 'select plan(2);\nselect has_column(\'public\', \'scrambles\', \'id\');');
  assert.deepEqual(failures, ['fixture.sql: plan(2) does not match 1 assertions.']);
});

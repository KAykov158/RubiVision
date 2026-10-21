import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const AUTHORIZED_RLS_MIGRATION = '20261018000100_auth_rls_storage.sql';
const expectedTables = new Set([
  'profiles', 'user_settings', 'sessions', 'scrambles', 'solves',
  'recordings', 'annotations', 'analysis_runs', 'analysis_segments',
  'model_versions', 'dataset_metadata', 'experiment_runs',
]);

const expectedLiteralPolicies = new Set([
  'profiles_select_owner|public.profiles|select',
  'profiles_update_owner|public.profiles|update',
  'scrambles_select_owner|public.scrambles|select',
  'scrambles_insert_owner|public.scrambles|insert',
  'scrambles_delete_owner|public.scrambles|delete',
  'solves_select_owner|public.solves|select',
  'solves_insert_owner|public.solves|insert',
  'solves_update_owner|public.solves|update',
  'solves_delete_owner|public.solves|delete',
  'recordings_objects_select_owner|storage.objects|select',
  'recordings_objects_insert_owner|storage.objects|insert',
  'recordings_objects_update_owner|storage.objects|update',
  'recordings_objects_delete_owner|storage.objects|delete',
]);

const expectedDynamicOwnerTables = new Set([
  'user_settings|user_id', 'sessions|owner_id', 'recordings|owner_id',
  'dataset_metadata|owner_id', 'annotations|owner_id', 'model_versions|owner_id',
  'analysis_runs|owner_id', 'analysis_segments|owner_id', 'experiment_runs|owner_id',
]);

const expectedDynamicPolicyTemplates = [
  "execute format('create policy %i on public.%i for select to authenticated using (%i = (select auth.uid()))', item.table_name || '_select_owner', item.table_name, item.owner_column);",
  "execute format('create policy %i on public.%i for insert to authenticated with check (%i = (select auth.uid()))', item.table_name || '_insert_owner', item.table_name, item.owner_column);",
  "execute format('create policy %i on public.%i for update to authenticated using (%i = (select auth.uid())) with check (%i = (select auth.uid()))', item.table_name || '_update_owner', item.table_name, item.owner_column, item.owner_column);",
  "execute format('create policy %i on public.%i for delete to authenticated using (%i = (select auth.uid()))', item.table_name || '_delete_owner', item.table_name, item.owner_column);",
];

const pgTapAssertionFunctions = new Set([
  'ok', 'is', 'has_column', 'hasnt_column', 'throws_ok', 'lives_ok',
]);

export function inspectMigration(name, sql) {
  const failures = [];
  const policyCount = [...sql.matchAll(/\bcreate\s+policy\b/gi)].length;
  const securityDefinerCount = [...sql.matchAll(/\bsecurity\s+definer\b/gi)].length;

  if ((policyCount > 0 || securityDefinerCount > 0) && name !== AUTHORIZED_RLS_MIGRATION) {
    failures.push(`${name}: policies and SECURITY DEFINER functions are allowed only in ${AUTHORIZED_RLS_MIGRATION}.`);
    return failures;
  }
  if (name !== AUTHORIZED_RLS_MIGRATION) return failures;

  const literalPolicies = [...sql.matchAll(/\bcreate\s+policy\s+([\w]+)\s+on\s+([\w.]+)\s+for\s+(select|insert|update|delete)\s+to\s+authenticated\b([\s\S]*?);/gi)];
  const foundLiteralPolicies = new Set();
  for (const match of literalPolicies) {
    const [, policyName, tableName, command, body] = match;
    const key = `${policyName}|${tableName}|${command.toLowerCase()}`;
    if (!expectedLiteralPolicies.has(key)) failures.push(`${name}: unauthorized policy ${policyName} on ${tableName}.`);
    foundLiteralPolicies.add(key);
    if (!/\(select\s+auth\.uid\(\)\)/i.test(body)) {
      failures.push(`${name}: policy ${policyName} does not enforce auth.uid() ownership.`);
    }
  }
  for (const policy of expectedLiteralPolicies) {
    if (!foundLiteralPolicies.has(policy)) failures.push(`${name}: missing authorized policy ${policy.replaceAll('|', ' on ')}.`);
  }

  const normalizedSql = sql.replace(/\s+/g, ' ').toLowerCase();
  const dynamicTemplateCount = [...sql.matchAll(/execute\s+format\s*\(\s*'create\s+policy\b/gi)].length;
  const missingDynamicTemplateIndexes = expectedDynamicPolicyTemplates
    .map((template, index) => normalizedSql.includes(template) ? null : index + 1)
    .filter((index) => index !== null);
  if (dynamicTemplateCount !== expectedDynamicPolicyTemplates.length || missingDynamicTemplateIndexes.length > 0) {
    failures.push(`${name}: dynamic owner policy templates differ from the authorized owner-scoped set (found ${dynamicTemplateCount} templates; missing expected templates ${missingDynamicTemplateIndexes.join(', ') || 'none'}).`);
  }

  const ownerValues = sql.match(/for\s+item\s+in\s+select\s+\*\s+from\s+\(values([\s\S]*?)\)\s+as\s+owner_tables\s*\(/i)?.[1] ?? '';
  const ownerTableEntries = [...ownerValues.matchAll(/\('([\w]+)'\s*,\s*'([\w]+)'\)/g)]
    .map(([, table, column]) => `${table}|${column}`);
  const foundOwnerTables = new Set(ownerTableEntries);
  if (ownerTableEntries.length !== expectedDynamicOwnerTables.size
    || foundOwnerTables.size !== expectedDynamicOwnerTables.size
    || [...expectedDynamicOwnerTables].some((table) => !foundOwnerTables.has(table))) {
    failures.push(`${name}: dynamic owner policy table/column list differs from the authorized set.`);
  }

  if (policyCount !== expectedLiteralPolicies.size + expectedDynamicPolicyTemplates.length) {
    failures.push(`${name}: unexpected policy declaration or dynamic policy template count.`);
  }

  const privilegedFunctions = [...sql.matchAll(/create\s+function\s+([\w.]+)\s*\([^)]*\)([\s\S]*?)\$\$\s*;/gi)]
    .filter(([, , definition]) => /\bsecurity\s+definer\b/i.test(definition));
  const privilegedFunctionBody = privilegedFunctions[0]?.[0]?.match(/\$\$([\s\S]*?)\$\$/)?.[1]
    ?.replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  const expectedPrivilegedFunctionBody = 'begin insert into public.profiles (id) values (new.id) on conflict (id) do nothing; insert into public.user_settings (user_id) values (new.id) on conflict (user_id) do nothing; return new; end;';
  if (securityDefinerCount !== 1
    || privilegedFunctions.length !== 1
    || privilegedFunctions[0]?.[1]?.toLowerCase() !== 'private.handle_new_auth_user'
    || !/set\s+search_path\s*=\s*''/i.test(privilegedFunctions[0]?.[2] ?? '')
    || privilegedFunctionBody !== expectedPrivilegedFunctionBody) {
    failures.push(`${name}: only private.handle_new_auth_user with an empty search_path and the expected profile/settings initialization may be SECURITY DEFINER.`);
  }

  return failures;
}

export function countPgTapAssertions(sql) {
  return [...sql.matchAll(/^\s*select\s+([a-z_]+)\s*\(/gim)]
    .filter(([, name]) => pgTapAssertionFunctions.has(name.toLowerCase())).length;
}

export function checkDatabaseTest(name, sql) {
  const failures = [];
  const plan = sql.match(/^\s*select\s+plan\((\d+)\)\s*;/im);
  if (!plan) return [`${name}: missing pgTAP plan.`];
  const expected = Number(plan[1]);
  const actual = countPgTapAssertions(sql);
  if (expected !== actual) failures.push(`${name}: plan(${expected}) does not match ${actual} assertions.`);
  return failures;
}

export function checkDbStatic(repositoryRoot = root) {
  const migrationDir = join(repositoryRoot, 'supabase/migrations');
  const testDir = join(repositoryRoot, 'supabase/tests/database');
  const failures = [];
  const seen = new Set();
  const migrations = readdirSync(migrationDir).filter((name) => name.endsWith('.sql')).sort();
  if (migrations.length < 2 || migrations.some((name) => !/^\d{14}_.+\.sql$/.test(name))) {
    failures.push('Expected ordered, timestamped SQL migrations.');
  }

  for (const name of migrations) {
    const sql = readFileSync(join(migrationDir, name), 'utf8');
    failures.push(...inspectMigration(name, sql));
    for (const match of sql.matchAll(/create\s+table\s+public\.(\w+)\s*\(/gi)) {
      const table = match[1];
      seen.add(table);
      if (!new RegExp(`alter\\s+table\\s+public\\.${table}\\s+enable\\s+row\\s+level\\s+security\\s*;`, 'i').test(sql)) {
        failures.push(`${name}: ${table} has no RLS enable statement.`);
      }
      if (!new RegExp(`revoke\\s+all\\s+on\\s+table\\s+public\\.${table}\\s+from\\s+public,\\s*anon,\\s*authenticated\\s*;`, 'i').test(sql)) {
        failures.push(`${name}: ${table} has no client-role revoke statement.`);
      }
    }
  }
  for (const table of expectedTables) {
    if (!seen.has(table)) failures.push(`Missing expected table: ${table}.`);
  }
  for (const table of seen) {
    if (!expectedTables.has(table)) failures.push(`Unreviewed table: ${table}.`);
  }

  for (const name of readdirSync(testDir).filter((entry) => entry.endsWith('.sql'))) {
    failures.push(...checkDatabaseTest(name, readFileSync(join(testDir, name), 'utf8')));
  }
  return { failures, tableCount: seen.size, migrationCount: migrations.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { failures, tableCount, migrationCount } = checkDbStatic();
  if (failures.length) {
    for (const failure of failures) console.error(failure);
    process.exitCode = 1;
  } else {
    console.log(`Static schema checks passed: ${tableCount} locked tables, ${migrationCount} migrations, test plans match.`);
  }
}

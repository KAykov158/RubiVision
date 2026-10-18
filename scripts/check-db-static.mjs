import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const migrationDir = join(root, 'supabase/migrations');
const testDir = join(root, 'supabase/tests/database');
const expected = new Set([
  'profiles', 'user_settings', 'sessions', 'scrambles', 'solves',
  'recordings', 'annotations', 'analysis_runs', 'analysis_segments',
  'model_versions', 'dataset_metadata', 'experiment_runs',
]);

const failures = [];
const seen = new Set();
const migrations = readdirSync(migrationDir).filter((name) => name.endsWith('.sql')).sort();
if (migrations.length < 2 || migrations.some((name) => !/^\d{14}_.+\.sql$/.test(name))) {
  failures.push('Expected ordered, timestamped SQL migrations.');
}

for (const name of migrations) {
  const sql = readFileSync(join(migrationDir, name), 'utf8');
  if (/\bcreate\s+policy\b/i.test(sql) || /\bsecurity\s+definer\b/i.test(sql)) {
    failures.push(`${name}: client policies or privileged functions belong to a later phase.`);
  }
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
for (const table of expected) {
  if (!seen.has(table)) failures.push(`Missing expected table: ${table}.`);
}
for (const table of seen) {
  if (!expected.has(table)) failures.push(`Unreviewed table: ${table}.`);
}

for (const name of readdirSync(testDir).filter((entry) => entry.endsWith('.sql'))) {
  const sql = readFileSync(join(testDir, name), 'utf8');
  const planned = Number(sql.match(/select\s+plan\((\d+)\)/i)?.[1]);
  const found = [...sql.matchAll(/^select\s+(?:ok|is|hasnt_column|throws_ok|lives_ok)\s*\(/gim)].length;
  if (planned !== found) failures.push(`${name}: plan(${planned}) does not match ${found} assertions.`);
}

if (failures.length) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}
console.log(`Static schema checks passed: ${seen.size} locked tables, ${migrations.length} migrations, test plans match.`);

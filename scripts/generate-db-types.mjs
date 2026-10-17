import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = resolve(root, 'apps/web/src/shared/database/database.types.ts');
const mode = process.argv[2];

if (mode !== '--write' && mode !== '--check') {
  console.error('Usage: node scripts/generate-db-types.mjs --write|--check');
  process.exit(2);
}

let generated;
try {
  const command = process.platform === 'win32'
    ? 'npm.cmd exec --no -- supabase gen types typescript --local --schema public'
    : 'npm exec --no -- supabase gen types typescript --local --schema public';
  generated = execSync(command, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 8 * 1024 * 1024,
  }).replace(/\r\n/g, '\n');
} catch {
  console.error('Type generation failed. Run npm ci and start a disposable local Supabase stack before retrying.');
  process.exit(1);
}

if (mode === '--check') {
  let committed;
  try {
    committed = readFileSync(target, 'utf8').replace(/\r\n/g, '\n');
  } catch {
    console.error('Generated database types are missing. Run --write after local migrations pass.');
    process.exit(1);
  }
  if (committed !== generated) {
    console.error('Generated database types differ from the local schema. Run --write and review the diff.');
    process.exit(1);
  }
  console.log('Generated database types match the local schema.');
} else {
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, generated, 'utf8');
  console.log('Wrote apps/web/src/shared/database/database.types.ts from the local schema.');
}

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import {
  freshAuthDiagnostic,
  maxStorageBytes,
  parseEnv,
  persistenceReadDiagnostic,
  validateConfig,
} from './verify-hosted-02a.mjs';

const config = {
  SUPABASE_URL: 'https://jdolsxuyfyttunpshvfv.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test-value',
  CATEGORY_02A_USER_A_EMAIL: 'a@example.test',
  CATEGORY_02A_USER_A_PASSWORD: 'password-a',
  CATEGORY_02A_USER_B_EMAIL: 'b@example.test',
  CATEGORY_02A_USER_B_PASSWORD: 'password-b',
};

test('parses ignored local env values without logging them', () => {
  const parsed = parseEnv('# local\nSUPABASE_URL="https://example.test"\nCATEGORY_02A_USER_A_PASSWORD=keep=equals\n');
  assert.equal(parsed.SUPABASE_URL, 'https://example.test');
  assert.equal(parsed.CATEGORY_02A_USER_A_PASSWORD, 'keep=equals');
});

test('hosted Storage limit check uses the 50 MiB Free-plan cap', () => {
  assert.equal(maxStorageBytes, 52_428_800);
});

test('accepts only the approved project and publishable key formats', () => {
  assert.deepEqual(validateConfig(config), []);
  assert.ok(validateConfig({ ...config, SUPABASE_URL: 'https://production.supabase.co' }).some((error) => error.includes('approved development project')));
  assert.ok(validateConfig({ ...config, SUPABASE_PUBLISHABLE_KEY: 'sb_secret_never-use' }).some((error) => error.includes('forbidden')));
  const serviceRole = Buffer.from(JSON.stringify({ role: 'service_role' })).toString('base64url');
  assert.ok(validateConfig({ ...config, SUPABASE_PUBLISHABLE_KEY: `header.${serviceRole}.signature` }).some((error) => error.includes('privileged')));
  assert.ok(validateConfig({ ...config, CATEGORY_02A_USER_B_EMAIL: config.CATEGORY_02A_USER_A_EMAIL }).some((error) => error.includes('different')));
});

test('fresh persistence sign-in diagnostics distinguish auth failures without exposing details', () => {
  assert.equal(freshAuthDiagnostic({ error: { status: 429, message: 'sensitive auth response' } }), 'FRESH_SIGN_IN_HTTP_429');
  assert.equal(freshAuthDiagnostic({ user: null, session: null, expectedUserId: 'user-a' }), 'FRESH_SIGN_IN_USER_MISSING');
  assert.equal(freshAuthDiagnostic({ user: { id: 'user-b' }, session: { access_token: 'secret' }, expectedUserId: 'user-a' }), 'FRESH_SIGN_IN_WRONG_USER');
  assert.equal(freshAuthDiagnostic({ user: { id: 'user-a' }, session: {}, expectedUserId: 'user-a' }), 'FRESH_SIGN_IN_SESSION_MISSING');
  assert.equal(freshAuthDiagnostic({ user: { id: 'user-a' }, session: { access_token: 'secret' }, expectedUserId: 'user-a' }), null);
});

test('persistence read diagnostics identify HTTP, shape, count and value failures', () => {
  const expected = { solveId: 'solve-1', expectedDuration: 1839 };
  assert.equal(persistenceReadDiagnostic({ ...expected, responseOk: false, status: 403 }), 'PERSISTENCE_HTTP_403');
  assert.equal(persistenceReadDiagnostic({ ...expected, responseOk: true, data: null }), 'PERSISTENCE_RESPONSE_NOT_ARRAY');
  assert.equal(persistenceReadDiagnostic({ ...expected, responseOk: true, data: [] }), 'PERSISTENCE_ROW_COUNT_0');
  assert.equal(persistenceReadDiagnostic({ ...expected, responseOk: true, data: [{ id: 'solve-2', raw_time_ms: 1839 }] }), 'PERSISTENCE_ID_MISMATCH');
  assert.equal(persistenceReadDiagnostic({ ...expected, responseOk: true, data: [{ id: 'solve-1', raw_time_ms: 1840 }] }), 'PERSISTENCE_DURATION_MISMATCH');
  assert.equal(persistenceReadDiagnostic({ ...expected, responseOk: true, data: [{ id: 'solve-1', raw_time_ms: 1839 }] }), null);
});

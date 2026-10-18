import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';
import { randomUUID } from 'node:crypto';
import { Blob, Buffer } from 'node:buffer';
import * as console from 'node:console';
import process from 'node:process';
import { URL, URLSearchParams } from 'node:url';

const projectRef = 'jdolsxuyfyttunpshvfv';
const configFile = resolve(process.cwd(), '.env.hosted-02a.local');
const fixtureNotation = "R U R' U' F2 D L2 B' U2 R2 F' D2 L U' B2 R F2 U L' D'";
export const maxStorageBytes = 52_428_800;

export function parseEnv(text) {
  const values = {};
  for (const line of text.split(/\r?\n/u)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = /^([A-Z][A-Z0-9_]*)\s*=\s*(.*)$/u.exec(trimmed);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value;
  }
  return values;
}

export function validateConfig(config) {
  const errors = [];
  let url;
  try { url = new URL(config.SUPABASE_URL ?? ''); } catch { errors.push('SUPABASE_URL is missing or invalid.'); }
  if (url && (url.protocol !== 'https:' || url.hostname !== `${projectRef}.supabase.co`)) {
    errors.push(`SUPABASE_URL must target the approved development project ${projectRef}.`);
  }
  const key = config.SUPABASE_PUBLISHABLE_KEY ?? '';
  if (key.startsWith('sb_secret_')) errors.push('A secret API key is forbidden; use the publishable key.');
  else if (key.startsWith('sb_publishable_') && key.length >= 20) { /* accepted public key format */ }
  else if (key.split('.').length === 3) {
    try {
      const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString('utf8'));
      if (payload.role !== 'anon') errors.push('A legacy key must have the anon role; privileged keys are forbidden.');
    } catch { errors.push('SUPABASE_PUBLISHABLE_KEY is not a valid publishable/anon key.'); }
  } else errors.push('SUPABASE_PUBLISHABLE_KEY must be sb_publishable_ or a legacy anon JWT.');
  for (const name of ['CATEGORY_02A_USER_A_EMAIL', 'CATEGORY_02A_USER_A_PASSWORD', 'CATEGORY_02A_USER_B_EMAIL', 'CATEGORY_02A_USER_B_PASSWORD']) {
    if (!config[name]) errors.push(`${name} is required in the ignored local config file.`);
  }
  if (config.CATEGORY_02A_USER_A_EMAIL?.toLowerCase() === config.CATEGORY_02A_USER_B_EMAIL?.toLowerCase()) {
    errors.push('The two disposable account email addresses must be different.');
  }
  return errors;
}

function newClient(url, key) {
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
}

function safeErrorTag(error) {
  if (Number.isInteger(error?.status)) return `HTTP_${error.status}`;
  if (typeof error?.code === 'string' && /^[A-Z0-9_-]{1,32}$/u.test(error.code)) return error.code;
  return 'REQUEST_ERROR';
}

export function freshAuthDiagnostic({ error, user, session, expectedUserId }) {
  if (error) return Number.isInteger(error.status) ? `FRESH_SIGN_IN_HTTP_${error.status}` : 'FRESH_SIGN_IN_FAILED';
  if (!user) return 'FRESH_SIGN_IN_USER_MISSING';
  if (user.id !== expectedUserId) return 'FRESH_SIGN_IN_WRONG_USER';
  if (!session?.access_token) return 'FRESH_SIGN_IN_SESSION_MISSING';
  return null;
}

export function persistenceReadDiagnostic({ responseOk, status, data, solveId, expectedDuration }) {
  if (!responseOk) return Number.isInteger(status) ? `PERSISTENCE_HTTP_${status}` : 'PERSISTENCE_HTTP_FAILED';
  if (!Array.isArray(data)) return 'PERSISTENCE_RESPONSE_NOT_ARRAY';
  if (data.length !== 1) return `PERSISTENCE_ROW_COUNT_${data.length}`;
  if (data[0]?.id !== solveId) return 'PERSISTENCE_ID_MISMATCH';
  if (data[0]?.raw_time_ms !== expectedDuration) return 'PERSISTENCE_DURATION_MISMATCH';
  return null;
}

function requireCondition(condition, diagnostic = 'ASSERTION_FAILED') {
  if (!condition) {
    const error = new Error(diagnostic);
    error.code = diagnostic;
    throw error;
  }
}

function restUrl(baseUrl, table, filters = {}) {
  const query = new URLSearchParams({ select: '*', ...filters });
  return `${baseUrl}/rest/v1/${table}?${query}`;
}

async function restRequest({ url, key, token, table, filters, method = 'GET', body, prefer = 'return=representation' }) {
  const response = await globalThis.fetch(restUrl(url, table, filters), {
    method,
    headers: {
      apikey: key,
      'Content-Type': 'application/json',
      Prefer: prefer,
      ...(token === key ? {} : { Authorization: `Bearer ${token}` }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  let data = null;
  try { data = await response.json(); } catch { /* empty response */ }
  return { response, data };
}

function rowId(id) { return `eq.${id}`; }

async function getRows(ctx, table, filters, token = ctx.token) {
  return restRequest({ url: ctx.url, key: ctx.key, token, table, filters, method: 'GET' });
}

async function removeOwn(ctx, table, id, ownerId) {
  return restRequest({
    url: ctx.url, key: ctx.key, token: ctx.token, table,
    filters: { id: rowId(id), owner_id: rowId(ownerId) }, method: 'DELETE', prefer: 'return=minimal',
  });
}

function record(results, label, status, detail = '') {
  results.push({ label, status });
  console.log(`[${status}] ${label}${detail ? ` — ${detail}` : ''}`);
}

async function check(results, label, callback) {
  try {
    await callback();
    record(results, label, 'PASS');
    return true;
  } catch (error) {
    record(results, label, 'FAIL', safeErrorTag(error));
    return false;
  }
}

async function confirmCreation(runId) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) return false;
  console.log('\nHosted data this run may create (all names and IDs are unique to this run):');
  console.log('- 2 disposable sessions, 2 fixed-fixture scrambles, and 1 solve across the two supplied users.');
  console.log('- 1 tiny video/webm object in the private recordings bucket, owned by User A.');
  console.log('- RLS probes attempt reads, owner-spoofed inserts, cross-owner foreign keys, and cross-user updates/deletes only against generated records.');
  console.log('- Profile/settings are read and cross-user updates are attempted for User A; original values are restored if unexpectedly changed.');
  console.log('- Anonymous and cross-user uploads use this run ID path; if a policy is broken, only generated rows/objects are removed.');
  console.log(`Unique test run ID: ${runId}`);
  console.log('The runner never creates accounts, edits schema/policies, uses privileged credentials, or touches other records.');
  const terminal = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await terminal.question('Type CREATE CATEGORY 02A TEST DATA to continue: ');
    return answer.trim() === 'CREATE CATEGORY 02A TEST DATA';
  } finally { terminal.close(); }
}

function uuid() { return randomUUID(); }

async function main() {
  const results = [];
  let ctxA;
  let ctxB;
  let authA;
  let authB;
  let storageObjectPath = '';
  let accountSnapshot = null;
  let testDataAuthorized = false;
  const ids = {
    sessionsA: [uuid(), uuid(), uuid()], sessionsB: [uuid()],
    scramblesA: [uuid()], scramblesB: [uuid()],
    solvesA: [uuid()], solvesB: [uuid(), uuid()],
  };
  const runId = uuid();

  let configText;
  try { configText = await readFile(configFile, 'utf8'); }
  catch {
    console.error('Setup blocked: create apps/web/.env.hosted-02a.local from scripts/hosted-02a.env.example. Credentials are not printed or sent anywhere except the approved development project.');
    console.log('Result: PASS 0 | FAIL 0 | SKIP 1');
    process.exitCode = 2;
    return;
  }
  const config = parseEnv(configText);
  const configErrors = validateConfig(config);
  if (configErrors.length) {
    console.error(`Setup blocked: ${configErrors.join(' ')}`);
    console.log('Result: PASS 0 | FAIL 1 | SKIP 0');
    process.exitCode = 2;
    return;
  }
  const baseUrl = config.SUPABASE_URL.replace(/\/$/u, '');
  const key = config.SUPABASE_PUBLISHABLE_KEY;
  console.log(`Category 02A hosted verification — approved development project ${projectRef}`);

  try {
    authA = newClient(baseUrl, key);
    authB = newClient(baseUrl, key);
    const [signInA, signInB] = await Promise.all([
      authA.auth.signInWithPassword({ email: config.CATEGORY_02A_USER_A_EMAIL, password: config.CATEGORY_02A_USER_A_PASSWORD }),
      authB.auth.signInWithPassword({ email: config.CATEGORY_02A_USER_B_EMAIL, password: config.CATEGORY_02A_USER_B_PASSWORD }),
    ]);
    if (signInA.error || signInB.error || !signInA.data.user || !signInB.data.user || !signInA.data.session || !signInB.data.session) {
      record(results, 'Two distinct disposable users authenticate', 'FAIL', 'AUTHENTICATION_FAILED; confirm both accounts and email addresses locally');
      process.exitCode = 1;
      return;
    }
    const userA = signInA.data.user;
    const userB = signInB.data.user;
    requireCondition(userA.id !== userB.id);
    ctxA = { url: baseUrl, key, token: signInA.data.session.access_token, user: userA };
    ctxB = { url: baseUrl, key, token: signInB.data.session.access_token, user: userB };
    record(results, 'Two distinct disposable users authenticate', 'PASS');

    await check(results, 'Fresh Auth client restores User A session', async () => {
      const fresh = newClient(baseUrl, key);
      const { error } = await fresh.auth.setSession({ access_token: signInA.data.session.access_token, refresh_token: signInA.data.session.refresh_token });
      requireCondition(!error);
      const { data, error: userError } = await fresh.auth.getUser();
      requireCondition(!userError && data.user?.id === userA.id);
    });

    await check(results, 'Invalid password is rejected', async () => {
      const probe = newClient(baseUrl, key);
      const { error } = await probe.auth.signInWithPassword({ email: config.CATEGORY_02A_USER_A_EMAIL, password: `invalid-${uuid()}` });
      requireCondition(Boolean(error) && error.status === 400);
    });

    await check(results, 'Sign-out clears an authenticated session', async () => {
      const probe = newClient(baseUrl, key);
      const signedIn = await probe.auth.signInWithPassword({ email: config.CATEGORY_02A_USER_A_EMAIL, password: config.CATEGORY_02A_USER_A_PASSWORD });
      requireCondition(!signedIn.error);
      const { error } = await probe.auth.signOut();
      requireCondition(!error);
      const { data } = await probe.auth.getSession();
      requireCondition(!data.session);
    });
    record(results, 'Protected application routes', 'SKIP', 'requires manual browser verification; this runner exercises hosted APIs only');
    record(results, 'Volatile failed-save, retry, and copy/download recovery UI', 'SKIP', 'covered by local timer unit tests; hosted UI save remains blocked until a real scramble source exists');

    await check(results, 'Auth trigger initialized profile and settings for both users', async () => {
      for (const ctx of [ctxA, ctxB]) {
        const profile = await getRows(ctx, 'profiles', { id: rowId(ctx.user.id), select: 'id,display_name' });
        const settings = await getRows(ctx, 'user_settings', { user_id: rowId(ctx.user.id), select: 'user_id,theme,settings_json' });
        requireCondition(profile.response.ok && Array.isArray(profile.data) && profile.data.length === 1);
        requireCondition(settings.response.ok && Array.isArray(settings.data) && settings.data.length === 1);
      }
    });

    let proceed = false;
    try { proceed = await confirmCreation(runId); }
    catch { record(results, 'Interactive hosted-data confirmation', 'FAIL', 'PROMPT_ERROR'); }
    testDataAuthorized = proceed;
    if (!proceed) {
      record(results, 'Hosted disposable records and Storage checks', 'SKIP', 'explicit confirmation was not provided; no test data was created');
      for (const label of ['Owner-scoped CRUD and idempotency', 'Direct REST RLS probes', 'Cross-owner foreign keys and restricted solve updates', 'Private Storage owner-path and MIME checks']) record(results, label, 'SKIP');
      return;
    }

    const createdAt = new Date().toISOString();
    const sessionRowsA = [{ id: ids.sessionsA[0], owner_id: userA.id, puzzle: '333', name: `Codex 02A ${runId.slice(0, 8)} A` }];
    const sessionRowsB = ids.sessionsB.map((id) => ({ id, owner_id: userB.id, puzzle: '333', name: `Codex 02A ${runId.slice(0, 8)} B` }));
    const fixtureVersion = `category-02a-hosted-fixture-${runId}`;
    const scrambleA = { id: ids.scramblesA[0], owner_id: userA.id, puzzle: '333', notation: fixtureNotation, generator_version: fixtureVersion, created_at: createdAt };
    const scrambleB = { id: ids.scramblesB[0], owner_id: userB.id, puzzle: '333', notation: fixtureNotation, generator_version: fixtureVersion, created_at: createdAt };
    const completedAt = Date.now();
    const solve = {
      id: ids.solvesA[0], owner_id: userA.id, session_id: ids.sessionsA[0], scramble_id: scrambleA.id, puzzle: '333',
      raw_time_ms: 1839, penalty: 'none', timing_source: 'KEYBOARD', started_at: new Date(completedAt - 1839).toISOString(),
      completed_at: new Date(completedAt).toISOString(), notes: `category-02a-hosted-verification:${runId}`,
    };
    const crossFkSession = {
      id: ids.solvesB[0], owner_id: userB.id, session_id: ids.sessionsA[0], scramble_id: scrambleB.id, puzzle: '333',
      raw_time_ms: 1900, penalty: 'none', timing_source: 'KEYBOARD', started_at: solve.started_at, completed_at: solve.completed_at,
    };
    const crossFkScramble = { ...crossFkSession, id: ids.solvesB[1], session_id: ids.sessionsB[0], scramble_id: scrambleA.id };

    const createResult = await check(results, 'Create two isolated sessions, two fixed scrambles, and one solve', async () => {
      for (const row of sessionRowsA) {
        const result = await restRequest({ url: baseUrl, key, token: ctxA.token, table: 'sessions', method: 'POST', body: row });
        requireCondition(result.response.ok);
      }
      for (const row of sessionRowsB) {
        const result = await restRequest({ url: baseUrl, key, token: ctxB.token, table: 'sessions', method: 'POST', body: row });
        requireCondition(result.response.ok);
      }
      for (const [ctx, row] of [[ctxA, scrambleA], [ctxB, scrambleB]]) {
        const result = await restRequest({ url: baseUrl, key, token: ctx.token, table: 'scrambles', method: 'POST', body: row });
        requireCondition(result.response.ok);
      }
      const saved = await restRequest({ url: baseUrl, key, token: ctxA.token, table: 'solves', method: 'POST', body: solve });
      requireCondition(saved.response.ok);
    });

    if (!createResult) {
      record(results, 'Readback, retry, and remaining data-dependent checks', 'SKIP', 'base test data could not be safely prepared');
    } else {
      await check(results, 'User A reads exact solve, duration, scramble and owner/session links', async () => {
        const result = await getRows(ctxA, 'solves', { id: rowId(solve.id), select: '*' });
        requireCondition(result.response.ok && result.data.length === 1);
        const row = result.data[0];
        requireCondition(row.owner_id === userA.id && row.session_id === sessionRowsA[0].id && row.scramble_id === scrambleA.id);
        requireCondition(row.raw_time_ms === 1839 && row.penalty === 'none' && row.timing_source === 'KEYBOARD');
        requireCondition(Date.parse(row.completed_at) - Date.parse(row.started_at) === row.raw_time_ms);
        const scramble = await getRows(ctxA, 'scrambles', { id: rowId(scrambleA.id), select: '*' });
        requireCondition(scramble.response.ok && scramble.data[0]?.notation === fixtureNotation);
      });

      await check(results, 'Same-UUID retry leaves exactly one matching solve', async () => {
        const retried = await restRequest({ url: baseUrl, key, token: ctxA.token, table: 'solves', method: 'POST', body: solve });
        const rows = await getRows(ctxA, 'solves', { id: rowId(solve.id), select: 'id,raw_time_ms,session_id,scramble_id' });
        requireCondition(rows.response.ok && rows.data.length === 1);
        requireCondition(rows.data[0].id === solve.id && rows.data[0].raw_time_ms === solve.raw_time_ms);
        requireCondition(!retried.response.ok);
      });

      await check(results, 'Solve remains after a fresh authenticated client connection', async () => {
        const fresh = newClient(baseUrl, key);
        let freshSignIn;
        try {
          freshSignIn = await fresh.auth.signInWithPassword({
            email: config.CATEGORY_02A_USER_A_EMAIL,
            password: config.CATEGORY_02A_USER_A_PASSWORD,
          });
        } catch {
          requireCondition(false, 'FRESH_SIGN_IN_NETWORK_ERROR');
        }
        const authIssue = freshAuthDiagnostic({
          error: freshSignIn.error,
          user: freshSignIn.data?.user,
          session: freshSignIn.data?.session,
          expectedUserId: userA.id,
        });
        requireCondition(authIssue === null, authIssue ?? 'FRESH_SIGN_IN_FAILED');

        let rows;
        try {
          rows = await getRows({ url: baseUrl, key, token: freshSignIn.data.session.access_token }, 'solves', {
            id: rowId(solve.id), select: 'id,raw_time_ms',
          });
        } catch {
          requireCondition(false, 'PERSISTENCE_NETWORK_ERROR');
        }
        const readIssue = persistenceReadDiagnostic({
          responseOk: rows.response.ok,
          status: rows.response.status,
          data: rows.data,
          solveId: solve.id,
          expectedDuration: solve.raw_time_ms,
        });
        requireCondition(readIssue === null, readIssue ?? 'PERSISTENCE_READ_FAILED');
      });

      await check(results, 'User A and User B can read their own sessions and scrambles', async () => {
        for (const [ctx, sessionId, scrambleId] of [[ctxA, ids.sessionsA[0], scrambleA.id], [ctxB, ids.sessionsB[0], scrambleB.id]]) {
          const sessions = await getRows(ctx, 'sessions', { id: rowId(sessionId), select: 'id,owner_id' });
          const scrambles = await getRows(ctx, 'scrambles', { id: rowId(scrambleId), select: 'id,owner_id' });
          requireCondition(sessions.response.ok && sessions.data.length === 1 && sessions.data[0].owner_id === ctx.user.id);
          requireCondition(scrambles.response.ok && scrambles.data.length === 1 && scrambles.data[0].owner_id === ctx.user.id);
        }
      });

      await check(results, 'User B cannot read User A session, scramble, or solve rows', async () => {
        for (const [table, id] of [['sessions', ids.sessionsA[0]], ['scrambles', scrambleA.id], ['solves', solve.id]]) {
          const result = await getRows(ctxB, table, { id: rowId(id), select: 'id' });
          requireCondition(result.response.ok && Array.isArray(result.data) && result.data.length === 0);
        }
      });

      await check(results, 'User B cannot modify User A session or scramble', async () => {
        const sessionEdit = await restRequest({ url: baseUrl, key, token: ctxB.token, table: 'sessions', filters: { id: rowId(ids.sessionsA[0]) }, method: 'PATCH', body: { name: 'unauthorized-session-edit' } });
        requireCondition(!sessionEdit.response.ok || !Array.isArray(sessionEdit.data) || sessionEdit.data.length === 0);
        const scrambleEdit = await restRequest({ url: baseUrl, key, token: ctxB.token, table: 'scrambles', filters: { id: rowId(scrambleA.id) }, method: 'PATCH', body: { notation: 'R U' } });
        requireCondition(!scrambleEdit.response.ok);
        const session = await getRows(ctxA, 'sessions', { id: rowId(ids.sessionsA[0]), select: 'id,name' });
        const scramble = await getRows(ctxA, 'scrambles', { id: rowId(scrambleA.id), select: 'id,notation' });
        requireCondition(session.data[0]?.name === sessionRowsA[0].name);
        requireCondition(scramble.data[0]?.notation === fixtureNotation);
      });

      await check(results, 'Anonymous REST cannot read or insert owned rows', async () => {
        const anonymous = { url: baseUrl, key, token: key };
        for (const [table, filters] of [
          ['profiles', { id: rowId(userA.id), select: 'id' }],
          ['user_settings', { user_id: rowId(userA.id), select: 'user_id' }],
          ['sessions', { id: rowId(ids.sessionsA[0]), select: 'id' }],
          ['scrambles', { id: rowId(scrambleA.id), select: 'id' }],
          ['solves', { id: rowId(solve.id), select: 'id' }],
        ]) {
          const read = await getRows(anonymous, table, filters);
          requireCondition(!read.response.ok || (Array.isArray(read.data) && read.data.length === 0));
        }
        const anonCandidate = { id: ids.sessionsA[1], owner_id: userA.id, puzzle: '333', name: `anonymous-insert-${runId}` };
        const insert = await restRequest({ url: baseUrl, key, token: key, table: 'sessions', method: 'POST', body: anonCandidate });
        requireCondition(!insert.response.ok);
      });

      await check(results, 'User B cannot insert a row owned by User A', async () => {
        const candidate = { id: ids.sessionsA[2], owner_id: userA.id, puzzle: '333', name: `forbidden-${runId}` };
        const result = await restRequest({ url: baseUrl, key, token: ctxB.token, table: 'sessions', method: 'POST', body: candidate });
        requireCondition(!result.response.ok);
      });

      await check(results, 'Profiles and settings are initialized and isolated by owner', async () => {
        const bProfile = await getRows(ctxB, 'profiles', { id: rowId(userA.id), select: 'id,display_name' });
        const bSettings = await getRows(ctxB, 'user_settings', { user_id: rowId(userA.id), select: 'user_id,theme' });
        requireCondition(bProfile.response.ok && bProfile.data.length === 0);
        requireCondition(bSettings.response.ok && bSettings.data.length === 0);
        const profileA = await getRows(ctxA, 'profiles', { id: rowId(userA.id), select: 'id,display_name' });
        const settingsA = await getRows(ctxA, 'user_settings', { user_id: rowId(userA.id), select: 'user_id,theme' });
        requireCondition(profileA.data.length === 1 && settingsA.data.length === 1);
        accountSnapshot = { displayName: profileA.data[0].display_name, theme: settingsA.data[0].theme };
        const profileName = profileA.data[0].display_name;
        const profilePatch = await restRequest({ url: baseUrl, key, token: ctxB.token, table: 'profiles', filters: { id: rowId(userA.id) }, method: 'PATCH', body: { display_name: `unauthorized-${runId}` } });
        requireCondition(!profilePatch.response.ok || !Array.isArray(profilePatch.data) || profilePatch.data.length === 0);
        const before = settingsA.data[0].theme;
        const patch = await restRequest({ url: baseUrl, key, token: ctxB.token, table: 'user_settings', filters: { user_id: rowId(userA.id) }, method: 'PATCH', body: { theme: before === 'dark' ? 'light' : 'dark' } });
        requireCondition(!patch.response.ok || !Array.isArray(patch.data) || patch.data.length === 0);
        const after = await getRows(ctxA, 'user_settings', { user_id: rowId(userA.id), select: 'user_id,theme' });
        const profileAfter = await getRows(ctxA, 'profiles', { id: rowId(userA.id), select: 'id,display_name' });
        requireCondition(after.data[0]?.theme === before);
        requireCondition(profileAfter.data[0]?.display_name === profileName);
      });

      await check(results, 'Cross-owner session and scramble references are rejected by foreign keys', async () => {
        for (const candidate of [crossFkSession, crossFkScramble]) {
          const result = await restRequest({ url: baseUrl, key, token: ctxB.token, table: 'solves', method: 'POST', body: candidate });
          requireCondition(!result.response.ok);
        }
      });

      await check(results, 'Solve updates permit penalty but reject evidence-field changes', async () => {
        const mutable = await restRequest({ url: baseUrl, key, token: ctxA.token, table: 'solves', filters: { id: rowId(solve.id) }, method: 'PATCH', body: { penalty: 'plus2' } });
        requireCondition(mutable.response.ok && Array.isArray(mutable.data) && mutable.data.length === 1);
        const restore = await restRequest({ url: baseUrl, key, token: ctxA.token, table: 'solves', filters: { id: rowId(solve.id) }, method: 'PATCH', body: { penalty: 'none' } });
        requireCondition(restore.response.ok);
        const restricted = await restRequest({ url: baseUrl, key, token: ctxA.token, table: 'solves', filters: { id: rowId(solve.id) }, method: 'PATCH', body: { raw_time_ms: solve.raw_time_ms + 1 } });
        requireCondition(!restricted.response.ok);
        const bPatch = await restRequest({ url: baseUrl, key, token: ctxB.token, table: 'solves', filters: { id: rowId(solve.id) }, method: 'PATCH', body: { penalty: 'plus2' } });
        requireCondition(!bPatch.response.ok || !Array.isArray(bPatch.data) || bPatch.data.length === 0);
        const unchanged = await getRows(ctxA, 'solves', { id: rowId(solve.id), select: 'id,raw_time_ms,penalty' });
        requireCondition(unchanged.data.length === 1 && unchanged.data[0].raw_time_ms === solve.raw_time_ms && unchanged.data[0].penalty === 'none');
      });

      await check(results, 'User B cannot delete User A solve', async () => {
        const deleted = await restRequest({ url: baseUrl, key, token: ctxB.token, table: 'solves', filters: { id: rowId(solve.id) }, method: 'DELETE' });
        requireCondition(!deleted.response.ok || !Array.isArray(deleted.data) || deleted.data.length === 0);
        const stillThere = await getRows(ctxA, 'solves', { id: rowId(solve.id), select: 'id' });
        requireCondition(stillThere.response.ok && stillThere.data.length === 1);
      });

      storageObjectPath = `${userA.id}/${runId}/fixture.webm`;
      const invalidMimePath = `${userA.id}/${runId}/not-video.txt`;
      const objectPaths = [storageObjectPath, invalidMimePath];
      const tinyWebm = new Blob([new Uint8Array([0x1a, 0x45, 0xdf, 0xa3])], { type: 'video/webm' });
      const objectKey = (path) => path.split('/').map(encodeURIComponent).join('/');

      await check(results, 'Private recordings bucket accepts User A path and denies anonymous reads', async () => {
        const uploaded = await authA.storage.from('recordings').upload(storageObjectPath, tinyWebm, { contentType: 'video/webm', upsert: false });
        requireCondition(!uploaded.error);
        const anonymousRead = await globalThis.fetch(`${baseUrl}/storage/v1/object/public/recordings/${objectKey(storageObjectPath)}`, { headers: { apikey: key } });
        requireCondition(!anonymousRead.ok);
        const anonymous = newClient(baseUrl, key);
        const anonymousUploadPath = `${userA.id}/${runId}/anonymous.webm`;
        const anonymousUpload = await anonymous.storage.from('recordings').upload(anonymousUploadPath, tinyWebm, { contentType: 'video/webm', upsert: false });
        requireCondition(Boolean(anonymousUpload.error));
      });

      await check(results, 'Recordings object denies User B read, upload, update, and delete', async () => {
        const deniedRead = await authB.storage.from('recordings').download(storageObjectPath);
        requireCondition(Boolean(deniedRead.error));
        const crossUpload = await authB.storage.from('recordings').upload(`${userA.id}/${runId}/cross-user.webm`, tinyWebm, { contentType: 'video/webm', upsert: false });
        objectPaths.push(`${userA.id}/${runId}/cross-user.webm`);
        requireCondition(Boolean(crossUpload.error));
        const alteredWebm = new Blob([new Uint8Array([0, 1, 2, 3])], { type: 'video/webm' });
        const crossUpdate = await authB.storage.from('recordings').update(storageObjectPath, alteredWebm, { contentType: 'video/webm' });
        requireCondition(Boolean(crossUpdate.error));
        const crossDelete = await authB.storage.from('recordings').remove([storageObjectPath]);
        requireCondition(Boolean(crossDelete.error) || crossDelete.data.length === 0);
        const stillOwned = await authA.storage.from('recordings').download(storageObjectPath);
        requireCondition(!stillOwned.error);
        requireCondition(Buffer.from(await stillOwned.data.arrayBuffer()).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])));
      });

      await check(results, 'Recordings bucket rejects disallowed MIME type', async () => {
        const result = await authA.storage.from('recordings').upload(invalidMimePath, new Blob(['not video'], { type: 'text/plain' }), { contentType: 'text/plain', upsert: false });
        requireCondition(Boolean(result.error));
      });
      record(results, 'Recordings 50 MiB size limit', 'SKIP', `a limit+1 upload would transmit ${maxStorageBytes + 1} bytes; verify the configured limit in the Supabase Dashboard`);
    }
  } catch (error) {
    record(results, 'Hosted verification workflow', 'FAIL', safeErrorTag(error));
    process.exitCode = 1;
  } finally {
    if (ctxA && ctxB && testDataAuthorized) {
      let accountRestoreOk = true;
      if (accountSnapshot) {
        try {
          const profile = await getRows(ctxA, 'profiles', { id: rowId(ctxA.user.id), select: 'id,display_name' });
          const settings = await getRows(ctxA, 'user_settings', { user_id: rowId(ctxA.user.id), select: 'user_id,theme' });
          if (profile.data?.[0]?.display_name !== accountSnapshot.displayName) {
            const restored = await restRequest({ url: baseUrl, key, token: ctxA.token, table: 'profiles', filters: { id: rowId(ctxA.user.id) }, method: 'PATCH', body: { display_name: accountSnapshot.displayName } });
            accountRestoreOk = accountRestoreOk && restored.response.ok;
          }
          if (settings.data?.[0]?.theme !== accountSnapshot.theme) {
            const restored = await restRequest({ url: baseUrl, key, token: ctxA.token, table: 'user_settings', filters: { user_id: rowId(ctxA.user.id) }, method: 'PATCH', body: { theme: accountSnapshot.theme } });
            accountRestoreOk = accountRestoreOk && restored.response.ok;
          }
        } catch { accountRestoreOk = false; }
      }
      const cleanupChecks = [];
      for (const id of ids.solvesA) cleanupChecks.push(removeOwn(ctxA, 'solves', id, ctxA.user.id));
      for (const id of ids.solvesB) cleanupChecks.push(removeOwn(ctxB, 'solves', id, ctxB.user.id));
      for (const id of ids.scramblesA) cleanupChecks.push(removeOwn(ctxA, 'scrambles', id, ctxA.user.id));
      for (const id of ids.scramblesB) cleanupChecks.push(removeOwn(ctxB, 'scrambles', id, ctxB.user.id));
      for (const id of ids.sessionsA) cleanupChecks.push(removeOwn(ctxA, 'sessions', id, ctxA.user.id));
      for (const id of ids.sessionsB) cleanupChecks.push(removeOwn(ctxB, 'sessions', id, ctxB.user.id));
      const cleanupResults = await Promise.allSettled(cleanupChecks);
      const cleanupOk = accountRestoreOk && cleanupResults.every((result) => result.status === 'fulfilled' && result.value.response.ok);
      if (storageObjectPath) {
        const storageCleanupOk = await (async () => {
          try {
          const ownPaths = [storageObjectPath, `${ctxA.user.id}/${runId}/not-video.txt`, `${ctxA.user.id}/${runId}/cross-user.webm`, `${ctxA.user.id}/${runId}/anonymous.webm`];
          const removed = await authA.storage.from('recordings').remove(ownPaths);
            return !removed.error;
          } catch { return false; }
        })();
        record(results, 'Cleanup of generated Storage objects', storageCleanupOk ? 'PASS' : 'FAIL', storageCleanupOk ? '' : 'CLEANUP_FAILED');
        if (!storageCleanupOk) process.exitCode = 1;
      }
      record(results, 'Cleanup of generated database rows', cleanupOk ? 'PASS' : 'FAIL', cleanupOk ? '' : 'one or more generated IDs could not be removed by their owner');
      if (!cleanupOk) process.exitCode = 1;
    }
    if (authA) await authA.auth.signOut().catch(() => undefined);
    if (authB) await authB.auth.signOut().catch(() => undefined);
    const counts = Object.fromEntries(['PASS', 'FAIL', 'SKIP'].map((status) => [status, results.filter((item) => item.status === status).length]));
    console.log(`\nResult: PASS ${counts.PASS} | FAIL ${counts.FAIL} | SKIP ${counts.SKIP}`);
    if (counts.FAIL > 0) process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(() => {
    console.error('Runner stopped safely after an unexpected error. No credentials or response bodies were printed.');
    process.exitCode = 1;
  });
}

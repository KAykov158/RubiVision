import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database/database.types';
import type { AppServices, Penalty, Scramble, ScrambleHistoryFilter, ScrambleHistoryPage, ScrambleGenerationMethod, ServiceResult, Session, Solve, SolveListFilter, ThemePreference } from '../domain/contracts';
import { scrambleService } from '../../features/scrambles/scrambleService';
import { unavailable, serviceFailure } from './serviceErrors';

type Client = SupabaseClient<Database>;
const PAGE_SIZE = 500;
const MAX_ROWS = 50_000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PUZZLES = new Set(['222', '333', '444', '555', '666', '777']);
const PENALTIES = new Set(['NONE', 'PLUS_TWO', 'DNF']);
const TIMING_SOURCES = new Set(['KEYBOARD', 'TOUCH', 'SMART_CUBE']);
const GENERATION_METHODS = new Set<ScrambleGenerationMethod>(['RANDOM_STATE', 'RANDOM_MOVE']);
const HISTORY_DEFAULT_PAGE_SIZE = 25;
const HISTORY_MAX_PAGE_SIZE = 50;

function toDomainPenalty(value: string): Penalty | null {
  switch (value) {
    case 'none': return 'NONE';
    case 'plus2': return 'PLUS_TWO';
    case 'dnf': return 'DNF';
    default: return null;
  }
}

function toDomainSolve(row: Database['public']['Tables']['solves']['Row']): Solve | null {
  const penalty = toDomainPenalty(row.penalty);
  if (!penalty) return null;
  return {
    id: row.id,
    sessionId: row.session_id,
    scrambleId: row.scramble_id,
    puzzle: row.puzzle as Solve['puzzle'],
    rawTimeMs: row.raw_time_ms,
    penalty,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    timingSource: row.timing_source as Solve['timingSource'],
    ...(row.notes === null ? {} : { notes: row.notes }),
  };
}

function toDomainScramble(row: Database['public']['Tables']['scrambles']['Row']): Scramble | null {
  if (!PUZZLES.has(row.puzzle)
    || !row.notation.trim()
    || row.notation.length > 4096
    || !row.generator_version.trim()
    || row.generator_version.length > 128
    || !Number.isFinite(Date.parse(row.created_at))
    || (row.generator_provider !== null && (!row.generator_provider.trim() || row.generator_provider.length > 128))
    || (row.generation_method !== null && !GENERATION_METHODS.has(row.generation_method as ScrambleGenerationMethod))) return null;
  return {
    id: row.id,
    puzzle: row.puzzle as Scramble['puzzle'],
    notation: row.notation,
    generatorVersion: row.generator_version,
    createdAt: row.created_at,
    ...(row.generator_provider === null ? {} : { generatorProvider: row.generator_provider }),
    ...(row.generation_method === null ? {} : { generationMethod: row.generation_method as ScrambleGenerationMethod }),
  };
}

function isMissingProvenanceColumns(error: { code?: string; message?: string } | null) {
  if (!error || !['42703', 'PGRST204'].includes(error.code ?? '')) return false;
  const message = error.message ?? '';
  if (error.code === 'PGRST204') {
    return /could not find the ['"]?(?:generator_provider|generation_method)['"]? column of ['"]?scrambles['"]? in the schema cache/i.test(message);
  }
  return /column ['"]?(?:generator_provider|generation_method)['"]? of relation ['"]?scrambles['"]? does not exist/i.test(message);
}

function fromDomainPenalty(value: Penalty) {
  switch (value) {
    case 'NONE': return 'none';
    case 'PLUS_TWO': return 'plus2';
    case 'DNF': return 'dnf';
  }
}

function isValidSolve(solve: Solve) {
  const start = Date.parse(solve.startedAt);
  const completed = Date.parse(solve.completedAt);
  return UUID.test(solve.id)
    && UUID.test(solve.sessionId)
    && UUID.test(solve.scrambleId)
    && PUZZLES.has(solve.puzzle)
    && Number.isSafeInteger(solve.rawTimeMs)
    && solve.rawTimeMs >= 0
    && solve.rawTimeMs <= 2_147_483_647
    && PENALTIES.has(solve.penalty)
    && TIMING_SOURCES.has(solve.timingSource)
    && Number.isFinite(start)
    && Number.isFinite(completed)
    && completed >= start
    && (solve.notes === undefined || solve.notes.length <= 10_000);
}

async function getOwnerId(client: Client, expectedOwnerId?: string): Promise<{ ownerId: string } | { failure: ServiceResult<never> }> {
  const { data, error } = await client.auth.getUser();
  if (error) return { failure: serviceFailure(error) };
  if (!data.user) return { failure: unavailable('AUTH_REQUIRED') };
  if (expectedOwnerId && data.user.id !== expectedOwnerId) {
    return { failure: { status: 'error', code: 'FORBIDDEN', message: 'The active account does not match the account that started this solve.' } };
  }
  return { ownerId: data.user.id };
}

export function createSupabaseRepositories(client: Client) {
  const scrambles = {
    async save(scramble: Scramble, expectedOwnerId?: string): Promise<ServiceResult<void>> {
      const owner = await getOwnerId(client, expectedOwnerId);
      if ('failure' in owner) return owner.failure;
      if (!UUID.test(scramble.id)
        || !PUZZLES.has(scramble.puzzle)
        || !scramble.notation.trim()
        || scramble.notation.length > 4096
        || !scramble.generatorVersion.trim()
        || scramble.generatorVersion.length > 128
        || (scramble.generatorProvider !== undefined && (!scramble.generatorProvider.trim() || scramble.generatorProvider.length > 128))
        || (scramble.generationMethod !== undefined && !GENERATION_METHODS.has(scramble.generationMethod))
        || !Number.isFinite(Date.parse(scramble.createdAt))) {
        return { status: 'error', code: 'INVALID_INPUT', message: 'Scramble fields are invalid.' };
      }
      const legacyInsert = {
        id: scramble.id,
        owner_id: owner.ownerId,
        puzzle: scramble.puzzle,
        notation: scramble.notation,
        generator_version: scramble.generatorVersion,
        created_at: scramble.createdAt,
      };
      const { error } = await client.from('scrambles').insert({
        ...legacyInsert,
        generator_provider: scramble.generatorProvider ?? null,
        generation_method: scramble.generationMethod ?? null,
      });
      if (!error) return { status: 'success', data: undefined };
      if (isMissingProvenanceColumns(error)) {
        // Older hosted schemas have neither optional provenance column. Retry
        // the exact same immutable scramble identity with the original schema.
        const { error: legacyError } = await client.from('scrambles').insert(legacyInsert);
        if (!legacyError) return { status: 'success', data: undefined };
        if (legacyError.code === '23505') {
          const { data: saved, error: readError } = await client.from('scrambles')
            .select('id,owner_id,puzzle,notation,generator_version,created_at')
            .eq('id', scramble.id)
            .maybeSingle();
          if (!readError && saved
            && saved.owner_id === owner.ownerId
            && saved.puzzle === scramble.puzzle
            && saved.notation === scramble.notation
            && saved.generator_version === scramble.generatorVersion
            && Date.parse(saved.created_at) === Date.parse(scramble.createdAt)) {
            return { status: 'success', data: undefined };
          }
        }
        return serviceFailure(legacyError);
      }
      if (error.code === '23505') {
        const { data: saved, error: readError } = await client.from('scrambles')
          .select('id,owner_id,puzzle,notation,generator_provider,generator_version,generation_method,created_at')
          .eq('id', scramble.id)
          .maybeSingle();
        if (!readError && saved
          && saved.owner_id === owner.ownerId
          && saved.puzzle === scramble.puzzle
          && saved.notation === scramble.notation
          && saved.generator_provider === (scramble.generatorProvider ?? null)
          && saved.generator_version === scramble.generatorVersion
          && saved.generation_method === (scramble.generationMethod ?? null)
          && Date.parse(saved.created_at) === Date.parse(scramble.createdAt)) {
          return { status: 'success', data: undefined };
        }
      }
      return serviceFailure(error);
    },
    async get(id: string, expectedOwnerId?: string): Promise<ServiceResult<Scramble | null>> {
      if (!UUID.test(id)) return { status: 'error', code: 'INVALID_INPUT', message: 'Scramble ID is invalid.' };
      const owner = await getOwnerId(client, expectedOwnerId);
      if ('failure' in owner) return owner.failure;
      const { data, error } = await client.from('scrambles')
        .select('id,owner_id,puzzle,notation,generator_provider,generator_version,generation_method,created_at')
        .eq('id', id)
        .eq('owner_id', owner.ownerId)
        .maybeSingle();
      if (error) return serviceFailure(error);
      if (!data) return { status: 'success', data: null };
      const scramble = toDomainScramble(data);
      return scramble
        ? { status: 'success', data: scramble }
        : { status: 'error', code: 'UNKNOWN', message: 'Stored scramble data is invalid.' };
    },
    async listHistory(filter: ScrambleHistoryFilter, expectedOwnerId: string): Promise<ServiceResult<ScrambleHistoryPage>> {
      if (!expectedOwnerId || (filter.puzzle !== undefined && !PUZZLES.has(filter.puzzle))) {
        return { status: 'error', code: 'INVALID_INPUT', message: 'Scramble history filters are invalid.' };
      }
      const limit = filter.limit ?? HISTORY_DEFAULT_PAGE_SIZE;
      if (!Number.isInteger(limit) || limit < 1 || limit > HISTORY_MAX_PAGE_SIZE) {
        return { status: 'error', code: 'INVALID_INPUT', message: 'Scramble history page size is invalid.' };
      }
      const fromTime = filter.from === undefined ? undefined : Date.parse(filter.from);
      const throughTime = filter.through === undefined ? undefined : Date.parse(filter.through);
      const invalidCursor = filter.cursor !== undefined
        && (!UUID.test(filter.cursor.solveId) || !Number.isFinite(Date.parse(filter.cursor.savedAt)));
      if ((filter.from !== undefined && !Number.isFinite(fromTime))
        || (filter.through !== undefined && !Number.isFinite(throughTime))
        || (fromTime !== undefined && throughTime !== undefined && fromTime > throughTime)
        || invalidCursor) {
        return { status: 'error', code: 'INVALID_INPUT', message: 'Scramble history filters are invalid.' };
      }

      const owner = await getOwnerId(client, expectedOwnerId);
      if ('failure' in owner) return owner.failure;
      let query = client.from('solves').select('id,scramble_id,puzzle,created_at')
        .eq('owner_id', owner.ownerId)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false });
      if (filter.puzzle) query = query.eq('puzzle', filter.puzzle);
      if (filter.from) query = query.gte('created_at', new Date(Date.parse(filter.from)).toISOString());
      if (filter.through) query = query.lte('created_at', new Date(Date.parse(filter.through)).toISOString());
      if (filter.cursor) {
        const cursorTime = new Date(Date.parse(filter.cursor.savedAt)).toISOString();
        query = query.or(`created_at.lt.${cursorTime},and(created_at.eq.${cursorTime},id.lt.${filter.cursor.solveId})`);
      }
      const { data: solveRows, error: solveError } = await query.limit(limit + 1);
      if (solveError) return serviceFailure(solveError);
      const pageRows = solveRows.slice(0, limit);
      if (pageRows.length === 0) return { status: 'success', data: { entries: [], nextCursor: null } };

      // Recheck the active account before the second query so a mid-request
      // account switch cannot mix one account's solve page with another's data.
      const currentOwner = await getOwnerId(client, expectedOwnerId);
      if ('failure' in currentOwner) return currentOwner.failure;
      const scrambleIds = pageRows.map((row) => row.scramble_id);
      let { data: scrambleRows, error: scrambleError } = await client.from('scrambles')
        .select('id,owner_id,puzzle,notation,generator_provider,generator_version,generation_method,created_at')
        .eq('owner_id', currentOwner.ownerId)
        .in('id', scrambleIds);
      if (isMissingProvenanceColumns(scrambleError)) {
        const legacy = await client.from('scrambles')
          .select('id,owner_id,puzzle,notation,generator_version,created_at')
          .eq('owner_id', currentOwner.ownerId)
          .in('id', scrambleIds);
        scrambleError = legacy.error;
        scrambleRows = legacy.data?.map((row) => ({ ...row, generator_provider: null, generation_method: null })) ?? null;
      }
      if (scrambleError || !scrambleRows) return serviceFailure(scrambleError ?? { message: 'Scramble history returned no data.' });
      const finalOwner = await getOwnerId(client, expectedOwnerId);
      if ('failure' in finalOwner) return finalOwner.failure;
      const byId = new Map<string, Scramble>();
      for (const row of scrambleRows) {
        if (row.owner_id !== currentOwner.ownerId) return { status: 'error', code: 'FORBIDDEN' };
        const scramble = toDomainScramble(row);
        if (!scramble || byId.has(scramble.id)) {
          return { status: 'error', code: 'UNKNOWN', message: 'Stored scramble history data is invalid.' };
        }
        byId.set(scramble.id, scramble);
      }
      const entries = pageRows.map((row) => {
        const scramble = byId.get(row.scramble_id);
        return scramble && scramble.puzzle === row.puzzle
          ? { scramble, savedAt: row.created_at, solveId: row.id }
          : null;
      });
      if (entries.some((entry) => entry === null)) {
        return { status: 'error', code: 'UNKNOWN', message: 'A saved scramble could not be loaded.' };
      }
      const last = pageRows.at(-1);
      return { status: 'success', data: {
        entries: entries as ScrambleHistoryPage['entries'],
        nextCursor: solveRows.length > limit && last ? { savedAt: last.created_at, solveId: last.id } : null,
      } };
    },
  };

  const solves = {
    async save(solve: Solve, expectedOwnerId?: string): Promise<ServiceResult<void>> {
      const owner = await getOwnerId(client, expectedOwnerId);
      if ('failure' in owner) return owner.failure;
      if (!isValidSolve(solve)) {
        return { status: 'error', code: 'INVALID_INPUT', message: 'Solve fields are invalid.' };
      }
      const { error } = await client.from('solves').insert({
        id: solve.id,
        owner_id: owner.ownerId,
        session_id: solve.sessionId,
        scramble_id: solve.scrambleId,
        puzzle: solve.puzzle,
        raw_time_ms: solve.rawTimeMs,
        penalty: fromDomainPenalty(solve.penalty),
        timing_source: solve.timingSource,
        started_at: solve.startedAt,
        completed_at: solve.completedAt,
        notes: solve.notes ?? null,
      });
      if (!error) return { status: 'success', data: undefined };
      if (error.code === '23505') {
        const { data: saved, error: readError } = await client.from('solves').select(
          'id,session_id,scramble_id,puzzle,raw_time_ms,timing_source,started_at,completed_at',
        ).eq('id', solve.id).maybeSingle();
        if (!readError && saved
          && saved.session_id === solve.sessionId
          && saved.scramble_id === solve.scrambleId
          && saved.puzzle === solve.puzzle
          && saved.raw_time_ms === solve.rawTimeMs
          && saved.timing_source === solve.timingSource
          && Date.parse(saved.started_at) === Date.parse(solve.startedAt)
          && Date.parse(saved.completed_at) === Date.parse(solve.completedAt)) {
          return { status: 'success', data: undefined };
        }
      }
      return serviceFailure(error);
    },
    async get(id: string): Promise<ServiceResult<Solve | null>> {
      const { data, error } = await client.from('solves').select('*').eq('id', id).maybeSingle();
      if (error) return serviceFailure(error);
      if (!data) return { status: 'success', data: null };
      const solve = toDomainSolve(data);
      return solve ? { status: 'success', data: solve } : { status: 'error', code: 'UNKNOWN', message: 'Stored solve penalty is unsupported.' };
    },
    async list(filter?: SolveListFilter): Promise<ServiceResult<Solve[]>> {
      const result: Solve[] = [];
      for (let from = 0; from < MAX_ROWS; from += PAGE_SIZE) {
        let query = client.from('solves').select('*').order('created_at', { ascending: false }).order('id', { ascending: false }).range(from, from + PAGE_SIZE - 1);
        if (filter?.sessionId) query = query.eq('session_id', filter.sessionId);
        if (filter?.puzzle) query = query.eq('puzzle', filter.puzzle);
        const { data, error } = await query;
        if (error) return serviceFailure(error);
        const mapped = data.map(toDomainSolve);
        if (mapped.some((solve) => solve === null)) return { status: 'error', code: 'UNKNOWN', message: 'Stored solve data is invalid.' };
        result.push(...mapped as Solve[]);
        if (data.length < PAGE_SIZE) return { status: 'success', data: result };
      }
      return { status: 'error', code: 'UNKNOWN', message: 'Solve history exceeds the safe pagination limit.' };
    },
    async updatePenalty(id: string, penalty: Penalty): Promise<ServiceResult<void>> {
      const { data, error } = await client.from('solves').update({ penalty: fromDomainPenalty(penalty) }).eq('id', id).select('id').maybeSingle();
      if (error) return serviceFailure(error);
      return data ? { status: 'success', data: undefined } : { status: 'error', code: 'NOT_FOUND', message: 'Solve was not found.' };
    },
  };

  const sessions = {
    async list(expectedOwnerId?: string): Promise<ServiceResult<Session[]>> {
      const owner = await getOwnerId(client, expectedOwnerId);
      if ('failure' in owner) return owner.failure;
      let query = client.from('sessions').select('id,name,puzzle,created_at,updated_at');
      if (expectedOwnerId) query = query.eq('owner_id', expectedOwnerId);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) return serviceFailure(error);
      return { status: 'success', data: data.map((row) => ({ id: row.id, name: row.name, puzzle: row.puzzle as Session['puzzle'], createdAt: row.created_at, updatedAt: row.updated_at })) };
    },
    async create(name: string, puzzle: Session['puzzle'], expectedOwnerId?: string): Promise<ServiceResult<Session>> {
      const owner = await getOwnerId(client, expectedOwnerId);
      if ('failure' in owner) return owner.failure;
      if (!name.trim() || name.trim().length > 120 || !PUZZLES.has(puzzle)) return { status: 'error', code: 'INVALID_INPUT' };
      const { data, error } = await client.from('sessions').insert({ owner_id: owner.ownerId, name: name.trim(), puzzle }).select('id,name,puzzle,created_at,updated_at').single();
      if (error) return serviceFailure(error);
      return { status: 'success', data: { id: data.id, name: data.name, puzzle: data.puzzle as Session['puzzle'], createdAt: data.created_at, updatedAt: data.updated_at } };
    },
    async archive(id: string): Promise<ServiceResult<void>> {
      const { data, error } = await client.from('sessions').update({ is_archived: true }).eq('id', id).select('id').maybeSingle();
      if (error) return serviceFailure(error);
      return data ? { status: 'success', data: undefined } : { status: 'error', code: 'NOT_FOUND' };
    },
  };

  const preferences = {
    async getThemePreference(): Promise<ServiceResult<unknown>> {
      const { data, error } = await client.from('user_settings').select('theme').maybeSingle();
      if (error) return serviceFailure(error);
      return { status: 'success', data: data?.theme ?? null };
    },
    async saveThemePreference(theme: ThemePreference): Promise<ServiceResult<void>> {
      const owner = await getOwnerId(client);
      if ('failure' in owner) return owner.failure;
      if (!['system', 'light', 'dark'].includes(theme)) return { status: 'error', code: 'INVALID_INPUT' };
      const { error } = await client.from('user_settings').upsert({ user_id: owner.ownerId, theme }, { onConflict: 'user_id' });
      return error ? serviceFailure(error) : { status: 'success', data: undefined };
    },
  };

  return { scrambleRepository: scrambles, solves, sessions, preferences };
}

export function createSupabaseAppServices(client: Client): AppServices {
  const repositories = createSupabaseRepositories(client);
  return {
    ...repositories,
    sessions: repositories.sessions,
    scrambles: scrambleService,
    analysis: { async analyze() { return unavailable('UNSUPPORTED'); } },
  };
}

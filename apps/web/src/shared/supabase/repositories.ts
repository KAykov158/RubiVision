import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database/database.types';
import type { AppServices, Penalty, Scramble, ServiceResult, Session, Solve, SolveListFilter, ThemePreference } from '../domain/contracts';
import { unavailable, serviceFailure } from './serviceErrors';

type Client = SupabaseClient<Database>;
const PAGE_SIZE = 500;
const MAX_ROWS = 50_000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PUZZLES = new Set(['222', '333', '444', '555', '666', '777']);
const PENALTIES = new Set(['NONE', 'PLUS_TWO', 'DNF']);
const TIMING_SOURCES = new Set(['KEYBOARD', 'TOUCH', 'SMART_CUBE']);

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

async function getOwnerId(client: Client): Promise<{ ownerId: string } | { failure: ServiceResult<never> }> {
  const { data, error } = await client.auth.getUser();
  if (error) return { failure: serviceFailure(error) };
  return data.user ? { ownerId: data.user.id } : { failure: unavailable('AUTH_REQUIRED') };
}

export function createSupabaseRepositories(client: Client) {
  const scrambles = {
    async save(scramble: Scramble): Promise<ServiceResult<void>> {
      const owner = await getOwnerId(client);
      if ('failure' in owner) return owner.failure;
      if (!UUID.test(scramble.id)
        || !PUZZLES.has(scramble.puzzle)
        || !scramble.notation.trim()
        || scramble.notation.length > 4096
        || !scramble.generatorVersion.trim()
        || scramble.generatorVersion.length > 128
        || !Number.isFinite(Date.parse(scramble.createdAt))) {
        return { status: 'error', code: 'INVALID_INPUT', message: 'Scramble fields are invalid.' };
      }
      const { error } = await client.from('scrambles').insert({
        id: scramble.id,
        owner_id: owner.ownerId,
        puzzle: scramble.puzzle,
        notation: scramble.notation,
        generator_version: scramble.generatorVersion,
        created_at: scramble.createdAt,
      });
      if (!error) return { status: 'success', data: undefined };
      if (error.code === '23505') {
        const { data: saved, error: readError } = await client.from('scrambles')
          .select('id,puzzle,notation,generator_version,created_at')
          .eq('id', scramble.id)
          .maybeSingle();
        if (!readError && saved
          && saved.puzzle === scramble.puzzle
          && saved.notation === scramble.notation
          && saved.generator_version === scramble.generatorVersion
          && Date.parse(saved.created_at) === Date.parse(scramble.createdAt)) {
          return { status: 'success', data: undefined };
        }
      }
      return serviceFailure(error);
    },
  };

  const solves = {
    async save(solve: Solve): Promise<ServiceResult<void>> {
      const owner = await getOwnerId(client);
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
    async list(): Promise<ServiceResult<Session[]>> {
      const { data, error } = await client.from('sessions').select('id,name,puzzle,created_at,updated_at').order('created_at', { ascending: false });
      if (error) return serviceFailure(error);
      return { status: 'success', data: data.map((row) => ({ id: row.id, name: row.name, puzzle: row.puzzle as Session['puzzle'], createdAt: row.created_at, updatedAt: row.updated_at })) };
    },
    async create(name: string, puzzle: Session['puzzle']): Promise<ServiceResult<Session>> {
      const owner = await getOwnerId(client);
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
    scrambles: { async generate() { return unavailable('UNSUPPORTED'); } },
    analysis: { async analyze() { return unavailable('UNSUPPORTED'); } },
  };
}

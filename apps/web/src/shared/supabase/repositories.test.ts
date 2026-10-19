import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import type { Database } from '../database/database.types';
import { integrationFixtures } from '../../test/support/integrationFixtures';
import { createSupabaseRepositories } from './repositories';

const ownerId = '11111111-1111-4111-8111-111111111111';

describe('Supabase solve repository ownership', () => {
  it('queries only a bounded latest completed-solve window for the requested session and puzzle', async () => {
    const row = {
      id: integrationFixtures.solve.id,
      session_id: integrationFixtures.solve.sessionId,
      scramble_id: integrationFixtures.solve.scrambleId,
      puzzle: integrationFixtures.solve.puzzle,
      raw_time_ms: integrationFixtures.solve.rawTimeMs,
      penalty: 'plus2',
      started_at: integrationFixtures.solve.startedAt,
      completed_at: integrationFixtures.solve.completedAt,
      timing_source: integrationFixtures.solve.timingSource,
      notes: null,
    };
    const query = {
      order: vi.fn(() => query),
      range: vi.fn(() => query),
      eq: vi.fn(() => query),
      then: (resolve: (value: { data: typeof row[]; error: null }) => unknown) => Promise.resolve({ data: [row], error: null }).then(resolve),
    };
    const from = vi.fn(() => ({ select: vi.fn(() => query) }));
    const client = { from } as unknown as SupabaseClient<Database>;

    const result = await createSupabaseRepositories(client).solves.list({
      sessionId: integrationFixtures.solve.sessionId,
      puzzle: '333',
      limit: 2,
    });

    expect(result).toMatchObject({ status: 'success', data: [{ id: integrationFixtures.solve.id }] });
    expect(query.order).toHaveBeenNthCalledWith(1, 'completed_at', { ascending: false });
    expect(query.order).toHaveBeenNthCalledWith(2, 'id', { ascending: false });
    expect(query.range).toHaveBeenCalledExactlyOnceWith(0, 1);
    expect(query.eq).toHaveBeenNthCalledWith(1, 'session_id', integrationFixtures.solve.sessionId);
    expect(query.eq).toHaveBeenNthCalledWith(2, 'puzzle', '333');
  });

  it('rejects an invalid bounded solve-list limit before querying', async () => {
    const from = vi.fn();
    const client = { from } as unknown as SupabaseClient<Database>;
    const result = await createSupabaseRepositories(client).solves.list({ limit: 0 });

    expect(result).toMatchObject({ status: 'error', code: 'INVALID_INPUT' });
    expect(from).not.toHaveBeenCalled();
  });

  it('derives the inserted owner from the authenticated Supabase user', async () => {
    const insert = vi.fn(async () => ({ error: null }));
    const getUser = vi.fn(async () => ({ data: { user: { id: '11111111-1111-4111-8111-111111111111' } }, error: null }));
    const client = {
      auth: { getUser },
      from: vi.fn(() => ({ insert })),
    } as unknown as SupabaseClient<Database>;
    const solve = { ...integrationFixtures.solve };

    const result = await createSupabaseRepositories(client).solves.save(solve);

    expect(result).toEqual({ status: 'success', data: undefined });
    expect(getUser).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      id: solve.id,
      owner_id: '11111111-1111-4111-8111-111111111111',
      session_id: solve.sessionId,
      scramble_id: solve.scrambleId,
      raw_time_ms: solve.rawTimeMs,
    }));
  });

  it.each([
    ['penalty', { penalty: 'none' }],
    ['notes', { notes: 'different note' }],
  ] as const)('rejects a duplicate solve ID when the stored %s differs from the retry', async (_field, changedStoredField) => {
    const solve = { ...integrationFixtures.solve, notes: 'retry note' };
    const stored = {
      id: solve.id,
      session_id: solve.sessionId,
      scramble_id: solve.scrambleId,
      puzzle: solve.puzzle,
      raw_time_ms: solve.rawTimeMs,
      penalty: 'plus2',
      timing_source: solve.timingSource,
      started_at: solve.startedAt,
      completed_at: solve.completedAt,
      notes: 'retry note',
      ...changedStoredField,
    };
    const maybeSingle = vi.fn(async () => ({ data: stored, error: null }));
    const eq = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ eq }));
    const insert = vi.fn(async () => ({ error: { code: '23505' } }));
    const client = {
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: ownerId } }, error: null })) },
      from: vi.fn(() => ({ insert, select })),
    } as unknown as SupabaseClient<Database>;

    const result = await createSupabaseRepositories(client).solves.save(solve, ownerId);

    expect(result).toMatchObject({ status: 'error', code: 'CONFLICT' });
    expect(select).toHaveBeenCalledWith('id,session_id,scramble_id,puzzle,raw_time_ms,penalty,timing_source,started_at,completed_at,notes');
  });

  it('accepts an identical duplicate after an ambiguous first solve insert, including nullable notes', async () => {
    const solve = { ...integrationFixtures.solve };
    const stored = {
      id: solve.id,
      session_id: solve.sessionId,
      scramble_id: solve.scrambleId,
      puzzle: solve.puzzle,
      raw_time_ms: solve.rawTimeMs,
      penalty: 'plus2',
      timing_source: solve.timingSource,
      started_at: solve.startedAt,
      completed_at: solve.completedAt,
      notes: null,
    };
    const maybeSingle = vi.fn(async () => ({ data: stored, error: null }));
    const eq = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ eq }));
    const insert = vi.fn()
      .mockResolvedValueOnce({ error: { code: 'FETCH_ERROR', message: 'network request failed' } })
      .mockResolvedValueOnce({ error: { code: '23505' } });
    const client = {
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: ownerId } }, error: null })) },
      from: vi.fn(() => ({ insert, select })),
    } as unknown as SupabaseClient<Database>;
    const repository = createSupabaseRepositories(client).solves;

    const firstAttempt = await repository.save(solve, ownerId);
    const retry = await repository.save(solve, ownerId);

    expect(firstAttempt).toMatchObject({ status: 'error', code: 'NETWORK' });
    expect(retry).toEqual({ status: 'success', data: undefined });
    expect(insert).toHaveBeenCalledTimes(2);
    expect(insert).toHaveBeenNthCalledWith(1, expect.objectContaining({
      id: solve.id,
      penalty: 'plus2',
      notes: null,
    }));
    expect(insert).toHaveBeenNthCalledWith(2, expect.objectContaining({
      id: solve.id,
      penalty: 'plus2',
      notes: null,
    }));
  });

  it('does not write when Supabase reports an expired authentication session', async () => {
    const insert = vi.fn(async () => ({ error: null }));
    const from = vi.fn(() => ({ insert }));
    const client = {
      auth: { getUser: vi.fn(async () => ({ data: { user: null }, error: { status: 401 } })) },
      from,
    } as unknown as SupabaseClient<Database>;

    const result = await createSupabaseRepositories(client).solves.save({ ...integrationFixtures.solve });

    expect(result).toMatchObject({ status: 'error', code: 'FORBIDDEN' });
    expect(from).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it('persists provider and method while preserving exact scramble notation', async () => {
    const insert = vi.fn(async () => ({ error: null }));
    const scramble = {
      ...integrationFixtures.scramble,
      notation: "R  U\nR' ",
      generatorProvider: 'cubing.js',
      generationMethod: 'RANDOM_STATE' as const,
    };
    const client = {
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: ownerId } }, error: null })) },
      from: vi.fn(() => ({ insert })),
    } as unknown as SupabaseClient<Database>;

    const result = await createSupabaseRepositories(client).scrambleRepository.save(scramble, ownerId);

    expect(result).toEqual({ status: 'success', data: undefined });
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      id: scramble.id,
      owner_id: ownerId,
      notation: scramble.notation,
      generator_provider: 'cubing.js',
      generator_version: scramble.generatorVersion,
      generation_method: 'RANDOM_STATE',
    }));
  });

  it('retries only a missing optional provenance-column error with the same legacy scramble identity', async () => {
    const scramble = {
      ...integrationFixtures.scramble,
      notation: "R  U\nR' ",
      generatorProvider: 'cubing.js',
      generationMethod: 'RANDOM_STATE' as const,
    };
    const insert = vi.fn()
      .mockResolvedValueOnce({ error: {
        code: 'PGRST204',
        message: "Could not find the 'generator_provider' column of 'scrambles' in the schema cache",
      } })
      .mockResolvedValueOnce({ error: null });
    const client = {
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: ownerId } }, error: null })) },
      from: vi.fn(() => ({ insert })),
    } as unknown as SupabaseClient<Database>;

    const result = await createSupabaseRepositories(client).scrambleRepository.save(scramble, ownerId);

    expect(result).toEqual({ status: 'success', data: undefined });
    expect(insert).toHaveBeenCalledTimes(2);
    expect(insert.mock.calls[0]?.[0]).toMatchObject({
      id: scramble.id,
      owner_id: ownerId,
      puzzle: scramble.puzzle,
      notation: scramble.notation,
      generator_provider: 'cubing.js',
      generator_version: scramble.generatorVersion,
      generation_method: 'RANDOM_STATE',
      created_at: scramble.createdAt,
    });
    expect(insert.mock.calls[1]?.[0]).toEqual({
      id: scramble.id,
      owner_id: ownerId,
      puzzle: scramble.puzzle,
      notation: scramble.notation,
      generator_version: scramble.generatorVersion,
      created_at: scramble.createdAt,
    });
    expect(insert.mock.calls[1]?.[0].id).toBe(insert.mock.calls[0]?.[0].id);
    expect(insert.mock.calls[1]?.[0].notation).toBe(insert.mock.calls[0]?.[0].notation);
  });

  it('accepts an identical legacy-schema duplicate by comparing all stored scramble fields', async () => {
    const scramble = { ...integrationFixtures.scramble, generatorProvider: 'cubing.js', generationMethod: 'RANDOM_STATE' as const };
    const insert = vi.fn()
      .mockResolvedValueOnce({ error: {
        code: '42703',
        message: 'column "generation_method" of relation "scrambles" does not exist',
      } })
      .mockResolvedValueOnce({ error: { code: '23505' } });
    const maybeSingle = vi.fn(async () => ({ data: {
      id: scramble.id,
      owner_id: ownerId,
      puzzle: scramble.puzzle,
      notation: scramble.notation,
      generator_version: scramble.generatorVersion,
      created_at: scramble.createdAt,
    }, error: null }));
    const select = vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle })) }));
    const client = {
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: ownerId } }, error: null })) },
      from: vi.fn(() => ({ insert, select })),
    } as unknown as SupabaseClient<Database>;

    const result = await createSupabaseRepositories(client).scrambleRepository.save(scramble, ownerId);

    expect(result).toEqual({ status: 'success', data: undefined });
    expect(select).toHaveBeenCalledWith('id,owner_id,puzzle,notation,generator_version,created_at');
    expect(maybeSingle).toHaveBeenCalledTimes(1);
  });

  it('rejects a legacy duplicate when stored scramble data differs', async () => {
    const scramble = { ...integrationFixtures.scramble };
    const insert = vi.fn()
      .mockResolvedValueOnce({ error: {
        code: 'PGRST204',
        message: "Could not find the 'generation_method' column of 'scrambles' in the schema cache",
      } })
      .mockResolvedValueOnce({ error: { code: '23505' } });
    const maybeSingle = vi.fn(async () => ({ data: {
      id: scramble.id,
      owner_id: ownerId,
      puzzle: scramble.puzzle,
      notation: `${scramble.notation} R`,
      generator_version: scramble.generatorVersion,
      created_at: scramble.createdAt,
    }, error: null }));
    const select = vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle })) }));
    const client = {
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: ownerId } }, error: null })) },
      from: vi.fn(() => ({ insert, select })),
    } as unknown as SupabaseClient<Database>;

    const result = await createSupabaseRepositories(client).scrambleRepository.save(scramble, ownerId);

    expect(result).toMatchObject({ status: 'error', code: 'CONFLICT' });
    expect(insert).toHaveBeenCalledTimes(2);
  });

  it.each([
    [{ code: '42501', message: 'new row violates row-level security policy' }],
    [{ code: 'PGRST301', status: 401, message: 'JWT expired' }],
    [{ code: 'FETCH_ERROR', message: 'network request failed' }],
    [{ code: '42703', message: 'column "generator_provider" of relation "solves" does not exist' }],
    [{ code: 'PGRST204', message: "Could not find the 'generator_provider' column of 'sessions' in the schema cache" }],
  ])('does not use the legacy fallback for unrelated save errors %o', async (error) => {
    const insert = vi.fn(async () => ({ error }));
    const client = {
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: ownerId } }, error: null })) },
      from: vi.fn(() => ({ insert })),
    } as unknown as SupabaseClient<Database>;

    const result = await createSupabaseRepositories(client).scrambleRepository.save({ ...integrationFixtures.scramble }, ownerId);

    expect(result.status).toBe('error');
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it('returns stored provenance and exact notation on read', async () => {
    const notation = "R  U\nR' ";
    const maybeSingle = vi.fn(async () => ({ data: {
      id: integrationFixtures.scramble.id,
      owner_id: ownerId,
      puzzle: '333',
      notation,
      generator_provider: 'cubing.js',
      generator_version: '0.66.1',
      generation_method: 'RANDOM_STATE',
      created_at: integrationFixtures.scramble.createdAt,
    }, error: null }));
    const eqOwner = vi.fn(() => ({ maybeSingle }));
    const eqId = vi.fn(() => ({ eq: eqOwner }));
    const select = vi.fn(() => ({ eq: eqId }));
    const client = {
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: ownerId } }, error: null })) },
      from: vi.fn(() => ({ select })),
    } as unknown as SupabaseClient<Database>;

    const result = await createSupabaseRepositories(client).scrambleRepository.get(integrationFixtures.scramble.id, ownerId);

    expect(result).toEqual({ status: 'success', data: {
      id: integrationFixtures.scramble.id,
      puzzle: '333',
      notation,
      generatorProvider: 'cubing.js',
      generatorVersion: '0.66.1',
      generationMethod: 'RANDOM_STATE',
      createdAt: integrationFixtures.scramble.createdAt,
    } });
    expect(eqOwner).toHaveBeenCalledWith('owner_id', ownerId);
  });

  it('keeps unknown legacy provenance absent when reading old rows', async () => {
    const maybeSingle = vi.fn(async () => ({ data: {
      id: integrationFixtures.scramble.id,
      owner_id: ownerId,
      puzzle: '333',
      notation: integrationFixtures.scramble.notation,
      generator_provider: null,
      generator_version: 'legacy-v1',
      generation_method: null,
      created_at: integrationFixtures.scramble.createdAt,
    }, error: null }));
    const eq = vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle })) }));
    const client = {
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: ownerId } }, error: null })) },
      from: vi.fn(() => ({ select: vi.fn(() => ({ eq })) })),
    } as unknown as SupabaseClient<Database>;

    const result = await createSupabaseRepositories(client).scrambleRepository.get(integrationFixtures.scramble.id, ownerId);

    expect(result).toEqual({ status: 'success', data: {
      id: integrationFixtures.scramble.id,
      puzzle: '333',
      notation: integrationFixtures.scramble.notation,
      generatorVersion: 'legacy-v1',
      createdAt: integrationFixtures.scramble.createdAt,
    } });
  });

  it('accepts an identical scramble retry only when provenance also matches', async () => {
    const scramble = {
      ...integrationFixtures.scramble,
      generatorProvider: 'cubing.js',
      generationMethod: 'RANDOM_STATE' as const,
    };
    const saved = {
      id: scramble.id,
      owner_id: ownerId,
      puzzle: scramble.puzzle,
      notation: scramble.notation,
      generator_provider: 'cubing.js',
      generator_version: scramble.generatorVersion,
      generation_method: 'RANDOM_STATE',
      created_at: scramble.createdAt,
    };
    const maybeSingle = vi.fn(async () => ({ data: saved, error: null }));
    const eq = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ eq }));
    const insert = vi.fn(async () => ({ error: { code: '23505' } }));
    const client = {
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: ownerId } }, error: null })) },
      from: vi.fn(() => ({ insert, select })),
    } as unknown as SupabaseClient<Database>;

    const result = await createSupabaseRepositories(client).scrambleRepository.save(scramble, ownerId);

    expect(result).toEqual({ status: 'success', data: undefined });
    expect(select).toHaveBeenCalledWith('id,owner_id,puzzle,notation,generator_provider,generator_version,generation_method,created_at');
  });

  it('rejects a duplicate scramble ID whose stored provenance differs from the retry', async () => {
    const scramble = {
      ...integrationFixtures.scramble,
      generatorProvider: 'cubing.js',
      generationMethod: 'RANDOM_STATE' as const,
    };
    const maybeSingle = vi.fn(async () => ({ data: {
      id: scramble.id,
      puzzle: scramble.puzzle,
      notation: scramble.notation,
      generator_provider: 'different-provider',
      generator_version: scramble.generatorVersion,
      generation_method: 'RANDOM_STATE',
      created_at: scramble.createdAt,
    }, error: null }));
    const eq = vi.fn(() => ({ maybeSingle }));
    const client = {
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: ownerId } }, error: null })) },
      from: vi.fn(() => ({
        insert: vi.fn(async () => ({ error: { code: '23505' } })),
        select: vi.fn(() => ({ eq })),
      })),
    } as unknown as SupabaseClient<Database>;

    const result = await createSupabaseRepositories(client).scrambleRepository.save(scramble, ownerId);

    expect(result.status).not.toBe('success');
  });

  it('refuses writes and session reads when the active account differs from the captured owner', async () => {
    const from = vi.fn();
    const getUser = vi.fn(async () => ({ data: { user: { id: '11111111-1111-4111-8111-111111111111' } }, error: null }));
    const client = { auth: { getUser }, from } as unknown as SupabaseClient<Database>;
    const repositories = createSupabaseRepositories(client);
    const expectedOwnerId = '99999999-9999-4999-8999-999999999999';

    const results = await Promise.all([
      repositories.scrambleRepository.save(integrationFixtures.scramble, expectedOwnerId),
      repositories.solves.save(integrationFixtures.solve, expectedOwnerId),
      repositories.sessions.list(expectedOwnerId),
      repositories.sessions.create('Practice', '333', expectedOwnerId),
    ]);

    expect(results).toHaveLength(4);
    for (const result of results) expect(result).toMatchObject({ status: 'error', code: 'FORBIDDEN' });
    expect(getUser).toHaveBeenCalledTimes(4);
    expect(from).not.toHaveBeenCalled();
  });

  it('changes only the penalty when an existing solve is updated', async () => {
    const maybeSingle = vi.fn(async () => ({ data: { id: integrationFixtures.solve.id }, error: null }));
    const select = vi.fn(() => ({ maybeSingle }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    const client = { from: vi.fn(() => ({ update })) } as unknown as SupabaseClient<Database>;

    const result = await createSupabaseRepositories(client).solves.updatePenalty(integrationFixtures.solve.id, 'DNF');

    expect(result).toEqual({ status: 'success', data: undefined });
    expect(update).toHaveBeenCalledWith({ penalty: 'dnf' });
    expect(eq).toHaveBeenCalledWith('id', integrationFixtures.solve.id);
  });
});

describe('Supabase saved scramble history', () => {
  const savedAt = '2026-10-19T10:00:00.000Z';
  const solveId = '44444444-4444-4444-8444-444444444444';
  const scrambleId = integrationFixtures.scramble.id;
  const scrambleRow = {
    id: scrambleId,
    owner_id: ownerId,
    puzzle: '333',
    notation: "R  U\nR' ",
    generator_provider: null,
    generator_version: 'legacy-v1',
    generation_method: null,
    created_at: integrationFixtures.scramble.createdAt,
  };
  const solveRow = { id: solveId, scramble_id: scrambleId, puzzle: '333', created_at: savedAt };

  function makeHistoryClient(solveRows = [solveRow], scrambleRows = [scrambleRow], activeUserId = ownerId) {
    const solveQuery: Record<string, ReturnType<typeof vi.fn>> = {};
    for (const method of ['eq', 'order', 'gte', 'lte', 'or']) solveQuery[method] = vi.fn(() => solveQuery);
    solveQuery.limit = vi.fn(async () => ({ data: solveRows, error: null }));
    const scrambleQuery = {
      eq: vi.fn(() => scrambleQuery),
      in: vi.fn(async () => ({ data: scrambleRows, error: null })),
    };
    const from = vi.fn((table: string) => ({ select: vi.fn(() => table === 'solves' ? solveQuery : scrambleQuery) }));
    const getUser = vi.fn(async () => ({ data: { user: { id: activeUserId } }, error: null }));
    return { client: { auth: { getUser }, from } as unknown as SupabaseClient<Database>, from, getUser, solveQuery, scrambleQuery };
  }

  it('lists only owner-scoped solve-linked scrambles with exact notation and unknown legacy provenance', async () => {
    const mocks = makeHistoryClient();
    const result = await createSupabaseRepositories(mocks.client).scrambleRepository.listHistory({ puzzle: '333', limit: 10 }, ownerId);

    expect(result).toEqual({ status: 'success', data: {
      entries: [{
        scramble: {
          id: scrambleId,
          puzzle: '333',
          notation: scrambleRow.notation,
          generatorVersion: 'legacy-v1',
          createdAt: integrationFixtures.scramble.createdAt,
        },
        savedAt,
        solveId,
      }],
      nextCursor: null,
    } });
    expect(mocks.from).toHaveBeenNthCalledWith(1, 'solves');
    expect(mocks.solveQuery.eq).toHaveBeenCalledWith('owner_id', ownerId);
    expect(mocks.solveQuery.eq).toHaveBeenCalledWith('puzzle', '333');
    expect(mocks.solveQuery.limit).toHaveBeenCalledWith(11);
    expect(mocks.from).toHaveBeenNthCalledWith(2, 'scrambles');
    expect(mocks.scrambleQuery.eq).toHaveBeenCalledWith('owner_id', ownerId);
    expect(mocks.scrambleQuery.in).toHaveBeenCalledWith('id', [scrambleId]);
    expect(mocks.getUser).toHaveBeenCalledTimes(3);
  });

  it('uses timestamp and UUID keyset ordering and applies timestamp filters', async () => {
    const mocks = makeHistoryClient();
    const filter = {
      from: '2026-10-01T00:00:00.000Z',
      through: '2026-10-31T23:59:59.999Z',
      cursor: { savedAt, solveId },
      limit: 7,
    };
    await createSupabaseRepositories(mocks.client).scrambleRepository.listHistory(filter, ownerId);

    expect(mocks.solveQuery.order).toHaveBeenNthCalledWith(1, 'created_at', { ascending: false });
    expect(mocks.solveQuery.order).toHaveBeenNthCalledWith(2, 'id', { ascending: false });
    expect(mocks.solveQuery.gte).toHaveBeenCalledWith('created_at', filter.from);
    expect(mocks.solveQuery.lte).toHaveBeenCalledWith('created_at', filter.through);
    expect(mocks.solveQuery.or).toHaveBeenCalledWith(`created_at.lt.${savedAt},and(created_at.eq.${savedAt},id.lt.${solveId})`);
    expect(mocks.solveQuery.limit).toHaveBeenCalledWith(8);
  });

  it('returns a next cursor only when another bounded page exists', async () => {
    const solveRows = [solveRow, { ...solveRow, id: '55555555-5555-4555-8555-555555555555', scramble_id: '66666666-6666-4666-8666-666666666666' }];
    const scrambleRows = [scrambleRow, { ...scrambleRow, id: '66666666-6666-4666-8666-666666666666' }];
    const mocks = makeHistoryClient(solveRows, scrambleRows);
    const result = await createSupabaseRepositories(mocks.client).scrambleRepository.listHistory({ limit: 1 }, ownerId);

    expect(result).toMatchObject({ status: 'success', data: {
      entries: [{ solveId }],
      nextCursor: { savedAt, solveId },
    } });
    expect(mocks.scrambleQuery.in).toHaveBeenCalledWith('id', [scrambleId]);
  });

  it('refuses cross-account access before issuing history queries', async () => {
    const mocks = makeHistoryClient([solveRow], [scrambleRow], '99999999-9999-4999-8999-999999999999');
    const result = await createSupabaseRepositories(mocks.client).scrambleRepository.listHistory({}, ownerId);

    expect(result).toMatchObject({ status: 'error', code: 'FORBIDDEN' });
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('returns an empty page without querying scramble rows when no solve is linked', async () => {
    const mocks = makeHistoryClient([]);
    const result = await createSupabaseRepositories(mocks.client).scrambleRepository.listHistory({}, ownerId);

    expect(result).toEqual({ status: 'success', data: { entries: [], nextCursor: null } });
    expect(mocks.from).toHaveBeenCalledTimes(1);
  });

  it('falls back to legacy columns only when the optional provenance columns are missing', async () => {
    const solveQuery = {
      eq: vi.fn(() => solveQuery),
      order: vi.fn(() => solveQuery),
      limit: vi.fn(async () => ({ data: [solveRow], error: null })),
    };
    let scrambleRead = 0;
    const scrambleQuery = {
      eq: vi.fn(() => scrambleQuery),
      in: vi.fn(async () => {
        scrambleRead += 1;
        return scrambleRead === 1
          ? { data: null, error: { code: 'PGRST204', message: "Could not find the 'generator_provider' column of 'scrambles' in the schema cache" } }
          : { data: [{ ...scrambleRow, generator_provider: undefined, generation_method: undefined }], error: null };
      }),
    };
    const from = vi.fn((table: string) => ({ select: vi.fn(() => table === 'solves' ? solveQuery : scrambleQuery) }));
    const client = {
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: ownerId } }, error: null })) },
      from,
    } as unknown as SupabaseClient<Database>;

    const result = await createSupabaseRepositories(client).scrambleRepository.listHistory({}, ownerId);

    expect(result).toMatchObject({ status: 'success', data: { entries: [{ scramble: {
      generatorVersion: 'legacy-v1',
    } }] } });
    if (result.status === 'success') {
      expect(result.data.entries[0]?.scramble).not.toHaveProperty('generatorProvider');
      expect(result.data.entries[0]?.scramble).not.toHaveProperty('generationMethod');
    }
    expect(scrambleRead).toBe(2);
  });
});

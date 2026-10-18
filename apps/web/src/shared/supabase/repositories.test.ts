import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import type { Database } from '../database/database.types';
import { integrationFixtures } from '../../test/support/integrationFixtures';
import { createSupabaseRepositories } from './repositories';

const ownerId = '11111111-1111-4111-8111-111111111111';

describe('Supabase solve repository ownership', () => {
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
    expect(select).toHaveBeenCalledWith('id,puzzle,notation,generator_provider,generator_version,generation_method,created_at');
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
          ? { data: null, error: { code: 'PGRST204', message: 'Could not find the generator_provider column' } }
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

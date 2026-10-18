import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import type { Database } from '../database/database.types';
import { integrationFixtures } from '../../test/support/integrationFixtures';
import { createSupabaseRepositories } from './repositories';

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
});

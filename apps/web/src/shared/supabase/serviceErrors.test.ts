import { describe, expect, it } from 'vitest';
import { mapSupabaseError, serviceFailure } from './serviceErrors';

describe('Supabase service error mapping', () => {
  it.each([
    [{ status: 401 }, 'FORBIDDEN'],
    [{ status: 429 }, 'RATE_LIMITED'],
    [{ code: '23505' }, 'CONFLICT'],
    [{ code: 'FETCH_ERROR' }, 'NETWORK'],
    [{ code: 'PGRST116' }, 'NOT_FOUND'],
  ] as const)('maps %o to %s', (error, code) => {
    expect(mapSupabaseError(error)).toBe(code);
  });

  it('does not expose raw database messages to callers', () => {
    expect(serviceFailure({ code: '42501', message: 'private schema detail' })).toEqual({
      status: 'error',
      code: 'FORBIDDEN',
      message: 'This account is not allowed to perform that action.',
    });
  });
});

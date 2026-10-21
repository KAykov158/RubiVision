import { describe, expect, it } from 'vitest';
import { mapSupabaseError, serviceFailure } from './serviceErrors';

describe('Supabase service error mapping', () => {
  it.each([
    [{ status: 401 }, 'FORBIDDEN'],
    [{ status: 429 }, 'RATE_LIMITED'],
    [{ code: '23505' }, 'CONFLICT'],
    [{ code: 'FETCH_ERROR' }, 'NETWORK'],
    [{ code: 'PGRST116' }, 'NOT_FOUND'],
    [{ code: 'PGRST204' }, 'SCHEMA_MISMATCH'],
    [{ code: '42703' }, 'SCHEMA_MISMATCH'],
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

  it('gives a safe, actionable schema update message without exposing database details', () => {
    expect(serviceFailure({ code: 'PGRST204', message: "Could not find the 'generator_provider' column of 'scrambles'" })).toEqual({
      status: 'error',
      code: 'SCHEMA_MISMATCH',
      message: 'The cloud database needs an update before this data can be saved. This solve remains in memory; retry after the update is applied.',
    });
  });
});

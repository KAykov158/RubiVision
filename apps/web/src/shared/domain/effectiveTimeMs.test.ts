import { describe, expect, it } from 'vitest';
import type { Solve } from './contracts';
import { effectiveTimeMs } from './effectiveTimeMs';

const baseSolve: Solve = {
  id: '930f2d71-9152-4a73-ae6d-839f5efb60f2',
  sessionId: '99d63a61-60e7-43e5-a16a-6d653ce67f21',
  scrambleId: '59d8f96e-5df3-4a26-a55f-340d491b1f02',
  puzzle: '333',
  rawTimeMs: 12_345,
  penalty: 'NONE',
  startedAt: '2026-10-16T12:00:00.000Z',
  completedAt: '2026-10-16T12:00:12.345Z',
  timingSource: 'KEYBOARD',
};

describe('effectiveTimeMs', () => {
  it('returns the raw time when there is no penalty', () => {
    expect(effectiveTimeMs(baseSolve)).toBe(12_345);
  });

  it('adds 2000 milliseconds for a PLUS_TWO penalty', () => {
    expect(effectiveTimeMs({ ...baseSolve, penalty: 'PLUS_TWO' })).toBe(14_345);
  });

  it('returns null for a DNF', () => {
    expect(effectiveTimeMs({ ...baseSolve, penalty: 'DNF' })).toBeNull();
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY, 12.5])(
    'rejects invalid raw times (%s)',
    (rawTimeMs) => {
      expect(() => effectiveTimeMs({ ...baseSolve, rawTimeMs })).toThrow(
        RangeError,
      );
    },
  );

  it('rejects an unknown runtime penalty', () => {
    const invalidPenalty = { ...baseSolve, penalty: 'UNKNOWN' } as unknown as Solve;

    expect(() => effectiveTimeMs(invalidPenalty)).toThrow(TypeError);
  });
});

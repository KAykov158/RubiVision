import { describe, expect, it } from 'vitest';
import type { Solve } from '../../shared/domain/contracts';
import { formatSolveTimeDifference, solveTimeDifference } from './solveTimeDifference';

const latest: Solve = {
  id: '11111111-1111-4111-8111-111111111111',
  sessionId: '22222222-2222-4222-8222-222222222222',
  scrambleId: '33333333-3333-4333-8333-333333333333',
  puzzle: '333',
  rawTimeMs: 34_370,
  penalty: 'NONE',
  startedAt: '2026-10-18T12:00:00.000Z',
  completedAt: '2026-10-18T12:00:34.370Z',
  timingSource: 'KEYBOARD',
};
const previous: Solve = {
  ...latest,
  id: '44444444-4444-4444-8444-444444444444',
  scrambleId: '55555555-5555-4555-8555-555555555555',
  rawTimeMs: 41_630,
  completedAt: '2026-10-18T11:59:41.630Z',
};

describe('solve time difference', () => {
  it('formats faster solves as a negative difference', () => {
    const difference = solveTimeDifference(latest, previous);
    expect(difference).toEqual({ milliseconds: -7_260, direction: 'faster' });
    expect(formatSolveTimeDifference(difference!.milliseconds)).toBe('-7.26');
  });

  it('formats slower solves as a positive difference', () => {
    const difference = solveTimeDifference(previous, latest);
    expect(difference).toEqual({ milliseconds: 7_260, direction: 'slower' });
    expect(formatSolveTimeDifference(difference!.milliseconds)).toBe('+7.26');
  });

  it('uses effective times including a plus-two penalty', () => {
    const difference = solveTimeDifference({ ...latest, rawTimeMs: 40_000, penalty: 'PLUS_TWO' }, previous);
    expect(difference).toEqual({ milliseconds: 370, direction: 'slower' });
    expect(formatSolveTimeDifference(difference!.milliseconds)).toBe('+0.37');
  });

  it('returns a neutral zero for equal effective times', () => {
    expect(solveTimeDifference({ ...latest, rawTimeMs: 41_630 }, previous))
      .toEqual({ milliseconds: 0, direction: 'equal' });
    expect(formatSolveTimeDifference(0)).toBe('0.00');
  });

  it('hides the difference for the first solve or when either solve is a DNF', () => {
    expect(solveTimeDifference(latest, undefined)).toBeNull();
    expect(solveTimeDifference({ ...latest, penalty: 'DNF' }, previous)).toBeNull();
    expect(solveTimeDifference(latest, { ...previous, penalty: 'DNF' })).toBeNull();
  });

  it('does not compare across sessions or puzzle types', () => {
    expect(solveTimeDifference(latest, { ...previous, sessionId: '99999999-9999-4999-8999-999999999999' })).toBeNull();
    expect(solveTimeDifference(latest, { ...previous, puzzle: '222' })).toBeNull();
  });
});

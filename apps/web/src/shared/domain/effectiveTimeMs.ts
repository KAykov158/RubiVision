import type { Solve } from './contracts';

/** Returns null for DNF and otherwise computes the displayed solve time. */
export function effectiveTimeMs(solve: Solve): number | null {
  if (!Number.isFinite(solve.rawTimeMs) || !Number.isInteger(solve.rawTimeMs) || solve.rawTimeMs < 0) {
    throw new RangeError('rawTimeMs must be a finite, non-negative integer.');
  }

  switch (solve.penalty) {
    case 'DNF':
      return null;
    case 'PLUS_TWO':
      return solve.rawTimeMs + 2_000;
    case 'NONE':
      return solve.rawTimeMs;
    default:
      throw new TypeError('Unsupported solve penalty.');
  }
}

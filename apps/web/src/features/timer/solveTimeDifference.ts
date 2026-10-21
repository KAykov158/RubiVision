import { effectiveTimeMs } from '../../shared/domain/effectiveTimeMs';
import type { Solve } from '../../shared/domain/contracts';

export interface SolveTimeDifference {
  readonly milliseconds: number;
  readonly direction: 'faster' | 'slower' | 'equal';
}

/** Compare two solves only when they belong to the same session and puzzle. */
export function solveTimeDifference(latest: Solve | undefined, previous: Solve | undefined): SolveTimeDifference | null {
  if (!latest || !previous || latest.sessionId !== previous.sessionId || latest.puzzle !== previous.puzzle) return null;
  const latestTime = effectiveTimeMs(latest);
  const previousTime = effectiveTimeMs(previous);
  if (latestTime === null || previousTime === null) return null;

  const milliseconds = latestTime - previousTime;
  return {
    milliseconds,
    direction: milliseconds < 0 ? 'faster' : milliseconds > 0 ? 'slower' : 'equal',
  };
}

export function formatSolveTimeDifference(milliseconds: number) {
  if (milliseconds === 0) return '0.00';
  const sign = milliseconds < 0 ? '-' : '+';
  return `${sign}${(Math.abs(milliseconds) / 1000).toFixed(2)}`;
}

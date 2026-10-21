import { describe, expect, it } from 'vitest';
import { randomScrambleForEvent } from 'cubing/scramble';
import { wcaEventInfo } from 'cubing/puzzles';
import type { PuzzleType, ScrambleGenerationMethod } from '../../shared/domain/contracts';
import { createScrambleService, GENERATOR_PROVIDER, GENERATOR_VERSION, validateScramble } from './scrambleService';

const providerCases: Array<{
  puzzle: PuzzleType;
  event: string;
  method: ScrambleGenerationMethod;
  timeoutMs: number;
}> = [
  { puzzle: '222', event: '222', method: 'RANDOM_STATE', timeoutMs: 60_000 },
  { puzzle: '333', event: '333', method: 'RANDOM_STATE', timeoutMs: 90_000 },
  { puzzle: '444', event: '444', method: 'RANDOM_STATE', timeoutMs: 120_000 },
  { puzzle: '555', event: '555', method: 'RANDOM_MOVE', timeoutMs: 120_000 },
  { puzzle: '666', event: '666', method: 'RANDOM_MOVE', timeoutMs: 120_000 },
  { puzzle: '777', event: '777', method: 'RANDOM_MOVE', timeoutMs: 120_000 },
];

const requestedEvents: string[] = [];
const service = createScrambleService(async (event) => {
  requestedEvents.push(event);
  return randomScrambleForEvent(event);
});

describe('installed cubing.js scramble provider', () => {
  for (const { puzzle, event, method, timeoutMs } of providerCases) {
    it(`${puzzle} uses event ${event} and reports ${method} provenance`, async () => {
      requestedEvents.length = 0;
      const startedAt = performance.now();
      const result = await service.generate(puzzle);
      const durationMs = Math.round(performance.now() - startedAt);

      console.info(`[real scramble provider] puzzle=${puzzle} event=${event} durationMs=${durationMs}`);
      expect(requestedEvents.length).toBeGreaterThanOrEqual(1);
      expect(new Set(requestedEvents)).toEqual(new Set([event]));
      expect(result.status).toBe('success');
      if (result.status !== 'success') return;

      expect(result.data.puzzle).toBe(puzzle);
      expect(wcaEventInfo(event)?.scramblesImplemented).toBe(method === 'RANDOM_STATE' ? 'random-state' : 'random-moves');
      expect(result.data.notation.trim().length).toBeGreaterThan(0);
      expect(validateScramble(puzzle, result.data.notation)).toEqual({ status: 'success', data: undefined });
      expect(result.data).toMatchObject({
        generatorProvider: GENERATOR_PROVIDER,
        generatorVersion: GENERATOR_VERSION,
        generationMethod: method,
      });
      expect(result.data.id).toMatch(/^[0-9a-f-]{36}$/i);
      expect(Number.isFinite(Date.parse(result.data.createdAt))).toBe(true);
      expect(durationMs).toBeGreaterThanOrEqual(0);
    }, timeoutMs);
  }
});

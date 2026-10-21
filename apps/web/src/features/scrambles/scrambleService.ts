import { Alg, Move } from 'cubing/alg';
import type { PuzzleType, Scramble, ScrambleGenerationMethod, ScrambleService, ServiceResult } from '../../shared/domain/contracts';

// Keep this in sync with the exact cubing dependency pinned in package.json.
export const GENERATOR_PROVIDER = 'cubing.js';
export const GENERATOR_VERSION = '0.66.1';

const events: Record<PuzzleType, { event: string; method: ScrambleGenerationMethod; maxTokens: number }> = {
  '222': { event: '222', method: 'RANDOM_STATE', maxTokens: 40 },
  '333': { event: '333', method: 'RANDOM_STATE', maxTokens: 80 },
  '444': { event: '444', method: 'RANDOM_STATE', maxTokens: 140 },
  '555': { event: '555', method: 'RANDOM_MOVE', maxTokens: 160 },
  '666': { event: '666', method: 'RANDOM_MOVE', maxTokens: 200 },
  '777': { event: '777', method: 'RANDOM_MOVE', maxTokens: 240 },
};

const invalid = (message: string): ServiceResult<void> => ({ status: 'error', code: 'INVALID_INPUT', message });
const cancelled = (): ServiceResult<Scramble> => ({ status: 'error', code: 'CANCELLED' });

/** Checks syntax and event move compatibility, not randomness or scramble quality. */
export function validateScramble(puzzle: PuzzleType, notation: string): ServiceResult<void> {
  const event = events[puzzle];
  if (!event) return { status: 'unavailable', reason: 'UNSUPPORTED' };
  if (typeof notation !== 'string' || !notation.trim() || notation.length > 4096) {
    return invalid('Scramble notation is empty or too long.');
  }

  const tokens = notation.trim().split(/\s+/u);
  if (tokens.length > event.maxTokens) return invalid('Scramble has too many moves.');

  try {
    const alg = Alg.fromString(notation);
    if (Array.from(alg.childAlgNodes()).length !== tokens.length) {
      return invalid('Only a sequence of cube moves is supported.');
    }
    const size = Number(puzzle[0]);
    for (const token of tokens) {
      if (token.length > 16) return invalid('Scramble move is too long.');
      const move = Move.fromString(token);
      const family = move.quantum.family;
      const width = move.quantum.innerLayer;
      if (move.toString() !== token || ![1, -1, 2].includes(move.amount)
        || move.quantum.outerLayer !== null) return invalid('Unsupported move notation.');
      if ('URFDLB'.includes(family) && family.length === 1 && width === null) continue;
      if (size >= 4 && /^[URFDLB]w$/u.test(family)
        && (width === null || (width >= 2 && width <= Math.floor(size / 2)))) continue;
      return invalid('Move is not valid for this puzzle.');
    }
    return { status: 'success', data: undefined };
  } catch {
    return invalid('Malformed scramble notation.');
  }
}

type Generator = (event: string) => Promise<{ toString(): string }>;

const providerGenerator: Generator = async (event) => {
  const { randomScrambleForEvent } = await import('cubing/scramble');
  return randomScrambleForEvent(event);
};

/** The provider does not abort worker jobs; cancelled and superseded results are discarded. */
export function createScrambleService(generator: Generator = providerGenerator): ScrambleService {
  let latestRequest = 0;
  let providerTail: Promise<void> = Promise.resolve();
  const lastNotation = new Map<PuzzleType, string>();
  function queuedGeneration(event: string, shouldSkip: () => boolean) {
    const pending = providerTail.then(() => shouldSkip() ? null : generator(event));
    // A rejected provider call must not poison the queue or become unhandled.
    providerTail = pending.then(() => undefined, () => undefined);
    return pending;
  }
  return {
    async generate(puzzle, options): Promise<ServiceResult<Scramble>> {
      const event = events[puzzle];
      if (!event) return { status: 'unavailable', reason: 'UNSUPPORTED' };
      if (options?.signal?.aborted) return cancelled();
      const request = ++latestRequest;
      const isCancelled = () => options?.signal?.aborted || request !== latestRequest;

      try {
        for (let attempt = 0; attempt < 3; attempt += 1) {
          if (isCancelled()) return cancelled();
          const alg = await queuedGeneration(event.event, isCancelled);
          if (isCancelled() || !alg) return cancelled();
          const notation = alg.toString();
          const validation = validateScramble(puzzle, notation);
          if (validation.status !== 'success') return validation;
          if (notation === lastNotation.get(puzzle)) continue;
          if (isCancelled()) return cancelled();
          const scramble: Scramble = {
            id: crypto.randomUUID(),
            puzzle,
            notation,
            generatorProvider: GENERATOR_PROVIDER,
            generatorVersion: GENERATOR_VERSION,
            generationMethod: event.method,
            createdAt: new Date().toISOString(),
          };
          lastNotation.set(puzzle, notation);
          return { status: 'success', data: scramble };
        }
        return { status: 'error', code: 'CONFLICT', message: 'Could not generate a new scramble. Please retry.' };
      } catch {
        return isCancelled() ? cancelled() : { status: 'error', code: 'UNKNOWN', message: 'Scramble generation failed.' };
      }
    },
  };
}

export const scrambleService = createScrambleService();

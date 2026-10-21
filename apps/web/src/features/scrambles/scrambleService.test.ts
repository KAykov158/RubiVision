import { describe, expect, it, vi } from 'vitest';
import type { PuzzleType } from '../../shared/domain/contracts';
import { createScrambleService, GENERATOR_PROVIDER, GENERATOR_VERSION, validateScramble } from './scrambleService';

const puzzles: PuzzleType[] = ['222', '333', '444', '555', '666', '777'];
const examples: Record<PuzzleType, string> = {
  '222': "U F' R2 D B L",
  '333': "R U2 F' B D L2",
  '444': "Rw U2 Fw' L D B2",
  '555': "Uw2 B Rw' D Fw L2",
  '666': "3Uw' Bw 3Bw2 Lw R2",
  '777': "3Rw2 3Dw' Fw U2 L",
};

describe('event-aware scramble validation', () => {
  it.each(puzzles)('accepts legal %s notation, including event-specific layers', (puzzle) => {
    expect(validateScramble(puzzle, examples[puzzle])).toEqual({ status: 'success', data: undefined });
  });

  it.each([
    ['222', 'Rw'], ['333', 'M'], ['333', 'r'], ['444', '3Rw'],
    ['555', '3Rw'], ['666', '4Rw'], ['777', '4Rw'],
  ] as const)('rejects %s move %s for its event', (puzzle, notation) => {
    expect(validateScramble(puzzle, notation)).toMatchObject({ status: 'error', code: 'INVALID_INPUT' });
  });

  it.each(['', '   ', 'R++', "R2'", 'R3', "R'2", 'x', 'Q', '(R U)', '[R,U]', 'R // note', 'R\tU\nBAD'])(
    'rejects empty, malformed, or unsupported notation %j', (notation) => {
      expect(validateScramble('333', notation)).toMatchObject({ status: 'error', code: 'INVALID_INPUT' });
    });

  it('bounds token and character counts', () => {
    expect(validateScramble('222', Array(41).fill('R').join(' '))).toMatchObject({ status: 'error', code: 'INVALID_INPUT' });
    expect(validateScramble('777', `${' '.repeat(4096)}R`)).toMatchObject({ status: 'error', code: 'INVALID_INPUT' });
  });
});

describe('scramble generation service', () => {
  it.each(puzzles)('maps %s to its provider event and preserves exact output with provenance', async (puzzle) => {
    const notation = `  ${examples[puzzle]}  `;
    const generator = vi.fn(async () => ({ toString: () => notation }));
    const result = await createScrambleService(generator).generate(puzzle);
    expect(generator).toHaveBeenCalledWith(puzzle);
    expect(result.status).toBe('success');
    if (result.status !== 'success') return;
    expect(result.data).toMatchObject({
      puzzle, notation, generatorProvider: GENERATOR_PROVIDER, generatorVersion: GENERATOR_VERSION,
      generationMethod: ['222', '333', '444'].includes(puzzle) ? 'RANDOM_STATE' : 'RANDOM_MOVE',
    });
    expect(result.data.id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(new Date(result.data.createdAt).toISOString()).toBe(result.data.createdAt);
  });

  it('assigns a fresh UUID and retries one duplicate without returning the previous scramble', async () => {
    const generator = vi.fn()
      .mockResolvedValueOnce({ toString: () => 'R U' })
      .mockResolvedValueOnce({ toString: () => 'R U' })
      .mockResolvedValueOnce({ toString: () => 'U R' });
    const service = createScrambleService(generator);
    const first = await service.generate('333');
    const second = await service.generate('333');
    expect(first.status).toBe('success');
    expect(second.status).toBe('success');
    if (first.status !== 'success' || second.status !== 'success') return;
    expect(first.data.id).not.toBe(second.data.id);
    expect(second.data.notation).toBe('U R');
    expect(generator).toHaveBeenCalledTimes(3);
  });

  it('returns an error after bounded duplicate retries', async () => {
    const generator = vi.fn(async () => ({ toString: (): string => 'R U' }));
    const service = createScrambleService(generator);
    await service.generate('333');
    expect(await service.generate('333')).toMatchObject({ status: 'error', code: 'CONFLICT' });
    expect(generator).toHaveBeenCalledTimes(4);
  });

  it('reports invalid provider output and provider rejection without reusing an old scramble', async () => {
    expect(await createScrambleService(async () => ({ toString: () => 'M U' })).generate('333'))
      .toMatchObject({ status: 'error', code: 'INVALID_INPUT' });
    expect(await createScrambleService(async () => { throw Error('worker failed'); }).generate('333'))
      .toMatchObject({ status: 'error', code: 'UNKNOWN' });
  });

  it('does not start an already aborted request', async () => {
    const generator = vi.fn(async () => ({ toString: (): string => 'R U' }));
    const controller = new AbortController();
    controller.abort();
    expect(await createScrambleService(generator).generate('333', { signal: controller.signal }))
      .toMatchObject({ status: 'error', code: 'CANCELLED' });
    expect(generator).not.toHaveBeenCalled();
  });

  it('discards a late non-cancellable provider result after abort', async () => {
    let finish!: (value: { toString(): string }) => void;
    const generator = vi.fn(() => new Promise<{ toString(): string }>((resolve) => { finish = resolve; }));
    const controller = new AbortController();
    const pending = createScrambleService(generator).generate('333', { signal: controller.signal });
    await Promise.resolve();
    controller.abort();
    finish({ toString: () => 'R U' });
    expect(await pending).toMatchObject({ status: 'error', code: 'CANCELLED' });
  });

  it('discards a superseded request when another puzzle is requested', async () => {
    let finish!: (value: { toString(): string }) => void;
    const generator = vi.fn((event: string) => event === '333'
      ? new Promise<{ toString(): string }>((resolve) => { finish = resolve; })
      : Promise.resolve({ toString: () => 'Rw U' }));
    const service = createScrambleService(generator);
    const old = service.generate('333');
    await Promise.resolve();
    const next = service.generate('444');
    finish({ toString: () => 'R U' });
    expect(await old).toMatchObject({ status: 'error', code: 'CANCELLED' });
    expect(await next).toMatchObject({ status: 'success', data: { puzzle: '444' } });
  });

  it('skips superseded requests waiting behind an in-progress provider job', async () => {
    let finish!: (value: { toString(): string }) => void;
    const generator = vi.fn((event: string) => event === '333'
      ? new Promise<{ toString(): string }>((resolve) => { finish = resolve; })
      : Promise.resolve({ toString: () => 'Rw U' }));
    const service = createScrambleService(generator);
    const first = service.generate('333');
    await Promise.resolve();
    const skipped = service.generate('222');
    const latest = service.generate('444');
    finish({ toString: () => 'R U' });
    expect(await first).toMatchObject({ status: 'error', code: 'CANCELLED' });
    expect(await skipped).toMatchObject({ status: 'error', code: 'CANCELLED' });
    expect(await latest).toMatchObject({ status: 'success' });
    expect(generator.mock.calls.map(([event]) => event)).toEqual(['333', '444']);
  });
});

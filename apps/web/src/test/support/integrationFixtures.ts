import type {
  Recording,
  Scramble,
  Session,
  Solve,
  SolveAnalysis,
} from '../../shared/domain/contracts';

/** Fixed test-only records. These fixtures are never composed into the production app. */
export const integrationFixtures = {
  scramble: {
    id: '10000000-0000-4000-8000-000000000001',
    puzzle: '333',
    notation: "R U R' U'",
    generatorVersion: 'fixture-only',
    createdAt: '2026-02-10T12:00:00.000Z',
  } satisfies Scramble,
  session: {
    id: '20000000-0000-4000-8000-000000000001',
    name: 'Integration fixture session',
    puzzle: '333',
    createdAt: '2026-02-10T11:00:00.000Z',
    updatedAt: '2026-02-10T12:00:00.000Z',
  } satisfies Session,
  recording: {
    id: '30000000-0000-4000-8000-000000000001',
    solveId: '40000000-0000-4000-8000-000000000002',
    createdAt: '2026-02-10T12:01:00.000Z',
    durationMs: 32_420,
    mimeType: 'video/webm',
    width: 640,
    height: 480,
    blobStorageKey: 'test-only-opaque-reference',
    timerStartOffsetMs: 0,
  } satisfies Recording,
  solve: {
    id: '40000000-0000-4000-8000-000000000002',
    sessionId: '20000000-0000-4000-8000-000000000001',
    scrambleId: '10000000-0000-4000-8000-000000000001',
    puzzle: '333',
    rawTimeMs: 30_420,
    penalty: 'PLUS_TWO',
    startedAt: '2026-02-10T12:00:10.000Z',
    completedAt: '2026-02-10T12:00:40.420Z',
    timingSource: 'KEYBOARD',
  } satisfies Solve,
  analysis: {
    id: '50000000-0000-4000-8000-000000000001',
    solveId: '40000000-0000-4000-8000-000000000002',
    recordingId: '30000000-0000-4000-8000-000000000001',
    modelVersion: 'test-fixture-only',
    featureSchemaVersion: 'test-fixture-only',
    createdAt: '2026-02-10T12:02:00.000Z',
    segments: [
      { startMs: 0, endMs: 10_000, label: 'MOVEMENT', confidence: 0.8 },
      { startMs: 10_000, endMs: 32_420, label: 'UNCERTAIN', confidence: null },
    ],
    qualityWarnings: [],
  } satisfies SolveAnalysis,
} as const;

export const penaltySolveFixtures = {
  none: { ...integrationFixtures.solve, penalty: 'NONE' },
  plusTwo: integrationFixtures.solve,
  dnf: { ...integrationFixtures.solve, penalty: 'DNF' },
} satisfies Record<'none' | 'plusTwo' | 'dnf', Solve>;

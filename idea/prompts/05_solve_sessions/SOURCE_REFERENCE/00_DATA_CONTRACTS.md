# RubiVision AI — Canonical Data and Integration Contracts

These are proposed canonical contracts. Before implementation, compare them with the repository; document and migrate any deliberate change across ALL dependent prompts.

```typescript
export type PuzzleType = '222'|'333'|'444'|'555'|'666'|'777';
export type Penalty = 'NONE'|'PLUS_TWO'|'DNF';
export type TimingSource = 'KEYBOARD'|'TOUCH'|'SMART_CUBE';
export type ActivityLabel = 'MOVEMENT'|'PAUSE'|'UNCERTAIN';

export interface Scramble {
  id: string; puzzle: PuzzleType; notation: string;
  generatorVersion: string; createdAt: string;
}
export interface Session {
  id: string; name: string; puzzle: PuzzleType;
  createdAt: string; updatedAt: string;
}
export interface Solve {
  id: string; sessionId: string; scrambleId: string;
  puzzle: PuzzleType; rawTimeMs: number; penalty: Penalty;
  startedAt: string; completedAt: string;
  timingSource: TimingSource; notes?: string;
}
export interface Recording {
  id: string; solveId: string; createdAt: string;
  durationMs: number; mimeType: string;
  width?: number; height?: number;
  blobStorageKey: string;
  timerStartOffsetMs: number; // timer start relative to recording start
}
export interface ActivitySegment {
  startMs: number; endMs: number;
  label: ActivityLabel; confidence: number|null;
}
export interface SolveAnalysis {
  id: string; solveId: string; recordingId: string;
  modelVersion: string; featureSchemaVersion: string;
  createdAt: string; segments: ActivitySegment[];
  qualityWarnings: string[];
}
export interface FeatureWindow {
  recordingId: string; startMs: number; endMs: number;
  features: number[]; // order fixed by versioned feature schema
  qualityFlags: string[];
}
```

## Invariants and calculations
- IDs: stable UUID strings. Times: integer or finite nonnegative milliseconds. `startedAt`, `completedAt`, `createdAt`, `updatedAt`: ISO 8601 UTC strings.
- `effectiveTimeMs(solve)`: `null` for DNF; `rawTimeMs + 2000` for PLUS_TWO; otherwise `rawTimeMs`. Never independently edit or persist a conflicting effective time.
- One solve references one immutable scramble ID; scramble puzzle must match solve puzzle and session policy.
- Session deletion must have explicit cascade/reassignment behavior; never leave silent orphan solves.
- `ActivitySegment` and `FeatureWindow` use half-open intervals `[startMs,endMs)` relative to recording start; `0 <= startMs < endMs <= recording.durationMs`; ordered segments cannot overlap. Confidence is null when unavailable, otherwise within [0,1].
- Model output label IDs, feature ordering, preprocessing, sampling/window size and model version must be saved in an explicit model manifest. Training/export and runtime inference must validate the same manifest.
- Use schema-versioned JSON backups and IndexedDB migrations; import must validate relationships and be transactional. Video blobs can be excluded from lightweight backups only if clearly disclosed.

## Public service boundaries (illustrative)
```typescript
interface ScrambleService { generate(puzzle: PuzzleType): Promise<Scramble>; }
interface SolveRepository {
  save(solve: Solve): Promise<void>;
  get(id: string): Promise<Solve | null>;
  list(filter?: {sessionId?: string; puzzle?: PuzzleType}): Promise<Solve[]>;
  updatePenalty(id: string, penalty: Penalty): Promise<void>;
}
interface AnalysisService {
  analyze(recordingId: string, options?: {signal?: AbortSignal}): Promise<SolveAnalysis>;
}
```

## Database ownership
Store `sessions`, `solves`, `scrambles`, `recordings`, `analyses`, `settings` in versioned IndexedDB stores. Repository/service layer owns persistence, not React components. Use transactions for multi-store changes and idempotency guards when a solve is completed.

## Open decisions to resolve in code
Exact library choice, whether recordings live as IndexedDB blobs or OPFS references, browser-compatible model format, and session deletion policy. Record each decision before implementing dependent features; do not treat examples as existing implementations.

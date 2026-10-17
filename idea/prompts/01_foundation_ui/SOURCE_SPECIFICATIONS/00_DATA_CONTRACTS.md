> **SUPABASE-ONLY ARCHITECTURE OVERRIDE (2026-10-16).** This Foundation source pack preserves older requirements for traceability. Any requirement below that calls for IndexedDB, another browser/local database, localStorage application persistence, durable offline writes, or automatic synchronization is superseded by master documents 11 and 17. Supabase PostgreSQL is the sole persistent application database; Supabase Auth and owner-scoped RLS apply to future cloud access. A failed write may remain only in volatile tab memory and must be explicitly unsaved. Domain contracts and non-storage product requirements remain unless separately superseded.

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
- Use versioned Supabase SQL migrations and schema-validated JSON export/import. Validate relationships before writes; database mutations must be transactional in PostgreSQL.

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

## Database ownership (current rule)
Store persistent application records in Supabase PostgreSQL through typed repositories/services. Supabase Auth identifies the user and owner-scoped RLS authorizes access. UI components do not access the database directly. Do not add IndexedDB, another browser database, localStorage application persistence, a durable offline write queue, or automatic synchronization. Failed writes may remain only in volatile tab memory with explicit unsaved status.

## Open decisions to resolve in code (non-persistence)
Resolve the browser-compatible model format and session deletion policy before dependent features are implemented. Persistent media storage, if approved by its feature scope, must use consented Supabase Storage with access policies; browser-local durable media storage is not part of the persistence architecture.

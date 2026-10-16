# Proposed canonical data model, validation and security contracts

These are proposed extensions, not claims about existing repository schema. Confirm against source and migrations before changing anything.

## Core types
```ts
type PuzzleType = '222'|'333'|'444'|'555'|'666'|'777';
type Penalty = 'NONE'|'PLUS_TWO'|'DNF';
type ActivityLabel = 'MOVEMENT'|'PAUSE'|'UNCERTAIN';
type TimingSource = 'KEYBOARD'|'TOUCH'|'SMART_CUBE';
interface Session { id: string; userId: string; puzzle: PuzzleType; name: string; createdAt: string; updatedAt: string; }
interface Scramble { id: string; puzzle: PuzzleType; notation: string; generatorVersion: string; createdAt: string; }
interface Solve { id: string; userId: string; sessionId: string; scrambleId: string; puzzle: PuzzleType; rawTimeMs: number; penalty: Penalty; startedAt: string; completedAt: string; timingSource: TimingSource; notes?: string; }
interface Recording { id: string; userId: string; solveId: string; durationMs: number; mimeType: string; blobStorageKey?: string; timerStartOffsetMs: number; createdAt: string; }
interface ActivitySegment { startMs: number; endMs: number; label: ActivityLabel; confidence: number|null; }
interface SolveAnalysis { id: string; userId: string; solveId: string; recordingId: string; modelVersion: string; featureSchemaVersion: string; createdAt: string; segments: ActivitySegment[]; qualityWarnings: string[]; provenance: 'MODEL'|'BASELINE'|'MANUAL'; }
```

## Invariants
UUID IDs; UTC ISO dates; nonnegative finite integer millisecond durations; half-open `[startMs,endMs)` intervals, ordered and non-overlapping; confidence null or 0..1. DNF effectiveTimeMs is null; PLUS_TWO adds 2000; otherwise raw. Do not persist independently editable final times. A solve's puzzle matches its session and immutable scramble. Store version and provenance for every derived analysis.

## Security requirements
All user-owned rows have user_id foreign key to auth user, strict RLS policies for SELECT/INSERT/UPDATE/DELETE, and server-side ownership checks on relationships. RLS alone on a child row does not automatically validate cross-user foreign-key ownership; explicitly enforce ownership with policies/constraints/trusted functions. Private Storage bucket paths must be scoped and policy-protected; signed URLs are short-lived and never publicly exposed. Test users A and B in isolation. Never trust user_id from client payload.

## Idempotency and atomicity
Use stable solve ID or a unique completion token and server-enforced uniqueness. Import must run in one server transaction or equivalent RPC; sequential client writes are not atomic. Record deletions and cascading effects explicitly. Ensure failure handling cannot claim successful save or upload prematurely.

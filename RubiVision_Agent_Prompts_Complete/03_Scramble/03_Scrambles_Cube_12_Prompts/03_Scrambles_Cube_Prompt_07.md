# RubiVision AI — Scrambles/Cube — Prompt 07/12

## PROMPT 07 — Timer integration and exact scramble locking
**Agent instruction:** Integrate the scramble module with the existing timer state machine. Do not rewrite timer mechanics or timing calculations.

**Steps:**
1. Inspect the timer's actual `IDLE/HOLDING/READY/RUNNING/STOPPED` or equivalent states and event flow.
2. Define a single authoritative `activeScramble` snapshot at the exact transition committing to a solve; include `id`, `puzzle`, `notation`, and `generatorVersion`.
3. Ensure the user cannot start a valid solve without a ready scramble for the selected puzzle. Present a clear generation/retry state rather than creating a fake scramble.
4. Lock regeneration and puzzle changes during any state where a pending/active solve depends on the current scramble (including inspection/ready if applicable).
5. Keep the snapshot unchanged through timer ticks, tab visibility changes, rerenders, route navigation and asynchronous generator responses.
6. On valid stop, emit the exact scramble snapshot with the solve completion event; prevent duplicate stop handling from creating multiple completion events.
7. On cancel/reset, define and test whether the same scramble remains for a retry. On successful save, generate the next scramble only after the previous solve's association is safely committed.
8. Preserve monotonic timer accuracy; scramble generation must never run synchronously on the timing-critical path.

**Suggested files:** existing timer coordinator/provider integration, `features/scramble/useScramble.ts`, targeted integration tests.

**Tests:** scramble A shown → start → delayed scramble B returns → stop still references A; puzzle switch blocked mid-solve; duplicate stop; cancelled hold; inspection state; route change; generation failure does not destroy timing state.

**Acceptance:** The exact scramble shown for the attempt is the scramble attached to its completion event.

---

# Shared project instructions (apply to this prompt)

## Purpose and scope
This is an expanded, executable work plan for RubiVision AI's scramble generation and optional cube visualization module. Implement each prompt **in order**, one agent task at a time. The original `03_Scrambles_Cube.md` remains the category summary. The shared `00_MASTER_INSTRUCTIONS.md`, `00_DATA_CONTRACTS.md`, `00_PROJECT_ROADMAP.md`, and `00_INTEGRATION_CHECKLIST.md` remain authoritative for cross-module behavior. The project master specification prioritizes a dependable 3×3 MVP; the category roadmap extends scramble generation to 2×2–7×7, while visualization is optional and must never delay timing.

**Critical distinction:** A WCA-style scramble is not automatically an officially WCA-certified scramble. Do not claim TNoodle or official competition compliance without verifying the exact implementation, regulations, and distribution requirements. A scramble-derived visual state is not a camera-observed physical cube state.

### Shared agent execution protocol (apply to EVERY prompt below)
1. Inspect the actual repository, package manager, source tree, existing scramble/timer/storage code, tests, and versions before editing. Read the four `00_*` files and this category guide. Do not assume suggested paths exist.
2. Report what exists, the exact files you intend to modify, and a concise plan. If prerequisite modules are missing, use the smallest typed adapter or stop with a documented blocker; do not invent a working dependency.
3. Implement only the assigned prompt, without broad refactors. Use strict TypeScript, explicit error states, cancellation, and accessible React UI where relevant.
4. Write tests for normal behavior, failure behavior, and concurrency. Run available lint, typecheck, unit/integration tests, and production build. State commands and real outcomes; never fabricate passes.
5. Finish with: changed files; decisions/dependency versions; behavior demonstrated; test evidence; known limitations; contract changes; and the exact next prompt to run. Commit/checkpoint if the workflow supports it.
6. Preserve timer reliability, offline use, stable scramble IDs, and solve-to-scramble integrity. Do not create a new database schema inside a React component.

### Canonical contracts and invariants
Use existing shared types if present; otherwise coordinate these contracts with the foundation module:

```ts
export type PuzzleType = '222' | '333' | '444' | '555' | '666' | '777';
export interface Scramble {
  id: string;              // stable UUID
  puzzle: PuzzleType;
  notation: string;        // exact displayed sequence, never silently rewritten
  generatorVersion: string;// identifiable library/algorithm version
  createdAt: string;       // ISO 8601 UTC
}
export interface ScrambleService {
  generate(puzzle: PuzzleType): Promise<Scramble>;
}
```

A solve references one immutable `scrambleId`, and its puzzle matches the scramble puzzle. The currently visible scramble must be captured at solve start and must not change until the solve is safely completed/aborted according to timer rules. Generation can be async; stale results must never replace a newer request. A viewer failure cannot prevent generating, timing, or saving a solve. Persist scrambles via the storage/repository layer; do not implement an isolated competing persistence system.



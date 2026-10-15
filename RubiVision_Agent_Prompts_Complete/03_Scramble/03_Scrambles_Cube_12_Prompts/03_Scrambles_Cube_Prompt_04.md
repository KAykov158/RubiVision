# RubiVision AI — Scrambles/Cube — Prompt 04/12

## PROMPT 04 — Async coordination, stale-response rejection and cancellation
**Agent instruction:** Create a scramble request coordinator/hook that safely handles repeated requests, puzzle changes, and slow generator initialization.

**Steps:**
1. Model states such as `idle`, `loading`, `ready`, `error` with current scramble and request identity.
2. Assign a monotonically increasing request token for every generation request; only the newest eligible request can update visible state.
3. When puzzle changes, invalidate pending requests from the previous puzzle immediately. Reject results whose puzzle differs from the current selection.
4. Prevent duplicate concurrent requests caused by rapid button presses, or explicitly support last-request-wins semantics; document which is used.
5. Use AbortSignal only where the underlying API supports cancellation; otherwise ignore stale completions without pretending computation stopped.
6. Preserve the previous valid scramble on recoverable generation failure where safe; display a clear retry action and do not show the old scramble as if it belonged to a newly selected puzzle.
7. Handle unmount and route changes without setting state on an obsolete consumer; coordinate with global timer ownership.
8. Integrate a lock flag supplied by the timer so generation is forbidden or deferred while a scramble is committed to an active solve.

**Suggested files:** `features/scramble/scrambleCoordinator.ts`, `useScramble.ts`, coordinator tests.

**Tests:** two out-of-order promises; rapid regenerate; puzzle switch during generation; rejection after success; unmount; lock while running; retry after failure.

**Acceptance:** The UI never displays a stale scramble from an older request or wrong puzzle.

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



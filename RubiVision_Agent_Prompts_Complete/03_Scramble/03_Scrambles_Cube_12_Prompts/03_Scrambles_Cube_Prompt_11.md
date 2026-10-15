# RubiVision AI — Scrambles/Cube — Prompt 11/12

## PROMPT 11 — Cross-module automated regression and resilience testing
**Agent instruction:** Verify the entire required scramble flow against realistic concurrency, persistence and UI failures. Do not add unrelated features.

**Steps:**
1. Build unit tests for puzzle mapping, domain validation, parser, generator errors, request coordination, and lock policy.
2. Add integration tests for puzzle selection → generate → display → timer start → stop → save → history → reload.
3. Use deterministic mocks for async race tests; avoid brittle assertions that a random scramble must equal a particular string.
4. Verify stale generator response rejection, rapid clicks, double stop, wrong-puzzle result, no worker, offline mode, storage failure, and route navigation.
5. If optional viewer exists, verify scramble/inverse identities and graceful fallback without WebGL.
6. Run tests in available browser environments, including mobile viewport and keyboard input. Note missing coverage honestly.
7. Run typecheck, lint, test and build scripts. Record exact commands, environment, versions and results.
8. Update `00_INTEGRATION_CHECKLIST.md` only for cases actually verified, with date/commit/environment.

**Suggested files:** `tests/unit/scramble/*`, `tests/integration/scramble-timer.test.ts`, `tests/e2e/scramble-flow.spec.ts`, checklist updates.

**Acceptance:** The required path works end-to-end; failures are visible and non-destructive; tests are reported with actual outcomes.

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



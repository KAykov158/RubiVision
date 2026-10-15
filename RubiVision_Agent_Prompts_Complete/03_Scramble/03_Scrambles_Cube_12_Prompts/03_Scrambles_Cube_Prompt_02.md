# RubiVision AI — Scrambles/Cube — Prompt 02/12

## PROMPT 02 — Domain models, validation and error contracts
**Agent instruction:** Implement or reuse strictly typed scramble contracts and validation utilities without implementing generation or UI.

**Steps:**
1. Reuse the canonical `PuzzleType` union and `Scramble` interface; add runtime puzzle-type guards at external boundaries.
2. Ensure `id` is generated with a supported UUID mechanism, timestamps are UTC ISO 8601, and `notation` is nonempty and preserved verbatim once accepted.
3. Define typed service errors or discriminated error results for unsupported puzzle, generator unavailable, invalid output, cancellation, and internal failure. Keep public service contract compatible with `Promise<Scramble>` where possible.
4. Implement schema validation for scramble records loaded from storage/import; reject malformed IDs, invalid puzzle values, invalid timestamps, and absent provenance.
5. Decide whether whitespace normalization is permitted **before creation**; never alter a stored scramble string on later read/display. Separate raw generation output from persisted canonical text.
6. Document immutable scramble lifecycle and ownership: service generates, coordinator selects, repository persists, timer consumes snapshot.

**Suggested files:** `features/scramble/types.ts`, `scrambleValidation.ts`, `scrambleErrors.ts`, shared types only if absent.

**Tests:** all six puzzle values accepted; unknown puzzle rejected; missing/invalid fields rejected; UTC timestamp verified; immutable record not silently mutated; UUID uniqueness in a reasonable generated sample (without claiming mathematical proof).

**Acceptance:** Types compile under strict TypeScript and existing data contracts remain compatible.

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



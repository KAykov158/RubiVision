# RubiVision AI — Scrambles/Cube — Prompt 08/12

## PROMPT 08 — Storage, solve linkage and generator provenance
**Agent instruction:** Integrate scramble records with the existing repository/IndexedDB layer owned by module 04. Do not create independent localStorage records or duplicate stores.

**Steps:**
1. Inspect `Scramble`, `Solve`, `Session`, repository APIs and schema migrations. Coordinate with the storage module if the necessary store does not exist.
2. Persist immutable scramble records with stable UUID, puzzle, exact notation, generatorVersion and UTC creation time.
3. Ensure `Solve.scrambleId` references a stored scramble and `Solve.puzzle` matches `Scramble.puzzle`; enforce the existing session puzzle policy.
4. Use an atomic transaction for scramble/solve association when supported; define rollback/retry behavior when quota or transaction failure occurs.
5. Ensure save-once semantics on duplicate stop/save events and reload edge cases, coordinated with solve repository idempotency.
6. Do not regenerate or replace a scramble when displaying history. History must resolve the exact persisted notation, including after library upgrades.
7. Define whether unused generated scrambles are stored immediately or only when associated with a solve. Prefer an explicit documented policy and no orphan accumulation.
8. Support export/import and migrations through the canonical contracts without changing old scramble provenance or silently losing references.

**Suggested files:** existing `storage/repositories.ts`, `features/solves/solveService.ts`, schema migrations, integration tests. Ownership remains with module 04.

**Tests:** save/reload exact scramble; library version upgrade preserves history; puzzle mismatch rejected; failed transaction has no orphan solve; duplicate save idempotent; import/export references intact.

**Acceptance:** Every persisted solve has a valid immutable scramble record and the exact displayed notation can be retrieved later.

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



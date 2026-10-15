# RubiVision AI — Scrambles/Cube — Prompt 03/12

## PROMPT 03 — Verified scramble generator and 2×2–7×7 puzzle mapping
**Agent instruction:** Implement a real puzzle-aware scramble service using a maintained browser-compatible library, verifying its actual installed API and license. Do not create a naive random-face generator and label it WCA-compliant.

**Steps:**
1. Compare available maintained scramble libraries, especially `cubing.js` if compatible. Verify version, module entry points, browser/offline behavior, event IDs and algorithm APIs against installed documentation/source.
2. Map each canonical puzzle to the verified generator event: 222, 333, 444, 555, 666, 777. Keep mappings in one typed module, with explicit errors for unsupported events.
3. Generate asynchronously. Use a version/provenance string identifying the actual generator and its version; do not hardcode an unverified version.
4. Validate returned notation using the chosen library's parser/grammar and puzzle-specific rules. Handle generator initialization, worker startup and rejection.
5. Ensure randomness comes from the vetted generator; avoid time-based custom pseudorandom shortcuts.
6. Prevent accidental mutation of a previously issued scramble. New requests return new UUIDs even if a coincidentally identical notation is produced.
7. Evaluate offline availability after initial installation and production bundling; identify worker assets that must be bundled or cached.
8. Document differences between WCA-style event scrambles, random-state generation, and official competition scrambles; only assert properties actually verified.

**Suggested files:** `features/scramble/scrambleService.ts`, `generatorAdapter.ts`, `puzzleEventMap.ts`, `scrambleService.test.ts`.

**Tests:** generate for each puzzle; verify nonempty parseable output and correct event mapping; unique IDs; known generator failure yields visible typed error; output includes actual provenance; production bundle resolves generator/worker assets.

**Acceptance:** Six supported events can generate valid sequences in the tested environment without blocking the timer. If the chosen library cannot support an event, explicitly report it rather than silently falling back to fake official output.

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



# RubiVision AI — Scrambles/Cube — Prompt 10/12

## PROMPT 10 — Optional 2D/3D scramble preview and rendering resilience
**Agent instruction:** Implement a viewer of the **generated scramble state**, not a live scan, exact solve replay or motion-derived cube state.

**Steps:**
1. Evaluate the chosen rendering package (for example `cubing.js` puzzle components or Three.js) and confirm exact APIs, license, asset loading, browser compatibility, and puzzle support.
2. Provide a 2D net or 3D viewer for actually supported puzzles. Show a clear static/disabled state for unsupported events.
3. Initialize viewer lazily/dynamically to avoid delaying the timer and scramble display. If WebGL is unavailable, offer a 2D or text-only fallback when feasible.
4. Feed the viewer the same immutable scramble snapshot as the text; update only when the committed displayed scramble changes.
5. Define reset-to-solved, show-scrambled and orientation controls if supported. Never imply the viewer tracks the physical cube.
6. Handle long algorithms and rapid scramble changes without race conditions or mismatched viewer/text states.
7. Ensure mobile layout, keyboard accessibility, reduced-motion preference, and cleanup of WebGL contexts/listeners on unmount.
8. Show an explicit label such as `Preview of generated scramble` and an explanation that camera-derived cube recognition is a separate experimental feature.

**Suggested files:** `features/cube/CubeViewer.tsx`, `CubeViewerFallback.tsx`, `useCubeViewer.ts`, component tests.

**Tests:** text/viewer state identity; WebGL unavailable; unsupported puzzle; rapid regeneration; lazy-load failure; navigation cleanup; narrow screen.

**Acceptance:** Preview accurately reflects known generated state where supported and cannot block or corrupt core timing.

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



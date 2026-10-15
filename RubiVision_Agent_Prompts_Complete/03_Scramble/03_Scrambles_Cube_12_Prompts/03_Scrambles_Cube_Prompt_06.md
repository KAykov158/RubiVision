# RubiVision AI — Scrambles/Cube — Prompt 06/12

## PROMPT 06 — Scramble display, puzzle selection and user actions
**Agent instruction:** Implement an accessible, responsive scramble interface without directly generating random moves in React components.

**Steps:**
1. Display current puzzle (2×2–7×7), scramble text, generation status, and clear error/retry feedback.
2. Provide a regenerate control and copy-to-clipboard control; report copy success only after the clipboard API succeeds. Offer a safe fallback/error when clipboard permission is unavailable.
3. Provide a puzzle selector connected to the session/puzzle policy. Changing puzzle must not silently relabel the existing session or scramble.
4. Format long scrambles for mobile wrapping and desktop readability; use legible font sizing and preserve primes, spaces and wide-move notation.
5. Add accessible button labels, keyboard focus states, status announcements (`aria-live` where appropriate), and avoid focus traps.
6. Disable or explain regeneration/puzzle change when timer state locks the scramble; do not silently alter the active scramble.
7. Provide loading placeholders without changing timer controls or stealing the Space key from the timer.
8. Keep visual state derived from the typed coordinator; no direct IndexedDB access in components.

**Suggested files:** `features/scramble/ScrambleDisplay.tsx`, `PuzzleSelector.tsx`, `ScrambleActions.tsx`, styles and UI tests.

**Tests:** loading/ready/error views; copy success/failure; narrow viewport; keyboard access; regeneration locked during solve; puzzle selector updates request target.

**Acceptance:** A user can select an event, read, copy and regenerate a valid scramble with no accidental timer input.

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



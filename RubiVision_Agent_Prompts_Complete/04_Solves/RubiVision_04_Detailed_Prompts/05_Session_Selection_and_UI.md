# RubiVision AI — 04.05 — Session selection and management UI

**Standalone coding-agent prompt.** This is one deliverable, not the whole module.

## Mandatory agent protocol
You are implementing ONE incremental task in the existing RubiVision AI repository. Before coding, inspect package.json, source tree, relevant implementations and tests; read `00_MASTER_INSTRUCTIONS.md`, `00_DATA_CONTRACTS.md`, `00_PROJECT_ROADMAP.md`, `00_INTEGRATION_CHECKLIST.md`, and `04_Solves_Storage.md`. Do not assume suggested paths exist. Preserve working code and strict TypeScript contracts. Keep domain logic separate from UI and IndexedDB. Do not implement subsequent prompts. State a concise plan, implement, add tests, run available typecheck/lint/tests/build, and report actual commands/results, changed files, unresolved issues and integration requirements. Do not claim unrun tests passed. If upstream dependencies are absent, implement only a minimal typed adapter or document the blocker.

## Shared invariants
- Stable UUID IDs; timestamps are ISO-8601 UTC; duration values are finite nonnegative integer milliseconds.
- Puzzle types: `222`, `333`, `444`, `555`, `666`, `777`; penalties: `NONE`, `PLUS_TWO`, `DNF`.
- `effectiveTimeMs(solve)` returns `null` for DNF, `rawTimeMs + 2000` for PLUS_TWO, otherwise raw time. Never persist a conflicting effective time.
- Every solve references an existing immutable scramble and compatible session/puzzle; timer/camera/AI must not be required for history browsing.
- IndexedDB is the offline source of truth; React components must use services/repositories, not database APIs.

## Prerequisites
Complete and verify preceding applicable prompts; inspect actual repository state before assuming they are finished.

## Objective and exact implementation scope
Implement session selector and create/rename dialogs integrated through session service. Persist selected session ID in a suitable local setting, validate selection on reload, and choose a documented fallback when selected session was deleted. Filter session choices by selected puzzle, or explicitly coordinate puzzle switching. Provide loading/empty/error states, accessible keyboard controls and confirmation for changes with consequences. Do not reset a running timer when switching views; disable or defer session switching while a solve is active unless the timer contract guarantees a stable snapshot.

## Suggested implementation targets (adapt to repository)
`types/solve.ts`, `types/session.ts`, `storage/database.ts`, `storage/migrations.ts`, `features/solves/solveRepository.ts`, `features/solves/solveService.ts`, `features/solves/HistoryPage.tsx`, `features/solves/SolveTable.tsx`, and matching tests. Touch only the files relevant to this specific task; do not create empty scaffolding for unrelated targets.

## Verification and acceptance criteria
- Session create/rename/select works with keyboard and pointer.
- Selection survives reload and missing saved selection recovers safely.
- A solve cannot be assigned to a session chosen halfway through timing.
- Empty and failed-storage states remain usable.

## Required agent response
1. Repository findings and brief plan before editing.
2. Implemented behavior and exact files modified.
3. Tests added and exact commands run with observed results.
4. Manual verification steps and error/edge-case handling.
5. Remaining blockers, contract deviations and next prompt readiness.

**Stop after this prompt. Do not start the next prompt automatically.**

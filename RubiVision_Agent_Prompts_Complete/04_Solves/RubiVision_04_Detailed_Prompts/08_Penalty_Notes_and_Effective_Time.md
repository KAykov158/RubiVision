# RubiVision AI — 04.08 — Solve edits, penalties and notes

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
Add repository/service methods `updatePenalty(id, penalty)` and `updateNotes(id, notes)`, with validation and atomic record updates. Preserve rawTimeMs, scrambleId, original timestamps and ID on edits. Document reasonable note length, blank note normalization and conflict behavior for simultaneous edits. Expose pure effective-time formatter integration; display DNF as status, not numeric 0. Ensure updates invalidate/recompute statistics via existing state/query subscription, without directly modifying statistics tables.

## Suggested implementation targets (adapt to repository)
`types/solve.ts`, `types/session.ts`, `storage/database.ts`, `storage/migrations.ts`, `features/solves/solveRepository.ts`, `features/solves/solveService.ts`, `features/solves/HistoryPage.tsx`, `features/solves/SolveTable.tsx`, and matching tests. Touch only the files relevant to this specific task; do not create empty scaffolding for unrelated targets.

## Verification and acceptance criteria
- NONE -> PLUS_TWO -> DNF -> NONE preserves raw time.
- Invalid penalty, overlong notes and missing ID fail visibly.
- Edits persist after reload and update history/detail/statistics views.
- No stored derived final time becomes stale.

## Required agent response
1. Repository findings and brief plan before editing.
2. Implemented behavior and exact files modified.
3. Tests added and exact commands run with observed results.
4. Manual verification steps and error/edge-case handling.
5. Remaining blockers, contract deviations and next prompt readiness.

**Stop after this prompt. Do not start the next prompt automatically.**

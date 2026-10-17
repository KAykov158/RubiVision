# RubiVision AI — Sessions, solve history and local persistence

## Assigned topic
Sessions, solve history and local persistence

## Suggested files (adapt to existing repository)
features/solves/solveService.ts, solveRepository.ts, SolveTable.tsx, HistoryPage.tsx, storage/database.ts, migrations.ts, repositories.ts, types/solve.ts, types/session.ts

## Implementation requirements
Define typed Solve, Scramble, Session entities with stable UUIDs, ISO UTC timestamps, millisecond durations and penalty enum NONE/PLUS_TWO/DNF. Save each completed solve exactly once. Add create/rename/select/delete sessions, edit penalty/notes, filter/sort history, confirm delete, inspect linked scramble. Use IndexedDB (Dexie acceptable), schema migrations and quota handling. Compute effective time from raw time + penalty; DNF has no ranking value.

## Acceptance tests and edge cases
Reload persistence, transaction safety, migration test, no duplicated solves, updates propagate to statistics, quota failure visible.

## Agent operating instructions
You are an AI coding agent working on the existing RubiVision AI repository. First inspect the repository, package.json, current architecture, existing files, tests, and dependencies. Do not assume the proposed paths already exist or rebuild working features. State a short plan, implement ONLY this topic and necessary typed integration points, and preserve unrelated behavior. Use strict TypeScript for the web application; Python is allowed for offline dataset/training scripts. Write meaningful unit/integration tests and error states. Run available typecheck, tests and build, and report actual results. Do not fabricate test passes, measured ML performance, cube-state recognition, or completed features. For any ambiguous dependency, document a sensible choice. Output changed files, behavior, validation steps, limitations and next integration needs.

## Completion definition
The topic is complete only when its acceptance cases are demonstrably met, tests are run, and integration contracts are documented. Do not implement unrelated optional modules.

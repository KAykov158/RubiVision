# RubiVision AI / Statistics — Task 07: Repository integration and live refresh

## Goal and exact implementation requirements
Add a thin statistics service/hook that reads existing SolveRepository, accepts typed filters, invokes pure selectors, and exposes loading, ready, empty, and error states. Subscribe to existing repository notifications or invalidate queries on save, delete, penalty edit, session reassignment and import; do not create a second source of truth. Guard stale asynchronous responses with cancellation/request version. Prevent chart crashes on IndexedDB rejection or malformed legacy records. Do not directly access storage in presentation components. Keep memory bounded for normal solve histories and avoid recomputation on unrelated UI renders.
Integration tests: create solve -> stats update; +2 -> recalc; DNF -> recalc; delete -> recalc; switch session; rapid filters; repository failure; reload persistence. Use existing test harness or minimal mocks.

## Boundaries and handoff
Work only on this task plus necessary typed integration. If a dependency is missing, document it and stop or provide a minimal tested interface. Return a checklist of acceptance criteria with evidence, actual command outputs summarized, and the next task to execute.

## Mandatory agent protocol
Read `00_MASTER_INSTRUCTIONS.md`, `00_DATA_CONTRACTS.md`, `00_PROJECT_ROADMAP.md`, `00_INTEGRATION_CHECKLIST.md`, and original `05_Statistics.md`. Inspect actual repository, package scripts, types, and tests before editing. Suggested paths are NOT guaranteed. Preserve working functionality; do not implement unrelated modules. Keep strict TypeScript, pure computation, and typed interfaces. Before edits state plan and files. After edits run available tests, typecheck, lint, build; report actual outcomes, changes, remaining blockers. Never fabricate success. If prerequisite repository contracts are missing, create the smallest typed adapter or report blocker. No React component may query IndexedDB directly. Do not persist derived statistics as competing source of truth.

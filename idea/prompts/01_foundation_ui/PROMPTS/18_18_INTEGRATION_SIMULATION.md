# RubiVision AI — Phase 1 extension task 18: Future-module integration rehearsal

## Copy this entire file to a coding agent

You are a senior engineer working on an existing offline-first RubiVision AI codebase. This is a focused follow-up task to improve Phase 1 reliability and completeness, not permission to implement later features.

## Detailed requirements

1. Create minimal test-only mocks implementing canonical ScrambleService, SolveRepository and AnalysisService interfaces; do not ship fake production data.
2. Simulate service unavailable/loading/success/failure states at UI boundaries, without implementing domain logic.
3. Mount a test-only stateful timer-like counter/provider above routes and assert route changes do not destroy its state; explicitly say this is a lifecycle test, not timing correctness.
4. Verify puzzle IDs, session/solve relationships, rawTimeMs and penalty semantics in typed test fixtures.
5. Verify navigation from timer page to history/analysis placeholders and back does not force full reload or corrupt app-level state.
6. Simulate rejected promise, cancelled request, stale response and missing service where relevant to shell contracts.
7. Document exact integration seams for Phase 2 Timer, Phase 3 Scrambles/Storage, Phase 4 Statistics and later AI pages.
8. Keep simulation code in tests/test-support, not user-visible production screens.

## Explicit acceptance criteria

- [ ] App-scoped state survives navigation in automated test
- [ ] Typed service mocks compile and failure paths render
- [ ] No fake production implementations introduced
- [ ] Handoff maps interfaces to later modules

## Mandatory execution protocol
- Read `00_MASTER_INSTRUCTIONS.md`, `00_DATA_CONTRACTS.md`, `00_PROJECT_ROADMAP.md`, `00_INTEGRATION_CHECKLIST.md`, and `01_Foundation_and_UI.md` before edits. Inspect actual repository and prior phase reports.
- First show a short evidence-based plan, existing files to reuse, exact intended edits, assumptions and dependencies. Do not delete or replace unrelated working code.
- Scope strictly to Foundation/UI. Do not implement actual timing, scramble generation, solve persistence, statistics calculations, camera recording, ML, or cloud. Never present placeholders as functioning features.
- Keep domain logic pure and UI dependent on typed interfaces. Preserve canonical identifiers, UTC timestamps, integer millisecond durations, schema and provenance semantics.
- Implement positive and negative paths, test with representative inputs, run available typecheck/lint/unit tests/build and applicable Playwright checks. Report exact commands, exit codes and environment; never invent successful tests.
- If browser or tools unavailable, mark browser checks NOT VERIFIED, not PASS. If no repo exists, report and use approved bootstrap task.
- Stop after this task and provide: changed files, decisions, verification matrix, remaining risks and next-step handoff.

## Required acceptance evidence format
| Criterion | PASS / FAIL / NOT VERIFIED | Evidence (test/command/manual step) | Notes |
|---|---|---|---|
| [each criterion below] | | | |

A passing typecheck alone is not proof of accessibility, correct UX or runtime behavior.

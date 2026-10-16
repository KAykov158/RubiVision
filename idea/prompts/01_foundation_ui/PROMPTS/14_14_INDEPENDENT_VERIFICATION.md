# RubiVision AI — Phase 1 extension task 14: Independent code review and defect remediation

## Copy this entire file to a coding agent

You are a senior engineer working on an existing offline-first RubiVision AI codebase. This is a focused follow-up task to improve Phase 1 reliability and completeness, not permission to implement later features.

## Detailed requirements

1. Act as a skeptical reviewer. Re-read specifications, recent diff, architecture docs, tests and implementation; do not trust prior agent summary.
2. Review route configuration, app-scoped providers, service injection, theme persistence, error boundaries, lifecycle cleanup, test isolation, TypeScript strictness and design-token usage.
3. Trace import graph from each page to confirm no direct IndexedDB writes, timer logic or model internals inside views.
4. Search for placeholders that look functional, hardcoded demo statistics, fabricated saves, inaccessible controls and misleading camera permissions.
5. Attempt negative flows: corrupted settings, missing service, route error, empty state, unknown path, reload, back/forward, viewport resize, keyboard-only.
6. Rank findings P0 blocker, P1 important, P2 polish; give file/line and reproduction evidence.
7. Fix only Phase 1 defects, add regression tests and rerun affected checks; record unfixed issues explicitly.
8. Create `docs/phase1/independent-review.md` with findings, reproduction steps, fixes, test outputs and remaining risk.

## Explicit acceptance criteria

- [ ] Review cites concrete source locations and reproduction
- [ ] Critical Phase 1 defects fixed or clearly blocked
- [ ] Regression tests cover fixed defects
- [ ] Report distinguishes checked and unchecked behavior

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

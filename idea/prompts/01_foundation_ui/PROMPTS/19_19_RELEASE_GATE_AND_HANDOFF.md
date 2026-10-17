# RubiVision AI — Phase 1 extension task 19: Release gate, deployment readiness and agent handoff

## Copy this entire file to a coding agent

You are a senior engineer working on an existing RubiVision AI codebase governed by the Supabase-only architecture. This is a focused follow-up task to improve Phase 1 reliability and completeness, not permission to implement later features.

## Detailed requirements

1. Audit all Foundation/UI requirements against original spec and shared checklist, identifying evidence for each.
2. Run clean install when possible, typecheck, lint, unit tests, build, browser smoke tests and security audit; preserve actual command logs.
3. Validate README commands on a fresh checkout where feasible, document Node/package manager versions and environment setup.
4. Verify SPA deep-link refresh behavior on intended hosting or document rewrite rule needed; do not claim deployed if no deployment.
5. Check 404, offline messaging, theme reload, mobile layout, keyboard access, error boundaries and route lifecycle.
6. Generate `docs/phase1/completion-report.md` with PASS/FAIL/NOT VERIFIED per requirement, environment, date, commit, failures and known limitations.
7. Generate `docs/phase1/phase2-timer-handoff.md` defining provider lifetime, event boundaries, view model and test hooks without coding timer.
8. Update `00_INTEGRATION_CHECKLIST.md` only for items verified by tests; do not check off Phase 2+ functionality.
9. Do not declare graduation MVP complete; only declare Phase 1 ready if all required Phase 1 gates pass.

## Explicit acceptance criteria

- [ ] Completion report grounded in executed tests
- [ ] Fresh-start instructions verified or marked unverified
- [ ] Deep links documented
- [ ] Phase 2 handoff actionable and contract-compatible

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

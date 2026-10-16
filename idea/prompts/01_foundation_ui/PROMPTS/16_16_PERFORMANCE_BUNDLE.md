# RubiVision AI — Phase 1 extension task 16: Performance and bundle audit

## Copy this entire file to a coding agent

You are a senior engineer working on an existing RubiVision AI codebase governed by the Supabase-only architecture. This is a focused follow-up task to improve Phase 1 reliability and completeness, not permission to implement later features.

## Detailed requirements

1. Establish repeatable production baseline: build output, JS/CSS asset sizes, routes and largest dependencies. Do not invent Lighthouse scores.
2. Inspect eager imports and route bundles; lazy-load page shells when justified, keeping app-scoped providers stable.
3. Check for unnecessary icon libraries, duplicate UI packages, heavy chart/video dependencies accidentally loaded in Phase 1.
4. Measure navigation responsiveness and initial render where tooling permits, specifying hardware and measurement method.
5. Use browser Performance panel or Lighthouse only if available; capture actual metrics and uncertainty.
6. Optimize image sizing, CSS and font loading, avoid layout shifts and unnecessary effects; do not introduce external tracking.
7. Verify reduced-motion preference, no uncontrolled animations, no expensive render loops and no mock timer intervals.
8. Compare before/after build size and behavior; preserve accessibility and correct routes.

## Explicit acceptance criteria

- [ ] Baseline and post-change build sizes recorded
- [ ] No unused heavy future-feature bundle on initial load
- [ ] Changes do not break routes/themes/tests
- [ ] Performance metrics sourced from real runs or NOT VERIFIED

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

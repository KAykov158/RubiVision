# RubiVision AI — Phase 1 extension task 15: Browser and device compatibility matrix

## Copy this entire file to a coding agent

You are a senior engineer working on an existing RubiVision AI codebase governed by the Supabase-only architecture. This is a focused follow-up task to improve Phase 1 reliability and completeness, not permission to implement later features.

## Detailed requirements

1. Inspect browsers available locally and CI. Target latest stable Chromium, Firefox and WebKit via Playwright when supported; document actual versions, not assumptions.
2. Create reproducible tests for route navigation, reload, theme persistence, focus, keyboard menu, touch interactions, error boundary and 404.
3. Test widths 320, 375, 768, 1024, 1440; include device pixel ratio changes if supported. Check document scrollWidth vs viewport width and screenshot overflow.
4. Check browser storage denial fallback and private/incognito limitations where feasible; avoid assuming browser permissions can be automated in every environment.
5. Verify no camera/model/network dependency for foundation pages; simulate offline after initial app load, and distinguish this from true cold-start offline capability.
6. Check CSS support, font fallbacks, reduced motion, high zoom and long text labels; document limitations.
7. Capture matrix with browser, OS, viewport, result, test ID, screenshots and blockers.
8. Only add targeted compatibility fixes and regression tests; do not add broad polyfills without evidence.

## Explicit acceptance criteria

- [ ] Matrix lists actually executed browsers
- [ ] Critical routes and themes tested at target widths
- [ ] Offline claim matches tested behavior
- [ ] Unsupported environments marked NOT VERIFIED

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

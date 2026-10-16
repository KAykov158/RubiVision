# RubiVision AI — Phase 1 extension task 13: Detailed UI design blueprint

## Copy this entire file to a coding agent

You are a senior engineer working on an existing offline-first RubiVision AI codebase. This is a focused follow-up task to improve Phase 1 reliability and completeness, not permission to implement later features.

## Detailed requirements

1. Inventory every current page and component, then write `docs/phase1/ui-blueprint.md` as a design contract before implementation.
2. Define token names and sample defaults for light/dark themes (background, surface, elevated surface, foreground, muted, border, accent, success, warning, danger), with WCAG-aware contrast checks; document any unverified contrast.
3. Define typography scale (caption 12–13px, body 14–16px, headings 20–32px, timer display responsive clamp), line heights, tabular numerals and consistent focus ring.
4. Define 4px-based spacing scale, border radii, content max-width, sidebar width and mobile navigation behavior as adjustable design decisions, not requirements of source spec.
5. Specify responsive behavior at 320, 375, 768, 1024 and 1440 CSS px; include overflow strategy for tables and wide scramble strings.
6. Create per-page wireframe descriptions for Timer, Solves, Statistics, Analyze, Challenges, Settings, including empty/loading/error/unavailable states.
7. Specify state transitions and component contracts for navigation drawer, theme toggle, dialogs, filters, loading indicators, errors, tooltips and future feature controls.
8. Write UI copy guidelines: no fake data, no 'WCA certified', no exact move/CFOP tracking, no AI result without model evidence.
9. Ensure design works with keyboard and touch; account for reduced motion, focus, aria labels and non-color status cues.
10. Do not replace current design automatically: identify differences and propose minimal changes; implement only approved small consistency fixes.

## Explicit acceptance criteria

- [ ] Blueprint includes every required route and state
- [ ] Token definitions are reusable and theme-aware
- [ ] Responsive and accessibility choices are documented
- [ ] No speculative feature represented as implemented

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

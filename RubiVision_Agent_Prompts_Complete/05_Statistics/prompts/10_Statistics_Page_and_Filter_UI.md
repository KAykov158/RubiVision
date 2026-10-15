# RubiVision AI / Statistics — Task 10: Statistics page composition and filters

## Goal and exact implementation requirements
Compose StatisticsPage with puzzle/session selectors, date range inputs, clear/reset actions, summary panel and charts. Use existing navigation and design tokens. Persist filter preference only if current settings conventions support it; never introduce undocumented storage. Show filter-specific empty state distinct from globally empty history, and a retry state for read errors. Keep URL/query state only if router supports it; avoid resetting timer when navigating. Ensure filter selections drive every displayed metric and graph consistently; indicate active filter scope in headings. Add a non-technical description of what averages mean.
Acceptance walkthrough: select 333/session A, add solve in A, verify update; select B, verify isolation; change date, verify chart and cards agree; clear filters; keyboard and touch navigation.

## Boundaries and handoff
Work only on this task plus necessary typed integration. If a dependency is missing, document it and stop or provide a minimal tested interface. Return a checklist of acceptance criteria with evidence, actual command outputs summarized, and the next task to execute.

## Mandatory agent protocol
Read `00_MASTER_INSTRUCTIONS.md`, `00_DATA_CONTRACTS.md`, `00_PROJECT_ROADMAP.md`, `00_INTEGRATION_CHECKLIST.md`, and original `05_Statistics.md`. Inspect actual repository, package scripts, types, and tests before editing. Suggested paths are NOT guaranteed. Preserve working functionality; do not implement unrelated modules. Keep strict TypeScript, pure computation, and typed interfaces. Before edits state plan and files. After edits run available tests, typecheck, lint, build; report actual outcomes, changes, remaining blockers. Never fabricate success. If prerequisite repository contracts are missing, create the smallest typed adapter or report blocker. No React component may query IndexedDB directly. Do not persist derived statistics as competing source of truth.

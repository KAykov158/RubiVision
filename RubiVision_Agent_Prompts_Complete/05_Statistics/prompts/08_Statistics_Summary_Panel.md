# RubiVision AI / Statistics — Task 08: Statistics summary UI

## Goal and exact implementation requirements
Implement reusable accessible summary widgets for total solves, valid solves, DNF rate, best, worst, mean, current ao5/ao12/ao50/ao100, best ao5/ao12/ao50/ao100. Label mean separately from trimmed average; display `DNF` for a DNF average and an em dash / explanatory `Need N solves` for insufficient data. Use existing timer formatter for consistent display when available; never round before computation. Expose sample sizes and help text describing trimmed averaging and +2. Responsive grid on desktop/mobile, keyboard focus and screen-reader labels. No fabricated placeholders that resemble real stats.
UI tests: 0 solves, 4 solves, exactly 5, DNF average, long times, high zoom, dark/light theme, screen reader announcements after filter changes.

## Boundaries and handoff
Work only on this task plus necessary typed integration. If a dependency is missing, document it and stop or provide a minimal tested interface. Return a checklist of acceptance criteria with evidence, actual command outputs summarized, and the next task to execute.

## Mandatory agent protocol
Read `00_MASTER_INSTRUCTIONS.md`, `00_DATA_CONTRACTS.md`, `00_PROJECT_ROADMAP.md`, `00_INTEGRATION_CHECKLIST.md`, and original `05_Statistics.md`. Inspect actual repository, package scripts, types, and tests before editing. Suggested paths are NOT guaranteed. Preserve working functionality; do not implement unrelated modules. Keep strict TypeScript, pure computation, and typed interfaces. Before edits state plan and files. After edits run available tests, typecheck, lint, build; report actual outcomes, changes, remaining blockers. Never fabricate success. If prerequisite repository contracts are missing, create the smallest typed adapter or report blocker. No React component may query IndexedDB directly. Do not persist derived statistics as competing source of truth.

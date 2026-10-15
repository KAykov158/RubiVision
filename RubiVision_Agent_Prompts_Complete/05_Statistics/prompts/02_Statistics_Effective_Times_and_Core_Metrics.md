# RubiVision AI / Statistics — Task 02: Effective times and core metrics

## Goal and exact implementation requirements
Implement small pure functions for effectiveTimeMs, total solve count, valid solve count, DNF count/rate, best valid solve, worst valid solve, arithmetic mean of valid solves, and selected-period count. No database or React imports. Mean excludes DNF but report validCount so users understand sample size. Best/worst ignore DNF; return null when none valid; stable tie behavior uses chronology then id. DNF rate = dnfCount / totalCount, null when totalCount=0. Do not silently exclude +2 solves: add 2000 ms. Do not mix puzzles for best/mean unless explicitly labeled an all-puzzles count. Decide and document treatment of corrupt negative/nonfinite times: reject at validated data boundary, never silently coerce. Never mutate Solve or persist effectiveTimeMs.
Tests: empty, all-DNF, one solve, equal times, +2, zero time if allowed by schema, 100% DNF, large safe integer limits, 3x3 versus 2x2 isolation. Include expected numeric values.

## Boundaries and handoff
Work only on this task plus necessary typed integration. If a dependency is missing, document it and stop or provide a minimal tested interface. Return a checklist of acceptance criteria with evidence, actual command outputs summarized, and the next task to execute.

## Mandatory agent protocol
Read `00_MASTER_INSTRUCTIONS.md`, `00_DATA_CONTRACTS.md`, `00_PROJECT_ROADMAP.md`, `00_INTEGRATION_CHECKLIST.md`, and original `05_Statistics.md`. Inspect actual repository, package scripts, types, and tests before editing. Suggested paths are NOT guaranteed. Preserve working functionality; do not implement unrelated modules. Keep strict TypeScript, pure computation, and typed interfaces. Before edits state plan and files. After edits run available tests, typecheck, lint, build; report actual outcomes, changes, remaining blockers. Never fabricate success. If prerequisite repository contracts are missing, create the smallest typed adapter or report blocker. No React component may query IndexedDB directly. Do not persist derived statistics as competing source of truth.

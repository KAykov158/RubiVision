# RubiVision AI / Statistics — Task 04: Rolling windows, current and best averages

## Goal and exact implementation requirements
Build pure rolling windows for ao5/ao12/ao50/ao100. For ordered solves S[0..k], window ending at i is S[i-N+1..i], inclusive; no result before N solves. Every DNF still occupies a slot. Current average is the final chronological window, even if DNF; best average is minimum valid rolling value, with earliest window as tie-breaker. If all complete windows are DNF, best returns null with clear no-valid-window status, not 0. Return data for chart series including endpoint solve ID, timestamp, window IDs and status. Use stable ordering once; avoid repeatedly sorting all solves inside every calculation. Prefer an understandable O(k*N log N) implementation initially, benchmark large history if necessary, optimize only with tests preserving behavior.
Tests: exactly N, N+1, 2N, no valid window, DNF enters/exits, +2 penalty edit recomputation, tied averages, chronology differs from array input order, independent puzzle/session subsets.

## Boundaries and handoff
Work only on this task plus necessary typed integration. If a dependency is missing, document it and stop or provide a minimal tested interface. Return a checklist of acceptance criteria with evidence, actual command outputs summarized, and the next task to execute.

## Mandatory agent protocol
Read `00_MASTER_INSTRUCTIONS.md`, `00_DATA_CONTRACTS.md`, `00_PROJECT_ROADMAP.md`, `00_INTEGRATION_CHECKLIST.md`, and original `05_Statistics.md`. Inspect actual repository, package scripts, types, and tests before editing. Suggested paths are NOT guaranteed. Preserve working functionality; do not implement unrelated modules. Keep strict TypeScript, pure computation, and typed interfaces. Before edits state plan and files. After edits run available tests, typecheck, lint, build; report actual outcomes, changes, remaining blockers. Never fabricate success. If prerequisite repository contracts are missing, create the smallest typed adapter or report blocker. No React component may query IndexedDB directly. Do not persist derived statistics as competing source of truth.

# RubiVision AI / Statistics — Task 06: Trend and histogram data preparation

## Goal and exact implementation requirements
Build chart-agnostic data transforms, not chart components. Provide solve-time scatter/line points with ISO timestamp, effective milliseconds and DNF status; never plot DNF as zero. Rolling-average series should show gaps/nulls for DNF and insufficient data; no interpolated fake values. Provide optional daily/weekly aggregated mean and solve count, with explicit timezone/binning policy. Histogram uses valid effective times only and documented bin boundaries [low, high) except final boundary as specified. Choose a stable deterministic bin-width rule or accept validated explicit width; guard zero spread, one solve, very large ranges and no valid solves. Output accessible textual summary inputs and units (ms). DNF count is separate.
Tests: bin-edge inclusion, constant times, missing dates, all DNF, +2 shifts bin, empty series, sparse dates, stable order.

## Boundaries and handoff
Work only on this task plus necessary typed integration. If a dependency is missing, document it and stop or provide a minimal tested interface. Return a checklist of acceptance criteria with evidence, actual command outputs summarized, and the next task to execute.

## Mandatory agent protocol
Read `00_MASTER_INSTRUCTIONS.md`, `00_DATA_CONTRACTS.md`, `00_PROJECT_ROADMAP.md`, `00_INTEGRATION_CHECKLIST.md`, and original `05_Statistics.md`. Inspect actual repository, package scripts, types, and tests before editing. Suggested paths are NOT guaranteed. Preserve working functionality; do not implement unrelated modules. Keep strict TypeScript, pure computation, and typed interfaces. Before edits state plan and files. After edits run available tests, typecheck, lint, build; report actual outcomes, changes, remaining blockers. Never fabricate success. If prerequisite repository contracts are missing, create the smallest typed adapter or report blocker. No React component may query IndexedDB directly. Do not persist derived statistics as competing source of truth.

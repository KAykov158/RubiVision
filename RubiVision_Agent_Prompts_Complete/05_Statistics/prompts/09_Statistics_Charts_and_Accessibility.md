# RubiVision AI / Statistics — Task 09: Interactive charts and accessibility

## Goal and exact implementation requirements
Integrate the repository's existing chart library, or select a maintained accessible React library after inspecting dependencies. Build solve-time trend, rolling-average trend and distribution histogram from transform outputs. Clearly label axes, units, tooltips, DNF gaps, legends and filtered period. Provide accessible alternative HTML table or textual summaries for every chart, not color-only distinctions. Do not plot nonexistent points. Handle thousands of solves through reasonable sampling or virtualization without changing calculated stats; disclose visual downsampling. Respect reduced-motion settings and small screens. Keep chart interaction independent of timer state.
Tests/manual checks: keyboard chart access, no data, all DNF, one point, dense history, mobile 320px, zoom 200%, reduced motion, light/dark contrast.

## Boundaries and handoff
Work only on this task plus necessary typed integration. If a dependency is missing, document it and stop or provide a minimal tested interface. Return a checklist of acceptance criteria with evidence, actual command outputs summarized, and the next task to execute.

## Mandatory agent protocol
Read `00_MASTER_INSTRUCTIONS.md`, `00_DATA_CONTRACTS.md`, `00_PROJECT_ROADMAP.md`, `00_INTEGRATION_CHECKLIST.md`, and original `05_Statistics.md`. Inspect actual repository, package scripts, types, and tests before editing. Suggested paths are NOT guaranteed. Preserve working functionality; do not implement unrelated modules. Keep strict TypeScript, pure computation, and typed interfaces. Before edits state plan and files. After edits run available tests, typecheck, lint, build; report actual outcomes, changes, remaining blockers. Never fabricate success. If prerequisite repository contracts are missing, create the smallest typed adapter or report blocker. No React component may query IndexedDB directly. Do not persist derived statistics as competing source of truth.

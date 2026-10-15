# Prompt 03 — High-precision clock and formatting

## Goal
Implement this single RubiVision AI timer subtask in the existing repository.

## Exact implementation requirements
Create an injectable monotonic clock based on performance.now() and a fake clock for tests. Record start and stop monotonic timestamps, compute max(0, stop-start), validate finite nonnegative durations, and round to integer milliseconds for the emitted result. Never accumulate elapsed time by counting intervals or animation frames. Use requestAnimationFrame for visual updates while visible; throttle appropriately when hidden without affecting actual elapsed duration. Format centiseconds for display (truncate rather than round, documented), retain raw milliseconds, and support minute/hour displays and locale-independent decimal separators. Do not allow rendering to mutate authoritative state.
Acceptance: fake-clock tests for 0, 9, 10, 999, 1000, 59999, 60000 ms, long solves, fractional clock values, hidden tab, slow frames, and stable stopped display.

## Suggested code ownership
Adapt existing paths. Typical paths: `features/timer/timerMachine.ts`, `timerClock.ts`, `timerFormat.ts`, `useTimer.ts`, `TimerDisplay.tsx`, `timerTypes.ts`, `*.test.ts`. Only create files actually needed for this task.

## Mandatory agent operating protocol
1. Read `00_MASTER_INSTRUCTIONS.md`, `00_DATA_CONTRACTS.md`, `00_PROJECT_ROADMAP.md`, `00_INTEGRATION_CHECKLIST.md`, and the original `02_Timer.md`. Inspect the actual repository, dependencies, tests, and timer-related implementation before changing code.
2. Describe what already exists, list intended changes, and implement only this prompt plus minimal typed interfaces. Do not overwrite functional code or assume suggested filenames exist.
3. Use strict TypeScript, pure domain functions where possible, injected clocks for tests, and explicit units. Do not invent APIs or claim tests passed without running them.
4. Execute available targeted tests, typecheck, lint, and build. Report exact commands and results, changed files, remaining risks, and handoff notes. If prerequisites are missing, create a minimal tested interface or report the blocker.
5. Core timer must remain independent of camera, AI, networking, and persistence. Never directly write IndexedDB from timer UI.

## Required final agent response
Summarize implementation, file-by-file changes, test commands and observed outcomes, assumptions, blockers, and next prompt readiness.

# Prompt 12 — Automated tests, integration and handoff

## Goal
Implement this single RubiVision AI timer subtask in the existing repository.

## Exact implementation requirements
Write unit tests for pure machine, clock, format, penalties and settings, integration tests for input adapters and completion callbacks, and browser tests for desktop keyboard, touch emulation, focus exclusions, visibility changes, navigation, save handoff and accessibility. Prefer existing Vitest/Playwright setup; install only justified dependencies. Use injected fake clock rather than real waiting for threshold boundaries. Document exact inspection boundary policy and any deviations from official WCA rules. Run repository commands for typecheck, lint, unit tests, browser tests if available, and production build. Update cross-module checklist only for cases actually verified. Produce a short manual test script for a clean browser session and a handoff contract for scramble, solves, camera recording, and settings modules. Do not claim camera or storage features are complete merely because timer emits events.
Acceptance: recorded test commands and outcomes, documented integration contracts, no known critical timer regression, remaining issues clearly listed.

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

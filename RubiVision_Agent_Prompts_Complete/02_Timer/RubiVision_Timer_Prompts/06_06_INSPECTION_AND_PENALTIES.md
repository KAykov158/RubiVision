# Prompt 06 — Inspection countdown and penalties

## Goal
Implement this single RubiVision AI timer subtask in the existing repository.

## Exact implementation requirements
Implement optional 15-second inspection with configurable enabled state, using monotonic timestamps. Inspection is not solve duration. Define explicit boundaries for start at elapsed <=15000 ms (NONE), >15000 and <17000 ms (PLUS_TWO), and >=17000 ms (DNF), subject to verification against current WCA rules before describing as official. Use start moment rather than hold initiation to determine inspection penalty, and document the chosen rule. Inspection may continue while HOLDING/READY; define what happens if 17s is crossed before release. At 17s without a valid start, mark inspection DNF in a recoverable UI state and do not emit a completed Solve because no measured run occurred; provide reset/new attempt flow. Never silently turn a non-started attempt into a stored solve. Ensure inspection countdown display and optional cues do not affect timing. Separate manual penalty edits for storage module.
Acceptance: fake-clock tests at 14999, 15000, 15001, 16999, 17000, 17001 ms; disabled inspection, late release, cancellation, and DNF without phantom save.

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

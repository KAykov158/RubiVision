# Prompt 11 — Edge cases, cancellation and reliability

## Goal
Implement this single RubiVision AI timer subtask in the existing repository.

## Exact implementation requirements
Audit rapid press sequences, simultaneous keyboard/pointer, blur while holding, lost pointer capture, hidden tab while running, browser throttling, negative/invalid clock results, large durations, stop event bursts, route changes, component remount, unmount, reset, inspection DNF, and storage callback failure. Build an event matrix and implement safe, deterministic responses. Treat accidental instant stop protection carefully: a new deliberate keydown/pointerdown after RUNNING begins may stop; a release or duplicate from the start interaction must not. Decide and document optional minimum-stop debounce without masking genuine very fast solves. Ensure all error states retain recoverable user instructions. Avoid claiming background timing survives a full browser reload unless it is specifically implemented and verified.
Acceptance: automated regression cases for all matrix rows, no duplicated results, no unhandled promise rejection, stable timer after errors.

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

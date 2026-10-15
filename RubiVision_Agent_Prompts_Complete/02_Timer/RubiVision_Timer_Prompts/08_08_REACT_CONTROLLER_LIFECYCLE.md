# Prompt 08 — React hook, controller and lifecycle

## Goal
Implement this single RubiVision AI timer subtask in the existing repository.

## Exact implementation requirements
Implement useTimer or existing equivalent as a thin adapter around the pure machine. Own timer subscriptions, monotonic clock, animation frame lifecycle, and scheduled hold threshold. Avoid stale closures by using stable event dispatch and authoritative controller state. Clean up listeners and animation frames on unmount. Decide behavior for page visibility changes: RUNNING continues on the monotonic clock, visual rendering resumes on return; HOLDING/READY are cancelled on blur/hidden to prevent accidental starts; STOPPED stays stable. Do not reset RUNNING on route navigation or rerender. Handle StrictMode mount/unmount and state restoration limitations honestly; page reload during RUNNING may invalidate attempt rather than reconstruct an unsupported monotonic timestamp. Provide a typed subscription API for recording integration, but do not implement recording.
Acceptance: fake timer lifecycle tests, blur, visibility, route navigation, StrictMode cleanup, no duplicated events or memory leaks.

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

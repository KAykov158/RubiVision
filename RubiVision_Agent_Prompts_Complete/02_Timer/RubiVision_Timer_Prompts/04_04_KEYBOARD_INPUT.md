# Prompt 04 — Keyboard controls and hold-to-start

## Goal
Implement this single RubiVision AI timer subtask in the existing repository.

## Exact implementation requirements
Attach keyboard handlers at a stable application scope, with proper cleanup and no duplicate listeners under React StrictMode. Use KeyboardEvent.code === Space, prevent page scroll only when timer has ownership of the input, ignore event.repeat, modifier combinations, IME composition, editable targets (input, textarea, select, contenteditable), disabled controls, and active dialogs. On initial Space keydown in IDLE initiate HOLDING and schedule threshold evaluation based on monotonic time; on keyup before threshold cancel; on keyup after READY start RUNNING. A subsequent distinct Space keydown may stop RUNNING, but the same release that started timing must never stop it. Define keyboard-held tracking and source ownership so auto-repeat and duplicate keydown/keyup are harmless. Do not intercept keyboard events needed by accessible buttons or forms.
Acceptance: early release cancels, full hold starts, repeat ignored, focus exclusions, no page scroll during owned interaction, no instant stop, cleanup verified.

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

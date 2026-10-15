# Prompt 05 — Pointer, touch and mobile interaction

## Goal
Implement this single RubiVision AI timer subtask in the existing repository.

## Exact implementation requirements
Build a dedicated timer interaction surface using pointer events where supported. Use pointerdown, pointerup, pointercancel, lostpointercapture, and pointer capture. Track a single active pointerId; ignore second fingers, secondary mouse buttons, ghost clicks, and synthetic duplicate events. Implement same hold threshold as keyboard. Handle release outside target via capture; cancel on pointercancel, window blur, or unmount. Apply touch-action: none only to the dedicated interaction surface to avoid unwanted scrolling without disabling the entire page. Provide an accessible alternative start/stop button for users unable to hold. Define input-source arbitration so simultaneous keyboard and pointer events cannot start/stop twice.
Acceptance: desktop mouse, mobile pointer, drag outside, multi-touch, cancellation, accessibility fallback, duplicate suppression.

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

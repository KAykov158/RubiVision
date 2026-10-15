# Prompt 09 — Completed solve event and storage boundary

## Goal
Implement this single RubiVision AI timer subtask in the existing repository.

## Exact implementation requirements
Define immutable TimerCompleted payload with stable event/attempt ID, rawTimeMs integer, timingSource KEYBOARD or TOUCH, startedAt/completedAt ISO UTC, inspectionPenalty NONE/PLUS_TWO/DNF, and reference to locked scramble/session/puzzle context if provided by upstream. Reconcile with canonical Solve fields: id, sessionId, scrambleId, puzzle, rawTimeMs, penalty, startedAt, completedAt, timingSource. Do not fabricate session or scramble IDs if unavailable. Capture scramble association at start, freeze until stop, and reject mismatched context. Emit completion only once after valid RUNNING -> STOPPED. Do not persist inside timer; expose callback or event to solve service and ensure idempotency key for downstream repository. If save fails, keep stopped result visible and allow explicit retry using same identity, never create a second solve. Distinguish completed timer event from persisted Solve.
Acceptance: one event per valid stop, duplicate stop suppressed, same event ID on retry, no save before start, scramble frozen, correct UTC timestamps and enum mapping.

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

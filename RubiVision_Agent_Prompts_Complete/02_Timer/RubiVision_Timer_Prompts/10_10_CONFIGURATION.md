# Prompt 10 — Timer configuration and settings integration

## Goal
Implement this single RubiVision AI timer subtask in the existing repository.

## Exact implementation requirements
Define validated timer settings: holdThresholdMs, inspectionEnabled, display precision and optional input mode. Choose sensible documented defaults (e.g. 300 ms hold), clamp values to safe bounds and reject NaN, negative, noninteger, or unsupported options. Integrate with existing settings service only if available; otherwise expose typed defaults and an adapter contract. Settings changes during HOLDING, READY, INSPECTION, or RUNNING must not retroactively change an active attempt; snapshot configuration at attempt start. Show settings descriptions and effective behavior. Do not create a second settings database or direct IndexedDB writes from visual components.
Acceptance: default settings, validation, settings snapshot, persisted reload if service exists, invalid-setting fallback and clear UI behavior.

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

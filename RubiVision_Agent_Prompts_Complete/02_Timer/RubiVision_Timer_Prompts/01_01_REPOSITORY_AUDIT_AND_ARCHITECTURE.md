# Prompt 01 — Repository audit and timer architecture

## Goal
Implement this single RubiVision AI timer subtask in the existing repository.

## Exact implementation requirements
Inspect project structure, package manager, routing, existing timer widgets, input listeners, hooks, state management, test runner, and shared types. Document any existing timer behavior and conflicts with the specification. Draw a dependency map: pure state machine -> controller/hook -> input adapters -> UI -> completion event -> downstream persistence. Specify who owns timer lifetime across route changes. Prefer a singleton provider or stable app-level controller only if needed by the actual architecture. Establish type definitions for timer phases, timer events, clock adapter, inspection configuration, and completion payload without implementing other features. Define the event contract and decide how keyboard and pointer sources are arbitrated. Record any decisions and migration risks in a short architecture document.
Acceptance: clear ownership map, no duplicate timer engines, no broken routes, typed interface compile, documented decisions and implementation order.

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

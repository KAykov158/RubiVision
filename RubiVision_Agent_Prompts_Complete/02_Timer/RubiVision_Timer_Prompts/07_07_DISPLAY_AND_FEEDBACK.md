# Prompt 07 — Timer display and user feedback

## Goal
Implement this single RubiVision AI timer subtask in the existing repository.

## Exact implementation requirements
Implement a responsive TimerDisplay that receives typed state and formatted time, without owning the clock or persistence. Define distinct accessible states for IDLE, HOLDING, READY, INSPECTION, RUNNING, STOPPED, and inspection DNF. Use large readable tabular digits, sufficient contrast, visible focus, mobile safe-area handling, and text/icon cues in addition to color. Show hold progress or status without creating an alternative clock. During RUNNING update visual centiseconds; STOPPED freezes exact displayed result; inspection shows countdown and penalty warnings. Respect reduced motion, avoid excessive screen-reader announcements each frame, and keep instructions discoverable. Make keyboard and touch affordances obvious. Use UI component tests where supported.
Acceptance: responsive desktop/mobile, readable states, accessibility labels, no UI-driven time drift, no misleading save success.

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

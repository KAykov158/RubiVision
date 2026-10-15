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


---

# Prompt 02 — Deterministic timer state machine

## Goal
Implement this single RubiVision AI timer subtask in the existing repository.

## Exact implementation requirements
Implement a pure transition function with phases IDLE, HOLDING, READY, RUNNING, STOPPED, plus explicit INSPECTION state or orthogonal inspection context if appropriate. Define events HOLD_START, HOLD_THRESHOLD, HOLD_CANCEL, HOLD_RELEASE, STOP, RESET, INSPECTION_START, INSPECTION_EXPIRE, BLUR and VISIBILITY_CHANGE. Represent pending inspection penalty separately from measured solve duration. Define a transition table for every phase and event; invalid transitions are no-ops with no side effects. HOLD_RELEASE in HOLDING cancels; HOLD_RELEASE in READY starts; STOP only works in RUNNING and exactly once. RESET in RUNNING must be explicitly protected/confirmed by the UI, never silently discard a solve. Avoid state-machine side effects; return typed commands or completion results for adapters. Prevent repeated release or stop events from generating duplicate completions.
Acceptance: exhaustive transition table tests, valid paths, invalid-event no-ops, premature hold cancellation, exactly-once stop, reset semantics documented.

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


---

# Prompt 03 — High-precision clock and formatting

## Goal
Implement this single RubiVision AI timer subtask in the existing repository.

## Exact implementation requirements
Create an injectable monotonic clock based on performance.now() and a fake clock for tests. Record start and stop monotonic timestamps, compute max(0, stop-start), validate finite nonnegative durations, and round to integer milliseconds for the emitted result. Never accumulate elapsed time by counting intervals or animation frames. Use requestAnimationFrame for visual updates while visible; throttle appropriately when hidden without affecting actual elapsed duration. Format centiseconds for display (truncate rather than round, documented), retain raw milliseconds, and support minute/hour displays and locale-independent decimal separators. Do not allow rendering to mutate authoritative state.
Acceptance: fake-clock tests for 0, 9, 10, 999, 1000, 59999, 60000 ms, long solves, fractional clock values, hidden tab, slow frames, and stable stopped display.

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


---

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


---

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


---

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


---

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


---

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


---

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


---

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


---

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


---

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

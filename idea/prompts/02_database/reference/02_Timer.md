# RubiVision AI — Timer and inspection

## Assigned topic
Timer and inspection

## Suggested files (adapt to existing repository)
features/timer/timerMachine.ts, useTimer.ts, timerFormat.ts, TimerDisplay.tsx, timerMachine.test.ts

## Implementation requirements
Build an explicit IDLE → HOLDING → READY → RUNNING → STOPPED state machine. Space hold threshold configurable; release only starts from READY. Support touch/pointer, ignore repeated keyboard events, text-input focus and duplicate stop events. Measure with performance.now(), render centiseconds but retain milliseconds. Optional 15-second inspection with +2 after 15 seconds and DNF after 17 seconds; clarify exact boundary behavior in tests. Emit a completed result exactly once. Avoid saving until a valid stop.

## Acceptance tests and edge cases
Transition tests, input debouncing, blur/visibility handling, no interval drift, no accidental instant stop, cancellation of premature hold.

## Agent operating instructions
You are an AI coding agent working on the existing RubiVision AI repository. First inspect the repository, package.json, current architecture, existing files, tests, and dependencies. Do not assume the proposed paths already exist or rebuild working features. State a short plan, implement ONLY this topic and necessary typed integration points, and preserve unrelated behavior. Use strict TypeScript for the web application; Python is allowed for offline dataset/training scripts. Write meaningful unit/integration tests and error states. Run available typecheck, tests and build, and report actual results. Do not fabricate test passes, measured ML performance, cube-state recognition, or completed features. For any ambiguous dependency, document a sensible choice. Output changed files, behavior, validation steps, limitations and next integration needs.

## Completion definition
The topic is complete only when its acceptance cases are demonstrably met, tests are run, and integration contracts are documented. Do not implement unrelated optional modules.

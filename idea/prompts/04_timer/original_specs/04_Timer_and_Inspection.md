> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 04. Timer and Inspection

**Delivery phase:** Graduation  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the timer and inspection capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Puzzle-independent monotonic millisecond clock (performance.now) and explicit IDLE/HOLDING/READY/INSPECTION/RUNNING/STOPPED state machine.
2. Keyboard Space and pointer/touch controls; configurable hold-to-arm threshold; ignore repeats, typing focus and duplicate input.
3. Optional 15-second inspection; practice-mode +2 after 15 seconds and DNF after 17 seconds; precise boundaries and visible/audio cues.
4. Manual +2, DNF and reset; format centiseconds while preserving full millisecond duration; effective time and DNF averages.
5. Support all 2×2–7×7 puzzles through event association; inspection defaults and WCA-specific distinctions must be documented, not asserted universal.
6. Protect against focus loss, hidden tab, sleep, accidental stops, stale callbacks and race conditions.
7. Attach immutable scramble and puzzle to completed solve; exactly-once save event; recording sync via timestamped lifecycle events.
8. Configurable inspection, display precision, sound, hold duration, controls and reduced-motion preferences.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# RubiVision AI — Timer and inspection

## Assigned topic
Timer and inspection

## Suggested files (adapt to existing repository)
features/timer/timerMachine.ts, useTimer.ts, timerFormat.ts, TimerDisplay.tsx, timerMachine.test.ts

## Implementation requirements
Build an explicit IDLE → HOLDING → READY → RUNNING → STOPPED state machine. Space hold threshold configurable; release only starts from READY. Support touch/pointer, ignore repeated keyboard events, text-input focus and duplicate stop events. Measure with performance.now(), render centiseconds but retain milliseconds. Optional 15-second inspection with +2 after 15 seconds and DNF after 17 seconds; clarify exact boundary behavior in tests. Emit a completed result exactly once. Avoid saving until a valid stop.

## Acceptance tests and edge cases
Transition tests, input debouncing, blur/visibility handling, no interval drift, no accidental instant stop, cancellation of premature hold.


## Extending the timer after completion

The timer is not permanently frozen. For split times, new inspection preferences, device integration or other additions, create a versioned change request in this file, follow `master prompts/06_CHANGE_CONTROL_AND_FEATURE_EXTENSIONS.md`, check impacts on database/statistics/video sync and rerun timer regressions. Do not replace the whole module unnecessarily.

## Cloud-first integration addendum (2026-10-16; additive)

Timer state machine and monotonic duration remain entirely local; on stop durably enqueue solve in IndexedDB then sync asynchronously. Display pending/failed status and handle local quota failure without falsely claiming save.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.

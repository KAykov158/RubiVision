> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 12. Stage Timing and Training Insights

**Delivery phase:** Graduation  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the stage timing and training insights capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. User-marked CFOP phases; configurable generic phases for other methods.
2. Stage durations, pause counts and pause fraction; compare to prior sessions.
3. Jump from insight to corresponding video moment; distinguish measured, inferred and manually entered values.
4. Actionable but non-speculative tips; no claims of specific bad algorithms without verified move states.

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

# RubiVision AI — Manual stages and useful training insights (graduation MVP)

## Goal
Turn motion/pause analysis into useful speedcubing feedback without claiming to know cube moves or CFOP stages automatically.

## Requirements
- Timeline UI to add, rename, adjust, delete, and persist manually annotated stages, initially Cross/F2L/OLL/PLL for CFOP and customizable for other methods.
- Every stage marker is explicitly labeled USER_ANNOTATED. Boundaries are relative to recording/solve time with a stored alignment offset; handle videos that start before the timer.
- For each stage, show duration, pause count, longest pause, pause fraction, uncertain duration and coverage; avoid counting uncertain as pause.
- Compare stages and solve summaries across a selected session, using consistent rules and showing sample sizes.
- Provide transparent rule-based coaching suggestions (e.g., "Longest detected pause was during your manually marked F2L stage; review 00:08.3") with direct video seek links. Label them as suggestions based on predictions and manual markers, not verified cause or algorithm errors.
- Allow manual corrections of predicted activity intervals; retain original predictions and their model version for reproducibility.
- Make stage annotation optional; without it, global pause timeline and insights still work.

## Suggested interfaces
StageAnnotation { id, solveId, recordingId, method, stageName, startMs, endMs, source: 'USER_ANNOTATED', createdAt, updatedAt }
TrainingInsight { id, solveId, kind, summary, evidenceSegmentIds, source: 'RULE_BASED', uncertaintyNote? }

## Tests and done
Test overlapping/out-of-range markers, empty stages, offsets, unknown intervals, editing persistence, multiple methods, and correct metrics. Verify user-visible distinction between predictions and annotations. Run typecheck, tests and build; report actual results.



## Cloud-first integration addendum (2026-10-16; additive)

Sync manual stage annotations and versioned analysis results with owner RLS; conflicts cannot silently overwrite manual annotations. Offline pending data must be labeled.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.

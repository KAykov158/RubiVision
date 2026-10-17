> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 11. Browser AI Inference

**Delivery phase:** Graduation  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the browser ai inference capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Run trained model locally/offline where practical; clear model-unavailable fallback.
2. Timestamped MOVEMENT/PAUSE/UNCERTAIN intervals with confidence and versioned analysis runs.
3. Smoothing/hysteresis and minimum duration rules; no misleading certainty.
4. Align results with original video/timer; reanalysis preserves old provenance; performance metrics.

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

# RubiVision AI — Model inference and video analysis timeline

## Assigned topic
Model inference and video analysis timeline

## Suggested files (adapt to existing repository)
features/ml/classifier.ts, modelLoader.ts, features/analysis/analysisService.ts, segmentBuilder.ts, AnalysisTimeline.tsx, AnalysisPage.tsx, types/analysis.ts

## Implementation requirements
Load versioned compatible model or baseline; enforce feature names/order/preprocessing, handle unavailable model and low-confidence outputs. Convert window predictions to contiguous MOVEMENT/PAUSE/UNCERTAIN segments using documented smoothing and minimum durations. Align with video playback, enable seek-to-segment and manual corrections. Calculate pause count, longest pause, total pause/movement duration and quality warnings. Save model version and analysis settings; permit reruns without silently overwriting results.

## Acceptance tests and edge cases
Timeline/video synchronization, model failure fallback, confidence display, no fabricated analysis, short pauses, overlapping windows, zero valid predictions.


## Cloud-first integration addendum (2026-10-16; additive)

Browser inference can operate on local media; save model version, feature version, provenance and analysis results through cloud repositories with offline pending fallback.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.

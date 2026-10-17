> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 21. Camera Move Recognition

**Delivery phase:** Ultimate research  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the camera move recognition capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Recognize candidate face turns, rotations and regrips from synchronized observations.
2. Start with low TPS and controlled camera angle; measure per-move precision/recall and event timing.
3. Separate candidate generation from sequence decoding and verification.
4. Return unknown/ambiguous rather than hallucinate a move; manual correction path.

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

# Camera turn recognition at controlled slow TPS

**Phase:** R3 — ULTIMATE-GOAL RESEARCH, not graduation gate.
**Prerequisites:** Ground-truth dataset, observations, move simulator.

## Objective and implementation instructions
Build turn candidate detector and temporal classifier using hand/cube observations and/or short video clips. Output event {time interval, candidate Singmaster move, orientation frame, confidence, evidence, model version} plus UNKNOWN/rotation events. Start with fixed-camera slow TPS and limited face set, expanding only when held-out metrics justify it. Account for 90/180-degree turns, occlusion and adjacent rapid turns. Provide manual confirmation/edit and compare to ground-truth event sequences with tolerance. Tests: notation mapping, inverse, time ordering, ambiguous/no-turn segments; report per-move precision/recall/F1 and latency by TPS.

## Agent protocol
Read every file in `master prompts/`, inspect repository and upstream contracts, explain plan, implement only this module and necessary typed integration, add tests, run available checks and report actual outcomes. Do not fake accuracy or train on unlabeled data. Stop for review before next module.

## Done when
Documented API and event schemas, working reproducible demo on actual data or explicitly marked experimental, automated tests and failure handling, metrics where appropriate, no regression in offline timer or graduation functionality.


## Cloud-first integration addendum (2026-10-16; additive)

Inference and recognition must not wait for cloud calls; persist uncertain/verified provenance and research artifacts only with consent.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.

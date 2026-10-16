> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 26. Real-Time Tracking Pipeline

**Delivery phase:** Ultimate research  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the real-time tracking pipeline capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Bounded-latency camera capture, observation, turn decoding, state update and UI overlay.
2. Worker/backpressure strategy, FPS and latency reporting; graceful degraded mode.
3. Uncertainty alerts and correction without corrupting the underlying solve record.
4. Demonstrate low-TPS first; high-TPS reliability remains research milestone.

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

# Real-time camera pipeline and coaching overlay

**Phase:** R8 — ULTIMATE-GOAL RESEARCH, not graduation gate.
**Prerequisites:** Turn recognition, state tracking and coaching stable offline.

## Objective and implementation instructions
Build asynchronous video → observations → turn candidates → state hypotheses → UI pipeline. Use workers where supported and bounded queues; prioritize timer responsiveness. Show live confidence/UNKNOWN state, latency and drift; offer manual correction and fallback to post-solve analysis. Test variable FPS, frame drops, device heat, low lighting, long recordings and cancellation. Set measurable device-specific latency/accuracy targets before calling it real time. Do not assume one camera can fully observe hidden faces; maintain quality warnings and optional smartcube corroboration.

## Agent protocol
Read every file in `master prompts/`, inspect repository and upstream contracts, explain plan, implement only this module and necessary typed integration, add tests, run available checks and report actual outcomes. Do not fake accuracy or train on unlabeled data. Stop for review before next module.

## Done when
Documented API and event schemas, working reproducible demo on actual data or explicitly marked experimental, automated tests and failure handling, metrics where appropriate, no regression in offline timer or graduation functionality.


## Cloud-first integration addendum (2026-10-16; additive)

Never put Supabase round-trips on the real-time camera/gesture/state pipeline; upload only approved derived results asynchronously.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.

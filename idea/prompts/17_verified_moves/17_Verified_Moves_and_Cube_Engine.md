> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 17. Verified Moves and Cube Engine

**Delivery phase:** Post-graduation foundation  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the verified moves and cube engine capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Parse standard cube notation (including primes, double turns, rotations and supported wide/slice moves).
2. Deterministic legal 3×3 state transitions, inverse moves, state serialization and solved-state validation.
3. Manual verified move entry, scramble replay and step-by-step state viewer.
4. Move timestamps and source provenance (manual/smartcube/camera); correction history and unit tests.
5. Do not present manually entered moves as camera-recognized.

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

# RubiVision AI — Verified move events and future cube-tracking foundation

## Goal
Build a small, optional, testable bridge from the graduation MVP to future camera-based turn tracking and solution optimization. Do not make it a graduation blocker.

## Requirements
- Define canonical MoveEvent with solveId, notation, relative timestamp if known, source (MANUAL, SMART_CUBE, CAMERA_PREDICTED), confidence nullable, verification status and algorithm/schema version.
- Support user-entered 3×3 move sequences in standard notation; validate parsing, illegal tokens, orientation conventions and sequence consistency.
- Given an explicitly known starting cube state (from a scramble applied to a solved cube), replay verified moves through a vetted cube-state library and show a state timeline. Never infer moves from motion-only video.
- If the supplied move sequence does not reach the expected final state, show a mismatch and do not call it verified.
- Make timestamps optional for manually supplied moves; without timing, do not fabricate TPS or move-level video synchronization.
- Provide adapter boundary for future camera/smartcube move events, plus correction/verification workflow; no camera turn detection required here.
- Algorithm alternatives are future work unless based on a verified state, supported method and curated/tested algorithm set. Shorter move count alone is not equivalent to faster execution.

## Tests and done
Scramble + inverse returns solved; notation parsing, rotations, wide turns where supported, invalid states, provenance labels, missing timestamps, correction and persistence tests. Core timer/analysis unaffected if this module is disabled.



## Cloud-first integration addendum (2026-10-16; additive)

Versioned verified move events and cube snapshots use owner-scoped cloud records and provenance; local live engine remains responsive without network.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.

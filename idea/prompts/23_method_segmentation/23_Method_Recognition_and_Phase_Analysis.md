> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 23. Method Recognition and Phase Analysis

**Delivery phase:** Ultimate research  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the method recognition and phase analysis capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Start CFOP Cross/F2L/OLL/PLL segmentation from verified move/state trace.
2. Define stage boundary predicates and handling for unusual solve paths.
3. Later support Roux/ZZ using explicit method-specific rules and uncertainty.
4. Evaluate against human-labeled phase boundaries; do not infer stages from motion alone.

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

# Method-aware solve segmentation

**Phase:** R5 — ULTIMATE-GOAL RESEARCH, not graduation gate.
**Prerequisites:** Verified states, move sequence, manual stage annotations.

## Objective and implementation instructions
For CFOP first, derive Cross/F2L/OLL/PLL stage boundaries from validated cube-state predicates and move timestamps; handle alternative solve paths, rotations, skipped stages, partial cross and uncertain boundaries. Separate method chosen by user from method inferred by system. Add manual override and side-by-side human annotation comparison. Design adapters for Roux and ZZ without asserting equivalent phase structure. Tests: known CFOP sequences, stage skips, ambiguous transitions, state predicate invariants. Report boundary error and stage classification on verified held-out solves.

## Agent protocol
Read every file in `master prompts/`, inspect repository and upstream contracts, explain plan, implement only this module and necessary typed integration, add tests, run available checks and report actual outcomes. Do not fake accuracy or train on unlabeled data. Stop for review before next module.

## Done when
Documented API and event schemas, working reproducible demo on actual data or explicitly marked experimental, automated tests and failure handling, metrics where appropriate, no regression in offline timer or graduation functionality.


## Cloud-first integration addendum (2026-10-16; additive)

Method stage labels, confidence and user corrections sync as versioned private analysis records; no silent overwrite of manual ground truth.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.

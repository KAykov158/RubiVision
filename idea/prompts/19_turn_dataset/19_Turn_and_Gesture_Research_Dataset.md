> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 19. Turn and Gesture Research Dataset

**Delivery phase:** Ultimate research  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the turn and gesture research dataset capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Capture controlled slow-turn sequences with explicit turn labels, timing, camera angle and participant ID.
2. Include cube rotations, regrips, occlusions, hands, non-turn motion and ambiguous frames.
3. Ground-truth move sequence independently verified; subject/session-separated splits.
4. Consent, retention and privacy; representative device/lighting variations.

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

# Turn and gesture ground-truth dataset

**Phase:** R1 — ULTIMATE-GOAL RESEARCH, not graduation gate.
**Prerequisites:** Verified move events and 3x3 scramble state engine.

## Objective and implementation instructions
Implement a consent-first collection and labeling pipeline for cube turns, cube rotations, hand movements and ambiguous frames. Define video and event schemas with start/end timestamps, notation, reference frame, participant/session IDs, camera setup, FPS, visibility and quality. Support video import and annotation corrections; add optional synchronized smartcube/manual ground truth, never treat estimated motion as exact truth. Create annotation guidelines, split manifest by participant/session, label quality review, data audit and reproducible exports. Keep training/validation/test disjoint. Tests: timestamp round trip, label schema validation, nonoverlapping split, deletion and export integrity.

## Agent protocol
Read every file in `master prompts/`, inspect repository and upstream contracts, explain plan, implement only this module and necessary typed integration, add tests, run available checks and report actual outcomes. Do not fake accuracy or train on unlabeled data. Stop for review before next module.

## Done when
Documented API and event schemas, working reproducible demo on actual data or explicitly marked experimental, automated tests and failure handling, metrics where appropriate, no regression in offline timer or graduation functionality.


## Cloud-first integration addendum (2026-10-16; additive)

Dataset consent and media privacy remain first-class. Use separate controlled research storage rather than assuming every clip belongs in public or unrestricted Supabase Storage.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.

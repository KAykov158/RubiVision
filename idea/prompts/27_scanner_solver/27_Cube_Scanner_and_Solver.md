> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 27. Cube Scanner and Solver

**Delivery phase:** Optional  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the cube scanner and solver capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Guided six-face scan, sticker color calibration and legal-state validation.
2. Show uncertain facelets and correction UI; reject impossible states.
3. Integrate a verified 3×3 solving algorithm and step-by-step moves; separate from solve coaching.
4. No promise of robust live scanning without evaluation.

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

# RubiVision AI — Experimental sticker scanning and solver

## Assigned topic
Experimental sticker scanning and solver

## Suggested files (adapt to existing repository)
features/vision/colorClassifier.ts, faceScanner.ts, cubeStateValidator.ts, CubeScanPage.tsx, features/solver/solverService.ts, solutionValidator.ts, SolutionViewer.tsx

## Implementation requirements
Build optional 3×3-only guided six-face scanner: grid overlay, sticker-center sampling, calibrated CIELAB colors, manual corrections, explicit face orientation, color counts and physical solvability checks. From a validated state, call a vetted Kociemba-style solver asynchronously; verify returned moves solve the supplied state and animate known sequence. Never call Kociemba output CFOP; do not pretend video motion detects cube state.

## Acceptance tests and edge cases
Reject impossible cube states, incomplete scans, poor color confidence, unsupported puzzle, solver timeout; correctness on known scrambles.


## Cloud-first integration addendum (2026-10-16; additive)

Scanning and solving work client-side where feasible; camera frames stay local unless explicit upload is implemented.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.

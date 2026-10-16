> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 03. Puzzles and Scrambles

**Delivery phase:** Graduation  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the puzzles and scrambles capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Support 2×2×2, 3×3×3, 4×4×4, 5×5×5, 6×6×6, 7×7×7 in timer and scramble selection.
2. Use maintained, validated event-specific scramble generators; distinguish random-state from random-move where applicable.
3. Puzzle-specific notation, scramble length and display; copy and regenerate, scramble history, lock active scramble.
4. No silent reuse; validate parseability and event compatibility; generation off main timing path.
5. Daily challenge generation has separate rules and must not silently replace regular practice scrambles.

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

# RubiVision AI — Scrambles and cube visualization

## Assigned topic
Scrambles and cube visualization

## Suggested files (adapt to existing repository)
features/scramble/scrambleService.ts, scrambleParser.ts, ScrambleDisplay.tsx, features/cube/cubeState.ts, CubeViewer.tsx

## Implementation requirements
Generate valid 2×2–7×7 puzzle-specific WCA-style scrambles via a vetted compatible library, asynchronously when necessary. Keep scramble fixed while timer runs and save its exact text and generator version. Allow copy/regenerate and reject stale async responses. Add optional cube viewer for supported puzzle types, using cubing.js/Three.js; viewer shows scramble-derived known state, never inferred physical state.

## Acceptance tests and edge cases
Validate notation and puzzle mapping; scramble ID uniqueness; inverse move restores state; unavailable viewer never blocks timing.


## Cloud-first integration addendum (2026-10-16; additive)

Scramble generation stays client-side and usable offline; persist the exact scramble text, puzzle code, algorithm/provider version and optional seed with the solve. Never require cloud request to generate a scramble.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.

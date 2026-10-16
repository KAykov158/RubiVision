> **CLOUD-FIRST ADDITIVE REVISION (2026-10-16).** This original specification is preserved in full for traceability. Where it describes IndexedDB as the authoritative database, local-only accounts, optional/future cloud, or cloud synchronization postponed until after graduation, those statements are superseded by `master prompts/11_CLOUD_FIRST_DECISION_AND_OVERRIDES.md`. **Supabase PostgreSQL + Auth are required from category 02; IndexedDB is a resilience cache/outbox, not the authoritative store.** No other requirements are removed. Read the cloud addendum and the original content together.

# RubiVision AI — Shared regulations

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Scope and change control
- Every feature is assigned a delivery phase and an owning folder.
- Graduation acceptance must be testable without cloud or future turn tracking.
- New changes require updated documentation, data contracts, tests and migration plan where relevant.
- Future implementation prompts must inspect the actual repository and work one module at a time.

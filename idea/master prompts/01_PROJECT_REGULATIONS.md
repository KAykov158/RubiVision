> **SUPABASE-ONLY ARCHITECTURE OVERRIDE (2026-10-16).** This file retains earlier requirements for traceability. Any instructions here to use IndexedDB, another browser/local database, localStorage for application persistence, a durable offline write queue, or automatic synchronization are superseded by master documents 11 and 17. Supabase PostgreSQL is the sole persistent application database; Supabase Auth and owner-scoped RLS govern future cloud data. A failed write may remain only in volatile tab memory with an explicit unsaved state. Other requirements remain unless separately superseded.

# RubiVision AI — Shared regulations

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Connectivity:** Timer measurement may continue without internet. Persisted solve history, sessions, and other durable application data require Supabase; failed writes must remain visibly unsaved and are not synchronized automatically.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Scope and change control
- Every feature is assigned a delivery phase and an owning folder.
- Graduation acceptance must be testable without cloud or future turn tracking.
- New changes require updated documentation, data contracts, tests and migration plan where relevant.
- Future implementation prompts must inspect the actual repository and work one module at a time.

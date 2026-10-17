> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 28. Smart Cube and Optional Cloud

**Delivery phase:** Optional  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the smart cube and optional cloud capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Optional Bluetooth smart-cube adapter for verified move events; browser compatibility and permissions.
2. Cloud accounts/sync only after offline data contracts stabilize; encryption and conflict handling.
3. Never make accounts or BLE mandatory for timer, local data or graduation MVP.

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

# RubiVision AI — Optional cloud sync and Bluetooth smart cubes

## Assigned topic
Optional cloud sync and Bluetooth smart cubes

## Suggested files (adapt to existing repository)
features/auth/authService.ts, features/sync/syncService.ts, storage/cloudRepository.ts, features/smartcube/bluetoothService.ts, deviceAdapters/, moveDecoder.ts

## Implementation requirements
Keep optional features behind flags. Cloud: user authentication, per-user row-level authorization, offline-first sync, conflict handling, status, export/delete and no secret keys in browser. Smart cube: explicit Bluetooth pairing, manufacturer-specific verified protocol adapters, timestamped decoded moves, disconnect/reconnect and known-move replay. Distinguish device-reported moves from camera predictions. Core app must work without either.

## Acceptance tests and edge cases
Offline and conflict tests, permissions, unsupported devices, connection loss, no cloud requirement for local solves.


## Cloud-first integration addendum (2026-10-16; additive)

Core Supabase Auth/database/sync is already mandatory from categories 02/02A. This optional category now focuses on Bluetooth smart cubes and advanced cloud features (shared accounts, rich media sync, collaboration, optional server inference), not initial cloud adoption.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.

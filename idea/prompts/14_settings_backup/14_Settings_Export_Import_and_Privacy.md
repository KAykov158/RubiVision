> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 14. Settings, Export, Import and Privacy

**Delivery phase:** Graduation  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the settings, export, import and privacy capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Central validated settings with defaults, versioning and reset; timer/puzzle/media/privacy preferences.
2. Versioned local backup and restore for sessions, solves, settings, labels and optional media.
3. Conflict resolution and data integrity on import; consent and delete-all controls.
4. No accounts required; no silent cloud upload; accessible data-retention explanations.

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

# RubiVision AI — Settings, JSON/CSV export and import

## Assigned topic
Settings, JSON/CSV export and import

## Suggested files (adapt to existing repository)
features/settings/settingsService.ts, settingsSchema.ts, SettingsPanel.tsx, features/export/exportService.ts, importService.ts, fileValidator.ts

## Implementation requirements
Implement validated persisted settings for timer/inspection, default puzzle, theme, camera, analysis sensitivity, privacy and retention. Add CSV solve export and versioned JSON backup covering related sessions, solves, scrambles and analyses. Validate imports, preview counts, detect duplicate IDs, use transactions and preserve referential integrity. Document schema and conflict strategy.

## Acceptance tests and edge cases
Round-trip export/import, malformed file, duplicates, quota failures, invalid settings reset, no partial corrupted imports.


## Cloud-first integration addendum (2026-10-16; additive)

Cloud-backed per-user settings, authenticated data export/import, duplicate-safe restore, pending-outbox warnings, privacy notice, account deletion process and local media export remain required.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 15. Testing, Accessibility and Security

**Delivery phase:** Graduation  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the testing, accessibility and security capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Unit, integration and end-to-end tests across timer, storage, scrambles, media, inference and export.
2. Browser compatibility and accessibility: keyboard navigation, focus, screen readers, contrast, reduced motion.
3. Performance budgets, offline behavior, storage exhaustion, corrupt media, permission denied and crash recovery.
4. Privacy threat model, dependency review, no embedded credentials, safe file parsing.
5. Manual acceptance checklist and regression gates for every module.

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

# RubiVision AI — Integration testing, documentation and graduation demo

## Assigned topic
Integration testing, documentation and graduation demo

## Suggested files (adapt to existing repository)
tests/unit/, tests/integration/, tests/e2e/, README.md, docs/architecture.md, docs/ai-methodology.md, docs/privacy.md, docs/evaluation.md

## Implementation requirements
Use Vitest and Playwright for timer-to-save, scramble association, penalties/statistics, camera denial, recording/analysis, persistence, migration and import/export. Document installation, run/build/test commands, data labeling, split design, baseline/model evaluation, limitations and privacy. Build a repeatable demo: scramble → timer → saved solve → statistics → recording → pause/movement analysis. Report only measured performance.

## Acceptance tests and edge cases
CI build/typecheck/tests pass; fresh install runs; graduation demo works without cloud; limitations clearly stated.


## Cloud-first integration addendum (2026-10-16; additive)

Add adversarial RLS and cross-owner FK tests, secret scanning, Auth lifecycle, multi-device sync, retry/idempotency, offline queue, service outage, migration and Storage policy tests.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.

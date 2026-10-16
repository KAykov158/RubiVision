> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 16. Graduation Documentation and Release

**Delivery phase:** Graduation  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the graduation documentation and release capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Repeatable clean install, lint, typecheck, tests and production build; deployable offline-first app.
2. Architecture and data-flow diagrams, ER diagram, user guide, experiment methodology, known limitations.
3. Live demonstration script with offline fallback video, test evidence, screenshots and reproducible sample data.
4. Clear differentiation of shipped MVP, partially completed work and future research; school criteria pending.

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

# RubiVision AI — Deployment, release, and reproducible handoff

## Goal
Ensure the completed project can be installed, tested and demonstrated on a fresh computer without secret accounts or undocumented setup.

## Suggested files
.env.example; README.md; docs/deployment.md; docs/browser-support.md; docs/release-checklist.md; scripts/check-environment.*; .github/workflows/ci.yml (if GitHub used); public/model-manifest.json (if applicable)

## Requirements
1. Detect actual package manager, scripts, framework and build target. Document supported Node/Python versions, install/build/test/dev commands and model artifact generation steps.
2. Create a documented configuration template without secrets. The offline/local MVP must run without Supabase keys, internet or camera access once dependencies/assets are available.
3. Set up CI (if repository platform supports it) to run lint, typecheck, unit tests and production build; do not claim browser E2E runs unless they actually do.
4. Verify relative asset paths, routing fallback, model/worker loading, CSP and camera secure-context requirements on the chosen hosting target. No unverified claims of cross-browser support.
5. Document browsers/devices tested, camera and codec restrictions, storage limits, offline behavior and optional feature flags. Ensure user-visible failures are graceful.
6. Provide data migration/backup and privacy checks; avoid committing videos, datasets with identifying information, credentials or oversized model artifacts without explicit decisions.
7. Write a 5–10 minute reproducible graduation demo script and contingency demo using a consented prerecorded local video if live camera fails. Include experiment results only if actually measured.
8. Record release version, known limitations, test commands/outcomes, remaining blockers, and precise MVP completion status.

## Acceptance
- Clean clone/install/build/run works using documented instructions on a tested environment.
- A user can demonstrate timer -> scramble -> save -> history/statistics -> video import/record -> analysis -> evaluation/report without optional cloud.
- No missing runtime model/worker assets in production build; privacy checks pass.
- CI and local test results are documented truthfully.

## Agent procedure
Read all 00_* files and 13_Testing_Docs, inspect repo, change only deployment/release scope, test actual build and report results.



## Cloud-first integration addendum (2026-10-16; additive)

Document Supabase setup, environment variables, SQL migrations, RLS evidence, deployment, cost/limits, offline timer fallback, seeded demo account and backup plan. Keep original AI evaluation evidence.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.

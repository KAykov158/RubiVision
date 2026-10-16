# Task 07: Camera, video import and recording

## Objective and implementation details
Implement opt-in camera selection, capability negotiation, preview, MediaRecorder capture, imported video fallback, recording-timer offset, MIME/codec and actual metadata display, playback and cleanup. Store metadata through service; private video local until explicit upload.

## Mandatory acceptance and failure coverage
Handle permission denial, no camera, device busy, insecure context, interrupted recording, low disk/memory, mismatched offsets, revoked object URL and stop/release tracks. Timer and saved solve must survive camera failure.

## Completion gate
Demonstrate recording or import linked to correct solve and clean teardown.

## Required execution sequence
1. Inspect repository and specifications; list prerequisites and known implementation.
2. Draft files/migrations/services/tests plan; flag unresolved decisions.
3. Implement one vertical slice; maintain existing code and ownership boundaries.
4. Add deterministic unit and integration fixtures plus manual acceptance script.
5. Run available commands, capture actual output and fix failures in scope.
6. Record precise pass/fail/unverified evidence and handoff to next module.

# Mandatory agent operating contract

You are a coding agent working in the actual RubiVision AI repository. This prompt describes work to implement, NOT existing implementation. Before changing files, inspect the repository, git status, package scripts, source layout, tests, migrations, dependencies and relevant specifications. Do not assume suggested paths exist. Read all four 00_* specifications and the matching feature specification. Respect the newest explicit Supabase-only persistence decision: Supabase PostgreSQL is the sole durable application database; no IndexedDB, local database, persistent offline outbox, or claims of durable offline save. The timer may run without a network connection, but a solve is not saved until the server acknowledges it. Browser-held pending results are volatile and must be labeled unsaved. Videos remain local during processing unless the user explicitly consents to upload; persistent remote video storage, if enabled, uses private Supabase Storage, not PostgreSQL blobs. If a source contradicts these rules, document the conflict and apply this precedence: newest explicit architecture addendum > newer module-specific instruction > shared contracts > older specification. Do not silently rewrite old source files.

Work in one bounded vertical slice. First write a repository-grounded plan and identify prerequisites. Implement code, migrations, validation, UI states, tests and documentation. Use strict TypeScript and typed services, schema validation at trust boundaries, UTC ISO timestamps, integer milliseconds, UUIDs, versioned model/feature manifests and explicit provenance. UI must not directly manipulate tables across feature ownership boundaries. Protect every user-owned row and storage object with correctly tested RLS/policies. Never place a service-role key in client code. Do not invent package APIs, WCA compliance, cube-state reconstruction, model accuracy or test outcomes. Keep motion classification separate from exact move detection. For every change, run the available relevant typecheck, lint, unit, integration and build commands; report the exact commands and outcomes. If credentials, footage, browser permissions or external services are unavailable, implement/test what can be validated locally and report the blocked verification, without claiming completion.

Required final agent report: (1) repository baseline, (2) changes and file paths, (3) architecture decisions, (4) database and RLS implications, (5) tests executed and actual outcomes, (6) manual test procedure, (7) acceptance criteria passed/failed/unverified, (8) remaining risks, (9) next task. Never move to a dependent module while a critical prerequisite is broken.

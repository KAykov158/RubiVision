# 02 — SUPABASE DATABASE, MIGRATIONS, AUTH AND RLS

## Paste this entire prompt into your coding agent

# UNIVERSAL CODING-AGENT CONTRACT — RUBIVISION AI

You are a senior engineer working IN THE EXISTING repository. Inspect the repository, package scripts, actual types, migrations, tests and documentation before making changes. Never invent an implemented feature. Work in one reviewable vertical slice; preserve unrelated behavior. Explain dependencies and planned edits first, then implement, test, and report evidence. If no repository is available, produce an implementation design and clearly mark it NOT IMPLEMENTED. Never pretend tests ran.

## Authoritative architecture and conflict policy
- Newest explicit 2026-10-16 Supabase-only persistent-database directive takes precedence over old IndexedDB/Dexie/offline-outbox requirements. Supabase PostgreSQL is the ONLY persistent application database. Browser memory and temporary video Blob/object URLs are permitted, but they are not durable offline persistence. No automatic offline queue or promise of offline save.
- A timer can run without network; database-backed save/history/statistics require authenticated or explicitly approved anonymous Supabase access and connectivity. If offline when saving, preserve the result only in current tab memory, display NOT SAVED, offer retry/export, and warn before unload. Never claim it is durably saved. On reload, unsaved in-memory data may be lost.
- Camera preview/recording and video analysis run locally where supported. Video upload to Supabase Storage is opt-in, private, with owner policies and explicit deletion. Local temporary recording is not a second app database.
- The latest camera spec refers to master sections 11–15 and category 02A, which are NOT present in the supplied file pack. Treat these as missing dependencies; do not invent their contents. Record the unresolved reference in a decision log and request those files if needed.
- Older master DOCX favors 3×3 MVP while module files describe 2×2–7×7. Ship 3×3 first, then extend puzzle-specific generation after passing tests. Other puzzles are a planned expansion, not an excuse to delay a functioning 3×3 graduation flow.
- Motion is NOT a cube turn, exact move, CFOP phase, cube state or TPS. Only claim capabilities supported by verified data. WCA compliance requires checking current official rules; until then use 'WCA-inspired' language.
- Respect typed versioned interfaces, UUIDs, UTC ISO timestamps, integer milliseconds, half-open video intervals, schema provenance and stable scramble references.
- React + strict TypeScript; pure domain modules; explicit error states; services own database writes; no service-role key in frontend; SQL migrations + RLS; use least privilege.

## Standard workflow
1. Inspect repository and source specifications; identify existing implementation and version conflicts.
2. Produce a concrete file-level plan, test plan, data/security impacts and risks.
3. Implement the smallest complete working slice; do not refactor unrelated files.
4. Add unit tests, integration tests, negative cases and browser tests when relevant.
5. Run actual available lint/typecheck/test/build commands; document exact commands and results.
6. Document migration, rollback, manual verification and environment prerequisites.
7. Finish with changed files, achieved acceptance criteria, incomplete items, known limitations, next phase gate.

## Universal rejection conditions
Reject fabricated accuracy/latency, missing RLS tests, silent camera upload, unsupported device claims, missing failure handling, timer blocked by video/AI, duplicate solve save, inconsistent scramble IDs, and any code that silently falls back to IndexedDB as permanent storage.


## Assignment
**Mission:** Supabase database, migrations, auth and RLS.

**Specific implementation scope:** Create versioned SQL migrations for profiles, sessions, scrambles, solves, recordings metadata, analyses, settings and optional annotation records. Enforce ownership, foreign keys, uniqueness, cascading/restrict policies, timestamps, indexes and RLS. Provide a safe auth/onboarding flow and a documented anonymous-access decision. Add negative cross-user access tests and service repositories. Never store media bytes in PostgreSQL.

**Prerequisites:** Phase 00; Supabase project or local development stack, credentials supplied via env only

**Definition of done:** Migration up/down strategy, two-user isolation tests, idempotent inserts, schema validation, no service-role secret shipped.

## Required detailed execution plan
A. Read `00_MASTER_INSTRUCTIONS.md`, `00_DATA_CONTRACTS.md`, `00_PROJECT_ROADMAP.md`, `00_INTEGRATION_CHECKLIST.md`, the relevant original topic file, and `ARCHITECTURE_PRECEDENCE.md`. Inspect actual repository before assuming filenames or package versions.
B. Write an implementation plan containing current behavior, files to change, domain contracts, SQL/auth implications, UI states, rollback strategy, test fixtures, and at least three failure cases. If prerequisites are missing, implement only a typed boundary or report blocker.
C. For each service API, specify input/output TypeScript types, validation, errors, cancellation, idempotency and ownership. For persisted entities specify SQL migration, FK, indexes, RLS, update/delete behavior, schema version and user ownership.
D. For each UI feature specify loading, empty, success, denied/unsupported, network failure, cancellation and retry behavior, plus keyboard/mobile accessibility. Never show a successful save until the database confirms it.
E. Add deterministic unit tests, integration tests and at least one adverse/failure fixture; add browser e2e tests when user flow changes. Use real browser API mocks carefully; avoid tests that only assert a mock was called.
F. Run existing project commands for typecheck, lint, unit tests, integration tests and production build. If a command cannot run, state exactly why. Document manual testing steps and expected observations.
G. Report final state as IMPLEMENTED / PARTIAL / BLOCKED, changed files, migration names, exact commands and outcomes, known risks and next dependency gate.

## Required adversarial review questions
1. What happens if network or Supabase fails midway? Which state is durably saved, and which is only in memory?
2. Can a second authenticated user read, edit or delete these records or media? Prove negative cases.
3. Can a duplicate event, stale async callback, tab visibility change or retry corrupt the result?
4. Are timestamps monotonic vs UTC correctly distinguished, and are units explicit?
5. Does cancellation clean up resources without deleting independently saved solve data?
6. Are unsupported devices, empty input, corrupt data and low confidence visible to users?
7. Are tests actually executed, and are all claims supported by evidence?

## Output format required from agent
- Audit and assumptions
- Design and dependency decisions
- Changes by file
- Schema/security effects
- Test matrix and exact results
- Manual verification recipe
- Limitations, rollback and next task

## Stop condition
Do not start another major phase until this phase's definition of done has verified evidence, or a clearly documented blocker has been accepted.

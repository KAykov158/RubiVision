# PHASE 13: Settings, export and safe import

## Copy-paste instruction for coding agent
You are the implementation owner for PHASE 13 of RubiVision AI. Execute this phase in the real repository, not in an imagined greenfield codebase. Do not implement later phases prematurely.

## Outcome
Implement validated settings and portable CSV/JSON exports and transactional cloud imports.

## Candidate files / deliverables (adapt to actual repo)
src/features/settings; src/features/export; tests/import-export

## Detailed implementation requirements
Persist user-owned settings in Supabase with defaults and schema validation. Export CSV with correct quoting, UTF-8 and formula-injection protection; versioned JSON with sessions, scrambles, solves, analyses and relationship manifest. Define whether video binaries are excluded and show disclosure. Preview imports, validate UUIDs, time values, FK links, schema versions and duplicates. For all-or-nothing multi-table imports, use server-side transaction/RPC or trusted database transaction, not a chain of client inserts. Enforce ownership/RLS, idempotency and conflict policy.

## Acceptance gate
Round-trip test, invalid/oversized/duplicate import, malicious ownership field, atomic rollback, settings reset and download verification.

## Deliverables required in your final response
A. Repository findings and dependencies. B. Explicit design decisions and tradeoffs. C. Changed files and migration impact. D. Test cases added and exact commands/results. E. Manual reproducible validation. F. Failure cases tested. G. Known limitations, risks and blockers. H. GO/NO-GO recommendation for the next phase.

## Mandatory agent execution contract
1. Inspect repository root, package manager lockfile, scripts, environment template, schema/migrations, source, existing tests and git status. Do not assume the repository is empty or that a suggested path exists.
2. Read `00_MASTER_AGENT_PROMPT.md`, `ARCHITECTURE_DECISIONS.md`, `DATA_MODEL_AND_SECURITY.md`, relevant original specifications in `SOURCE_SPECIFICATIONS/`, and `ACCEPTANCE_MATRIX.md`. The actual repository establishes implemented reality, not planned specs.
3. Before edits, report what exists, discrepancies, dependencies, implementation plan, risks, and exact acceptance checks. Keep changes scoped to the assigned phase and avoid unrelated rewrites.
4. Implement complete vertical slices: domain types and validation, services/repositories, UI, error/empty/loading states, unit/integration tests, docs, and necessary migrations. Use strict TypeScript and avoid any implicit `any`.
5. Follow Supabase-only durable app persistence. Do not introduce IndexedDB, localStorage as a database, SQLite, service-worker outboxes or pretend offline writes are saved. Browser memory may hold unsaved transient state. Media processing may be local without storing persistent records. Auth/session tokens may use the official Supabase client mechanism, not as app database.
6. Preserve stable UUID IDs, UTC ISO timestamps, integer milliseconds, half-open video intervals, explicit provenance, versioned model and feature manifests. UI never writes directly to tables; use typed services and repositories.
7. Enforce auth and RLS ownership at the database layer. No service-role secret in the client. Handle failed writes, expired auth, offline network, cancellation, retries and idempotency explicitly. No automatic silent media uploads.
8. Distinguish observed movement from cube turns and cube state. Never invent evaluation results, model performance, WCA certification, supported frame rates or completed features.
9. Verify installed APIs/library versions and licenses. Write meaningful negative tests. Run lint, typecheck, unit, integration, e2e, production build and security checks as applicable; record exact commands and outcomes, including skipped checks.
10. Finish with changed files, migration instructions, screenshots/manual steps when useful, test evidence, remaining risks, and explicit GO/NO-GO for the next phase. Commit only when asked or consistent with repository workflow.

## Failure injection and verification
Test missing auth, rejected/slow network, Supabase RLS denial, duplicate requests, page reload, malformed payloads, zero-length inputs, cancellation, unsupported browser APIs, and stale asynchronous results. Verify existing timer/history/statistics continue working after each feature. If prerequisites are absent, create a minimal tested interface or stop with an actionable blocker; do not fabricate upstream functionality.

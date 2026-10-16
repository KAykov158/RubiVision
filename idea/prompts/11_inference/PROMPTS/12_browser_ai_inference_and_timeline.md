# PHASE 12: Browser AI inference and timeline

## Copy-paste instruction for coding agent
You are the implementation owner for PHASE 12 of RubiVision AI. Execute this phase in the real repository, not in an imagined greenfield codebase. Do not implement later phases prematurely.

## Outcome
Run compatible inference locally in browser and show synchronized movement/pause/uncertain analysis.

## Candidate files / deliverables (adapt to actual repo)
src/features/ml; src/features/analysis; tests/inference

## Detailed implementation requirements
Read SOURCE_SPECIFICATIONS/11_Browser_AI_Inference.md. Validate manifest hash/schema/version and preprocessing parity. Load model or clearly labeled baseline fallback, support cancellation/progress, low confidence UNCERTAIN, smoothing/hysteresis and minimum duration rules with raw predictions retained. Convert windows into nonoverlapping half-open intervals, handle gaps, video offset, seek-to-segment, manual corrections with provenance, separate verified versus inferred values. Show pause count/longest pause/durations and uncertainty warnings. Store immutable versioned analysis runs through Supabase; no overwriting historical provenance. When offline allow ephemeral local analysis but explicitly unsaved results.

## Acceptance gate
Model mismatch, missing model, zero predictions, overlapping windows, short pauses, video seeking, rerun provenance, RLS denial and performance tests.

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

# RubiVision AI — Solve History and Sessions

## Universal coding-agent execution contract
You are modifying an EXISTING repository, not generating an unrelated sample application. Before editing: inspect repository structure, package scripts, existing Supabase migrations, auth, domain contracts, tests, feature flags, and current behavior. Read `05_Solve_History_and_Sessions.md`, `00_DATA_CONTRACTS.md`, `00_MASTER_INSTRUCTIONS.md`, `00_INTEGRATION_CHECKLIST.md` and any available newer authoritative cloud specifications. Write an evidence-based inventory of what exists and what is missing. Do not assume the files suggested below exist.

**Authority:** The 2026-10-16 Supabase-only amendment supersedes older IndexedDB, local database, durable offline queue, and offline-first persistence language. Supabase PostgreSQL is the ONLY durable application database. In-memory optimistic/pending UI is allowed, but never claim unsynced data survives reload or disconnection. If the newer master sections 11–15 or category 02A are missing, identify them as missing, use the explicit amendment and current contracts, and record assumptions; never pretend you read absent documents. Preserve the timer's ability to run without a camera, but do not promise successful persistent save without network/authentication.

**Agent discipline:** Work only within this stage and necessary typed integration points. Reuse installed libraries and existing conventions. Never add production secrets, use service-role keys in browser, bypass RLS, fabricate test results, or silently delete existing data. Provide a plan, implementation, automated tests, actual command results, changed files, unresolved issues and handoff. If access to Supabase credentials, a local DB, or an actual browser is missing, implement what can be tested and mark the rest BLOCKED, not PASS. Avoid destructive migration commands against production. Commit only when authorized by repository workflow.

**Shared invariants:** Puzzle identifiers `222`, `333`, `444`, `555`, `666`, `777`; UUID identifiers; UTC ISO timestamps; rawTimeMs is an immutable nonnegative integer; penalty enum `NONE | PLUS_TWO | DNF`; effectiveTimeMs is derived (null for DNF, raw+2000 for PLUS_TWO, raw otherwise). Preserve exact scramble text and generator version. Distinguish manual, verified, and AI-derived provenance. Never change raw time on penalty edit. Session/solve/scramble references must match puzzle policy. Use owner-scoped access and explicit errors.

**Completion output for this stage:** status DONE/PARTIAL/BLOCKED, scope summary, files changed, migration IDs, commands actually executed with exit status, passing/failing tests, screenshots or reproducible browser checks when possible, security verification evidence, assumptions, remaining risks, and precise next stage prerequisites.

# Task 06_SOLVE_CAPTURE: Timer integration and exactly-once solve saving

## Required implementation work
Trace actual timer completion event and existing scramble locking. Capture one immutable payload at stop: solve UUID, session UUID, scramble UUID, exact notation, puzzle, rawTimeMs, penalty/inspection status, started/completed UTC, timing source. Never replace the displayed scramble with the next generated scramble before snapshot. Deduplicate keyboard/touch repeat and double submit using state-machine completion ID and DB unique ID. Show pending in memory while server write is in flight; success only after server acknowledgement; on error show UNSAVED and explicit retry using the same ID while page is open. Explain data loss risk if user reloads or closes before save; no durable offline queue. Handle auth expiration, network failure, timeout with ambiguous server commit, double click, duplicate ID, session not yet persisted, and concurrent session deletion. Tests: same event twice creates one row, retry after ambiguous timeout does not duplicate, +2/DNF correct, scramble immutable, raw time immutable, offline save visibly fails, page reload reflects confirmed server data. Gate: traceable end-to-end save.

## Mandatory procedure
1. Inspect and cite exact existing files and scripts.
2. Identify acceptance tests and constraints BEFORE editing.
3. Implement smallest coherent vertical slice with typed boundaries.
4. Write negative tests and failure states, not only happy path.
5. Run applicable checks and record exact results.
6. Deliver the stage handoff using `AGENT_HANDOFF_TEMPLATE.md`.

## Do not proceed when
The requested change would destroy existing user data, bypass authorization, or rely on an unknown critical contract. Stop and report the blocker rather than improvising an unsafe change.

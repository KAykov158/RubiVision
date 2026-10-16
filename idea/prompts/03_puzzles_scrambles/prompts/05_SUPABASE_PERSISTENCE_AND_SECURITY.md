# Shared mandatory coding-agent protocol
You are implementing RubiVision AI in an EXISTING repository. First inspect repository structure, package.json/lockfile, scripts, installed libraries, existing types, UI, timer lifecycle, Supabase migrations and policies, tests, and git status. Read `03_Puzzles_and_Scrambles(1).md`, `00_DATA_CONTRACTS.md`, `00_MASTER_INSTRUCTIONS.md`, `00_INTEGRATION_CHECKLIST.md`, `00_PROJECT_ROADMAP.md`, and newer authoritative Supabase specifications if available. Do not invent missing files, APIs, schema, or passing tests. Preserve unrelated work. Give a brief implementation plan, change only this task and necessary typed integration boundaries, write tests, run typecheck/lint/tests/build, report exact commands and results, changed files, risks, and acceptance evidence. If blocked, explain and stop rather than fake success.

**Precedence and architectural resolution:** the 2026-10-16 uploaded module's Supabase-only persistence override supersedes older IndexedDB/offline-first database instructions. Scramble generation and timing remain client-side and can work offline, but a completed solve is not durably saved until confirmed by Supabase; do not claim offline persistence, queue writes in durable storage, or silently discard failed writes. If authoritative newer master docs are available, compare them and document any unresolved conflicts before implementing. No service-role secrets in client code; enable RLS and test ownership.

**Quality:** stable UUIDs, UTC ISO timestamps, schema/version provenance, strict TypeScript, explicit Result/error contracts, accessible UI, cancellation and concurrency safety, deterministic tests, dependency/licence verification, secure database policies. No claim of WCA certification without verification. The cube viewer depicts a mathematically applied scramble, NOT camera-observed state.

# Cloud database schema, writes, RLS

## Objective and implementation instructions
Inspect existing Supabase schema and migrations before editing. Design minimal normalized `scrambles` with UUID id, owner/user_id, puzzle, exact notation, provider/version/method, created_at, optional seed, origin, challenge_id; `solves` must FK to immutable scramble and enforce matching puzzle/session ownership through trusted database constraints or secured RPC. Preserve existing schemas via additive migrations and documented backfills. Add indexes for owner, created_at and lookup; unique idempotency key for solve writes; avoid destructive migrations. Enable and test RLS on ALL new tables: owner-only SELECT/INSERT/UPDATE/DELETE; prohibit users from referencing another user's scramble/session; ensure security-definer RPC has explicit authorization and search_path if used. Use only anon/publishable client key, never service_role. Use atomic transaction/RPC for scramble+solve when necessary; explicit server-confirmed success. For anonymous/no-session state, document auth requirement or temporary in-memory-only mode; no fabricated durable save. Offline/network errors: keep unsaved solve in active memory, retry idempotently, offer manual export, show reload-loss warning. No IndexedDB, persistent localStorage database, or durable outbox. Add SQL policy tests, duplicate request tests, cross-user attacks and migration rollback notes.

## Deliverables
- Brief plan and dependencies.
- Exact code files and migration changes (except audit-only phase).
- Automated tests, manual test cases, and exact verification outcomes.
- Documentation and explicit limitations.
- Final status: PASS / PARTIAL / BLOCKED with evidence.

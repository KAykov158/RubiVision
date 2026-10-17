# Shared mandatory coding-agent protocol
You are implementing RubiVision AI in an EXISTING repository. First inspect repository structure, package.json/lockfile, scripts, installed libraries, existing types, UI, timer lifecycle, Supabase migrations and policies, tests, and git status. Read `03_Puzzles_and_Scrambles(1).md`, `00_DATA_CONTRACTS.md`, `00_MASTER_INSTRUCTIONS.md`, `00_INTEGRATION_CHECKLIST.md`, `00_PROJECT_ROADMAP.md`, and newer authoritative Supabase specifications if available. Do not invent missing files, APIs, schema, or passing tests. Preserve unrelated work. Give a brief implementation plan, change only this task and necessary typed integration boundaries, write tests, run typecheck/lint/tests/build, report exact commands and results, changed files, risks, and acceptance evidence. If blocked, explain and stop rather than fake success.

**Precedence and architectural resolution:** the 2026-10-16 uploaded module's Supabase-only persistence override supersedes older IndexedDB/offline-first database instructions. Scramble generation and timing remain client-side and can work offline, but a completed solve is not durably saved until confirmed by Supabase; do not claim offline persistence, queue writes in durable storage, or silently discard failed writes. If authoritative newer master docs are available, compare them and document any unresolved conflicts before implementing. No service-role secrets in client code; enable RLS and test ownership.

**Quality:** stable UUIDs, UTC ISO timestamps, schema/version provenance, strict TypeScript, explicit Result/error contracts, accessible UI, cancellation and concurrency safety, deterministic tests, dependency/licence verification, secure database policies. No claim of WCA certification without verification. The cube viewer depicts a mathematically applied scramble, NOT camera-observed state.

# Read-only repository reconnaissance

## Objective and implementation instructions
Inventory files, package manager, lockfile, TypeScript strictness, lint/test/build scripts, timer state machine, scramble code, puzzle selectors, routes, auth, Supabase client/migrations/RLS, environment variables, and existing tests. Identify whether repository is empty or already partially implemented. Compare source contracts to actual code. Search for IndexedDB/Dexie/localStorage persistent app data and cloud-first addenda; flag conflicts, do not delete on sight. Identify installed cubing.js or alternative and exact versions. Output current-state matrix: requirement, evidence/file, status (implemented/partial/missing), risk, recommended next task. Output dependency graph and decisions requiring approval. NO CODE CHANGES.

## Deliverables
- Brief plan and dependencies.
- Exact code files and migration changes (except audit-only phase).
- Automated tests, manual test cases, and exact verification outcomes.
- Documentation and explicit limitations.
- Final status: PASS / PARTIAL / BLOCKED with evidence.

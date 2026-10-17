# Shared mandatory coding-agent protocol
You are implementing RubiVision AI in an EXISTING repository. First inspect repository structure, package.json/lockfile, scripts, installed libraries, existing types, UI, timer lifecycle, Supabase migrations and policies, tests, and git status. Read `03_Puzzles_and_Scrambles(1).md`, `00_DATA_CONTRACTS.md`, `00_MASTER_INSTRUCTIONS.md`, `00_INTEGRATION_CHECKLIST.md`, `00_PROJECT_ROADMAP.md`, and newer authoritative Supabase specifications if available. Do not invent missing files, APIs, schema, or passing tests. Preserve unrelated work. Give a brief implementation plan, change only this task and necessary typed integration boundaries, write tests, run typecheck/lint/tests/build, report exact commands and results, changed files, risks, and acceptance evidence. If blocked, explain and stop rather than fake success.

**Precedence and architectural resolution:** the 2026-10-16 uploaded module's Supabase-only persistence override supersedes older IndexedDB/offline-first database instructions. Scramble generation and timing remain client-side and can work offline, but a completed solve is not durably saved until confirmed by Supabase; do not claim offline persistence, queue writes in durable storage, or silently discard failed writes. If authoritative newer master docs are available, compare them and document any unresolved conflicts before implementing. No service-role secrets in client code; enable RLS and test ownership.

**Quality:** stable UUIDs, UTC ISO timestamps, schema/version provenance, strict TypeScript, explicit Result/error contracts, accessible UI, cancellation and concurrency safety, deterministic tests, dependency/licence verification, secure database policies. No claim of WCA certification without verification. The cube viewer depicts a mathematically applied scramble, NOT camera-observed state.

# Timer-safe immutable scramble association

## Objective and implementation instructions
Inspect existing timer state machine. On eligible timer start/inspection boundary capture immutable scramble ID, exact notation, puzzle and generator metadata; never mutate during HOLDING/READY/RUNNING/STOPPED save lifecycle. Define when a new scramble may appear: only after the solve is finalized or explicitly discarded; failed save retains association and retry. Use one idempotency key/solve UUID per completed solve; double stop and rapid key events must not create duplicates. Validate puzzle equals session and scramble; block invalid saves with clear UI. Save the exact scramble that was displayed at solve start, not a regenerated value or latest React state. Handle navigation, tab visibility, generation finishing mid-solve, aborted solve, inspection, +2/DNF, and network failure. Add integration tests with fake timer and deferred promises.

## Deliverables
- Brief plan and dependencies.
- Exact code files and migration changes (except audit-only phase).
- Automated tests, manual test cases, and exact verification outcomes.
- Documentation and explicit limitations.
- Final status: PASS / PARTIAL / BLOCKED with evidence.

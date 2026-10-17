# Shared mandatory coding-agent protocol
You are implementing RubiVision AI in an EXISTING repository. First inspect repository structure, package.json/lockfile, scripts, installed libraries, existing types, UI, timer lifecycle, Supabase migrations and policies, tests, and git status. Read `03_Puzzles_and_Scrambles(1).md`, `00_DATA_CONTRACTS.md`, `00_MASTER_INSTRUCTIONS.md`, `00_INTEGRATION_CHECKLIST.md`, `00_PROJECT_ROADMAP.md`, and newer authoritative Supabase specifications if available. Do not invent missing files, APIs, schema, or passing tests. Preserve unrelated work. Give a brief implementation plan, change only this task and necessary typed integration boundaries, write tests, run typecheck/lint/tests/build, report exact commands and results, changed files, risks, and acceptance evidence. If blocked, explain and stop rather than fake success.

**Precedence and architectural resolution:** the 2026-10-16 uploaded module's Supabase-only persistence override supersedes older IndexedDB/offline-first database instructions. Scramble generation and timing remain client-side and can work offline, but a completed solve is not durably saved until confirmed by Supabase; do not claim offline persistence, queue writes in durable storage, or silently discard failed writes. If authoritative newer master docs are available, compare them and document any unresolved conflicts before implementing. No service-role secrets in client code; enable RLS and test ownership.

**Quality:** stable UUIDs, UTC ISO timestamps, schema/version provenance, strict TypeScript, explicit Result/error contracts, accessible UI, cancellation and concurrency safety, deterministic tests, dependency/licence verification, secure database policies. No claim of WCA certification without verification. The cube viewer depicts a mathematically applied scramble, NOT camera-observed state.

# Event-specific scramble generation

## Objective and implementation instructions
Research installed dependency and verify documented API and license before use. Choose maintained browser-compatible event-specific scramble generator; map all 222/333/444/555/666/777 to correct provider event IDs, noting 2x2/3x3 random-state vs big-cube random-move where supported and verified. Do not approximate random-state with random-move or label unofficial algorithm official. Generate asynchronously with cancellation/stale response protection and prevent main-thread timing jank (worker if justified). Normalize notation only when preserving exact original scramble text and ensuring equivalent semantics. Validate tokens with event-specific parser and ensure illegal moves are rejected; use library grammar rather than fragile regex. Test representative legal moves including primes, double turns, wide moves, and large-cube layers, inverse/round-trip where state engine supports it. Never silently return last scramble on failure or duplicate; implement explicit duplicate policy (retry bounded times; after exhaustion show error). Track provider name/version and generation method; seed only when generator truly supports reproducible seeding. Measure generation latency on representative devices, do not invent thresholds or claim speed.

## Deliverables
- Brief plan and dependencies.
- Exact code files and migration changes (except audit-only phase).
- Automated tests, manual test cases, and exact verification outcomes.
- Documentation and explicit limitations.
- Final status: PASS / PARTIAL / BLOCKED with evidence.

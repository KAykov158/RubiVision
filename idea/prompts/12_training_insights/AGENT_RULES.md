# Universal coding-agent rules

## Mandatory agent execution protocol
1. Inspect the actual repository (git status/log, package manifests, lockfiles, scripts, source tree, existing tests, migrations, environment templates). Identify what exists, what is missing and what is broken. Never assert the feature is absent without inspecting it.
2. Read `AGENT_RULES.md`, `ARCHITECTURE_AND_CONFLICT_RESOLUTION.md`, `IMPLEMENTATION_ROADMAP.md`, `ACCEPTANCE_MATRIX.md`, and the matching documents in `SOURCE_SPECIFICATIONS/`. Compare against current code before editing.
3. Report a concise pre-change audit: existing components, affected contracts, dependencies, files likely to change, risks, test strategy and rollback. Do not perform unrelated rewrites.
4. Implement a small vertical slice end to end. Prefer pure TypeScript domain functions, typed services and repositories, schema validation, stable UUIDs, ISO UTC dates, finite integer milliseconds and explicit error results. Never write Supabase directly from visual components.
5. Add tests for happy path, invalid inputs, boundaries, interrupted operations, permission/network failures, concurrency, retries and regression. Use deterministic fixtures and clocks where practical.
6. Execute actual available commands for formatting, lint, typecheck, unit/integration tests, production build, and relevant E2E tests. If a command cannot run, report exact reason and mark NOT VERIFIED. Do not claim a pass without execution.
7. Finish with files changed, schema changes, migrations, API/contract changes, observed command results, security/privacy considerations, screenshots or manual reproduction instructions, outstanding risks and a clear PASS/PARTIAL/BLOCKED verdict.
8. Do not fabricate cube states, algorithms, TPS, CFOP boundaries, model accuracy, dataset size, benchmark timings, WCA certification or cloud success. If the necessary evidence does not exist, show UNKNOWN/UNAVAILABLE.
9. If a task needs credentials, external devices, consented video, or user configuration, implement testable mocks/fixtures, document the blocker and never hardcode credentials.
10. Commit only when explicitly authorized by the user; do not destructively reset the repository or modify unrelated user changes.

## Architecture invariant
Supabase PostgreSQL is the only durable application database under the latest 2026-10-16 directive. Browser memory can hold temporary active timers, unsaved forms and transient video processing; do not add IndexedDB, localStorage-based persistent application records, service-worker write queues or hidden offline outboxes. Timer operation can continue without a network; saving, persistent history and durable analysis require a successful authorized Supabase operation. Explain network failures without claiming an unsaved solve was persisted. Video may be processed locally; uploading is explicit opt-in and uses owner-scoped Supabase Storage. No service-role secret in the browser. The historical source files contain superseded offline-first claims; do not implement those claims.

## Deliverable format
Use headings: AUDIT, PLAN, IMPLEMENTATION, TEST EVIDENCE, CONTRACT CHANGES, RISKS, NEXT STEP. Distinguish verified from unverified facts. No placeholders masquerading as production code.

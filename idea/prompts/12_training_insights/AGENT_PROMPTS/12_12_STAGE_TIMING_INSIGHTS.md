# Agent task 12: Manual CFOP stage timing and rule-based training insights

**Suggested execution:** one task per agent invocation; never launch all modules in one uncontrolled request.
**Primary outcome:** Annotation editor, metrics engine, insight rules, service/API, RLS tests and user-facing uncertainty labels.

## Mission and functional scope
Manual Cross/F2L/OLL/PLL boundaries and customizable method stages; edit/delete/persist annotations USER_ANNOTATED; stage metrics pause counts, longest pause, pause fraction, uncertainty, coverage; comparisons by session with sample sizes; seek-to-video evidence; rule-based suggestions only, with provenance.

## Detailed implementation instructions
- Locate the actual source implementations, tests, migrations, package versions and feature flags. Build on them rather than copying illustrative paths from specifications.
- Identify the public typed interface consumed by neighboring modules and document invariants, error states and version changes. Prefer interfaces over implicit coupling.
- Implement the user journey completely: entry conditions, actions, loading state, successful state, empty state, validation errors, recoverable failures, cancellation and accessible messaging.
- Keep domain calculations independent of React components and network calls; test pure functions before wiring persistence or UI.
- Use stable UUIDs, half-open time intervals where appropriate, UTC ISO timestamps, integer milliseconds and explicitly labeled provenance. Reject NaN, infinity, negative times, invalid identifiers and out-of-range intervals.
- Enforce ownership in Supabase RLS and Storage policies for every persisted user-owned entity; do not assume frontend filters are authorization.
- Ensure background operations cannot mutate stale UI after cancellation or component unmount; avoid races, duplicate writes and silent overwrites.
- Document all library/API choices with installed versions and links to authoritative documentation when accessible. No invented library APIs.
- Use structured error codes or typed result unions; user-facing errors should say what was saved and what was not.
- Add test fixtures that demonstrate the exact data contract, rather than only shallow component snapshots.

## Implementation decomposition
A. Audit existing module and upstream dependencies; write a scoped plan and confirm any schema changes.
B. Implement pure domain and validation logic with unit tests.
C. Implement repository/service adapters, auth boundaries and failure-safe behavior.
D. Implement accessible UI or developer tooling, including all states and provenance labels.
E. Add integration and browser tests, execute real checks and record evidence.
F. Update documentation, ADRs, checklist and next-agent handoff; stop when this module's gate is satisfied.

## Required failure and boundary cases
Overlapping/out-of-range stages; missing video; offset sign; zero-length intervals; unknown segments; stale corrections; concurrent annotation edits; multiple methods.
Additionally verify invalid IDs, absent configuration, denied permissions when relevant, cancellation, stale responses, idempotent retries, and failure without data corruption. For unsupported functionality, display an honest limitation rather than a fabricated success.

## Acceptance criteria
1. All described user journeys are demonstrable with deterministic fixtures or real configured services.
2. The module's public interfaces are typed and documented; existing modules remain compatible.
3. Every named edge case has a test or a clearly marked manual verification procedure.
4. No persistent application data is written to a browser database; required persistence is confirmed by Supabase acknowledgment.
5. No claim of completion is made without actual typecheck/test/build evidence and, when appropriate, RLS/E2E validation.
6. The report identifies what cannot be validated without external credentials, real videos or devices.

## Expected final agent report
- Status: VERIFIED / PARTIAL / BLOCKED
- Existing implementation found and changes made
- Files changed and migrations added
- Interfaces and contract compatibility
- Commands executed, exact results and test fixture names
- Manual reproduction procedure
- Security/privacy and data provenance review
- Remaining limitations and explicit next dependency

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


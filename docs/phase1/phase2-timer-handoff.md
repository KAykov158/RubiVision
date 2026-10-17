# Category 01 → Category 02 Handoff

**Scope:** Foundation/UI contracts handed to the Supabase data foundation.  
**Architecture authority:** master prompts 11, 12, 13, and 17; reconciled current specifications 02–04 and 08.  
**Current state:** UI shell only. No Supabase client, migrations, Auth integration, RLS policies, cloud repository, or persistent application database adapter is configured.

## Roadmap clarification

The original Prompt 19 filename and text refer to a “Phase 2 Timer” handoff. The authoritative Supabase-only roadmap defines Category 02 as the PostgreSQL schema/data foundation, Category 02A as Supabase Auth/RLS/cloud repository integration, and the timer as Category 04. This document hands off Category 02 first and records timer integration boundaries for the later timer category. It does not authorize Category 02 implementation.

## Architecture decisions to preserve

1. Supabase PostgreSQL is the sole persistent application database.
2. Supabase Auth is the identity provider for cloud access. Owner-scoped PostgreSQL RLS is the authorization boundary; client-supplied owner identifiers are not authorization.
3. Use versioned SQL migrations, constraints, generated database types, and tested RLS policies. Avoid dashboard-only schema drift.
4. Do not add IndexedDB, another browser database, localStorage application persistence, a durable offline write queue, or automatic offline synchronization.
5. A failed write may remain only in volatile tab memory with explicit unsaved status. Timer measurement must not block on network; saving is not successful until Supabase acknowledges it. Any retry is an explicit, idempotent user action, not background synchronization.
6. Supabase Storage is optional and limited to a later explicitly consented media feature with reviewed access policies. It is not a second application database.
7. Keep feature services/repositories responsible for persistence. Views do not call Supabase directly.
8. Do not fabricate successful cloud responses or display saved state before server acknowledgement.

## Existing domain and service contracts

The canonical TypeScript definitions are in apps/web/src/shared/domain/contracts.ts.

- PuzzleType is 222, 333, 444, 555, 666, or 777. Penalty is NONE, PLUS_TWO, or DNF. TimingSource is KEYBOARD, TOUCH, or SMART_CUBE. IDs are stable UUID strings; times are integer milliseconds; timestamps are UTC ISO strings.
- ScrambleService.generate(puzzle) returns ServiceResult<Scramble>.
- SolveRepository.save(solve), get(id), list(filter), and updatePenalty(id, penalty) return typed ServiceResult values. Save must not be reported successful without the database acknowledgement. Future persistence must protect the session, scramble, and solve relationships.
- AnalysisService.analyze(recordingId, options) accepts an optional AbortSignal and returns ServiceResult<SolveAnalysis>. It is a later integration seam, not an active page operation.
- UserPreferencesService.getThemePreference() and saveThemePreference(theme) return ServiceResult values. No default persistence adapter exists; the current theme selection is session-only unless an injected service acknowledges persistence.
- ServiceResult distinguishes success, unavailable (NOT_CONFIGURED, AUTH_REQUIRED, NETWORK_REQUIRED, UNSUPPORTED), and errors (including invalid input, not found, forbidden, conflict, network, rate limited, cancelled, and unknown).
- There is currently no SessionRepository or statistics service contract in AppServices. Define those in their owning scope before implementing session mutations or statistics; do not smuggle database operations into UI components.

AppProviders composes locale, error, app-service, and theme providers above BrowserRouter. The default AppServices provider reports NOT_CONFIGURED. Timer runtime, scramble generation, and service-backed persistence are absent.

## Category 02 priorities

1. Re-read the reconciled master architecture/data contracts and the approved Category 02 schema prompt before designing tables. Map only accepted domain requirements; do not prematurely create storage for deferred camera/model/AI features.
2. Define PostgreSQL keys, constraints, foreign-key relationships, timestamp/time units, penalty representation, session ownership, and idempotent solve-save behavior.
3. Add versioned migration files and generated TypeScript database types. Keep stable UUID and canonical domain-model boundaries.
4. Enable and test RLS for every user-owned table. Include unauthenticated denial, cross-user reads/writes, and child-row ownership checks.
5. Verify migration application, constraint behavior, and restore/export assumptions against a development Supabase project without using production credentials in the browser.
6. Keep integration tests on explicit service boundaries. Until Category 02A Auth/RLS and repositories are implemented and tested, the app must continue to show its existing unavailable state.

Category 02A then integrates Supabase Auth, session lifecycle, client-safe configuration, typed repositories, and app-service injection. Only public URL and publishable/anon key may be exposed in browser configuration; service-role credentials remain server-side.

## Later timer boundary (Category 04)

- Place the timer runtime/provider at app lifetime above route content so navigation does not recreate an active solve.
- Use a monotonic clock and an explicit state machine; do not use render intervals to measure elapsed time.
- Define keyboard/touch input boundaries, ignore repeat/duplicate events, preserve the exact scramble associated with a solve, and keep timing independent from network latency.
- On stop, surface the result immediately with Saving or Unsaved state as appropriate. Only transition to Saved after the service reports Supabase acknowledgement.
- Keep failed solve data in memory only while the tab remains open, explain possible loss on refresh/closure, and offer explicit retry/copy/export. Use a stable ID and idempotent write strategy to prevent duplicates after an uncertain response.
- Add unit tests for clock/state transitions, duplicate input, penalties, failed/uncertain saves, retry idempotency, route lifecycle, and exact scramble-to-solve association. Do not claim timing accuracy from the current placeholder shell or Prompt 18 lifecycle simulation.

## Unresolved risks and required gates

| Risk / unknown | Current status | Gate |
|---|---|---|
| No Supabase project/client, schema, migrations, or generated DB types | NOT IMPLEMENTED | Category 02 and 02A |
| Auth and RLS ownership/policy coverage | NOT IMPLEMENTED | Category 02A; test direct unauthorized queries and child ownership |
| Solve/session persistence and save acknowledgement | NOT IMPLEMENTED | Category 02A and Category 05 integration |
| Session repository and statistics service contracts | NOT DEFINED | Define in their owning categories before implementation |
| Browser deployment headers and real hosted environment | NOT VERIFIED | Deployment/release phase |
| Mutable GitHub Actions references | Known low supply-chain risk | Pin reviewed SHAs before relying on hosted CI for a security-sensitive release |
| Development error logging includes caught errors/component stack | Known pre-data risk | Sanitize before services can include user records or backend details |
| WebKit offline-event delivery | NOT VERIFIED in Playwright emulation | Keep explicitly unverified; no offline persistence claim |
| Manual assistive technology, forced colors, and browser zoom | NOT VERIFIED | Manual platform/accessibility testing |

## Category 01 evidence

The final gate report is docs/phase1/completion-report.md. Prompt 19’s current verification passed typecheck, lint, all 75 unit/integration tests, all 77 default Chromium browser tests, production build, and git diff --check. Previous Prompt 15 cross-engine evidence records Chromium 77/77, Firefox 77/77, and WebKit 76 passed with one documented offline-emulation skip.

No Category 02 code or database operations are included in this handoff.
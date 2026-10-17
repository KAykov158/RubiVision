# Prompt 18 — Integration Simulation

**Status:** PASS for Prompt 18 scope
**Scope:** Test-only rehearsal of the existing Foundation/UI service and route seams. No production feature behavior, persistence adapter, database, or backend response was added.

## A. Executive summary

Prompt 18 adds typed test-only doubles for the canonical `ScrambleService`, `SolveRepository`, and `AnalysisService` contracts; canonical test fixtures with verified solve/session/scramble/recording relationships and penalty semantics; and integration tests against the existing Solves route and app routing. A stateful test-only counter above the route tree checks React lifecycle preservation through navigation. It is explicitly not a timer or timing-accuracy test.

At the time Prompt 18 was completed, older Foundation source documents still described offline-first and IndexedDB persistence. This documentation conflict has since been reconciled: active Foundation guidance now follows the Supabase-only architecture, while original statements are explicitly marked as superseded historical context.

## B. Requirements traceability

| Criterion | Status | Evidence | Notes |
|---|---|---|---|
| Test-only mocks implement the canonical scramble, solve repository, and analysis interfaces | PASS | `apps/web/src/test/support/integrationServiceMocks.ts`; 8 passing tests in `IntegrationSimulation.test.tsx` | Defaults return `NOT_CONFIGURED`; only individual tests supply fixture success values. |
| Loading, success, unavailable, and failure states are exercised at UI/service boundaries | PASS for current boundaries | `IntegrationSimulation.test.tsx`; existing `SolvesStatisticsPages.test.tsx` / `AnalyzeChallengesSettingsPages.test.tsx` | Solves runs through the actual route boundary. Analyze remains a placeholder; its tests verify presentation states, not a production `AnalysisService` integration. Scramble service responses are contract-simulated because Timer does not yet call the service. |
| App-scoped timer-like test state survives route changes | PASS | Test-only lifecycle provider in `IntegrationSimulation.test.tsx`; full unit suite | It checks provider lifetime only; it does not implement or measure a timer. |
| Puzzle, session, solve, scramble and analysis fixture relationships and time/penalty semantics are verified | PASS | Fixture assertions and `effectiveTimeMs` cases in `IntegrationSimulation.test.tsx` | Fixed UUIDs, UTC timestamps, integer `rawTimeMs`, matching puzzle IDs, and `NONE` / `PLUS_TWO` / `DNF` semantics. |
| Timer → history/analysis placeholder → back navigation preserves state without a page reload | PASS for tested route lifecycle | Timer → Solves → Analyze → browser-back integration test; existing Playwright browser-history coverage | Route content and the outside lifecycle counter are asserted after each transition. No real timer is claimed. |
| Rejected, cancelled, stale, unexpected, and missing-service cases are covered where supported | PASS for available contracts | New rejected/cancelled/missing cases; existing stale and malformed-response Solves tests | Cancellation is passed through the canonical `AbortSignal` option; existing Solves tests cover stale responses and unknown/malformed results. |
| Later-module integration seams are documented | PASS | Section H and the handoff below | Describes the existing interfaces and explicitly identifies absent runtime adapters. |
| Supabase-only persistence architecture is preserved; no fake production implementation is added | PASS | File scope, source review, architecture references in Section D, production build | Fixtures and service doubles are under test support and imported only by tests. |

### Original Prompt 18 detailed requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. Minimal canonical service mocks; no fake production data | PASS | Test-support mock module; no production imports |
| 2. Service states simulated without domain logic | PASS for current shell seams | Existing Solves route plus presentational Analyze state-panel tests; unconsumed services remain contract-only |
| 3. Stateful timer-like provider above routes | PASS | Test-only lifecycle counter and route-transition test |
| 4. Canonical IDs, relationships, milliseconds, and penalties | PASS | Fixture assertions |
| 5. Timer/history/analysis navigation and state preservation | PASS | Integration route test |
| 6. Rejection, cancellation, stale response, and missing service | PASS for supported cases | New and existing tests listed above |
| 7. Phase 2/3/4 and AI integration seams | PASS | Section H |
| 8. Test-only simulation code | PASS | New helpers and test live under `src/test/support` and `src/app/*.test.tsx` |

## C. Changed files

| File | Change |
|---|---|
| `apps/web/src/test/support/integrationFixtures.ts` | Added typed, fixed test-only Scramble, Session, Solve, Recording, SolveAnalysis, and penalty fixtures. |
| `apps/web/src/test/support/integrationServiceMocks.ts` | Added `vi.fn`-based mocks for the canonical service interfaces. Defaults are explicitly unavailable; tests opt into fixture results. |
| `apps/web/src/app/IntegrationSimulation.test.tsx` | Added fixture invariant checks, mock contract checks, Solves UI boundary checks, rejection/cancellation/missing-service cases, and route lifecycle coverage. |
| `docs/phase1/prompt18-completion.md` | Added the required Prompt 18 handoff and evidence report. |

No production source, runtime configuration, dependency, lockfile, historical architecture specification, or persistence implementation was changed.

## D. Architecture decisions

- `ScrambleService`, `SolveRepository`, `AnalysisService`, and `ServiceResult` from `src/shared/domain/contracts.ts` remain the source of truth. The tests do not create parallel service contracts.
- The app’s injected services and route components are reused. Solves already calls the injected solve list service and validates its response. Timer and Analyze are still shells and are not wired to new runtime operations by this task.
- The timer-like state provider exists only inside a test file, above `AppProviders` and the route tree. It demonstrates that a parent provider remains mounted across client-side navigation. It does not verify monotonic time, inspection, keyboard timing, or solve creation.
- Test fixture values are deterministic and test-only. They do not represent real user data or a backend response.
- The Supabase-only decision in `master prompts/11_CLOUD_FIRST_DECISION_AND_OVERRIDES.md` and `17_SUPABASE_ONLY_IMPLEMENTATION_GUIDE.md` prevails over legacy Foundation text. Supabase PostgreSQL remains the sole persistent application database; Auth and owner-scoped RLS are future integration gates. No IndexedDB, localStorage persistence, queue, sync worker, Supabase client, or cloud adapter was introduced.

## E. Security and privacy review

The new helpers are only imported by tests and use fixed synthetic identifiers and values. There are no credentials, network calls, browser storage calls, permission requests, uploads, or production mock services in the changed scope. The analysis fixture uses an opaque test reference only; no media asset exists.

The Prompt 17 report recorded legacy IndexedDB/offline-first documentation conflicts as open at that audit point; the current documentation cleanup resolves that item while preserving the dated report. Its separate findings about mutable GitHub Actions references, development-only raw exception logging, and future Supabase Auth/RLS controls remain outstanding.

## F. Test evidence

Checks ran from `apps/web` on Windows PowerShell with Node.js `v24.20.0` and npm `11.19.0`. Playwright used managed Chromium `156.0.8078.4`.

| Command | Exit | Result |
|---|---:|---|
| `npm run typecheck` | 0 | Passed. |
| `npm run lint` | 0 | Passed with no ESLint diagnostics. |
| `npm test` | 0 | 14 test files, 75 tests passed; 0 failed, 0 skipped. The new integration file contributes 8 passing tests. |
| `npm run test:e2e` | 0 | 77 Chromium browser tests passed; 0 failed, 0 skipped. Existing direct-route, navigation/history, responsive, theme, and accessibility flows ran. |
| `npm run build` | 0 | Vite 8.3.4; 118 modules transformed. JS 306.12 kB (gzip 92.81 kB), CSS 21.03 kB (gzip 4.32 kB), HTML 0.54 kB. |
| `npm audit --audit-level=low` | 0 | Found 0 vulnerabilities. |
| `git diff --check` | 0 | No whitespace errors. Git printed existing LF-to-CRLF working-copy warnings for modified Prompt 12–16 files. |

The first full unit run caught one premature assertion in the new deferred-loading test: the test resolved its promise before the page’s scheduled service call started. The test now waits until the mock has been called; the focused test then passed 8/8, and the complete suite passed 75/75. This was a test synchronization defect, not an application defect.

Playwright printed a non-failing Node warning that `NO_COLOR` is ignored when `FORCE_COLOR` is set. There were no skipped browser tests.

No hosted CI result is inferred from local test results.

## G. Outstanding issues

- Current app composition has no configured service adapter; Solves therefore remains unavailable by default. The only successful service response in this prompt is a synthetic test fixture.
- The Analyze screen’s production UI does not invoke `AnalysisService`. Existing component tests verify its display-state slots; implementing the service integration belongs to the later analysis feature.
- Current app composition has no timer runtime or scramble generation. The lifecycle test is not timing verification.
- Statistics has no calculation service contract yet. It must be established from real, validated solve data in its owning phase.
- No Supabase project, Auth, schema, RLS policy, or cloud repository exists in this Phase 1 shell. Do not claim persistence.
- Browser-specific behavior is covered only by the existing Playwright suite; no new production/browser feature was added here.

## H. Next phase handoff

Prompt 19 may rely on these verified seams only after the checks in Section F pass:

1. **Supabase data foundation and Auth:** implement versioned PostgreSQL migrations, generated database types, authenticated ownership, and RLS policies before adding persistent application data. Client-provided owner IDs are not an authorization boundary.
2. **Scrambles:** implement `ScrambleService.generate(puzzle)` with validated canonical `Scramble` values. The current Timer shell does not call it. Do not use the test fixture notation as real generated data.
3. **Timer:** put the timer runtime/provider above route content, use a monotonic clock, preserve the exact scramble associated with a solve, and report network save status honestly. The current lifecycle test checks only that an outer test provider survives navigation.
4. **Solve persistence/session integration:** implement `SolveRepository` through the Supabase adapter and define session ownership, referential integrity, idempotent save, penalty updates, and unsaved failure handling. The current Solves page only lists through an injected service.
5. **Statistics:** define a typed statistics service/aggregate contract and calculate only from validated persisted solves; no statistics service currently exists in `AppServices`.
6. **Analyze and later AI pages:** implement recording/analysis services only in their owning phase. Preserve user consent, abort/cancellation semantics, resource cleanup, provenance, uncertainty, and the distinction between movement classification and exact move/CFOP claims. The current Analyze page does not call `AnalysisService`.

The original Prompt 18 refers to a local Phase 2 Timer / Phase 3 Scrambles-Storage / Phase 4 Statistics sequence. The newer authoritative roadmap orders the later categories as Supabase schema (02), Supabase Auth/RLS (02A), scrambles (03), timer (04), solve sessions (05), and statistics (06). “Storage” must mean the future Supabase-backed repository seam, never a local database or offline queue.

## Acceptance evidence

| Criterion | PASS / FAIL / NOT VERIFIED | Evidence (test/command/manual step) | Notes |
|---|---|---|---|
| App-scoped state survives navigation in automated test | PASS | `IntegrationSimulation.test.tsx` — retained test-only counter through Timer → Solves → Analyze → browser back. |
| Typed service mocks compile and failure paths render | PASS | `npm run typecheck`; `IntegrationSimulation.test.tsx`; full unit suite 75/75. |
| No fake production implementations introduced | PASS | Only three new implementation/test files are under test or test-support; no production files changed. |
| Handoff maps interfaces to later modules | PASS | Section H documents the Supabase, scramble, timer, solve/session, statistics, and analysis seams. |


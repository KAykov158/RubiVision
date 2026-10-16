# Prompt 14 — Independent Phase 1 Verification

**Date:** 2026-10-16

**Baseline:** `f261221fced5317b8f48810c0aea0f0c8e719059`
**Verdict:** **CONDITIONAL PASS** for the Foundation/UI shell. This is not acceptance of the full RubiVision MVP or any deferred integration.

## 1. Verdict and scope

I independently reviewed the Foundation/UI source, tests, Phase 1 acceptance documents, the five pre-existing Prompt 12 documentation changes, and the Supabase-only architecture decisions. I reproduced the reported theme race, fixed it with a request sequence guard, and added a permanent deferred-response regression test. I did not change the Prompt 12 documents or other feature code.

For precedence, I used `idea/documantation/RubiVision_AI_SUPABASE_ONLY_FULL_DOCUMENTATION.md` §§11–17 and `idea/master prompts/11_CLOUD_FIRST_DECISION_AND_OVERRIDES.md` / `17_SUPABASE_ONLY_IMPLEMENTATION_GUIDE.md` as the current architecture sources. The full documentation’s opening revision explicitly labels the preserved local-storage passages as historical.

The six route shells, service boundaries, explicit unavailable states, keyboard navigation, and Chromium viewport/theme matrix meet the Foundation/UI shell scope. The code has no persistent application database yet; Supabase PostgreSQL/Auth/RLS are the selected future integration, not an implemented feature. The conditional status reflects unresolved specification contradictions and CI hardening/verification gaps documented below.

## 2. Baseline and preserved changes

At the start of this review, `HEAD` was the required baseline and the only uncommitted changes were these five Prompt 12 documentation files:

- Modified: `README.md`, `docs/phase1/architecture-and-contracts.md`, `idea/prompts/01_foundation_ui/CHECKLIST_PHASE1.md`.
- Untracked: `docs/phase1/completion-report.md`, `docs/phase1/prompt12-final-audit.md`.

They were inspected and preserved. No files were staged or committed, no remote is configured, and nothing was pushed. During Prompt 14, the theme provider and its test were changed as disclosed in the work log below; this new report is the only other Prompt 14 file.

## 3. Architecture verification

| Requirement | Result | Evidence |
|---|---|---|
| React, TypeScript, Vite | PASS | `apps/web/package.json`, Vite configuration, strict TypeScript options, successful typecheck and production build. Node 24.20.0; npm 11.19.0. |
| Typed domain/service boundaries | PASS | `src/shared/domain/contracts.ts` defines canonical puzzle, penalty, solve, session, scramble, analysis and service-result types. `AppServicesProvider` injects services; pages do not import a database client. |
| Supabase-only persistent database design | PASS as the selected architecture; integration NOT IMPLEMENTED | Master decisions 11 and 17 make Supabase PostgreSQL the only persistent application database, require Supabase Auth, and plan owner-scoped RLS. `architecture-and-contracts.md` documents that boundary. No client, migration, Auth adapter, RLS policy, or repository is configured in this Foundation implementation. |
| No IndexedDB, localStorage persistence, durable queue, or automatic sync | PASS in application source | Search of `apps/web/src` found no browser storage APIs, service-worker sync, network/database client calls, or persistence adapter. Theme selection defaults to session-only. |
| No fabricated feature data | PASS | No production solve rows, statistics, challenges, or analysis outputs are seeded. Timer’s static `0.00` is labeled unavailable and its start/stop controls are disabled. Solves, statistics, Analyze, and Challenges report unavailable/empty states without pretending to call a backend. |
| Deferred integrations remain deferred | PASS | No timer runtime, scramble generator, solve persistence, statistics calculation, camera/media API, upload, model inference, or challenge service is present in `apps/web/src`. |
| Secrets and environment boundary | PASS for inspected app/config files | `.env.example` contains commented placeholders only; `.gitignore` excludes environment secrets, dependencies, builds, browser profiles, coverage and Playwright outputs. No credentials were found. |

## 4. Six-route functional review

| Route | Independent result | Evidence and limits |
|---|---|---|
| `/timer` | PASS — shell only | Direct route, unavailable scramble/timer presentation, disabled actions, 0.00 disclosure, theme and viewport checks pass. It does not run a timer. |
| `/solves` | PASS — repository seam only | Defaults to unavailable without an injected service. Component coverage exercises loading, empty, unavailable, malformed/error, retry, filters and penalty display. No production solve data exists. |
| `/statistics` | PASS — placeholder only | No aggregates or chart values are fabricated; disabled scope controls and insufficient-data state are shown. No calculation service exists. |
| `/analyze` | PASS — placeholder only | Camera/upload controls are disabled; source has no camera, file, upload, or inference calls. Results remain unavailable. |
| `/challenges` | PASS — placeholder only | No challenge, participant, ranking, or result data is fabricated; participation is unavailable and disabled. |
| `/settings` | PASS — current scope | Theme control supports light/dark/system and system media changes. Account, language, privacy, and other preferences are unavailable or not persisted. |

Browser tests cover direct routes, the root redirect, unknown routes, back/forward, mobile drawer routing, theme changes, and the 320/375/768/1024/1440 CSS-pixel matrix in light and dark themes. They report no unintended overflow in those runs. Service-error recovery is directly tested for Solves and the shared error boundary is unit-tested; route-boundary recovery is not separately injected through the complete browser shell.

## 5. Findings

### IV-001 — P1 / Medium: stale theme read overrode a newer user choice — FIXED

- **Affected files:** `apps/web/src/shared/preferences/ThemeProvider.tsx:33,58-77,89-103`; regression coverage in `ThemeProvider.test.tsx:68-90`.
- **Confirmed reproduction:** a temporary deferred-promise test held `getThemePreference()` pending, selected Dark, then resolved the old read with Light. Before the fix the provider changed the current preference and applied theme to Light. The temporary test was removed after execution.
- **Cause and impact:** cleanup only invalidated the read on unmount/service replacement. The response did not check whether the user had made a newer selection, so an injected account-backed adapter could apply stale state.
- **Remediation:** the provider now sequences preference reads and writes. A user selection advances the sequence; a stale read or save result is ignored. The permanent regression test verifies the delayed Light response cannot replace Dark.
- **Acceptance effect:** did not block the default shell, which has no preference adapter; would have blocked safe persisted-preference integration. The fix is covered by the final unit suite.

### IV-002 — P1 / Medium: legacy Foundation specifications lack local precedence notices

- **Affected documents:** `idea/prompts/01_foundation_ui/SOURCE_SPECIFICATIONS/00_MASTER_INSTRUCTIONS.md:4,17,20`; `00_DATA_CONTRACTS.md:56,73-76`; `00_INTEGRATION_CHECKLIST.md:36`; `01_Foundation_and_UI.md:30`.
- **Confirmed evidence:** these files still say offline-first, describe IndexedDB as the offline source of truth/schema, or call cloud sync optional. The current decisions in `idea/master prompts/11_CLOUD_FIRST_DECISION_AND_OVERRIDES.md:3-6` and `17_SUPABASE_ONLY_IMPLEMENTATION_GUIDE.md:4` explicitly supersede those storage/auth/sync instructions. Therefore the precedence is clear when the override is read, but the required source specs are contradictory when consumed alone.
- **Impact:** later work that reads only the prescribed source files could introduce a forbidden local database or offline queue.
- **Recommendation:** retain the original files for traceability and add a short, prominent “historical storage text superseded” banner linking to 11 and 17. Preserve all non-storage requirements; update only conflicting checklist wording where it could authorize optional offline synchronization.
- **Acceptance effect:** no implementation violation found; documentation risk for later integration, not a blocker to the current shell.

### IV-003 — P1 / Medium: the architecture addendum itself still prescribes an IndexedDB outbox

- **Affected document:** `idea/master prompts/02_ARCHITECTURE_DATA_CONTRACTS.md:1,5,19`.
- **Confirmed evidence:** the addendum says Supabase is required, but also says “IndexedDB is a resilience cache/outbox” at line 1 and “durable local outbox/cache” at line 19. The later firm decision explicitly disallows an IndexedDB schema, local repository, outbox, and automatic sync. This is more than an unmarked historical passage: the cloud-first addendum restates the prohibited design as current guidance.
- **Impact:** the master architecture reference can lead future categories to implement persistence that conflicts with the latest decision, despite the 11/17 precedence documents.
- **Recommendation:** preserve the original specification, but correct the additive revision and its “Cloud-first authoritative contracts” paragraph to say Supabase PostgreSQL is the sole persistent store, with only transient in-memory pending data on network failure and no IndexedDB/outbox/sync. Cross-link 11 and 17.
- **Acceptance effect:** current application source complies; reconcile before categories consume this architecture reference for persistence work.

### IV-004 — P2 / Low: GitHub Actions references are mutable tags

- **Affected workflow:** `.github/workflows/ci.yml:26,29,58` uses `actions/checkout@v7`, `actions/setup-node@v7`, and `actions/upload-artifact@v5`.
- **Confirmed evidence and risk:** GitHub documents that a tag/branch reference resolves to the commit it points to at run time, whereas a full commit SHA is immutable. A tag move could change the action code executed without a workflow diff. This is a supply-chain/reproducibility risk, not evidence of a compromised action. The workflow limits `GITHUB_TOKEN` to `contents: read`, has no application secrets, and uses the normal `pull_request` event, which reduces impact.
- **Recommendation:** use a workflow dependency lockfile where supported or pin verified full commit SHAs and automate reviewed updates. GitHub’s current guidance describes both immutable SHA pinning and workflow dependency lockfiles: [Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use), [workflow dependency lockfiles](https://docs.github.com/en/actions/concepts/security/workflow-dependency-lockfiles).
- **Acceptance effect:** not a Phase 1 UI blocker; CI hardening is recommended before relying on hosted CI for releases.

### IV-005 — P2 / Low: local browser tests may reuse a stale Vite server

- **Affected file:** `apps/web/playwright.config.ts:22` sets `reuseExistingServer: !process.env.CI`.
- **Confirmed behavior:** local runs may attach to an already-listening server on port 5173 instead of the current checkout’s server. A stale process could make a local run pass against old code. CI sets `CI`, so it starts an isolated server. This review’s actual Playwright run started its own server; no stale-server effect was observed.
- **Recommendation:** make reuse opt-in (for example, a documented environment variable), or disable it for acceptance runs. Keep the current fast local workflow only if the report clearly records when a pre-existing server is reused.
- **Acceptance effect:** no failures observed; local reproducibility risk only.

### Unverified concerns (not confirmed defects)

- No GitHub-hosted CI run is possible/evidenced; no remote is configured.
- `actionlint`, a YAML parser, and Python/PyYAML were unavailable. Workflow syntax and intent were reviewed manually, not parser-validated.
- No axe/automated WCAG audit or manual screen-reader, forced-colors, 200% zoom, physical touch, or cross-browser session was run. Chromium coverage verifies representative contrast pairs, focus, landmarks, skip link, reduced motion, and native mobile-dialog behavior; it is not full WCAG certification.
- The route-boundary fallback was tested as a component, but a route component was not deliberately crashed in the full browser shell. Source composition leaves `AppShell` navigation outside each route boundary.
- The Solves page performs runtime response checks, but IDs are only checked as non-empty strings and timestamps as parseable strings rather than full canonical UUID/UTC validation. This is a future service-adapter validation risk; no real adapter exists.
- `AppErrorBoundary` logs the caught error object and component stack in development. No current backend data is configured, but future service exceptions should be sanitized before logging.

## 6. Independent test and CI verification

Final commands ran from `apps/web` on Windows PowerShell using Node 24.20.0 and npm 11.19.0. After the theme fix, all final project checks passed:

| Command | Exit | Result |
|---|---:|---|
| `npm run typecheck` | 0 | Pass. |
| `npm run lint` | 0 | Pass. |
| `npm test` | 0 | 13 files, 67 tests passed. Includes the new deferred-read regression. |
| `npm run test:e2e` | 0 | 72 Chromium tests passed in 34.7 seconds; no failed, skipped, or retried tests reported. |
| `npm run build` | 0 | Vite 8.3.4 production build passed; JS 306.11 kB (92.81 kB gzip), CSS 21.03 kB (4.32 kB gzip). |
| `git diff --check` | 0 | Pass for tracked changes. New report also received a trailing-whitespace scan. Git emitted only LF-to-CRLF working-copy warnings. |
| Temporary clean-install `npm ci` | 0 | Ran in an isolated temp directory containing copies of only `package.json` and `package-lock.json`; installed 246 packages and reported 0 vulnerabilities. The temporary tree was removed. |

An initial post-fix typecheck caught a widened mock return type in the new test (`"success"` inferred as `string`). The mock was explicitly typed, then the complete final command set above passed. The initial baseline verification, before the fix, was independently reproduced as 66 unit tests and 72 browser tests passing.

Vitest uses `vmThreads`, two workers, deterministic non-shuffled order, clear/restore mocks, and shared after-each cleanup of rendered trees, timers and stubbed globals. Playwright forbids focused tests, records failure traces, and uses isolated browser contexts; this run used five workers. CI is configured for two workers and does not reuse an existing server.

The GitHub workflow defines push to `master`/`main`, pull-request, and manual triggers; locked `npm ci`; typecheck, lint, unit tests, build; Playwright Chromium/system dependency installation; browser tests; and failure-only diagnostics with seven-day retention. Workflow source review passed, but parser validation and hosted execution are **NOT VERIFIED**.

## 7. Architecture contradictions and precise documentation recommendations

The Supabase-only project decision is explicit: PostgreSQL is the sole persistent app database, Auth is required, RLS must protect user-owned data, and no browser database, offline outbox, or automatic synchronization is allowed. Runtime source conforms by having no persistence at all. The remaining problem is conflicting guidance in source documents, especially the active-looking IndexedDB addendum in `02_ARCHITECTURE_DATA_CONTRACTS.md`.

Recommended order:

1. Correct only the contradictory current addendum in `02_ARCHITECTURE_DATA_CONTRACTS.md`; do not erase its original historical content or non-storage contracts.
2. Add supersession banners to the four Phase 1 source documents listed in IV-002, linking to master 11/17.
3. Keep the existing Prompt 12 audit and completion report unchanged; this report records the independent evidence.
4. Before cloud integration, recheck the category 02/02A schema, Auth, generated types, RLS and cross-account tests against the single-database decision.

## 8. Acceptance evidence matrix

| Criterion | Status | Evidence | Notes |
|---|---|---|---|
| Review cites concrete source locations and reproduction | PASS | IV-001 through IV-005 give paths/lines; IV-001 has a deterministic deferred-promise reproduction. | Temporary reproduction file was removed; permanent regression remains. |
| Critical Phase 1 defects fixed or clearly blocked | PASS | No P0/critical defect found. The reproduced theme race is fixed and regression-tested. | Documentation and CI risks remain explicit. |
| Regression tests cover fixed defects | PASS | New ThemeProvider deferred-response test; final unit suite 67/67 passed. | It protects only this race. |
| Report distinguishes checked and unchecked behavior | PASS | Sections 4–7 and unverified concerns list. | Hosted CI and manual platform checks remain NOT VERIFIED. |
| Six route shells and truthful unavailable states | PASS | Route source review; direct route/navigation E2E and component tests. | Feature integrations are intentionally absent. |
| Responsive light/dark behavior at required widths | PASS | 72 Playwright tests; all six routes at 320/375/768/1024/1440 CSS px in light/dark. | Chromium only. |
| Supabase-only persistence boundary | PASS for architecture/source; integration NOT IMPLEMENTED | Master 11/17 and app-source scan. | No Supabase client, Auth or RLS implementation exists in Phase 1. |
| Typecheck, lint, unit tests, browser tests, production build | PASS | All final command exit codes 0; counts in section 6. | Playwright emitted non-failing `NO_COLOR`/`FORCE_COLOR` warnings. |
| Clean install using lockfile | PASS | Isolated temporary `npm ci`, exit 0. | Did not replace project dependencies. |
| CI workflow syntax/hosted execution | NOT VERIFIED | No parser/actionlint or hosted run available; manual review only. | No remote configured. |
| Full WCAG/manual assistive-technology compatibility | NOT VERIFIED | No screen-reader/forced-colors/zoom/physical-touch/cross-browser run. | Automated checks are meaningful but partial. |

## 9. Git state and changed files

`HEAD` remains `f261221fced5317b8f48810c0aea0f0c8e719059`. Nothing was staged or committed; there is no configured remote. The three modified and two untracked Prompt 12 documents remain preserved. Prompt 14 adds/modifies only:

- Modified: `apps/web/src/shared/preferences/ThemeProvider.tsx` — stale-read invalidation and shared preference sequencing.
- Modified: `apps/web/src/shared/preferences/ThemeProvider.test.tsx` — deterministic delayed-read regression.
- Created: `docs/phase1/independent-review.md` — this report.

The final `git diff --check` passed. Git reported conventional LF-to-CRLF warnings for changed text files. Generated build and Playwright outputs remain ignored; the temporary race test and temporary clean-install directory were removed.

## 10. Remediation priorities and Prompt 15 recommendation

- **P0:** none found.
- **P1:** theme race — fixed and covered. Correct the contradictory current IndexedDB addendum before schema/persistence implementation.
- **P2:** add local supersession notes to old specs; pin/lock CI action dependencies; make Playwright local-server reuse explicit.
- **Verification:** hosted CI, workflow parser, manual accessibility/platform checks remain open.

**Recommendation:** proceed to Prompt 15, Browser Compatibility, for cross-engine/browser verification of the existing six UI shells. Do not treat that as permission to implement timer or cloud behavior. Resolve IV-003 before downstream work relies on the master architecture’s current persistence paragraph. Prompt 15 has not been started.

# Prompt 17 — Security and Privacy Audit

**Date:** 2026-10-16
**Verdict:** CONDITIONAL PASS for the current Phase 1 shell.
**Scope:** Read-only security and privacy review, verification, and this report. No application source, dependency, workflow, or historical specification was changed.

## 1. Executive summary

No confirmed exploitable frontend vulnerability, committed credential, persistent browser database, analytics integration, external runtime content, silent device permission request, or upload path was found in the current application. The route shells render unavailable or empty states and do not claim that unfinished backend features work. A targeted scan found no unsafe HTML APIs, dynamic code execution, unsafe URL scheme, or dynamic script-loading pattern.

The installed dependency tree is consistent at its top level, and the live npm advisory audit reported **0 vulnerabilities** across 271 resolved packages. Typecheck, lint, unit tests, Chromium tests, production build, and whitespace checks passed.

The conditional verdict records conditions found at the time of the Prompt 17 audit: an architecture-documentation conflict that could misdirect future persistence work, mutable GitHub Actions references, and development-only logging that should be sanitized before services can carry user data. Prompt 19 later reconciled the active architecture guidance; the remaining CI and logging items are follow-up risks. These are not evidence of a current application compromise. Supabase Auth, PostgreSQL, RLS, secure deployment headers, camera recording, and data-retention controls are future integration requirements; none is implemented or verified here.

**Finding counts:** Critical 0, High 0, Medium 1, Low 2, Informational/unverified 3. **Confirmed exploitable application vulnerabilities: 0.**

## 2. Scope and methodology

- Confirmed HEAD was `f261221fced5317b8f48810c0aea0f0c8e719059`. Preserved all existing Prompt 12–16 changes and reviewed the earlier audit, independent review, browser report, and performance report.
- Read the Phase 1 operating rules and specifications, current architecture/contracts, Supabase-only decision and implementation guide, the original Prompt 17, repository configuration, all six route shells, shared primitives/providers, styles, service contracts, tests, and CI workflow.
- Inspected the application source for unsafe HTML, code execution, dynamic scripts, URL handling, redirects, external calls, browser storage, permissions, and sensitive logging. Credential scanning emitted file paths only and did not print or copy candidate secret values.
- Inspected the lockfile, installed dependency tree, Git ignore rules, environment-file names, generated build assets, workflow, and available deployment configuration.
- Ran the project checks and an npm registry advisory audit. No exploit payloads were sent to external systems; no production system or user data was accessed.

This is a source/configuration review with automated project tests. It is **not** a penetration test, full supply-chain attestation, hosted CI run, production deployment review, or accessibility certification.

## 3. Threat model

| Threat / surface | Potential impact | Existing mitigation and evidence | Missing mitigation / recommended action | Severity / status |
|---|---|---|---|---|
| Anonymous visitor using the public UI | Exposure of another user's history or account data | There is no Auth, backend, personal solve store, or configured service in this shell; route data is unavailable by default. | Add authenticated access and owner-scoped database policies before user data is connected. | Informational; no current data path |
| Future authenticated users and account switching | Cross-account reads/writes, session confusion, unauthorized deletion | Contracts separate UI from services. The current Supabase-only design requires Auth and RLS, but neither is in the app yet. | Enforce ownership in PostgreSQL RLS and parent/child policies; never trust client-supplied owner IDs. Test cross-user REST access and account switching. | High future integration risk; not a current vulnerability |
| Malicious form, route, or service input | Script execution, malformed state, or misleading rendered data | Routes are static; current controls are constrained; React renders strings as text. The Solves view checks response shape and catches rejected service promises. No import parser or dynamic route parameter exists. | Validate full schemas, UUIDs, UTC timestamps, references, lengths, and ranges at each future service/API boundary. Keep output encoded. | Low current exposure; validation gate before integration |
| Untrusted external content | Stored/reflected XSS, unsafe navigation, or third-party tracking | No runtime external content, external navigation link, HTML injection, or unsafe URL path was found. | If content sources are added, use allowlisted URL schemes/domains and sanitized text/markup; avoid rendering arbitrary HTML. | Informational; no current source |
| Compromised or malicious dependency | Arbitrary code in build/browser or CI execution | Lockfile and `npm ci` workflow provide reproducible versions; current npm audit has no known advisories. Runtime dependencies are React, React DOM, and React Router. | Keep lockfile reviewed, audit routinely, review lifecycle scripts and transitive updates, and pin Actions to reviewed immutable SHAs. | Low residual supply-chain risk |
| Client memory and browser storage | Persistent exposure through shared profiles, tampering, or stale records | No IndexedDB, localStorage, sessionStorage, Cache API, service worker, or persistent application database use exists in `apps/web/src`. UI state is transient. | Keep credentials out of browser storage; future session handling must follow Supabase guidance. Do not add local persistence or an offline queue. | Informational; no persistence surface found |
| Network requests and browser boundary | Credential leakage, interception, or unintended third-party disclosure | No runtime fetch/XHR/WebSocket or external asset load is present. The current page uses same-origin Vite assets. | Require HTTPS for deployed endpoints; use the public Supabase publishable key only in browser configuration and keep privileged secrets server-side. | Informational; no application API configured |
| Future Supabase Auth/PostgreSQL/Storage | Unauthorized data access, insecure direct queries, leaked service-role credentials | Typed `AppServices` and `ServiceResult` contracts provide an adapter boundary. Current architecture names PostgreSQL as the sole persistent application database. No Supabase SDK/client/schema is present. | Integrate Auth, least-privilege publishable key, RLS on every user-owned table, constraints, generated types, safe errors, policy tests, and Storage policies before use. | High future integration risk; controls NOT IMPLEMENTED |
| Future camera, imported video, and AI analysis | Recording without consent, unintended upload, sensitive video retention, or re-use for training | Analyze controls are disabled and state that access is unavailable; no camera, file, media recorder, Bluetooth, or upload API is invoked. | Require explicit per-purpose consent, visible recording state, least collection, track cleanup, retention/deletion controls, and a separately consented training-data policy. | Medium future privacy risk; feature NOT IMPLEMENTED |
| CI/CD and pull requests | Malicious workflow/action code reading checkout or exfiltrating secrets | Workflow has `contents: read`, uses `pull_request` rather than `pull_request_target`, declares no app secrets, and uploads only failure diagnostics for seven days. Shell commands do not interpolate PR text. | Pin third-party Actions by SHA; do not add secrets to untrusted PR jobs; keep artifacts free of user data and review workflow changes. | Low; mutable action refs confirmed |
| Production hosting and browser headers | Clickjacking, content injection, downgrade, referrer leakage, or unsafe caching | No deployment/server configuration exists in this repository, and no source maps were emitted by the measured production build. | Configure HTTPS/HSTS, CSP, `X-Content-Type-Options`, Referrer-Policy, Permissions-Policy, frame protection, appropriate cross-origin policy, and cache rules at the deployment edge. Verify after deployment. | Informational / NOT VERIFIED; no deployed target |

## 4. Frontend security review

### Confirmed current protections

- Searches under `apps/web/src` found no `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `eval`, `new Function`, `document.write`, `javascript:` URL, or dynamically inserted script. The no-match searches returned the expected empty result.
- Navigation uses fixed internal route strings. No user-controlled redirect or route parameter is read. There are no external anchors requiring `target`/`rel` handling.
- Service-provided solve fields are rendered through React text nodes. The Solves page checks the response object and solve array before rendering (`apps/web/src/app/SolvesPage.tsx:20–31, 53–60`), and maps thrown/rejected list requests to a generic error state. Its checks are shape checks, not full canonical UUID/UTC or relationship validation; see future integration gates below.
- Generic localized messages are shown for route and theme failures. Optional service messages are not rendered by the route UI.
- The application error boundary uses a generic user-facing recovery message. It logs the caught error and React component stack only in development (`apps/web/src/app/AppErrorBoundary.tsx:27–30`). This does not leak current service data because no data service is configured, but should be sanitized before data-bearing adapters are introduced (SEC-003).
- Theme preference loading/saving now uses a sequence guard (`apps/web/src/shared/preferences/ThemeProvider.tsx:33, 58–77, 89–103`). Prompt 14’s deferred-response regression test remains present and passed in the 67-test unit suite. The previously confirmed stale preference response defect is fixed; it was not reproduced as an open issue.
- The app uses `matchMedia`, `navigator.onLine`, and event listeners for theme/connectivity behavior. These APIs do not request device permission or persist application data.

### Negative findings

- No unsafe URL handling, prototype-pollution-prone object merge, dynamic script loader, third-party font/CDN, analytics/telemetry SDK, remote image, or runtime external request was found in the app source and HTML.
- No camera/microphone/Bluetooth permission request, `getUserMedia` call, file input, upload request, `MediaRecorder`, or inference entry point is active. Analyze entry buttons are disabled and explicitly described as unavailable (`apps/web/src/app/AnalyzePage.tsx:14–15, 45–60`). Playwright reports that the browser supports `getUserMedia`; that is API availability only, and the app does not call it.
- No actual solve records, challenge results, analysis output, or persisted profile are fabricated by the route shells. The timer’s static idle display is labelled as an unavailable display placeholder.

## 5. Secrets and environment variables

- The only environment file found/tracked is `apps/web/.env.example`. Its Supabase URL and publishable-key entries are commented placeholders; it contains no configured credential. No actual secret value was printed or copied during this audit.
- `.gitignore:14–20` excludes `.env`, `.env.*`, and nested equivalents while explicitly allowing `.env.example`. It also excludes dependencies, build output, coverage, Playwright results, reports, and temporary browser profiles (`.gitignore:1–12`). Checks confirmed `.env` and `.env.local` are ignored.
- A non-disclosing pattern scan found no private-key block, common provider-token pattern, JWT-shaped credential, service-role key assignment, or high-confidence secret assignment in repository text. This is heuristic evidence, not proof that every possible secret format is absent.
- Source only reads `import.meta.env.DEV` to gate development error logging. No `VITE_` variable is consumed and no build-time secret is injected. Vite exposes `VITE_` values in browser bundles by design; future configuration may include only the Supabase URL and publishable/anon key. Service-role keys, passwords, and other privileged secrets must never be put in `VITE_` variables.
- The production build contains only `index.html`, one JavaScript file, and one CSS file; no `.map` file was emitted. Vite has no source-map override in the current config. No build output contains configured credentials because none are configured.

## 6. Supabase security readiness

| Control | Current evidence | Assessment |
|---|---|---|
| Typed service boundary | `AppServices`, `ServiceResult`, solve, analysis, scramble, and preference contracts exist under `apps/web/src/shared/domain/contracts.ts`; views use the provider/hooks. | Present as an interface only |
| Supabase Auth/session | No SDK, Auth UI, token/session adapter, or Supabase URL is configured. | NOT IMPLEMENTED |
| PostgreSQL and RLS | No Supabase client, migrations, database schema, generated database types, policies, or policy tests exist in the app. | NOT IMPLEMENTED; do not claim secure database access |
| Ownership enforcement | Contracts do not use client owner IDs as authority. No repository exists to enforce ownership. | Future requirement: enforce `auth.uid()` in RLS, including child rows and parent ownership |
| Query/input validation | Solves checks basic fields and status shape; it does not validate canonical UUIDs, UTC-only timestamps, or cross-row references. | Add schema validation at service and database boundaries before real data is accepted |
| Error handling | Service results have safe typed status branches; current UI uses generic errors. No backend messages exist. | Preserve generic user-safe messages; never return secrets or raw database rows in errors/logs |
| Browser key policy | `.env.example` is placeholder-only; no key is configured. | Future browser config may contain publishable/anon key only; never service-role key |
| Media Storage | No storage bucket, policy, upload, or media service. | Optional future feature; require explicit consent, RLS/storage policies, retention, and deletion tests |

The current architecture is **policy-ready, not integration-ready**. Supabase PostgreSQL is the selected sole persistent application database. Auth, RLS, database constraints, session handling, and safe queries are future requirements, not current verified protections.

## 7. Dependency and supply-chain audit

- `npm ls --depth=0` exited 0 and showed no missing, invalid, or extraneous direct dependencies. The package lock is npm lockfile version 3 and its root dependency declarations match `package.json`.
- `npm audit --json` exited 0: 0 info, 0 low, 0 moderate, 0 high, 0 critical, 0 total advisories. Audit metadata counted 271 resolved packages (7 production, 265 development, 27 optional, 8 peer; npm’s categories overlap and should not be summed).
- Installed direct versions included React 19.3.1, React DOM 19.3.1, React Router 8.4.0, Vite 8.3.4, TypeScript 6.0.3, Vitest 5.0.5, Playwright 1.64.1, and ESLint 10.12.0. No Supabase client or unnecessary camera/ML/chart runtime was found.
- Root package scripts contain no preinstall/install/postinstall/prepare hook, and the lockfile scan found no package marked with an install script. The project does install third-party code through npm; lockfile integrity and review remain important even with a clean advisory result.
- CI uses `npm ci` against the lockfile. No Dependabot or Renovate configuration was found, so no automated dependency-update policy is configured. Recommend routine reviewed lockfile updates and recurring audits. No package was installed, removed, or upgraded for this audit.
- The audit is time-bound to the registry advisory data available on 2026-10-16; it does not establish that dependencies are free of undisclosed vulnerabilities or malicious behavior.

## 8. CI/CD security

The workflow is `.github/workflows/ci.yml`:

- Triggers are push to `master`/`main`, `pull_request`, and manual dispatch (`:3–7`). It uses Node 24 and locked `npm ci` (`:28–36`), then runs typecheck, lint, unit tests, build, and Playwright Chromium (`:38–54`).
- Workflow token permission is explicitly `contents: read` (`:9–10`). There are no application secrets, write permissions, deployment steps, or `pull_request_target` trigger. The pull-request job executes checked-out code and package lifecycle code on an ephemeral runner, so workflow and dependency changes still require review.
- The workflow uploads only Playwright test results when a job fails and retains them for seven days (`:56–63`). Current tests use deterministic shell content; no real user records or private media are available to enter those artifacts.
- Three official action references are mutable major tags: `actions/checkout@v7` (`:26`), `actions/setup-node@v7` (`:29`), and `actions/upload-artifact@v5` (`:58`). A tag can point to a different action commit over time without a workflow diff. This is a reproducibility/supply-chain risk, not evidence of compromise (SEC-002).
- No command interpolates PR-controlled text into a shell command. CI configuration was manually reviewed; `actionlint` was not found on PATH, and no hosted GitHub Actions run is evidenced. YAML parser validation and hosted execution are NOT VERIFIED.

## 9. Browser and deployment protections

The repository contains no hosting/server configuration, deployment workflow, `_headers`, reverse-proxy config, or security.txt. The Vite development server/build configuration does not establish production response headers. Production status for HTTPS, HSTS, CSP, `X-Content-Type-Options`, Referrer-Policy, Permissions-Policy, frame embedding, CORP, and caching is therefore **NOT VERIFIED**, not implicitly secure.

Before deployment, configure and verify at the hosting edge:

1. HTTPS redirects and HSTS only after the final hostname/subdomain policy is confirmed.
2. A restrictive CSP (including `frame-ancestors`, and an explicit `connect-src` for the approved Supabase endpoint after integration).
3. `X-Content-Type-Options: nosniff`, an intentional Referrer-Policy, and frame protection.
4. Permissions-Policy that keeps camera, microphone, and Bluetooth disabled until their owning user-initiated features are implemented.
5. Same-origin cross-origin resource policy where compatible with deployment, and separate caching rules for immutable hashed assets versus future authenticated/user-specific responses.
6. No public source-map publication unless its source-disclosure consequences are accepted. Current build emitted no maps.

These are recommendations only; there is no deployed target on which to verify them.

## 10. Privacy assessment

- **Solve history, profiles, and statistics:** no real solve or profile data is created or persisted in this phase. Solves can display records only if a service is injected; the default provider reports not configured. Future data needs account ownership, transparent cloud-save confirmation, export/deletion, and defined retention.
- **Camera, video, and analysis:** no camera permission, file picker, recording, upload, or inference is active. Buttons remain disabled. Future camera work must ask through an explicit user action, show an active recording indicator, release media tracks, minimize retention, and expose clear deletion controls. Supabase Storage requires a separate consent and policy review.
- **AI data and training:** no inference or training dataset is read or produced by the web app. Reuse of personal recordings for training must have a distinct opt-in purpose, documented retention, and deletion procedure.
- **Browser storage:** no local database or persistent web storage is used. Theme selection is in memory by default; the injected preferences service boundary has no configured persistence adapter. No refresh-survival claim is made.
- **Analytics and telemetry:** no analytics, advertising, session replay, or telemetry package/request was found.
- **Export, deletion, retention, and privacy controls:** not implemented because there is no account/data service. The Settings privacy copy describes the current shell; it is not a complete privacy policy or a verified deletion capability.

## 11. Legacy architecture contradictions

Repository-wide searches distinguished historical references that are clearly superseded from current-looking statements that still conflict with the authoritative decision. The current authority is `idea/master prompts/11_CLOUD_FIRST_DECISION_AND_OVERRIDES.md:3–6`, `12_CLOUD_ARCHITECTURE_AND_REPOSITORY_BLUEPRINT.md:1–20`, `13_SUPABASE_SCHEMA_RLS_AND_MIGRATIONS.md:1–15`, `14_OFFLINE_OUTBOX_SYNC_AND_RECOVERY.md:3,13`, and `17_SUPABASE_ONLY_IMPLEMENTATION_GUIDE.md:3–10`: PostgreSQL is the sole persistent app database, no IndexedDB/outbox/automatic sync, and unsaved data can remain only in tab memory.

Confirmed conflicting guidance:

| Affected document(s) | Conflicting text/evidence | Why it matters |
|---|---|---|
| `idea/master prompts/02_ARCHITECTURE_DATA_CONTRACTS.md:1,5,19` | The cloud-first banner calls IndexedDB a “resilience cache/outbox”; the cloud addendum calls it a “durable local outbox/cache.” | This is the highest-risk contradiction because the architecture file itself presents the prohibited persistence as current cloud-first guidance. |
| `idea/master prompts/00_COMPLETE_PROJECT_DOCUMENTATION.md:139,186,248,447,470,956` | Requires IndexedDB for database/schema/local records and says it remains for timer durability/outbox/cache even after its Supabase paragraph. | The main project specification has no effective Supabase-only reconciliation at these points. |
| `idea/master prompts/03_DEVELOPMENT_ROADMAP.md:18–19,29`; `04_INTEGRATION_CHECKLIST.md:1,23`; `08_RELEASE_GATES_AND_TEST_MATRIX.md:1,35` | Roadmap, checklist, and release gate still require an IndexedDB outbox, durable queue, or offline retry. | These are actionable implementation and acceptance gates, not merely historical citations. Their banners also incorrectly say IndexedDB is an allowed cache/outbox. |
| `idea/master prompts/01_PROJECT_REGULATIONS.md:1`; `05_SPECIFICATION_USAGE.md:13`; `06_CHANGE_CONTROL_AND_FEATURE_EXTENSIONS.md:1`; `07_GRADUATION_REQUIREMENTS_AND_EVIDENCE.md:1`; `09_FINAL_AUDIT_AND_OPEN_DECISIONS.md:1`; `10_START_HERE_AND_FILE_MAP.md:13`; `resources/01_BULGARIAN_GRADUATION_SOURCES.md:1`; `resources/02_TECHNICAL_REFERENCES.md:1`; `resources/03_GRADUATION_DELIVERABLE_TEMPLATES.md:1`; `resources/04_FINAL_ARCHIVE_AUDIT.md:1` | Their repeated cloud-first revision banner says IndexedDB is an allowed resilience cache/outbox, contrary to the superseding decision. | The notice intended to clarify precedence instead reintroduces the forbidden design across the master pack. |
| `idea/prompts/01_foundation_ui/SOURCE_SPECIFICATIONS/00_MASTER_INSTRUCTIONS.md:4,17,20`; `00_DATA_CONTRACTS.md:56,73–76`; `00_INTEGRATION_CHECKLIST.md:36`; `01_Foundation_and_UI.md:30`; `idea/prompts/01_foundation_ui/PROMPTS/00_00_AGENT_OPERATING_RULES.md:10` | These prescribed Foundation sources describe offline-first behavior, IndexedDB as source of truth/stores/migrations, optional cloud sync, or local recording storage. | Future agents reading required files alone can incorrectly add browser persistence or background sync. The original Prompt 17 header also calls the codebase “offline-first” at line 5; that wording must be read under the newer explicit storage decision. |

At the time of this Prompt 17 audit, the older passages were preserved for traceability but still lacked unambiguous local precedence. The subsequent Prompt 19 documentation reconciliation preserved historical text and corrected active architecture guidance; see the current status below.

**Historical proposal; applied during Prompt 19:** preserve original archival text, add a clear supersession notice to the Foundation source files, and correct the active-looking `02_ARCHITECTURE_DATA_CONTRACTS.md` cloud addendum plus the roadmap/checklist/release-gate clauses and copied banners. The current guidance specifies transient in-memory retry only, with no durable offline save or automatic synchronization. The archival passages remain for traceability and are explicitly superseded by the current Supabase-only decision.

## 12. Severity-ranked findings

### SEC-001 — Medium, resolved in Prompt 19 documentation cleanup: legacy architecture documents had active local-persistence conflicts

- **Affected files:** Documents listed in Section 11, especially `idea/master prompts/02_ARCHITECTURE_DATA_CONTRACTS.md:1,19`, `00_COMPLETE_PROJECT_DOCUMENTATION.md:248,956`, the roadmap/checklist/release gate, and required Foundation source specifications.
- **Evidence at the original audit:** Direct repository searches found active-looking IndexedDB/outbox/cache and offline-sync requirements, including in cloud-first addenda. On Prompt 19 re-check, current architecture notices and acceptance instructions identify those passages as superseded; the current rule in master 11 and 17 forbids those designs. Current `apps/web/src` contains no matching persistence API or adapter.
- **Exploitability / impact:** No current exploit or data exposure. The realistic impact is future architectural drift: a later implementation could persist solve history/video or queue mutations in browser storage, contrary to the approved privacy and cloud-only policy.
- **Recommended remediation:** Applied during Prompt 19: preserve the original archival record, correct active addenda and acceptance gates, and add local precedence notices to old Foundation sources.
- **Status:** Resolved as an active-instruction conflict by the Prompt 19 documentation reconciliation. Historical specifications still contain legacy language, but it is marked as superseded and does not authorize browser persistence.
- **Blocks Phase 1 shell acceptance:** No. **Blocks database/persistence integration:** No, provided implementation follows the current Supabase-only authority; continue to review for regressions when changing specifications.

### SEC-002 — Low: CI Actions use mutable major-version tags

- **Affected file:** `.github/workflows/ci.yml:26,29,58`.
- **Evidence:** Checkout v7, setup-node v7, and upload-artifact v5 are referenced by tags, not immutable commit SHAs. The job otherwise grants only `contents: read` and declares no application secrets.
- **Exploitability / impact:** If a referenced tag is moved or its upstream release is compromised, later runs could execute changed action code without a workflow diff. No evidence of compromise was found.
- **Recommended remediation:** Replace those three `uses:` refs with verified full commit SHAs, retain a human-readable version comment, and configure reviewed GitHub Actions dependency updates.
- **Status:** Confirmed low supply-chain/reproducibility risk; no change made.
- **Blocks Phase 1 acceptance:** No. Approval is required before workflow changes.

### SEC-003 — Low: development error logging includes exception object and component stack

- **Affected file:** `apps/web/src/app/AppErrorBoundary.tsx:27–30`.
- **Evidence:** `console.error` receives the caught Error and React component stack, gated by `import.meta.env.DEV`.
- **Exploitability / impact:** No current personal or secret data service is configured, and production builds do not execute this logging branch. A future exception could contain user input, a response detail, or a sensitive identifier and expose it in a developer console/log capture.
- **Recommended remediation:** Before data-bearing services are added, log only a generic message or sanitized error code and omit raw payloads/component details unless explicitly safe. Add a test that sensitive exception text is not emitted.
- **Status:** Development behavior confirmed; sensitive-data leakage is a future risk, not reproduced in the current shell.
- **Blocks Phase 1 acceptance:** No. Approval is required before source/test changes.

### Informational / future integration gates (not current vulnerabilities)

- **SEC-FUTURE-01 — Supabase controls absent:** No Auth, schema, RLS, ownership or Storage policies exist. These are unimplemented by scope and must be acceptance gates before real personal data is stored.
- **SEC-FUTURE-02 — Deployment headers unknown:** No deployment exists/config is present; security headers and HTTPS cannot be tested. Do not claim production protection until verified at the deployed origin.
- **SEC-FUTURE-03 — Full domain validation not in the shell:** Solves runtime checks are basic shape checks; full UUID/UTC/relationship validation belongs at future service/database boundaries. There is no current external adapter/data source to exploit.

## 13. Proposed remediations and approval boundary

No fixes were applied because Prompt 17 is audit-first. The only created file is this report. The following changes need separate explicit approval before implementation:

1. Correct the contradictory cloud addenda, roadmap/checklist/release gates, and Foundation source notices as described in Section 11; preserve historical text and add clear supersession links.
2. Pin the three GitHub Actions in `.github/workflows/ci.yml` to verified immutable SHAs and add an update policy.
3. Sanitize the development-only error logging and add a regression test before user-data services are integrated.
4. Add deployment response headers only when a deployment target and permitted policy are established.

No dependency update, production source change, workflow edit, or historical specification edit was made.

## 14. Verification results

Commands ran from `apps/web` unless noted. Exit codes are actual results from this audit.

| Command / check | Exit | Result |
|---|---:|---|
| `npm run typecheck` | 0 | Passed. |
| `npm run lint` | 0 | Passed with no ESLint diagnostics. |
| `npm test` | 0 | 13 test files, 67 tests passed. |
| `npm run test:e2e` | 0 | Chromium 156.0.8078.4; 77 passed, 0 failed, 0 skipped. This includes direct routes/reloads, console/network checks, unavailable states, storage-denial fallback, theme, viewport, and navigation tests. |
| `npm run build` | 0 | Vite 8.3.4; 118 modules transformed. Output: JS 306.12 kB (Vite gzip 92.81 kB), CSS 21.03 kB (gzip 4.32 kB), HTML 0.54 kB. No source map emitted. |
| `git diff --check` | 0 | Passed. Git emitted existing LF-to-CRLF working-copy warnings for modified files; no whitespace error. |
| `npm ls --depth=0` | 0 | Direct dependency tree resolves cleanly. |
| `npm audit --json` | 0 | 0 advisories at all severities; 271 resolved dependency entries reported. No packages changed. |
| Unsafe HTML/code/URL pattern searches | 1/no matches | Expected no-match result for dangerous APIs and schemes in app source. |
| High-confidence credential pattern scan | 1/no files | Expected no-match result; output suppressed values by design. This is not exhaustive secret detection. |
| Runtime external resource/analytics scan | 1/no matches | No external runtime resources or analytics markers found in app code/config. |
| Deployment-header config search | 1/no files | No hosting/header configuration found; deployment controls remain NOT VERIFIED. |

Playwright emitted a non-failing Node warning that `NO_COLOR` is ignored when `FORCE_COLOR` is set. The test run had no failures or skips. Hosted CI was not run. `npm ci` was not repeated in this audit; Prompt 14 recorded a successful isolated lockfile clean-install run, but that is prior evidence rather than a current run.

## 15. Unverified security assumptions and coverage limits

- No hosted GitHub Actions execution or workflow parser/linter validation (`actionlint` is not installed).
- No production origin, TLS configuration, response headers, CSP, caching, or hosting provider is available for verification.
- No Supabase project/credentials, Auth session, PostgreSQL schema, RLS policies, or Storage bucket exists; no tenant-isolation query was possible.
- No screen-reader/manual assistive-technology, real camera permission, actual upload, import parser, or malicious media test applies to the current shell.
- No full penetration test, dynamic application security scan, browser extension test, or low-level dependency provenance audit was performed.
- Current Playwright run was Chromium only. Prompt 15’s separate cross-engine report remains CONDITIONAL PASS because WebKit offline-event emulation is skipped; that unrelated limitation was not re-run for this audit.
- npm advisory results are time-sensitive and do not rule out unknown vulnerabilities or a malicious package update.

## 16. Acceptance evidence

| Criterion | Result | Evidence | Notes |
|---|---|---|---|
| No secrets in frontend/repository or risks documented | PASS with scan limits | Placeholder-only `.env.example`, ignore rules, tracked-file inspection, non-disclosing pattern scan, current build, and this report | Heuristic scanning cannot prove absence of every possible secret pattern. |
| No silent permissions/uploads | PASS | Source scan; disabled Analyze controls; browser test passes and no app permission or upload API is invoked | Browser API availability is not an app permission request. |
| Dependency audit executed or unavailable documented | PASS | `npm audit --json`, exit 0, zero advisories; `npm ls --depth=0`, exit 0 | Audit is time-bound; no dependency changes. |
| Threat model and mitigations recorded | PASS | Section 3, including current mitigations, gaps, severity, and recommended actions | Future Auth/DB/media/deployment controls are clearly marked unimplemented or unverified. |
| Frontend security and privacy review | PASS for current shell | Section 4 and route/service inspection; no confirmed exploitable vulnerability found | Not a penetration test. |
| Supabase security readiness | CONDITIONAL | Typed contracts and documented PostgreSQL/Auth/RLS plan exist | Auth, RLS, schema, safe queries, and storage policies are not implemented and are gates for real user data. |
| CI/CD security | CONDITIONAL | Minimal token permissions, locked install, failure-only artifacts; action refs inspected | Mutable tags remain; no hosted run or parser validation. |
| Production browser/deployment controls | NOT VERIFIED | No deployment configuration or deployed origin exists | Must verify headers/TLS at the eventual hosting edge. |
| Supabase-only persistence architecture | PASS in implementation; FAIL in portions of documentation | App source contains no browser persistence; current master 11/17 decision is explicit; conflicts are enumerated in Section 11 | Resolve documentation before persistence integration. |

## 17. Git state and handoff

- HEAD remains `f261221fced5317b8f48810c0aea0f0c8e719059`.
- Created: `docs/phase1/prompt17-security-privacy.md`.
- Existing Prompt 12–16 changes remain preserved and unstaged. No source files, dependencies, workflow, or historical specs were modified. No files were staged or committed; no remote is configured and nothing was pushed.
- The final Git status and `git diff --check` are recorded in the completion response.

**Recommendation recorded before Prompt 18:** UI-shell work could proceed within its approved scope under the Supabase-only decision, without adding persistence, Auth, uploads, or integration behavior based on the conflicting legacy text. Prompt 18 has since completed, and Prompt 19 reconciled the active architecture documents before Category 02 implementation. Future work must continue to follow the reconciled current specifications. 

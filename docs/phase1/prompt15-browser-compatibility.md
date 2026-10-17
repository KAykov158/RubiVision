# Prompt 15 — Browser Compatibility

**Date:** 2026-10-16
**Verdict:** CONDITIONAL PASS. The approved WebKit skip-link accessibility defect is fixed and all enabled browser tests pass. WebKit's native offline-event behavior remains unverified in Playwright's emulation and one test is skipped for that documented limitation.
**Scope:** Browser verification of the Phase 1 shell, including the approved skip-link compatibility fix. No application feature or backend was added.

## Baseline and preserved work

- Verified `HEAD` is `f261221fced5317b8f48810c0aea0f0c8e719059` before testing and after the implementation work.
- Preserved the outstanding Prompt 12/14 changes. The delayed theme-preference read race fix is still present in `ThemeProvider.tsx`, and its deferred-response regression test is still present in `ThemeProvider.test.tsx`.
- The compatibility work only adds a separate Playwright browser config, compatibility tests, a WebKit-specific offline-emulation skip, and this report. Application components and styles were not modified.
- Nothing was staged or committed. No Git remote is configured and nothing was pushed.

## Environment

| Item | Observed value |
|---|---|
| Operating system | Windows 11 x64, version `10.0.26200.9457` |
| Node.js / npm | Node `v24.20.0`, npm `11.19.0` |
| Playwright | `1.64.1` |
| Chromium | `156.0.8078.4` (Playwright managed Chromium build `1248`) |
| Firefox | `157.0` (Playwright managed Firefox build `1555`) |
| WebKit | `27.2` (Playwright managed WebKit build `2370`) |

Browser binaries were installed in Playwright's managed browser directory after explicit approval. These are Playwright engine builds, not tests in branded Chrome, Firefox, or Safari desktop applications.

## Coverage matrix

Each engine ran the shared route/layout cases for Timer, Solves, Statistics, Analyze, Challenges, and Settings at 320, 375, 768, 1024, and 1440 CSS pixels in light and dark modes. This is 60 route/theme/viewport cases per engine. The cases assert document/body width, route heading, active navigation, and feature-specific unavailable/disabled states; they also capture full-page screenshots.

| Browser engine | Route/theme/viewport matrix | Whole E2E run | Important findings |
|---|---:|---:|---|
| Chromium 156.0.8078.4 | 60/60 passed | 77 passed, exit 0 | No browser console, uncaught page, or app-origin network failures in direct-route/reload coverage. |
| Firefox 157.0 | 60/60 passed | 77 passed, exit 0 | Same matrix passed. Firefox can return `304 Not Modified` on reload; this is a valid cache response and is accepted by the compatibility assertion. |
| WebKit 27.2 | 60/60 passed | 76 passed, 1 skipped, exit 0 | Skip-link keyboard tests pass after the explicit tab stop fix. The only skipped case is real offline-event emulation; the synthetic event-handler test passes. |

The E2E runs also cover direct route entry and reload, unknown-route recovery and browser back/forward, system theme changes, keyboard and pointer navigation, touch navigation, reduced motion, disabled/unavailable controls, storage-access denial, and browser console/network monitoring. The mobile drawer's focus trap, Escape dismissal, and focus restoration pass in all three engines.

## Browser-specific observations

### WebKit keyboard focus

The original WebKit runs showed that the first `Tab` did not focus the “Skip to content” link. The confirmed cause was that the anchor had no explicit tab index and was omitted from WebKit's sequential keyboard focus order in the tested environment.

- `prompt10-resilience-accessibility.spec.ts`: route landmarks and skip link.
- `solves-statistics-layout.spec.ts`: keyboard navigation from Solves.
- `timer-layout.spec.ts`: keyboard navigation from Timer.

The approved production fix adds `tabIndex={0}` to the existing anchor in `AppShell.tsx`, preserving its link semantics, `href`, styling, localization, and focus behavior. A deterministic diagnostic confirmed that this makes the anchor receive the first Tab; Enter moves focus to `main`. A separate initial-render race in the Timer and Solves keyboard tests was addressed by waiting for the skip-link node to attach before sending Tab. These readiness assertions do not change the first-Tab focus expectation. All three focused WebKit regressions pass. The navigation dialog still traps focus, closes on Escape, restores focus, and routes by keyboard without a new focus trap. The result is verified in Playwright WebKit 27.2; branded Safari was not separately tested.

### WebKit offline event delivery

In WebKit, Playwright's `context.setOffline(true)` changes `navigator.onLine` to `false`, but the application does not receive an `offline` event and does not show its connectivity banner. Dispatching `offline` and `online` events directly makes the banner and restoration announcement update correctly. Chromium and Firefox pass the real Playwright offline-toggle test.

The existing offline-toggle test is marked skipped only for WebKit, with its reason recorded in the test. Consequently, WebKit's real offline-event detection is **NOT VERIFIED** in this environment; the synthetic event-handler path is verified. This is not evidence of cold-start offline support, and the app makes no cold-offline persistence claim.

### API and rendering differences

- Chromium and Firefox expose `navigator.mediaDevices` and `getUserMedia` in these headless contexts. WebKit 27.2 exposes neither. Analyze remains an honest placeholder and its camera and video-selection controls remain disabled in every engine; no camera permission or media API was invoked.
- `CSS.supports('display', 'grid')` and `matchMedia` are available in all three contexts.
- Native select controls have browser-specific arrow and surface rendering. The inspected 320px light-theme screenshots remain legible and within the viewport; no functional select defect was observed.
- Direct-route/reload monitoring recorded no application console errors, uncaught page errors, failed app-origin requests, or app-origin HTTP error responses in any engine.

## Accessibility and interaction results

| Check | Result | Evidence / limitation |
|---|---|---|
| Semantic route heading and main landmark | PASS in layout runs | All six routes render the expected single top-level heading and main landmark. |
| Skip link keyboard focus | PASS in Chromium, Firefox, and WebKit | Three focused WebKit regressions pass; first Tab focuses the link, visible focus styling remains applied, and Enter focuses main content. |
| Mobile dialog focus trap, Escape, restoration | PASS in all engines | Existing native navigation dialog E2E test. |
| Keyboard navigation and browser history | PASS in Chromium, Firefox, and WebKit for tested flows | After adding the explicit skip-link tab stop and correcting test readiness, all three WebKit skip-link regressions pass; route navigation, drawer keyboard interaction, and browser history assertions pass. Native WebKit offline-event emulation remains separately NOT VERIFIED. |
| Touch navigation | PASS in all engines | Playwright touch-enabled context tapped the mobile menu and Challenges link; unavailable Join action remained disabled. |
| Light, dark, and system theme changes | PASS in all engines | Theme and `prefers-color-scheme` tests passed; default unavailable preference service remains session-only. |
| Reduced motion | PASS in all engines | Analyze transition duration check under `prefers-reduced-motion: reduce`. |
| Color contrast assertions | PASS in all engines | Existing automated token color-pair checks; this is not a complete accessibility audit. |
| Storage access denial fallback | PASS in all engines | Test throws `SecurityError` for local/session storage access; theme control remains usable and session-only. This is a denial shim, not a full private/incognito browser session. |
| Offline status | PASS Chromium/Firefox; NOT VERIFIED WebKit native event | WebKit synthetic event handler passes, but Playwright offline emulation does not dispatch its event. |
| Browser-level error-boundary recovery | NOT VERIFIED | Error-boundary component tests pass in the 67-test unit suite; route-level browser test covers unknown-route recovery, not an injected React render crash. |
| Actual browser zoom / 200% text resize | NOT VERIFIED | Playwright viewport tests do not reproduce browser chrome zoom faithfully. A 160px viewport probe was discarded because it was not a valid browser-zoom simulation and fell outside the acceptance viewport matrix. |
| Device pixel ratio changes | NOT VERIFIED | No DPR variation was run. |
| Long translated labels | NOT VERIFIED | No alternate long-label localization catalog is available in this shell. |
| Automated accessibility certification | NOT CLAIMED | Automated checks are targeted and do not replace assistive-technology/manual review. |

## Architecture compliance

- **PASS:** React, TypeScript, Vite, typed domain/service boundaries, and existing route/theme/localization components remain in use.
- **PASS:** Supabase PostgreSQL remains the sole planned persistent application database. No database adapter is currently configured for these shells; Supabase Auth/RLS are architecture boundaries, not implemented features in this Phase 1 UI.
- **PASS:** No application use of IndexedDB, `localStorage`, `sessionStorage`, database/network clients, media recording, or upload APIs was found under `apps/web/src`. The storage-denial browser test also verifies that theme UI does not depend on browser storage.
- **PASS:** No offline queue, automatic synchronization, fabricated service data, camera operation, upload, or inference was introduced.
- **PASS:** Unavailable service states and disabled camera, upload, challenge participation, account, and localization actions remain explicit in the UI tests.

## Verification commands

All commands ran from `apps/web` with the environment above.

| Command | Result | Details |
|---|---|---|
| `npm run typecheck` | PASS, exit 0 | TypeScript project build completed. |
| `npm run lint` | PASS, exit 0 | ESLint completed without lint diagnostics. |
| `npm test` | PASS, exit 0 | 13 files, 67 tests passed. |
| Focused WebKit keyboard regressions | PASS, exit 0 | 3 passed: route skip link, Solves keyboard/history navigation, and Timer skip-link/mobile drawer flow. |
| `npm run test:e2e` (Chromium) | PASS, exit 0 | Chromium 156.0.8078.4: 77 passed. |
| `npm run test:e2e -- --config=playwright.compat.config.ts --project=firefox` | PASS, exit 0 | Firefox 157.0: 77 passed. |
| `npm run test:e2e -- --config=playwright.compat.config.ts --project=webkit` | PASS, exit 0 | WebKit 27.2: 76 passed, 1 skipped (offline event emulation limitation); no failures. |
| `npm run build` | PASS, exit 0 | Vite 8.3.4; 118 modules transformed; production assets emitted. |
| `git diff --check` | PASS, exit 0 | No whitespace errors. Git emits existing LF-to-CRLF checkout warnings for modified text files. |

E2E processes emit the Node warning that `NO_COLOR` is ignored when `FORCE_COLOR` is set. It did not fail tests. Hosted CI was not run.

## Screenshots

The E2E suite captured 61 PNGs per engine: 60 route/theme/viewport screenshots and one open mobile-navigation screenshot. They are generated, ignored test artifacts, not committed files:

- Chromium: `apps/web/test-results/` (61 PNGs).
- Firefox: `apps/web/test-results/compat-firefox/` (61 PNGs).
- WebKit: `apps/web/test-results/compat-webkit/` (61 PNGs).

Representative 320px light-theme Timer images:

- [Chromium Timer, 320px light](../../apps/web/test-results/timer-layout-Timer-layout--7f4d8-ping-at-320px-in-light-mode/timer-light-320.png)
- [Firefox Timer, 320px light](../../apps/web/test-results/compat-firefox/timer-layout-Timer-layout--7f4d8-ping-at-320px-in-light-mode-firefox/timer-light-320.png)
- [WebKit Timer, 320px light](../../apps/web/test-results/compat-webkit/timer-layout-Timer-layout--7f4d8-ping-at-320px-in-light-mode-webkit/timer-light-320.png)

## Findings and remediation priorities

1. **Verify WebKit offline notifications in a real browser environment.** Playwright WebKit toggles `navigator.onLine` without delivering `offline`/`online`; the synthetic event-handler path passes. Keep the WebKit offline limitation explicit until native event behavior is tested.
2. **Complete unverified manual coverage** for branded Safari, real-browser zoom/text resize, DPR variation, incognito/private context, long translated labels, and browser-level error-boundary recovery.
3. **Keep existing architecture deferrals explicit.** No Auth, RLS migration, cloud repository, camera, upload, or analysis functionality was verified or added here.

## Git state and changed files

The baseline and all earlier uncommitted Prompt 12/14 files remain present. Prompt 15 changes are:

- Added `apps/web/e2e/browser-compatibility.spec.ts`.
- Added `apps/web/playwright.compat.config.ts` with reusable Firefox and WebKit projects and distinct screenshot output directories.
- Modified `apps/web/e2e/prompt10-resilience-accessibility.spec.ts` to skip only WebKit's unsupported offline-event emulation path after asserting the offline signal, and to test the other engines normally.
- Modified `apps/web/src/app/AppShell.tsx` to add `tabIndex={0}` to the skip-link anchor.
- Modified `apps/web/e2e/timer-layout.spec.ts` and `apps/web/e2e/solves-statistics-layout.spec.ts` to wait for the skip-link node before the first-Tab assertion.
- Modified `apps/web/e2e/browser-compatibility.spec.ts` to wait for Timer to render before dispatching synthetic connectivity events.
- Added this report.

`HEAD` remains `f261221fced5317b8f48810c0aea0f0c8e719059`; no files are staged; no commit or remote was created; no push occurred. Test screenshots, build output, and Playwright traces remain ignored generated artifacts.

## Acceptance checklist

| Criterion | Verdict | Evidence |
|---|---|---|
| Actual tested browser engines and versions listed | PASS | Playwright managed Chromium 156.0.8078.4, Firefox 157.0, WebKit 27.2. |
| All six routes tested at five target widths in light and dark themes | PASS | 60 responsive route/theme/viewport cases passed per engine; screenshots captured. |
| Navigation, direct access, reload, and browser history | PASS | All three engine suites passed, including WebKit keyboard routes and first-Tab skip-link flow. |
| No overflow at target viewport widths | PASS | Route layout assertions passed at 320, 375, 768, 1024, and 1440 in all three engines. |
| Dialog focus trap, Escape, and restoration | PASS | Existing E2E test passed in all engines. |
| Keyboard accessibility across engines | PASS for tested flows | First Tab focuses the skip link in all three engines; focus visibility, Enter navigation, mobile drawer focus handling, Escape, and restoration pass. Full accessibility certification is not claimed. |
| Theme switching and system-theme detection | PASS | Light/dark route matrix and system theme change tests passed. |
| Reduced-motion behavior | PASS | Reduced-motion transition assertion passed in all engines. |
| Disabled/unavailable feature states | PASS | Feature-specific route assertions passed; no unavailable feature was presented as functional. |
| Error recovery across engines | PARTIAL | Unknown route recovery passed; browser-injected React error-boundary recovery is not verified. |
| Offline behavior across engines | PARTIAL | Chromium/Firefox real emulation event tests pass; WebKit's native offline event remains unverified due Playwright event delivery; synthetic handler test passes. |
| Console and unexpected app network failures | PASS | Direct-route/reload monitor passed in all engines. |
| Browser storage denial fallback | PASS | local/session storage SecurityError shim passed in all engines; private mode itself not tested. |
| Browser zoom, DPR, long labels, and assistive-technology certification | NOT VERIFIED | Listed above as remaining manual coverage. |
| Supabase-only and no fabricated/deferred functionality | PASS | Source audit and route assertions; no persistent browser database or feature implementation introduced. |

**Recommendation for next step:** Prompt 15's browser compatibility work is complete with the approved skip-link fix. Keep WebKit offline notification behavior and the listed manual coverage gaps visible for later verification. No Prompt 16 work has started.

# Prompt 16 — Performance and Bundle Audit

**Date:** 2026-10-16

**Verdict:** CONDITIONAL PASS. The measured Phase 1 shell is responsive in this local Chromium run and includes no unused heavy feature libraries. The audit found eager route-shell loading and several measurement limits, but no confirmed performance defect that justifies an unapproved production optimization.

**Scope:** Production bundle and runtime audit only. No application source, dependencies, or persistence architecture were changed.

## 1. Method and environment

- Confirmed `HEAD` was `f261221fced5317b8f48810c0aea0f0c8e719059` before measuring. Preserved all uncommitted Prompt 12–15 changes, including the skip-link `tabIndex={0}` fix and its WebKit regression assertions.
- Built the existing app with `npm run build` from `apps/web`, served that `dist` output with `vite preview`, and measured the production preview at `http://127.0.0.1:4173` using Playwright-managed Chromium. The temporary measurement test was removed after the runs.
- Initial render used twelve fresh browser contexts across four probe runs. The operating-system and file-system caches were not cleared, so these are fresh-context local measurements, not true cold-device measurements.
- Runtime flows used a 1440×900 desktop viewport for 12 route transitions per probe and a 375×812 viewport for the mobile drawer. The measured Solves state was the real unavailable state because no repository service is configured.
- Playwright action-to-visible timings include automation and browser scheduling. They are useful local comparisons, not production telemetry or user timing guarantees.
- Long tasks were observed with the browser Performance API. Chromium CDP supplied JavaScript heap, listener, and DOM-node diagnostics; an explicit heap collection was used only to distinguish transient garbage from retained objects.
- No Lighthouse, browser Performance panel, CPU throttling, field data, or low-end device benchmark was available/run. No scores are inferred.

| Environment item | Observed value |
|---|---|
| OS | Windows 11 x64, build `10.0.26200.9457` |
| CPU | AMD Ryzen 5 1600 Six-Core Processor, 12 logical processors |
| Memory | 15.9 GiB total; 5.8 GiB free when sampled |
| Node.js / npm | `v24.20.0` / `11.19.0` |
| Vite | `8.3.4` |
| Playwright / Chromium | `1.64.1` / managed Chromium `156.0.8078.4` |

## 2. Production bundle baseline

`npm run build` transformed 118 modules. The production output contains one JavaScript bundle, one CSS asset, and `index.html`; no route-specific chunks, source maps, fonts, images, or other media assets were emitted.

| Asset | Raw bytes | Node gzip bytes | Node Brotli bytes |
|---|---:|---:|---:|
| `index-DuYEwOat.js` | 306,124 (306.12 kB) | 91,885 (91.89 kB) | 79,450 (79.45 kB) |
| `index-DyHrGj-v.css` | 21,031 (21.03 kB) | 4,325 (4.33 kB) | 3,779 (3.78 kB) |
| **JS + CSS total** | **327,155 (327.16 kB)** | **96,210 (96.21 kB)** | **83,229 (83.23 kB)** |
| `index.html` | 544 bytes | 321 bytes | Not separately measured |

Gzip and Brotli values above were computed from the emitted files with Node `zlib`; Brotli is an offline compression estimate, not an observed deployment response. Chromium Resource Timing on the Vite production preview reported encoded body sizes of 91,885 bytes for JavaScript and 4,325 bytes for CSS, matching the Node gzip results. Transfer sizes including response overhead were 92,185 and 4,625 bytes respectively.

Vite's build summary reported JavaScript gzip as `92.81 kB` and CSS gzip as `4.32 kB`. The independent Node/Chromium JavaScript gzip measurement is 91,885 bytes, about 925 bytes lower; CSS differs only by display rounding. The exact reason for Vite's JavaScript compression estimate difference was not established, so both measurements are recorded. The raw emitted asset size and browser-observed encoded size are directly measured.

## 3. Bundle and route-loading review

- All six route shells are statically imported through `RoutePages.tsx` and `App.tsx`. They are delivered in the single initial JavaScript asset; visiting the other routes adds no JavaScript or CSS requests.
- Production dependencies resolve to one deduplicated `react@19.3.1`, `react-dom@19.3.1`, and `react-router@8.4.0` tree. No chart, video, icon, computer-vision, or ML runtime package is installed or present in the output.
- The production bundle scan found no `react-refresh`, `@vite/client`, `jsxDEV`, or `vite/client` development markers. No source-map files were emitted.
- The current Vite production build minifies the application into the emitted assets. A module-by-module contribution breakdown was not generated because no bundle-analyzer dependency is installed; none was added for this audit.
- Static inspection found no `setInterval`, `requestAnimationFrame`, or render-driven timer loop under `apps/web/src`.

Eagerly shipping all route shells is a confirmed bundling behavior, but not a confirmed bottleneck: the full JS+CSS payload is 96.21 kB gzip by direct measurement, local interactions were responsive, and there are no heavy future-feature dependencies to split out. Route-level lazy loading is therefore deferred until actual feature modules or a stricter initial-payload target justify its loading states and added complexity.

## 4. Runtime measurements

| Flow / measure | Observed result | Method and limit |
|---|---:|---|
| Timer heading visible after navigation | 157–205 ms; median 166 ms over 9 fresh contexts | Playwright wall time from `page.goto` to visible `h1`; includes local driver scheduling |
| First Contentful Paint | 160–180 ms across the probe runs | `PerformanceEntry` in managed Chromium on the local preview |
| Route change to destination heading | 46–106 ms; median 60.5 ms across 48 transitions | 12 transitions in each of 4 runs through all six routes; Playwright action-to-visible timing |
| Theme selection to dark token applied | 28–56 ms | Select light/dark control and wait for computed background token |
| Mobile drawer opening | 42–47 ms | 375×812 viewport; menu action to visible native dialog |
| Unknown-route recovery to Timer | 119 ms in one run | Not-found route to “Go to Timer” action and visible Timer heading; not a render-error-boundary benchmark |
| Long tasks | None observed | No `longtask` entries during the measured load and interactions; this is a small local sample |

All six routes were visited repeatedly. Solves consistently displayed its unavailable state, navigation remained usable, and theme and mobile drawer interactions completed. Source inspection found no render-driven timer or recurring animation. Component render counts were not instrumented with React Profiler. Existing unit tests cover the render-error boundary; a browser-injected React render crash was not measured because the production shell has no safe error-injection path.

### Memory and listener cleanup

In one Chromium renderer sample, CDP reported 3.52 MB used heap, 191 event listeners, and 432 DOM nodes near the start. After 12 route transitions and mobile drawer interactions, the pre-GC counters rose to 9.67 MB, 701 listeners, and 3,498 nodes. Following `HeapProfiler.collectGarbage`, they were 3.48 MB, 186 listeners, and 415 nodes. The actual page body stayed between 70 and 110 elements across route changes.

This bounded result is consistent with transient objects awaiting garbage collection, not a persistent listener or DOM leak. It does not substitute for a long session or a soak test. Source review also confirmed cleanup for the app's online/offline listeners, system-theme media-query listener, and Solves request invalidation on unmount/supersession.

## 5. Bottlenecks and recommendations

**Confirmed bottlenecks:** None in the measured Phase 1 UI shell. No long task, unresponsive navigation, duplicated production dependency, or heavy unused future-feature package was observed.

**Recommendations:**

1. Defer route-level code splitting until real chart, camera, analysis, or other feature modules are introduced, or until a product bundle budget is set. Current route transitions remain within the observed local range without split chunks.
2. Re-measure on a representative lower-end mobile device and with deployment-equivalent compression/network conditions before making user-perceived performance claims.
3. Add a production bundle budget or bundle analyzer only if future dependency growth makes the single entry bundle materially larger; do not add either as a dependency for this foundation-only shell.
4. Revisit long-session heap/listener behavior after real service-backed route data and feature components exist.

No production optimization was proposed for approval or applied. No before/after reduction is claimed; the final required build is the same code/bundle baseline as the initial build. No dependencies were installed.

## 6. Verification

All commands ran from `apps/web` with the environment above, after removing the temporary measurement test.

| Command | Result | Details |
|---|---|---|
| `npm run typecheck` | PASS, exit 0 | TypeScript project build completed. |
| `npm run lint` | PASS, exit 0 | ESLint completed without lint diagnostics. |
| `npm test` | PASS, exit 0 | 13 files, 67 tests passed. |
| `npm run test:e2e` | PASS, exit 0 | Chromium 156.0.8078.4: 77 tests passed, no skips. |
| `npm run build` | PASS, exit 0 | Vite 8.3.4; 118 modules transformed; the same two production assets and raw sizes as baseline. |
| `git diff --check` | PASS, exit 0 | No whitespace errors; Git reports existing LF-to-CRLF checkout warnings on modified files. |

E2E commands emitted Node's `NO_COLOR` ignored because `FORCE_COLOR` is set warning; it did not affect results. The Prompt 15 offline-event skip is not part of this default Chromium E2E run. Hosted CI was not run.

## 7. Architecture and remaining limits

- **PASS:** React, TypeScript, Vite and the existing service/provider boundaries remain unchanged.
- **PASS:** Supabase PostgreSQL remains the only persistent application database. No IndexedDB, localStorage persistence, durable queue, sync, backend, camera, or ML functionality was introduced.
- **Historical note:** At the time of the Prompt 16 audit, older Foundation guidance and the Prompt 16 prompt intro still used offline-first/IndexedDB wording. The documentation reconciliation before Prompt 19 aligned active instructions with the Supabase-only decision; retained original text is explicitly superseded.
- **NOT VERIFIED:** Firefox and WebKit performance timings, real Safari, Lighthouse/Performance-panel traces, throttled network/CPU, low-end devices, layout-shift score, React Profiler render counts, long-duration memory soak, and browser-injected render-error recovery.
- **NOT CLAIMED:** Real-user performance, general performance guarantees, or a full accessibility/performance certification.

## 8. Git state and files

Created for Prompt 16:

- `docs/phase1/prompt16-performance-bundle.md`

No application source or configuration files were modified. The existing Prompt 12–15 work remains uncommitted and unstaged, including `AppShell.tsx`, the skip-link regression tests, and the Prompt 15 compatibility report. `HEAD` remains `f261221fced5317b8f48810c0aea0f0c8e719059`; no remote was configured, and nothing was staged, committed, or pushed.

## 9. Acceptance evidence

| Criterion | PASS / FAIL / NOT VERIFIED | Evidence | Notes |
|---|---|---|---|
| Baseline and post-audit build sizes recorded | PASS | Initial and final `npm run build`; direct Node gzip/Brotli and Chromium Resource Timing measurements | No source changes, so the final build matches the baseline. Vite and direct JS gzip estimates differ by about 925 bytes; both are recorded. |
| No unused heavy future-feature bundle on initial load | PASS | Production dependency tree and `dist` assets inspection | All route shells are eager, but no chart/video/ML or other heavy deferred-feature library is installed or bundled. |
| Routes, themes, and tests remain intact | PASS | Typecheck/lint/unit tests/build and 77 Chromium E2E tests pass | No optimization was applied. |
| Performance measurements are real or explicitly NOT VERIFIED | PASS | Production preview timings, Resource Timing, Performance API, and Chromium CDP sample | Local Chromium only; environment and measurement limits are stated. |

**Handoff:** Prompt 16 audit is complete. Route splitting is deferred pending actual feature payload growth or an agreed bundle budget. No Prompt 17 work has started.

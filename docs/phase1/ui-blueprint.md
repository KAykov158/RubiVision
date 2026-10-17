# RubiVision AI — UI Design Blueprint

**Status:** Design contract for review; no routes or feature pages are implemented by this document.  
**Scope:** Foundation shell and presentation decisions for Prompt 6 and later UI work.  
**Architecture:** Supabase PostgreSQL is the only persistent application database. UI components consume services and do not write to a database.

**Prompt 6 status:** The shared shell and six routes described below have since been implemented. The route-specific feature behavior remains unimplemented and is presented as unavailable; the original inventory below records the baseline when this blueprint was written.

**Visual redesign amendment:** The original palette and shell composition below describe the approved pre-redesign baseline. The reference-led visual decisions in Section 10 supersede those visual values and layout details. Route contracts, accessibility, localization, service boundaries, persistence rules, and unavailable-state requirements remain active.

## 1. Current UI inventory

### Pages and routes

At blueprint authorship there were no route pages or navigation links. Prompt 6 adds `AppShell`, a routed outlet, and six route shells; the domain-specific feature views are still not implemented. `src/app/App.tsx` now declares routes, while `ThemeSettings` is rendered on Settings.

### Existing components and providers

| Existing component | Current responsibility | Blueprint use |
|---|---|---|
| `App` | Declares root redirect and six routes | Keep it limited to route composition |
| `AppShell` | Header, skip link, responsive navigation, focused main outlet, mobile drawer | Implements the shell decisions below; no feature behavior |
| `RouteState` | Loading, empty, unavailable, and error presentations | Reuse with future service-backed pages; currently routes use unavailable state |
| `AppProviders` | Composes error, service, locale, theme, and router providers | Keep all app-lifetime providers above route content |
| `ThemeSettings` | Labeled light/dark/system selector and save/session status | Reuse on Settings; keep the same service-backed, honest persistence behavior |
| `PageContainer` | Main landmark and max-width content container | One per route page; route heading and page content inside |
| `Button`, `IconButton` | Native button controls and variants | Navigation trigger, actions, close controls; icon-only controls need names |
| `Card` | Bordered surface section | Summary panels and grouped content |
| `Field`, `Input`, `Select` | Labeled input controls | Filters and settings, with visible labels and associated descriptions/errors |
| `Dialog` | Controlled native modal dialog | Mobile navigation drawer and future confirmations where a modal is appropriate |
| `Badge` | Text status with a semantic tone | Pair tone with explicit status text; never rely on color alone |
| `Spinner`, `Skeleton` | Loading indicator and decorative placeholder | Use for pending work; spinner has a live status name, skeleton is hidden from assistive technology |
| `EmptyState`, `ErrorState` | Empty and failure content | Distinguish no data, unavailable service, and operation failure on each route |
| `AppErrorBoundary` | App-level render failure fallback | Keep as last-resort shell fallback, localized through the message catalog |
| `AppServicesProvider` | Typed service injection boundary | Keep above routes so service instances and future timer state do not reset on navigation |
| `LocaleProvider`, `ThemeProvider` | Locale lookup and theme preference context | Keep at app lifetime above route content |

The domain contracts include scrambles, sessions, solves, recordings, and analyses; they are not UI components and do not imply that those features are implemented.

## 2. Visual system and token contract

Continue using `src/shared/styles/tokens.css`; do not create a parallel palette or spacing system. These are the current sample defaults and semantic names:

| Semantic token | Light | Dark |
|---|---|---|
| `--color-background` | `#f5f6f8` | `#101828` |
| `--color-surface` | `#ffffff` | `#182335` |
| `--color-surface-raised` | `#ffffff` | `#202d42` |
| `--color-text` | `#172033` | `#f1f5f9` |
| `--color-text-muted` | `#475569` | `#c4cfdd` |
| `--color-border` | `#64748b` | `#9aa9bd` |
| `--color-border-subtle` | `#cbd5e1` | `#52627a` |
| `--color-accent` | `#174ea6` | `#a9c7ff` |
| `--color-accent-hover` | `#123d82` | `#c5d9ff` |
| `--color-on-accent` | `#ffffff` | `#101828` |
| `--color-success` | `#17633c` | `#9ce3bd` |
| `--color-warning` | `#744210` | `#ffd18a` |
| `--color-danger` | `#a12222` | `#ffb4ab` |
| `--color-focus-ring` | `#174ea6` | `#c5d9ff` |

`--color-on-danger` is white in light mode and `#101828` in dark mode. The default preference is system mode: CSS follows `prefers-color-scheme`; explicit `data-theme="light"` and `data-theme="dark"` override it. The current selector is in the appearance settings section rather than a second, separate header toggle.

### Contrast evidence and limits

The Prompt 4 contrast review calculated these current normal-text pairs using the WCAG sRGB formula: light body on background 15.04:1; light muted on surface 7.58:1; light accent text 7.85:1; light success/warning/danger on white 7.28:1, 8.30:1, and 7.59:1; dark body/muted on surface 14.41:1 and 10.01:1; dark accent text 10.39:1; dark success/warning/danger on surface 10.62:1, 11.08:1, and 9.30:1. Those pairs exceed 4.5:1. This is a palette calculation, not browser-rendered verification. Hover variants, all component surfaces, borders as non-text indicators, focus visibility on every background, forced-colors rendering, and the final route compositions still need review. Status text must include words/icons as well as color.

## 3. Typography and spacing

Use the existing font-size and line-height tokens as the base scale:

| Role | Size | Line height | Notes |
|---|---:|---:|---|
| Caption / metadata | `--font-size-xs` (12px) or `--font-size-sm` (14px) | 1.5 | Prefer 12px only for secondary metadata; never for essential instructions |
| Body | `--font-size-sm` (14px) to `--font-size-md` (16px) | `--line-height-normal` (1.5) | Use 16px for primary reading copy and dense controls at narrow widths |
| Page heading | 30px (`--font-size-3xl`) | `--line-height-tight` (1.25) | One `h1` per route |
| Section heading | 20–24px (`--font-size-xl` / `--font-size-2xl`) | 1.25 | Keep heading order semantic |
| Timer display (future) | `clamp(2.75rem, 10vw, 7rem)` | 1.0 | Use tabular numerals (`font-variant-numeric: tabular-nums`) so digits do not shift |

Use the existing 4px-derived spacing tokens: 4, 8, 12, 16, 20, 24, 32, 40, 48, and 64px (`--space-1` through `--space-16`). Default content padding is 16px on narrow screens and 32px at wider widths; cards use 16px on narrow screens and 24px from tablet widths. Preserve the existing radii (`--radius-sm` through `--radius-xl`) and elevation tokens. Focus uses the shared 3px `:focus-visible` outline with a 3px offset; do not remove it in component styles.

## 4. Application shell and navigation

### Hierarchy

1. A skip link targets `#main-content` before other interactive shell controls.
2. A compact shell header shows the RubiVision AI wordmark and, on mobile, the navigation menu button.
3. Primary navigation contains exactly: Timer, Solves, Statistics, Analyze, Challenges, Settings.
4. Each route has one `main#main-content` landmark, a page-level `h1`, optional short description, then route content.
5. Route links use real destinations, visible focus, an active visual treatment, and `aria-current="page"`. No dead links or fake feature controls.

### Navigation behavior

- Desktop and tablet: persistent left navigation. At widths 1024px and above, use a 16rem sidebar; at 768–1023px, use a compact 12rem sidebar with visible text labels.
- Mobile below 768px: keep navigation closed by default and open it from a minimum 44px target menu button. Use a modal drawer based on the existing native `Dialog`; the button exposes `aria-expanded` and `aria-controls`. Escape and the close button dismiss it; selecting a destination closes it and returns focus to the destination context. Preserve browser Back/Forward behavior.
- Do not add a global Space shortcut. Timer keyboard behavior belongs to the timer feature and must not interfere with focused controls or navigation.
- Keep `AppServicesProvider`, `ThemeProvider`, and `LocaleProvider` above route outlets. A route change must not recreate a timer service or reset an active solve.
- Unknown destinations receive a localized not-found state with a real link back to Timer.

The mobile drawer and focus behavior must be checked in a real browser. Current `Dialog` unit tests do not establish native browser focus trapping or restoration behavior.

## 5. Responsive layout contract

The content maximum remains `--layout-content-max: 72rem`. CSS breakpoints mirror the current token values: 48rem (768px) for mobile-to-tablet, 64rem (1024px) for tablet-to-desktop; as documented in Prompt 4, CSS variables cannot currently be substituted into media-query conditions, so literals and tokens must be kept in sync.

| Viewport | Layout decision |
|---:|---|
| 320px | Minimum supported width. Mobile header and drawer only; content has 8px side gutters, stacked controls/cards, and no page-level horizontal scroll. Long notation wraps at move boundaries where possible. |
| 375px | Mobile layout with 16px content gutters; controls may wrap or stack. Dialog/drawer width is capped to viewport minus 32px. |
| 768px | Tablet breakpoint. Persistent 12rem labeled sidebar; content uses remaining width, with filters allowed to wrap into multiple rows. |
| 1024px | Desktop breakpoint. Persistent 16rem sidebar; route content uses a flexible column and may introduce two-column cards when each column remains readable. |
| 1440px | Desktop with 16rem sidebar and centered content capped at 72rem; do not stretch tables or prose across the full monitor. |

Wide tables keep semantic table markup inside a labeled, horizontally scrollable region; only that region may scroll horizontally, and a short visible hint explains the scroll. On narrow screens, prefer a card/list representation when it preserves the same row labels and relationships. Scramble notation wraps between space-separated move tokens and may use `overflow-wrap: anywhere` as a final safeguard; never clip a move or create body overflow. Charts remain within their card width and provide a textual summary or data table alternative. Video, if later added, uses a responsive 16:9 container and does not dictate page width.

These are design targets, not measured results. Browser rendering and overflow remain NOT VERIFIED until Prompt 6+ browser checks run at the specified widths.

## 6. Page wireframes and states

The page hierarchies below remain design contracts. Prompt 6 implements the shared shell and explicit unavailable placeholders only; the feature-specific controls and data behavior remain planned and must not be inferred as present.

| Route | Planned hierarchy / wireframe | Required visible states |
|---|---|---|
| `/timer` | Page title; puzzle selector; current scramble card with copy action; large centered tabular timer; session context and concise keyboard/touch hint. Keep the timer visually dominant. | Scramble loading; no scramble yet; generation unavailable/error with retry action; ready/running/stopped states only when timer service exists. Do not show a fabricated solve or scramble. |
| `/solves` | Page title; filter row (session, puzzle, optional date); result count; labeled history table or mobile list with time, penalty, puzzle, date, and solve actions only when service supports them. | Initial loading skeleton; truly empty collection; filter-empty result; repository unavailable; read error with retry. Keep raw and effective times distinct and honor canonical penalty semantics. |
| `/statistics` | Page title; scope filters; summary cards for verified aggregates; chart region and accessible text/table summary below. | Loading; no eligible solves; unavailable repository; calculation/read error. Never display example values as a user's real statistics. |
| `/analyze` | Page title; solve/recording selector; eligibility/context panel; video and analysis timeline regions only when their owning services provide data. Include provenance/version and quality warnings with results. | No recorded solve; analysis unavailable; recording/analysis loading; error; uncertain/low-quality analysis shown explicitly. No inferred moves or phases without separate evidence. |
| `/challenges` | Page title and short scope description; a reserved content region for future challenge features. During shell-only delivery, show a clear “not configured yet” unavailable state instead of fabricated challenges or an inactive control. | Loading only if a future service is actually called; unavailable until a real challenge contract exists; explicit errors if introduced later. Do not imply a saved attempt or leaderboard exists. |
| `/settings` | Page title; Appearance section reusing `ThemeSettings`; later sections appear only after settings/auth/data contracts exist. | Theme preference loading; session-only state; service save success/failure; invalid preference fallback. Other settings remain absent until implemented. |

### Shared state patterns

- Keep loading, empty, unavailable, and error distinct. Reuse `Spinner`, `Skeleton`, `EmptyState`, `ErrorState`, `Badge`, and `Card`; add no separate visual language for one route.
- Errors state what failed and offer retry only when the owning operation can safely be retried. Preserve a user's original solve/recording when a derived analysis fails.
- Status is communicated with text and semantics (`role="status"`/`role="alert"` as appropriate), never color alone. Live regions should announce transitions, not every timer tick.
- Dialogs are controlled, have a visible title and close action, close on Escape, and restore focus. Tooltips, if later justified, must work on keyboard focus and touch and cannot contain essential-only information.

## 7. Accessibility, theme, and interaction contract

- Use native links, buttons, labels, inputs, selects, tables, and headings where possible. Icon-only buttons require localized accessible names. Every field keeps its label, hints, errors, and existing `aria-describedby` associations.
- All functionality is keyboard reachable in logical visual order. Focus is visible, not color-only, and is moved to the page heading/main context after client-side navigation without trapping focus there.
- Interactive targets are at least 44×44 CSS px where practical. Mobile drawer controls remain touch-sized; hover is a supplement, not an interaction requirement.
- Honor `prefers-reduced-motion`; avoid motion as the sole cue. Retain forced-colors support and ensure selected, error, warning, and success states include non-color cues.
- Theme components use semantic tokens, not literal colors. Native controls and dialogs follow `color-scheme`; explicit light/dark selection overrides system mode. No theme preference is claimed to survive refresh unless an injected account-backed preference service acknowledges persistence.
- Keep all user-visible strings in the message catalog. Avoid hard-coded user content, misleading WCA claims, fake data, exact move/CFOP claims, and AI results without recorded model evidence.

## 8. Decisions for Prompt 6 and onward

1. Use route paths `/timer`, `/solves`, `/statistics`, `/analyze`, `/challenges`, `/settings`; `/` redirects to `/timer` and unknown routes show not-found.
2. Implement the shared shell only in Prompt 6: header, skip link, persistent desktop/tablet navigation, accessible mobile drawer, main route outlet, active-link and focus behavior, and route-level unavailable placeholder states.
3. Preserve app-level providers above route content. Timer state will be owned by a service/provider when the timer phase implements it, not a route component.
4. Keep the existing 48rem and 64rem breakpoints, 72rem content max, token palette, typography, shared primitives, and system-aware theme behavior. Make only small consistency changes if implementation reveals a concrete mismatch.
5. Keep feature behavior out of the shell. Later prompts own timer mechanics, scramble generation, solve persistence, statistics, camera, analysis, and settings persistence.
6. Use `EmptyState`/`ErrorState` or explicit unavailable copy for nonimplemented routes; never show sample values as saved user records.
7. Retain horizontal table scrolling only within labeled table regions; wrap scramble move tokens and prevent page-level overflow.
8. Browser verification is a release item: test desktop/tablet/mobile widths, keyboard-only navigation, Back/Forward, unknown routes, overflow, light/dark/system appearance, and native dialog focus behavior. Do not mark these verified from this blueprint or jsdom tests.

## 9. Acceptance matrix for this planning step

| Criterion | Status | Evidence | Notes |
|---|---|---|---|
| Current pages and components inventoried | PASS | Repository source inventory in this document | No route pages exist yet; the foundation entry view is the only current view |
| Six required routes and page states described | PASS | Page wireframe/state table | Planned only; no route code added |
| Existing theme tokens and reusable components retained | PASS | Token and component contracts documented | No parallel design system introduced |
| Responsive behavior defined at 320, 375, 768, 1024, 1440px | PASS | Responsive layout table | Targets only; not browser verified |
| Keyboard, touch, reduced-motion, focus, and status choices defined | PASS | Accessibility section | Native dialog behavior still requires browser tests |
| Contrast values include evidence and limitations | PASS | Contrast table and unverified pairs section | Prior palette ratios recorded; not full rendered-page audit |
| No feature or persistence implementation added | PASS | Documentation-only change | Supabase remains the only persistent app database |
| Browser-rendered appearance and responsive behavior | NOT VERIFIED | No browser session run for this planning step | Explicitly deferred to Prompt 6+ browser testing |

## 10. Reference-led visual redesign amendment

This amendment is the active visual direction for the Category 01 interface. The supplied speedcubing dashboard screenshot is the primary visual reference. It guides palette, visual hierarchy, spacing, and page composition; it does not authorize copying unrelated navigation, adding feature behavior, or displaying the screenshot's example times and records.

### Visual system

- Use the existing semantic custom properties in `src/shared/styles/tokens.css`; do not add a second theme or palette.
- Dark mode uses a near-black charcoal canvas (`#0c0e12`), charcoal panels (`#14171c` / `#1a1d23`), restrained borders, warm-white text, and violet accents. The app canvas may use a very low-contrast dotted texture.
- Light mode remains a low-glare neutral surface with dark text and a deeper violet accent. Focus indicators and text must remain legible against every token surface.
- Use rounded rectangular cards and controls, subtle shadows, compact metadata, and tabular numerals for timer and statistic placeholders.
- Existing light/dark/system behavior and OS theme-change handling remain authoritative. No browser storage may be added for theme settings.

### Shell and page hierarchy

- Desktop uses a compact branded navigation rail and exactly the six RubiVision routes: Timer, Solves, Statistics, Analyze, Challenges, and Settings. Each link has a decorative icon plus a visible text label; the active route has a violet treatment. The list itself has no browser bullet markers.
- The desktop/tablet rail places a circular, generic Guest avatar and localized Guest label between branding and navigation. `ProfileSummary` accepts display name and optional image URL as presentation props; it has no Auth dependency and must only receive verified profile data when Category 02A adds the Supabase Auth/profile integration. The current shell must not imply a signed-in identity, level, or rank.
- Mobile retains the compact top bar and the existing modal navigation drawer. Skip-link order and behavior, `aria-current`, route-change focus, Escape dismissal, focus trapping, and focus restoration remain unchanged.
- Timer is the visual center of the app. Its controls sit above a centered scramble availability panel and a large, high-contrast timer display. Compact statistic cards and an explicitly unavailable visualization sit below. A right-side session rail contains session overview and recent-solve states on wide screens.
- The scramble panel is directly above the timer readout. `ScrambleDisplay` accepts the existing `Scramble` domain contract and renders only supplied notation; the current page passes no scramble and keeps the localized unavailable message until Category 03 provides generation. Long notation uses a distinct, centered monospaced surface that wraps between moves and never clips. On mobile, scramble and timer remain first, followed by statistics and then the secondary session rail.
- Solves, Statistics, Analyze, Challenges, and Settings retain their domain-specific content and state behavior while sharing the same card, heading, spacing, and token system.
- All statistics, solve history, scramble, visualization, analysis, and challenge data remain empty, unavailable, loading, or error content until provided by the owning service. No example values may be rendered as a user's real data.

### Responsive layout targets

| Viewport | Active visual behavior |
|---:|---|
| 320px | Mobile bar and drawer; single-column Timer workspace; compact controls stack; session panels follow timer and stats; no page overflow. |
| 375px | Mobile composition with touch-sized controls and secondary content below the timer. |
| 768px | Labeled compact navigation rail; Timer content uses the available width and places the session rail below its main workspace. |
| 1024px | Navigation rail, Timer workspace, and narrower session rail fit without clipping; secondary cards may use two columns. |
| 1440px | Full three-region composition with the timer centered in the workspace and the session overview on the right. |

These are implementation targets. Browser claims must be based on actual rendered checks and screenshots at each width in both light and dark modes. Reduced-motion and forced-colors rules remain in force. The architecture and service contracts above are unchanged; Supabase PostgreSQL remains the sole persistent application database.

### Browser verification record

- Chromium `156.0.8078.4`: the complete Playwright suite passed (77/77). Timer screenshots were captured at 320, 375, 768, 1024, and 1440 CSS pixels in both light and dark modes. The responsive tests also cover Solves, Statistics, Analyze, Challenges, and Settings.
- Firefox `157.0` and WebKit `27.2`: the complete compatibility suite passed 153 tests with one skip. The skip is the already documented WebKit offline-event emulation limitation in `prompt10-resilience-accessibility.spec.ts`; the app's offline and online event handlers remain covered through dispatched browser events in other checks. A first six-worker run had a Firefox route-load timeout; the route test passed when isolated, and the full two-worker rerun passed.
- Reviewed Chromium screenshots include `apps/web/test-results/timer-layout-Timer-layout--3f416-pping-at-320px-in-dark-mode/timer-dark-320.png`, `apps/web/test-results/timer-layout-Timer-layout--1033c-ping-at-375px-in-light-mode/timer-light-375.png`, `apps/web/test-results/timer-layout-Timer-layout--4c6fd-pping-at-768px-in-dark-mode/timer-dark-768.png`, `apps/web/test-results/timer-layout-Timer-layout--2fa4c-ping-at-1024px-in-dark-mode/timer-dark-1024.png`, and `apps/web/test-results/timer-layout-Timer-layout--03446-ping-at-1440px-in-dark-mode/timer-dark-1440.png` (plus the corresponding light/dark captures at every matrix width). Test-result screenshots are generated artifacts and are not project source files.
- The composition follows the supplied reference but is not pixel-identical: the app uses its own navigation labels and icons, and all unavailable data remains explicitly unavailable. The screenshot's solve times, statistics, history rows, and charts are not reproduced. Mobile and tablet stack the session rail below the Timer workspace.

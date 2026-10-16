# Theme preferences and localization foundation

Prompt 5 adds a controlled appearance selector and locale-ready message keys while continuing to use the Prompt 4 semantic tokens and UI primitives.

## Theme selection and runtime behavior

`ThemeProvider` owns a `system | light | dark` preference and applies it to `document.documentElement.dataset.theme`. In system mode, CSS continues to use the `prefers-color-scheme` media query and the provider subscribes to media-query changes, exposing the resolved theme to consumers. The listener is installed only in system mode and removed when the preference changes or the provider unmounts. Explicit light/dark mode does not subscribe.

The selector is a native labeled select, so keyboard and assistive-technology behavior remains browser-native. The visible status text distinguishes a successful service save from session-only behavior and from service failures.

## Persistence boundary and Supabase policy

`UserPreferencesService` is an optional typed member of `AppServices`. It is the only boundary for loading or saving the theme preference. The application currently has no Supabase preferences adapter or settings schema, and does not persist preferences in the browser. With no adapter, the selected theme applies for the current mounted session and the UI says so. A service read/write failure leaves the in-memory selection usable and reports the failure without blocking the control.

The service contract supports an account-backed adapter in a later cloud/settings phase. That adapter must use Supabase Auth and PostgreSQL with RLS; no browser database, `localStorage`, IndexedDB, offline queue, or synchronization behavior is introduced here. Because there is no configured persistent adapter, the UI makes no refresh-survival claim. CSS follows system theme immediately at first paint; an account preference may arrive after initial render once a remote adapter exists.

Loaded values are checked at runtime even though the service contract is typed. An unsupported value falls back to `system`, shows a non-blocking notice, and is not automatically overwritten.

## Localization

`src/shared/i18n/messages.ts` centralizes the current English UI strings and defines the `Locale` and `MessageKey` types. `LocaleProvider` and `useTranslation` are the lookup boundary for components. Only English strings are included today; no translation-completeness claim is made. New user-facing strings should be added to the message dictionary rather than embedded in application components.

## Verification boundaries

Unit tests use injected preference service implementations to verify successful reads/writes, invalid values, service unavailability, and safe mounting/unmounting. These test adapters are in-memory test doubles; they are not application persistence. No actual settings survive refresh until a Supabase adapter is implemented.

Browser rendering of light/dark palettes, real small-viewport overflow, and native dialog focus trapping/restoration remain NOT VERIFIED. Keep these on the later browser-verification checklist; jsdom tests do not establish those browser behaviors.

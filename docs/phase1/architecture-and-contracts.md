# Prompt 3 — Architecture and Contract Decisions

**Date:** 2026-10-16 (Europe/Sofia)  
**Scope:** Foundation contracts and injection boundaries only. This document follows the current Supabase-only master architecture; legacy IndexedDB/offline-first persistence statements are historical and superseded.

## Runtime boundaries

```text
React views
  → feature services and repositories (typed contracts)
    → Supabase client / feature adapters (added by the owning later phase)
      → Supabase Auth + PostgreSQL with Row Level Security
```

Views do not import Supabase clients or issue database requests. A service adapter translates domain values to database rows and maps backend results to the typed service result. Supabase PostgreSQL is the only persistent application database. Supabase Storage may hold video only after the media feature adds explicit user consent and policies. Do not create IndexedDB stores, browser database schemas, durable offline queues, or sync workers. A failed save may be retained in tab memory by its feature for retry or export, as required by the cloud-only recovery policy.

Supabase Auth is the identity provider for cloud access. The authentication adapter/session UI belongs to the cloud foundation phase. The database phase owns versioned SQL migrations and generated database types. It must enable RLS on user-owned tables and define select/insert/update/delete policies scoped to `auth.uid()`. Child-row policies must verify the parent row belongs to the same authenticated user. Client-provided owner IDs are never an authorization boundary. No Supabase Auth or database implementation is added in this Foundation prompt.

## Canonical domain data

`src/shared/domain/contracts.ts` is the single TypeScript definition for the shared contracts from `00_DATA_CONTRACTS.md`:

- Puzzle IDs: `222` through `777`; penalties: `NONE`, `PLUS_TWO`, `DNF`.
- Timing sources: `KEYBOARD`, `TOUCH`, `SMART_CUBE`; activity labels: `MOVEMENT`, `PAUSE`, `UNCERTAIN`.
- Scramble, session, solve, recording, activity segment, solve analysis, and feature window field names are preserved.
- IDs remain UUID strings; timestamps are ISO 8601 UTC strings; duration and offset fields are milliseconds. Feature intervals are half-open `[startMs, endMs)`; confidence is nullable and otherwise in `[0,1]`.
- `blobStorageKey` is retained as the existing opaque recording reference. It does not imply a local database. A later media adapter decides whether the reference is temporary or a consented Supabase Storage object key.
- Effective solve time is derived and must not be persisted as a second value.

`effectiveTimeMs` accepts a canonical `Solve`, validates `rawTimeMs` as a finite, non-negative integer, returns `null` for DNF, adds 2000 ms for `PLUS_TWO`, and otherwise returns the raw time. Invalid runtime penalty values throw a `TypeError`; invalid durations throw a `RangeError`.

## Service contracts and result handling

`ScrambleService`, `SolveRepository`, and `AnalysisService` return `ServiceResult<T>` rather than leaking database exceptions or pretending an operation succeeded. The union distinguishes success, unavailable service (not configured, authentication required, network required, unsupported), and operation error (invalid input, missing data, forbidden, conflict, network, rate limited, cancelled, unknown). Messages are optional user-safe descriptions; implementations must not put credentials or sensitive row data in them.

`AppServicesProvider` accepts a typed `AppServices` object. The application composition mounts it above `BrowserRouter`, so injected service instances have app lifetime and route changes do not recreate them. Until a real adapter is added, consumers receive the explicit `NOT_CONFIGURED` state. There are no production mock services or fabricated success results.

`AppServices` may also receive an optional `UserPreferencesService` for user-scoped display preferences. The theme UI applies preferences in memory and reports whether the injected service acknowledged persistence. No preference persistence adapter is configured yet; a future implementation must use Supabase Auth/PostgreSQL with RLS. Browser storage is not used as a fallback.

### Async loading and cancellation

- Views own transient request presentation state (`idle`, `loading`, loaded/empty, unavailable, error); services own domain and backend behavior.
- Start a request from a user action or a route-level effect, show loading immediately, and map each `ServiceResult` branch to its corresponding view state. Empty data is distinct from unavailable service and failure.
- For analysis or other cancellable work, create an `AbortController` for the request lifetime, pass its signal to the service, abort it on unmount or when superseded, and ignore stale responses. A cancelled request is not presented as a successful empty result.
- Do not retry mutations automatically unless the owning cloud feature establishes idempotency. For a future solve save, show `Saving`/`Unsaved` until Supabase acknowledges the write; offline retry state is transient in memory only.

## Phase handoff

- **Category 02:** define PostgreSQL tables, ownership relationships, constraints, migrations, generated DB types, and RLS policy tests against these domain contracts.
- **Category 02A:** integrate Supabase Auth and construct the typed cloud repositories; enforce policies using the authenticated identity.
- **Timer category:** put its state machine/service instance in app-level composition, not inside a route component. It must use a monotonic clock and remain independent of network latency; persistence reports explicit saving/unsaved status.
- **Scramble and analysis categories:** implement the corresponding service interfaces and preserve provenance/version information in derived results.

No timer, scramble generator, cloud repository, authentication flow, local database, or sync implementation is part of Prompt 3.

## Verification

Final checks ran from `apps/web` with Node 24.20.0 and npm 11.19.0:

| Command | Result |
|---|---|
| `npm run typecheck` | PASS, exit 0 |
| `npm run lint` | PASS, exit 0 with no warnings |
| `npm test` | PASS, exit 0; 5 test files and 13 tests passed |
| `npm run build` | PASS, exit 0; Vite 8.3.4 built successfully |

The source scan for `IndexedDB`, `localStorage`, Supabase database calls, and sync worker patterns under `apps/web/src` found no matches. The only database/auth behavior in this phase is the documented future boundary; no client or persistent adapter is configured.

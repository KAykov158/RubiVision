# Detailed implementation and completion guide

## 1. Outcome and boundaries
The module turns a timer completion into a securely persisted, queryable, editable, and exportable solve. Sessions group solves by puzzle. History displays source data and calculated effective time, preserving immutable raw durations. A completed implementation includes authorization, database constraints, UI, integrations, migrations, tests and documentation—not only visual pages.

## 2. Recommended architecture
Timer state machine -> SolveCaptureService (immutable snapshot and stable UUID) -> SolveService (validation, retry, error mapping) -> SupabaseRepository -> PostgreSQL with RLS and constraints. HistoryPage -> HistoryQueryService -> paginated repository. Session UI -> SessionService. Statistics and analysis consume typed services and query invalidation, not cross-feature direct SQL writes. UI components never hold service-role credentials.

## 3. Data rules
- Store times as integer milliseconds; retain raw duration and penalty separately. `effectiveTimeMs = penalty === 'DNF' ? null : rawTimeMs + (penalty === 'PLUS_TWO' ? 2000 : 0)`.
- Every solve references one immutable scramble, and its puzzle matches session and scramble.
- All durable records are stored in Supabase PostgreSQL. In-memory pending UI is ephemeral; never claim offline persistence.
- Store UTC and display in local timezone; date filters must convert chosen local calendar ranges to UTC server query bounds.
- Stable client-generated UUIDs provide idempotent retry; a new UUID on retry is a bug.
- Use revision numbers or updated_at preconditions to detect concurrent writes.
- Enforce invariants in trusted database logic, not merely browser validation.

## 4. Failure-state decisions
| Situation | Expected behavior |
|---|---|
| Not authenticated | Save/history blocked with explicit sign-in state; timer may still operate |
| Offline on stop | Display unsaved in memory; offer retry while page remains open; warn about reload loss |
| Timeout after submit | Retry same UUID; inspect server outcome, do not create duplicate |
| Session not yet created | Wait for confirmed session creation before saving dependent solve |
| Two devices edit penalty | Detect stale revision and offer reload/reapply; no silent last-write-wins |
| Delete session | Apply documented cascade or reassignment transaction; no orphan solves |
| Camera unavailable | Timer and metadata flows remain independent |
| AI analysis unavailable | Existing solve/history remains intact |
| Import validation fails | Zero writes, detailed error and preview |
| User tries foreign solve | RLS denies read and mutation |

## 5. Completion criteria
A release is complete only when: (1) fresh database migration works, (2) schema constraints and RLS pass negative tests, (3) timer save is idempotent, (4) confirmed solves survive reload and appear in paginated history, (5) sessions CRUD and soft-delete policy work, (6) penalties/notes/tags and bulk operations are validated, (7) statistics refresh correctly, (8) JSON/CSV export and transactional import round-trip, (9) auth/network/error states are visible, (10) automated tests and production build pass, (11) browser demo is repeated, and (12) documentation accurately reports limitations.

## 6. Improvements beyond the source requirements
Added strict cross-owner relationship enforcement, optimistic concurrency, server-side pagination and index strategy, stable retry IDs for ambiguous network outcomes, immutable raw time at database boundary, migration rollback planning, soft deletion with recovery, accessibility and performance gates, import atomicity, two-account RLS penetration tests, security-definer hardening, explicit pending-versus-confirmed states, and independent adversarial review.

## 7. Suggested execution checkpoints
- Audit and contracts: no production writes.
- Schema/security: migration verified in disposable test database.
- Repository and timer: save/reload test.
- Session/history UI: browser acceptance tests.
- Mutations, integrations and import: regression and transaction tests.
- Release: end-to-end evidence and reviewer signoff.

## 8. Scope and sources
The uploaded category 05 is a planned specification, not proof of existing implementation. Some legacy source files still demand IndexedDB and offline-first behavior. The latest category 05 Supabase-only amendment is used as the authority for persistence. Referenced newer master sections 11–15 and category 02A were not included; verify them before irreversible design choices. No actual source repository or Supabase project was supplied, so all implementation and test claims remain future tasks.

# Architecture, conflicts, and improvements

## Proposed data flow
UI -> typed domain services -> repository -> Supabase Postgres (Auth + RLS). Video capture -> local browser blob -> worker-based feature extraction -> classifier -> versioned analysis -> repository; upload to private Supabase Storage only after explicit user action. Timer state machine and monotonic clock are independent of network and camera. Every completed solve gets a stable UUID before first save attempt; retry reuses same ID. UI distinguishes UNSAVED/SAVING/SAVED/FAILED.

## Contract improvements
- Add `schemaVersion`, `ownerId` where appropriate, created/updated UTC timestamps and clear provenance.
- `effectiveTimeMs` is derived, not separately mutable; DNF maps to null.
- Foreign keys require immutable scramble association; transaction or RPC enforces related records.
- RLS enforced on all tables and storage; test cross-user denial, not just positive access.
- Analysis records immutable model/feature manifest versions; manual edits remain separate from predictions.
- Video and window timestamps use half-open intervals and recording-relative time.
- Explicit no-durable-offline-save warning, retries idempotent, page close warning for unsaved results.
- Client clock vs UTC wall-clock roles documented.
- Accessibility and low-quality video uncertainty are first-class features.

## Contradictions to resolve
1. Older master and data contracts prescribe IndexedDB; newest timer header supersedes them with Supabase-only. The timer file also contains conflicting older sections. Update canonical docs before implementing.
2. Original graduation master focuses 3x3; some newer modules require 2x2–7x7. Make 3x3 end-to-end the minimum gate; broader puzzle coverage is an incremental feature.
3. Original master says Supabase optional; this pack makes it required for persisted solves. Document resulting requirement for auth/connectivity and adapt the demo accordingly.
4. Some text implies exact CFOP/turn recognition; experimental movement classifier cannot support those claims.
5. Original data contracts say recordings live in IndexedDB; decide between transient local recordings and consented private Supabase Storage, with no false durability promise.

## Recommended project structure (adapt, don't force)
`src/features/{timer,scramble,solves,statistics,camera,vision,analysis,settings}`; `src/domain`; `src/services`; `src/lib/supabase`; `supabase/migrations`; `tests/{unit,integration,e2e,security}`; `scripts/ml`; `docs`.

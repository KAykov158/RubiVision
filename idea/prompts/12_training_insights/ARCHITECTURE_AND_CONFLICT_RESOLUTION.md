# Architecture, precedence, and design decisions

## Precedence
1. The explicit 2026-10-16 Supabase-only architecture directive in `12_Stage_Timing_and_Training_Insights.md` takes precedence over older IndexedDB/local-database/offline-outbox text. Its references to missing master 11–15 and category 02A are NOT present in this supplied source bundle; do not pretend to have read them. Request those files if available and reconcile them before security-critical implementation.
2. Existing repository code is evidence of implementation, NOT automatic authority to override the requested new architecture. Produce a migration plan before changing persistence.
3. Functional requirements not in conflict remain. Graduation scope prioritizes the reliable core, video analysis, scientific evaluation, and manual stages; scanning, smart cubes, full state tracking and automatic CFOP are experimental extensions.
4. The 15-page original DOCX focuses on a 3x3 minimum MVP, while some markdown prompts extend to 2x2–7x7. Implement 3x3 end-to-end first, then 2x2–7x7 with verified puzzle-specific scramblers and test coverage.

## Operational behavior and important tradeoffs
- Anonymous timer operation is possible in memory; durable save requires authentication and network, unless a separately authorized server-side guest identity design is approved and implemented securely.
- The timer must never wait for the network on start/stop. Show an explicit UNSAVED result on failed persistence and provide a user-controlled retry while the page remains open. Do not claim durability after reload without server acknowledgment.
- Use Supabase Auth, PostgreSQL with RLS, migrations, versioned JSON payloads and foreign keys; Storage only for explicitly opted-in video archives. Camera and file import remain opt-in, and local media processing need not involve upload.
- Data writes go through typed repositories/services; derive final solve time from raw milliseconds and penalty; retain immutable original predictions alongside manually corrected derived views.
- No verified camera-only exact move tracking, automatic CFOP phase inference, or physical cube state reconstruction is in the graduation core. Smart-cube events and validated manual scans can support separate evidence-backed advanced functionality.
- Separate stage marker time coordinates: recording-relative timestamps vs timer-relative timestamps; store timerStartOffsetMs and document conversions. Use half-open intervals [startMs,endMs).
- Supabase client public anon/publishable key may be in browser; service_role/secret keys NEVER may be. RLS must be tested with two users, not merely inspected.

## Required architecture decision records (ADRs)
Create ADRs for auth policy, unauthenticated timing behavior, recording persistence/retention, ownership/RLS, schema migrations, conflict/version strategy, scramble library and puzzle scope, video decoding/worker support, model runtime/manifest, session deletion, and backup/import semantics. Each ADR: context, options, chosen approach, consequences, tests, reversal strategy.

## Missing material
The stage specification cites master documents 11–15 and category 02A, but those exact documents are absent from the uploaded set. Treat the latest directive as explicit but flag detailed sync/security semantics as requiring confirmation, rather than inventing missing requirements.

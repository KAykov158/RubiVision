> **SUPABASE-ONLY ARCHITECTURE OVERRIDE (2026-10-16).** This Foundation source pack preserves older requirements for traceability. Any requirement below that calls for IndexedDB, another browser/local database, localStorage application persistence, durable offline writes, or automatic synchronization is superseded by master documents 11 and 17. Supabase PostgreSQL is the sole persistent application database; Supabase Auth and owner-scoped RLS apply to future cloud access. A failed write may remain only in volatile tab memory and must be explicitly unsaved. Domain contracts and non-storage product requirements remain unless separately superseded.

# RubiVision AI — Master Instructions for Coding Agents

## Mission and product boundary
Build a speedcubing web application with reliable timing, WCA-compatible scrambles, sessions, history, statistics, optional camera recording, and an experimentally evaluated AI movement/pause/uncertain classifier. Core timing must not depend on camera, model, or network availability; persistent history requires an acknowledged Supabase write. Do not assert exact move reconstruction, CFOP phase identification or cube-state recognition from motion features alone.

## Agent procedure (mandatory for every topic)
1. Inspect the actual repository and existing implementations, tests, package manager and scripts. Proposed file names are suggestions; extend working code rather than duplicating it.
2. Read this file, `00_DATA_CONTRACTS.md`, `00_PROJECT_ROADMAP.md`, the assigned topic prompt, and `00_INTEGRATION_CHECKLIST.md` before editing.
3. Report a brief plan and dependencies; implement the assigned scope and only essential typed integration points. Do not replace unrelated working code.
4. Prefer React + TypeScript with strict checking for the web client; use Python for offline dataset preparation and training. Select actual libraries only after checking the repository. Keep domain logic pure and separate from UI, persistence, media and model adapters.
5. Use stable IDs, UTC timestamps, millisecond durations, explicit units, typed results, schema validation, and non-destructive migrations. Handle unsupported browser APIs, permission denial, offline state, storage failures and cancellation.
6. Do not hardcode secrets or ship private service credentials. Request camera permission through user action. Store media locally by default; explain consent, retention and deletion.
7. Add meaningful unit/integration tests, run available lint/typecheck/test/build scripts, and report what actually ran, failed or was unavailable. Never fabricate passing tests, training datasets, accuracy or implemented features.
8. Finish with changed files, key behavior, manual verification instructions, remaining issues and any changes needed to shared contracts.

## Architectural boundaries
- UI calls typed feature services; it does not access persistence directly. Supabase PostgreSQL is the sole persistent application database; no IndexedDB, other browser database, localStorage application persistence, durable offline queue, or automatic synchronization is permitted.
- Timer is driven by a monotonic clock and explicit state machine, not render intervals.
- Scramble generation is asynchronous and preserves the scramble tied to an active solve.
- Supabase Auth and owner-scoped RLS govern future cloud access; failed writes are transient in tab memory only and visibly unsaved.
- Camera/vision/model processing must not block the timer; use workers when practical.
- Training and browser inference must use identical feature ordering, normalization and label definitions.
- Analysis is a versioned derived artifact, not a replacement for the original solve/recording.

## Definition of done
Assigned acceptance tests pass; relevant cross-module contracts remain compatible; user-visible errors are handled; data survives reloads where required; documentation and test results are updated. Optional modules are not required for the MVP unless explicitly assigned.

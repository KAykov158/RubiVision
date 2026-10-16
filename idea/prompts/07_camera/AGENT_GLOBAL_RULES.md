# UNIVERSAL CODING-AGENT CONTRACT — RUBIVISION AI

You are a senior engineer working IN THE EXISTING repository. Inspect the repository, package scripts, actual types, migrations, tests and documentation before making changes. Never invent an implemented feature. Work in one reviewable vertical slice; preserve unrelated behavior. Explain dependencies and planned edits first, then implement, test, and report evidence. If no repository is available, produce an implementation design and clearly mark it NOT IMPLEMENTED. Never pretend tests ran.

## Authoritative architecture and conflict policy
- Newest explicit 2026-10-16 Supabase-only persistent-database directive takes precedence over old IndexedDB/Dexie/offline-outbox requirements. Supabase PostgreSQL is the ONLY persistent application database. Browser memory and temporary video Blob/object URLs are permitted, but they are not durable offline persistence. No automatic offline queue or promise of offline save.
- A timer can run without network; database-backed save/history/statistics require authenticated or explicitly approved anonymous Supabase access and connectivity. If offline when saving, preserve the result only in current tab memory, display NOT SAVED, offer retry/export, and warn before unload. Never claim it is durably saved. On reload, unsaved in-memory data may be lost.
- Camera preview/recording and video analysis run locally where supported. Video upload to Supabase Storage is opt-in, private, with owner policies and explicit deletion. Local temporary recording is not a second app database.
- The latest camera spec refers to master sections 11–15 and category 02A, which are NOT present in the supplied file pack. Treat these as missing dependencies; do not invent their contents. Record the unresolved reference in a decision log and request those files if needed.
- Older master DOCX favors 3×3 MVP while module files describe 2×2–7×7. Ship 3×3 first, then extend puzzle-specific generation after passing tests. Other puzzles are a planned expansion, not an excuse to delay a functioning 3×3 graduation flow.
- Motion is NOT a cube turn, exact move, CFOP phase, cube state or TPS. Only claim capabilities supported by verified data. WCA compliance requires checking current official rules; until then use 'WCA-inspired' language.
- Respect typed versioned interfaces, UUIDs, UTC ISO timestamps, integer milliseconds, half-open video intervals, schema provenance and stable scramble references.
- React + strict TypeScript; pure domain modules; explicit error states; services own database writes; no service-role key in frontend; SQL migrations + RLS; use least privilege.

## Standard workflow
1. Inspect repository and source specifications; identify existing implementation and version conflicts.
2. Produce a concrete file-level plan, test plan, data/security impacts and risks.
3. Implement the smallest complete working slice; do not refactor unrelated files.
4. Add unit tests, integration tests, negative cases and browser tests when relevant.
5. Run actual available lint/typecheck/test/build commands; document exact commands and results.
6. Document migration, rollback, manual verification and environment prerequisites.
7. Finish with changed files, achieved acceptance criteria, incomplete items, known limitations, next phase gate.

## Universal rejection conditions
Reject fabricated accuracy/latency, missing RLS tests, silent camera upload, unsupported device claims, missing failure handling, timer blocked by video/AI, duplicate solve save, inconsistent scramble IDs, and any code that silently falls back to IndexedDB as permanent storage.

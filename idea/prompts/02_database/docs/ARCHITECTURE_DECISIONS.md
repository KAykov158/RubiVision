# RubiVision AI — Reconciled architecture decisions

## Precedence
The newly provided `02_Supabase_PostgreSQL_Schema.md` explicitly supersedes the legacy IndexedDB/offline-first persistence instructions. Other source documents remain reference material for feature goals, but must not override this storage decision. This is a proposed reconciliation for coding; verify with project owner before destructive migrations.

## Persistent storage
- Supabase PostgreSQL is the sole persistent application database. Supabase Storage stores uploaded binary video objects; PostgreSQL stores metadata and paths only.
- No IndexedDB, OPFS database, offline outbox, local database migration, or promise of offline saves.
- Timer and scramble can operate without internet in an already-loaded client. Saving requires authentication/connectivity. A failed save can be retried from volatile in-memory state while the page remains open; reload may lose it. Make this explicit.
- Browser temporary media Blob and object URLs are allowed for capture/preview, but are not a durable storage solution.

## Conflicts to reconcile
1. `00_MASTER_INSTRUCTIONS.md`, `00_DATA_CONTRACTS.md`, `04_Solves_Storage.md`, `11_Settings_Import_Export.md`, `12_Optional_Cloud_SmartCube.md`, master DOCX and integration checklist demand offline-first/IndexedDB. Replace with Supabase-only semantics.
2. New schema says Supabase is core, whereas earlier docs call cloud optional. Authentication and database configuration are core to persistent history.
3. Legacy `Penalty` is uppercase; new SQL uses lowercase. Use stable TypeScript domain enum and explicit mapper; avoid accidental mismatches.
4. Legacy `Scramble` uses a separate immutable ID; new schema mentions scramble text in solves. Decide immutable separate `scrambles` table versus snapshot columns; both need exact text, puzzle and generator version. Prefer a snapshot on solves plus immutable generation metadata unless repository already uses a separate entity.
5. Legacy recording has mandatory `blobStorageKey` and `solveId`; new schema permits optional solve and optional uploaded path. Update domain types to reflect draft/imported/unuploaded states.
6. Original MVP focuses on 3×3, while broader topic prompts mention 2×2–7×7. Ship 3×3 reliably first; add supported puzzles incrementally.
7. Legacy WCA inspection thresholds need current regulation verification before any compliance claim.
8. Video movement classification cannot yield verified exact moves, TPS, cube state or CFOP phases. Keep those as separately evaluated optional research.
9. Import/export cannot promise atomic multi-request writes without a trusted transactional RPC or staging mechanism. Implement server-side transaction where needed.
10. Storage uploads and DB writes are not one atomic transaction; design reconciliation for partial failure.

## Core contracts
- Stable UUIDs, UTC timestamptz, integer raw duration milliseconds, controlled penalty enum.
- `effectiveTimeMs = null` for DNF; `rawTimeMs + 2000` for +2; otherwise rawTimeMs.
- Owner-scoped records and owner-consistent foreign keys; RLS for every exposed table and private Storage.
- Analysis intervals use half-open `[startMs,endMs)` and model manifests pin feature ordering, preprocessing and labels.
- Record explicit decisions in repository ADRs before writing migrations; don't silently mutate existing user data.

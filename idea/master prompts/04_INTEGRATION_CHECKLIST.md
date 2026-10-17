> **SUPABASE-ONLY ARCHITECTURE OVERRIDE (2026-10-16).** This file retains earlier requirements for traceability. Any instructions here to use IndexedDB, another browser/local database, localStorage for application persistence, a durable offline write queue, or automatic synchronization are superseded by master documents 11 and 17. Supabase PostgreSQL is the sole persistent application database; Supabase Auth and owner-scoped RLS govern future cloud data. A failed write may remain only in volatile tab memory with an explicit unsaved state. Other requirements remain unless separately superseded.

# Integration checklist

- [ ] All feature modules use stable typed IDs, timestamps, puzzle IDs and schema versions.
- [ ] Timer and scrambles remain operational without camera or AI.
- [ ] Supabase SQL migrations, constraints, and owner-scoped RLS policies are tested; no browser database migrations are used.
- [ ] Recorded video and timer alignment metadata retained.
- [ ] Manual stage labels and model predictions visibly distinguished.
- [ ] Feature extraction and training agree on schema/normalization.
- [ ] Baseline and trained model evaluated on identical held-out data.
- [ ] Browser model failures do not block timer/history.
- [ ] Import/export and deletion cover dependent records/media.
- [ ] Cube engine consumes only verified or clearly estimated moves.
- [ ] Camera tracking reports uncertainty and supports correction.
- [ ] Graduation release passes reproducible tests and documentation gate.

## Cloud-first checklist additions

- [ ] Supabase dev/prod environment and versioned migrations exist.
- [ ] Auth lifecycle and user isolation verified.
- [ ] Every private table and Storage bucket has tested RLS; cross-owner FK rejected.
- [ ] Confirmed Supabase saves are distinguished from failed or unavailable saves; failed writes are not queued for automatic retry.
- [ ] UI displays saving/saved/unsaved states honestly; any retained failed-write data is volatile tab memory only.
- [ ] Secrets excluded from frontend/git; types generated from schema.
- [ ] Export/import and graduation demo fallback tested; offline demo behavior does not imply persistent local writes or synchronization.

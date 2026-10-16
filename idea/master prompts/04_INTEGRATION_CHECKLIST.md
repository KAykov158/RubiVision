> **CLOUD-FIRST ADDITIVE REVISION (2026-10-16).** This original specification is preserved in full for traceability. Where it describes IndexedDB as the authoritative database, local-only accounts, optional/future cloud, or cloud synchronization postponed until after graduation, those statements are superseded by `master prompts/11_CLOUD_FIRST_DECISION_AND_OVERRIDES.md`. **Supabase PostgreSQL + Auth are required from category 02; IndexedDB is a resilience cache/outbox, not the authoritative store.** No other requirements are removed. Read the cloud addendum and the original content together.

# Integration checklist

- [ ] All feature modules use stable typed IDs, timestamps, puzzle IDs and schema versions.
- [ ] Timer and scrambles remain operational without camera or AI.
- [ ] IndexedDB transactions and migrations tested.
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
- [ ] IndexedDB outbox handles offline solves, retries, duplicate prevention and account switches.
- [ ] UI displays pending/synced/failed/unsaved states.
- [ ] Secrets excluded from frontend/git; types generated from schema.
- [ ] Export/import and graduation demo fallback tested.

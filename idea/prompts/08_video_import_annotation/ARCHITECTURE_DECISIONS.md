# Architecture decisions and reconciliation

## ADR-001 Persistent database
Supabase PostgreSQL is the sole durable application database under the 2026-10-16 override. The older IndexedDB and local-offline-outbox requirements are superseded. Avoid using localStorage for persisted application data. Browser memory is ephemeral. Clearly communicate unsaved solves during disconnection and offer explicit retry while the page remains open, without claiming durability after reload.

## ADR-002 Authentication and authorization
Prefer Supabase Auth and `auth.uid()` owner checks; design explicit owner_id foreign keys, RLS policies for SELECT/INSERT/UPDATE/DELETE and negative cross-user tests. Document guest mode as an unresolved product decision; do not pretend guest solves persist anonymously without a defined owner/security policy.

## ADR-003 Raw media
Raw local videos are private and not automatically uploaded. Local file input and object URLs are temporary references. Supabase stores metadata/annotation records where authorized. If a different device has metadata but no local video, show 'media unavailable on this device' and allow explicit relinking. Optional Supabase Storage archiving requires separate opt-in and owner-scoped access.

## ADR-004 Time semantics
All stored times in integer milliseconds. Use monotonic performance clock for live timing and wall-clock UTC timestamps for event dates. Imported video offset may be UNKNOWN; do not default it to zero and call it synchronized.

## ADR-005 ML provenance
Model manifests pin feature order, units, preprocessing, label mappings, window policy, normalization and model version. Store manual annotations separately from derived predictions and preserve raw outputs when smoothing.

## ADR-006 Delivery
Core graduation build requires a reproducible measured movement/pause/uncertain experiment. Experimental scanner, exact move tracking, CFOP auto detection and smart-cube adapters must not block it.

## Unresolved decisions for first audit
- Actual repository stack and installed versions.
- Missing referenced master 11–15 and 02A.
- Supabase Auth guest policy and deployment environment.
- SQL migration tooling and local Supabase test availability.
- Whether video metadata may exist without a solve link.
- Session deletion cascade vs restrict; decide and test.
- Maximum import size, accepted codecs, annotation minimum pause threshold and export version.
- WCA regulation version and library compatibility, to verify before claims.

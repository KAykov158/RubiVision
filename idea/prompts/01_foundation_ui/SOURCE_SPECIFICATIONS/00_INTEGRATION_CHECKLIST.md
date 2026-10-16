> **SUPABASE-ONLY ARCHITECTURE OVERRIDE (2026-10-16).** This Foundation source pack preserves older requirements for traceability. Any requirement below that calls for IndexedDB, another browser/local database, localStorage application persistence, durable offline writes, or automatic synchronization is superseded by master documents 11 and 17. Supabase PostgreSQL is the sole persistent application database; Supabase Auth and owner-scoped RLS apply to future cloud access. A failed write may remain only in volatile tab memory and must be explicitly unsaved. Domain contracts and non-storage product requirements remain unless separately superseded.

# RubiVision AI — Cross-Module Integration Checklist

Mark each item only after running the specified verification. Record date, commit, environment, outcome and any failing test. Do not claim success based on code inspection alone.

## Foundation and shared contracts
- [ ] `00_DATA_CONTRACTS.md` agrees with implemented types, repository schema and import/export schemas.
- [ ] Typecheck, lint, unit tests and production build run; failures documented.
- [ ] App routes work on desktop and mobile without destroying timer state.

## Timer, scramble, solve and statistics
- [ ] Space/touch hold -> ready -> release -> running -> stop works; duplicate/auto-repeat input ignored.
- [ ] Elapsed time uses a monotonic clock; tab switches do not reset or mismeasure it.
- [ ] Inspection thresholds, +2 and DNF boundaries are tested.
- [ ] Every saved solve references the exact displayed scramble and puzzle; scramble does not change mid-solve.
- [ ] Stopping once creates one solve, even with repeated events or reload edge cases.
- [ ] Session CRUD, penalty edits and deletion policies preserve referential integrity.
- [ ] Authenticated Supabase reads return acknowledged saved solves after reload; SQL migration and RLS behavior are tested, and failed saves remain visibly unsaved without a durable retry queue.
- [ ] Mean, ao5/ao12/ao50/ao100 and DNF treatment match verified fixtures; statistics update after edits.

## Camera, vision, model and analysis
- [ ] Denied camera permission leaves timer/history fully usable.
- [ ] Recording starts/stops reliably, plays back and links to the correct solve; tracks are released.
- [ ] Recording and timer start offsets are persisted and tested.
- [ ] Frame features use video timestamps, handle variable frame rates, and report missing/poor-quality frames.
- [ ] Motion/hand feature schema exactly matches the exported model manifest.
- [ ] Dataset labels, participant/session splits, random seeds and training scripts are reproducible.
- [ ] Baseline and trained model evaluated on the same held-out test set; metrics reflect actual runs.
- [ ] Uncertain predictions and low-confidence analysis are displayed rather than concealed.
- [ ] Timeline segments align with video seeking and remain valid after smoothing.
- [ ] AI processing failure never loses the original solve or recording.

## Privacy, data portability and optional features
- [ ] Recording permission, consented Supabase Storage behavior (if implemented), retention, and deletion are explained; no browser database persistence is implied.
- [ ] CSV/JSON exports contain required data; JSON import round-trip preserves IDs and relationships.
- [ ] Malformed imports fail safely without partial writes.
- [ ] Supabase access is owner-scoped through Auth and RLS; timer measurement never blocks on network, and failed writes are transient, unsaved, and never synchronized automatically.
- [ ] Optional smart cube and scanner/solver show unsupported-device/state errors honestly.

## Release and graduation demonstration
- [ ] Clean install instructions work on a fresh machine.
- [ ] Demo: select puzzle -> scramble -> time -> save -> history -> statistics -> recording -> AI timeline.
- [ ] Real evaluation report includes confusion matrix, per-class F1, macro F1, latency, failure cases and baseline comparison, or explicitly states why unavailable.
- [ ] Known limitations, privacy, technology choices, architecture and future work are documented.
- [ ] No UI claims exact cube moves or CFOP phases based solely on motion classification.

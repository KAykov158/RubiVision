# RubiVision AI acceptance and evidence matrix

Mark PASS only with date, commit, environment, command, and output evidence.

| Phase | Critical evidence | Status |
|---|---|---|
| 01 Repository audit and architecture | Audit must contain verified commands and files, dependency map, unresolved decisions, concrete phase gates, no source modifications unless needed for diagnostics. | NOT TESTED |
| 02 Project foundation and responsive UI | Navigation works on narrow/wide screens, accessibility keyboard tests, timer does not reset when switching routes, build passes. | NOT TESTED |
| 03 Supabase authentication and database security | Automated RLS tests prove user A cannot read/write user B data; unauthenticated requests denied; migrations replay cleanly; auth failures visible. | NOT TESTED |
| 04 Timer and inspection engine | Fake clock transition tests, exact boundary tests, duplicate-event tests, tab visibility tests and user demonstration. | NOT TESTED |
| 05 Scrambles and puzzle visualization | Scramble uniqueness and validity fixtures, inverse-state tests for supported puzzles, rapid regeneration race tests, frozen scramble saved with solve. | NOT TESTED |
| 06 Solve sessions and history | Exactly-once integration test, rejected write UX, reload verified persisted data, RLS isolation, edits update downstream statistics. | NOT TESTED |
| 07 Statistics and performance dashboard | Golden vectors, 0/1/multiple DNF windows, penalty-edit invalidation, filtered results, pagination consistency and accessibility checks. | NOT TESTED |
| 08 Camera recording and video import | Permission denied, missing camera, unsupported codec, corrupted import, offset alignment, storage failures, track cleanup, video remains private. | NOT TESTED |
| 09 Deterministic video feature extraction | Synthetic static/motion fixtures, deterministic output, exact feature order, missing hands, zero frames, short clips, cancellation and progress tests. | NOT TESTED |
| 10 Dataset collection and labeling | Validation rejects overlaps and out-of-range labels; provenance recorded; no private videos in public repo; example manifest and labeling demo. | NOT TESTED |
| 11 Baseline, model training and evaluation | Reproducible run scripts, leakage assertion, frozen test evaluation, baseline comparison, manifest validation, metrics populated only from real runs. | NOT TESTED |
| 12 Browser AI inference and timeline | Model mismatch, missing model, zero predictions, overlapping windows, short pauses, video seeking, rerun provenance, RLS denial and performance tests. | NOT TESTED |
| 13 Settings, export and safe import | Round-trip test, invalid/oversized/duplicate import, malicious ownership field, atomic rollback, settings reset and download verification. | NOT TESTED |
| 14 Security, privacy, performance and accessibility hardening | Security negative tests and performance measurements documented, high-severity issues closed, no hardcoded secrets. | NOT TESTED |
| 15 Integration testing, CI and graduation demonstration | Fresh machine run, migration replay, end-to-end happy path, failure demos, honest metric report, unresolved limitations explicitly documented. | NOT TESTED |
| 16 Optional 3x3 scanner and solver | Impossible state rejection, orientation ambiguity, lighting warnings, verified solution replay, no claims of CFOP or video turn tracking. | NOT TESTED |
| 17 Optional smart cube and research-grade move tracking | Per-turn confusion matrix, state accuracy over time, failure taxonomy, independent held-out test and honest feasibility go/no-go. | NOT TESTED |
| 18 Final audit and release decision | Evidence-backed audit, no fabricated passes, critical security/data-loss issues block release. | NOT TESTED |

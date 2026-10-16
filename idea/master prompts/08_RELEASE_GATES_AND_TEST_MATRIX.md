> **SUPABASE-ONLY ARCHITECTURE OVERRIDE (2026-10-16).** This file retains earlier requirements for traceability. Any instructions here to use IndexedDB, another browser/local database, localStorage for application persistence, a durable offline write queue, or automatic synchronization are superseded by master documents 11 and 17. Supabase PostgreSQL is the sole persistent application database; Supabase Auth and owner-scoped RLS govern future cloud data. A failed write may remain only in volatile tab memory with an explicit unsaved state. Other requirements remain unless separately superseded.

# Release gates and regression matrix

## Graduation gates
**A. Product core (01–06):** puzzle-specific scramble, accurate timer, confirmed Supabase save/readback, sessions, penalties, statistics, SQL migrations and backup proof.

**B. Video and dataset (07–10):** record/import, synchronization, manual labels, feature extraction, consent and leakage-safe split.

**C. AI and defense (11–16):** browser inference, uncertainty timeline, stage annotations, trained-vs-baseline metrics, reproducible experiment, accessibility, offline timer demonstration with explicit unsaved status, and documentation.

**D. Post-graduation bridge (17–18):** verified move entry, legal cube-state transitions and algorithm library.

**E. Ultimate research (19–26):** measured turn recognition, recovery, method segmentation, coaching and real-time performance.

**F. Optional (27–29):** scanning, smartcube/cloud, daily challenges.

## Core regression matrix

| Change | Always check | Additional checks |
|---|---|---|
| Timer | State transitions, exactly-once save, raw milliseconds | Inspection thresholds, keyboard/touch, focus, recording anchors |
| Puzzles | Puzzle IDs and scramble association | All 222–777 notation, generator validity |
| Database | SQL migration, authenticated read/write, import/export | RLS isolation, media deletion, referential integrity, failed-write unsaved state |
| Statistics | DNF/+2 and small sample sizes | ao5/ao12, session filtering |
| Video | No accidental upload, media cleanup | Codec, sync offset/drift, denied permission |
| ML | Manifest, feature/model version | Leakage-safe split, baseline parity, uncertainty, latency |
| Future moves | Source provenance, legal state transitions | Whole-solve reconstruction and error recovery |

## Definition of done
A feature is done only when documented acceptance behavior, failure behavior, integration contracts, tests, actual check results, and a manual demo are recorded. Future-goal research can be marked experimental, but never silently promoted to graduation-ready.

## Cloud-first mandatory release gates

Before category 03: Auth, SQL migrations, RLS, typed Supabase repositories, confirmed cloud CRUD and multi-user isolation pass tests (category 02A). No browser database or durable offline outbox is part of the gate. A connectivity failure must leave a visible unsaved state; no automatic retry/sync is performed. Before graduation release: cross-device restore through Supabase, multi-user isolation, outage messaging/recovery, secrets check, export/import and cloud deployment documentation pass. Original AI/functional gates are unchanged.

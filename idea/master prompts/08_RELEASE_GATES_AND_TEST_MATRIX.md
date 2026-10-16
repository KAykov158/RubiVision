> **CLOUD-FIRST ADDITIVE REVISION (2026-10-16).** This original specification is preserved in full for traceability. Where it describes IndexedDB as the authoritative database, local-only accounts, optional/future cloud, or cloud synchronization postponed until after graduation, those statements are superseded by `master prompts/11_CLOUD_FIRST_DECISION_AND_OVERRIDES.md`. **Supabase PostgreSQL + Auth are required from category 02; IndexedDB is a resilience cache/outbox, not the authoritative store.** No other requirements are removed. Read the cloud addendum and the original content together.

# Release gates and regression matrix

## Graduation gates
**A. Product core (01–06):** puzzle-specific scramble, accurate timer, save/reload, sessions, penalties, statistics, migrations and backup proof.

**B. Video and dataset (07–10):** record/import, synchronization, manual labels, feature extraction, consent and leakage-safe split.

**C. AI and defense (11–16):** browser inference, uncertainty timeline, stage annotations, trained-vs-baseline metrics, reproducible experiment, accessibility, offline demo and documentation.

**D. Post-graduation bridge (17–18):** verified move entry, legal cube-state transitions and algorithm library.

**E. Ultimate research (19–26):** measured turn recognition, recovery, method segmentation, coaching and real-time performance.

**F. Optional (27–29):** scanning, smartcube/cloud, daily challenges.

## Core regression matrix

| Change | Always check | Additional checks |
|---|---|---|
| Timer | State transitions, exactly-once save, raw milliseconds | Inspection thresholds, keyboard/touch, focus, recording anchors |
| Puzzles | Puzzle IDs and scramble association | All 222–777 notation, generator validity |
| Database | Migration, reload, import/export | Quota, media deletion, referential integrity |
| Statistics | DNF/+2 and small sample sizes | ao5/ao12, session filtering |
| Video | No accidental upload, media cleanup | Codec, sync offset/drift, denied permission |
| ML | Manifest, feature/model version | Leakage-safe split, baseline parity, uncertainty, latency |
| Future moves | Source provenance, legal state transitions | Whole-solve reconstruction and error recovery |

## Definition of done
A feature is done only when documented acceptance behavior, failure behavior, integration contracts, tests, actual check results, and a manual demo are recorded. Future-goal research can be marked experimental, but never silently promoted to graduation-ready.

## Cloud-first mandatory release gates

Before category 03: Auth, SQL migrations, RLS, typed cloud repositories, durable local outbox and offline retry pass tests (category 02A). Before graduation release: cross-device restore, multi-user isolation, outage recovery, secrets check, export/import and cloud deployment documentation pass. Original AI/functional gates are unchanged.

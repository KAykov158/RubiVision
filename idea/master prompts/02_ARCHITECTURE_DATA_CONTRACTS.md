> **CLOUD-FIRST ADDITIVE REVISION (2026-10-16).** This original specification is preserved in full for traceability. Where it describes IndexedDB as the authoritative database, local-only accounts, optional/future cloud, or cloud synchronization postponed until after graduation, those statements are superseded by `master prompts/11_CLOUD_FIRST_DECISION_AND_OVERRIDES.md`. **Supabase PostgreSQL + Auth are required from category 02; IndexedDB is a resilience cache/outbox, not the authoritative store.** No other requirements are removed. Read the cloud addendum and the original content together.

# Architecture and data contracts

React/TypeScript responsive web app with feature services; IndexedDB repositories for structured offline data; local video blob/OPFS adapter; high-resolution timer state machine; event-specific scramble provider; video decoder/feature extraction worker; Python training pipeline; exported model and feature contract; local inference adapter; versioned analysis timeline. Advanced cube engine and turn-recognition services are independent adapters.

## Shared data and evidence rules
- UUID IDs; puzzle codes 222/333/444/555/666/777; UTC timestamps; millisecond durations.
- Distinguish `source=manual`, `source=model`, `source=verified-moves`, `source=smartcube` and `source=camera-estimate`.
- Store immutable original solve/video and versioned derived analyses; schema migrations preserve existing data.
- Model results need dataset manifest, consent, held-out evaluation and reproducible metrics.
- Camera permission only through user action; no silent upload; offline-first functionality.

## Suggested logical entities
`Puzzle`, `Scramble`, `Session`, `Solve`, `TimerSettings`, `Recording`, `MediaAsset`, `VideoAnnotation`, `StageAnnotation`, `FeatureSet`, `DatasetManifest`, `ModelArtifact`, `AnalysisRun`, `VerifiedMoveEvent`, `CubeStateSnapshot`, `Algorithm`, `DailyChallenge`, `Achievement`. Store version, provenance and relationships explicitly.

## Cloud-first authoritative contracts

Supabase PostgreSQL is the primary structured data source; Supabase Auth provides user identity; owner-scoped RLS, versioned migrations, stable UUIDs and generated types are mandatory. IndexedDB is the durable local outbox/cache; videos stay local unless explicitly uploaded. Services/repositories own persistence; timer never waits on network. See documents 11–15.

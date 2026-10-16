> **SUPABASE-ONLY ARCHITECTURE OVERRIDE (2026-10-16).** This file retains earlier requirements for traceability. Any instructions here to use IndexedDB, another browser/local database, localStorage for application persistence, a durable offline write queue, or automatic synchronization are superseded by master documents 11 and 17. Supabase PostgreSQL is the sole persistent application database; Supabase Auth and owner-scoped RLS govern future cloud data. A failed write may remain only in volatile tab memory with an explicit unsaved state. Other requirements remain unless separately superseded.

# Architecture and data contracts

React/TypeScript responsive web app with typed feature services; Supabase PostgreSQL repositories for persistent application data; consented media storage only through an approved Supabase Storage integration; high-resolution timer state machine; event-specific scramble provider; video decoder/feature extraction worker; Python training pipeline; exported model and feature contract; inference adapter; versioned analysis timeline. Advanced cube engine and turn-recognition services are independent adapters. The following original architecture wording is historical wherever it conflicts with the Supabase-only override above.

## Shared data and evidence rules
- UUID IDs; puzzle codes 222/333/444/555/666/777; UTC timestamps; millisecond durations.
- Distinguish `source=manual`, `source=model`, `source=verified-moves`, `source=smartcube` and `source=camera-estimate`.
- Store immutable original solve/video and versioned derived analyses; schema migrations preserve existing data.
- Model results need dataset manifest, consent, held-out evaluation and reproducible metrics.
- Camera permission only through user action; no silent upload. Timer measurement may continue without connectivity, but failed persistent writes are not queued and must be reported as unsaved.

## Suggested logical entities
`Puzzle`, `Scramble`, `Session`, `Solve`, `TimerSettings`, `Recording`, `MediaAsset`, `VideoAnnotation`, `StageAnnotation`, `FeatureSet`, `DatasetManifest`, `ModelArtifact`, `AnalysisRun`, `VerifiedMoveEvent`, `CubeStateSnapshot`, `Algorithm`, `DailyChallenge`, `Achievement`. Store version, provenance and relationships explicitly.

## Cloud-first authoritative contracts

Supabase PostgreSQL is the sole persistent application database; Supabase Auth provides user identity; owner-scoped RLS, versioned migrations, stable UUIDs and generated types are mandatory. No IndexedDB, other browser database, localStorage application persistence, durable offline outbox, or automatic synchronization is permitted. Services/repositories own Supabase persistence; timer measurement never waits on network. A failed write may remain in volatile tab memory only and must be visibly marked unsaved. Media is not persisted unless a later approved feature integrates consented Supabase Storage. See documents 11–17.

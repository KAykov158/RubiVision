# 02 — Supabase PostgreSQL Database Schema and Data Contracts

**Phase:** Graduation; implement after Foundation and before 02A. **Storage decision:** Supabase PostgreSQL is the only persistent application database. No IndexedDB, OPFS database, browser sync outbox, local database migrations or offline-save guarantee.

## Scope
Design and implement version-controlled SQL migrations for Supabase PostgreSQL; consistent domain types and data access contracts for all modules. This category defines schema; category 02A configures Auth, policies and frontend integration.

## Required tables and relationships
- `profiles`: `id uuid primary key references auth.users(id) on delete cascade`, display preferences, timestamps. Never store passwords.
- `user_settings`: one row per account, theme, timer preferences, puzzle preferences, versioned JSON settings where justified.
- `sessions`: UUID primary key, owner UUID, puzzle/event, name, created/updated timestamps, archived status.
- `solves`: UUID primary key, owner UUID, session UUID, puzzle/event, scramble text, raw duration in integer milliseconds, penalty enum (`none`, `plus2`, `dnf`), inspection metadata, optional notes, created/updated timestamps; constraints for valid durations and owner-consistent session references.
- `recordings`: metadata only (owner, optional solve, duration, mime, size, storage path when uploaded, consent and deletion status); do not place video bytes in PostgreSQL.
- `annotations`, `analysis_runs`, `model_versions`, `dataset_metadata`, `experiment_runs`: owner-scoped metadata, source links, version identifiers and reproducibility fields. Keep sensitive media and raw research assets separate.
- Future-ready migrations for verified move sequences, algorithms, challenge submissions and achievements only when their category begins; do not create unused complex tables prematurely.

## SQL conventions
1. Use Supabase CLI migrations under `supabase/migrations/`; committed to Git. No manual production-only changes.
2. UUIDs for stable IDs, `timestamptz` for UTC instants, integer milliseconds for time measurements; explicit puzzle/event identifiers.
3. Foreign keys, uniqueness, `CHECK` constraints, indexes on `(owner_id, created_at)` and `(owner_id, session_id, created_at)` as appropriate.
4. Use owner-consistent composite foreign keys or trusted server-side checks to prevent cross-account references.
5. Decide delete cascade/retention for each relation; avoid silent deletion of research evidence.
6. Treat SQL schema as source of truth; generate Supabase TypeScript database types, then map to stable domain models through typed repositories.
7. Avoid storing user secrets, API service-role keys, or raw private recordings in tables.

## Acceptance criteria
- Clean Supabase project applies every migration in order.
- Fresh user can create profile, session and solve; constraints reject invalid duration, penalty and cross-user foreign keys.
- Schema migration and rollback/recovery plan documented; generated types compile.
- Cloud schema is sufficient for timer, history, statistics, annotations, experiments and exports without local database implementation.

## Dependencies
01 Foundation; followed by 02A Supabase integration, then 03 puzzles and 04 timer.

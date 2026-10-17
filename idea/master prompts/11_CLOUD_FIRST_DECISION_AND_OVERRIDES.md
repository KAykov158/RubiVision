# 11 — Supabase-only Architecture Decision and Precedence

**Decision (2026-10-16):** Supabase PostgreSQL is RubiVision AI's **only persistent application database** from the start. Supabase Auth is required. Optional Supabase Storage handles explicitly uploaded media. No IndexedDB database, no local database schema, no offline outbox or automatic offline synchronization.

## Precedence
This file, updated category 02, category 02A and `master prompts/17_SUPABASE_ONLY_IMPLEMENTATION_GUIDE.md` override **only contradictory storage, authentication, sync and deployment statements** in earlier historical project descriptions. All original non-storage features, research boundaries, graduation evidence requirements, UI functionality and future categories remain intact. Any older sentence describing IndexedDB as required or local-first persistence is **historical and not an implementation instruction**.

## Offline limitation
The timer can operate offline, but reliable persistence requires network access. Show cloud save status; never call an unsaved solve saved. Keep failed results in transient memory for retry/copy while tab remains open. User explicitly accepts potential loss on refresh/closure during outage.

## GitHub
Store source, docs, SQL migrations and non-sensitive fixtures in GitHub. Never store user solves, passwords, private videos or live environment secrets there.

## Category sequence
01 Foundation → 02 Supabase PostgreSQL schema → 02A Supabase Auth/RLS/integration → 03 scrambles → 04 timer → 05 sessions → 06 statistics → remaining categories.

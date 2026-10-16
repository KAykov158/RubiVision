# 17 — Supabase-only Implementation Guide (New)

## Firm design choice
The application uses **Supabase PostgreSQL as its sole persistent database**. Supabase Auth handles identity. There is **no IndexedDB schema, offline outbox, local repository, local schema migration or automatic sync worker**. Users need an internet connection to save reliably; timer itself can measure offline.

## Setup checklist
1. Create development Supabase project and configure local Supabase CLI environment.
2. Commit `.env.example` listing `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (or supported anon key) without real secrets.
3. Implement versioned SQL migrations in `supabase/migrations` and generate TypeScript DB types.
4. Build auth UI and session handling, then typed cloud repositories.
5. Enable/test RLS and cross-account foreign-key ownership.
6. Integrate timer with save-status UI and idempotent retry.
7. Verify login from a second device retrieves the same solves.
8. Keep JSON backup/export and documented cloud recovery procedures.
9. Add optional Supabase Storage only after privacy, upload consent and RLS/storage policy review.
10. Keep Python AI training/evaluation workflow, baseline metrics and graduation evidence unchanged.

## Risks accepted
- Offline saves are not durable; app must communicate failure and offer immediate copy/export.
- Cloud outages and quotas affect saving and retrieval.
- RLS and auth add implementation complexity; tests must be part of acceptance gates.

## Category map
01 Foundation; 02 Supabase schema; 02A Supabase Auth/integration; 03 puzzles; 04 timer; 05 sessions; 06 stats; 07 camera; 08 annotation; 09 CV features; 10 AI dataset/training; 11 inference; 12 insights; 13 experiments; 14 settings/export/privacy; 15 quality/security; 16 graduation release; 17–18 verified moves and algorithms; 19–26 advanced vision/optimization/coaching; 27–29 optional scanner/smart cube/challenges.

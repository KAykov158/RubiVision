# Category 02 database foundation

Status: **implemented as SQL and tests; local PostgreSQL execution and generated types pending**. The Supabase CLI and Docker were not found on `PATH` during this session. No hosted project was linked or changed.

## Scope and source of truth

`supabase/migrations/` is the schema source of truth. `20261017000100_core_history.sql` creates profiles, settings, sessions, immutable scrambles, and solves. `20261017000200_media_research_metadata.sql` adds recording metadata, annotations, analysis runs and segments, model versions, dataset metadata, and experiment runs. Binary video, model weights, raw datasets, scanner records, challenges, and algorithms are outside this schema. No application data is stored in browser storage.

The stable TypeScript domain contracts remain in `apps/web/src/shared/domain/contracts.ts`. SQL penalties use `none`, `plus2`, and `dnf`; a later repository adapter must map these explicitly to `NONE`, `PLUS_TWO`, and `DNF`. SQL timing sources and puzzle IDs use the canonical domain spelling. `raw_time_ms` is nonnegative `integer`; the largest supported raw interval is 2,147,483,647 ms. Effective time is derived in the domain: DNF is `null`, plus-two adds 2,000 ms, and none uses the raw duration. It is not stored in PostgreSQL.

All IDs are UUIDs. Instants use `timestamptz`, which represents an absolute instant; adapters must emit ISO 8601 UTC strings. Creation timestamps default to the database clock, and update triggers advance `updated_at`. Session and scramble puzzle values cannot change. A scramble row cannot be updated, and a solve's captured time, session, scramble, puzzle, timing source, inspection, and timestamps cannot change. Only penalty and notes are editable on a solve. A recording may acquire a solve link once if created as a draft, but cannot change it afterward; captured recording metadata is immutable.

Recording rows contain consent, upload, and deletion timestamps plus an owner-prefixed Storage path. These columns record an upload decision; the database cannot prove that a person consented. The future upload flow must request explicit consent and use 02A Storage policies.

## Relationships and deletion

Every owner ID references `auth.users`. Composite foreign keys bind a solve to a session and scramble of the **same owner and puzzle**. A scramble ID may back at most one solve. Recordings bind to an owned solve; analyses bind to the exact solve linked to their owned recording. Annotations, analysis segments, model references, datasets, and experiments likewise use owner-consistent foreign keys. Analysis segments are half-open ranges within their recording and cannot overlap within a run.

Foreign keys restrict deletion of referenced sessions, scrambles, solves, recordings, model versions, and datasets. Deleting a session with solves fails. The application must offer an explicit compatible reassignment or explicit solve deletion before removing a session. Account deletion is not yet implemented: after owned content exists, an ordered, transactional purge must run before removing the `auth.users` row. The 02A design must include that operation; deleting Auth users directly will be blocked by owned content.

Indexes cover `(owner_id, created_at desc, id)` for owner timelines; `(owner_id, session_id, created_at desc, id)` for solve history; `(owner_id, recording_id, start_ms, id)` for annotations; and owner plus source IDs for analysis, datasets, and experiments. Unique constraints support composite references and reject a second solve for one scramble. `btree_gist` enforces nonoverlapping analysis intervals.

## Security boundary

Every public user-owned table enables RLS and revokes all table privileges from `PUBLIC`, `anon`, and `authenticated` in its creation migration. Category 02 deliberately adds **no** client policies or grants. Trigger functions reside in a non-exposed `private` schema without client usage grants. This means the current schema cannot serve signed-in application reads or writes. Category 02A must add narrow grants, owner `USING` and `WITH CHECK` policies, Auth provisioning, client adapters, and direct API tests before any cloud use. Never put privileged keys in `VITE_` variables or browser code. Storage bucket policies also belong to 02A before uploads.

## Disposable local verification

Install a [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) compatible with this project and a running Docker-compatible runtime. Run from the repository root:

```text
supabase start
supabase db reset
supabase test db
node scripts/generate-db-types.mjs --write
node scripts/generate-db-types.mjs --check
```

`supabase db reset` above targets **only the disposable local stack** and destroys its data. Never use `--linked` or a remote database URL for these commands. The SQL tests create synthetic Auth users and records inside rolled-back transactions; no production data or media is needed. Run `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd test`, and `npm.cmd run build` from `apps/web` on Windows (or `npm` on other systems). After a fresh local migration and type generation pass, commit the generated `apps/web/src/shared/database/database.types.ts` artifact separately from domain models. The check command must report no drift.

`node scripts/check-db-static.mjs` provides a limited preflight when PostgreSQL is unavailable: it checks table coverage, RLS/revoke statements, and pgTAP assertion counts. It does **not** parse or execute SQL and cannot establish migration or security correctness.

Before a production migration, review a database backup and apply a tested forward-fix migration for changes. Do not treat a remote reset or an untested down migration as recovery. Cloud setup, Auth policies, Storage policies, and deployed verification are reserved for Category 02A and require separate approval.

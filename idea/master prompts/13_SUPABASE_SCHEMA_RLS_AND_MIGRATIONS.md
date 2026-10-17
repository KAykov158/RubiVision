# 13 — Supabase Schema, RLS, Migrations and Type Safety

**Authoritative database:** Supabase PostgreSQL. No local schema.

## Schema design
See `prompts/02_database/02_Supabase_PostgreSQL_Schema.md` for table contracts. Define profile, settings, sessions, solves, recording metadata, annotation, model and experiment metadata with stable UUIDs, UTC timestamps and integer millisecond durations. Add optional/future tables when their feature is implemented.

## RLS
Enable RLS for each user-owned table. Write explicit policies for select, insert, update and delete using authenticated ownership. Validate child-row ownership, not merely the child row's own `owner_id`. Apply Storage policies before allowing uploads. Test unauthorized direct REST queries.

## Migrations
Keep SQL files in `supabase/migrations`, use CLI for local test database and staged deployments. Generate TypeScript types after schema changes. Avoid dashboard-only drift. Document backups and restore verification; managed cloud does not remove the need for export and recovery plans.

## No browser secrets
Only public URL and publishable/anon key in browser. Service-role keys, privileged tokens and any sensitive provider secrets belong server-side only.

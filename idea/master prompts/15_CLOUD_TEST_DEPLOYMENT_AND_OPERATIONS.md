# 15 — Supabase-only Testing, Deployment and Operations

## Required testing
1. SQL migrations apply to clean Supabase environment.
2. Owner can CRUD their data; stranger and anonymous cannot, even via direct API requests.
3. Solve duration/penalty constraints and owner-consistent session FK are enforced.
4. Timer is monotonic and UI responsive while cloud request is pending.
5. Failed saves are visibly unsaved; retry uses same UUID and cannot duplicate records.
6. Signed-in second device loads previously committed solves and settings.
7. Import/export validates schema and ownership; no silent destructive overwrite.
8. Optional Storage upload requires consent and restrictive bucket policies.
9. Browser tests include keyboard/touch accessibility, mobile view and poor network.
10. Graduation demo has a known-good network and test account; prepare a clearly labeled recorded fallback demo if internet fails, not a claim of live cloud persistence.

## Operations
Use separate dev/prod Supabase projects, environment variables, migrations, quota/billing monitoring, database backups/export and documented restore rehearsal. GitHub hosts source and migrations, never user data or secrets.

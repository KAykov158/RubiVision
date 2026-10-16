# 02A — Supabase Integration, Authentication and Security

**Phase:** Graduation, immediately after 02. **Decision:** Supabase-only persistent data. No IndexedDB, offline queue, conflict-resolution sync engine or local database schema.

## Goals
Set up Supabase projects, environment variables, authentication, typed cloud repositories, secure Row Level Security (RLS), storage rules, operational error handling, and reliable cross-device access.

## Implementation requirements
1. Create Supabase dev and production environments; commit `supabase/config.toml`, SQL migrations, `.env.example` and setup instructions, never real credentials.
2. Use Supabase JavaScript client in React with public URL and publishable/anon key; NEVER ship service-role/secret keys to browser.
3. Implement sign-up, sign-in, sign-out, auth session restore, password reset, optional email confirmation, accessible error and loading states.
4. Enable RLS on **every** user-owned table; test SELECT/INSERT/UPDATE/DELETE as owner, stranger and anonymous user. Use `auth.uid()`-based ownership and ownership-consistent relationships.
5. Restrict Storage buckets and policies for explicitly uploaded recordings. Recordings stay on device until the user opts to upload; storage retention and deletion are documented.
6. Implement `SolveRepository`, `SessionRepository`, `SettingsRepository` and later analysis repositories with typed Supabase implementations. UI components must not embed SQL or policy assumptions.
7. Save solves asynchronously after timer stops. Show `Saving`, `Saved`, or `Save failed`; never claim success until Supabase confirms it. On failed save, retain an unsaved record in current app memory while the tab remains open, allow manual retry and copy/export of the unsaved result; **closing/reloading the tab may lose unsaved data**.
8. Network required to reliably persist data. Show an offline warning and disable/mark persistence-dependent operations appropriately; timer may still run without network.
9. Add request retries for transient failures only with idempotent client-generated solve UUIDs, preventing duplicate solves; no background offline synchronization engine.
10. Query cloud records with pagination and filters, handle loading/empty/errors, and calculate user-facing stats from canonical raw durations and penalties.
11. Export/import versioned JSON through explicit user action; validate owner assignment and deduplicate IDs on import.
12. Provide setup steps for Supabase CLI, local testing, deployment environment configuration, and operational troubleshooting.

## Security and testing
- Verify RLS against direct REST requests; UI hiding is not security.
- No credentials in Git; rotate leaked keys and apply least privilege.
- Test different browsers/devices signing into same account and reading identical persisted solves.
- Test 401, 403, 429, timeouts, expired sessions, failed inserts, retries and storage policy denial.
- Distinguish authenticated user records from any public challenge leaderboard views; no private data leak.

## Acceptance criteria
User can register, sign in, save a solve to Supabase, reload on another device and retrieve it. A second account cannot access it. Failed cloud saves are visibly failed, never silently treated as saved. No persistent local application database is created.

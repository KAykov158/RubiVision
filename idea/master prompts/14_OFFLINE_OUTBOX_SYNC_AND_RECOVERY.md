# 14 — Cloud-only Save Failures, Connectivity and Recovery

**This replaces the earlier offline-outbox design. No local database or persistent outbox is required.**

## Required behavior
- Timer measurement uses browser monotonic clock and must not block on the network.
- After stop, present result immediately as `Unsaved` or `Saving`; insert into Supabase asynchronously.
- Only show `Saved` after server acknowledgement.
- For errors (offline, 401, 403, timeout, 429, 5xx), display actionable error, retain pending result **in memory for the current tab only**, offer retry and copy/download JSON of unsaved result.
- Use client-generated UUID and idempotent upsert or conflict-aware insert to prevent duplicate solves when retrying uncertain outcomes.
- If the tab closes or reloads before successful save, the unsaved solve can be lost; communicate this limitation.
- On login expiration, reauthenticate before retrying. Do not associate an unsaved result with the wrong account.
- Never promise offline-first behavior or background sync in docs/UI.

## Tests
Online save, connection interruption, timeout after server commit, retry with same ID, auth expiration, multi-device retrieval, refresh with no pending record, manual JSON export of failed save.

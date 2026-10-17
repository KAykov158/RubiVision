# Binding architecture decisions (proposed; validate with repository)

ADR-001: The newly supplied 02A Supabase-only decision overrides original offline-first IndexedDB instructions in 00_MASTER_INSTRUCTIONS, 00_DATA_CONTRACTS, 04, 11, 12, roadmap, checklist, and DOCX. Persist application data in Supabase only. No offline queue or background sync. A timer works offline, but cloud save does not. Unsaved records are volatile and may be lost on reload.

ADR-002: Supabase Auth, PostgreSQL and restricted Storage are separate concerns. Only public URL and publishable key in client. RLS on all owned tables and cross-table ownership integrity enforced in database. Use private bucket and owner-scoped object paths; uploads require explicit consent. Database row ownership must not be taken from untrusted imported JSON.

ADR-003: Core academic MVP is 3x3 timer + video motion/pause/uncertain analysis with held-out evaluation. 2x2-7x7 scramble/timer support is a compatible expansion requested in module prompts, not a prerequisite for credible AI results. No exact turn/CFOP/TPS claims from optical motion alone.

ADR-004: Browser session persistence provided by Supabase Auth SDK is permitted. Persisted video blobs are not assumed available under Supabase-only metadata rules: by default use in-memory media or user-controlled file download; opt-in Storage upload is separate. Document what happens to videos after tab close.

ADR-005: Distinguish full-history statistics from statistics computed on paginated subsets. Fetch all relevant records through bounded pagination or perform correct server-side aggregate logic; never mislabel a page-only average as a session average.

ADR-006: All import multi-entity writes need a trusted transactional Postgres RPC or equivalent database transaction. Browser-side sequences of inserts are not atomic. Validate schema, deduplicate IDs, map relationships, and bind ownership to auth.uid().

ADR-007: Keep one immutable scramble snapshot per solve. Server-side foreign keys and ownership checks must ensure session, scramble, solve, recording, and analysis belong to same user. Define deletion semantics before migration.

ADR-008: Original specification is a project proposal, not proof of implemented functionality. Only the live repository and executed tests establish completion.

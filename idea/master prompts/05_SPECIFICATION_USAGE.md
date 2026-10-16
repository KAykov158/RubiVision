# Supabase-only Implementation Order — 30 Categories

**Required:** 01 → 02 → 02A → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13 → 14 → 15 → 16. Future: 17–29.

02 now defines PostgreSQL tables, migrations and domain contracts. 02A configures Supabase Auth, RLS and cloud repositories. There is **no local database category** and no persistent offline outbox. Remaining categories preserve their original scope.

**Authoritative docs:** master 11, 12, 13, 14, 15, 17; category 02 and 02A. The original project documentation is preserved as historical context where it discusses local-first storage.

---

## Original content (non-storage features retained; obsolete storage statements overridden)

> **CLOUD-FIRST ADDITIVE REVISION (2026-10-16).** This original specification is preserved in full for traceability. Where it describes IndexedDB as the authoritative database, local-only accounts, optional/future cloud, or cloud synchronization postponed until after graduation, those statements are superseded by `master prompts/11_CLOUD_FIRST_DECISION_AND_OVERRIDES.md`. **Supabase PostgreSQL + Auth are required from category 02; IndexedDB is a resilience cache/outbox, not the authoritative store.** No other requirements are removed. Read the cloud addendum and the original content together.

# How to use this pack

This is a **requirements and documentation pack**, not a pack of ready-made coding prompts. Read `00_COMPLETE_PROJECT_DOCUMENTATION.md`, `01_PROJECT_REGULATIONS.md`, `02_ARCHITECTURE_DATA_CONTRACTS.md` and `03_DEVELOPMENT_ROADMAP.md` first. Each numbered folder under `prompts/` contains one Markdown specification describing purpose, functions, integrations, tests and regulations. When implementation begins, request an OpenCode coding prompt for one numbered module at a time. Preserve the chronological order unless a dependency is deliberately changed.

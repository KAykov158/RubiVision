# Supabase-only Implementation Order — 30 Categories

**Required:** 01 → 02 → 02A → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13 → 14 → 15 → 16. Future: 17–29.

02 now defines PostgreSQL tables, migrations and domain contracts. 02A configures Supabase Auth, RLS and cloud repositories. There is **no local database category** and no persistent offline outbox. Remaining categories preserve their original scope.

**Authoritative docs:** master 11, 12, 13, 14, 15, 17; category 02 and 02A. The original project documentation is preserved as historical context where it discusses local-first storage.

---

## Original content (non-storage features retained; obsolete storage statements overridden)

> **SUPABASE-ONLY ARCHITECTURE OVERRIDE (2026-10-16).** This file retains earlier requirements for traceability. Any instructions here to use IndexedDB, another browser/local database, localStorage for application persistence, a durable offline write queue, or automatic synchronization are superseded by master documents 11 and 17. Supabase PostgreSQL is the sole persistent application database; Supabase Auth and owner-scoped RLS govern future cloud data. A failed write may remain only in volatile tab memory with an explicit unsaved state. Other requirements remain unless separately superseded.

# How to use this pack

This is a **requirements and documentation pack**, not a pack of ready-made coding prompts. Read `00_COMPLETE_PROJECT_DOCUMENTATION.md`, `01_PROJECT_REGULATIONS.md`, `02_ARCHITECTURE_DATA_CONTRACTS.md` and `03_DEVELOPMENT_ROADMAP.md` first. Each numbered folder under `prompts/` contains one Markdown specification describing purpose, functions, integrations, tests and regulations. When implementation begins, request an OpenCode coding prompt for one numbered module at a time. Preserve the chronological order unless a dependency is deliberately changed.

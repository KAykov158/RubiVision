# Supabase-only Implementation Order — 30 Categories

**Required:** 01 → 02 → 02A → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13 → 14 → 15 → 16. Future: 17–29.

02 now defines PostgreSQL tables, migrations and domain contracts. 02A configures Supabase Auth, RLS and cloud repositories. There is **no local database category** and no persistent offline outbox. Remaining categories preserve their original scope.

**Authoritative docs:** master 11, 12, 13, 14, 15, 17; category 02 and 02A. The original project documentation is preserved as historical context where it discusses local-first storage.

---

## Original content (non-storage features retained; obsolete storage statements overridden)

> **CLOUD-FIRST ADDITIVE REVISION (2026-10-16).** This original specification is preserved in full for traceability. Where it describes IndexedDB as the authoritative database, local-only accounts, optional/future cloud, or cloud synchronization postponed until after graduation, those statements are superseded by `master prompts/11_CLOUD_FIRST_DECISION_AND_OVERRIDES.md`. **Supabase PostgreSQL + Auth are required from category 02; IndexedDB is a resilience cache/outbox, not the authoritative store.** No other requirements are removed. Read the cloud addendum and the original content together.

# START HERE — RubiVision AI master specification package

## What this package is
- `master prompts/`: project-wide rules, full documentation, architecture, roadmap, change control, graduation evidence and source references. The folder name is retained for compatibility; these are **shared specifications**, not commands to execute blindly.
- `prompts/01_...` through `prompts/29_...`: one numbered folder per feature category; each contains a detailed **functional specification** with requirements, integrations and acceptance criteria. They are not yet OpenCode implementation prompts.

## Reading order
1. `00_COMPLETE_PROJECT_DOCUMENTATION.md` — entire idea, problems, solutions, architecture and future vision.
2. `01_PROJECT_REGULATIONS.md` — scope, integrity, privacy and quality rules.
3. `02_ARCHITECTURE_DATA_CONTRACTS.md` — stable contracts.
4. `03_DEVELOPMENT_ROADMAP.md` — chronological order.
5. `07_GRADUATION_REQUIREMENTS_AND_EVIDENCE.md` — diploma alignment.
6. `08_RELEASE_GATES_AND_TEST_MATRIX.md` — acceptance gates.
7. `06_CHANGE_CONTROL_AND_FEATURE_EXTENSIONS.md` — adding features later.
8. The relevant numbered feature specification(s).

## Implementation process later
When ready to code, request a **new OpenCode implementation prompt for one category** based on these documents and the actual repository. First have the coding agent inspect and plan; then approve implementation; then test and review; then commit. Avoid asking the agent to implement all 29 categories at once.

## Changing a finished module
Do not start over. Add a versioned change request to its existing spec, check impacted contracts, ask for a scoped plan, implement incrementally, rerun regressions and document the change. See `06_CHANGE_CONTROL_AND_FEATURE_EXTENSIONS.md`.

## Release boundary
01–16 graduation target; 17–18 verified-move bridge; 19–26 ultimate camera-based coaching research; 27–29 optional extensions. This is a proposed scope pending supervisor approval.

## Cloud-first pack navigation (2026-10-16)

Read `11_CLOUD_FIRST_DECISION_AND_OVERRIDES.md` before older specifications. Then `12_CLOUD_ARCHITECTURE_AND_REPOSITORY_BLUEPRINT.md`, `13_SUPABASE_SCHEMA_RLS_AND_MIGRATIONS.md`, `14_OFFLINE_OUTBOX_SYNC_AND_RECOVERY.md`, `15_CLOUD_TEST_DEPLOYMENT_AND_OPERATIONS.md`, and `prompts/02a_supabase_cloud_foundation/02A_Supabase_Auth_RLS_and_Cloud_Operations.md`. The original 29 categories are all retained and a new 02A category is inserted after 02, yielding 30 implementation categories.

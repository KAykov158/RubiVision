# Execution order and gates

1. 00 audit and architecture reconciliation.
2. 01 foundation; 02 Supabase/auth/RLS (can be parallel only if contracts agreed).
3. 03 timer and 04 scrambles.
4. 05 solve persistence; 06 statistics.
5. 07 camera/import; 08 vision features.
6. 09 dataset protocol; 10 baseline and training (real data collection required for performance claims).
7. 11 inference; 13 experiment dashboard.
8. 12 settings and import/export; 16 security audit; 17 end-to-end verification.
9. 14 scanner, 15 smart cube and 18 advanced tracking are optional research/stretch tasks.

Gate policy: A module is COMPLETE only with implementation plus executed tests and manual acceptance evidence. Otherwise label PARTIAL/BLOCKED/NOT STARTED. Do not treat synthetic test metrics as real performance.

## Architectural reconciliation
Older source files describe IndexedDB, offline-first saves, optional Supabase and no-login persistence. The newest explicit 2026-10-16 directive in 13_AI_Experiment_and_Evaluation_Dashboard.md supersedes that persistence model: Supabase PostgreSQL is the sole durable application database. Other referenced master sections 11–15, 17 and category 02A were not supplied in this upload; agent must request/locate them if available and must not pretend to have read them. Camera processing can remain local and unsaved pending UI state is volatile. A decision is still required about whether anonymous authenticated users are supported and how account recovery works.

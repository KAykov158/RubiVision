# RubiVision AI — Deep coding-agent implementation pack

This package is a set of detailed EXECUTION PROMPTS, not an implemented application. It is based on the attached specifications, with focus on Statistics and Progress.

## How to use
1. Extract this ZIP into a folder accessible to your coding agent, preferably alongside the actual repository.
2. Copy `prompts/00_REPOSITORY_AUDIT.md` into your agent and give it repository access.
3. Work through prompts in numeric order. Do not run all prompts as one giant request.
4. After each prompt inspect code changes, tests, migration impact and acceptance report. Commit only when passing.
5. Keep `source_specs/` as reference, not executable instructions that override later decisions.

## Critical precedence
The newly uploaded `06_Statistics_and_Progress.md` explicitly supersedes older IndexedDB/local persistent/offline-outbox requirements. Supabase PostgreSQL is the sole persistent application database. A browser timer can run offline, but durable save cannot be promised. In-memory pending solves can disappear on refresh. Explicitly show unsaved state.

## Missing referenced material
The new specification refers to master sections 11–15 and 17 and category 02A; those documents are not present among the supplied Markdown files. Treat as unresolved dependencies; do not invent their contents. The older DOCX has similarly numbered sections, but must not be assumed to be the newer master.

## Scope and boundaries
The included prompts fully deepen the statistics workstream and its essential database, UI and testing integrations. They do not purport to implement every optional RubiVision feature (advanced cube-state recognition, CFOP reconstruction, smart-cube protocol, etc.).

## Definition of complete
No stage is complete based on code appearance alone. A stage requires executable tests, manual reproduction, documented security/failure paths, updated contracts, and truthful evidence.

## Prompt order

- `00_REPOSITORY_AUDIT.md`: Repository audit and executable plan
- `01_ARCHITECTURE_CONTRACTS.md`: Canonical contracts and architectural decisions
- `02_SUPABASE_SCHEMA_SECURITY.md`: Supabase PostgreSQL schema and security
- `03_SOLVE_QUERY_SERVICE.md`: Canonical solve read service and consistency
- `04_STATISTICS_MATH.md`: Statistics engine mathematical specification
- `05_ROLLING_PR_RECORDS.md`: Rolling averages and personal records
- `06_FILTERS_COMPARISONS.md`: Filtering, time-series and comparisons
- `07_STATISTICS_DASHBOARD.md`: Statistics and progress interface
- `08_MUTATION_INVALIDATION.md`: Edits, deletes, imports and refresh
- `09_PERFORMANCE_SCALING.md`: Performance and large histories
- `10_TESTING_SECURITY.md`: Test suite and security validation
- `11_DOCUMENTATION_RELEASE.md`: Documentation, evidence and release gate
- `12_INTEGRATION_ALL_MODULES.md`: End-to-end integration with RubiVision
- `13_FINAL_AUDIT.md`: Independent final audit and handoff

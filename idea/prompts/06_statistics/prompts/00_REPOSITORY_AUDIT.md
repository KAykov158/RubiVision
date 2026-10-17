# 00_REPOSITORY_AUDIT: Repository audit and executable plan

ROLE: Senior full-stack TypeScript/Supabase engineer and independent tester working inside the EXISTING RubiVision AI repository.

## Assignment
Inventory all folders, dependencies, tests, schema migrations, Supabase project wiring, authentication, statistics UI and existing solve model. Produce docs/implementation-audit.md with a requirement-to-file matrix, gap list, risk ranking, dependency graph, and 10-20 atomic implementation tickets. Do not modify behavior in this stage.

## Required execution sequence
1. Inspect the repository and existing implementation; list verified facts vs assumptions.
2. Read relevant source specs, resolve priority conflicts using the newer Supabase-only directive, and identify missing dependencies.
3. Present an implementation plan naming actual files and APIs, test fixtures, database migrations and rollback risks.
4. Implement the smallest complete vertical slice; preserve unrelated functionality and backwards compatibility.
5. Add unit, integration and/or E2E tests appropriate to this stage, including failure and security paths.
6. Run installed scripts (typecheck, lint, test, build) and report exact commands and outcomes.
7. Update docs/decisions, checklists and next-step handoff.

## Specific completion contract
A reproducible inventory identifies which requirements already work, which are missing, and which require clarification. No implementation claims without evidence.

## Mandatory agent response format
- Repository facts and assumptions
- Design decisions and precedence conflicts
- Implemented behavior and files changed
- Tests added and exact results
- Security/privacy and failure cases
- Manual verification steps
- Open issues and next stage gate


MANDATORY CODING-AGENT RULES
- Inspect the real repository, installed package versions, scripts, tests and database before editing. Never assume proposed files exist.
- Read source_specs/06_Statistics_and_Progress.md, 00_DATA_CONTRACTS.md, 00_MASTER_INSTRUCTIONS.md, 00_PROJECT_ROADMAP.md and 00_INTEGRATION_CHECKLIST.md. These are reference specifications, not evidence of existing code.
- PRECEDENCE: 2026-10-16 Supabase-only directive overrides older IndexedDB, durable offline outbox, offline-first persistence and optional-cloud wording. Supabase PostgreSQL is the sole persistent application database. Timer can function offline but remote saves must visibly fail/pending-in-memory and are not durable across reload. Do not claim offline history is complete.
- Other references to master sections 11-15/17 and category 02A cannot be followed unless those actual documents are supplied. Flag this missing-source gap; do not invent their contents.
- Work in small, reviewable commits; do not rewrite unrelated features. Use strict TypeScript, pure deterministic statistics functions, service boundaries, schema validation, stable UUIDs, UTC ISO timestamps and integer milliseconds.
- No service-role secrets in browser; use Supabase Auth and owner-scoped RLS, server-enforced access checks and least privilege. Do not disable RLS to make tests pass.
- Tests must be executed; never fabricate results. Report commands, exit codes, failures, changed files, migrations, manual checks and limitations.
- STOP if critical inputs or credentials are missing; implement mockable contracts and document blockers without fake success.


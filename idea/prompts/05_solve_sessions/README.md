# RubiVision AI — Solve History and Sessions Agent Pack

This pack targets the uploaded `05_Solve_History_and_Sessions.md`, not the whole RubiVision application. Run prompts **in numeric order**, one at a time, in your existing repository. Each prompt is a standalone coding-agent task with an audit-first contract. Do not run all prompts in parallel against the same branch.

**Important source conflict:** The latest uploaded category 05 document says Supabase PostgreSQL is the only persistent app database, while older master/contracts documents still say IndexedDB/offline-first. This pack follows the latest explicit override. It does not promise durable offline saving. The newer master sections 11–15 and category 02A are referenced but were not provided in the supplied files; ask for them if they contain additional mandatory policies.

## Execution
1. Copy the `SOURCE_REFERENCE/` files into the repository or point the agent to their existing copies.
2. Start with `PROMPTS/00_START_HERE.md`; review the audit before approving changes.
3. Execute the remaining numbered prompts sequentially, keeping commits/checkpoints between stages.
4. Do not declare completion until the release and independent audit gates are met.

## What this does not contain
No application source code or actual database migrations are asserted to exist. The prompts direct coding agents to implement them in your repository. No tests were run against your application because its repository and Supabase project were not provided.

## Deliverables
14 detailed agent prompts, requirements/architecture guide, test matrix, reusable handoff template, and the supplied relevant source references.

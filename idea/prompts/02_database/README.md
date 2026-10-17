# RubiVision AI — Expanded Coding Agent Prompt Pack

This ZIP includes 18 standalone, detailed coding-agent assignments, architecture reconciliation, implementation guide, phase tracking template, and the original source documents. The prompts are **instructions**, not implemented code. The application was not built or tested as part of creating this pack.

**Important:** The new Supabase-only database specification takes precedence over older IndexedDB/offline-first guidance. See `docs/ARCHITECTURE_DECISIONS.md` before running agents.

## How to use
1. Extract the ZIP into a separate documentation folder or repository `agent-prompts/`.
2. Start with `prompts/00_00_REPOSITORY_AUDIT.md`, then proceed in numbered order.
3. Give your coding agent access to the actual source repository and project documentation.
4. Review changes and test results after each phase. Commit verified changes before moving on.
5. Optional phases 15–17 are not prerequisites for the graduation MVP.

## Included
- `prompts/`: 18 long-form agent prompts covering audit, frontend, database, auth/RLS, scramble, timer, solves, statistics, camera, vision, dataset, training, inference, settings, security, release, scanner, tracking and smart cubes.
- `docs/`: architecture decisions, implementation guide and status template.
- `reference/`: supplied source specifications for traceability, including master DOCX.

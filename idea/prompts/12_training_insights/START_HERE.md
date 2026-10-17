# RubiVision AI — Comprehensive coding agent execution pack

This pack is a **plan and prompts**, not implemented application code. It was derived from the supplied project specification, topic files and the 2026-10-16 Stage Timing addendum. It includes all supplied source specifications for traceability.

## How to use
1. Unzip the pack into your RubiVision repository (or into a neighboring reference folder that the agent can read).
2. Read `ARCHITECTURE_AND_CONFLICT_RESOLUTION.md` before running an agent: it documents Supabase-only precedence and conflicts with older offline-first text.
3. Start with `AGENT_PROMPTS/00_00_REPOSITORY_AUDIT.md`, then proceed according to `IMPLEMENTATION_ROADMAP.md`. Note: filenames include a numeric prefix and a task ID.
4. For each module, give your agent the universal rules, architecture guide, matching prompt and source documents. Request a short audit and plan before changes.
5. Require actual test output and review the changes. Do not run all 20 prompts simultaneously; database schema and API contracts are shared dependencies.
6. Optional scanning and smart cube tasks should be delayed until the core graduation demonstration is reliable.

## Copy/paste launch prompt
```text
You are the lead implementation agent for RubiVision AI. Read START_HERE.md, AGENT_RULES.md, ARCHITECTURE_AND_CONFLICT_RESOLUTION.md, IMPLEMENTATION_ROADMAP.md, ACCEPTANCE_MATRIX.md, and AGENT_PROMPTS/00_00_REPOSITORY_AUDIT.md. Read the supplied original specifications under SOURCE_SPECIFICATIONS/. Inspect the actual repository and git status before editing. First report an evidence-backed audit and migration risks. Follow the latest Supabase-only precedence, not older IndexedDB/offline-outbox language. Implement only the current assigned task after stating the plan, add tests, run actual verification commands, and give a precise status report. Never invent passing tests, AI results, or implemented functionality.
```

## What is included
- 20 in-depth, standalone agent prompts, including repository audit, Supabase security, core application, video/AI, stage timing, experimental extensions and final verification.
- Universal agent protocol, precedence rules, roadmap and acceptance evidence matrix.
- The original markdown and DOCX source files, unchanged, for auditing.

## Important open issues
- The supplied stage addendum references master documents 11–15 and category 02A that are not in this upload. Obtain them if available before claiming complete compliance with their security and synchronization rules.
- The actual application repository was not supplied, so implementation status, library versions, migration feasibility and test results are unknown.
- The original specification prioritizes 3x3; later topic files request 2x2–7x7. The pack uses 3x3 as the first working gate and expansion afterward.

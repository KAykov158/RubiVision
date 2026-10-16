# RubiVision AI — Complete Agent Prompt Pack (2026-10-16)

This is an implementation INSTRUCTION PACK, not a completed application or verified implementation. It expands the supplied specifications into discrete agent tasks.

## How to run
1. Extract ZIP into the project root (or a separate `agent-pack` directory). Keep original specs in `source_specs/`.
2. Give your agent `ARCHITECTURE_PRECEDENCE.md` and `AGENT_GLOBAL_RULES.md` first.
3. Run `prompts/00_REPOSITORY_AUDIT.md`, review findings, then proceed numerically.
4. At each phase, supply the real repository and the original source specifications. Commit after passing the phase gate.
5. Optional phases 14–16 must not delay the graduation build.

## Core graduation milestone
3×3 scramble → timer → database-confirmed save → history/statistics → optional local video recording/import → timestamped motion features → baseline and trained classifier evaluation → synchronized timeline → export → tested demonstration.

## Important architecture correction
Newest 2026-10-16 directive makes Supabase PostgreSQL the only persistent app database. Old IndexedDB/offline-first requirements in the source documents conflict. Browser timer works offline; persisted save/history require connectivity. Never claim durable offline saving.

## Missing referenced documents
The newest camera file refers to master sections 11–15 and category 02A, but those authoritative sections/files were not supplied. Do not fabricate their content.

## Pack contents
- `prompts/`: 19 in-depth coding-agent tasks
- `source_specs/`: supplied markdown specifications retained verbatim
- `AGENT_GLOBAL_RULES.md`: universal guardrails
- `ARCHITECTURE_PRECEDENCE.md`: conflict resolution
- `COMPLETION_PLAYBOOK.md`: detailed graduation milestones and verification
- `ACCEPTANCE_MATRIX.md`: verifiable checks and failure cases
- `AGENT_HANDOFF_TEMPLATE.md`: structured progress report

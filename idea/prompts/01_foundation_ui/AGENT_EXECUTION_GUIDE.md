# Codex/OpenCode execution guide

**Architecture authority:** Read master documents 11 and 17 before using older specifications. Supabase PostgreSQL is the sole persistent application database; Supabase Auth and owner-scoped RLS are required. Do not implement IndexedDB, localStorage application persistence, durable offline queues, or automatic synchronization. Preserve conflicting older storage language only as historical context.


1. Open the **application repository root**, not just a folder of prompt files.
2. Ensure the agent can read the five canonical specifications. Keep them as source documents, not instructions to rewrite them.
3. Paste the content of one prompt file per agent task. First use `00_00_AGENT_OPERATING_RULES.md` and `01_01_REPOSITORY_AUDIT.md`.
4. Review the audit before allowing code changes. If the directory contains no app, proceed to bootstrap.
5. After each implementation prompt, require an evidence report using `EVIDENCE_REPORT_TEMPLATE.md`, run checks and review diff.
6. If a prompt requires a browser test and no browser runner is installed, have the agent explain the limitation rather than claiming success.
7. Keep prompts 13–19 as quality gates; do not let integration rehearsal create fake production behavior.
8. Use Git commits/checkpoints between phases when repository policy permits.
9. The final result of this pack is **Category 01 Foundation/UI only**. After Category 01 is accepted, proceed first to **Category 02: Supabase PostgreSQL schema, migrations, constraints, and generated database types**. Then complete **Category 02A: Supabase Auth, owner-scoped RLS, and cloud repositories**. Only after those persistence and authentication foundations are ready, follow the authoritative roadmap for Category 03 scrambles, Category 04 timer, and Category 05 solve/session functionality. See master documents 11 and 17 and `idea/master prompts/03_DEVELOPMENT_ROADMAP.md`; `02_Timer.md` is not the next implementation step.

Suggested first message:
'Read PROMPTS/00_00_AGENT_OPERATING_RULES.md and PROMPTS/01_01_REPOSITORY_AUDIT.md, and all SOURCE_SPECIFICATIONS/*.md. Perform the audit only. Do not edit source code. Report evidence and stop.'

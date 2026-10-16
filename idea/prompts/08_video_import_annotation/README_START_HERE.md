# RubiVision AI — Complete Implementation & Coding Agent Pack

This pack is an expanded *implementation instruction set*, not an implementation of the application. It was created from the supplied original Markdown files and the master DOCX. The actual source repository was not provided; agents MUST audit it first.

## Recommended execution
1. Place this pack alongside the RubiVision repository or give the coding agent access to both.
2. Read `00_AGENT_GLOBAL_CONTRACT.md`, `ARCHITECTURE_DECISIONS.md`, and `COMPLETION_GATES.md`.
3. Run `PROMPTS/00_Repository_Audit_and_Architecture.md` first.
4. Run subsequent prompts ONE AT A TIME, reviewing diffs and evidence between stages.
5. For Codex: open a terminal in the repository, run `npx @openai/codex` if the global command is not on PATH, then paste the selected prompt. Agent must have access to the original specs and source tree.
6. Do not merge a phase with failed critical tests or unreviewed schema migrations.

## Important conflict
The newly supplied video annotation file establishes a Supabase-only persistent app database (2026-10-16). Many older specs and the DOCX require offline-first IndexedDB. These cannot both be implemented as written. This pack follows the later override: timer can run offline in memory, but durable solves require Supabase availability. No offline durable save is promised.

## Missing referenced sources
The annotation addendum refers to master documents 11–15 and category 02A. Those specific files were not among the supplied attachments. This pack flags the gap instead of inventing their requirements.

## Graduation scope
Priority is timer → scrambles → cloud-backed solves → statistics → capture/import → annotation → vision → dataset → baseline → model evaluation → inference → exports → release. Exact move tracking and full cube-state reconstruction remain optional research tasks.

## What 'complete' means
Every relevant acceptance case has reproducible evidence; critical failures are zero; SQL/RLS and client tests pass; demo works with a documented configured Supabase project; ML claims are supported by actual held-out evaluation. If no dataset exists, do not mark the ML experiment complete.

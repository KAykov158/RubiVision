# RubiVision AI complete coding-agent pack

This pack is an implementation instruction set, not finished application code. It is derived from the supplied RubiVision specifications and expanded with engineering detail, failure states, verification gates, Supabase security and AI evaluation discipline.

## How to use with Codex or another coding agent
1. Unzip the archive into your project, preferably under `docs/agent-prompts/`.
2. Give the agent `MASTER_AGENT_PROMPT.md` and `00_Repository_audit_and_specification_reconciliation.md` first.
3. Have the agent inspect the real repository, not assume that the specifications describe existing code.
4. Complete the audit and review architectural decisions before starting the numbered modules in `EXECUTION_ORDER.md`.
5. For each module, provide the matching prompt and source spec, request implementation and test evidence, commit after acceptance.
6. When blocked, use `RECOVERY_AND_REVIEW_PROMPTS.md`.

## Example instruction to paste into Codex
Read `docs/agent-prompts/MASTER_AGENT_PROMPT.md`, `docs/agent-prompts/EXECUTION_ORDER.md`, and `docs/agent-prompts/00_Repository_audit_and_specification_reconciliation.md`. Inspect this repository and perform task 00 only. Do not assume the app already exists or that tests pass. Report findings, architecture conflicts and concrete next steps.

## Source caveats
Supabase-only is explicit in the newest supplied module addendum. Referenced additional source sections/files (02A and master 11–15/17) are absent from this uploaded set, so no claim is made to have reviewed them. Older project specs conflict about persistence and graduation scope (3x3 MVP vs 2x2–7x7 broader target). This pack treats 3x3 as minimum demonstrable AI scope, with 2x2–7x7 scramble/timer support as broader functional scope where feasible. Optional exact move tracking and scanner remain separate.

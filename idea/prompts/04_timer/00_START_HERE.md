# RubiVision AI — Full implementation playbook

## How to run
1. Put this folder at the root of the existing RubiVision repository (or give its path to your agent). Do not replace your repository with this prompt pack.
2. Run `prompts/00_REPOSITORY_AUDIT.md` first in Codex/OpenCode/Claude Code. Give the agent access to the repository, terminal and relevant original specifications.
3. Review the audit and decide unresolved choices, particularly Supabase-only persistence and authentication.
4. Run each prompt sequentially. One prompt = one reviewable commit or PR. Don't run dependent phases in parallel.
5. Require tests and the completion report before continuing. Use `CHECKPOINT_TEMPLATE.md` after every phase.
6. Graduation goal: phases 00–14, prioritize complete 3x3 path; optional phases 15–17 are research/expansion.

## Scope warning
The uploaded sources include a 3x3 graduation MVP, some broader 2x2–7x7 requirements, and conflicting local-first versus Supabase-only instructions. This pack resolves those as explicit architectural decisions rather than silently merging incompatible promises. The complete repository was not supplied, so no implementation status can be asserted.

## Critical research boundary
Motion/hand movement classification cannot prove cube face turns, cube state, CFOP phases or TPS. Exact tracking requires separate verified data and evaluation.

## Delivery gates
A phase passes only when implementation exists, tests were actually run, acceptance cases pass, and known limitations are recorded. Stop on blockers; do not claim success because an agent wrote code.

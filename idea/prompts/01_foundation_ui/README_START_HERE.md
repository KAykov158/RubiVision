# RubiVision AI — Phase 1 enhanced coding-agent pack (v2)

This is an improved replacement for the original 13-prompt pack. It contains **20 numbered agent prompts (00–19)** and 5 source specifications. The original 13 prompts are retained unchanged; seven deeper follow-up tasks cover UI specification, independent review, browser compatibility, performance, security/privacy, integration rehearsal and release gate.

## Recommended workflow
1. Give the coding agent access to the **actual source repository** and the `SOURCE_SPECIFICATIONS` folder. If the project is specifications-only, start with repository audit, then bootstrap.
2. Run `PROMPTS/00_00_AGENT_OPERATING_RULES.md` as the initial instruction, followed by `01_01_REPOSITORY_AUDIT.md`.
3. Execute prompts 02–12 sequentially, with a checkpoint after each. Inspect actual changes and test outputs.
4. Execute 13–19 as deepening and independent verification. Prompt 13 is best run before extensive UI polishing; prompt 18 must be test-only and must not create fake production services.
5. Use `CHECKLIST_PHASE1.md` and `EVIDENCE_REPORT_TEMPLATE.md` for objective completion decisions.
6. Stop if the agent claims successful tests without output, introduces a future module, or rewrites unrelated code.

## Scope and authority
Source-derived: React/TypeScript foundation, six navigation destinations, themes, accessible responsive states, no direct DB in views, offline-first, typed service contracts and verified tests.
Added engineering recommendations: numeric responsive checkpoints, detailed design blueprint, cross-browser matrix, performance audit, security audit, simulated provider lifecycle, deployment deep-link validation. These additions are *not* original contractual requirements; use them to strengthen quality, not to overwrite the user's source.

## Definition of Phase 1 complete
Every required Foundation/UI criterion is verified in the actual repository. All tests have real results. No unimplemented timer, scrambles, persistence, statistics, video or AI are represented as functioning. There is an actionable handoff to Phase 2.

## Files
- `PROMPTS/00...12`: original sequential agent prompts
- `PROMPTS/13...19`: new deeper agent prompts
- `SOURCE_SPECIFICATIONS/`: canonical requirements
- `CHECKLIST_PHASE1.md`: detailed acceptance matrix
- `EVIDENCE_REPORT_TEMPLATE.md`: test/result reporting format
- `DECISION_LOG_TEMPLATE.md`: record tradeoffs before downstream implementation
- `AGENT_EXECUTION_GUIDE.md`: instructions for Codex/OpenCode

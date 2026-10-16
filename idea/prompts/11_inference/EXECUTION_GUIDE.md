# Complete execution guide for coding agents

## Preparation
1. Extract ZIP in or next to repository; keep `SOURCE_SPECIFICATIONS/` accessible.
2. Open coding agent at repository root. Ensure Git, Node/package manager, and Python environment are available. Do not expose Supabase secrets in prompts or commits.
3. Paste `00_MASTER_AGENT_PROMPT.md`, then `PROMPTS/01_...md`. Ask agent to inspect and report before changing files.
4. Execute subsequent prompts one by one in numerical order, only after acceptance gate is verified. Use a separate branch/commit/checkpoint per phase as appropriate.
5. At each gate require command outputs, migrations, failure tests, manual reproduction, and a GO/NO-GO verdict. If blocked, resolve blocker rather than starting downstream work.
6. Phase 16 and 17 are optional; never block graduation MVP for them. Phase 18 is final independent audit.

## Agent starter message
```text
Read 00_MASTER_AGENT_PROMPT.md, ARCHITECTURE_DECISIONS.md, DATA_MODEL_AND_SECURITY.md, ACCEPTANCE_MATRIX.md, SOURCE_SPECIFICATIONS/00_DATA_CONTRACTS.md, SOURCE_SPECIFICATIONS/00_INTEGRATION_CHECKLIST.md and PROMPTS/01_*.md. Audit this repository and execute phase 01 only. Do not assume source specs are implemented. First show verified findings and plan. Implement scoped work, test it, and report exact evidence and GO/NO-GO.
```

## Repeatable next-phase message
```text
Execute PROMPTS/NN_<phase>.md under 00_MASTER_AGENT_PROMPT.md. Inspect existing code and prior phase evidence first. State the plan, implement only this phase, test positive and negative paths, update acceptance matrix, and report exact outcomes and blockers. Never claim a cloud write succeeded without Supabase acknowledgement.
```

## What completion means
A runnable app plus successful user journey, security-isolated durable records, accurate timer/statistics, optional video capture or import, timestamped deterministic features, evaluated baseline versus trained model, honest browser inference timeline, portable export, tests, documented limitations and reproducible graduation demo. Optional exact moves/cube state are not necessary.

## Troubleshooting agent behavior
If agent starts rewriting everything: instruct it to stop and enumerate existing modules and minimal edits. If it claims tests passed without output: require command logs. If it invents cloud offline persistence: refer to ARCHITECTURE_DECISIONS.md. If it claims exact turns from pixel motion: refer to classifier scope. If it attempts every phase at once: stop and return to current acceptance gate.

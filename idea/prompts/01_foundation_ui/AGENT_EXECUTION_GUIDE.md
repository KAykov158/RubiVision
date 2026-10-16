# Codex/OpenCode execution guide

1. Open the **application repository root**, not just a folder of prompt files.
2. Ensure the agent can read the five canonical specifications. Keep them as source documents, not instructions to rewrite them.
3. Paste the content of one prompt file per agent task. First use `00_00_AGENT_OPERATING_RULES.md` and `01_01_REPOSITORY_AUDIT.md`.
4. Review the audit before allowing code changes. If the directory contains no app, proceed to bootstrap.
5. After each implementation prompt, require an evidence report using `EVIDENCE_REPORT_TEMPLATE.md`, run checks and review diff.
6. If a prompt requires a browser test and no browser runner is installed, have the agent explain the limitation rather than claiming success.
7. Keep prompts 13–19 as quality gates; do not let integration rehearsal create fake production behavior.
8. Use Git commits/checkpoints between phases when repository policy permits.
9. The final result of this pack is **Phase 1 Foundation/UI only**. Proceed to 02_Timer.md only after Phase 1 gates pass.

Suggested first message:
'Read PROMPTS/00_00_AGENT_OPERATING_RULES.md and PROMPTS/01_01_REPOSITORY_AUDIT.md, and all SOURCE_SPECIFICATIONS/*.md. Perform the audit only. Do not edit source code. Report evidence and stop.'

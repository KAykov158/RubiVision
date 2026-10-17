# Additional coding agent prompts

## Debug a failed gate
Inspect the failing command output and reproduce it. Identify root cause with minimal test, propose narrow fix, implement without disabling assertions or removing tests, rerun the original command and relevant regression checks. Report actual evidence and remaining failures. Apply MASTER_AGENT_PROMPT.md.

## Cross-module contract audit
Compare TypeScript types, SQL migrations, RLS policies, import/export schema, model manifest and UI service boundaries. Identify every mismatch with file and line references, rank severity, write migration/compatibility plan, add contract tests and only implement approved fixes. Never conceal broken compatibility.

## Agent code review
Review the current diff for correctness, race conditions, security/RLS, network error handling, resource leaks, test gaps and misleading product claims. Return findings by severity with file/line and reproducible scenarios; then propose minimal patches. Do not declare a passing review without executed verification.

## Resume interrupted work
Inspect git status, recent commits, running tests and current task report. Determine what is actually implemented versus planned; do not trust previous agent summary without checking. Continue the smallest unfinished acceptance gate and report what changed.

## Final release readiness audit
Run documented clean install, database migration, typecheck, lint, unit, integration, browser smoke tests, security policy tests and demo path. Produce a PASS/FAIL/UNVERIFIED table with exact commands, environments, dates and evidence. Block release for critical unresolved failures; never manufacture screenshots or metrics.

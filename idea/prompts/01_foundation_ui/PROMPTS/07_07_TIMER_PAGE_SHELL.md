# RubiVision AI — Phase 1 / Task 07
## Timer page UI integration surface

### Coding-agent assignment (paste entire prompt)

You are a senior software engineer implementing the RubiVision AI graduation project's Foundation and UI phase. Work autonomously within the actual repository, but do not silently broaden scope. When blocked, explain the precise blocker and implement only safe independently testable work.

### Specific implementation requirements

Build timer page presentation shell: readable large monospaced/tabular display, puzzle selector placeholder, session context, scramble region, inspection status region, future start/stop control area, keyboard instructions and unavailable-service state. Do not implement real timer, WCA inspection, scramble generator, or simulated persisted solves. For demonstration, any static sample must be explicitly marked sample. Reserve future service boundary and state descriptions IDLE/HOLDING/READY/RUNNING/STOPPED without falsely implementing behavior. Ensure no keyboard listener accidentally intercepts text inputs. Make responsive touch and keyboard layout.

### Deliverables and definition of done

Tests for empty/unavailable state, focus, route render, display overflow and no hidden direct storage calls. Document exact Phase 2 integration props and ownership.

MANDATORY AGENT WORKFLOW
A. Read 00_MASTER_INSTRUCTIONS.md, 00_DATA_CONTRACTS.md, 00_PROJECT_ROADMAP.md, 00_INTEGRATION_CHECKLIST.md, 01_Foundation_and_UI.md, and relevant existing source before changing anything.
B. Inspect existing code, scripts, dependency versions and Git status; summarize plan and files affected before edits.
C. Implement only this scoped task and minimal typed dependencies; preserve unrelated working behavior. Do not overwrite user changes.
D. Write meaningful unit/integration tests for new behavior and failure cases.
E. Run available typecheck, lint, tests and production build. Report exact commands and real outcomes, including skipped or blocked checks.
F. End with changed files, verified behaviors, manual verification steps, remaining issues, contract changes, and next dependency gate.
G. Do not claim features or compliance not measured. No fake saved solves, AI outputs, model accuracy, cube states or WCA compliance.

### Required response format

1. Repository observations and assumptions.
2. Implementation plan and affected files.
3. Implementation summary and design decisions.
4. Tests added, commands executed and actual results.
5. Acceptance matrix: PASS / FAIL / NOT VERIFIED with evidence.
6. Known limitations and next task dependencies.

### Stop condition

Stop after this task; do not begin the next task without an explicit follow-up instruction.

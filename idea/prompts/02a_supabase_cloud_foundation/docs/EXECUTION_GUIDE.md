# Human execution guide

1. Extract the ZIP into your existing repository or keep it in a sibling folder and point the agent at it. Do not blindly overwrite existing project files.
2. Start the agent in the repository root. Send `prompts/00_REPOSITORY_AUDIT.md` first. Review its inventory and decisions.
3. Give the agent AGENTS.md and the next single prompt. Avoid asking one agent to implement all phases in one run.
4. After timer and scramble work, complete Supabase setup in a development project before solve persistence. Apply SQL migrations using official CLI and inspect RLS policies. Never paste service-role keys into frontend code or agent prompts.
5. Run each phase's tests locally; capture real logs and commit. If a gate fails, use the repair prompt before moving on.
6. Gather consented recordings and label them manually before ML claims. Do not treat synthetic data as evidence of real-world accuracy.
7. Final release requires independent second-account access-denial checks, cross-device persistence checks, recording consent review, and reproducible model evaluation.

Recommended Codex workflow on Windows: from repository root run `npx @openai/codex` if global `codex` is not on PATH; alternatively fix npm global bin PATH and use `codex`. Sign in using the CLI flow. Paste the specific phase prompt or ask it to read that prompt file. Do not assume npx/network is configured.

Critical user decisions before implementation: Supabase-only versus offline-first (pack selects Supabase-only); whether anonymous timing is allowed (yes, but unsaved unless signed in); session deletion policy (suggest explicit cascade confirmation); recording retention (suggest ephemeral by default); whether 2x2-7x7 are included at launch (phase expansion). These are proposals, not repository facts.

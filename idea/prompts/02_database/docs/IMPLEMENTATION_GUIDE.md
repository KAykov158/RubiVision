# RubiVision AI — Detailed completion and execution guide

## Goal and evidence
A successful project is not a pile of generated files. It is a deployed and reproducible workflow: authenticate → choose puzzle/session → generate and freeze scramble → run timer → persist exactly one solve → review history/statistics → record or import video → extract timestamped features → classify movement/pause/uncertain → review synchronized timeline → export data. A baseline and trained model must be compared on the same genuinely held-out data before claiming ML success.

## Recommended sequence
1. Audit repository and lock architecture.
2. Establish React UI, typed domain contracts and CI baseline.
3. Implement Supabase SQL migrations and secure Auth/RLS; verify multi-user isolation before storing real data.
4. Build scramble/timer vertical slice, then durable solve persistence and statistics.
5. Implement camera/import and metadata/Storage with consent.
6. Implement deterministic feature extraction before training any model.
7. Collect consented footage, manually annotate, split by participant/session, and evaluate threshold baseline vs ML.
8. Deploy manifest-validated inference and timeline; then settings/import/export and security hardening.
9. Run full tests, prepare final report and demonstrate actual results.
10. Consider scanner/live tracking/smart cube only after release gate.

## Agent execution instructions
Copy `prompts/00_00_REPOSITORY_AUDIT.md` into your coding agent first. Give it repository access and tell it to inspect rather than regenerate. Then run one numbered prompt at a time, reviewing diffs, running tests and committing between phases. Never paste all prompts as one mega-task. Use the output handoff and failed tests to guide the next phase.

## Verification per phase
Record repository commit, environment, commands executed, observed outputs, manual browser test, unresolved risks, and whether acceptance gate passed. A successful build alone is insufficient for database security, camera compatibility or model accuracy.

## Quality targets (proposed, not measured)
- No duplicate solve inserts under repeated stop/save events.
- No cross-user reads/writes or private video access.
- Timer precision based on monotonic clock, not React render cadence.
- Stable feature schema between Python training and browser inference.
- Graceful errors for denied camera, unavailable cloud, corrupted video and incompatible model.
- Transparent UNCERTAIN results and measured metrics only.

## Development operations
Use `.env.example` for public client configuration. Keep privileged service-role credentials only in trusted server/CI secrets. Use Supabase CLI migrations committed to Git. For database reset/rollback, prefer tested forward fixes and verified backup restoration rather than pretending destructive down migrations are safe. Test on a disposable local project before production deployment.

## Final academic evidence
Include architecture diagram, ERD, state-machine diagram, data/consent protocol, feature schema, train/validation/test grouping, baseline-vs-model table, confusion matrix, processing latency, failure cases, privacy notes, installation commands, reproducible demo script and explicit limitations. Do not invent any experimental result.

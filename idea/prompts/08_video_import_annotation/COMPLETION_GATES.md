# Completion gates and evidence policy

A phase is NOT complete just because code was written.

## Gate A: implementation
- Feature behavior demonstrated on real build; no critical error state omitted.
- All changed domain contracts documented and schema versioned.
- Relevant unit/integration/E2E tests executed and recorded.
- Typecheck, lint, build executed; failures recorded honestly.
- Security impact reviewed; Supabase migrations reversible or have documented recovery.

## Gate B: timer and persistence
- Fake-clock and real-browser timer behavior verified; duplicate completion suppressed.
- Save attempts are idempotent; failed network saves visible; history shows only confirmed persisted solves.
- Cross-user read/write denied by RLS; no leaked secrets.

## Gate C: video and annotation
- Camera denial does not prevent file import or timing.
- Corrupt and unsupported files have explicit failures.
- Label export → import → export preserves intervals and time units.
- Local raw media is not silently uploaded; cleanup confirmed.

## Gate D: scientific evaluation
- Annotation guide and dataset manifest committed without private raw footage.
- Group-aware split prevents adjacent-window leakage.
- Baseline and model evaluated on identical held-out samples.
- Macro F1, per-class precision/recall/F1, confusion matrix, uncertainty rate, boundary error and processing time are measured, not invented.

## Gate E: release
- Fresh installation with documented Supabase configuration succeeds.
- Demo includes scramble → timer → confirmed solve → statistics → video import/record → analysis timeline → export.
- Known limitations and reproducibility instructions are published.
- Every test line is marked PASS, FAIL, BLOCKED or NOT RUN with command and environment.

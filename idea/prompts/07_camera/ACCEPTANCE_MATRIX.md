# Acceptance matrix — evidence required

| Area | Positive proof | Negative proof | Evidence |
|---|---|---|---|
| Auth/RLS | Owner CRUD succeeds | Other user CRUD denied | SQL tests |
| Timer | Monotonic start/stop | repeat key and double stop | fake-clock tests |
| Scramble | Exact scramble saved | stale generation ignored | integration test |
| Save | Reload persisted solve | offline save visibly NOT SAVED | e2e + network simulation |
| Stats | golden ao5/ao12 and DNF | insufficient window | unit fixtures |
| Camera | permission, playback, release | denied/unsupported/interrupted | browser tests |
| Synchronization | measured video/timer alignment | encoder delay/drift/variable fps | video fixtures |
| Privacy | local-only default | no silent upload | network audit |
| Features | timestamped deterministic windows | missing frames/hands/blur | synthetic fixtures |
| Dataset | group split reproducible | leakage rejected | script tests |
| Model | measured baseline comparison | incompatible manifest rejected | evaluation report |
| Timeline | seek and valid segments | uncertain/zero predictions | integration tests |
| Export | round-trip valid schema | malformed import atomic failure | fixture tests |
| Release | fresh machine demo | missing config explained | recorded manual checklist |

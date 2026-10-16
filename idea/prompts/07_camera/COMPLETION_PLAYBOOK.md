# Detailed completion playbook

## Phase gates
Gate 0: Repo audit and reproducible baseline; identify missing specs and write decisions.
Gate 1: Responsive accessible shell, error states, strict TS, CI baseline.
Gate 2: Auth and SQL migration/RLS tested with two independent users; services only.
Gate 3: Timer with fake monotonic clock, hold/release/stop, inspection boundary tests and double-stop guard.
Gate 4: Verified scramble library, immutable scramble-to-solve association.
Gate 5: Supabase-confirmed solve save, session CRUD, penalties, history and explicit offline failure.
Gate 6: Statistics golden fixtures and DNF behavior.
Gate 7: Camera permission/recording/import, offset/drift measurements, privacy and teardown.
Gate 8: Deterministic timestamped motion feature windows with quality flags.
Gate 9: Consented dataset, written labels, group split, frozen test set.
Gate 10: Baseline versus trained model, measured per-class F1/macro F1/confusion matrix, latency and boundary error.
Gate 11: Versioned synchronized analysis timeline, uncertainty and manual corrections.
Gate 12: Versioned export/import, atomic validation and ownership policy.
Gate 13: Fresh-install e2e demo, security regression, reproducibility and academic report.

## Why this sequence
The timer and data integrity are the product's foundation; video is a separable failure-prone subsystem. Vision features must exist before data collection and training can be reproducible. The baseline must be measured against a frozen test set before any AI claims. Exact cube tracking needs its own evidence and is not implied by movement classification.

## Camera synchronization design guidance
Use a monotonic `performance.now()` anchor when timer starts and when recording starts. Record both anchor observations, wall-clock UTC separately, recorder state transitions, first media timestamp when accessible, and uncertainty sources. Define `timerStartOffsetMs = timerStartMonotonicMs - recordingStartMonotonicMs` as an initial estimate, not guaranteed frame-accurate truth. Build a timestamp mapping from decoded media PTS to timer elapsed time; test encoder start delay, drift, variable frame rates, dropped frames, pause/resume, backgrounding and browser-specific behavior. Never use rendered frame count / requested fps as the authoritative video clock. Preserve metadata on recording failure without corrupting solve timing.

## Suggested database constraints
UUID PKs; `user_id` ownership; FK from solve to session and immutable scramble; unique solve event key; `raw_time_ms >= 0`; controlled penalties; schema version and provenance; UTC timestamps; private recording keys; analysis references to recording and model version; foreign-key delete policy explicitly chosen. Test user isolation for SELECT/INSERT/UPDATE/DELETE.

## Video analysis evidence
Store original window features, raw predictions, model manifest, feature schema version, confidence, quality warnings, smoothing config and derived timeline separately. For uncertain windows, do not silently count as movement or pause. Track analyzed duration and unknown duration. Allow reruns without destructive overwrites.

## Experimental method
Collect only consented footage. Define regrips, occlusions, pause minimum and annotation resolution before labeling. Group train/validation/test by participant or session. Keep test frozen until tuning ends. Compare baseline and model on identical test videos. Report actual confusion matrix, per-class PR/F1, macro F1, uncertainty rate, pause boundary error and inference time. State sample size and limitations.

## Completion evidence
For each gate keep: git commit, OS/browser/runtime versions, migrations applied, commands and exit codes, test fixture IDs, screen captures where appropriate, failure reproduction, and remaining blockers.

## Final demonstration script
Sign in to configured Supabase account; create session; generate 3×3 scramble; run inspection and solve; confirm saved row; reload and verify; edit penalty; view recalculated statistics; opt into camera or import test video; analyze locally; inspect aligned movement/pause/uncertain timeline; view model provenance and warnings; export CSV/JSON; demonstrate camera-denial and network-failure handling; show reproducible evaluation report.

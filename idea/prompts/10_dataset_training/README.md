# RubiVision AI — Dataset and Model Training Agent Pack

**Scope:** full execution guide for the uploaded `10_Dataset_and_Model_Training.md` module, with improved reliability, security, evaluation and integration requirements. This pack is an implementation plan, not an implementation or a trained model.

## Critical precedence and architecture
The October 16, 2026 Supabase-only architecture supersedes older IndexedDB/local database/offline-outbox wording. Supabase PostgreSQL is the sole persistent application database. Training data files, dataset manifests and ML model artifacts are separate research assets, not an alternative app database. No durable offline saving is promised. Old master documents are included for context and may contain superseded language; follow the latest applicable requirements and confirm conflicts with the actual repository.

## What completion means
A consented, versioned dataset exists; labels are audited; deterministic features match browser extraction; participant/session-separated test set is locked; a baseline and actual trained classifier are evaluated on the same held-out data; the report contains real per-class precision/recall/F1, macro F1, confusion matrix, uncertainty and pause boundary errors, latency, limitations; browser-compatible model artifact and manifest pass parity tests; app integration is tested; privacy and ownership are verified. No model metrics or functionality can be claimed from these prompt files alone.

## How to use with coding agents
1. Place this pack alongside the actual repository, or give the agent access to both.
2. Start with `prompts/00_START_HERE.md`; allow the agent to inspect existing code and identify missing prerequisites.
3. Run numbered prompts sequentially, one at a time, checking their gate before proceeding.
4. Give each new agent `prompts/00_START_HERE.md`, the specific numbered task, and the `reference/` files.
5. Commit after each passing gate; record executed commands and actual results.
6. Do not run final evaluation until dataset and model are frozen; never tune on the test set.

## Dependency chain
Contracts -> consent -> labeling -> manifest validation -> feature extraction -> leakage-safe splits -> baseline -> model training -> calibration -> held-out evaluation -> export -> app integration -> robustness/security/CI -> academic documentation -> final audit. Annotation UI can be developed after schema/label guide are stable.

## Improvements beyond original specification
- Explicit schema parity tests across Python and TypeScript.
- Locked test-set hashes, grouped validation and train-only preprocessing.
- Separate ground-truth UNCERTAIN class from low-confidence abstention.
- Artifact hashing, provenance, confidence calibration and reproducible environment.
- Robustness testing across camera and participant conditions.
- Supabase RLS and private media access checks.
- Real browser compatibility tests instead of assuming Python pickle works in JavaScript.
- CI smoke tests with clearly synthetic fixtures.
- Clear distinction between planning, coding, validation and scientifically supported performance claims.

## Suggested command structure (agent must adapt to actual repo)
```bash
python scripts/dataset/validate_dataset.py --manifest <path>
python scripts/dataset/extract_features.py --manifest <path> --out <path>
python scripts/dataset/split_dataset.py --features <path> --out <path> --seed 42
python scripts/ml/train.py --config <path>
python scripts/ml/evaluate.py --experiment <path> --locked-test <path>
python scripts/ml/export_model.py --experiment <path>
```
These commands are examples of interfaces to implement, not claims they currently exist.

## Expected artifacts
- `dataset_manifest.json`, `labeling-guide-v1.md`, validated annotations and exclusion report
- feature schema, feature windows and parity fixtures
- immutable split manifest with participant/session grouping
- baseline configuration, trained model metadata, frozen experiment config
- real held-out evaluation report and confusion matrix
- browser-compatible inference artifact, model manifest and parity report
- privacy/security review, README, demo script and final acceptance report

## Explicit non-goals
Motion classification alone cannot identify exact Rubik turns, physical cube state, CFOP phase or TPS. These require independent verified evidence and are not part of this module.

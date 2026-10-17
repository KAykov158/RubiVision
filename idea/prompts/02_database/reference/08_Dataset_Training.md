# RubiVision AI — Dataset, labeling, baseline and ML training

## Assigned topic
Dataset, labeling, baseline and ML training

## Suggested files (adapt to existing repository)
scripts/dataset/extract_features.py, validate_dataset.py, split_dataset.py, scripts/ml/train.py, evaluate.py, export_model.py, docs/dataset_protocol.md, docs/evaluation.md

## Implementation requirements
Define MOVEMENT, PAUSE, UNCERTAIN labeling guidelines incl. regrips and occlusions. Collect diverse consented recordings; store participant/session/recording metadata; validate annotations and window alignment. Split by participant/session to prevent leakage. Implement threshold baseline and trained Random Forest/tabular classifier. Tune only on train/validation, freeze and evaluate on held-out test. Report per-class precision/recall/F1, macro F1, confusion matrix, uncertainty rate, pause boundary error, latency. Export feature schema, model version and runtime-compatible inference artifacts.

## Acceptance tests and edge cases
Fully reproducible scripts and fixed seeds, test leakage check, feature-schema consistency, compare baseline/model on identical held-out data, no invented accuracy.

## Agent operating instructions
You are an AI coding agent working on the existing RubiVision AI repository. First inspect the repository, package.json, current architecture, existing files, tests, and dependencies. Do not assume the proposed paths already exist or rebuild working features. State a short plan, implement ONLY this topic and necessary typed integration points, and preserve unrelated behavior. Use strict TypeScript for the web application; Python is allowed for offline dataset/training scripts. Write meaningful unit/integration tests and error states. Run available typecheck, tests and build, and report actual results. Do not fabricate test passes, measured ML performance, cube-state recognition, or completed features. For any ambiguous dependency, document a sensible choice. Output changed files, behavior, validation steps, limitations and next integration needs.

## Completion definition
The topic is complete only when its acceptance cases are demonstrably met, tests are run, and integration contracts are documented. Do not implement unrelated optional modules.

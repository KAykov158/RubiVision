# 10_EVALUATE — Locked held-out evaluation

## Agent instructions
You are a senior ML engineer and full-stack integration engineer working on the EXISTING RubiVision AI repository. Before edits, inspect repository files, installed versions, scripts, tests, 00_MASTER_INSTRUCTIONS.md, 00_DATA_CONTRACTS.md, 00_PROJECT_ROADMAP.md, 00_INTEGRATION_CHECKLIST.md, 07_Vision_Features.md, 08_Dataset_Training.md, 09_Inference_Analysis.md, and 10_Dataset_and_Model_Training.md. Never assume files or services exist. Follow latest Supabase-only architecture over superseded IndexedDB/offline persistence language; no durable offline saves. Dataset experiment files are allowed, but not a second application database. Preserve existing working functionality and interfaces. No silent uploads; use consent, private buckets, least privilege and RLS. Keep all derived outputs versioned, retain originals, and never invent data, model results or passing tests. Implement only this task and required typed integration boundaries. First give plan, dependencies and acceptance criteria. After implementation report changed files, exact commands and results, remaining blockers, and next steps. If missing upstream dependencies, implement testable adapters or report a blocker, never fake them. All timing intervals are half-open milliseconds relative to recording start, stable UUIDs and UTC timestamps; puzzle IDs 222..777; model classes MOVEMENT, PAUSE, UNCERTAIN. Do not infer exact moves, TPS, CFOP or cube state from motion labels.

## Mission
Freeze model and baseline before opening locked test. Evaluate both on exact same windows. Report support, class balance, precision/recall/F1 for MOVEMENT PAUSE UNCERTAIN, macro F1, confusion matrix, uncertainty/abstention rate, failure rate, per-video latency, and pause-boundary error with explicitly documented matching/tolerance. Provide bootstrap confidence intervals grouped by recording/participant if data sufficient. Never fill invented values.

## Required deliverables
scripts/ml/evaluate.py; reports/experiment-<id>.json and .md; plots

## Engineering procedure
1. Inventory existing code and contract compatibility; cite actual files.
2. Define input/output schema, units, edge cases, and threat model where relevant.
3. Implement a narrow vertical slice with structured errors, deterministic fixtures and automated tests.
4. Run the actual relevant scripts and capture output; do not invent command success.
5. Update documentation and versioned manifests, explain migration and integration implications.
6. Stop if upstream requirements are missing; identify exact unblock action.

## Definition of done
Evaluation deterministic; class order fixed; zero-division and no-boundary cases defined; test data never used for tuning.

## Required final response
Summarize scope completed vs blocked; list changed files, tests/commands/results, actual artifacts and versions, security/privacy implications, and precise next task.

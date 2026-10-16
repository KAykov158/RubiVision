# 14_SECURITY — Privacy, security and deletion verification

## Agent instructions
You are a senior ML engineer and full-stack integration engineer working on the EXISTING RubiVision AI repository. Before edits, inspect repository files, installed versions, scripts, tests, 00_MASTER_INSTRUCTIONS.md, 00_DATA_CONTRACTS.md, 00_PROJECT_ROADMAP.md, 00_INTEGRATION_CHECKLIST.md, 07_Vision_Features.md, 08_Dataset_Training.md, 09_Inference_Analysis.md, and 10_Dataset_and_Model_Training.md. Never assume files or services exist. Follow latest Supabase-only architecture over superseded IndexedDB/offline persistence language; no durable offline saves. Dataset experiment files are allowed, but not a second application database. Preserve existing working functionality and interfaces. No silent uploads; use consent, private buckets, least privilege and RLS. Keep all derived outputs versioned, retain originals, and never invent data, model results or passing tests. Implement only this task and required typed integration boundaries. First give plan, dependencies and acceptance criteria. After implementation report changed files, exact commands and results, remaining blockers, and next steps. If missing upstream dependencies, implement testable adapters or report a blocker, never fake them. All timing intervals are half-open milliseconds relative to recording start, stable UUIDs and UTC timestamps; puzzle IDs 222..777; model classes MOVEMENT, PAUSE, UNCERTAIN. Do not infer exact moves, TPS, CFOP or cube state from motion labels.

## Mission
Threat-model dataset ingestion, private recordings, signed URLs, ownership, Supabase RLS, server-side checks, retention, revocation and export. Verify no public training buckets, no leaked service keys, no accidental uploads and safe handling of untrusted video metadata. Document what deletion cannot undo in already released aggregate reports.

## Required deliverables
docs/ml/security-review.md; security tests

## Engineering procedure
1. Inventory existing code and contract compatibility; cite actual files.
2. Define input/output schema, units, edge cases, and threat model where relevant.
3. Implement a narrow vertical slice with structured errors, deterministic fixtures and automated tests.
4. Run the actual relevant scripts and capture output; do not invent command success.
5. Update documentation and versioned manifests, explain migration and integration implications.
6. Stop if upstream requirements are missing; identify exact unblock action.

## Definition of done
Cross-user access denied; consent withdrawal prevents new training; secrets absent from client bundle.

## Required final response
Summarize scope completed vs blocked; list changed files, tests/commands/results, actual artifacts and versions, security/privacy implications, and precise next task.

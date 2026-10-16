> **SUPABASE-ONLY ARCHITECTURE OVERRIDE (2026-10-16).** This file retains earlier requirements for traceability. Any instructions here to use IndexedDB, another browser/local database, localStorage for application persistence, a durable offline write queue, or automatic synchronization are superseded by master documents 11 and 17. Supabase PostgreSQL is the sole persistent application database; Supabase Auth and owner-scoped RLS govern future cloud data. A failed write may remain only in volatile tab memory with an explicit unsaved state. Other requirements remain unless separately superseded.

# Graduation evidence templates

## Experiment run record
- Experiment ID/date:
- Research question/hypothesis:
- Participant/session/recording counts:
- Consent and exclusions:
- Dataset manifest version:
- Train/validation/test split method and seed:
- Feature extractor version and parameters:
- Baseline algorithm and tuning method:
- Trained model, hyperparameters and export version:
- Precision/recall/F1 per class and macro F1:
- Confusion matrix and boundary errors:
- Runtime hardware and latency:
- Error analysis and limitations:
- Reproduction command:

## Module acceptance record
- Module and specification version:
- Implemented behavior:
- Unit/integration/e2e tests and actual outcomes:
- Browser/device manual checks:
- Data migrations or compatibility concerns:
- Known defects:
- Git commit/tag:
- Approved for next module by:

## Diploma report evidence map
- Увод: real problem, objectives and expected outcome.
- Теоретична част: CV/ML theory, methods, tradeoffs, risks.
- Практическа част: architecture, original code, dataset, training, experiments and measured results.
- Заключение: achieved objectives, limitations, future work.
- Литература: legal sources, libraries, papers, technical documentation.
- Приложения: diagrams, test logs, sample annotations, selected code and screenshots.

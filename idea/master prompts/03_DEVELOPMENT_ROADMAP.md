# Supabase-only Implementation Order — 30 Categories

**Required:** 01 → 02 → 02A → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13 → 14 → 15 → 16. Future: 17–29.

02 now defines PostgreSQL tables, migrations and domain contracts. 02A configures Supabase Auth, RLS and cloud repositories. There is **no local database category** and no persistent offline outbox. Remaining categories preserve their original scope.

**Authoritative docs:** master 11, 12, 13, 14, 15, 17; category 02 and 02A. The original project documentation is preserved as historical context where it discusses local-first storage.

---

## Original content (non-storage features retained; obsolete storage statements overridden)

# Cloud-first updated execution order (additive; original roadmap preserved below)

**30 categories total: the original 29 are unchanged and 02A is added.** Category 02 is reinterpreted using cloud-first precedence, and category 28 is now advanced cloud/smart cube only. Follow 01 → 02 → **02A** → 03 → ... → 29. Graduation delivery is 01–16 **plus 02A**.

- **01 Foundation/UI:** shell, auth routing placeholders, configuration and typed boundaries.
- **02 Data contracts/database:** Supabase schema design, repository interfaces, SQL migrations, IndexedDB outbox contract.
- **02A Supabase cloud foundation:** hosted project, Auth, RLS, actual cloud CRUD, durable local queue, multi-device sync tests.
- **03–06:** scrambles, timer, sessions, statistics using cloud-backed repositories and offline-tolerant local writes.
- **07–13:** camera/annotation/vision/training/inference/insights/experiments; no automatic media upload, preserve all original ML evidence.
- **14–16:** cloud-aware settings/backup, security/quality, hosted graduation release and offline fallback.
- **17–18:** verified moves and algorithm bridge.
- **19–26:** ultimate camera move/state/method/optimization research.
- **27–29:** optional scanner, smart cube/advanced cloud, daily challenges.

## Original chronological roadmap (retained verbatim after the revision notice)

> **CLOUD-FIRST ADDITIVE REVISION (2026-10-16).** This original specification is preserved in full for traceability. Where it describes IndexedDB as the authoritative database, local-only accounts, optional/future cloud, or cloud synchronization postponed until after graduation, those statements are superseded by `master prompts/11_CLOUD_FIRST_DECISION_AND_OVERRIDES.md`. **Supabase PostgreSQL + Auth are required from category 02; IndexedDB is a resilience cache/outbox, not the authoritative store.** No other requirements are removed. Read the cloud addendum and the original content together.

# Chronological development roadmap

01. **Foundation and UI** — Graduation — `prompts/01_foundation_ui/01_Foundation_and_UI.md`
02. **Local Database and Schema** — Graduation — `prompts/02_database/02_Supabase_PostgreSQL_Schema.md`
03. **Puzzles and Scrambles** — Graduation — `prompts/03_puzzles_scrambles/03_Puzzles_and_Scrambles.md`
04. **Timer and Inspection** — Graduation — `prompts/04_timer/04_Timer_and_Inspection.md`
05. **Solve History and Sessions** — Graduation — `prompts/05_solve_sessions/05_Solve_History_and_Sessions.md`
06. **Statistics and Progress** — Graduation — `prompts/06_statistics/06_Statistics_and_Progress.md`
07. **Camera Recording and Synchronization** — Graduation — `prompts/07_camera/07_Camera_Recording_and_Synchronization.md`
08. **Video Import and Manual Annotation** — Graduation — `prompts/08_video_import_annotation/08_Video_Import_and_Manual_Annotation.md`
09. **Computer Vision Feature Extraction** — Graduation — `prompts/09_vision_features/09_Computer_Vision_Feature_Extraction.md`
10. **Dataset and Model Training** — Graduation — `prompts/10_dataset_training/10_Dataset_and_Model_Training.md`
11. **Browser AI Inference** — Graduation — `prompts/11_inference/11_Browser_AI_Inference.md`
12. **Stage Timing and Training Insights** — Graduation — `prompts/12_training_insights/12_Stage_Timing_and_Training_Insights.md`
13. **AI Experiment and Evaluation Dashboard** — Graduation — `prompts/13_experiment_reporting/13_AI_Experiment_and_Evaluation_Dashboard.md`
14. **Settings, Export, Import and Privacy** — Graduation — `prompts/14_settings_backup/14_Settings_Export_Import_and_Privacy.md`
15. **Testing, Accessibility and Security** — Graduation — `prompts/15_quality_security/15_Testing_Accessibility_and_Security.md`
16. **Graduation Documentation and Release** — Graduation — `prompts/16_graduation_release/16_Graduation_Documentation_and_Release.md`
17. **Verified Moves and Cube Engine** — Post-graduation foundation — `prompts/17_verified_moves/17_Verified_Moves_and_Cube_Engine.md`
18. **Algorithm Library and Trainer** — Post-graduation foundation — `prompts/18_algorithm_library/18_Algorithm_Library_and_Trainer.md`
19. **Turn and Gesture Research Dataset** — Ultimate research — `prompts/19_turn_dataset/19_Turn_and_Gesture_Research_Dataset.md`
20. **Cube and Hand Observation** — Ultimate research — `prompts/20_cube_hand_observation/20_Cube_and_Hand_Observation.md`
21. **Camera Move Recognition** — Ultimate research — `prompts/21_turn_recognition/21_Camera_Move_Recognition.md`
22. **State Reconstruction and Recovery** — Ultimate research — `prompts/22_state_reconstruction/22_State_Reconstruction_and_Recovery.md`
23. **Method Recognition and Phase Analysis** — Ultimate research — `prompts/23_method_segmentation/23_Method_Recognition_and_Phase_Analysis.md`
24. **Method-Specific Solve Optimization** — Ultimate research — `prompts/24_solve_optimization/24_Method_Specific_Solve_Optimization.md`
25. **Personalized Coaching** — Ultimate research — `prompts/25_personal_coaching/25_Personalized_Coaching.md`
26. **Real-Time Tracking Pipeline** — Ultimate research — `prompts/26_realtime_tracking/26_Real_Time_Tracking_Pipeline.md`
27. **Cube Scanner and Solver** — Optional — `prompts/27_scanner_solver/27_Cube_Scanner_and_Solver.md`
28. **Smart Cube and Optional Cloud** — Optional — `prompts/28_smartcube_cloud/28_Smart_Cube_and_Optional_Cloud.md`
29. **Daily Scrambles and Gamification** — Optional — `prompts/29_daily_challenges/29_Daily_Scrambles_and_Gamification.md`

## Release policy
Graduation release gate follows module 16. Module 17+ is iterative post-graduation research; optional modules 27–29 can be implemented when core gates are stable.

# Implementation roadmap and strict gates

This is an ordering guide, not a claim that the repository already implements anything.

|Order|Agent prompt|Gate before moving on|
|---|---|---|
|1|`AGENT_PROMPTS/00_00_REPOSITORY_AUDIT.md`|Verified scoped tests and handoff report|
|2|`AGENT_PROMPTS/01_01_FOUNDATION_UI.md`|Verified scoped tests and handoff report|
|3|`AGENT_PROMPTS/02_02_SUPABASE_SCHEMA_SECURITY.md`|Verified scoped tests and handoff report|
|4|`AGENT_PROMPTS/03_03_TIMER.md`|Verified scoped tests and handoff report|
|5|`AGENT_PROMPTS/04_04_SCRAMBLES.md`|Verified scoped tests and handoff report|
|6|`AGENT_PROMPTS/05_05_SESSIONS_SOLVES.md`|Verified scoped tests and handoff report|
|7|`AGENT_PROMPTS/06_06_STATISTICS.md`|Verified scoped tests and handoff report|
|8|`AGENT_PROMPTS/07_07_CAMERA_RECORDING.md`|Verified scoped tests and handoff report|
|9|`AGENT_PROMPTS/08_08_VISION_FEATURES.md`|Verified scoped tests and handoff report|
|10|`AGENT_PROMPTS/09_09_DATASET_LABELING.md`|Verified scoped tests and handoff report|
|11|`AGENT_PROMPTS/10_10_BASELINE_ML_TRAINING.md`|Verified scoped tests and handoff report|
|12|`AGENT_PROMPTS/11_11_INFERENCE_TIMELINE.md`|Verified scoped tests and handoff report|
|13|`AGENT_PROMPTS/12_12_STAGE_TIMING_INSIGHTS.md`|Verified scoped tests and handoff report|
|14|`AGENT_PROMPTS/13_13_SETTINGS_EXPORT_IMPORT.md`|Verified scoped tests and handoff report|
|15|`AGENT_PROMPTS/14_14_SCANNER_SOLVER_OPTIONAL.md`|Verified scoped tests and handoff report|
|16|`AGENT_PROMPTS/15_15_SMART_CUBE_OPTIONAL.md`|Verified scoped tests and handoff report|
|17|`AGENT_PROMPTS/16_16_SECURITY_PRIVACY.md`|Verified scoped tests and handoff report|
|18|`AGENT_PROMPTS/17_17_E2E_PERFORMANCE.md`|Verified scoped tests and handoff report|
|19|`AGENT_PROMPTS/18_18_GRADUATION_RELEASE.md`|Verified scoped tests and handoff report|
|20|`AGENT_PROMPTS/19_19_FINAL_AUDIT.md`|Verified scoped tests and handoff report|

## Recommended milestones
1. Audit + foundation + Supabase schema/security + timer + scrambles + solves. At this gate a timed solve must save with the correct scramble and survive reload **only after server acknowledgment**.
2. Statistics + camera/import + deterministic feature extraction. At this gate a solve and recording can be linked and processed with visible errors.
3. Dataset/labels + baseline/ML + inference/timeline. At this gate baseline and model are compared on the same held-out split; missing data is explicitly a blocker.
4. Manual stage timing + insights + settings/export/import. At this gate a user can annotate stages and see non-speculative evidence-linked insights.
5. Security, E2E, graduation release and final independent audit.
6. Scanner/solver and smart cube are optional; execute only after graduation core is verified.

## Recommended agent cadence
Run one module at a time. Paste `AGENT_RULES.md`, architecture guide, matching prompt and source specs into the coding agent context or give it file access. Ask for a scoped plan, allow implementation, inspect test evidence and only then advance.
# Acceptance and evidence matrix

Record each check as PASS, FAIL, BLOCKED or NOT RUN, with command, timestamp, environment and commit. Do not treat source review as a passing test.

|Area|Demonstration|Required evidence|
|---|---|---|
|Authentication|A and B accounts cannot access each other's data|RLS SQL/integration tests|
|Persistence|Save acknowledgment and reload|Authenticated E2E and database record|
|Offline behavior|Timer works but unsaved data explicitly shown|Network-disabled browser test|
|Scrambles|Immutable scramble/puzzle association|Unit + E2E fixture|
|Timer|Hold/release, stop once, inspection boundaries|Fake-clock unit + E2E|
|Statistics|ao5/12/50/100 and DNF/+2|Golden vectors|
|Camera|Permission denial, cleanup, import fallback|Browser test and device matrix|
|Video|Recording start offset aligns seek times|Synthetic timestamp fixture|
|Features|Same ordered features and timestamps|Deterministic fixture and schema validation|
|Dataset|Participant/session split without leakage|Split manifest and automated audit|
|ML|Baseline vs model on identical held-out set|Actual evaluation artifacts, not invented numbers|
|Inference|Uncertainty and model manifest enforced|Mismatch and low-quality fixtures|
|Stages|Manual CFOP boundaries and custom methods|Annotation persistence and metric tests|
|Insights|Video seek and evidence-backed suggestions|Rule fixtures and provenance UI|
|Export|CSV/JSON valid and relationship-preserving|Round-trip import tests|
|Security|No cross-user access or silent video upload|Two-user RLS/storage tests|
|Release|Fresh installation and complete demonstration|CI output, recorded manual checklist|

## Required artifact evidence
Every module should update a `docs/verification/<module>.md` report with: exact commands and exit codes, tested commit, environment, failing cases, screenshots where relevant, and limitations. Keep secrets out of logs.

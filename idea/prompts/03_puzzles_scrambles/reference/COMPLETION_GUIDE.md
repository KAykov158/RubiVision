# Detailed explanation: how to complete the task

## Phase 0 — Audit before implementation
Do not let an agent assume a clean React app or install a second cubing library blindly. Determine existing framework, dependency versions, Supabase project configuration, migrations and timer behavior. Write an evidence matrix. If cloud-first master docs mentioned by the uploaded specification (sections 11–15, category 02A) are not present, record this as missing authoritative context rather than guessing their detailed requirements.

## Phase 1 — Domain model and contracts
Create a single authoritative puzzle enum and a typed immutable scramble record. Distinguish event code from UI label, generation provider from algorithm method, and local unsaved generation from server-confirmed persistence. Define service boundaries before UI. Preserve existing solve references and use additive migrations rather than breaking existing data.

## Phase 2 — Correct generation
Select a maintained library by checking real package APIs and license. 2x2 and 3x3 commonly have random-state approaches; larger puzzles commonly use event-specific random-move scrambles, but exact implementation and compliance must be verified against the selected provider and current WCA requirements. Support correct turn notation and length for each event; do not invent universal lengths or use random face letters as a substitute. Generate off critical timing path, test parseability and never recycle a stale result.

## Phase 3 — User experience
Selector, scramble display, copy, regenerate, clear loading and error feedback. Large cube strings need wrapping and stable typography. Separate active scramble from history. A race guard prevents late async results overwriting newer puzzle selections. Ensure keyboard and mobile behavior.

## Phase 4 — Timer linkage
The scramble is a transactionally relevant snapshot, not just text currently on the screen. Freeze its ID, puzzle, notation and provenance when timer enters its defined locked period. The save path uses that snapshot. Double stop and retry use the same solve UUID. Prevent puzzle switching and background generator completions from changing an active solve.

## Phase 5 — Supabase durability
Only Supabase PostgreSQL is persistent application storage under the latest uploaded override. Secure tables using foreign keys, unique IDs, row-level policies, and cross-entity ownership checks. A successful UI save means the server acknowledged the write. An offline attempt is not a saved solve; show in-memory retry and clear risk of loss on reload. Do not quietly add IndexedDB/localStorage outbox to solve this without changing the approved architecture.

## Phase 6 — History
Decide whether history means all generated scrambles or only scrambles attached to saved solves. If all, persistence volume and guest/offline semantics require explicit design. Use pagination and owner-scoped queries. History views never change active practice without user action.

## Phase 7 — Optional viewer
Apply scramble to known solved virtual cube. This does not observe or reconstruct the physical cube. Lazy load and isolate rendering so WebGL errors cannot interrupt timing. Verify inverses and event support.

## Phase 8 — Daily challenge
Treat daily challenge as its own immutable server-defined event if all users must see the same scramble. Specify day boundary, puzzle, version and participation rules. Practice scrambles remain independent. Without server availability, practice generation still works; do not invent an offline canonical challenge.

## Phase 9 — Verification
Unit tests validate parsing and state. Integration tests validate timer locking, retries, and DB ownership. E2E tests validate actual user flow. Test mobile, browser capabilities, network interruptions, rapid interaction, and multi-user access. Record exact commands and outputs. A spec is not proof of implementation; release only after evidence.

## Suggested incremental checkpoints
A: read-only audit; B: typed contracts; C: 2x2–7x7 generators; D: UI; E: timer snapshot; F: Supabase migration/RLS; G: history; H: optional viewer; I: daily challenge; J: release audit. Make a commit after each passing checkpoint. Prioritize A–G before optional polish.

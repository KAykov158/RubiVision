# Architecture, invariants and explicit design decisions

## End-to-end flow
User chooses puzzle → coordinator requests client-side generator → provider returns notation + version → event-specific parser validates → immutable Scramble displayed → timer captures snapshot → stop produces idempotent Solve → repository sends atomic cloud save → Supabase confirms → history and statistics query by user ownership. Failure before confirmation remains UNSAVED in memory and must not be advertised as persisted. Optional viewer consumes scramble, never controls timer.

## States
Generator: IDLE, GENERATING, READY, ERROR; request counter guards late completions. Timer: defer to actual existing state machine; never reset during generation. Persistence: UNSAVED, SAVING, SAVED, FAILED_RETRYABLE, FAILED_PERMANENT. History: LOADING, READY, EMPTY, ERROR. These are suggestions to reconcile with actual code.

## Data invariants
1. UUID is unique and immutable. 2. Puzzle in solve, scramble and session agrees. 3. Text is preserved exactly; never silently normalize after display. 4. Provider ID, method and version accompany persisted scramble. 5. User cannot read/write other users' data or attach foreign scramble. 6. Stale generation never replaces current. 7. During timer lock, puzzle and scramble cannot change. 8. One completed solve produces at most one durable record even with retries. 9. Daily challenge never replaces practice without explicit mode change. 10. A preview represents known scramble state only.

## Decisions to record before coding
A. How authentication works for guest users. B. Persist every generated scramble or only linked solves (history semantics). C. Whether the challenge day is UTC or local. D. Provider per puzzle and random-state/move method. E. Duplicate handling threshold. F. Session-switch policy mid-timer. G. Whether viewer supports all puzzles. H. Database FK/ownership enforcement approach. I. What counts as a cloud-confirmed save. J. WCA claims and exact official source/date.

## Failure contract
Network offline: generation works; cloud save fails visibly, no durable guarantee. Browser reload before cloud acknowledgment: may lose unsaved solve, warn. Clipboard denial: manual select/copy. Unsupported viewer: text only. Provider failure: error with retry, never reuse previous silently. Malformed scramble: reject and report. Auth expired: save fails with sign-in action; keep in-memory unsaved result. Duplicate response: dedupe by solve ID. Unsupported browser worker: safe non-blocking fallback if feasible, otherwise explicit error.

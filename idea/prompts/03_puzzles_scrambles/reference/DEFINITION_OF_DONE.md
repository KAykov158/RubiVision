# Definition of done / release gate

The module is complete ONLY when all are supported by file paths, test IDs, command outputs and a recorded environment:

- All 2x2–7x7 selectors and generator mappings tested.
- Provider/version/method provenance stored; notation validated and immutable.
- Random-state versus random-move accurately described for each event.
- Async generation cannot overwrite newer requests or active solves.
- Copy, regenerate, history, locking and failure UX verified on mobile/desktop.
- Saved solves reference exact displayed scramble with unique idempotency and matching puzzle.
- Supabase migrations and RLS ownership tested with at least two users and forbidden cross-user references.
- Offline scramble generation demonstrated; offline durable save is NOT claimed.
- Cloud failures, auth expiry and reload-before-save limitations explained.
- Daily challenge isolation tested, or explicitly marked incomplete with scope decision.
- Viewer is optional and cannot break timer; only known scramble state shown.
- Typecheck, lint, tests, build and demo executed, with honest results and remaining issues.

## Demo script
1. Open app and choose 2x2; generate, copy and regenerate. 2. Repeat for 3x3–7x7. 3. Start a 3x3 solve, trigger background generation and show locked scramble unchanged. 4. Stop twice and verify only one record. 5. Inspect persisted scramble and generator metadata in history after cloud acknowledgment. 6. Simulate offline: generate scramble, complete solve, show UNSAVED and retry after reconnect. 7. Try cross-user history access and verify rejection. 8. Show daily challenge mode separate from practice. 9. Disable WebGL and confirm text/timer work. 10. Show test evidence and known limitations.

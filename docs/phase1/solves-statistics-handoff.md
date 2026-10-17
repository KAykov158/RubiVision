# Prompt 8: Solves and Statistics UI handoff

## Solves integration

`SolvesPage` reads records only through the injected `AppServices.solves.list` repository. It uses the existing `Solve` contract and `effectiveTimeMs` domain function. Puzzle filtering is passed to the repository; search, date filtering, and sort order are transient presentation state. The session filter stays disabled because no session-list service exists. Session and scramble identifiers are displayed as identifiers because the contracts do not provide their labels or scramble notation. Loading, empty, unavailable, and service-error results are represented explicitly; retry invokes the same repository method.

## Statistics integration

There is no statistics service or aggregate contract in `AppServices`. This page therefore shows no calculated values or sample chart points. Future integration should add an owner-defined typed statistics service that returns verified aggregates and trend points from real solve history. A view model should identify its puzzle/session/date scope and represent insufficient samples and DNF handling explicitly. The page's summary cards, scope controls, chart slot, and accessible trend table are presentation slots only until that service is supplied.

## Persistence and verification boundary

This prompt adds no persistence adapter or browser storage. A configured solve repository may provide records, but this UI makes no claim that records are cloud-backed; the adapter's implementation and Supabase integration must be verified separately. Browser checks verify the current unavailable-state shell, route navigation, responsive layout, and theme rendering. The component tests inject typed service responses to cover loading, empty, error, retry, and penalty display.

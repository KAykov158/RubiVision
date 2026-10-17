# Timer page shell handoff

**Status:** Prompt 7 presentation shell. Timer, scramble, session, solve, and statistics behavior is not implemented here.

## Current page ownership

- `TimerPageShell` owns only the selected puzzle control as transient component state. It does not persist that choice.
- Timer state, keyboard/touch event handling, monotonic time measurement, inspection rules, and start/stop transitions belong to the Timer runtime in the timer phase. That runtime must be provided above the route outlet so route changes do not reset it.
- Scramble generation and scramble provenance belong to the injected `ScrambleService` and its owning feature. The page must display the exact `Scramble` returned for the selected `PuzzleType` and keep it stable for an active solve.
- Session selection and lifecycle belong to the session feature. Solve history and persistence belong to `SolveRepository`; statistics belong to the statistics feature and must be derived from persisted canonical `Solve` records.
- The route owns loading/empty/unavailable/error presentation only. It must not call Supabase, write to browser storage, fabricate successful service results, or show sample values as user data.

## Phase 2 presentation integration contract

When the timer phase implements the real runtime, replace the shell's local placeholder values with a view-model supplied by an app-level provider. Keep the route presentational. The page-facing props should have this shape, using the existing canonical types from `shared/domain/contracts.ts`:

```ts
type TimerPhase = 'IDLE' | 'HOLDING' | 'READY' | 'RUNNING' | 'STOPPED';

interface TimerPageViewModel {
  puzzle: PuzzleType;
  session: Session | null;
  scramble: Scramble | null;
  phase: TimerPhase;
  elapsedMs: number | null;
  inspectionElapsedMs: number | null;
  recentSolves: readonly Solve[];
  statistics: {
    bestMs: number | null;
    averageOf5Ms: number | null;
    averageOf12Ms: number | null;
  } | null;
  availability: {
    timer: 'ready' | 'unavailable' | 'error';
    scramble: 'loading' | 'ready' | 'empty' | 'unavailable' | 'error';
    session: 'ready' | 'empty' | 'unavailable' | 'error';
    recentSolves: 'loading' | 'ready' | 'empty' | 'unavailable' | 'error';
    statistics: 'loading' | 'ready' | 'empty' | 'unavailable' | 'error';
  };
  onPuzzleChange(puzzle: PuzzleType): void;
  onSessionChange(sessionId: Session['id'] | null): void;
  onStart(source: TimingSource): void;
  onStop(): void;
  onRequestScramble(): void;
}
```

The provider/runtime owns transition validity, input filtering, source attribution, monotonic timing, and scramble/session consistency. The route presents the current snapshot and forwards explicit user actions. The service layer owns asynchronous operations and maps `ServiceResult<T>` to the `availability` state; the UI maps those states to the shared loading, empty, unavailable, and error primitives. A missing timer implementation leaves start/stop controls disabled. A timing result becomes a `Solve` only after the owning persistence service confirms it; this shell has no save action or success state.

These props document the next feature boundary. They are not runtime contracts yet, and Prompt 7 does not add a timer service, timer state machine, or new shared domain interface.

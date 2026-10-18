import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type SelectHTMLAttributes } from 'react';
import { Link } from 'react-router';
import { Badge, Button, Card } from '../shared/components/primitives';
import type { PuzzleType, Scramble, Session, TimingSource } from '../shared/domain/contracts';
import { useTranslation } from '../shared/i18n/useTranslation';
import { RouteState } from './RouteState';
import { ScrambleDisplay } from './ScrambleDisplay';
import { SevenSegmentTimer } from './SevenSegmentTimer';
import { useAuth } from '../features/auth/authContext';
import { useTimerCompletion, type TimerCompletion } from '../features/timer/timerCompletionContext';
import { useAppServices } from './useAppServices';

const puzzleTypes: PuzzleType[] = ['222', '333', '444', '555', '666', '777'];
const puzzleLabel = (type: PuzzleType) => `${type[0]}\u00D7${type[0]}\u00D7${type[0]}`;

function SelectorIcon({ kind }: { kind: 'puzzle' | 'session' }) {
  return kind === 'puzzle' ? (
    <svg aria-hidden="true" className="timer-page__selector-icon" viewBox="0 0 24 24" fill="none">
      <path d="m12 2.8 8.1 4.6v9.2L12 21.2l-8.1-4.6V7.4L12 2.8Z" />
      <path d="m3.9 7.4 8.1 4.7 8.1-4.7M12 12.1v9.1M8 5.1l8.1 4.7M16 5.1 7.9 9.8" />
    </svg>
  ) : (
    <svg aria-hidden="true" className="timer-page__selector-icon" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5" width="16" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M4 10h16m-11 4h2m3 0h2m-7 3h2" />
    </svg>
  );
}

function TimerSelector({
  id,
  label,
  kind,
  className = '',
  children,
  ...selectProps
}: SelectHTMLAttributes<HTMLSelectElement> & { id: string; label: string; kind: 'puzzle' | 'session'; className?: string }) {
  return (
    <div className={`rv-field timer-page__selector-field ${className}`.trim()}>
      <label className="rv-field__label" htmlFor={id}>{label}</label>
      <div className="timer-page__selector-control">
        <SelectorIcon kind={kind} />
        <select {...selectProps} id={id} className="rv-select timer-page__selector" aria-label={label}>
          {children}
        </select>
        <span aria-hidden="true" className="timer-page__selector-chevron" />
      </div>
    </div>
  );
}

function formatTimerTime(milliseconds: number) {
  const safeMs = Math.max(0, Math.floor(milliseconds));
  const centiseconds = Math.floor(safeMs / 10);
  return `${String(Math.floor(centiseconds / 100)).padStart(2, '0')}.${String(centiseconds % 100).padStart(2, '0')}`;
}

function recoveryJson(completion: TimerCompletion) {
  return JSON.stringify({
    schemaVersion: 1,
    solve: {
      id: completion.solveId,
      puzzle: completion.puzzle,
      rawTimeMs: completion.rawTimeMs,
      penalty: completion.penalty,
      startedAt: completion.startedAt,
      completedAt: completion.completedAt,
      timingSource: completion.timingSource,
      scrambleId: completion.scramble?.id ?? null,
      sessionId: completion.selectedSessionId ?? null,
    },
    scramble: completion.scramble,
  }, null, 2);
}

export function TimerPageShell() {
  const t = useTranslation();
  const auth = useAuth();
  const appServices = useAppServices();
  const [puzzle, setPuzzle] = useState<PuzzleType>('333');
  const [scrambleResult, setScrambleResult] = useState<{ puzzle: PuzzleType; scramble: Scramble | null } | null>(null);
  const [sessionResult, setSessionResult] = useState<{ ownerId: string; puzzle: PuzzleType; sessions: Session[]; status: 'ready' | 'error' } | null>(null);
  const [sessionSelection, setSessionSelection] = useState<{ ownerId: string; puzzle: PuzzleType; id: string } | null>(null);
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [holdState, setHoldState] = useState<'idle' | 'holding' | 'armed'>('idle');
  const keyboardPhase = useRef<'idle' | 'holding' | 'armed' | 'running' | 'stopped'>('idle');
  const holdSource = useRef<'keyboard' | 'pointer' | null>(null);
  const holdTimeout = useRef<number | null>(null);
  const { pending, activeRun, elapsedMs, startTimer: beginRun, stopTimer, retry } = useTimerCompletion();
  const running = activeRun !== null;
  const blocksNextRun = Boolean(pending && pending.status !== 'saved');
  const selectedPuzzle = activeRun?.puzzle ?? (pending && pending.status !== 'saved' ? pending.completion.puzzle : puzzle);
  const sessionRepository = appServices.status === 'ready' ? appServices.services.sessions : undefined;
  const scramble = scrambleResult?.puzzle === puzzle ? scrambleResult.scramble : null;
  const scrambleStatus = appServices.status !== 'ready'
    ? 'unavailable'
    : scrambleResult?.puzzle === puzzle ? (scramble ? 'ready' : 'unavailable') : 'loading';
  const currentSessionResult = auth.status === 'signed-in'
    && sessionResult?.ownerId === auth.user?.id
    && sessionResult?.puzzle === puzzle ? sessionResult : null;
  const sessions = currentSessionResult?.sessions ?? [];
  const sessionStatus = auth.status === 'loading'
    ? 'loading'
    : auth.status !== 'signed-in'
      ? 'signed-out'
      : !sessionRepository
        ? appServices.status === 'ready' ? 'unavailable' : 'error'
        : currentSessionResult?.status ?? 'loading';
  const selectedSessionId = auth.status === 'signed-in'
    && sessionSelection?.ownerId === auth.user?.id
    && sessionSelection?.puzzle === puzzle
    ? sessionSelection?.id ?? ''
    : sessions[0]?.id ?? '';
  const generatorRefreshKey = pending?.status === 'saved' ? pending.completion.solveId : '';
  const overviewStatistics = [
    { key: 'single', label: 'timerStatSingle' },
    { key: 'ao5', label: 'timerStatAo5' },
    { key: 'ao12', label: 'timerStatAo12' },
  ] as const;

  const startTimer = useCallback((timingSource: TimingSource) => {
    if (blocksNextRun || scrambleStatus === 'loading' || keyboardPhase.current === 'holding' || keyboardPhase.current === 'armed') return;
    setRecoveryMessage('');
    beginRun(puzzle, scramble, selectedSessionId || undefined, timingSource);
  }, [beginRun, blocksNextRun, puzzle, scramble, scrambleStatus, selectedSessionId]);

  const cancelHold = useCallback(() => {
    if (holdTimeout.current !== null) window.clearTimeout(holdTimeout.current);
    holdTimeout.current = null;
    keyboardPhase.current = 'idle';
    holdSource.current = null;
    setHoldState('idle');
  }, []);
  const keyboardActions = useRef({ activeRun, blocksNextRun, scrambleStatus, startTimer, stopTimer });
  useEffect(() => {
    keyboardActions.current = { activeRun, blocksNextRun, scrambleStatus, startTimer, stopTimer };
  }, [activeRun, blocksNextRun, scrambleStatus, startTimer, stopTimer]);

  const beginHold = useCallback((source: 'keyboard' | 'pointer') => {
    const actions = keyboardActions.current;
    if (keyboardPhase.current !== 'idle' || actions.activeRun || actions.blocksNextRun || actions.scrambleStatus === 'loading') return;
    keyboardPhase.current = 'holding';
    holdSource.current = source;
    setHoldState('holding');
    holdTimeout.current = window.setTimeout(() => {
      if (keyboardPhase.current !== 'holding') return;
      keyboardPhase.current = 'armed';
      setHoldState('armed');
    }, 550);
  }, []);

  const releaseHold = useCallback((source: 'keyboard' | 'pointer') => {
    if (holdSource.current !== source) return;
    if (keyboardPhase.current === 'holding') {
      cancelHold();
    } else if (keyboardPhase.current === 'armed') {
      if (holdTimeout.current !== null) window.clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
      holdSource.current = null;
      keyboardPhase.current = 'running';
      setHoldState('idle');
      keyboardActions.current.startTimer(source === 'keyboard' ? 'KEYBOARD' : 'TOUCH');
    } else if (keyboardPhase.current === 'stopped') {
      keyboardPhase.current = 'idle';
      holdSource.current = null;
    }
  }, [cancelHold]);

  const onTimerPointerDown = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    const actions = keyboardActions.current;
    if (actions.activeRun || keyboardPhase.current === 'running') {
      keyboardPhase.current = 'stopped';
      holdSource.current = 'pointer';
      setHoldState('idle');
      actions.stopTimer();
      return;
    }
    beginHold('pointer');
    if (holdSource.current === 'pointer') event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [beginHold]);

  const onTimerPointerUp = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    releaseHold('pointer');
  }, [releaseHold]);

  const onTimerPointerCancel = useCallback(() => {
    if (holdSource.current !== 'pointer') return;
    if (keyboardPhase.current === 'holding' || keyboardPhase.current === 'armed') cancelHold();
    else {
      keyboardPhase.current = 'idle';
      holdSource.current = null;
    }
  }, [cancelHold]);

  useEffect(() => {
    let active = true;
    if (running || blocksNextRun) return () => { active = false; };
    if (appServices.status !== 'ready') return () => { active = false; };
    void appServices.services.scrambles.generate(puzzle).then((result) => {
      if (!active) return;
      if (result.status === 'success'
        && result.data.puzzle === puzzle
        && typeof result.data.notation === 'string'
        && result.data.notation.trim()) {
        setScrambleResult({ puzzle, scramble: result.data });
      } else {
        setScrambleResult({ puzzle, scramble: null });
      }
    }).catch(() => {
      if (active) setScrambleResult({ puzzle, scramble: null });
    });
    return () => { active = false; };
  }, [appServices, blocksNextRun, generatorRefreshKey, puzzle, running]);

  useEffect(() => {
    let active = true;
    if (auth.status !== 'signed-in') return () => { active = false; };
    const ownerId = auth.user?.id;
    if (!ownerId) return () => { active = false; };
    if (!sessionRepository) {
      return () => { active = false; };
    }
    void sessionRepository.list().then((result) => {
      if (!active) return;
      if (result.status !== 'success') {
        setSessionResult({ ownerId, puzzle, sessions: [], status: 'error' });
        return;
      }
      const matchingPuzzleSessions = result.data.filter((item) => item.puzzle === puzzle);
      setSessionResult({ ownerId, puzzle, sessions: matchingPuzzleSessions, status: 'ready' });
    }).catch(() => {
      if (active) setSessionResult({ ownerId, puzzle, sessions: [], status: 'error' });
    });
    return () => { active = false; };
  }, [appServices.status, auth.status, auth.user?.id, puzzle, sessionRepository]);

  useEffect(() => {
    const isInteractiveTarget = (target: EventTarget | null) => target instanceof Element
      && Boolean(target.closest('input, textarea, select, button, a, [role="textbox"], [role="combobox"], [contenteditable]:not([contenteditable="false"])'));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return;
      const timerControl = event.target instanceof Element && Boolean(event.target.closest('[data-timer-control]'));
      if (isInteractiveTarget(event.target) && !timerControl) return;
      event.preventDefault();
      if (event.repeat) return;
      if (keyboardPhase.current === 'holding' || keyboardPhase.current === 'armed' || keyboardPhase.current === 'stopped') return;
      const actions = keyboardActions.current;
      if (actions.activeRun || keyboardPhase.current === 'running') {
        if (holdTimeout.current !== null) window.clearTimeout(holdTimeout.current);
        holdTimeout.current = null;
        keyboardPhase.current = 'stopped';
        holdSource.current = 'keyboard';
        setHoldState('idle');
        actions.stopTimer();
        return;
      }
      beginHold('keyboard');
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return;
      if (holdSource.current !== 'keyboard') return;
      event.preventDefault();
      if (isInteractiveTarget(event.target)) {
        cancelHold();
        return;
      }
      releaseHold('keyboard');
    };
    const onBlur = () => {
      if (keyboardPhase.current === 'holding' || keyboardPhase.current === 'armed' || keyboardPhase.current === 'stopped') cancelHold();
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      if (holdTimeout.current !== null) window.clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
      keyboardPhase.current = 'idle';
      holdSource.current = null;
    };
  }, [beginHold, cancelHold, releaseHold]);

  async function copyRecovery() {
    if (!pending || pending.status === 'saved') return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(recoveryJson(pending.completion));
      setRecoveryMessage('Recovery copy copied.');
    } catch {
      setRecoveryMessage('Copy is unavailable here. Select and copy the recovery data below, or download it.');
    }
  }

  function downloadRecovery() {
    if (!pending || pending.status === 'saved') return;
    try {
      const blobUrl = URL.createObjectURL(new Blob([recoveryJson(pending.completion)], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `rubivision-unsaved-solve-${pending.completion.solveId}.json`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1_000);
      setRecoveryMessage('Recovery file downloaded.');
    } catch {
      setRecoveryMessage('Download is unavailable here. Select and copy the recovery data below.');
    }
  }

  const displayedTime = running || pending ? formatTimerTime(elapsedMs) : '00.00';

  return (
    <main className="rv-page-container app-main timer-page" id="main-content" tabIndex={-1}>
      <header className="timer-page__header rv-visually-hidden">
        <h1>{t('timerTitle')}</h1>
        <p className="app-page-description">{t('timerDescription')}</p>
      </header>

      <div className="timer-page__layout">
        <section className="timer-page__workspace" aria-label={t('timerWorkspaceLabel')}>
          <div className="timer-page__toolbar">
            <TimerSelector
              id="timer-puzzle"
              label={t('timerPuzzleLabel')}
              kind="puzzle"
              value={selectedPuzzle}
              disabled={running || blocksNextRun}
              aria-describedby="timer-puzzle-hint"
              onChange={(event) => setPuzzle(event.currentTarget.value as PuzzleType)}
            >
              {puzzleTypes.map((type) => <option key={type} value={type}>{puzzleLabel(type)}</option>)}
            </TimerSelector>
            <TimerSelector
              id="timer-session"
              label={t('timerSessionLabel')}
              kind="session"
              value={selectedSessionId}
              disabled={running || blocksNextRun || sessionStatus !== 'ready' || sessions.length === 0}
              aria-describedby="timer-session-hint"
              onChange={(event) => auth.user && setSessionSelection({ ownerId: auth.user.id, puzzle, id: event.currentTarget.value })}
            >
              {sessionStatus === 'loading' && <option value="">Loading sessions…</option>}
              {sessionStatus === 'signed-out' && <option value="">Sign in</option>}
              {sessionStatus === 'unavailable' && <option value="">Sessions unavailable</option>}
              {sessionStatus === 'error' && <option value="">Could not load sessions</option>}
              {sessionStatus === 'ready' && sessions.length === 0 && <option value="">No sessions for this puzzle</option>}
              {sessions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </TimerSelector>
            <p className="timer-page__hint timer-page__toolbar-hint" id="timer-session-hint">
              {sessionStatus === 'signed-out' ? 'Sign in to load and select an account session.' : sessionStatus === 'ready' && sessions.length === 0 ? 'A Practice session is created only when a real scramble is available to save.' : 'The selected session is captured when timing starts.'}
            </p>
            <p className="timer-page__hint rv-visually-hidden" id="timer-puzzle-hint">{t('timerPuzzleHint')}</p>
          </div>

          <Card className="timer-page__scramble" aria-labelledby="timer-scramble-heading">
            <div className="timer-page__section-heading">
              <h2 id="timer-scramble-heading">{t('timerScrambleTitle')}</h2>
              <Badge tone={scramble ? 'neutral' : 'warning'}>{scramble ? 'Ready' : t('unavailableBadge')}</Badge>
            </div>
            <ScrambleDisplay scramble={scramble} unavailableMessage={t('timerScrambleUnavailable')} />
            <p className="timer-page__hint">{t('timerSelectedPuzzle')}: <strong>{puzzleLabel(selectedPuzzle)}</strong></p>
          </Card>

          <Card className="timer-page__readout" aria-labelledby="timer-display-heading">
            <div className="timer-page__section-heading">
              <h2 id="timer-display-heading">{t('timerDisplayLabel')}</h2>
              <Badge tone={running ? 'warning' : 'neutral'}>{running ? t('timerRunning') : t('timerIdle')}</Badge>
            </div>
            <div className={`timer-page__digits${holdState === 'idle' ? '' : ` timer-page__digits--${holdState}`}`} role="timer" aria-label={displayedTime}>
              <SevenSegmentTimer value={displayedTime} />
              <span className="rv-visually-hidden">{displayedTime}</span>
              <button
                aria-describedby="timer-touch-instructions"
                aria-keyshortcuts="Space"
                aria-label="Timer control"
                aria-pressed={running}
                className="timer-page__touch-control"
                data-timer-control="true"
                onLostPointerCapture={onTimerPointerCancel}
                onPointerCancel={onTimerPointerCancel}
                onPointerDown={onTimerPointerDown}
                onPointerUp={onTimerPointerUp}
                type="button"
              />
            </div>
            <p className="timer-page__hint">{running ? 'Timing uses a monotonic clock.' : scramble ? 'The displayed scramble is captured with this solve.' : 'Timing remains available, but saving requires a real scramble snapshot.'}</p>
            <p className="timer-page__instruction" id="timer-touch-instructions">{running ? 'Press Space or tap the timer display to stop.' : 'Press and hold Space or the timer display until green, then release to start. Unsaved solves stay in memory and block another run until saved or recovered.'}</p>
            {pending && <section aria-live="polite" className={`timer-page__save-state timer-page__save-state--${pending.status}`}>
              <h3>{pending.status === 'saved' ? 'Saved' : pending.status === 'saving' ? 'Saving solve' : 'Solve not saved'}</h3>
              <p role="status">{pending.message}</p>
              {pending.status !== 'saved' && <>
                {pending.message.includes('signed out') && <p><Link to="/auth/sign-in">Sign in to save this solve</Link></p>}
                <div className="timer-page__actions">
                  {pending.completion.scramble && <Button disabled={pending.status === 'saving'} onClick={retry}>Retry save</Button>}
                  <Button onClick={() => void copyRecovery()} variant="secondary">Copy recovery data</Button>
                  <Button onClick={downloadRecovery} variant="secondary">Download recovery file</Button>
                </div>
                <label className="rv-field">
                  <span className="rv-field__label">Volatile recovery data</span>
                  <textarea aria-label="Volatile recovery data" className="rv-input" readOnly rows={8} value={recoveryJson(pending.completion)} />
                </label>
                {recoveryMessage && <p role="status">{recoveryMessage}</p>}
                <p className="timer-page__hint">This unsaved solve exists only in memory. Download or copy it before reloading or closing this tab.</p>
              </>}
            </section>}
          </Card>

          <section className="timer-page__stats-section" aria-labelledby="timer-statistics-heading">
            <div className="timer-page__section-heading">
              <h2 id="timer-statistics-heading">{t('timerStatisticsTitle')}</h2>
              <span className="timer-page__hint">{t('timerStatisticsUnavailable')}</span>
            </div>
            <div className="timer-page__stats">
              <Card><h3>{t('timerStatBest')}</h3><p aria-label={t('statisticsNoValue')}>—</p></Card>
              <Card><h3>{t('timerStatAo5')}</h3><p aria-label={t('statisticsNoValue')}>—</p></Card>
              <Card><h3>{t('timerStatAo12')}</h3><p aria-label={t('statisticsNoValue')}>—</p></Card>
              <Card className="timer-page__cube-card" aria-labelledby="timer-visualization-heading">
                <h3 id="timer-visualization-heading">{t('timerVisualizationTitle')}</h3>
                <div className="timer-page__visualization" role="img" aria-label={t('timerVisualizationUnavailable')}><span aria-hidden="true">{t('timerVisualizationMark')}</span></div>
              </Card>
            </div>
          </section>
        </section>

        <aside className="timer-page__session-rail" aria-label={t('timerSupportingSections')}>
          <Card className="timer-page__overview" aria-labelledby="timer-overview-heading">
            <div className="timer-page__panel-heading">
              <span aria-hidden="true" className="timer-page__panel-icon">◈</span>
              <h2 id="timer-overview-heading">{t('timerSessionOverviewTitle')}</h2>
            </div>
            <p className="timer-page__hint">{t('timerStatisticsUnavailable')}</p>
            <div className="timer-page__overview-head" aria-hidden="true"><span></span><span>{t('timerCurrentLabel')}</span><span>{t('timerBestLabel')}</span></div>
            <dl className="timer-page__overview-list">
              {overviewStatistics.map(({ key, label }) => (
                <div className="timer-page__overview-row" key={key}>
                  <dt>{t(label)}</dt>
                  <dd aria-label={t('statisticsNoValue')}>—</dd>
                  <dd aria-label={t('statisticsNoValue')}>—</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card className="timer-page__history" aria-labelledby="timer-recent-heading">
            <div className="timer-page__panel-heading">
              <span aria-hidden="true" className="timer-page__panel-icon">◷</span>
              <h2 id="timer-recent-heading">{t('timerRecentSolvesTitle')}</h2>
            </div>
            <RouteState state="unavailable" title={t('timerRecentSolvesUnavailableTitle')} description={t('timerRecentSolvesUnavailable')} />
          </Card>
          <Card className="timer-page__inspection" aria-labelledby="timer-inspection-heading">
            <h2 id="timer-inspection-heading">{t('timerInspectionTitle')}</h2>
            <p className="timer-page__hint">{t('timerInspectionUnavailable')}</p>
          </Card>
        </aside>
      </div>
    </main>
  );
}

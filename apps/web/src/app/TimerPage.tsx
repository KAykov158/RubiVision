import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { Link } from 'react-router';
import { Badge, Button, Card } from '../shared/components/primitives';
import type { PuzzleType, Scramble, TimingSource } from '../shared/domain/contracts';
import { solveTimeDifference, formatSolveTimeDifference } from '../features/timer/solveTimeDifference';
import { useTranslation } from '../shared/i18n/useTranslation';
import { RouteState } from './RouteState';
import { ScrambleDisplay } from './ScrambleDisplay';
import { ScrambleCubePreview, type CubePreviewLoader } from './ScrambleCubePreview';
import { SevenSegmentTimer } from './SevenSegmentTimer';
import { useAuth } from '../features/auth/authContext';
import { useTimerCompletion, type TimerCompletion } from '../features/timer/timerCompletionContext';
import { useAppServices } from './useAppServices';
import { effectiveTimeMs } from '../shared/domain/effectiveTimeMs';

const puzzleTypes: PuzzleType[] = ['222', '333', '444', '555', '666', '777'];
const puzzleLabel = (type: PuzzleType) => `${type[0]}\u00D7${type[0]}`;

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

type TimerSelectorOption = { value: string; label: string; disabled?: boolean };

function TimerSelector({
  id,
  label,
  kind,
  value,
  disabled = false,
  describedBy,
  options,
  onChange,
}: {
  id: string;
  label: string;
  kind: 'puzzle' | 'session';
  value: string;
  disabled?: boolean;
  describedBy?: string;
  options: TimerSelectorOption[];
  onChange: (event: { currentTarget: { value: string } }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const controlRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOption = options[selectedIndex];
  const enabledIndices = options.flatMap((option, index) => option.disabled ? [] : [index]);

  useEffect(() => {
    if (!open) return;
    const dismissOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !controlRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', dismissOutside);
    return () => document.removeEventListener('pointerdown', dismissOutside);
  }, [open]);

  const close = (restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };
  const choose = (index: number) => {
    const option = options[index];
    if (!option || option.disabled || disabled) return;
    onChange({ currentTarget: { value: option.value } });
    close(true);
  };
  const moveActive = (direction: 1 | -1) => {
    const currentPosition = enabledIndices.indexOf(activeIndex);
    const nextPosition = currentPosition < 0
      ? direction > 0 ? 0 : enabledIndices.length - 1
      : (currentPosition + direction + enabledIndices.length) % enabledIndices.length;
    setActiveIndex(enabledIndices[nextPosition] ?? selectedIndex);
  };
  const onKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : enabledIndices[0] ?? 0);
        setOpen(true);
      } else moveActive(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setActiveIndex(event.key === 'Home' ? enabledIndices[0] ?? 0 : enabledIndices.at(-1) ?? 0);
      setOpen(true);
    } else if ((event.key === 'Enter' || event.key === ' ') && !open) {
      event.preventDefault();
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : enabledIndices[0] ?? 0);
      setOpen(true);
    } else if (event.key === 'Enter' && open) {
      event.preventDefault();
      choose(activeIndex);
    } else if (event.key === ' ' && open) {
      event.preventDefault();
      choose(activeIndex);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      close(true);
    }
  };

  return (
    <div className={`rv-field timer-page__selector-field${open ? ' is-open' : ''}`} ref={controlRef}>
      <label className="rv-field__label" htmlFor={id}>{label}</label>
      <div className="timer-page__selector-control">
        <SelectorIcon kind={kind} />
        <button
          aria-activedescendant={open ? `${listboxId}-option-${activeIndex}` : undefined}
          aria-controls={listboxId}
          aria-describedby={describedBy}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={label}
          aria-valuetext={selectedOption?.label}
          className="timer-page__selector"
          data-value={value}
          disabled={disabled}
          id={id}
          onClick={() => {
            if (!open) setActiveIndex(selectedIndex >= 0 ? selectedIndex : enabledIndices[0] ?? 0);
            setOpen((wasOpen) => !wasOpen);
          }}
          onKeyDown={onKeyDown}
          ref={triggerRef}
          role="combobox"
          type="button"
        >
          <span className="timer-page__selector-value">{selectedOption?.label ?? options[0]?.label ?? ''}</span>
          <span aria-hidden="true" className="timer-page__selector-chevron" />
        </button>
        {open && <div className="timer-page__selector-menu" id={listboxId} role="listbox" aria-label={label}>
          {options.map((option, index) => (
            <div
              aria-disabled={option.disabled || undefined}
              aria-selected={option.value === value}
              className={`timer-page__selector-option${index === activeIndex ? ' is-active' : ''}`}
              id={`${listboxId}-option-${index}`}
              key={option.value}
              onClick={() => choose(index)}
              onPointerMove={() => !option.disabled && setActiveIndex(index)}
              role="option"
            >
              {option.label}
            </div>
          ))}
        </div>}
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

export function TimerPageShell({ loadCubeViewer }: { loadCubeViewer?: CubePreviewLoader } = {}) {
  const t = useTranslation();
  const auth = useAuth();
  const appServices = useAppServices();
  const [puzzle, setPuzzle] = useState<PuzzleType>('333');
  const [scrambleResult, setScrambleResult] = useState<{ puzzle: PuzzleType; requestKey: string; status: 'ready' | 'error'; scramble: Scramble | null } | null>(null);
  const [regenerationCount, setRegenerationCount] = useState(0);
  const [scrambleCopyMessage, setScrambleCopyMessage] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [holdState, setHoldState] = useState<'idle' | 'holding' | 'armed'>('idle');
  const keyboardPhase = useRef<'idle' | 'holding' | 'armed' | 'running' | 'stopped'>('idle');
  const holdSource = useRef<'keyboard' | 'pointer' | null>(null);
  const holdTimeout = useRef<number | null>(null);
  const {
    pending,
    activeRun,
    elapsedMs,
    startTimer: beginRun,
    stopTimer,
    retry,
    sessionSnapshot: sessionResult,
    setSessionSnapshot: setSessionResult,
    sessionSelection,
    setSessionSelection,
    comparisonSnapshot: comparisonResult,
    setComparisonSnapshot: setComparisonResult,
    sessionValidationKey,
    setSessionValidationKey,
  } = useTimerCompletion();
  const running = activeRun !== null;
  const blocksNextRun = Boolean(pending && pending.status !== 'saved');
  const selectedPuzzle = activeRun?.puzzle ?? (pending && pending.status !== 'saved' ? pending.completion.puzzle : puzzle);
  const sessionRepository = appServices.status === 'ready' ? appServices.services.sessions : undefined;
  const solveRepository = appServices.status === 'ready' ? appServices.services.solves : undefined;
  const comparisonRefreshKey = pending?.status === 'saved' ? pending.completion.solveId : '';
  const generatorRefreshKey = pending?.status === 'saved' ? pending.completion.solveId : '';
  const generationRequestKey = `${generatorRefreshKey}:${regenerationCount}`;
  const hasCurrentScrambleResult = scrambleResult?.puzzle === puzzle && scrambleResult.requestKey === generationRequestKey;
  const scramble = hasCurrentScrambleResult ? scrambleResult.scramble : null;
  const scrambleStatus = !appServices.scrambles
    ? 'unavailable'
    : hasCurrentScrambleResult ? scrambleResult.status : 'loading';
  const lifecycleLocked = Boolean(activeRun || (pending && pending.status !== 'saved'));
  const displayedScramble = lifecycleLocked
    ? activeRun?.scramble ?? pending?.completion.scramble ?? null
    : scramble;
  const displayedScrambleStatus = lifecycleLocked
    ? displayedScramble ? 'ready' : 'unavailable'
    : scrambleStatus;
  const timerCritical = running || blocksNextRun || holdState !== 'idle';
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
  const sessionValidationScopeKey = auth.status === 'signed-in' && auth.user?.id
    ? `${auth.user.id}:${puzzle}` : null;
  const isSessionRevalidating = Boolean(sessionValidationScopeKey && sessionValidationKey === sessionValidationScopeKey);
  const sessionResolved = auth.status === 'signed-out' || auth.status === 'unconfigured'
    || (auth.status === 'signed-in' && sessionStatus === 'ready' && !isSessionRevalidating);
  const selectedSessionIsAvailable = auth.status === 'signed-in'
    && sessionSelection?.ownerId === auth.user?.id
    && sessionSelection?.puzzle === puzzle
    && sessions.some((item) => item.id === sessionSelection.id);
  const selectedSessionId = selectedSessionIsAvailable
    ? sessionSelection?.id ?? ''
    : sessions[0]?.id ?? '';
  const comparisonOwnerId = auth.status === 'signed-in' ? auth.user?.id ?? '' : '';
  const comparisonSessionId = activeRun?.selectedSessionId
    ?? (pending && pending.status !== 'saved' ? pending.completion.selectedSessionId : undefined)
    ?? selectedSessionId;
  const comparisonPuzzle = selectedPuzzle;
  const hasCurrentComparison = Boolean(comparisonResult
    && solveRepository
    && comparisonResult.ownerId === comparisonOwnerId
    && comparisonResult.sessionId === comparisonSessionId
    && comparisonResult.puzzle === comparisonPuzzle
    && comparisonResult.refreshKey === comparisonRefreshKey);
  const currentComparison = hasCurrentComparison ? comparisonResult!.solves : [];
  const difference = !running && !blocksNextRun
    ? solveTimeDifference(currentComparison[0], currentComparison[1])
    : null;
  const differenceText = difference ? `(${formatSolveTimeDifference(difference.milliseconds)})` : '';
  const differenceLabel = difference?.direction === 'equal'
    ? 'Equal to previous solve'
    : difference
      ? `${Math.abs(difference.milliseconds / 1000).toFixed(2)} seconds ${difference.direction === 'faster' ? 'faster than' : 'slower than'} the previous solve`
      : '';
  const savedCompletionMatchesComparisonScope = pending?.status === 'saved'
    && pending.completionOwnerId === comparisonOwnerId
    && pending.completion.puzzle === comparisonPuzzle
    && (pending.completion.selectedSessionId ?? '') === comparisonSessionId;
  const timerLoading = auth.status === 'loading'
    || (auth.status === 'signed-in' && !hasCurrentComparison && (
      sessionStatus !== 'ready' || Boolean(comparisonSessionId)
    ));
  const timerInstruction = running
    ? 'Press Space or tap the timer to stop.'
    : holdState === 'holding'
      ? 'Keep holding to start.'
      : holdState === 'armed'
        ? 'Release to start.'
        : blocksNextRun
          ? pending?.status === 'saving' ? 'Saving this solve…' : 'Save or recover this solve to continue.'
          : scrambleStatus !== 'ready'
            ? t('timerScrambleMustBeReady')
            : 'Hold Space or touch the timer to start.';
  const overviewStatistics = [
    { key: 'single', label: 'timerStatSingle' },
    { key: 'ao5', label: 'timerStatAo5' },
    { key: 'ao12', label: 'timerStatAo12' },
  ] as const;

  const startTimer = useCallback((timingSource: TimingSource) => {
    if (!sessionResolved || blocksNextRun || scrambleStatus !== 'ready' || !scramble || scramble.puzzle !== puzzle
      || keyboardPhase.current === 'holding' || keyboardPhase.current === 'armed') return;
    setRecoveryMessage('');
    beginRun(puzzle, scramble, selectedSessionId || undefined, timingSource);
  }, [beginRun, blocksNextRun, puzzle, scramble, scrambleStatus, selectedSessionId, sessionResolved]);

  const cancelHold = useCallback(() => {
    if (holdTimeout.current !== null) window.clearTimeout(holdTimeout.current);
    holdTimeout.current = null;
    keyboardPhase.current = 'idle';
    holdSource.current = null;
    setHoldState('idle');
  }, []);
  const keyboardActions = useRef({ activeRun, blocksNextRun, scrambleStatus, sessionResolved, startTimer, stopTimer });
  useLayoutEffect(() => {
    keyboardActions.current = { activeRun, blocksNextRun, scrambleStatus, sessionResolved, startTimer, stopTimer };
  }, [activeRun, blocksNextRun, scrambleStatus, sessionResolved, startTimer, stopTimer]);

  const beginHold = useCallback((source: 'keyboard' | 'pointer') => {
    const actions = keyboardActions.current;
    if (keyboardPhase.current !== 'idle' || actions.activeRun || actions.blocksNextRun || !actions.sessionResolved || actions.scrambleStatus !== 'ready') return;
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
    const generator = appServices.scrambles;
    if (!generator) return () => { active = false; };
    const controller = new AbortController();
    void generator.generate(puzzle, { signal: controller.signal }).then((result) => {
      if (!active) return;
      if (result.status === 'success'
        && result.data.puzzle === puzzle
        && typeof result.data.id === 'string'
        && result.data.id.trim().length > 0
        && typeof result.data.notation === 'string'
        && result.data.notation.trim()
        && typeof result.data.generatorVersion === 'string'
        && result.data.generatorVersion.trim()
        && typeof result.data.createdAt === 'string'
        && Number.isFinite(Date.parse(result.data.createdAt))) {
        setScrambleResult({ puzzle, requestKey: generationRequestKey, status: 'ready', scramble: result.data });
      } else {
        setScrambleResult({ puzzle, requestKey: generationRequestKey, status: 'error', scramble: null });
      }
    }).catch(() => {
      if (active) setScrambleResult({ puzzle, requestKey: generationRequestKey, status: 'error', scramble: null });
    });
    return () => { active = false; controller.abort(); };
  }, [appServices.scrambles, blocksNextRun, generationRequestKey, puzzle, running]);

  useLayoutEffect(() => {
    if (sessionValidationScopeKey && sessionRepository) {
      setSessionValidationKey(sessionValidationScopeKey);
    }
  }, [comparisonRefreshKey, sessionRepository, sessionValidationScopeKey, setSessionValidationKey]);

  useEffect(() => {
    let active = true;
    if (auth.status !== 'signed-in') return () => { active = false; };
    const ownerId = auth.user?.id;
    if (!ownerId) return () => { active = false; };
    if (!sessionRepository) {
      return () => { active = false; };
    }
    const validationKey = `${ownerId}:${puzzle}`;
    setSessionValidationKey(validationKey);
    void sessionRepository.list(ownerId).then((result) => {
      if (!active) return;
      if (result.status !== 'success') {
        setSessionResult((current) => ({
          ownerId,
          puzzle,
          sessions: current?.ownerId === ownerId && current.puzzle === puzzle ? current.sessions : [],
          status: 'error',
        }));
        setSessionValidationKey((current) => current === validationKey ? null : current);
        return;
      }
      const matchingPuzzleSessions = result.data.filter((item) => item.puzzle === puzzle);
      setSessionResult({ ownerId, puzzle, sessions: matchingPuzzleSessions, status: 'ready' });
      setSessionValidationKey((current) => current === validationKey ? null : current);
    }).catch(() => {
      if (!active) return;
      setSessionResult((current) => ({
        ownerId,
        puzzle,
        sessions: current?.ownerId === ownerId && current.puzzle === puzzle ? current.sessions : [],
        status: 'error',
      }));
      setSessionValidationKey((current) => current === validationKey ? null : current);
    });
    return () => { active = false; };
  }, [appServices.status, auth.status, auth.user?.id, comparisonRefreshKey, puzzle, sessionRepository, setSessionResult, setSessionValidationKey]);

  useEffect(() => {
    let active = true;
    if (!comparisonOwnerId || !comparisonSessionId || !solveRepository) return () => { active = false; };
    const scope = {
      ownerId: comparisonOwnerId,
      sessionId: comparisonSessionId,
      puzzle: comparisonPuzzle,
      refreshKey: comparisonRefreshKey,
    };
    void solveRepository.list({ sessionId: scope.sessionId, puzzle: scope.puzzle, limit: 2 }).then((result) => {
      if (!active || result.status !== 'success') return;
      setComparisonResult({
        ...scope,
        solves: result.data,
      });
    }).catch(() => {
      // Keep a same-scope snapshot visible while a transient refresh fails.
    });
    return () => { active = false; };
  }, [comparisonOwnerId, comparisonPuzzle, comparisonRefreshKey, comparisonSessionId, setComparisonResult, solveRepository]);

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

  async function copyScramble() {
    if (!scramble || scrambleStatus !== 'ready' || scramble.puzzle !== puzzle || timerCritical) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(scramble.notation);
      setScrambleCopyMessage(t('timerScrambleCopied'));
    } catch {
      setScrambleCopyMessage(t('timerScrambleCopyFailed'));
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

  const displayedTime = running || blocksNextRun || savedCompletionMatchesComparisonScope
    ? formatTimerTime(elapsedMs)
    : timerLoading ? '--.--'
      : currentComparison[0] ? formatTimerTime(effectiveTimeMs(currentComparison[0]) ?? 0) : '00.00';

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
              disabled={timerCritical}
              describedBy="timer-puzzle-hint"
              options={puzzleTypes.map((type) => ({ value: type, label: puzzleLabel(type) }))}
              onChange={(event) => {
                setScrambleCopyMessage('');
                setPuzzle(event.currentTarget.value as PuzzleType);
              }}
            />
            <TimerSelector
              id="timer-session"
              label={t('timerSessionLabel')}
              kind="session"
              value={selectedSessionId}
              disabled={running || blocksNextRun || sessionStatus !== 'ready' || sessions.length === 0}
              describedBy="timer-session-hint"
              options={[
                ...(sessionStatus === 'loading' ? [{ value: '', label: 'Loading sessions…' }] : []),
                ...(sessionStatus === 'signed-out' ? [{ value: '', label: 'Sign in' }] : []),
                ...(sessionStatus === 'unavailable' ? [{ value: '', label: 'Sessions unavailable' }] : []),
                ...(sessionStatus === 'error' ? [{ value: '', label: 'Could not load sessions' }] : []),
                ...(sessionStatus === 'ready' && sessions.length === 0 ? [{ value: '', label: 'No sessions for this puzzle' }] : []),
                ...sessions.map((item) => ({ value: item.id, label: item.name })),
              ]}
              onChange={(event) => auth.user && setSessionSelection({ ownerId: auth.user.id, puzzle, id: event.currentTarget.value })}
            />
            <p className="timer-page__hint timer-page__toolbar-hint" id="timer-session-hint">
              {sessionStatus === 'signed-out' ? 'Sign in to load and select an account session.' : sessionStatus === 'ready' && sessions.length === 0 ? 'A Practice session is created only when a real scramble is available to save.' : 'The selected session is captured when timing starts.'}
            </p>
            <p className="timer-page__hint rv-visually-hidden" id="timer-puzzle-hint">{t('timerPuzzleHint')}</p>
          </div>

          <Card aria-busy={scrambleStatus === 'loading'} className="timer-page__scramble" aria-labelledby="timer-scramble-heading">
            <div className="timer-page__section-heading">
              <h2 id="timer-scramble-heading">{t('timerScrambleTitle')}</h2>
              <Badge aria-live="polite" role="status" tone={displayedScrambleStatus === 'ready' ? 'success' : displayedScrambleStatus === 'loading' ? 'neutral' : 'warning'}>
                {displayedScrambleStatus === 'ready' ? t('timerScrambleReady')
                  : displayedScrambleStatus === 'loading' ? t('timerScrambleGenerating')
                    : t('timerScrambleUnavailableBadge')}
              </Badge>
            </div>
            <ScrambleDisplay
              scramble={displayedScrambleStatus === 'ready' ? displayedScramble : null}
              unavailableMessage={displayedScrambleStatus === 'loading' ? t('timerScrambleGenerating')
                : displayedScrambleStatus === 'error' ? t('timerScrambleFailed') : t('timerScrambleUnavailable')}
            />
            {displayedScrambleStatus === 'ready' && <p className="timer-page__hint">{t('timerScrambleEphemeral')}</p>}
            <div className="timer-page__scramble-actions">
              {displayedScrambleStatus === 'ready' && <Button disabled={timerCritical || !displayedScramble} onClick={() => void copyScramble()} variant="secondary">
                {t('timerScrambleCopy')}
              </Button>}
              <Button
                disabled={timerCritical || scrambleStatus === 'loading' || !appServices.scrambles}
                onClick={() => {
                  setScrambleCopyMessage('');
                  setRegenerationCount((count) => count + 1);
                }}
                variant="secondary"
              >
                {scrambleStatus === 'error' ? t('timerScrambleRetry') : t('timerScrambleNew')}
              </Button>
            </div>
            {scrambleCopyMessage && <p className="timer-page__hint" role="status">{scrambleCopyMessage}</p>}
          </Card>

          <Card className="timer-page__readout" aria-labelledby="timer-display-heading">
            <div className="timer-page__section-heading">
              <h2 id="timer-display-heading">{t('timerDisplayLabel')}</h2>
              <Badge tone={running ? 'warning' : 'neutral'}>{running ? t('timerRunning') : t('timerIdle')}</Badge>
            </div>
            <p className="timer-page__instruction" id="timer-touch-instructions">{timerInstruction}</p>
            <div className="timer-page__timing-display">
              <div className={`timer-page__digits${holdState === 'idle' ? '' : ` timer-page__digits--${holdState}`}`} role="timer" aria-label={timerLoading ? 'Loading session' : displayedTime} aria-busy={timerLoading}>
                <SevenSegmentTimer value={displayedTime} />
                <span className="rv-visually-hidden">{displayedTime}</span>
                <button
                  aria-describedby="timer-touch-instructions"
                  aria-keyshortcuts="Space"
                  aria-label="Timer control"
                  aria-pressed={running}
                  className="timer-page__touch-control"
                  data-timer-control="true"
                  disabled={!running && holdState === 'idle' && (blocksNextRun || !sessionResolved || scrambleStatus !== 'ready' || !scramble)}
                  onLostPointerCapture={onTimerPointerCancel}
                  onPointerCancel={onTimerPointerCancel}
                  onPointerDown={onTimerPointerDown}
                  onPointerUp={onTimerPointerUp}
                  type="button"
                />
              </div>
              <span
                aria-hidden={!difference}
                aria-label={difference ? differenceLabel : undefined}
                className={`timer-page__difference${difference ? ` timer-page__difference--${difference.direction}` : ''}`}
              >
                {differenceText}
              </span>
            </div>
            {pending && <section aria-busy={pending.status === 'saving'} aria-live="polite" className={`timer-page__save-state timer-page__save-state--${pending.status}`}>
              <h3>{pending.status === 'saved' ? 'Saved' : pending.status === 'saving' ? 'Saving solve' : 'Solve not saved'}</h3>
              <p role="status">{pending.message}</p>
              {pending.status !== 'saved' && <details className="timer-page__recovery" open={pending.status === 'unsaved'}>
                <summary>Recovery options for this solve</summary>
                <div className="timer-page__recovery-content">
                  {(pending.message.includes('Sign in') || pending.message.includes('signed out')) && <p><Link to="/auth/sign-in">Sign in to save this solve</Link></p>}
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
                </div>
              </details>}
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
              <ScrambleCubePreview
                loadViewer={loadCubeViewer}
                puzzle={selectedPuzzle}
                scramble={displayedScrambleStatus === 'ready' ? displayedScramble : null}
              />
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

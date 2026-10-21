import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '../auth/authContext';
import { useAppServices } from '../../app/useAppServices';
import type { PuzzleType, ServiceResult, Solve, TimingSource } from '../../shared/domain/contracts';
import { TimerCompletionContext, type ActiveTimerRun, type PendingTimerSave, type TimerCompletion, type TimerCompletionContextValue } from './timerCompletionContext';

function resultMessage(result: ServiceResult<unknown>) {
  if (result.status === 'unavailable') {
    switch (result.reason) {
      case 'AUTH_REQUIRED': return 'Sign in to save this solve. It is held only in this tab until saved.';
      case 'NOT_CONFIGURED': return 'Cloud saving is not configured. This solve is held only in memory; copy or download it before leaving.';
      default: return 'Cloud saving is unavailable. This solve is held only in memory; retry or recover it below.';
    }
  }
  if (result.status === 'error') {
    switch (result.code) {
      case 'FORBIDDEN': return 'Your session may have expired or access was denied. Sign in again, then retry.';
      case 'RATE_LIMITED': return 'Too many save requests. Wait a moment, then retry.';
      case 'NETWORK': return 'The cloud service could not be reached. This solve remains in memory; retry when connected.';
      case 'SCHEMA_MISMATCH': return result.message ?? 'The cloud database needs an update before this solve can be saved. It remains in memory; retry after the update is applied.';
      case 'CONFLICT': return 'The solve could not be saved because its data conflicts with an existing record. The recovery copy is still available.';
      default: return result.message ?? 'The solve was not confirmed as saved. It remains in memory; retry or recover it below.';
    }
  }
  return 'The solve was not confirmed as saved. It remains in memory; retry or recover it below.';
}

function isFailure<T>(result: ServiceResult<T>): result is Exclude<ServiceResult<T>, { status: 'success' }> {
  return result.status !== 'success';
}

function captureScramble(scramble: TimerCompletion['scramble'], puzzle: PuzzleType) {
  if (!scramble || scramble.puzzle !== puzzle
    || typeof scramble.id !== 'string' || !scramble.id.trim()
    || typeof scramble.notation !== 'string' || !scramble.notation.trim()
    || typeof scramble.generatorVersion !== 'string' || !scramble.generatorVersion.trim()
    || typeof scramble.createdAt !== 'string' || !Number.isFinite(Date.parse(scramble.createdAt))) return null;
  return Object.freeze({ ...scramble });
}

function captureCompletion(completion: TimerCompletion): TimerCompletion {
  const scramble = completion.scramble
    ? Object.freeze({ ...completion.scramble })
    : null;
  return Object.freeze({ ...completion, scramble });
}

export function TimerCompletionProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const services = useAppServices();
  const [pending, setPending] = useState<PendingTimerSave | null>(null);
  const [activeRun, setActiveRun] = useState<ActiveTimerRun | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [sessionSnapshot, setSessionSnapshot] = useState<TimerCompletionContextValue['sessionSnapshot']>(null);
  const [sessionSelection, setSessionSelection] = useState<TimerCompletionContextValue['sessionSelection']>(null);
  const [comparisonSnapshot, setComparisonSnapshot] = useState<TimerCompletionContextValue['comparisonSnapshot']>(null);
  const [sessionValidationKey, setSessionValidationKey] = useState<string | null>(null);
  const activeRunRef = useRef<ActiveTimerRun | null>(null);
  const current = useRef<PendingTimerSave | null>(null);
  const handledSolveIds = useRef(new Set<string>());
  const savingSolveIds = useRef(new Set<string>());
  const authIdentity = useRef({ status: auth.status, userId: auth.user?.id });
  useLayoutEffect(() => {
    authIdentity.current = { status: auth.status, userId: auth.user?.id };
  }, [auth.status, auth.user?.id]);

  const update = useCallback((next: PendingTimerSave) => {
    current.current = next;
    setPending(next);
  }, []);

  const save = useCallback(async (solveId: string, allowGuestClaim = false) => {
    const record = current.current;
    if (!record || record.completion.solveId !== solveId || record.status === 'saved' || savingSolveIds.current.has(solveId)) return;
    savingSolveIds.current.add(solveId);
    update({ ...record, status: 'saving', message: 'Saving to your account…' });
    let retryRecord = record;
    try {
      if (!record.completion.scramble) {
        update({ ...record, status: 'unsaved', message: 'No real scramble snapshot is available, so this timed result was not saved. It remains in memory for recovery.' });
        return;
      }
      if (record.completion.scramble.puzzle !== record.completion.puzzle) {
        update({ ...record, status: 'unsaved', message: 'The captured scramble does not match this solve puzzle, so the solve was not saved. It remains in memory for recovery.' });
        return;
      }
      let completionOwnerId = record.completionOwnerId ?? record.completion.completionOwnerId;
      if (!completionOwnerId) {
        const identity = authIdentity.current;
        if (!allowGuestClaim || identity.status !== 'signed-in' || !identity.userId) {
          update({ ...record, status: 'unsaved', message: identity.status === 'signed-in'
            ? 'This guest solve is still only in memory. Retry to associate it with the currently signed-in account.'
            : 'Sign in to save this guest solve, then retry. It remains only in this tab.' });
          return;
        }
        completionOwnerId = identity.userId;
      }
      const ownerIsCurrent = () => authIdentity.current.status === 'signed-in'
        && authIdentity.current.userId === completionOwnerId;
      const ownerMismatchMessage = () => authIdentity.current.status === 'loading'
        ? 'Waiting for the account that started this solve. It remains in memory until that account is available.'
        : 'Sign in to the account that started this solve before retrying.';
      if (!ownerIsCurrent()) {
        update({ ...record, status: 'unsaved', message: ownerMismatchMessage() });
        return;
      }
      const ownedCompletion = Object.freeze({ ...record.completion, completionOwnerId });
      const ownedRecord = { ...record, completion: ownedCompletion, completionOwnerId };
      retryRecord = ownedRecord;
      update({ ...ownedRecord, status: 'saving', message: 'Saving to your account…' });
      if (services.status !== 'ready') {
        update({ ...ownedRecord, status: 'unsaved', message: resultMessage({ status: 'unavailable', reason: services.reason }) });
        return;
      }
      const sessionRepository = services.services.sessions;
      const scrambleRepository = services.services.scrambleRepository;
      if (!sessionRepository || !scrambleRepository) {
        update({ ...ownedRecord, status: 'unsaved', message: 'The session or scramble repository is unavailable. This solve remains in memory.' });
        return;
      }
      // TimerPage resolves this exact owner/puzzle session list before enabling
      // a run. Reuse its selected session to avoid another round trip at stop.
      // Retry or nonstandard completion paths still fall back to a fresh read.
      const cachedSessions = sessionSnapshot?.ownerId === completionOwnerId
        && sessionSnapshot.puzzle === record.completion.puzzle
        && sessionSnapshot.status === 'ready'
        && record.completion.selectedSessionId
        && sessionSnapshot.sessions.some((item) => item.id === record.completion.selectedSessionId && item.puzzle === record.completion.puzzle)
        ? sessionSnapshot.sessions
        : null;
      const listed = cachedSessions
        ? { status: 'success' as const, data: cachedSessions }
        : await sessionRepository.list(completionOwnerId);
      if (!ownerIsCurrent()) {
        update({ ...ownedRecord, status: 'unsaved', message: ownerMismatchMessage() });
        return;
      }
      if (isFailure(listed)) {
        update({ ...ownedRecord, status: 'unsaved', message: resultMessage(listed) });
        return;
      }
      let session = record.completion.selectedSessionId
        ? listed.data.find((item) => item.id === record.completion.selectedSessionId && item.puzzle === record.completion.puzzle)
        : listed.data.find((item) => item.puzzle === record.completion.puzzle);
      if (record.completion.selectedSessionId && !session) {
        update({ ...ownedRecord, status: 'unsaved', message: 'The selected session is no longer available for this puzzle. The solve was not saved to a different session.' });
        return;
      }
      if (!session) {
        const created = await sessionRepository.create('Practice', record.completion.scramble.puzzle, completionOwnerId);
        if (!ownerIsCurrent()) {
          update({ ...ownedRecord, status: 'unsaved', message: ownerMismatchMessage() });
          return;
        }
        if (isFailure(created)) {
          update({ ...ownedRecord, status: 'unsaved', message: resultMessage(created) });
          return;
        }
        session = created.data;
      }
      const scrambleResult = await scrambleRepository.save(record.completion.scramble, completionOwnerId);
      if (!ownerIsCurrent()) {
        update({ ...ownedRecord, status: 'unsaved', message: ownerMismatchMessage() });
        return;
      }
      if (isFailure(scrambleResult)) {
        update({ ...ownedRecord, status: 'unsaved', message: resultMessage(scrambleResult) });
        return;
      }
      const solve: Solve = {
        id: record.completion.solveId,
        sessionId: session.id,
        scrambleId: record.completion.scramble.id,
        puzzle: record.completion.scramble.puzzle as PuzzleType,
        rawTimeMs: record.completion.rawTimeMs,
        penalty: record.completion.penalty,
        startedAt: record.completion.startedAt,
        completedAt: record.completion.completedAt,
        timingSource: record.completion.timingSource,
      };
      const saved = await services.services.solves.save(solve, completionOwnerId);
      if (!ownerIsCurrent()) {
        update({ ...ownedRecord, status: 'unsaved', message: ownerMismatchMessage() });
        return;
      }
      if (isFailure(saved)) {
        update({ ...ownedRecord, status: 'unsaved', message: resultMessage(saved) });
        return;
      }
      update({ ...ownedRecord, status: 'saved', message: 'Saved to your account.' });
    } catch {
      update({ ...retryRecord, status: 'unsaved', message: 'The save could not be confirmed. This solve remains in memory; retry or recover it below.' });
    } finally {
      savingSolveIds.current.delete(solveId);
    }
  }, [services, sessionSnapshot, update]);

  const complete = useCallback((completion: TimerCompletion) => {
    if (handledSolveIds.current.has(completion.solveId)) return;
    handledSolveIds.current.add(completion.solveId);
    const capturedCompletion = captureCompletion(completion);
    const next: PendingTimerSave = { completion: capturedCompletion, status: 'unsaved', message: 'Solve complete. Preparing cloud save…' };
    next.completionOwnerId = capturedCompletion.completionOwnerId;
    current.current = next;
    setPending(next);
    void save(completion.solveId);
  }, [save]);

  const startTimer = useCallback((puzzle: PuzzleType, scramble: TimerCompletion['scramble'], selectedSessionId: string | undefined, timingSource: TimingSource) => {
    if (activeRunRef.current || (current.current && current.current.status !== 'saved')) return;
    const capturedScramble = captureScramble(scramble, puzzle);
    if (!capturedScramble) return;
    const run: ActiveTimerRun = Object.freeze({
      startedAt: new Date().toISOString(),
      startedMono: performance.now(),
      ...(auth.status === 'signed-in' && auth.user ? { completionOwnerId: auth.user.id } : {}),
      puzzle,
      scramble: capturedScramble,
      ...(selectedSessionId ? { selectedSessionId } : {}),
      solveId: crypto.randomUUID(),
      timingSource,
    });
    activeRunRef.current = run;
    setElapsedMs(0);
    setActiveRun(run);
  }, [auth.status, auth.user]);

  const stopTimer = useCallback(() => {
    const run = activeRunRef.current;
    if (!run) return;
    activeRunRef.current = null;
    setActiveRun(null);
    const rawTimeMs = Math.max(0, Math.round(performance.now() - run.startedMono));
    setElapsedMs(rawTimeMs);
    complete({
      solveId: run.solveId,
      completionOwnerId: run.completionOwnerId,
      puzzle: run.puzzle,
      scramble: run.scramble,
      selectedSessionId: run.selectedSessionId,
      rawTimeMs,
      penalty: 'NONE',
      startedAt: run.startedAt,
      completedAt: new Date().toISOString(),
      timingSource: run.timingSource,
    });
  }, [complete]);

  const retry = useCallback(() => {
    if (current.current) void save(current.current.completion.solveId, true);
  }, [save]);

  const value = useMemo(() => ({
    pending, activeRun, elapsedMs, complete, startTimer, stopTimer, retry,
    sessionSnapshot, setSessionSnapshot, sessionSelection, setSessionSelection,
    comparisonSnapshot, setComparisonSnapshot, sessionValidationKey, setSessionValidationKey,
  }), [
    pending, activeRun, elapsedMs, complete, startTimer, stopTimer, retry,
    sessionSnapshot, sessionSelection, comparisonSnapshot, sessionValidationKey,
  ]);
  useEffect(() => {
    if ((!pending || pending.status === 'saved') && !activeRun) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [pending, activeRun]);
  useEffect(() => {
    if (!activeRun) return;
    const interval = window.setInterval(() => {
      const run = activeRunRef.current;
      if (run) setElapsedMs(Math.max(0, Math.floor(performance.now() - run.startedMono)));
    }, 20);
    return () => window.clearInterval(interval);
  }, [activeRun]);
  return <TimerCompletionContext.Provider value={value}>{children}</TimerCompletionContext.Provider>;
}

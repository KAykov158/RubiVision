import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import type { PuzzleType, SavedScrambleHistoryEntry, ScrambleHistoryCursor } from '../shared/domain/contracts';
import { Badge, Button, Card, PageContainer, Select, Spinner, Field, EmptyState, ErrorState } from '../shared/components/primitives';
import { useAuth } from '../features/auth/authContext';
import { useAppServices } from './useAppServices';
import { useTranslation } from '../shared/i18n/useTranslation';

type HistoryState = 'loading' | 'ready' | 'error';
const puzzles: PuzzleType[] = ['222', '333', '444', '555', '666', '777'];
const puzzleName = (puzzle: PuzzleType) => `${puzzle[0]}×${puzzle[0]}`;
const PAGE_SIZE = 25;

function localDateBoundary(value: string, end: boolean) {
  if (!value) return undefined;
  const date = new Date(`${value}T${end ? '23:59:59.999' : '00:00:00.000'}`);
  return Number.isFinite(date.getTime()) ? date.toISOString() : undefined;
}

export function ScrambleHistoryPage() {
  const t = useTranslation();
  const auth = useAuth();
  const appServices = useAppServices();
  const ownerId = auth.status === 'signed-in' ? auth.user?.id ?? null : null;
  const [puzzle, setPuzzle] = useState<PuzzleType | 'all'>('all');
  const [fromDate, setFromDate] = useState('');
  const [throughDate, setThroughDate] = useState('');
  const [state, setState] = useState<HistoryState>('loading');
  const [loadedRequestKey, setLoadedRequestKey] = useState<string | null>(null);
  const [entries, setEntries] = useState<readonly SavedScrambleHistoryEntry[]>([]);
  const [nextCursor, setNextCursor] = useState<ScrambleHistoryCursor | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreFailed, setLoadMoreFailed] = useState(false);
  const [retryVersion, setRetryVersion] = useState(0);
  const [copyStatus, setCopyStatus] = useState<{ id: string; message: string; requestKey: string } | null>(null);
  const requestId = useRef(0);
  const filterKey = JSON.stringify([puzzle, fromDate, throughDate]);
  const requestKey = JSON.stringify([ownerId, filterKey, retryVersion]);

  useEffect(() => {
    const id = ++requestId.current;
    if (!ownerId || appServices.status !== 'ready' || !appServices.services.scrambleRepository) {
      return () => { requestId.current += 1; };
    }
    const repository = appServices.services.scrambleRepository;
    const filter = {
      ...(puzzle === 'all' ? {} : { puzzle }),
      ...(fromDate ? { from: localDateBoundary(fromDate, false) } : {}),
      ...(throughDate ? { through: localDateBoundary(throughDate, true) } : {}),
      limit: PAGE_SIZE,
    };
    void repository.listHistory(filter, ownerId).then((result) => {
      if (requestId.current !== id) return;
      if (result.status === 'success') {
        setEntries(result.data.entries);
        setNextCursor(result.data.nextCursor);
        setLoadedRequestKey(requestKey);
        setLoadMoreFailed(false);
        setLoadingMore(false);
        setState('ready');
      } else {
        setLoadedRequestKey(requestKey);
        setState('error');
      }
    }).catch(() => {
      if (requestId.current === id) {
        setLoadedRequestKey(requestKey);
        setState('error');
      }
    });
    return () => { requestId.current += 1; };
  }, [appServices, ownerId, puzzle, fromDate, throughDate, filterKey, retryVersion, requestKey]);

  const loadMore = useCallback(async (cursor: ScrambleHistoryCursor) => {
    if (!ownerId || appServices.status !== 'ready' || !appServices.services.scrambleRepository) return;
    const id = ++requestId.current;
    setLoadingMore(true);
    setLoadMoreFailed(false);
    const filter = {
      ...(puzzle === 'all' ? {} : { puzzle }),
      ...(fromDate ? { from: localDateBoundary(fromDate, false) } : {}),
      ...(throughDate ? { through: localDateBoundary(throughDate, true) } : {}),
      cursor,
      limit: PAGE_SIZE,
    };
    try {
      const result = await appServices.services.scrambleRepository.listHistory(filter, ownerId);
      if (requestId.current !== id) return;
      if (result.status !== 'success') { setLoadMoreFailed(true); return; }
      setEntries((current) => {
        const known = new Set(current.map((entry) => entry.solveId));
        const additions: SavedScrambleHistoryEntry[] = [];
        for (const entry of result.data.entries) {
          if (known.has(entry.solveId)) continue;
          known.add(entry.solveId);
          additions.push(entry);
        }
        return [...current, ...additions];
      });
      setNextCursor(result.data.nextCursor);
      setLoadMoreFailed(false);
    } catch {
      if (requestId.current === id) setLoadMoreFailed(true);
    } finally {
      if (requestId.current === id) setLoadingMore(false);
    }
  }, [appServices, ownerId, puzzle, fromDate, throughDate]);

  async function copyNotation(entry: SavedScrambleHistoryEntry) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(entry.scramble.notation);
      setCopyStatus({ id: entry.solveId, message: t('scrambleHistoryCopySuccess'), requestKey });
    } catch {
      setCopyStatus({ id: entry.solveId, message: t('scrambleHistoryCopyFailure'), requestKey });
    }
  }

  const hasCurrentRequest = Boolean(ownerId && loadedRequestKey === requestKey);
  const visibleState = hasCurrentRequest ? state : 'loading';
  const showHistory = auth.status === 'signed-in' && hasCurrentRequest && state === 'ready';

  return <PageContainer className="app-main data-page" id="main-content" tabIndex={-1}>
    <header className="data-page__header">
      <div><h1>{t('scrambleHistoryTitle')}</h1><p className="app-page-description">{t('scrambleHistoryDescription')}</p></div>
      <Badge>{t('scrambleHistorySavedOnly')}</Badge>
    </header>

    {auth.status === 'loading' && <div aria-busy="true"><Spinner label={t('scrambleHistoryAuthLoading')} /></div>}
    {(auth.status === 'signed-out' || auth.status === 'unconfigured') && <EmptyState title={t('scrambleHistoryAuthRequired')}>
      <>{t('scrambleHistoryAuthDescription')} <Link to="/auth/sign-in">{t('scrambleHistorySignIn')}</Link></>
    </EmptyState>}
    {auth.status === 'signed-in' && appServices.status !== 'ready' && <ErrorState title={t('scrambleHistoryUnavailableTitle')}>
      {t('scrambleHistoryUnavailable')}
    </ErrorState>}
    {auth.status === 'signed-in' && appServices.status === 'ready' && !appServices.services.scrambleRepository && <ErrorState title={t('scrambleHistoryUnavailableTitle')}>
      {t('scrambleHistoryUnavailable')}
    </ErrorState>}

    {auth.status === 'signed-in' && appServices.status === 'ready' && appServices.services.scrambleRepository && <>
      <section aria-labelledby="scramble-history-filters">
        <h2 id="scramble-history-filters">{t('scrambleHistoryFilters')}</h2>
        <div className="solves-filters">
          <Select id="scramble-history-puzzle" label={t('scrambleHistoryPuzzle')} value={puzzle} onChange={(event) => setPuzzle(event.currentTarget.value as PuzzleType | 'all')}>
            <option value="all">{t('scrambleHistoryAllPuzzles')}</option>
            {puzzles.map((item) => <option key={item} value={item}>{puzzleName(item)}</option>)}
          </Select>
          <Field id="scramble-history-from" label={t('scrambleHistoryFrom')} type="date" value={fromDate} onChange={(event) => setFromDate(event.currentTarget.value)} />
          <Field id="scramble-history-through" label={t('scrambleHistoryThrough')} type="date" value={throughDate} onChange={(event) => setThroughDate(event.currentTarget.value)} />
        </div>
      </section>

      {visibleState === 'loading' && <p aria-live="polite" role="status"><Spinner label={t('scrambleHistoryLoading')} /></p>}
      {visibleState === 'error' && <ErrorState title={t('scrambleHistoryErrorTitle')}>
        <>{t('scrambleHistoryError')} <Button onClick={() => setRetryVersion((value) => value + 1)}>{t('retry')}</Button></>
      </ErrorState>}
      {showHistory && entries.length === 0 && <EmptyState title={t('scrambleHistoryEmptyTitle')}>
        {t('scrambleHistoryEmpty')}
      </EmptyState>}
      {showHistory && entries.length > 0 && <section aria-label={t('scrambleHistoryList')} className="scramble-history-list">
        {entries.map((entry) => <Card className="scramble-history-card" key={entry.solveId}>
          <header className="scramble-history-card__header">
            <h2>{puzzleName(entry.scramble.puzzle)}</h2>
            <Badge tone="success">{t('scrambleHistorySaved')}</Badge>
          </header>
          <p>{t('scrambleHistorySavedAt')}: <time dateTime={entry.savedAt}>{new Date(entry.savedAt).toLocaleString()}</time></p>
          <dl>
            <div><dt>{t('scrambleHistoryGenerator')}</dt><dd>{entry.scramble.generatorProvider ?? t('scrambleHistoryUnknownProvenance')}</dd></div>
            <div><dt>{t('scrambleHistoryVersion')}</dt><dd>{entry.scramble.generatorVersion}</dd></div>
            <div><dt>{t('scrambleHistoryMethod')}</dt><dd>{entry.scramble.generationMethod ?? t('scrambleHistoryUnknownProvenance')}</dd></div>
          </dl>
          <pre className="scramble-history-card__notation" aria-label={t('scrambleHistoryNotation')}>{entry.scramble.notation}</pre>
          <Button variant="secondary" onClick={() => void copyNotation(entry)}>{t('scrambleHistoryCopy')}</Button>
          {copyStatus?.requestKey === requestKey && copyStatus.id === entry.solveId && <p aria-live="polite" role="status">{copyStatus.message}</p>}
        </Card>)}
        {nextCursor && <div className="scramble-history-pagination">
          {loadMoreFailed && <p role="alert">{t('scrambleHistoryLoadMoreError')}</p>}
          <Button disabled={loadingMore} onClick={() => void loadMore(nextCursor)}>
            {loadingMore ? t('scrambleHistoryLoadingMore') : loadMoreFailed ? t('scrambleHistoryRetryMore') : t('scrambleHistoryLoadMore')}
          </Button>
        </div>}
      </section>}
      <p className="app-page-description">{t('scrambleHistoryEphemeralNote')}</p>
    </>}
  </PageContainer>;
}

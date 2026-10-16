import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Card, Field, PageContainer, Select } from '../shared/components/primitives';
import type { PuzzleType, Solve } from '../shared/domain/contracts';
import { effectiveTimeMs } from '../shared/domain/effectiveTimeMs';
import { useTranslation } from '../shared/i18n/useTranslation';
import { useAppServices } from './useAppServices';
import { RouteState } from './RouteState';

type LoadState = 'loading' | 'ready' | 'unavailable' | 'error';
type SortMode = 'newest' | 'oldest' | 'fastest' | 'slowest';
const puzzles: PuzzleType[] = ['222', '333', '444', '555', '666', '777'];
const puzzleName = (puzzle: PuzzleType) => `${puzzle[0]}×${puzzle[0]}`;
const formatTime = (milliseconds: number | null) => milliseconds === null ? 'DNF' : `${(milliseconds / 1000).toFixed(2)} s`;
const listSolves = (services: Extract<ReturnType<typeof useAppServices>, { status: 'ready' }>, puzzle: PuzzleType | 'all') =>
  services.services.solves.list(puzzle === 'all' ? undefined : { puzzle });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function isSolve(value: unknown): value is Solve {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string' && value.id.length > 0
    && typeof value.sessionId === 'string'
    && typeof value.scrambleId === 'string'
    && puzzles.includes(value.puzzle as PuzzleType)
    && Number.isInteger(value.rawTimeMs) && (value.rawTimeMs as number) >= 0
    && ['NONE', 'PLUS_TWO', 'DNF'].includes(value.penalty as string)
    && typeof value.startedAt === 'string' && Number.isFinite(Date.parse(value.startedAt))
    && typeof value.completedAt === 'string' && Number.isFinite(Date.parse(value.completedAt))
    && ['KEYBOARD', 'TOUCH', 'SMART_CUBE'].includes(value.timingSource as string)
    && (value.notes === undefined || typeof value.notes === 'string');
}

export function SolvesPage() {
  const t = useTranslation();
  const appServices = useAppServices();
  const [state, setState] = useState<LoadState>(appServices.status === 'ready' ? 'loading' : 'unavailable');
  const [solves, setSolves] = useState<Solve[]>([]);
  const [puzzle, setPuzzle] = useState<PuzzleType | 'all'>('all');
  const [query, setQuery] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sort, setSort] = useState<SortMode>('newest');
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    if (appServices.status !== 'ready') { setState('unavailable'); return; }
    setState('loading');
    try {
      const result: unknown = await listSolves(appServices, puzzle);
      if (id !== requestId.current) return;
      if (!isRecord(result) || typeof result.status !== 'string') { setState('error'); return; }
      if (result.status === 'success') {
        if (!Array.isArray(result.data) || !result.data.every(isSolve)) { setState('error'); return; }
        setSolves(result.data);
        setState('ready');
      } else if (result.status === 'unavailable') setState('unavailable');
      else if (result.status === 'error') setState('error');
      else setState('error');
    } catch {
      if (id === requestId.current) setState('error');
    }
  }, [appServices, puzzle]);

  useEffect(() => {
    void Promise.resolve().then(load);
    return () => { requestId.current += 1; };
  }, [load]);

  const visibleSolves = useMemo(() => solves
    .filter((solve) => (!from || solve.completedAt.slice(0, 10) >= from) && (!to || solve.completedAt.slice(0, 10) <= to))
    .filter((solve) => `${solve.id} ${solve.sessionId} ${solve.scrambleId} ${solve.puzzle} ${solve.notes ?? ''}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
    .sort((a, b) => {
      if (sort === 'oldest') return a.completedAt.localeCompare(b.completedAt);
      if (sort === 'fastest') return (effectiveTimeMs(a) ?? Infinity) - (effectiveTimeMs(b) ?? Infinity);
      if (sort === 'slowest') return (effectiveTimeMs(b) ?? -Infinity) - (effectiveTimeMs(a) ?? -Infinity);
      return b.completedAt.localeCompare(a.completedAt);
    }), [solves, from, to, query, sort]);

  const clearFilters = () => { setPuzzle('all'); setQuery(''); setFrom(''); setTo(''); setSort('newest'); };
  const rows = (mobile = false) => visibleSolves.map((solve) => {
    const effective = effectiveTimeMs(solve);
    return mobile ? (
      <Card className="solves-mobile-card" key={solve.id}>
        <div className="solves-mobile-card__heading"><strong>{formatTime(effective)}</strong><Badge tone={solve.penalty === 'DNF' ? 'danger' : solve.penalty === 'PLUS_TWO' ? 'warning' : 'success'}>{solve.penalty === 'NONE' ? t('solvesNoPenalty') : solve.penalty === 'PLUS_TWO' ? t('solvesPlusTwo') : t('solvesDnf')}</Badge></div>
        <dl className="solves-mobile-card__details">
          <div><dt>{t('solvesDate')}</dt><dd>{new Date(solve.completedAt).toLocaleString()}</dd></div>
          <div><dt>{t('solvesPuzzle')}</dt><dd>{puzzleName(solve.puzzle)}</dd></div>
          <div><dt>{t('solvesRawTime')}</dt><dd>{formatTime(solve.rawTimeMs)}</dd></div>
          <div><dt>{t('solvesSession')}</dt><dd className="solves-wrap">{solve.sessionId}</dd></div>
          <div><dt>{t('solvesScramble')}</dt><dd className="solves-wrap">{solve.scrambleId}</dd></div>
        </dl>
      </Card>
    ) : (
      <tr key={solve.id}><td>{new Date(solve.completedAt).toLocaleString()}</td><td>{puzzleName(solve.puzzle)}</td><td>{formatTime(solve.rawTimeMs)}</td><td><Badge tone={solve.penalty === 'DNF' ? 'danger' : solve.penalty === 'PLUS_TWO' ? 'warning' : 'success'}>{solve.penalty === 'NONE' ? t('solvesNoPenalty') : solve.penalty === 'PLUS_TWO' ? t('solvesPlusTwo') : t('solvesDnf')}</Badge></td><td>{formatTime(effective)}</td><td className="solves-wrap">{solve.sessionId}</td><td className="solves-wrap">{solve.scrambleId}</td></tr>
    );
  });

  return <PageContainer className="app-main data-page" id="main-content" tabIndex={-1}>
    <header className="data-page__header"><div><h1>{t('solvesTitle')}</h1><p className="app-page-description">{t('solvesDescription')}</p></div><Badge>{t('solvesSessionContext')}</Badge></header>
    <section aria-labelledby="solves-filters-title" className="data-page__section">
      <h2 id="solves-filters-title">{t('solvesFilters')}</h2>
      <div className="solves-filters">
        <Select id="solves-puzzle-filter" label={t('solvesPuzzleFilter')} value={puzzle} onChange={(event) => setPuzzle(event.currentTarget.value as PuzzleType | 'all')}>
          <option value="all">{t('solvesAllPuzzles')}</option>{puzzles.map((item) => <option key={item} value={item}>{puzzleName(item)}</option>)}
        </Select>
        <Select id="solves-session-filter" label={t('solvesSessionFilter')} disabled value=""><option value="">{t('solvesSessionsUnavailable')}</option></Select>
        <Field id="solves-search" label={t('solvesSearch')} type="search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} />
        <Field id="solves-date-from" label={t('solvesDateFrom')} type="date" value={from} onChange={(event) => setFrom(event.currentTarget.value)} />
        <Field id="solves-date-to" label={t('solvesDateTo')} type="date" value={to} onChange={(event) => setTo(event.currentTarget.value)} />
        <Select id="solves-sort" label={t('solvesSort')} value={sort} onChange={(event) => setSort(event.currentTarget.value as SortMode)}>
          <option value="newest">{t('solvesNewest')}</option><option value="oldest">{t('solvesOldest')}</option><option value="fastest">{t('solvesFastest')}</option><option value="slowest">{t('solvesSlowest')}</option>
        </Select>
      </div>
      <p className="data-page__hint">{t('solvesFilterHint')}</p>
      <button className="rv-button rv-button--quiet" onClick={clearFilters} type="button">{t('solvesClearFilters')}</button>
    </section>
    <section aria-labelledby="solves-list-title" className="data-page__section">
      <div className="data-page__section-heading"><h2 id="solves-list-title">{t('solvesListTitle')}</h2><span className="data-page__hint">{state === 'ready' ? `${visibleSolves.length} ${t('solvesCount')}` : ''}</span></div>
      {state === 'loading' && <RouteState state="loading" title={t('solvesLoading')} />}
      {state === 'unavailable' && <RouteState state="unavailable" title={t('solvesUnavailableTitle')} description={t('solvesUnavailable')} />}
      {state === 'error' && <RouteState state="error" title={t('solvesErrorTitle')} description={t('solvesError')} onRetry={() => void load()} />}
      {state === 'ready' && visibleSolves.length === 0 && <RouteState state="empty" title={solves.length ? t('solvesNoFilterMatches') : t('solvesEmptyTitle')} description={solves.length ? t('solvesNoFilterMatchesDescription') : t('solvesEmpty')} />}
      {state === 'ready' && visibleSolves.length > 0 && <>
        <div className="solves-table-wrap"><table className="solves-table"><caption>{t('solvesTableCaption')}</caption><thead><tr><th scope="col">{t('solvesDate')}</th><th scope="col">{t('solvesPuzzle')}</th><th scope="col">{t('solvesRawTime')}</th><th scope="col">{t('solvesPenalty')}</th><th scope="col">{t('solvesEffectiveTime')}</th><th scope="col">{t('solvesSession')}</th><th scope="col">{t('solvesScramble')}</th></tr></thead><tbody>{rows()}</tbody></table></div>
        <div className="solves-mobile-list" aria-label={t('solvesMobileList')}>{rows(true)}</div>
      </>}
    </section>
  </PageContainer>;
}

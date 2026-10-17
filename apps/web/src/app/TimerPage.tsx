import { useState, type SelectHTMLAttributes } from 'react';
import { Badge, Button, Card } from '../shared/components/primitives';
import type { PuzzleType } from '../shared/domain/contracts';
import { useTranslation } from '../shared/i18n/useTranslation';
import { RouteState } from './RouteState';
import { ScrambleDisplay } from './ScrambleDisplay';

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

export function TimerPageShell() {
  const t = useTranslation();
  const [puzzle, setPuzzle] = useState<PuzzleType>('333');
  const overviewStatistics = [
    { key: 'single', label: 'timerStatSingle' },
    { key: 'ao5', label: 'timerStatAo5' },
    { key: 'ao12', label: 'timerStatAo12' },
  ] as const;

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
              value={puzzle}
              aria-describedby="timer-puzzle-hint"
              onChange={(event) => setPuzzle(event.currentTarget.value as PuzzleType)}
            >
              {puzzleTypes.map((type) => <option key={type} value={type}>{puzzleLabel(type)}</option>)}
            </TimerSelector>
            <TimerSelector id="timer-session" label={t('timerSessionLabel')} kind="session" value="" disabled aria-describedby="timer-session-hint">
              <option value="">{t('timerSessionUnavailableOption')}</option>
            </TimerSelector>
            <p className="timer-page__hint timer-page__toolbar-hint" id="timer-session-hint">{t('timerSessionUnavailable')}</p>
            <p className="timer-page__hint rv-visually-hidden" id="timer-puzzle-hint">{t('timerPuzzleHint')}</p>
          </div>

          <Card className="timer-page__scramble" aria-labelledby="timer-scramble-heading">
            <div className="timer-page__section-heading">
              <h2 id="timer-scramble-heading">{t('timerScrambleTitle')}</h2>
              <Badge tone="warning">{t('unavailableBadge')}</Badge>
            </div>
            <ScrambleDisplay scramble={null} unavailableMessage={t('timerScrambleUnavailable')} />
            <p className="timer-page__hint">{t('timerSelectedPuzzle')}: <strong>{puzzleLabel(puzzle)}</strong></p>
          </Card>

          <Card className="timer-page__readout" aria-labelledby="timer-display-heading">
            <div className="timer-page__section-heading">
              <h2 id="timer-display-heading">{t('timerDisplayLabel')}</h2>
              <Badge>{t('timerIdle')}</Badge>
            </div>
            <div className="timer-page__digits" role="timer" aria-label={t('timerDisplayUnavailable')}>--.--</div>
            <p className="timer-page__hint">{t('timerDisplayUnavailable')}</p>
            <div className="timer-page__actions" aria-label={t('timerActionsLabel')}>
              <Button disabled>{t('timerStart')}</Button>
              <Button variant="secondary" disabled>{t('timerStop')}</Button>
            </div>
            <p className="timer-page__instruction">{t('timerInputInstructions')}</p>
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

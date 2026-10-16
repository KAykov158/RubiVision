import { useState } from 'react';
import { Badge, Button, Card, Select } from '../shared/components/primitives';
import type { PuzzleType } from '../shared/domain/contracts';
import { useTranslation } from '../shared/i18n/useTranslation';
import { RouteState } from './RouteState';

const puzzleTypes: PuzzleType[] = ['222', '333', '444', '555', '666', '777'];
const puzzleLabel = (type: PuzzleType) => `${type[0]}×${type[0]}`;

export function TimerPageShell() {
  const t = useTranslation();
  const [puzzle, setPuzzle] = useState<PuzzleType>('333');

  return (
    <main className="rv-page-container app-main timer-page" id="main-content" tabIndex={-1}>
      <header className="timer-page__header">
        <h1>{t('timerTitle')}</h1>
        <p className="app-page-description">{t('timerDescription')}</p>
      </header>

      <div className="timer-page__controls">
        <Select
          id="timer-puzzle"
          label={t('timerPuzzleLabel')}
          value={puzzle}
          aria-describedby="timer-puzzle-hint"
          onChange={(event) => setPuzzle(event.currentTarget.value as PuzzleType)}
        >
          {puzzleTypes.map((type) => <option key={type} value={type}>{puzzleLabel(type)}</option>)}
        </Select>
        <p className="timer-page__hint" id="timer-puzzle-hint">{t('timerPuzzleHint')}</p>
        <Select id="timer-session" label={t('timerSessionLabel')} value="" disabled aria-describedby="timer-session-hint">
          <option value="">{t('timerSessionEmpty')}</option>
        </Select>
        <p className="timer-page__hint" id="timer-session-hint">{t('timerSessionUnavailable')}</p>
      </div>

      <div className="timer-page__primary-grid">
        <Card className="timer-page__scramble" aria-labelledby="timer-scramble-heading">
          <div className="timer-page__section-heading">
            <h2 id="timer-scramble-heading">{t('timerScrambleTitle')}</h2>
            <Badge tone="warning">{t('unavailableBadge')}</Badge>
          </div>
          <p className="timer-page__scramble-empty">{t('timerScrambleUnavailable')}</p>
          <p className="timer-page__hint">{t('timerSelectedPuzzle')}: <strong>{puzzleLabel(puzzle)}</strong></p>
        </Card>

        <Card className="timer-page__readout" aria-labelledby="timer-display-heading">
          <div className="timer-page__section-heading">
            <h2 id="timer-display-heading">{t('timerDisplayLabel')}</h2>
            <Badge>{t('timerIdle')}</Badge>
          </div>
          <div className="timer-page__digits" role="timer" aria-label={t('timerDisplayUnavailable')}>0.00</div>
          <p className="timer-page__hint">{t('timerDisplayUnavailable')}</p>
          <div className="timer-page__actions" aria-label={t('timerActionsLabel')}>
            <Button disabled>{t('timerStart')}</Button>
            <Button variant="secondary" disabled>{t('timerStop')}</Button>
          </div>
          <p className="timer-page__instruction">{t('timerInputInstructions')}</p>
        </Card>
      </div>

      <div className="timer-page__secondary-grid">
        <Card aria-labelledby="timer-inspection-heading">
          <h2 id="timer-inspection-heading">{t('timerInspectionTitle')}</h2>
          <p className="timer-page__hint">{t('timerInspectionUnavailable')}</p>
        </Card>
        <Card aria-labelledby="timer-visualization-heading">
          <h2 id="timer-visualization-heading">{t('timerVisualizationTitle')}</h2>
          <div className="timer-page__visualization" role="img" aria-label={t('timerVisualizationUnavailable')}>
            <span aria-hidden="true">{t('timerVisualizationMark')}</span>
          </div>
          <p className="timer-page__hint">{t('timerVisualizationUnavailable')}</p>
        </Card>
      </div>

      <section className="timer-page__supporting" aria-label={t('timerSupportingSections')}>
        <section aria-labelledby="timer-recent-heading">
          <h2 id="timer-recent-heading">{t('timerRecentSolvesTitle')}</h2>
          <RouteState state="unavailable" title={t('timerRecentSolvesUnavailableTitle')} description={t('timerRecentSolvesUnavailable')} />
        </section>
        <section aria-labelledby="timer-statistics-heading">
          <h2 id="timer-statistics-heading">{t('timerStatisticsTitle')}</h2>
          <div className="timer-page__stats" aria-label={t('timerStatisticsUnavailable')}>
            <Card><h3>{t('timerStatBest')}</h3><p>—</p></Card>
            <Card><h3>{t('timerStatAo5')}</h3><p>—</p></Card>
            <Card><h3>{t('timerStatAo12')}</h3><p>—</p></Card>
          </div>
          <p className="timer-page__hint">{t('timerStatisticsUnavailable')}</p>
        </section>
      </section>
    </main>
  );
}

import { Badge, Button, Card, PageContainer } from '../shared/components/primitives';
import { useTranslation } from '../shared/i18n/useTranslation';
import { RouteState } from './RouteState';

type AnalysisPanelState = 'loading' | 'empty' | 'unavailable' | 'error';
type CameraAccessState = 'not-requested' | 'denied' | 'unsupported';

const cameraMessages = {
  'not-requested': 'analyzeCameraNotRequested',
  denied: 'analyzeCameraPermissionDenied',
  unsupported: 'analyzeCameraUnsupported',
} as const;

/** Display-only permission messaging. This component never reads or requests camera access. */
export function CameraAccessNotice({ state }: { state: CameraAccessState }) {
  const t = useTranslation();
  return <p className="data-page__hint" role={state === 'denied' ? 'alert' : 'status'}>{t(cameraMessages[state])}</p>;
}

/** Shared state slot for a future recording/analysis service integration. */
export function AnalysisStatePanel({ state, onRetry }: { state: AnalysisPanelState; onRetry?: () => void }) {
  const t = useTranslation();
  const messages = {
    loading: ['analyzeLoadingTitle', 'analyzeLoadingDescription'],
    empty: ['analyzeEmptyTitle', 'analyzeEmptyDescription'],
    unavailable: ['analyzeUnavailableTitle', 'analyzeUnavailable'],
    error: ['analyzeErrorTitle', 'analyzeError'],
  } as const;
  const [titleKey, descriptionKey] = messages[state];
  return <RouteState state={state} title={t(titleKey)} description={t(descriptionKey)} onRetry={onRetry} />;
}

export function AnalyzePage() {
  const t = useTranslation();

  return <PageContainer className="app-main data-page analyze-page" id="main-content" tabIndex={-1}>
    <header className="data-page__header"><div><h1>{t('analyzeTitle')}</h1><p className="app-page-description">{t('analyzeDescription')}</p></div><Badge tone="warning">{t('plannedBadge')}</Badge></header>

    <section aria-labelledby="analyze-input-title" className="data-page__section">
      <h2 id="analyze-input-title">{t('analyzeInputTitle')}</h2>
      <div className="analyze-entry-grid">
        <Card className="analyze-entry-card">
          <h3>{t('analyzeCameraTitle')}</h3>
          <p>{t('analyzeCameraDescription')}</p>
          <Button disabled aria-describedby="analyze-entry-status">{t('analyzeCameraAction')}</Button>
        </Card>
        <Card className="analyze-entry-card">
          <h3>{t('analyzeUploadTitle')}</h3>
          <p>{t('analyzeUploadDescription')}</p>
          <Button variant="secondary" disabled aria-describedby="analyze-entry-status">{t('analyzeUploadAction')}</Button>
        </Card>
      </div>
      <p className="data-page__hint" id="analyze-entry-status">{t('analyzeEntryUnavailable')}</p>
    </section>

    <section aria-labelledby="analyze-recording-title" className="data-page__section">
      <div className="data-page__section-heading"><h2 id="analyze-recording-title">{t('analyzeRecordingTitle')}</h2><Badge>{t('emptyStatus')}</Badge></div>
      <Card className="analyze-video-panel" role="img" aria-label={t('analyzeVideoEmpty')}><span aria-hidden="true">{t('analyzeVideoMark')}</span><p>{t('analyzeVideoEmpty')}</p></Card>
      <CameraAccessNotice state="not-requested" />
    </section>

    <section aria-labelledby="analyze-results-title" className="data-page__section">
      <div className="data-page__section-heading"><h2 id="analyze-results-title">{t('analyzeResultsTitle')}</h2><Badge tone="warning">{t('unavailableBadge')}</Badge></div>
      <AnalysisStatePanel state="unavailable" />
      <div className="analyze-results-grid">
        <Card><h3>{t('analyzeMovementTitle')}</h3><p>{t('analyzeNoClassification')}</p></Card>
        <Card><h3>{t('analyzePauseTitle')}</h3><p>{t('analyzeNoClassification')}</p></Card>
        <Card><h3>{t('analyzeUncertainTitle')}</h3><p>{t('analyzeNoClassification')}</p></Card>
        <Card><h3>{t('analyzeCfopTitle')}</h3><p>{t('analyzeCfopFuture')}</p></Card>
      </div>
      <p className="analyze-limitation">{t('analyzeLimitation')}</p>
    </section>
  </PageContainer>;
}

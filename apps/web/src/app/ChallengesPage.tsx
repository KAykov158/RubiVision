import { Badge, Button, Card, PageContainer } from '../shared/components/primitives';
import { useTranslation } from '../shared/i18n/useTranslation';
import { RouteState } from './RouteState';

export function ChallengesPage() {
  const t = useTranslation();

  return <PageContainer className="app-main data-page challenges-page" id="main-content" tabIndex={-1}>
    <header className="data-page__header"><div><h1>{t('challengesTitle')}</h1><p className="app-page-description">{t('challengesDescription')}</p></div><Badge tone="warning">{t('plannedBadge')}</Badge></header>

    <section aria-labelledby="challenges-discovery-title" className="data-page__section">
      <div className="data-page__section-heading"><h2 id="challenges-discovery-title">{t('challengesDiscoveryTitle')}</h2><Badge>{t('notConfiguredBadge')}</Badge></div>
      <Card className="challenge-discovery">
        <p>{t('challengesNoDescriptions')}</p>
        <RouteState state="empty" title={t('challengesEmptyTitle')} description={t('challengesEmptyDescription')} />
      </Card>
    </section>

    <section aria-labelledby="challenges-participation-title" className="data-page__section">
      <div className="data-page__section-heading"><h2 id="challenges-participation-title">{t('challengesParticipationTitle')}</h2><Badge tone="warning">{t('unavailableBadge')}</Badge></div>
      <Card className="challenge-participation">
        <p>{t('challengesParticipationDescription')}</p>
        <Button disabled aria-describedby="challenge-participation-status">{t('challengesJoin')}</Button>
        <span className="data-page__hint" id="challenge-participation-status">{t('challengesParticipationUnavailable')}</span>
        <RouteState state="unavailable" title={t('challengesParticipationUnavailableTitle')} description={t('challengesParticipationUnavailable')} />
      </Card>
    </section>
  </PageContainer>;
}

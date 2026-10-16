import { Link } from 'react-router';
import { PageContainer } from '../shared/components/primitives';
import { useTranslation } from '../shared/i18n/useTranslation';
import { ThemeSettings } from '../shared/preferences/ThemeSettings';
import { RouteState } from './RouteState';
import { TimerPageShell } from './TimerPage';
import { SolvesPage } from './SolvesPage';
import { StatisticsPage } from './StatisticsPage';

type FeaturePageProps = {
  titleKey: 'timerTitle' | 'solvesTitle' | 'statisticsTitle' | 'analyzeTitle' | 'challengesTitle';
  descriptionKey: 'timerDescription' | 'solvesDescription' | 'statisticsDescription' | 'analyzeDescription' | 'challengesDescription';
  unavailableKey: 'timerUnavailable' | 'solvesUnavailable' | 'statisticsUnavailable' | 'analyzeUnavailable' | 'challengesUnavailable';
};

function FeaturePage({ titleKey, descriptionKey, unavailableKey }: FeaturePageProps) {
  const t = useTranslation();

  return (
    <PageContainer className="app-main" id="main-content" tabIndex={-1}>
      <h1>{t(titleKey)}</h1>
      <p className="app-page-description">{t(descriptionKey)}</p>
      <RouteState state="unavailable" description={t(unavailableKey)} />
    </PageContainer>
  );
}

export function TimerPage() {
  return <TimerPageShell />;
}

export { SolvesPage, StatisticsPage };

export function AnalyzePage() {
  return <FeaturePage titleKey="analyzeTitle" descriptionKey="analyzeDescription" unavailableKey="analyzeUnavailable" />;
}

export function ChallengesPage() {
  return <FeaturePage titleKey="challengesTitle" descriptionKey="challengesDescription" unavailableKey="challengesUnavailable" />;
}

export function SettingsPage() {
  const t = useTranslation();

  return (
    <PageContainer className="app-main" id="main-content" tabIndex={-1}>
      <h1>{t('settingsTitle')}</h1>
      <ThemeSettings />
    </PageContainer>
  );
}

export function NotFoundPage() {
  const t = useTranslation();

  return (
    <PageContainer className="app-main" id="main-content" tabIndex={-1}>
      <h1>{t('notFoundTitle')}</h1>
      <p>{t('notFoundDescription')}</p>
      <Link className="rv-button rv-button--primary" to="/timer">{t('returnToTimer')}</Link>
    </PageContainer>
  );
}

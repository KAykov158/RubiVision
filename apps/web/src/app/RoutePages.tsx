import { Link } from 'react-router';
import { PageContainer } from '../shared/components/primitives';
import { useTranslation } from '../shared/i18n/useTranslation';
import { TimerPageShell } from './TimerPage';
import { SolvesPage } from './SolvesPage';
import { StatisticsPage } from './StatisticsPage';
import { AnalyzePage } from './AnalyzePage';
import { ChallengesPage } from './ChallengesPage';
import { SettingsPage } from './SettingsPage';

export function TimerPage() {
  return <TimerPageShell />;
}

export { SolvesPage, StatisticsPage };

export { AnalyzePage, ChallengesPage, SettingsPage };

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

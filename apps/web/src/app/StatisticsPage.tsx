import { Card, PageContainer, Select } from '../shared/components/primitives';
import { useTranslation } from '../shared/i18n/useTranslation';
import { RouteState } from './RouteState';

export function StatisticsPage() {
  const t = useTranslation();
  const stats = [
    ['statisticsBest', 'statisticsNoValue'],
    ['statisticsMean', 'statisticsNoValue'],
    ['statisticsAo5', 'statisticsNoValue'],
    ['statisticsAo12', 'statisticsNoValue'],
  ] as const;

  return <PageContainer className="app-main data-page statistics-page" id="main-content" tabIndex={-1}>
    <header className="data-page__header"><div><h1>{t('statisticsTitle')}</h1><p className="app-page-description">{t('statisticsDescription')}</p></div><p className="statistics-page__session">{t('statisticsSessionContext')}</p></header>
    <section aria-labelledby="statistics-filters-title" className="data-page__section">
      <h2 id="statistics-filters-title">{t('statisticsFilters')}</h2>
      <div className="statistics-filter-group">
        <div className="statistics-filters">
          <Select id="statistics-puzzle" label={t('statisticsPuzzleFilter')} aria-describedby="statistics-filters-hint" disabled value=""><option value="">{t('statisticsFilterUnavailableOption')}</option></Select>
          <Select id="statistics-session" label={t('statisticsSessionFilter')} aria-describedby="statistics-filters-hint" disabled value=""><option value="">{t('statisticsFilterUnavailableOption')}</option></Select>
          <Select id="statistics-date-range" label={t('statisticsDateRange')} aria-describedby="statistics-filters-hint" disabled value=""><option value="">{t('statisticsFilterUnavailableOption')}</option></Select>
        </div>
        <p className="statistics-filters__hint" id="statistics-filters-hint">{t('statisticsFiltersUnavailable')}</p>
      </div>
    </section>
    <section aria-labelledby="statistics-summary-title" className="data-page__section">
      <h2 id="statistics-summary-title">{t('statisticsSummary')}</h2>
      <div className="statistics-summary">{stats.map(([label, value]) => <Card key={label}><h3>{t(label)}</h3><p aria-label={t(value)}>{t(value)}</p></Card>)}</div>
      <RouteState state="empty" title={t('statisticsInsufficientTitle')} description={t('statisticsInsufficient')} />
    </section>
    <section aria-labelledby="statistics-trend-title" className="data-page__section">
      <h2 id="statistics-trend-title">{t('statisticsTrend')}</h2>
      <Card className="statistics-chart" role="img" aria-label={t('statisticsChartUnavailable')}><p>{t('statisticsChartUnavailable')}</p></Card>
      <div className="statistics-chart-fallback">
        <table><caption>{t('statisticsTrendTableCaption')}</caption><thead><tr><th scope="col">{t('statisticsTrendDate')}</th><th scope="col">{t('statisticsTrendValue')}</th></tr></thead><tbody><tr><td colSpan={2}>{t('statisticsInsufficient')}</td></tr></tbody></table>
      </div>
    </section>
  </PageContainer>;
}

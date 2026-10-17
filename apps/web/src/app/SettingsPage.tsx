import { Badge, Card, PageContainer, Select } from '../shared/components/primitives';
import { useTranslation } from '../shared/i18n/useTranslation';
import { ThemeSettings } from '../shared/preferences/ThemeSettings';
import { RouteState } from './RouteState';

export function SettingsPage() {
  const t = useTranslation();

  return <PageContainer className="app-main data-page settings-page" id="main-content" tabIndex={-1}>
    <header className="data-page__header"><div><h1>{t('settingsTitle')}</h1><p className="app-page-description">{t('settingsDescription')}</p></div></header>

    <section className="settings-section" aria-labelledby="settings-account-title">
      <div className="data-page__section-heading"><h2 id="settings-account-title">{t('settingsAccountTitle')}</h2><Badge tone="warning">{t('unavailableBadge')}</Badge></div>
      <RouteState state="unavailable" title={t('settingsAccountUnavailableTitle')} description={t('settingsAccountUnavailable')} />
    </section>

    <div className="settings-section" id="settings-appearance-title">
      <ThemeSettings />
    </div>

    <section className="settings-section" aria-labelledby="settings-language-title">
      <div className="data-page__section-heading"><h2 id="settings-language-title">{t('settingsLanguageTitle')}</h2><Badge>{t('settingsSessionOnlyBadge')}</Badge></div>
      <Card className="settings-card">
        <Select id="settings-language" label={t('settingsLanguageLabel')} disabled value="en"><option value="en">{t('settingsEnglish')}</option></Select>
        <p className="data-page__hint">{t('settingsLanguageUnavailable')}</p>
      </Card>
    </section>

    <section className="settings-section" aria-labelledby="settings-privacy-title">
      <div className="data-page__section-heading"><h2 id="settings-privacy-title">{t('settingsPrivacyTitle')}</h2><Badge tone="warning">{t('unavailableBadge')}</Badge></div>
      <Card className="settings-card"><p>{t('settingsPrivacyDescription')}</p><p className="data-page__hint">{t('settingsPrivacyCamera')}</p></Card>
    </section>

    <section className="settings-section" aria-labelledby="settings-application-title">
      <div className="data-page__section-heading"><h2 id="settings-application-title">{t('settingsApplicationTitle')}</h2><Badge>{t('settingsNotSavedBadge')}</Badge></div>
      <div className="settings-preference-grid">
        <Card><h3>{t('settingsTimerTitle')}</h3><p>{t('settingsTimerUnavailable')}</p></Card>
        <Card><h3>{t('settingsCameraTitle')}</h3><p>{t('settingsCameraUnavailable')}</p></Card>
        <Card><h3>{t('settingsMotionTitle')}</h3><p>{t('settingsMotionDescription')}</p></Card>
        <Card><h3>{t('settingsAnalysisTitle')}</h3><p>{t('settingsAnalysisUnavailable')}</p></Card>
      </div>
    </section>
  </PageContainer>;
}

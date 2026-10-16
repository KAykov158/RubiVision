import { Select } from '../components/primitives';
import type { ThemePreference } from '../domain/contracts';
import { useTranslation } from '../i18n/useTranslation';
import { useThemePreference } from './useThemePreference';

export function ThemeSettings() {
  const t = useTranslation();
  const { preference, setPreference, message } = useThemePreference();

  return (
    <section className="app-preferences" aria-labelledby="appearance-heading">
      <h2 id="appearance-heading">{t('appearanceHeading')}</h2>
      <Select
        label={t('themeLabel')}
        value={preference}
        onChange={(event) => setPreference(event.target.value as ThemePreference)}
      >
        <option value="system">{t('themeSystem')}</option>
        <option value="light">{t('themeLight')}</option>
        <option value="dark">{t('themeDark')}</option>
      </Select>
      <p className="app-preferences__status" role="status">{message ?? ''}</p>
    </section>
  );
}

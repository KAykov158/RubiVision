import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { ServiceResult, ThemePreference } from '../domain/contracts';
import { useAppServices } from '../../app/useAppServices';
import { useTranslation } from '../i18n/useTranslation';
import { ThemeContext, type PreferenceMessage, type ThemeContextValue } from './themeContext';
import { isThemePreference, type ResolvedTheme } from './themePreference';

function getSystemTheme(): ResolvedTheme {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function messageKey(message: PreferenceMessage) {
  switch (message) {
    case 'saved': return 'themeSaved';
    case 'session-only': return 'themeSessionOnly';
    case 'save-failed': return 'themeSaveFailed';
    case 'load-failed': return 'themeLoadFailed';
    case 'invalid': return 'themeInvalid';
    case null: return null;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const servicesState = useAppServices();
  const preferencesService = servicesState.status === 'ready' ? servicesState.services.preferences : undefined;
  const t = useTranslation();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());
  const [message, setMessage] = useState<PreferenceMessage>(preferencesService ? null : 'session-only');
  const [hasLoaded, setHasLoaded] = useState(!preferencesService);
  const saveSequence = useRef(0);

  useEffect(() => {
    const mediaQuery = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;
    if (!mediaQuery) return;

    if (preference !== 'system') return;

    const handleChange = (event: MediaQueryListEvent) => setSystemTheme(event.matches ? 'dark' : 'light');
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener?.(handleChange);
    return () => mediaQuery.removeListener?.(handleChange);
  }, [preference]);

  useEffect(() => {
    let active = true;
    if (!preferencesService) {
      return () => { active = false; };
    }

    void Promise.resolve().then(() => preferencesService.getThemePreference()).then((result) => {
      if (!active) return;
      setHasLoaded(true);
      if (result.status === 'success') {
        if (result.data === null) {
          setMessage(null);
        } else if (isThemePreference(result.data)) {
          setPreferenceState(result.data);
          setMessage(null);
        } else {
          setPreferenceState('system');
          setMessage('invalid');
        }
      } else {
        setMessage('load-failed');
      }
    }).catch(() => {
      if (!active) return;
      setHasLoaded(true);
      setMessage('load-failed');
    });

    return () => { active = false; };
  }, [preferencesService]);

  useEffect(() => {
    document.documentElement.dataset.theme = preference;
  }, [preference]);

  const setPreference = useCallback((nextPreference: ThemePreference) => {
    setPreferenceState(nextPreference);
    if (nextPreference === 'system') setSystemTheme(getSystemTheme());
    const sequence = ++saveSequence.current;
    if (!preferencesService) {
      setMessage('session-only');
      return;
    }

    void Promise.resolve().then(() => preferencesService.saveThemePreference(nextPreference)).then((result: ServiceResult<void>) => {
      if (saveSequence.current !== sequence) return;
      setMessage(result.status === 'success' ? 'saved' : 'save-failed');
    }).catch(() => {
      if (saveSequence.current === sequence) setMessage('save-failed');
    });
  }, [preferencesService]);

  const resolvedTheme = preference === 'system' ? systemTheme : preference;
  const activeMessageKey = messageKey(message);
  const value = useMemo<ThemeContextValue>(() => ({
    preference,
    resolvedTheme,
    setPreference,
    message: hasLoaded && activeMessageKey ? t(activeMessageKey) : null,
  }), [preference, resolvedTheme, setPreference, hasLoaded, activeMessageKey, t]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

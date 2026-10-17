import type { ThemePreference } from '../domain/contracts';

export type ResolvedTheme = Exclude<ThemePreference, 'system'>;

const THEME_PREFERENCES: readonly ThemePreference[] = ['system', 'light', 'dark'];

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && THEME_PREFERENCES.includes(value as ThemePreference);
}

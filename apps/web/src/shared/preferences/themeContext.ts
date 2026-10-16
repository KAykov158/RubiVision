import { createContext } from 'react';
import type { ThemePreference } from '../domain/contracts';
import type { ResolvedTheme } from './themePreference';

export type PreferenceMessage = 'saved' | 'session-only' | 'save-failed' | 'load-failed' | 'invalid' | null;

export interface ThemeContextValue {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (theme: ThemePreference) => void;
  message: string | null;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

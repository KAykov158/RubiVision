import { useContext } from 'react';
import { ThemeContext } from './themeContext';

export function useThemePreference() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemePreference must be used within ThemeProvider.');
  return context;
}

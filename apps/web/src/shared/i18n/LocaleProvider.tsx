import type { ReactNode } from 'react';
import { LocaleContext } from './localeContext';
import type { Locale } from './messages';

export function LocaleProvider({ locale = 'en', children }: { locale?: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

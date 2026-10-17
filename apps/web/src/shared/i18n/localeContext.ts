import { createContext } from 'react';
import type { Locale } from './messages';

export const LocaleContext = createContext<Locale>('en');

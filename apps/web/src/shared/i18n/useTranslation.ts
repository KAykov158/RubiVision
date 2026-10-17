import { useContext } from 'react';
import { LocaleContext } from './localeContext';
import { translate, type MessageKey } from './messages';

export function useTranslation() {
  const locale = useContext(LocaleContext);
  return (key: MessageKey) => translate(locale, key);
}

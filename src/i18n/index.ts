import { en } from './en';
import { ta } from './ta';
import { I18nStrings } from './types';

export type ScreenLanguage = 'en' | 'ta';

export function getDictionary(lang: ScreenLanguage = 'en'): I18nStrings {
  return lang === 'ta' ? ta : en;
}

export * from './types';
export { en, ta };

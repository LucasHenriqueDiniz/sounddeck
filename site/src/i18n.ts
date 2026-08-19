import en from './i18n/en.json';
import pt from './i18n/pt.json';
import es from './i18n/es.json';
import de from './i18n/de.json';
import fr from './i18n/fr.json';

/**
 * English is the source of truth: TranslationKey is derived from it, so a key
 * that exists nowhere else is a type error rather than a blank on the page.
 */
export type TranslationKey = keyof typeof en;

export const LANGS = ['en', 'pt', 'es', 'de', 'fr'] as const;
export type Lang = (typeof LANGS)[number];

/** Names, never flags — a flag is a country, not a language. */
export const LANG_NAMES: Record<Lang, string> = {
  en: 'English',
  pt: 'Português',
  es: 'Español',
  de: 'Deutsch',
  fr: 'Français',
};

const DICTS: Record<Lang, Record<string, string>> = { en, pt, es, de, fr };

export type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string;

export function translator(lang: Lang): Translate {
  const dict = DICTS[lang];
  return (key, vars) => {
    let value = dict[key] ?? DICTS.en[key] ?? key;
    if (vars) {
      for (const [name, replacement] of Object.entries(vars)) {
        value = value.split(`{${name}}`).join(String(replacement));
      }
    }
    return value;
  };
}

/**
 * English lives at the root and every other language under its own prefix.
 * This is not a style choice: a JavaScript language switcher got only the
 * default language indexed, which is why each language now has to be a real
 * URL serving real translated HTML.
 */
export function langPrefix(lang: Lang): string {
  return lang === 'en' ? '' : `/${lang}`;
}

export function hrefFor(lang: Lang, path: string): string {
  const suffix = path === '/' ? '/' : path;
  return `${langPrefix(lang)}${suffix}` || '/';
}

/**
 * The languages and the URL helpers. Light on purpose (no text, no calculators): browser code and the build config import this file.
 * English (US) lives at the root (/about/); every other language has its own prefix (/de/about/, /pt-br/about/).
 */
import type { LangCode, Language } from './types';

export const LANGUAGES: readonly Language[] = [
  { code: 'en', hreflang: 'en-US', native: 'English (US)', ogLocale: 'en_US', flag: 'en', reviewed: true },
  { code: 'en-gb', hreflang: 'en-GB', native: 'English (UK)', ogLocale: 'en_GB', flag: 'en-GB', reviewed: true },
  { code: 'hi', hreflang: 'hi', native: 'हिन्दी', ogLocale: 'hi_IN', flag: 'hi', reviewed: false },
  { code: 'bn', hreflang: 'bn', native: 'বাংলা', ogLocale: 'bn_BD', flag: 'bn', reviewed: false },
  { code: 'pt-br', hreflang: 'pt-BR', native: 'Português (Brasil)', ogLocale: 'pt_BR', flag: 'pt-BR', reviewed: false },
  { code: 'id', hreflang: 'id', native: 'Bahasa Indonesia', ogLocale: 'id_ID', flag: 'id', reviewed: false },
  { code: 'ru', hreflang: 'ru', native: 'Русский', ogLocale: 'ru_RU', flag: 'ru', reviewed: false },
  { code: 'de', hreflang: 'de', native: 'Deutsch', ogLocale: 'de_DE', flag: 'de', reviewed: false },
  { code: 'es', hreflang: 'es', native: 'Español', ogLocale: 'es_ES', flag: 'es', reviewed: false },
  { code: 'fr', hreflang: 'fr', native: 'Français', ogLocale: 'fr_FR', flag: 'fr', reviewed: false },
  { code: 'tr', hreflang: 'tr', native: 'Türkçe', ogLocale: 'tr_TR', flag: 'tr', reviewed: false },
];
export const DEFAULT_LANG: LangCode = 'en';

export const isLang = (s: string | undefined): s is LangCode => !!s && LANGUAGES.some((l) => l.code === s);
export const languageOf = (code: LangCode): Language => LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0]!;

/** The URL of a page in a language. `path` is the English path, such as "/about/" or "/". */
export function localePath(lang: LangCode, path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return lang === DEFAULT_LANG ? p : p === '/' ? `/${lang}/` : `/${lang}${p}`;
}

/** Splits "/de/about/" into the language and the English path "/about/". Paths without a language prefix are English. */
export function splitLocale(pathname: string): { lang: LangCode; key: string } {
  const p = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const first = p.split('/')[1] ?? '';
  if (first !== DEFAULT_LANG && isLang(first)) return { lang: first, key: p.slice(first.length + 1) || '/' };
  return { lang: DEFAULT_LANG, key: p };
}

/** Fills {name} placeholders. A placeholder with no value stays as it is, so a mistake shows on the page instead of vanishing. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

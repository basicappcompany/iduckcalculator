/**
 * Languages and localized URLs. English (US) lives at the root (/about/); every other language has its own prefix (/de/about/, /pt-br/about/),
 * is built into real pages at build time, and links to the other languages with hreflang. A page exists in a language only once it is translated:
 * `PAGE_LANGS` lists, for each page, the languages it exists in. Everything else falls back to the English page, so there are no English
 * copies under a foreign prefix.
 *
 * Add a language: write `<code>.ts` next to `en.ts`, add it to `LOCALES` and `ALL_LANGUAGES` below, and to `LangCode` in types.ts. A unit test fails if a key or a placeholder is missing.
 */
import { bn } from './bn';
import { de } from './de';
import { en } from './en';
import { enGb } from './en-gb';
import { es } from './es';
import { fr } from './fr';
import { hi } from './hi';
import { id } from './id';
import { ptBr } from './pt-br';
import { ru } from './ru';
import { tr } from './tr';
import type { LangCode, Language, Locale } from './types';

export type { Chrome, HomeText, LangCode, Language, Locale } from './types';

const ALL_LANGUAGES: readonly Language[] = [
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

export const LOCALES: Record<LangCode, Locale> = { en, 'en-gb': enGb, hi, bn, 'pt-br': ptBr, id, ru, de, es, fr, tr };

/** The languages, in menu order. */
export const LANGUAGES: readonly Language[] = ALL_LANGUAGES;
export const DEFAULT_LANG: LangCode = 'en';
export const EN = en;

export const isLang = (s: string | undefined): s is LangCode => !!s && LANGUAGES.some((l) => l.code === s);
export const languageOf = (code: LangCode): Language => LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0]!;
export const localeOf = (code: LangCode): Locale => LOCALES[code];

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

const ALL_CODES = LANGUAGES.map((l) => l.code);
/**
 * The languages each page exists in, by English path. Pages not listed here exist in English only.
 * Stage 1 of the localization work: the home page. Calculators, guides and the other pages follow as they are translated.
 */
export const PAGE_LANGS: Readonly<Record<string, readonly LangCode[]>> = {
  '/': ALL_CODES,
};

export const langsFor = (key: string): readonly LangCode[] => PAGE_LANGS[key] ?? [DEFAULT_LANG];

/** A link to a page, in the reader's language when that page is translated, in English when it is not. */
export function pageHref(lang: LangCode, key: string): string {
  return langsFor(key).includes(lang) ? localePath(lang, key) : localePath(DEFAULT_LANG, key);
}

/** The link the language menu uses: the same page in that language, or that language's home page if this page is not translated yet. */
export function switchHref(to: LangCode, key: string): string {
  return langsFor(key).includes(to) ? localePath(to, key) : localePath(to, '/');
}

/** Fills {name} placeholders. A placeholder with no value stays as it is, so a mistake shows on the page instead of vanishing. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

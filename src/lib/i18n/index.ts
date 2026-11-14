/**
 * Languages, the text of the menus and the home page (one file per language), and which pages exist in which language.
 * Server and test code imports this; browser code imports `languages.ts` or `catalog.ts` instead, so the text of eleven languages never
 * reaches a visitor's browser.
 *
 * Add a language: write `<code>.ts` next to `en.ts`, add it to `LOCALES` and to `LANGUAGES` in languages.ts and to `LangCode` in types.ts,
 * and make its catalog (see catalog.ts and CLAUDE.md). A unit test fails if a key or a placeholder is missing.
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
import type { LangCode, Locale } from './types';

export type { Chrome, HomeText, LangCode, Language, Locale } from './types';
export * from './languages';
export * from './pages';

export const LOCALES: Record<LangCode, Locale> = { en, 'en-gb': enGb, hi, bn, 'pt-br': ptBr, id, ru, de, es, fr, tr };
export const EN = en;
export const localeOf = (code: LangCode): Locale => LOCALES[code];

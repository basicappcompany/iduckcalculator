/**
 * Loads the catalogs for the build (Astro pages and tests). The catalogs are JSON files in src/i18n/catalog/<code>.json and are only ever
 * imported here, so they stay out of the browser bundle; a page passes its island just the few strings it needs (see `stringsFor`).
 */
import { appendFileSync, mkdirSync } from 'node:fs';
import { makeTr, type Catalog, type Tr } from './catalog';
import { ukify } from './uk';
import type { LangCode } from './types';

const files = import.meta.glob<Catalog>('../../i18n/catalog/*.json', { eager: true, import: 'default' });
const byCode: Partial<Record<string, Catalog>> = {};
for (const [path, cat] of Object.entries(files)) byCode[/\/([\w-]+)\.json$/.exec(path)![1]!] = cat;

export const catalogOf = (lang: LangCode): Catalog => byCode[lang] ?? {};

/** English strings that had no translation, by language, collected while pages are built. Printed by the audit. */
export const MISSES: Record<string, Set<string>> = {};

/** The translate function a localized page uses. English returns the text as it is; English (UK) changes the spelling. */
export function trFor(lang: LangCode): Tr {
  if (lang === 'en') return (s) => s;
  if (lang === 'en-gb') return (s) => ukify(s);
  const cat = catalogOf(lang);
  const misses = (MISSES[lang] ??= new Set());
  return makeTr(cat, (s) => {
    if (misses.has(s)) return;
    misses.add(s);
    // `I18N_LOG=1 pnpm build` writes every untranslated English string that a page showed, for scripts/i18n-audit.mjs.
    if (process.env['I18N_LOG'] === '1') {
      mkdirSync('i18n-work', { recursive: true });
      appendFileSync('i18n-work/misses.log', `${lang}	${JSON.stringify(s)}
`);
    }
  });
}

/**
 * Which pages exist in which language. A page exists in a language only once translated, so there are no English copies under a foreign
 * prefix: a link to a page that is not translated goes to the English page, and the language menu goes to that language's home page.
 * Not translated, on purpose: the privacy and terms pages (legal text stays English, like on iduckpdf.com) and the pages that stay out of
 * search results (the helper chat, forms, settings).
 */
import { CALCULATORS, calcPath } from '../calc';
import { hubPath, liveCountries } from '../calc/countries';
import { GUIDES, guidePath } from '../guides';
import { COMMUNITY, communityPath } from '../community';
import { DEFAULT_LANG, LANGUAGES, localePath } from './languages';
import type { LangCode } from './types';

const ALL: readonly LangCode[] = LANGUAGES.map((l) => l.code);

/** English paths of the pages that exist in every language. */
const EVERYWHERE = new Set<string>([
  '/',
  '/calculators/',
  '/guides/',
  hubPath(),
  ...liveCountries().map((c) => hubPath(c)),
  ...CALCULATORS.map((c) => calcPath(c.slug)),
  ...GUIDES.map((g) => guidePath(g.slug)),
  ...COMMUNITY.filter((p) => p.indexable).map((p) => communityPath(p.slug)),
]);

export const langsFor = (key: string): readonly LangCode[] => (EVERYWHERE.has(key) ? ALL : [DEFAULT_LANG]);

/** A link to a page, in the reader's language when that page is translated, in English when it is not. */
export function pageHref(lang: LangCode, key: string): string {
  return langsFor(key).includes(lang) ? localePath(lang, key) : localePath(DEFAULT_LANG, key);
}

/** The link the language menu uses: the same page in that language, or that language's home page if this page is not translated. */
export function switchHref(to: LangCode, key: string): string {
  return langsFor(key).includes(to) ? localePath(to, key) : localePath(to, '/');
}

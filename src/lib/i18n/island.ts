/** The translations a calculator page hands to its island: only the strings that calculator can show, so the page stays small. Build time only. */
import { collect } from './collect';
import { catalogOf } from './loader';
import { ukify } from './uk';
import type { LangCode } from './types';

export function islandStrings(lang: LangCode, slug: string): Record<string, string> | undefined {
  if (lang === 'en') return undefined;
  const c = collect();
  const keys = new Set(slug === 'share' ? c.shareKeys : [...(c.calcKeys.get(slug) ?? []), ...c.uiKeys]);
  const out: Record<string, string> = {};
  if (lang === 'en-gb') {
    for (const k of keys) out[k] = ukify(k);
    return out;
  }
  const cat = catalogOf(lang);
  for (const k of keys) if (cat[k] !== undefined) out[k] = cat[k]!;
  return out;
}

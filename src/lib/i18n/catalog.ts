/**
 * The translation catalog: for each language one flat object, English string -> translated string.
 *
 * The English text stays in the code. A localized page (/de/...) asks `translate(catalog, text)` for every English string it shows:
 *  1. an exact match (the whole string is a key);
 *  2. a pattern match: every run of digits is replaced by {0}, {1}... in the English string and in the key, so "At 7.1% a year" and
 *     "At 8.2% a year" share one entry "At {0}% a year" and the numbers are put back in the translation;
 *  3. sentence by sentence, for notes and composed answers that are built from several sentences;
 *  4. otherwise the English string is shown and the miss is recorded, so a test or the build can list what is still untranslated.
 * English (US) needs no catalog. English (UK) is made from the English text by `ukify` (uk.ts).
 */

export type Catalog = Readonly<Record<string, string>>;

/** One run of digits, with the thousands separators and decimals inside it: 3,46,154 and 7.1 and 2026. */
const NUMBER = /\d[\d,]*(?:\.\d+)?/g;

/** "At 7.1% a year" -> { key: "At {0}% a year", nums: ["7.1"] }. */
export function normalize(s: string): { key: string; nums: string[] } {
  const nums: string[] = [];
  const key = s.replace(NUMBER, (m) => `{${nums.push(m) - 1}}`);
  return { key, nums };
}

/** Puts numbers back into a translated pattern. A placeholder with no number stays visible. */
export function denormalize(template: string, nums: readonly string[]): string {
  return template.replace(/\{(\d+)\}/g, (m, i: string) => nums[Number(i)] ?? m);
}

/** Splits at a full stop, "!" or "?" followed by a space. Decimals ("7.1%") and abbreviations without a space are not split. */
export function splitSentences(s: string): string[] {
  return s.split(/(?<=[.!?])\s+(?=\S)/).filter((x) => x.length > 0);
}

export interface Hit {
  text: string;
  /** False when some part is still English. */
  complete: boolean;
}

function lookup(cat: Catalog, s: string): string | undefined {
  const exact = cat[s];
  if (exact !== undefined) return exact;
  const { key, nums } = normalize(s);
  if (nums.length > 0) {
    const pattern = cat[key];
    if (pattern !== undefined) return denormalize(pattern, nums);
  }
  return undefined;
}

/** Translates one string. `complete` is false if any part had to stay English. Whitespace around the string is kept. */
export function translateDetailed(cat: Catalog, s: string): Hit {
  const lead = /^\s*/.exec(s)![0];
  const trail = /\s*$/.exec(s)![0];
  const core = s.trim();
  if (core === '') return { text: s, complete: true };
  const whole = lookup(cat, core);
  if (whole !== undefined) return { text: lead + whole + trail, complete: true };
  const parts = splitSentences(core);
  if (parts.length > 1) {
    let complete = true;
    const out = parts.map((p) => {
      const hit = translateDetailed(cat, p);
      if (!hit.complete) complete = false;
      return hit.text;
    });
    return { text: lead + out.join(' ') + trail, complete };
  }
  // Text with no letters (numbers, symbols, a lone unit), a function such as sin(30), a grade or a short abbreviation (CGPA, pi) needs no translation.
  if (!/\p{L}/u.test(core) || core.length <= 2 || /^[A-Z][A-Z0-9+−-]{1,5}$/.test(core) || /^[a-z]+\(.*\)$/.test(core) || /^[\p{L}\d ()+\-−×÷/^.,=]+$/u.test(core) && /[()=^]/.test(core)) return { text: s, complete: true };
  return { text: s, complete: false };
}

export function translate(cat: Catalog, s: string): string {
  return translateDetailed(cat, s).text;
}

/** A translate function for one language. `miss` is called with every English string that had no translation. */
export type Tr = (s: string) => string;
export function makeTr(cat: Catalog, miss?: (s: string) => void): Tr {
  return (s) => {
    const hit = translateDetailed(cat, s);
    if (!hit.complete && miss) miss(s);
    return hit.text;
  };
}

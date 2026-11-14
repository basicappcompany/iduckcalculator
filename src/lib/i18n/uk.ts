/**
 * English (UK): the site's English with British spelling (colour, optimise, centre...), made from the US text
 * when a page is built, so it can never fall behind: new English copy gets its British spelling for free and
 * there is no second set of strings to keep in step. The English source in the repository is written in US
 * spelling; `ukify` converts a string, `ukDeep` converts every string inside an object or array.
 *
 * It changes spelling only. Words that differ in meaning (for example "pants") are not touched, and the
 * words that are spelled the same on both sides of the Atlantic (resize, size, prize...) are left alone.
 */

// US -> UK. Each rule is a whole word (any case; the first letter's case is kept).
const WORDS: [RegExp, string][] = [
  [/\b(colou?r)(s|ed|ing|ful|less)?\b/gi, 'colour$2'],
  [/\bgr[ae]y(scale)?\b/gi, 'grey$1'],
  [/\bcenter(s|ed|ing)?\b/gi, 'centre$1'],
  [/\b(centi|milli|kilo|deci)meter(s)?\b/gi, '$1metre$2'],
  [/\bbehavior(s)?\b/gi, 'behaviour$1'],
  [/\bfavorite(s)?\b/gi, 'favourite$1'],
  [/\bflavor(s)?\b/gi, 'flavour$1'],
  [/\bhonor(s|ed)?\b/gi, 'honour$1'],
  [/\bneighbor(s)?\b/gi, 'neighbour$1'],
  [/\bdefense\b/gi, 'defence'],
  [/\boffense\b/gi, 'offence'],
  [/\bfulfill(s|ed|ing)?\b/gi, 'fulfil$1'],
  [/\bcancel(ed|ing)\b/gi, 'cancell$1'],
  [/\blabel(ed|ing)\b/gi, 'labell$1'],
  [/\btravel(ed|er|ers|ing)\b/gi, 'travell$1'],
  [/\bmodel(ed|ing)\b/gi, 'modell$1'],
  [/\bjudgment(s)?\b/gi, 'judgement$1'],
  [/\bcatalog(s)?\b/gi, 'catalogue$1'],
  [/\bartifact(s)?\b/gi, 'artefact$1'],
];

// -ize / -yze / -ization words, except the ones that are spelled that way in British English too
const KEEP_Z = /^(re)?siz|^priz|^seiz|^capsiz|^baptiz|^bronz|^citiz|^gaz|^maz|^doz|^froz|^glaz|^blaz|^craz|^lazi|^wiz|^quiz|^topaz|^adz|^coz|^razz/i;
const ISE = /\b([a-z]{3,}?)(iz|yz)(e|es|ed|ing|er|ers|ation|ations)\b/gi;

const keepCase = (from: string, to: string): string => (from[0] === from[0]!.toUpperCase() && from[0] !== from[0]!.toLowerCase() ? to[0]!.toUpperCase() + to.slice(1) : to);

/** One string in British spelling. Text inside {placeholders} and URLs is left as it is. */
export function ukify(s: string): string {
  if (!s) return s;
  // Keep {placeholders} and URLs out of the rules.
  const parts = s.split(/(\{\w+\}|https?:\/\/\S+)/);
  return parts
    .map((part, i) => {
      if (i % 2 === 1) return part;
      let out = part;
      for (const [re, to] of WORDS) {
        out = out.replace(re, (m, ...g) => keepCase(m, to.replace(/\$(\d)/g, (_, n: string) => (typeof g[Number(n) - 1] === 'string' ? (g[Number(n) - 1] as string) : ''))));
      }
      out = out.replace(ISE, (m, stem: string, z: string, end: string) => (KEEP_Z.test(stem + z) ? m : keepCase(m, stem + (z === 'iz' ? 'is' : 'ys') + end)));
      return out;
    })
    .join('');
}

/** Every string inside a value (object, array, string) in British spelling. Other values pass through. */
export function ukDeep<T>(value: T): T {
  if (typeof value === 'string') return ukify(value) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => ukDeep(v)) as unknown as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, ukDeep(v)])) as T;
  }
  return value;
}

/**
 * Finds the English strings in the source files. Node only (it reads files), used by the export script and the tests, never by a page.
 *
 *  - `scanData(file)`: the data files (calculator definitions, guides, answer and trust texts) hold plain strings, so every literal that
 *    looks like a sentence or a label is taken. A template literal `...${x}...` becomes a pattern "...{0}...". It collects a few strings
 *    that are never shown (that costs a translation, nothing more); the build audit (scripts/i18n-audit.mjs) is what proves nothing shown is missing.
 *  - `scanCalls(file)`: pages and components wrap what they show in `tt('...')` or `tr('...')`; only those literals are taken.
 */
import { readFileSync } from 'node:fs';

/** A string, template literal or template with ${...} holes. Handles escaped quotes and one level of ${} with quotes inside. */
const LITERAL = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.|\$\{(?:[^{}]|\{[^{}]*\})*\})*)`/g;

function unescape(s: string): string {
  return s.replace(/\\(n|t|'|"|`|\\|\$|u[0-9a-fA-F]{4})/g, (_, c: string) => {
    if (c === 'n') return '\n';
    if (c === 't') return '\t';
    if (c.startsWith('u')) return String.fromCharCode(parseInt(c.slice(1), 16));
    return c;
  });
}

/** `${...}` -> {0}, {1}... in order. Only for template literals. */
function holes(s: string): string {
  let i = 0;
  return s.replace(/\$\{(?:[^{}]|\{[^{}]*\})*\}/g, () => `{${i++}}`);
}

export function literalsOf(source: string, onlyCalls?: RegExp): string[] {
  const out: string[] = [];
  const text = source.replace(/\r\n/g, '\n');
  // Drop comments so prose in comments is not collected.
  const code = text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
  if (onlyCalls) {
    for (const m of code.matchAll(onlyCalls)) {
      const raw = m[1] ?? m[2] ?? m[3];
      if (raw !== undefined) out.push(unescape(m[3] !== undefined ? holes(m[3]) : raw));
    }
    return out;
  }
  for (const m of code.matchAll(LITERAL)) {
    const raw = m[1] ?? m[2] ?? m[3];
    if (raw === undefined) continue;
    out.push(unescape(m[3] !== undefined ? holes(m[3]) : raw));
  }
  return out;
}

/** Does this literal read as text a visitor sees? A sentence or label with a space, not an id, a path, a URL or a regular expression. */
export function looksLikeText(s: string): boolean {
  const t = s.trim();
  if (t.length < 4) return false;
  if (!/\p{L}/u.test(t)) return false;
  if (!/\s/.test(t)) return false;
  if (/^https?:\/\//.test(t) || /^[\w./#@:-]+$/.test(t)) return false;
  if (/^[a-z0-9 ,_-]+$/.test(t) && !/[A-Z.?!]/.test(t) && t.split(' ').length > 3) return false; // search keywords
  if (/[\\^$|]/.test(t) && /\(\?|\[\^|\\d|\\s/.test(t)) return false; // a regular expression
  return true;
}

/** Strings from a data file: all literals that look like text. Lines that are code, not copy, are skipped. */
export function scanData(file: string): string[] {
  const source = readFileSync(file, 'utf8');
  const kept = source
    .split(/\r?\n/)
    .filter((line) => !/^\s*(import|export \{|export type)\b/.test(line) && !/\bkeywords:|\bslug:|throw new Error|console\.|\bid: '|\bpublished:|\bupdated:|\basOf:|\bcalcs:|\brelated:/.test(line))
    .join('\n');
  // A single-word section heading ('Limits', 'Examples') has no space, so it is picked up from its `h:` key instead.
  const headings = [...kept.matchAll(/\bh:\s*(['"`])((?:\\.|(?!\1).)*)\1/g)].map((m) => m[2]!);
  return [...literalsOf(kept).filter(looksLikeText), ...headings];
}

/** The page titles and descriptions of a page or component: `title={tt('...')}` and `description={fill(tt('...'), ...)}`. They have length limits. */
export function scanMeta(file: string): { kind: 'title' | 'description'; text: string }[] {
  const out: { kind: 'title' | 'description'; text: string }[] = [];
  const source = readFileSync(file, 'utf8');
  for (const m of source.matchAll(/\b(title|description)=\{(?:fill\()?tt\(\s*(['"])((?:\\.|(?!\2).)*)\2/g)) out.push({ kind: m[1] as 'title' | 'description', text: unescape(m[3]!) });
  return out;
}

/** Strings wrapped in tt('...') / tr('...') in pages and components. */
export function scanCalls(file: string): string[] {
  return literalsOf(readFileSync(file, 'utf8'), /\b(?:tt|tr)\(\s*(?:'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.|\$\{(?:[^{}]|\{[^{}]*\})*\})*)`)/g);
}

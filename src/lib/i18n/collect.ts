/**
 * Every English string the localized pages can show, with where it came from. Node only. Used by the export script (which writes the work
 * files translators fill in), by the tests (every language must translate every key), and by the page builder to work out the few
 * strings a calculator island needs (`calcKeys`).
 *
 * Three sources:
 *  1. explicit: titles and descriptions (they have length limits), the composed answers and headings of each calculator, the fields;
 *  2. scans of the data files and of the tt('...') / tr('...') calls in pages and components (see scan.ts);
 *  3. a sweep: every calculator is run with the default numbers and with odd ones, and every label, note and error it returns is kept
 *     with its numbers turned into {0}, {1}... so one entry covers every number.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { CALCULATORS, calcBySlug, defaultValues } from '../calc';
import { ANSWER_META, answerFor, topicOf } from '../calc/answers';
import { referenceFor } from '../calc/reference';
import { GUIDES } from '../guides';
import type { CalcDef, Result } from '../calc/types';
import { normalize, splitSentences } from './catalog';
import { literalsOf, looksLikeText, scanCalls, scanData, scanMeta } from './scan';

export type Kind = 'title' | 'description' | 'text';
export interface Entry {
  key: string;
  kind: Kind;
  /** Slugs or file names where it appears, to give a translator context. */
  where: string[];
}
export interface Collected {
  entries: Map<string, Entry>;
  /** For each calculator, the keys its page needs in the browser (fields, results, the tool's own words). */
  calcKeys: Map<string, string[]>;
  /** The words of the tool itself: buttons, headings, table captions. */
  uiKeys: string[];
  /** The words of the share button on the support page. */
  shareKeys: string[];
}

const ROOT = process.cwd();
const walk = (dir: string, ext: RegExp): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p, ext) : ext.test(f) ? [p] : [];
  });

/** Words the calculator island produces without a tr('...') call around a literal. */
const EXTRA_UI = ['Calculator not found.', 'Those numbers cannot be used. Check each box.', 'Year-by-year table', 'Year'];

let cached: Collected | undefined;
/** The collection is worked out once per process: the build asks for it on every calculator page. */
export function collect(): Collected {
  return (cached ??= collectNow());
}

function collectNow(): Collected {
  const entries = new Map<string, Entry>();
  const add = (text: string, where: string, kind: Kind = 'text') => {
    const t = text.trim();
    if (t === '' || !/\p{L}/u.test(t)) return;
    const have = entries.get(t);
    if (have) {
      if (!have.where.includes(where) && have.where.length < 4) have.where.push(where);
      if (kind !== 'text') have.kind = kind;
      return;
    }
    entries.set(t, { key: t, kind, where: [where] });
  };

  // 1. explicit
  for (const def of CALCULATORS) {
    add(def.name, def.slug);
    add(def.summary, def.slug);
    add(def.title, def.slug, 'title');
    add(def.description, def.slug, 'description');
    for (const s of splitSentences(answerFor(def))) add(s, def.slug);
    const topic = topicOf(def);
    add(`How is ${topic} calculated?`, def.slug);
    add(`What is the formula for ${topic}?`, def.slug);
    add(`Can you show a worked example of ${topic}?`, def.slug);
    for (const f of def.fields) {
      add(f.label, def.slug);
      if (f.hint) add(f.hint, def.slug);
      if (f.kind === 'select') for (const o of f.options) add(o.label, def.slug);
    }
    if (def.rules) {
      add(def.rules.year, def.slug);
      for (const s of def.rules.sources) add(s.name, def.slug);
    }
  }
  for (const g of GUIDES) {
    add(g.title, g.slug, 'title');
    add(g.description, g.slug, 'description');
  }
  for (const [slug, m] of Object.entries(ANSWER_META)) add(m.what, slug);

  // 2. scans
  const dataFiles = [
    ...walk(join(ROOT, 'src/lib/calc/defs'), /\.ts$/),
    join(ROOT, 'src/lib/calc/answers.ts'),
    join(ROOT, 'src/lib/calc/reference.ts'),
    join(ROOT, 'src/lib/calc/sources.ts'),
    join(ROOT, 'src/lib/i18n/page-data.ts'),
    ...readdirSync(join(ROOT, 'src/lib')).filter((f) => /^guides(-[a-z]+)?\.ts$/.test(f)).map((f) => join(ROOT, 'src/lib', f)),
  ];
  for (const file of dataFiles) {
    const where = file.replace(/\\/g, '/').split('/').pop()!;
    for (const s of scanData(file)) add(s, where);
  }
  const uiKeys: string[] = [];
  const shareKeys: string[] = [];
  for (const file of walk(join(ROOT, 'src'), /\.(astro|tsx)$/).concat(walk(join(ROOT, 'src/pages'), /\.ts$/), [join(ROOT, 'src/lib/i18n/palette.ts')])) {
    const where = file.replace(/\\/g, '/').split('/').pop()!;
    for (const m of scanMeta(file)) add(m.text, where, m.kind);
    for (const s of scanCalls(file)) {
      add(s, where);
      if (/CalculatorTool|ChatHelper/.test(where)) uiKeys.push(s);
      if (/ShareButton/.test(where)) shareKeys.push(s);
    }
  }

  for (const s of EXTRA_UI) {
    add(s, 'CalculatorTool.tsx');
    uiKeys.push(s);
  }

  // 3. the sweep: what each calculator says back, for default and odd inputs
  const calcKeys = new Map<string, string[]>();
  for (const def of CALCULATORS) {
    const keys = new Set<string>();
    const keep = (s: string | undefined) => {
      if (!s) return;
      for (const piece of splitSentences(s)) {
        const { key } = normalize(piece);
        if (/\p{L}/u.test(key)) {
          keys.add(key);
          add(key, def.slug);
          keys.add(piece);
        }
      }
    };
    for (const values of sweepValues(def)) {
      let r: Result;
      try {
        r = def.compute(values);
      } catch {
        continue;
      }
      keep(r.error);
      keep(r.note);
      for (const m of r.metrics) {
        keep(m.label);
        if (typeof m.value === 'string') keep(m.value);
      }
      if (r.chart) {
        keep(r.chart.title);
        for (const s of r.chart.series) keep(s.name);
      }
      if (r.table) {
        keep(r.table.title);
        for (const c of r.table.columns) keep(c);
        for (const row of r.table.rows) for (const c of row) if (typeof c === 'string') keep(c);
      }
    }
    const ref = referenceFor(def.slug);
    if (ref) {
      add(ref.question, def.slug);
      add(ref.note, def.slug);
      keep(ref.question);
      keep(ref.note);
      for (const c of ref.columns) keep(c);
      for (const row of ref.rows) for (const c of row) keep(c);
    }
    for (const f of def.fields) {
      keys.add(f.label);
      if (f.hint) keys.add(f.hint);
      if (f.kind === 'select') for (const o of f.options) keys.add(o.label);
    }
    for (const s of calcSourceStrings(def.slug)) {
      keys.add(s);
      add(s, def.slug);
    }
    calcKeys.set(def.slug, [...keys]);
  }
  return { entries, calcKeys, uiKeys, shareKeys };
}

/** Default values plus variations: each field empty, zero, negative and at or just past its limits (never huge: some calculators build a table row per period), and each option of each choice. */
function sweepValues(def: CalcDef): Record<string, string | number>[] {
  const base = defaultValues(def);
  const out: Record<string, string | number>[] = [base];
  for (const f of def.fields) {
    const tries: (string | number)[] = [];
    if (f.kind === 'select') tries.push(...f.options.map((o) => o.value));
    else if (f.kind === 'text') tries.push('', 'a');
    else if (f.kind === 'date') tries.push('', '2000-01-01', '2999-12-31');
    else tries.push('', 0, -1, f.min ?? 1, f.max ?? 100, (f.min ?? 0) - 1, (f.max ?? 100) + 1, 0.5);
    for (const v of tries) out.push({ ...base, [f.id]: v });
  }
  return out;
}

/**
 * The strings in a calculator's own source that the result can show: error messages, notes, labels, column names. The definitions of one
 * file sit one after another, so this takes the text from "slug: 'x'" to the next slug and keeps only the lines that produce output.
 */
function calcSourceStrings(slug: string): string[] {
  const dir = join(ROOT, 'src/lib/calc/defs');
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.ts'))) {
    const src = readFileSync(join(dir, f), 'utf8').replace(/\r\n/g, '\n');
    const start = src.indexOf(`slug: '${slug}'`);
    if (start < 0) continue;
    const next = src.indexOf("slug: '", start + 10);
    const slice = src.slice(start, next < 0 ? undefined : next);
    const lines = slice.split('\n').filter((l) => /fail\(|\bnote\b|notes\.push|\blabel:|\btitle:|\bcolumns:|\.push\(|return '|\? '/.test(l) && !/^\s*(slug|summary|quick|keywords|title|description|how|example):/.test(l));
    return literalsOf(lines.join('\n')).filter(looksLikeText);
  }
  return [];
}

export { calcBySlug };

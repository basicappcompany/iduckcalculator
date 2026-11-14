// Splits the English strings a language still lacks into chunks a translator (a person or a sub-agent) can do in one go.
//   node scripts/i18n/chunk.mjs <lang> [maxChars] [prefix]
// With a prefix (such as r2-) the new chunks are added next to the existing ones, which are kept; without one, the chunks are rebuilt from scratch.
// Reads i18n-work/source.json (write it with: I18N_EXPORT=1 pnpm exec vitest run tests/unit/i18n-collect.test.ts) and
// src/i18n/catalog/<lang>.json (what is already translated), and writes i18n-work/<lang>/chunks/NNN.json:
//   [{ "i": 12, "en": "English text", "kind": "text|title|description", "ctx": "emi-calculator" }, ...]
// A translator writes i18n-work/<lang>/out/NNN.json: { "12": "translation", ... } and checks it with validate.mjs.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const lang = process.argv[2];
const max = Number(process.argv[3] ?? 24000);
const prefix = process.argv[4] ?? '';
if (!lang) throw new Error('usage: chunk.mjs <lang> [maxChars]');
const source = JSON.parse(readFileSync('i18n-work/source.json', 'utf8'));
const catFile = `src/i18n/catalog/${lang}.json`;
const done = existsSync(catFile) ? JSON.parse(readFileSync(catFile, 'utf8')) : {};
const pending = source.map((e, i) => ({ ...e, i })).filter((e) => done[e.k] === undefined);
// Strings from the same calculator or guide sit together, so a translator sees the whole topic.
const order = new Map();
pending.forEach((e) => { if (!order.has(e.where[0])) order.set(e.where[0], order.size); });
pending.sort((a, b) => order.get(a.where[0]) - order.get(b.where[0]) || a.i - b.i);

const dir = `i18n-work/${lang}`;
if (!prefix) rmSync(`${dir}/chunks`, { recursive: true, force: true });
mkdirSync(`${dir}/chunks`, { recursive: true });
mkdirSync(`${dir}/out`, { recursive: true });
let chunk = [], size = 0, n = 0;
const flush = () => {
  if (chunk.length === 0) return;
  n += 1;
  writeFileSync(`${dir}/chunks/${prefix}${String(n).padStart(3, '0')}.json`, JSON.stringify(chunk.map((e) => ({ i: e.i, en: e.k, kind: e.kind, ctx: e.where.join(', ') })), null, 1));
  chunk = []; size = 0;
};
for (const e of pending) {
  if (size + e.k.length > max && chunk.length > 0) flush();
  chunk.push(e); size += e.k.length;
}
flush();
console.log(`${lang}: ${pending.length} strings pending (${source.length - pending.length} already done) in ${n} chunks${prefix ? ` (${prefix}NNN)` : ''}`);

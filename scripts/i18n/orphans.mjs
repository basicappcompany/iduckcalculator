// Finds catalog entries no English string uses any more (orphans) and English strings with no entry (missing), and pairs a missing string
// with the orphan it most likely replaced (reworded text). With --apply the translations of confident pairs move to the new wording in
// every language, so a small English edit no longer means translating again.
//   I18N_EXPORT=1 pnpm exec vitest run tests/unit/i18n-collect.test.ts   (writes i18n-work/source.json)
//   node scripts/i18n/orphans.mjs            list orphans, missing strings and proposed pairs
//   node scripts/i18n/orphans.mjs --apply    move the translations of the proposed pairs, list who needs a re-check in src/i18n/recheck.json
// A pair is proposed only when the numbers match and at least 60% of the words are shared. Anything else is translated as usual.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';

const DIR = 'src/i18n/catalog';
const langs = readdirSync(DIR).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5));
const cats = Object.fromEntries(langs.map((l) => [l, JSON.parse(readFileSync(`${DIR}/${l}.json`, 'utf8'))]));
const ref = cats[langs[0]];
const source = JSON.parse(readFileSync('i18n-work/source.json', 'utf8')).map((e) => e.k);

const NUMBER = /\d[\d,]*(?:\.\d+)?/g;
const norm = (s) => { const nums = []; return { key: s.replace(NUMBER, (m) => `{${nums.push(m) - 1}}`), nums }; };
const sentences = (s) => s.split(/(?<=[.!?])\s+(?=\S)/).filter(Boolean);

const used = new Set();
const missing = [];
const keysFor = (s) => {
  const core = s.trim();
  if (core in ref) return [core];
  const { key, nums } = norm(core);
  if (nums.length && key in ref) return [key];
  const parts = sentences(core);
  if (parts.length > 1) { const all = parts.map(keysFor); return all.every((x) => x) ? all.flat() : null; }
  return null;
};
for (const s of source) {
  const k = keysFor(s);
  if (k) k.forEach((x) => used.add(x));
  else if (/\p{L}/u.test(s) && s.trim().length > 2) missing.push(s.trim());
}
const orphans = Object.keys(ref).filter((k) => !used.has(k));
console.log(`${Object.keys(ref).length} entries, ${orphans.length} orphans, ${missing.length} missing`);

const words = (s) => new Set(norm(s).key.toLowerCase().split(/[^\p{L}{}\d]+/u).filter(Boolean));
const sim = (a, b) => { const A = words(a), B = words(b); let i = 0; for (const w of A) if (B.has(w)) i++; return i / (A.size + B.size - i || 1); };
const pairs = [];
const taken = new Set();
for (const m of missing) {
  let best = null;
  for (const o of orphans) {
    if (taken.has(o)) continue;
    if (norm(m).nums.join('|') !== norm(o).nums.join('|')) continue;
    const v = sim(m, o);
    if (v >= 0.6 && (!best || v > best.v)) best = { o, v };
  }
  if (best) { taken.add(best.o); pairs.push([best.o, m, best.v]); }
}
for (const [o, m, v] of pairs) console.log(`pair ${v.toFixed(2)}\n  old: ${o}\n  new: ${m}`);
console.log(`${pairs.length} pairs; ${orphans.length - pairs.length} orphans left (safe to delete); ${missing.length - pairs.length} strings to translate`);

if (process.argv.includes('--apply')) {
  const recheck = existsSync('src/i18n/recheck.json') ? JSON.parse(readFileSync('src/i18n/recheck.json', 'utf8')) : {};
  for (const l of langs) {
    for (const [o, m] of pairs) { cats[l][m] = cats[l][o]; delete cats[l][o]; recheck[l] ??= []; if (!recheck[l].includes(m)) recheck[l].push(m); }
    const sorted = Object.fromEntries(Object.entries(cats[l]).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
    writeFileSync(`${DIR}/${l}.json`, JSON.stringify(sorted, null, 1) + '\n');
  }
  writeFileSync('src/i18n/recheck.json', JSON.stringify(recheck, null, 1) + '\n');
  console.log('applied. Run pnpm test: it checks numbers, placeholders and title/description lengths for the moved entries.');
}

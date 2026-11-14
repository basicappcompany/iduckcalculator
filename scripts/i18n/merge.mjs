// Merges the validated chunks of a language into its catalog, src/i18n/catalog/<lang>.json (English string -> translation).
//   node scripts/i18n/merge.mjs <lang>
// A chunk is merged only if it passes validate.mjs. Existing entries are kept unless the new chunk has a different, valid one.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';

const lang = process.argv[2];
if (!lang) throw new Error('usage: merge.mjs <lang>');
const dir = `i18n-work/${lang}`;
const catFile = `src/i18n/catalog/${lang}.json`;
mkdirSync('src/i18n/catalog', { recursive: true });
const cat = existsSync(catFile) ? JSON.parse(readFileSync(catFile, 'utf8')) : {};
let merged = 0, skipped = [];
for (const f of existsSync(`${dir}/out`) ? readdirSync(`${dir}/out`).sort() : []) {
  const id = f.replace('.json', '');
  try {
    execFileSync('node', ['scripts/i18n/validate.mjs', lang, id], { stdio: 'pipe' });
  } catch {
    skipped.push(id);
    continue;
  }
  const chunk = JSON.parse(readFileSync(`${dir}/chunks/${id}.json`, 'utf8'));
  const out = JSON.parse(readFileSync(`${dir}/out/${f}`, 'utf8'));
  for (const e of chunk) { cat[e.en] = out[String(e.i)]; merged += 1; }
}
// Sorted keys keep the diffs small.
const sorted = Object.fromEntries(Object.entries(cat).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
writeFileSync(catFile, JSON.stringify(sorted, null, 1) + '\n');
console.log(`${lang}: merged ${merged} strings, catalog now has ${Object.keys(sorted).length}${skipped.length ? `; NOT merged (fix and rerun): ${skipped.join(', ')}` : ''}`);

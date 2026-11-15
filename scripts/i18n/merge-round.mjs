// node merge-round.mjs <round> : merge only out/<round>.json for every language, after validating it. Run from the project root.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const round = process.argv[2];
for (const lang of ['hi', 'bn', 'pt-br', 'id', 'ru', 'de', 'es', 'fr', 'tr']) {
  try {
    execFileSync('node', ['scripts/i18n/validate.mjs', lang, round], { stdio: 'pipe' });
  } catch {
    console.log(`${lang}: validation FAILED, not merged`);
    continue;
  }
  const catFile = `src/i18n/catalog/${lang}.json`;
  const cat = JSON.parse(readFileSync(catFile, 'utf8'));
  const chunk = JSON.parse(readFileSync(`i18n-work/${lang}/chunks/${round}.json`, 'utf8'));
  const out = JSON.parse(readFileSync(`i18n-work/${lang}/out/${round}.json`, 'utf8'));
  for (const e of chunk) cat[e.en] = out[String(e.i)];
  const sorted = Object.fromEntries(Object.entries(cat).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
  writeFileSync(catFile, JSON.stringify(sorted, null, 1) + '\n');
  console.log(`${lang}: merged ${chunk.length}, catalog has ${Object.keys(sorted).length}`);
}

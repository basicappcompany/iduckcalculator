// Fails if a translated page showed English text that has no translation.
//   I18N_LOG=1 pnpm build && node scripts/i18n-audit.mjs
// The build writes every untranslated string a localized page rendered to i18n-work/misses.log (see src/lib/i18n/loader.ts).
import { existsSync, readFileSync } from 'node:fs';

const file = 'i18n-work/misses.log';
const rows = existsSync(file)
  ? readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => {
      const [lang, s] = l.split('\t');
      return [lang, JSON.parse(s)];
    })
  : [];
if (rows.length === 0) {
  console.log('i18n audit passed: no localized page showed an untranslated string.');
} else {
  const by = new Map();
  for (const [lang, s] of rows) by.set(lang, [...(by.get(lang) ?? []), s]);
  for (const [lang, list] of by) console.error(`${lang}: ${list.length} untranslated string(s), for example:\n${list.slice(0, 6).map((s) => `   ${s.slice(0, 110)}`).join('\n')}`);
  process.exit(1);
}

// Checks a translated chunk before it is merged.
//   node scripts/i18n/validate.mjs <lang> <NNN>        (reads i18n-work/<lang>/chunks/NNN.json and i18n-work/<lang>/out/NNN.json)
// Exit code 1 and a list of problems when anything is wrong. The rules are the ones that protect figures and layout:
//  - every string has a translation, and nothing extra;
//  - the {0}, {1}... placeholders are the same;
//  - every number of the English (digits, commas, decimals) is in the translation exactly as written, in Western digits;
//  - the rupee sign, % and HTML tags are kept; no markdown;
//  - titles under 60 characters and descriptions under 155, like the SEO audit demands;
//  - a long sentence is not left in English, and a non-Latin language really uses its own script.
import { readFileSync } from 'node:fs';

const [lang, id] = process.argv.slice(2);
if (!lang || !id) throw new Error('usage: validate.mjs <lang> <NNN>');
const chunk = JSON.parse(readFileSync(`i18n-work/${lang}/chunks/${id}.json`, 'utf8'));
let out;
try {
  out = JSON.parse(readFileSync(`i18n-work/${lang}/out/${id}.json`, 'utf8'));
} catch (e) {
  console.error(`out/${id}.json is missing or is not valid JSON: ${e.message}`);
  process.exit(1);
}
const SCRIPT = { hi: /[ऀ-ॿ]/, bn: /[ঀ-৿]/, ru: /[Ѐ-ӿ]/ };
const NUMBER = /\d[\d,]*(?:\.\d+)?/g;
const PLACEHOLDER = /\{[A-Za-z0-9_]+\}/g;
const problems = [];
const bad = (i, msg, en, tr) => problems.push(`#${i}: ${msg}\n    EN: ${en.slice(0, 160)}\n    ${lang.toUpperCase()}: ${String(tr ?? '').slice(0, 160)}`);
const numbersOf = (s) => (s.replace(PLACEHOLDER, ' ').match(NUMBER) ?? []).map((x) => x.replace(/[,.]+$/, ''));
const counts = (arr) => arr.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map());

const wanted = new Set(chunk.map((e) => String(e.i)));
for (const k of Object.keys(out)) if (!wanted.has(k)) problems.push(`#${k}: not a string of this chunk`);
for (const e of chunk) {
  const tr = out[String(e.i)];
  if (typeof tr !== 'string' || tr.trim() === '') { bad(e.i, 'missing or empty', e.en, tr); continue; }
  if (tr !== tr.trim()) bad(e.i, 'has leading or trailing spaces', e.en, tr);
  if (/\*\*|^#{1,3} |`/.test(tr) && !/\*\*|`/.test(e.en)) bad(e.i, 'markdown in the translation', e.en, tr);
  if (!e.en.includes('\n') && tr.includes('\n')) bad(e.i, 'has a line break the English does not', e.en, tr);
  const phE = counts(e.en.match(PLACEHOLDER) ?? []), phT = counts(tr.match(PLACEHOLDER) ?? []);
  if ([...phE].some(([k, v]) => phT.get(k) !== v) || [...phT].some(([k, v]) => phE.get(k) !== v)) bad(e.i, `placeholders differ: English ${[...phE.keys()].join(' ') || 'none'}, translation ${[...phT.keys()].join(' ') || 'none'}`, e.en, tr);
  const nE = counts(numbersOf(e.en)), nT = counts(numbersOf(tr));
  for (const [num, c] of nE) if ((nT.get(num) ?? 0) < c) bad(e.i, `the number ${num} is missing or changed (keep every number exactly as written, in Western digits)`, e.en, tr);
  if (/[₹]/.test(e.en) && (tr.match(/₹/g) ?? []).length < (e.en.match(/₹/g) ?? []).length) bad(e.i, 'the ₹ sign is missing', e.en, tr);
  if ((e.en.match(/%/g) ?? []).length !== (tr.match(/%/g) ?? []).length) bad(e.i, 'the number of % signs differs', e.en, tr);
  const tagsE = (e.en.match(/<\/?[a-z]+>/g) ?? []).join(''), tagsT = (tr.match(/<\/?[a-z]+>/g) ?? []).join('');
  if (tagsE !== tagsT) bad(e.i, 'HTML tags differ', e.en, tr);
  // The brand after a bar is dropped by the page when it does not fit, so only the title itself is measured.
  const bare = tr.replace(/ \| iDuckCalculator$/, '');
  if (e.kind === 'title' && bare.length >= 60) bad(e.i, `a title must be under 60 characters (it is ${bare.length}); shorten it`, e.en, tr);
  if (e.kind === 'description' && tr.length >= 155) bad(e.i, `a description must be under 155 characters (it is ${tr.length}); shorten it`, e.en, tr);
  if (tr.length > Math.max(60, e.en.length * 4)) bad(e.i, 'far longer than the English', e.en, tr);
  const words = e.en.replace(PLACEHOLDER, '').split(/\s+/).filter((w) => /\p{L}{2,}/u.test(w));
  // A formula (symbols such as = × ÷ ^) or a journal citation may stay exactly as it is.
  const keepAsIs = /[=×÷^√]/.test(e.en) && !/\b(Future value|Present value|Interest|Principal)\b/.test(e.en) || /\bet al\b|\bAm J\b/.test(e.en);
  if (tr === e.en && e.en.length > 28 && words.length >= 4 && !keepAsIs) bad(e.i, 'left in English', e.en, tr);
  if (SCRIPT[lang] && !keepAsIs && words.filter((w) => /[a-z]{3,}/.test(w)).length >= 2 && !SCRIPT[lang].test(tr)) bad(e.i, `no ${lang} script: it looks untranslated`, e.en, tr);
}
if (problems.length) {
  console.error(`${problems.length} problem(s) in ${lang}/out/${id}.json:\n${problems.slice(0, 40).join('\n')}${problems.length > 40 ? `\n... and ${problems.length - 40} more` : ''}`);
  process.exit(1);
}
console.log(`ok: ${chunk.length} strings in ${lang}/${id}`);

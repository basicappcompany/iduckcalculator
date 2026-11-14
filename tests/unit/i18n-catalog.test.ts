import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { denormalize, makeTr, normalize, splitSentences, translateDetailed } from '../../src/lib/i18n/catalog';
import { collect } from '../../src/lib/i18n/collect';
import { LANGUAGES } from '../../src/lib/i18n/languages';
import { islandStrings } from '../../src/lib/i18n/island';
import { catalogOf } from '../../src/lib/i18n/loader';
import { ukify } from '../../src/lib/i18n/uk';

/** The languages that have a catalog: every language except English (US) and English (UK), which is made from the US text. */
const TRANSLATED = LANGUAGES.filter((l) => l.code !== 'en' && l.code !== 'en-gb').map((l) => l.code);

describe('the translation engine', () => {
  it('turns every run of digits into a numbered hole and puts the numbers back', () => {
    expect(normalize('At 7.1% a year, ₹3,46,154 after 10 years')).toEqual({ key: 'At {0}% a year, ₹{1} after {2} years', nums: ['7.1', '3,46,154', '10'] });
    expect(denormalize('Nach {2} Jahren {1} bei {0}%', ['7.1', '3,46,154', '10'])).toBe('Nach 10 Jahren 3,46,154 bei 7.1%');
    expect(normalize('No numbers here').nums).toEqual([]);
  });
  it('splits sentences at a full stop followed by a space, not inside a decimal', () => {
    expect(splitSentences('It is 7.1% a year. Next, a note! Is it? Yes.')).toEqual(['It is 7.1% a year.', 'Next, a note!', 'Is it?', 'Yes.']);
    expect(splitSentences('One sentence')).toEqual(['One sentence']);
  });
  const cat = { 'Reset to the example': 'Auf das Beispiel zurücksetzen', 'At {0}% a year.': 'Bei {0}% pro Jahr.', 'Be careful.': 'Vorsicht.' };
  it('uses an exact entry, then a number pattern, then sentence by sentence, and says when something stayed English', () => {
    expect(translateDetailed(cat, 'Reset to the example')).toEqual({ text: 'Auf das Beispiel zurücksetzen', complete: true });
    expect(translateDetailed(cat, 'At 8.2% a year.')).toEqual({ text: 'Bei 8.2% pro Jahr.', complete: true });
    expect(translateDetailed(cat, 'At 8.2% a year. Be careful.')).toEqual({ text: 'Bei 8.2% pro Jahr. Vorsicht.', complete: true });
    expect(translateDetailed(cat, 'At 8.2% a year. Something new.')).toEqual({ text: 'Bei 8.2% pro Jahr. Something new.', complete: false });
    expect(translateDetailed(cat, 'Something new')).toEqual({ text: 'Something new', complete: false });
  });
  it('needs no translation for numbers, symbols, grades, function names and abbreviations', () => {
    for (const s of ['₹3,46,154', '7.1%', 'sin(30)', 'ln(e)', 'pi', 'B+', 'A−', 'CGPA', 'a/b × c/d = ac ÷ bd']) expect(translateDetailed({}, s).complete, s).toBe(true);
    expect(translateDetailed({}, 'Mean').complete).toBe(false);
  });
  it('keeps the spaces around a string and calls the miss handler with the English text', () => {
    const missed: string[] = [];
    const tr = makeTr(cat, (s) => missed.push(s));
    expect(tr('  Be careful.  ')).toBe('  Vorsicht.  ');
    expect(tr('Unknown words')).toBe('Unknown words');
    expect(missed).toEqual(['Unknown words']);
  });
  it('makes British spelling from the US text', () => {
    expect(ukify('Choose a color and center it. {color} stays.')).toBe('Choose a colour and centre it. {color} stays.');
    expect(ukify('Organize and optimize your analysis')).toBe('Organise and optimise your analysis');
  });
});

describe('the catalogs', () => {
  const c = collect();
  const keys = [...c.entries.keys()];

  it('finds the strings of the calculators, guides and pages', () => {
    expect(keys.length).toBeGreaterThan(3000);
    for (const must of ['Reset to the example', 'Steps', 'Try it yourself', 'Who runs it', 'Live now ({n})']) expect(c.entries.has(must), must).toBe(true);
  });

  for (const lang of TRANSLATED) {
    describe(lang, () => {
      const cat = catalogOf(lang);
      it('has a translation for every string the site shows', () => {
        const missing = keys.filter((k) => !translateDetailed(cat, k).complete);
        expect(missing.slice(0, 15), `${lang}: ${missing.length} of ${keys.length} strings are still English`).toEqual([]);
      });
      it('keeps every number, placeholder and sign of the English text', () => {
        const NUMBER = /\d[\d,]*(?:\.\d+)?/g;
        const HOLE = /\{[A-Za-z0-9_]+\}/g;
        const count = (arr: string[]) => arr.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map<string, number>());
        const bad: string[] = [];
        for (const [en, tr] of Object.entries(cat)) {
          const holesEn = (en.match(HOLE) ?? []).sort().join();
          const holesTr = (tr.match(HOLE) ?? []).sort().join();
          if (holesEn !== holesTr) bad.push(`placeholders: ${en.slice(0, 60)}`);
          const have = count((tr.replace(HOLE, ' ').match(NUMBER) ?? []).map((x) => x.replace(/[,.]+$/, '')));
          for (const [n, k] of count((en.replace(HOLE, ' ').match(NUMBER) ?? []).map((x) => x.replace(/[,.]+$/, '')))) if ((have.get(n) ?? 0) < k) bad.push(`number ${n}: ${en.slice(0, 60)}`);
          if ((en.match(/₹/g) ?? []).length > (tr.match(/₹/g) ?? []).length) bad.push(`₹: ${en.slice(0, 60)}`);
        }
        expect(bad.slice(0, 10), `${lang}: ${bad.length} problems`).toEqual([]);
      });
      it('keeps titles under 60 characters and descriptions under 155', () => {
        const long = [...c.entries.values()].filter((e) => cat[e.key] !== undefined && ((e.kind === 'title' && cat[e.key]!.replace(/ \| iDuckCalculator$/, '').length >= 60) || (e.kind === 'description' && cat[e.key]!.length >= 155)));
        expect(long.map((e) => e.key.slice(0, 50))).toEqual([]);
      });
      it('hands a calculator page the strings it needs in the browser', () => {
        const strings = islandStrings(lang, 'emi-calculator')!;
        expect(strings['Reset to the example']).toBe(cat['Reset to the example']);
        expect(Object.keys(strings).length).toBeGreaterThan(10);
        expect(Object.keys(strings).length).toBeLessThan(400);
      });
    });
  }

  it('gives English no strings and English (UK) the UK spelling', () => {
    expect(islandStrings('en', 'emi-calculator')).toBeUndefined();
    expect(Object.keys(islandStrings('en-gb', 'emi-calculator')!).length).toBeGreaterThan(10);
  });
  it('has no catalog file for English', () => {
    expect(existsSync('src/i18n/catalog/en.json')).toBe(false);
    expect(existsSync('src/i18n/catalog/en-gb.json')).toBe(false);
    expect(JSON.parse(readFileSync('src/i18n/catalog/hi.json', 'utf8'))).toBeTypeOf('object');
  });
});

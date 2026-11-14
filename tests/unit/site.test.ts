import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CALCULATORS, calcBySlug, popularCalcs } from '../../src/lib/calc';
import { COMMUNITY, NOINDEX_PATHS, OTHER_PAGES } from '../../src/lib/community';
import { GUIDES, guideBySlug, wordCount } from '../../src/lib/guides';
import { emi, loanPlan, compound, sipFutureValue } from '../../src/lib/finance';
import { formatNumber } from '../../src/lib/format';
import { respond } from '../../src/lib/helper';
import { contrast, dark, light } from '../../src/lib/theme';
import { faqLd, serialize } from '../../src/lib/seo';
import { flagSvg } from '../../src/lib/flags';
import { DEFAULT_LANG, LANGUAGES, LOCALES, EN as en, fill, langsFor, localePath, pageHref, splitLocale, switchHref } from '../../src/lib/i18n';

const words = (s: string) => s.trim().split(/\s+/).length;
const inr = (n: number) => formatNumber(Math.round(n), 0, 'en-IN');

describe('guides', () => {
  it('meet the length and link rules', () => {
    expect(GUIDES.length).toBeGreaterThanOrEqual(3);
    for (const g of GUIDES) {
      expect(g.title.length, g.slug).toBeLessThanOrEqual(59);
      expect(g.description.length, g.slug).toBeGreaterThanOrEqual(70);
      expect(g.description.length, g.slug).toBeLessThanOrEqual(154);
      expect(words(g.intro), `${g.slug} intro`).toBeGreaterThanOrEqual(25);
      expect(words(g.intro), `${g.slug} intro`).toBeLessThanOrEqual(60);
      expect(wordCount(g), `${g.slug} words`).toBeGreaterThanOrEqual(300);
      expect(g.faqs.length).toBeGreaterThanOrEqual(4);
      for (const c of g.calcs) expect(calcBySlug(c), `${g.slug} -> ${c}`).toBeDefined();
      for (const r of g.related) expect(guideBySlug(r), `${g.slug} -> ${r}`).toBeDefined();
    }
  });
  it('quote numbers that the maths really gives', () => {
    const text = JSON.stringify(guideBySlug('how-emi-is-calculated'));
    for (const y of [10, 15, 20, 25]) {
      const p = loanPlan(1_000_000, 9, y * 12);
      expect(text, `${y}y emi`).toContain(inr(p.emi));
      expect(text, `${y}y interest`).toContain(inr(p.totalInterest));
    }
    expect(text).toContain('₹7,500');
    expect(text).toContain(inr(emi(1_000_000, 9, 240) - 7500));
    const sip = JSON.stringify(guideBySlug('sip-vs-lumpsum'));
    expect(sip).toContain(inr(compound(600_000, 12, 10)));
    expect(sip).toContain(inr(sipFutureValue(5000, 12, 120)));
  });
});

describe('site structure', () => {
  const files = readdirSync('src/pages')
    .filter((f) => f.endsWith('.astro') || f.endsWith('.ts'))
    .map((f) => f.replace(/\.(astro|ts)$/, ''));
  it('every page file is a community page or a known other page', () => {
    const known = new Set([...COMMUNITY.map((c) => c.slug), ...OTHER_PAGES]);
    for (const f of files) expect(known.has(f), `unlisted page src/pages/${f}`).toBe(true);
  });
  it('every community page has a file, and noindex pages are listed', () => {
    for (const c of COMMUNITY) expect(files, c.slug).toContain(c.slug);
    expect(NOINDEX_PATHS).toContain('/settings/');
    expect(NOINDEX_PATHS).toContain('/chat/');
    expect(NOINDEX_PATHS).not.toContain('/about/');
  });
  it('popular calculators are live and the planned ones are named', () => {
    const slugs = popularCalcs().map((c) => c.slug);
    for (const s of ['emi-calculator', 'sip-calculator', 'percentage-calculator', 'age-calculator', 'bmi-calculator', 'cgpa-to-percentage-calculator']) expect(slugs).toContain(s);
  });
  it('calculator slugs never collide with a static page', () => {
    for (const c of CALCULATORS) expect(files, c.slug).not.toContain(c.slug);
  });
});

describe('helper', () => {
  const tool = (m: string) => respond(m).tools[0]?.href;
  it('points plain words at the right calculator', () => {
    expect(tool('monthly loan payment')).toBe('/emi-calculator/');
    expect(tool('how old am I')).toBe('/age-calculator/');
    expect(tool('what is my bmi')).toBe('/bmi-calculator/');
    expect(respond('is my data safe').links[0]?.href).toBe('/privacy/');
    expect(respond('zzzz qqqq').links[0]?.href).toBe('/calculators/');
    expect(respond('').links).toHaveLength(0);
    expect(respond('').tools).toHaveLength(0);
  });
  it('answers simple sums and percentages itself, and offers the matching calculator', () => {
    expect(respond('15% of 2,400').text).toBe('15% of 2,400 is 360.');
    expect(respond('what is 15 percent of 200').text).toBe('15% of 200 is 30.');
    expect(respond('(2 + 3) * 4').text).toBe('(2 + 3) * 4 = 20');
    expect(respond('what is 1,250 * 12').text).toBe('1250 * 12 = 15,000');
    expect(respond('sqrt(16) + 2^3').text).toBe('sqrt(16) + 2^3 = 12');
    expect(respond('2+2').tools[0]?.href).toBe('/scientific-calculator/');
    expect(respond('5 / 0').text).toMatch(/zero/);
  });
  it('does not mistake a date or a plain question for a sum', () => {
    expect(respond('20-06-2000').text).not.toMatch(/=/);
    expect(respond('how many days until 25-12-2026').tools.length).toBeGreaterThan(0);
  });
  it('chats: greets, thanks and says what it can do', () => {
    expect(respond('hello').text).toMatch(/Hello/);
    expect(respond('thanks!').text).toMatch(/welcome/i);
    expect(respond('what can you do').text).toMatch(/calculators/);
    expect(respond('what can you do').links[0]?.href).toBe('/calculators/');
  });
});

describe('languages', () => {
  const codes = LANGUAGES.map((l) => l.code);
  /** Every {placeholder} in a string, sorted, so two translations of one sentence can be compared. */
  const holes = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
  /** Every leaf string of a locale with its path, such as "home.faqs.0.a". */
  const leaves = (o: unknown, path = ''): [string, string][] =>
    typeof o === 'string' ? [[path, o]] : Array.isArray(o) ? o.flatMap((v, i) => leaves(v, `${path}.${i}`)) : Object.entries(o as object).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k));
  const english = leaves(en);

  it('lists unique codes and hreflang values, English (US) first, with a flag each', () => {
    expect(codes[0]).toBe('en');
    expect(new Set(codes).size).toBe(codes.length);
    expect(new Set(LANGUAGES.map((l) => l.hreflang)).size).toBe(codes.length);
    expect(DEFAULT_LANG).toBe('en');
    for (const l of LANGUAGES) expect(flagSvg(l.flag), l.code).toContain('<svg');
  });
  it('every language has every text of the English file, with the same {placeholders}', () => {
    for (const l of LANGUAGES) {
      const text = leaves(LOCALES[l.code]);
      expect(text.map(([k]) => k), l.code).toEqual(english.map(([k]) => k));
      text.forEach(([k, v], i) => {
        expect(v.trim().length, `${l.code} ${k}`).toBeGreaterThan(0);
        expect(holes(v), `${l.code} ${k}`).toBe(holes(english[i]![1]));
      });
    }
  });
  it('a translated language is not a copy of the English text', () => {
    for (const l of LANGUAGES.filter((x) => x.code !== 'en' && x.code !== 'en-gb')) {
      const same = leaves(LOCALES[l.code]).filter(([k, v]) => v === english.find(([ek]) => ek === k)![1] && v.length > 12);
      expect(same.map(([k]) => k), l.code).toEqual([]);
    }
  });
  it('titles and descriptions fit the search-result limits the SEO audit enforces', () => {
    for (const l of LANGUAGES) {
      const h = LOCALES[l.code]!.home;
      expect(h.title.length, `${l.code} title`).toBeLessThan(60);
      expect(h.description.length, `${l.code} description`).toBeLessThan(155);
    }
  });
  it('only languages nobody has read yet carry the machine-translation notice, and every one of them has it', () => {
    for (const l of LANGUAGES) expect(l.reviewed, l.code).toBe(l.code === 'en' || l.code === 'en-gb');
  });
  it('builds localized paths and splits them again', () => {
    expect(localePath('en', '/')).toBe('/');
    expect(localePath('en', '/about/')).toBe('/about/');
    expect(localePath('de', '/')).toBe('/de/');
    expect(localePath('pt-br', '/about/')).toBe('/pt-br/about/');
    expect(splitLocale('/')).toEqual({ lang: 'en', key: '/' });
    expect(splitLocale('/de/')).toEqual({ lang: 'de', key: '/' });
    expect(splitLocale('/pt-br/about/')).toEqual({ lang: 'pt-br', key: '/about/' });
    expect(splitLocale('/about/')).toEqual({ lang: 'en', key: '/about/' });
    expect(splitLocale('/emi-calculator/')).toEqual({ lang: 'en', key: '/emi-calculator/' });
    expect(splitLocale('/de')).toEqual({ lang: 'de', key: '/' });
    for (const l of LANGUAGES) for (const key of ['/', '/about/', '/guides/x/']) expect(splitLocale(localePath(l.code, key))).toEqual({ lang: l.code, key });
  });
  it('a page falls back to English where it is not translated, and the language menu falls back to that language\'s home', () => {
    expect(langsFor('/')).toEqual(codes);
    expect(langsFor('/some-page-nobody-translated/')).toEqual(['en']);
    expect(pageHref('de', '/')).toBe('/de/');
    expect(pageHref('de', '/some-page-nobody-translated/')).toBe('/some-page-nobody-translated/');
    expect(switchHref('de', '/')).toBe('/de/');
    expect(switchHref('de', '/some-page-nobody-translated/')).toBe('/de/');
    expect(switchHref('en', '/some-page-nobody-translated/')).toBe('/some-page-nobody-translated/');
    // Every calculator, guide and indexable community page exists everywhere; the legal pages and the forms are English only.
    expect(langsFor('/emi-calculator/')).toEqual(codes);
    expect(langsFor('/guides/how-emi-is-calculated/')).toEqual(codes);
    expect(langsFor('/about/')).toEqual(codes);
    expect(langsFor('/privacy/')).toEqual(['en']);
    expect(langsFor('/terms/')).toEqual(['en']);
    expect(langsFor('/feedback/')).toEqual(['en']);
    expect(pageHref('de', '/privacy/')).toBe('/privacy/');
    expect(switchHref('de', '/emi-calculator/')).toBe('/de/emi-calculator/');
  });
  it('fills placeholders and leaves unknown ones visible', () => {
    expect(fill('All {total} calculators', { total: 49 })).toBe('All 49 calculators');
    expect(fill('{a} and {b}', { a: 1 })).toBe('1 and {b}');
  });
});

describe('language and theme', () => {
  it('every text and background pair is readable (WCAG AA 4.5:1) in both themes', () => {
    for (const [name, t] of [['light', light], ['dark', dark]] as const) {
      expect(contrast(t.ink, t.bg), `${name} ink/bg`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.ink, t.card), `${name} ink/card`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.muted, t.bg), `${name} muted/bg`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.muted, t.card), `${name} muted/card`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.duckInk, t.duck), `${name} duck`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.dangerText, t.bg), `${name} danger`).toBeGreaterThanOrEqual(4.5);
    }
  });
  it('dark mode background is #121212', () => {
    expect(dark.bg).toBe('#121212');
  });
});

describe('structured data', () => {
  it('FAQ JSON never lets a "<" close the script tag', () => {
    expect(serialize(faqLd([{ q: 'a<b?', a: '</script>' }]))).not.toContain('<');
  });
});

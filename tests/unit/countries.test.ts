import { describe, expect, it } from 'vitest';
import { CALCULATORS, calcBySlug } from '../../src/lib/calc';
import { COUNTRY_CURRENCY } from '../../src/lib/calc/countries';
import { COUNTRY_CODES } from '../../src/lib/calc/types';
import { CURRENCIES, currencyByCode, formatMoney } from '../../src/lib/format';
import { LANGUAGES } from '../../src/lib/i18n/languages';

describe('country rules for calculators', () => {
  const tagged = CALCULATORS.filter((c) => c.country);

  it('every country has a currency that exists', () => {
    for (const code of COUNTRY_CODES) {
      expect(COUNTRY_CURRENCY[code], code).toBeTruthy();
      expect(CURRENCIES.some((c) => c.code === COUNTRY_CURRENCY[code]), `${code} -> ${COUNTRY_CURRENCY[code]}`).toBe(true);
    }
  });

  it('currency codes are unique and each has a symbol and locale', () => {
    expect(new Set(CURRENCIES.map((c) => c.code)).size).toBe(CURRENCIES.length);
    for (const c of CURRENCIES) expect(c.symbol && c.locale).toBeTruthy();
  });

  it('formats the new currencies with their own symbol and grouping', () => {
    expect(formatMoney(1234567, 'CAD')).toBe('CA$1,234,567');
    expect(formatMoney(1234567.5, 'AUD', 2)).toBe('A$1,234,567.50');
    expect(formatMoney(1234567, 'EUR')).toBe('€1.234.567');
    expect(currencyByCode('GBP').symbol).toBe('£');
  });

  it('every tax calculator names its country', () => {
    for (const c of CALCULATORS.filter((x) => x.group === 'tax')) expect(c.country, c.slug).toBeTruthy();
  });

  it("a country's calculator starts its slug with the country code, except India's, which came first", () => {
    for (const c of tagged.filter((x) => x.country !== 'in')) expect(c.slug.startsWith(`${c.country}-`), c.slug).toBe(true);
  });

  it("a calculator for another country pins that country's currency, and a neutral one pins nothing", () => {
    for (const c of CALCULATORS) {
      if (c.country && c.country !== 'in') expect(c.currency, c.slug).toBe(COUNTRY_CURRENCY[c.country]);
      if (!c.country) expect(c.currency, c.slug).toBeUndefined();
    }
  });

  it('a pinned currency is one the site can format', () => {
    for (const c of CALCULATORS.filter((x) => x.currency)) expect(CURRENCIES.some((k) => k.code === c.currency), c.slug).toBe(true);
  });

  it("related links of a country's calculator stay in that country or are country-neutral", () => {
    for (const c of tagged.filter((x) => x.country !== 'in')) {
      for (const r of c.related) {
        const other = calcBySlug(r)!;
        expect(!other.country || other.country === c.country, `${c.slug} -> ${r}`).toBe(true);
      }
    }
  });

  it('the word "tax" is kept for the country pages, so no calculator slug or language code may use it', () => {
    expect(CALCULATORS.some((c) => c.slug === 'tax')).toBe(false);
    expect(LANGUAGES.some((l) => (l.code as string) === 'tax')).toBe(false);
  });

  it('the India tax pages keep their original addresses', () => {
    for (const slug of ['income-tax-calculator', 'gst-calculator', 'gratuity-calculator', 'hra-calculator', 'ppf-calculator', 'sukanya-samriddhi-calculator']) {
      expect(calcBySlug(slug)?.country, slug).toBe('in');
    }
  });
});

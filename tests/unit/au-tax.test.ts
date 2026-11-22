import { describe, expect, it } from 'vitest';
import { calcBySlug, defaultValues } from '../../src/lib/calc';
import { AU_BANDS, auTax, lowIncomeTaxOffset, medicareLevy } from '../../src/lib/calc/defs/au-tax';
import { slabTax } from '../../src/lib/calc/defs/tax';
import type { Values } from '../../src/lib/calc/types';

/**
 * Known answers for the Australia calculators, worked by hand from the ATO figures read on 2026-11-22 (Tax rates – Australian resident,
 * Low income tax offset, Medicare levy reduction for low-income earners). The Medicare levy thresholds are the 2025–26 ones.
 */
const run = (slug: string, over: Values) => {
  const def = calcBySlug(slug)!;
  const r = def.compute({ ...defaultValues(def), ...over });
  expect(r.error).toBeUndefined();
  return r;
};
const metric = (slug: string, over: Values, label: string): number => Number(run(slug, over).metrics.find((m) => m.label.startsWith(label))!.value);

describe('Australia income tax', () => {
  it('the 2026–27 resident brackets are the ATO figures', () => {
    expect(AU_BANDS.map((b) => b[0])).toEqual([18_200, 45_000, 135_000, 190_000, Infinity]);
    expect(AU_BANDS.map((b) => b[1])).toEqual([0, 0.15, 0.3, 0.37, 0.45]);
  });

  it('the tax at each bracket limit is the amount the ATO prints', () => {
    expect(slabTax(45_000, AU_BANDS)).toBe(4_020);
    expect(slabTax(135_000, AU_BANDS)).toBe(31_020);
    expect(slabTax(190_000, AU_BANDS)).toBe(51_370);
    expect(slabTax(18_200, AU_BANDS)).toBe(0);
    // "$51,370 plus 45c for each $1 over $190,000"
    expect(slabTax(200_000, AU_BANDS)).toBeCloseTo(51_370 + 4_500, 6);
  });

  it('the low income tax offset follows the ATO steps', () => {
    expect(lowIncomeTaxOffset(0)).toBe(700);
    expect(lowIncomeTaxOffset(37_500)).toBe(700);
    expect(lowIncomeTaxOffset(40_000)).toBeCloseTo(575, 6); // $700 minus 5c for each $1 over $37,500
    expect(lowIncomeTaxOffset(45_000)).toBeCloseTo(325, 6);
    expect(lowIncomeTaxOffset(60_000)).toBeCloseTo(100, 6); // $325 minus 1.5c for each $1 over $45,000
    expect(lowIncomeTaxOffset(66_667)).toBe(0); // $325 − $325.005, never below nil
    expect(lowIncomeTaxOffset(120_000)).toBe(0);
  });

  it('the Medicare levy matches the ATO example and meets 2% at the upper threshold', () => {
    expect(medicareLevy(28_011)).toBe(0);
    expect(medicareLevy(20_000)).toBe(0);
    expect(medicareLevy(29_000)).toBeCloseTo(98.9, 6); // ATO example: taxable income $29,000, levy reduced to $98.90
    expect(medicareLevy(35_013)).toBeCloseTo(0.02 * 35_013, 0); // within 50c of the full 2% (35,013.75 is the exact meeting point)
    expect(medicareLevy(60_000)).toBe(1_200);
  });

  it('$60,000 pays $8,420 of income tax and $1,200 of Medicare levy (the worked example)', () => {
    const r = auTax(60_000);
    expect(r.gross).toBe(8_520);
    expect(r.offset).toBeCloseTo(100, 6);
    expect(r.tax).toBeCloseTo(8_420, 6);
    expect(r.medicare).toBe(1_200);
    expect(r.total).toBeCloseTo(9_620, 6);
    expect(r.marginal).toBe(0.3);
    expect(r.bands.map((b) => [b.rate, b.income])).toEqual([[0, 18_200], [0.15, 26_800], [0.3, 15_000]]);
  });

  it('the offset never takes the tax below zero', () => {
    const r = auTax(18_300);
    expect(r.gross).toBeCloseTo(15, 6);
    expect(r.offset).toBeCloseTo(15, 6);
    expect(r.tax).toBeCloseTo(0, 6);
    expect(auTax(0).total).toBe(0);
    expect(auTax(300_000).marginal).toBe(0.45);
  });

  it('the calculator page reports the same figures', () => {
    expect(metric('au-income-tax-calculator', {}, 'Income tax payable')).toBeCloseTo(8_420, 6);
    expect(metric('au-income-tax-calculator', {}, 'Tax before the low income tax offset')).toBe(8_520);
    expect(metric('au-income-tax-calculator', {}, 'Low income tax offset')).toBeCloseTo(100, 6);
    expect(metric('au-income-tax-calculator', {}, 'Medicare levy')).toBe(1_200);
    expect(metric('au-income-tax-calculator', {}, 'Total income tax and Medicare levy')).toBeCloseTo(9_620, 6);
    expect(metric('au-income-tax-calculator', {}, 'Effective tax rate')).toBeCloseTo(16.0333, 3);
    expect(metric('au-income-tax-calculator', {}, 'Bracket rate on your next dollar')).toBe(30);
    expect(run('au-income-tax-calculator', {}).table?.rows).toHaveLength(3);
    expect(run('au-income-tax-calculator', { income: 0 }).table).toBeUndefined();
    const def = calcBySlug('au-income-tax-calculator')!;
    expect(def.compute({ ...defaultValues(def), income: -1 }).error).toBeTruthy();
  });
});

describe('Australia take-home pay', () => {
  it('$60,000 takes home $50,380 a year (the worked example)', () => {
    expect(metric('au-take-home-pay-calculator', {}, 'Take-home pay per year')).toBeCloseTo(50_380, 6);
    expect(metric('au-take-home-pay-calculator', {}, 'Take-home pay per month')).toBeCloseTo(4_198.333, 2);
    expect(metric('au-take-home-pay-calculator', {}, 'Income tax payable')).toBeCloseTo(8_420, 6);
    expect(metric('au-take-home-pay-calculator', {}, 'Medicare levy')).toBe(1_200);
    expect(metric('au-take-home-pay-calculator', {}, 'Share of your pay')).toBeCloseTo(83.9667, 3);
  });

  it('the table adds up: gross minus the charges is the take-home pay', () => {
    for (const salary of [25_000, 30_000, 60_000, 100_000]) {
      const yearly = run('au-take-home-pay-calculator', { salary }).table!.rows.map((r) => Number(r[1]));
      expect(yearly[0]! + yearly[1]! + yearly[2]!).toBeCloseTo(yearly[3]!, 6);
    }
  });

  it('a salary under the tax-free amount keeps everything', () => {
    expect(metric('au-take-home-pay-calculator', { salary: 18_200 }, 'Take-home pay per year')).toBe(18_200);
    expect(metric('au-take-home-pay-calculator', { salary: 0 }, 'Share of your pay')).toBe(0);
  });
});

describe('Australia pages use dollars whatever the visitor chose in Settings', () => {
  it('both calculators pin AUD and are marked as Australia', () => {
    for (const slug of ['au-income-tax-calculator', 'au-take-home-pay-calculator']) {
      const def = calcBySlug(slug)!;
      expect(def.country).toBe('au');
      expect(def.currency).toBe('AUD');
      expect(def.rules?.sources.length).toBe(3);
      expect(def.rules?.asOf).toBe('2026-11-22');
    }
  });
});

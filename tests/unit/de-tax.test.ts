import { describe, expect, it } from 'vitest';
import { calcBySlug, defaultValues } from '../../src/lib/calc';
import { GRUNDFREIBETRAG, ZONE2_END, ZONE3_END, ZONE4_END, deIncomeTax, deMarginalRate, deSolidaritySurcharge, deTariffTax, deTax } from '../../src/lib/calc/defs/de-tax';
import type { Values } from '../../src/lib/calc/types';

/**
 * Known answers for the Germany income tax calculator, worked by hand from the 2026 tariff in section 32a EStG and the Solidarity
 * Surcharge in sections 3 and 4 SolzG, read on 2026-11-23 from gesetze-im-internet.de.
 */
const run = (over: Values) => {
  const def = calcBySlug('de-income-tax-calculator')!;
  const r = def.compute({ ...defaultValues(def), ...over });
  expect(r.error).toBeUndefined();
  return r;
};
const metric = (over: Values, label: string): number => Number(run(over).metrics.find((m) => m.label.startsWith(label))!.value);

describe('Germany income tax, 2026 tariff (section 32a EStG)', () => {
  it('the zone limits are the figures the law prints', () => {
    expect([GRUNDFREIBETRAG, ZONE2_END, ZONE3_END, ZONE4_END]).toEqual([12_348, 17_799, 69_878, 277_825]);
  });

  it('no tax up to the basic allowance, then the first zone starts at 14%', () => {
    expect(deTariffTax(0)).toBe(0);
    expect(deTariffTax(12_348)).toBe(0);
    expect(deTariffTax(12_349)).toBe(0); // (914.51 × 0.0001 + 1,400) × 0.0001 = 0.14, rounded down
    expect(deMarginalRate(12_349)).toBeCloseTo(0.14, 3);
    // y = 0.5: (914.51 × 0.5 + 1,400) × 0.5 = 928.6275 -> 928
    expect(deTariffTax(12_348 + 5_000)).toBe(928);
  });

  it('the zones join up: the tax is the same at each limit from either formula, within the rounding', () => {
    // Zone 2 at 17,799: y = 0.5451 -> (914.51 × 0.5451 + 1,400) × 0.5451 = 1,034.87...
    expect(deTariffTax(17_799)).toBe(1_034);
    expect(deTariffTax(17_800)).toBe(1_035);
    // Zone 3 at 69,878 and zone 4 at 69,879 agree to the euro
    expect(deTariffTax(69_878)).toBe(18_213);
    expect(deTariffTax(69_879)).toBe(18_213);
    // Zone 4 at 277,825 and zone 5 at 277,826 differ by the 45% rate, about 1 euro
    expect(deTariffTax(277_825)).toBe(105_550);
    expect(deTariffTax(277_826)).toBe(105_551);
  });

  it('works out the hand-worked examples', () => {
    // 50,000: z = 3.2201, (173.10 × 3.2201 + 2,397) × 3.2201 + 1,034.87 = 10,548.33 -> 10,548
    expect(deTariffTax(50_000)).toBe(10_548);
    expect(deTariffTax(30_000)).toBe(4_217);
    // 100,000 is in the fourth zone: 0.42 × 100,000 − 11,135.63 = 30,864.37 -> 30,864
    expect(deTariffTax(100_000)).toBe(30_864);
    // 300,000 is in the fifth zone: 0.45 × 300,000 − 19,470.38 = 115,529.62 -> 115,529
    expect(deTariffTax(300_000)).toBe(115_529);
  });

  it('cuts cents off the income before taxing it', () => {
    expect(deTariffTax(100_000.99)).toBe(30_864);
    expect(deTax(100_000.99, 'single').taxable).toBe(100_000);
  });

  it('the rate on the next euro follows the slope of each zone', () => {
    expect(deMarginalRate(10_000)).toBe(0);
    expect(deMarginalRate(17_799)).toBeCloseTo(0.2397, 4);
    expect(deMarginalRate(50_000)).toBeCloseTo(0.35118, 4);
    expect(deMarginalRate(69_878)).toBeCloseTo(0.42, 3);
    expect(deMarginalRate(100_000)).toBe(0.42);
    expect(deMarginalRate(277_826)).toBe(0.45);
  });

  it('couples assessed together pay twice the tax on half the income (splitting)', () => {
    expect(deIncomeTax(100_000, 'joint')).toBe(2 * deTariffTax(50_000));
    expect(deIncomeTax(100_000, 'joint')).toBe(21_096);
    expect(deIncomeTax(100_000, 'single')).toBe(30_864);
    // an odd combined income halves to a half euro, which is cut off again
    expect(deIncomeTax(60_001, 'joint')).toBe(2 * deTariffTax(30_000.5));
  });
});

describe('Germany Solidarity Surcharge (sections 3 and 4 SolzG)', () => {
  it('is nil up to the limit and phases in above it at 11.9% of the excess', () => {
    expect(deSolidaritySurcharge(20_350, 'single')).toBe(0);
    expect(deSolidaritySurcharge(20_351, 'single')).toBe(0.11); // 11.9% of 1 euro, cents cut off
    expect(deSolidaritySurcharge(22_464, 'single')).toBe(251.56); // 11.9% × 2,114 = 251.566
    expect(deSolidaritySurcharge(40_700, 'joint')).toBe(0);
  });

  it('is 5.5% once that is the smaller figure', () => {
    // 5.5% × 25,000 = 1,375 but 11.9% × 4,650 = 553.35 is smaller
    expect(deSolidaritySurcharge(25_000, 'single')).toBe(553.35);
    // At 30,864: 5.5% = 1,697.52 and 11.9% × 10,514 = 1,251.166 -> 1,251.16
    expect(deSolidaritySurcharge(30_864, 'single')).toBe(1_251.16);
    // At 105,550 the 5.5% figure is the smaller one: 5,805.25
    expect(deSolidaritySurcharge(105_550, 'single')).toBe(5_805.25);
  });

  it('applies to total tax: income of 80,000 pays 22,464 of income tax and 251.56 of surcharge', () => {
    const t = deTax(80_000, 'single');
    expect([t.incomeTax, t.soli]).toEqual([22_464, 251.56]);
    expect(t.total).toBeCloseTo(22_715.56, 6);
  });
});

describe('Germany income tax calculator page', () => {
  it('reports the default example: 50,000 single', () => {
    expect(metric({}, 'Income tax payable')).toBe(10_548);
    expect(metric({}, 'Solidarity surcharge')).toBe(0);
    expect(metric({}, 'Total income tax')).toBe(10_548);
    expect(metric({}, 'Effective tax rate')).toBeCloseTo(21.096, 3);
    expect(metric({}, 'Income tax rate on your next euro')).toBeCloseTo(35.118, 2);
  });

  it('reports the splitting tariff and the surcharge', () => {
    expect(metric({ income: 100_000, status: 'joint' }, 'Income tax payable')).toBe(21_096);
    expect(metric({ income: 100_000, status: 'joint' }, 'Income tax rate on your next euro')).toBeCloseTo(35.118, 2);
    expect(metric({ income: 100_000 }, 'Solidarity surcharge')).toBe(1_251.16);
    expect(metric({ income: 100_000 }, 'Total income tax')).toBeCloseTo(32_115.16, 6);
    expect(metric({ income: 0 }, 'Effective tax rate')).toBe(0);
  });

  it('rejects a negative income and pins the euro for Germany', () => {
    const def = calcBySlug('de-income-tax-calculator')!;
    expect(def.compute({ ...defaultValues(def), income: -1 }).error).toBeTruthy();
    expect(def.country).toBe('de');
    expect(def.currency).toBe('EUR');
    expect(def.rules?.sources.length).toBe(3);
    expect(def.rules?.asOf).toBe('2026-11-23');
  });
});

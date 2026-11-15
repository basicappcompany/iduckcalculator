import { describe, expect, it } from 'vitest';
import { calcBySlug, defaultValues } from '../../src/lib/calc';
import { CA_BANDS, caEmployeeTax, caFederalTax, caPayroll, canadaBasicPersonalAmount } from '../../src/lib/calc/defs/ca-tax';
import type { Values } from '../../src/lib/calc/types';

/**
 * Known answers for the Canada calculators, worked by hand from the CRA figures read on 2026-11-15 (current-year rates page, the indexation
 * page, the CPP, CPP2 and EI pages, and the T4127 payroll formulas, 122nd edition).
 */
const run = (slug: string, over: Values) => {
  const def = calcBySlug(slug)!;
  const r = def.compute({ ...defaultValues(def), ...over });
  expect(r.error).toBeUndefined();
  return r;
};
const metric = (slug: string, over: Values, label: string): number => Number(run(slug, over).metrics.find((m) => m.label.startsWith(label))!.value);

describe('Canada federal income tax', () => {
  it('the 2026 brackets are the CRA figures', () => {
    expect(CA_BANDS.map((b) => b[0])).toEqual([58_523, 117_045, 181_440, 258_482, Infinity]);
    expect(CA_BANDS.map((b) => b[1])).toEqual([0.14, 0.205, 0.26, 0.29, 0.33]);
  });

  it('the basic personal amount is $16,452, falls in a straight line from $181,440 and is $14,829 from $258,482', () => {
    expect(canadaBasicPersonalAmount(0)).toBe(16_452);
    expect(canadaBasicPersonalAmount(181_440)).toBe(16_452);
    expect(canadaBasicPersonalAmount(258_482)).toBe(14_829);
    expect(canadaBasicPersonalAmount(300_000)).toBe(14_829);
    // The CRA formula: 16,452 − (NI − 181,440) × (1,623 / 77,042). Half way is half of the $1,623 reduction.
    expect(canadaBasicPersonalAmount((181_440 + 258_482) / 2)).toBeCloseTo(16_452 - 811.5, 6);
    expect(canadaBasicPersonalAmount(200_000)).toBeCloseTo(16_452 - (200_000 - 181_440) * (1_623 / 77_042), 8);
  });

  it('$60,000 owes $6,192.73 before provincial tax (the worked example)', () => {
    const r = caFederalTax(60_000, 16_452);
    expect(r.gross).toBeCloseTo(8_496.005, 6);
    expect(r.credits).toBeCloseTo(2_303.28, 6);
    expect(r.tax).toBeCloseTo(6_192.725, 6);
    expect(r.marginal).toBe(0.205);
    expect(r.bands.map((b) => [b.rate, b.income])).toEqual([[0.14, 58_523], [0.205, 1_477]]);
  });

  it('the tax never goes below zero and a bracket top is worked out band by band', () => {
    expect(caFederalTax(10_000, 16_452).tax).toBe(0);
    expect(caFederalTax(0, 16_452).marginal).toBe(0);
    // Tax at the top of the 26% bracket: 14% × 58,523 + 20.5% × 58,522 + 26% × 64,395
    expect(caFederalTax(181_440, 0).gross).toBeCloseTo(0.14 * 58_523 + 0.205 * 58_522 + 0.26 * 64_395, 6);
    expect(caFederalTax(300_000, 0).marginal).toBe(0.33);
  });

  it('the calculator page reports the same figures', () => {
    expect(metric('ca-income-tax-calculator', {}, 'Federal income tax')).toBeCloseTo(6_192.725, 6);
    expect(metric('ca-income-tax-calculator', {}, 'Effective federal tax rate')).toBeCloseTo(10.3212, 3);
    expect(metric('ca-income-tax-calculator', {}, 'Federal rate on your next dollar')).toBe(20.5);
    expect(metric('ca-income-tax-calculator', {}, 'Basic personal amount')).toBe(16_452);
    expect(metric('ca-income-tax-calculator', { income: 200_000 }, 'Basic personal amount')).toBeCloseTo(16_061.0, 0);
    expect(run('ca-income-tax-calculator', {}).table?.rows).toHaveLength(2);
    expect(run('ca-income-tax-calculator', { income: 0 }).table).toBeUndefined();
    const def = calcBySlug('ca-income-tax-calculator')!;
    expect(def.compute({ ...defaultValues(def), income: -1 }).error).toBeTruthy();
  });
});

describe('Canada CPP, EI and take-home pay', () => {
  it('uses the 2026 CPP, CPP2 and EI limits and their maximums', () => {
    const top = caPayroll(200_000);
    expect(top.cpp).toBeCloseTo(4_230.45, 6); // CRA maximum employee CPP contribution
    expect(top.cpp2).toBeCloseTo(416, 6); // CRA maximum CPP2
    expect(top.ei).toBeCloseTo(1_123.07, 2); // CRA maximum employee EI premium
    expect(top.cppBase).toBeCloseTo(3_519.45, 6); // T4127 base CPP maximum
    expect(top.cppEnhanced).toBeCloseTo(711, 6); // T4127 first additional maximum
    const low = caPayroll(3_500);
    expect([low.cpp, low.cpp2]).toEqual([0, 0]);
    expect(caPayroll(60_000).cpp).toBeCloseTo(3_361.75, 6);
    expect(caPayroll(60_000).ei).toBeCloseTo(978, 6);
    expect(caPayroll(80_000).cpp2).toBeCloseTo(216, 6);
  });

  it('$60,000 takes home about $50,322 a year before provincial tax (the worked example)', () => {
    const e = caEmployeeTax(60_000);
    expect(e.taxable).toBeCloseTo(59_435, 6);
    expect(e.gross).toBeCloseTo(8_380.18, 6);
    expect(e.credits).toBeCloseTo(3_041.885, 6);
    expect(e.tax).toBeCloseTo(5_338.295, 6);
    expect(metric('ca-take-home-pay-calculator', {}, 'Take-home pay per year')).toBeCloseTo(50_321.955, 6);
    expect(metric('ca-take-home-pay-calculator', {}, 'Take-home pay per month')).toBeCloseTo(4_193.496, 2);
    expect(metric('ca-take-home-pay-calculator', {}, 'CPP and EI')).toBeCloseTo(4_339.75, 6);
    expect(metric('ca-take-home-pay-calculator', {}, 'Share of your pay')).toBeCloseTo(83.8699, 3);
  });

  it('the table adds up: gross minus the charges is the take-home pay', () => {
    const rows = run('ca-take-home-pay-calculator', { salary: 90_000 }).table!.rows;
    const yearly = rows.map((r) => Number(r[1]));
    expect(yearly[0]! + yearly[1]! + yearly[2]! + yearly[3]! + yearly[4]!).toBeCloseTo(yearly[5]!, 6);
  });
});

describe('Canada pages use dollars whatever the visitor chose in Settings', () => {
  it('both calculators pin CAD and are marked as Canada', () => {
    for (const slug of ['ca-income-tax-calculator', 'ca-take-home-pay-calculator']) {
      const def = calcBySlug(slug)!;
      expect(def.country).toBe('ca');
      expect(def.currency).toBe('CAD');
      expect(def.rules?.sources.length).toBeGreaterThan(2);
      expect(def.rules?.asOf).toBe('2026-11-15');
    }
  });
});

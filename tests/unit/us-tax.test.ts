import { describe, expect, it } from 'vitest';
import { calcBySlug, defaultValues } from '../../src/lib/calc';
import {
  ADDITIONAL_MEDICARE_THRESHOLD,
  SOCIAL_SECURITY_WAGE_BASE,
  US_BRACKETS,
  US_STANDARD_DEDUCTION,
  usIncomeTax,
  usPayrollTax,
  type UsStatus,
} from '../../src/lib/calc/defs/us-tax';
import type { Values } from '../../src/lib/calc/types';

/**
 * Known answers for the US federal calculators. The bracket checks use the "tax is" amounts printed in IRS Revenue Procedure 2025-32,
 * section 4.01 (Tables 1 to 4), read on 2026-11-15: each printed base amount is the tax at the top of the band before it.
 */
const PRINTED_BASE: Record<UsStatus, number[]> = {
  // Table 3, Table 1, Table 4, Table 2: the dollar amount printed for the second to seventh band
  single: [1_240, 5_800, 17_966, 41_024, 58_448, 192_979.25],
  mfj: [2_480, 11_600, 35_932, 82_048, 116_896, 206_583.5],
  mfs: [1_240, 5_800, 17_966, 41_024, 58_448, 103_291.75],
  hoh: [1_770, 7_740, 16_155, 39_207, 56_631, 191_171],
};

const run = (slug: string, over: Values) => {
  const def = calcBySlug(slug)!;
  const r = def.compute({ ...defaultValues(def), ...over });
  expect(r.error).toBeUndefined();
  return r;
};
const metric = (slug: string, over: Values, label: string): number => Number(run(slug, over).metrics.find((m) => m.label.startsWith(label))!.value);

describe('US federal income tax tables', () => {
  for (const status of ['single', 'mfj', 'mfs', 'hoh'] as const) {
    it(`${status}: the tax at the top of each band is the base amount the IRS prints for the next band`, () => {
      const bands = US_BRACKETS[status];
      for (let i = 0; i < PRINTED_BASE[status].length; i++) {
        const top = bands[i]![0];
        // Taxable income = the band limit, so income = limit + the standard deduction.
        const r = usIncomeTax({ income: top + US_STANDARD_DEDUCTION[status], status, itemized: 0 });
        expect(r.taxable).toBe(top);
        expect(r.tax, `${status} band ${i + 1}`).toBeCloseTo(PRINTED_BASE[status][i]!, 2);
      }
    });
  }

  it('the standard deductions are the 2026 amounts in section 4.14', () => {
    expect(US_STANDARD_DEDUCTION).toEqual({ single: 16_100, mfj: 32_200, mfs: 16_100, hoh: 24_150 });
  });

  it('a single filer on $75,000 owes $7,670 (the worked example)', () => {
    const r = usIncomeTax({ income: 75_000, status: 'single', itemized: 0 });
    expect(r.taxable).toBe(58_900);
    expect(r.tax).toBe(7_670);
    expect(r.marginal).toBe(0.22);
    expect(r.bands.map((b) => [b.rate, b.income, b.tax])).toEqual([[0.1, 12_400, 1_240], [0.12, 38_000, 4_560], [0.22, 8_500, 1_870]]);
  });

  it('no tax at or below the standard deduction, and nothing negative', () => {
    expect(usIncomeTax({ income: 16_100, status: 'single', itemized: 0 }).tax).toBe(0);
    expect(usIncomeTax({ income: 5_000, status: 'mfj', itemized: 0 }).taxable).toBe(0);
    expect(usIncomeTax({ income: 5_000, status: 'mfj', itemized: 0 }).marginal).toBe(0);
  });

  it('itemized deductions are used only when they are larger than the standard deduction', () => {
    const std = usIncomeTax({ income: 100_000, status: 'single', itemized: 10_000 });
    expect(std.usedStandard).toBe(true);
    expect(std.taxable).toBe(100_000 - 16_100);
    const item = usIncomeTax({ income: 100_000, status: 'single', itemized: 30_000 });
    expect(item.usedStandard).toBe(false);
    expect(item.taxable).toBe(70_000);
    expect(item.tax).toBeCloseTo(5_800 + (70_000 - 50_400) * 0.22, 2);
  });

  it('the calculator page reports the same figures', () => {
    expect(metric('us-income-tax-calculator', {}, 'Federal income tax')).toBe(7_670);
    expect(metric('us-income-tax-calculator', {}, 'Taxable income')).toBe(58_900);
    expect(metric('us-income-tax-calculator', {}, 'Effective tax rate')).toBeCloseTo(10.2267, 3);
    expect(metric('us-income-tax-calculator', {}, 'Tax rate on your next dollar')).toBe(22);
    // $200,000 married filing jointly: taxable 167,800 = 2,480 + 12% of 76,000 + 22% of 67,000
    expect(metric('us-income-tax-calculator', { status: 'mfj', income: 200_000 }, 'Federal income tax')).toBeCloseTo(2_480 + 9_120 + 14_740, 2);
    expect(run('us-income-tax-calculator', {}).table?.rows).toHaveLength(3);
    expect(run('us-income-tax-calculator', { income: 0 }).table).toBeUndefined();
    expect(calcBySlug('us-income-tax-calculator')!.compute({ ...defaultValues(calcBySlug('us-income-tax-calculator')!), income: -1 }).error).toBeTruthy();
  });
});

describe('US payroll tax and take-home pay', () => {
  it('uses 6.2% up to the $184,500 wage base and 1.45% on everything (IRS Topic 751)', () => {
    expect(SOCIAL_SECURITY_WAGE_BASE).toBe(184_500);
    const p = usPayrollTax(75_000, 'single');
    expect(p.socialSecurity).toBeCloseTo(4_650, 2);
    expect(p.medicare).toBeCloseTo(1_087.5, 2);
    expect(p.additionalMedicare).toBe(0);
    const high = usPayrollTax(300_000, 'single');
    expect(high.socialSecurity).toBeCloseTo(184_500 * 0.062, 2); // 11,439
    expect(high.medicare).toBeCloseTo(4_350, 2);
  });

  it('the Additional Medicare Tax starts at $250,000 jointly, $125,000 separately and $200,000 otherwise (IRS Topic 560)', () => {
    expect(ADDITIONAL_MEDICARE_THRESHOLD).toEqual({ single: 200_000, mfj: 250_000, mfs: 125_000, hoh: 200_000 });
    expect(usPayrollTax(300_000, 'single').additionalMedicare).toBeCloseTo(900, 2);
    expect(usPayrollTax(300_000, 'mfj').additionalMedicare).toBeCloseTo(450, 2);
    expect(usPayrollTax(300_000, 'mfs').additionalMedicare).toBeCloseTo(1_575, 2);
    expect(usPayrollTax(200_000, 'single').additionalMedicare).toBe(0);
  });

  it('a single filer on $75,000 takes home $61,592.50 a year, $5,132.71 a month (the worked example)', () => {
    expect(metric('us-take-home-pay-calculator', {}, 'Take-home pay per year')).toBeCloseTo(61_592.5, 2);
    expect(metric('us-take-home-pay-calculator', {}, 'Take-home pay per month')).toBeCloseTo(5_132.708, 2);
    expect(metric('us-take-home-pay-calculator', {}, 'Federal income tax')).toBe(7_670);
    expect(metric('us-take-home-pay-calculator', {}, 'Social Security and Medicare')).toBeCloseTo(5_737.5, 2);
    expect(metric('us-take-home-pay-calculator', {}, 'Share of your pay')).toBeCloseTo(82.12, 2);
  });

  it('the table adds up: gross minus the charges is the take-home pay', () => {
    const rows = run('us-take-home-pay-calculator', { salary: 300_000, status: 'mfj' }).table!.rows;
    const yearly = rows.map((r) => Number(r[1]));
    expect(yearly[0]! + yearly[1]! + yearly[2]! + yearly[3]! + yearly[4]!).toBeCloseTo(yearly[5]!, 6);
  });
});

describe('US pages use dollars whatever the visitor chose in Settings', () => {
  it('both calculators pin USD and are marked as US', () => {
    for (const slug of ['us-income-tax-calculator', 'us-take-home-pay-calculator']) {
      const def = calcBySlug(slug)!;
      expect(def.country).toBe('us');
      expect(def.currency).toBe('USD');
      expect(def.rules?.sources.length).toBeGreaterThan(1);
      expect(def.rules?.asOf).toBe('2026-11-15');
    }
  });
});

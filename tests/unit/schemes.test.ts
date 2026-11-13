import { describe, expect, it } from 'vitest';
import { calcBySlug, defaultValues } from '../../src/lib/calc';
import { PPF_MAX_YEARLY, PPF_MIN_YEARLY, PPF_RATE, PPF_RULES, ppfPlan } from '../../src/lib/calc/defs/schemes';
import type { Values } from '../../src/lib/calc/types';

/**
 * Known answers for the PPF calculator. The yearly pattern is checked against the closed form for an annuity due, D x (1 + r) x ((1 + r)^n - 1) / r,
 * and the monthly pattern against a closed form worked out from the rule that a month's interest is on the balance after that month's deposit:
 * each year B' = B x (1 + r) + 12d + 6.5 d r, where d is the monthly deposit. Expected values were also computed with exact decimal arithmetic.
 */
const closedYearly = (d: number, n: number, r: number) => d * (1 + r) * (((1 + r) ** n - 1) / r);
const closedMonthly = (yearly: number, n: number, r: number) => {
  const d = yearly / 12;
  let b = 0;
  for (let i = 0; i < n; i++) b = b * (1 + r) + 12 * d + 6.5 * d * r;
  return b;
};

describe('PPF plan', () => {
  it('one deposit a year on or before 5 April: 1,50,000 for 15 years at 7.1% is 40,68,209.22', () => {
    const rows = ppfPlan({ yearly: 150_000, years: 15, rate: 7.1, pattern: 'yearly' });
    expect(rows[0]!.balance).toBeCloseTo(160_650, 6); // (0 + 1,50,000) x 1.071
    expect(rows[0]!.interest).toBeCloseTo(10_650, 6);
    expect(rows[14]!.balance).toBeCloseTo(4_068_209.22, 1);
    expect(rows[14]!.balance).toBeCloseTo(closedYearly(150_000, 15, 0.071), 4);
  });
  it('other amounts and years match the closed form and the exact decimal values', () => {
    expect(ppfPlan({ yearly: 50_000, years: 15, rate: 7.1, pattern: 'yearly' }).at(-1)!.balance).toBeCloseTo(1_356_069.74, 1);
    expect(ppfPlan({ yearly: 150_000, years: 20, rate: 7.1, pattern: 'yearly' }).at(-1)!.balance).toBeCloseTo(6_658_288.17, 1);
    expect(ppfPlan({ yearly: 150_000, years: 25, rate: 7.1, pattern: 'yearly' }).at(-1)!.balance).toBeCloseTo(10_308_014.97, 1);
    for (const [d, n] of [[10_000, 15], [100_000, 15], [150_000, 30]] as const) expect(ppfPlan({ yearly: d, years: n, rate: 7.1, pattern: 'yearly' }).at(-1)!.balance).toBeCloseTo(closedYearly(d, n, 0.071), 3);
  });
  it('monthly deposits on or before the 5th: 12,500 a month for 15 years is 39,44,599.22', () => {
    const last = ppfPlan({ yearly: 150_000, years: 15, rate: 7.1, pattern: 'monthly' }).at(-1)!;
    expect(last.balance).toBeCloseTo(3_944_599.22, 1);
    expect(last.balance).toBeCloseTo(closedMonthly(150_000, 15, 0.071), 4);
    expect(ppfPlan({ yearly: 60_000, years: 15, rate: 7.1, pattern: 'monthly' }).at(-1)!.balance).toBeCloseTo(1_577_839.69, 1);
  });
  it('depositing early in the year earns more: yearly beats monthly by 1,23,610 over 15 years', () => {
    const y = ppfPlan({ yearly: 150_000, years: 15, rate: 7.1, pattern: 'yearly' }).at(-1)!.balance;
    const m = ppfPlan({ yearly: 150_000, years: 15, rate: 7.1, pattern: 'monthly' }).at(-1)!.balance;
    expect(Math.round(y - m)).toBe(123_610);
  });
  it('a 0% rate returns exactly what was put in', () => {
    expect(ppfPlan({ yearly: 100_000, years: 15, rate: 0, pattern: 'yearly' }).at(-1)!.balance).toBe(1_500_000);
  });
});

describe('PPF calculator', () => {
  const def = calcBySlug('ppf-calculator')!;
  const run = (over: Values = {}) => def.compute({ ...defaultValues(def), ...over });
  const val = (label: string, over: Values = {}) => run(over).metrics.find((m) => m.label === label)!.value as number;

  it('the defaults give the figures in the worked example', () => {
    expect(Math.round(val('Maturity value'))).toBe(4_068_209);
    expect(val('Amount invested')).toBe(2_250_000);
    expect(Math.round(val('Interest earned'))).toBe(1_818_209);
    expect(run().table!.rows).toHaveLength(15);
  });
  it('enforces the limits: ₹500 to ₹1,50,000 a year', () => {
    expect(PPF_MIN_YEARLY).toBe(500);
    expect(PPF_MAX_YEARLY).toBe(150_000);
    expect(run({ yearly: 150_001 }).error).toBeTruthy();
    expect(run({ yearly: 499 }).error).toBeTruthy();
    expect(run({ yearly: 500 }).error).toBeUndefined();
    expect(run({ years: 0 }).error).toBeTruthy();
    expect(run({ rate: -1 }).error).toBeTruthy();
  });
  it('uses 7.1% by default, and the rules cite the three official sources and the date they were read', () => {
    expect(PPF_RATE).toBe(7.1);
    expect(def.rules).toBe(PPF_RULES);
    expect(PPF_RULES.asOf).toBe('2026-11-14');
    expect(PPF_RULES.sources.map((x) => x.url)).toEqual([
      'https://www.nsiindia.gov.in/(S(ox1txi55cvkbsb55cq5t1p55))/InternalPage.aspx?Id_Pk=55',
      'https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=178',
      'https://www.nsiindia.gov.in/writereaddata/SchemeRules/PublicProvidentFundSchemeRule.pdf',
    ]);
  });
});

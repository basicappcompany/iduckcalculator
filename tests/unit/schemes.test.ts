import { describe, expect, it } from 'vitest';
import { calcBySlug, defaultValues } from '../../src/lib/calc';
import { PPF_MAX_YEARLY, PPF_MIN_YEARLY, PPF_RATE, PPF_RULES, SUKANYA_MAX_YEARLY, SUKANYA_MIN_YEARLY, SUKANYA_RATE, SUKANYA_RULES, ppfPlan, schemePlan } from '../../src/lib/calc/defs/schemes';
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

describe('Sukanya Samriddhi plan', () => {
  const plan = (o: { yearly?: number; depositYears?: number; years?: number; pattern?: 'yearly' | 'monthly' } = {}) =>
    schemePlan({ yearly: 150_000, depositYears: 15, years: 21, rate: 8.2, pattern: 'yearly', ...o });
  it('1,50,000 a year for 15 years at 8.2%: 1,62,300 after year 1, 44,75,989.33 after year 15, 71,82,119.17 after year 21', () => {
    const rows = plan();
    expect(rows[0]!.balance).toBeCloseTo(162_300, 6); // (0 + 1,50,000) x 1.082
    expect(rows[14]!.balance).toBeCloseTo(4_475_989.33, 1);
    expect(rows[20]!.balance).toBeCloseTo(7_182_119.17, 1);
    // closed form: annuity due for 15 years, then 6 years of growth
    const r = 0.082;
    expect(rows[20]!.balance).toBeCloseTo(150_000 * (1 + r) * (((1 + r) ** 15 - 1) / r) * (1 + r) ** 6, 3);
  });
  it('deposits stop after year 15 and the balance only grows', () => {
    const rows = plan();
    expect(rows[14]!.deposited).toBe(150_000);
    expect(rows[15]!.deposited).toBe(0);
    expect(rows[15]!.balance).toBeCloseTo(rows[14]!.balance * 1.082, 4);
  });
  it('other amounts match exact decimal values', () => {
    expect(plan({ yearly: 50_000 }).at(-1)!.balance).toBeCloseTo(2_394_039.72, 1);
    expect(plan({ yearly: 100_000 }).at(-1)!.balance).toBeCloseTo(4_788_079.45, 1);
    expect(plan({ yearly: 250 }).at(-1)!.balance).toBeCloseTo(11_970.2, 1);
    expect(plan({ depositYears: 10 }).at(-1)!.balance).toBeCloseTo(5_648_207.05, 1);
  });
  it('monthly deposits on or before the 5th: 12,500 a month gives 69,32,647.84, which is 2,49,471 less', () => {
    const m = plan({ pattern: 'monthly' }).at(-1)!.balance;
    expect(m).toBeCloseTo(6_932_647.84, 1);
    expect(Math.round(plan().at(-1)!.balance - m)).toBe(249_471);
  });
  it('the PPF plan is the same engine with deposits every year', () => {
    expect(ppfPlan({ yearly: 150_000, years: 15, rate: 7.1, pattern: 'yearly' }).at(-1)!.balance).toBeCloseTo(
      schemePlan({ yearly: 150_000, depositYears: 15, years: 15, rate: 7.1, pattern: 'yearly' }).at(-1)!.balance, 8);
  });
});

describe('Sukanya Samriddhi calculator', () => {
  const def = calcBySlug('sukanya-samriddhi-calculator')!;
  const run = (over: Values = {}) => def.compute({ ...defaultValues(def), ...over });
  const val = (label: string, over: Values = {}) => run(over).metrics.find((m) => m.label === label)!.value as number;
  it('the defaults give the figures in the worked example', () => {
    expect(Math.round(val('Maturity value'))).toBe(7_182_119);
    expect(val('Amount invested')).toBe(2_250_000);
    expect(Math.round(val('Interest earned'))).toBe(4_932_119);
    expect(run().table!.rows).toHaveLength(21);
    expect(Math.round(val('Maturity value', { years: 15 }))).toBe(4_475_989);
  });
  it('enforces the limits: 250 to 1,50,000 a year, 15 deposit years, 21 years', () => {
    expect([SUKANYA_MIN_YEARLY, SUKANYA_MAX_YEARLY]).toEqual([250, 150_000]);
    expect(run({ yearly: 249 }).error).toBeTruthy();
    expect(run({ yearly: 250 }).error).toBeUndefined();
    expect(run({ yearly: 150_001 }).error).toBeTruthy();
    expect(run({ depositYears: 16 }).error).toBeTruthy();
    expect(run({ years: 22 }).error).toBeTruthy();
    expect(run({ depositYears: 15, years: 14 }).error).toBeTruthy();
    expect(run({ rate: 16 }).error).toBeTruthy();
  });
  it('uses 8.2% and cites the three official sources and the date they were read', () => {
    expect(SUKANYA_RATE).toBe(8.2);
    expect(def.rules).toBe(SUKANYA_RULES);
    expect(SUKANYA_RULES.asOf).toBe('2026-11-14');
    expect(SUKANYA_RULES.sources.map((x) => x.url)).toEqual([
      'https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=89',
      'https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=179',
      'https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=171',
    ]);
  });
});

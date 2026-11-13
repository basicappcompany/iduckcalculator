import { describe, expect, it } from 'vitest';
import { affordableLoan, cagr, compound, emi, loanPlan, simpleInterest, sipFutureValue, sipYears } from '../../src/lib/finance';
import { formatCompact, formatMoney, formatNumber } from '../../src/lib/format';

describe('EMI', () => {
  it('₹10,00,000 at 9% for 20 years is about ₹8,997 a month', () => {
    expect(Math.round(emi(1_000_000, 9, 240))).toBe(8997);
    expect(emi(1_000_000, 9, 240)).toBeCloseTo(8997.26, 2);
  });
  it('₹50,00,000 at 8.5% for 20 years is about ₹43,391', () => {
    expect(Math.round(emi(5_000_000, 8.5, 240))).toBe(43391);
  });
  it('a 0% loan is the principal divided by the months', () => {
    expect(emi(120_000, 0, 12)).toBe(10_000);
  });
  it('bad input gives 0', () => {
    expect(emi(0, 9, 12)).toBe(0);
    expect(emi(1000, 9, 0)).toBe(0);
  });
});

describe('loan plan', () => {
  const plan = loanPlan(1_000_000, 9, 240);
  it('pays the whole principal and the year rows add up', () => {
    expect(plan.months).toBe(240);
    expect(plan.years).toHaveLength(20);
    expect(plan.years.at(-1)!.balance).toBeCloseTo(0, 2);
    expect(plan.years.reduce((s, y) => s + y.principal, 0)).toBeCloseTo(1_000_000, 0);
    expect(plan.totalInterest).toBeCloseTo(emi(1_000_000, 9, 240) * 240 - 1_000_000, 0);
  });
  it('prepaying shortens the loan and saves interest', () => {
    const fast = loanPlan(1_000_000, 9, 240, 5000);
    expect(fast.months).toBeLessThan(240);
    expect(fast.totalInterest).toBeLessThan(plan.totalInterest);
    const lump = loanPlan(1_000_000, 9, 240, 0, 200_000, 24);
    expect(lump.months).toBeLessThan(240);
    expect(lump.totalInterest).toBeLessThan(plan.totalInterest);
  });
});

describe('loan eligibility', () => {
  it('is the inverse of the EMI', () => {
    const e = emi(2_500_000, 8.75, 180);
    expect(affordableLoan(e, 8.75, 180)).toBeCloseTo(2_500_000, 0);
  });
});

describe('savings maths', () => {
  it('₹5,000 a month SIP at 12% for 10 years is about ₹11.62 lakh', () => {
    expect(Math.round(sipFutureValue(5000, 12, 120))).toBe(1_161_695);
  });
  it('SIP year rows end on the same number', () => {
    expect(sipYears(5000, 12, 10).at(-1)!.balance).toBeCloseTo(sipFutureValue(5000, 12, 120), 4);
  });
  it('lumpsum: ₹1,00,000 at 12% for 10 years is ₹3,10,585', () => {
    expect(Math.round(compound(100_000, 12, 10))).toBe(310_585);
  });
  it('compound interest: ₹1,00,000 at 10% for 5 years, yearly = ₹1,61,051', () => {
    expect(Math.round(compound(100_000, 10, 5))).toBe(161_051);
  });
  it('simple interest: ₹1,00,000 at 8% for 3 years = ₹24,000', () => {
    expect(simpleInterest(100_000, 8, 3)).toBe(24_000);
  });
  it('CAGR: doubling in 5 years is 14.87%', () => {
    expect(cagr(1000, 2000, 5)).toBeCloseTo(14.87, 2);
    expect(cagr(0, 2000, 5)).toBeNaN();
  });
});

describe('formatting', () => {
  it('uses lakh and crore grouping for rupees', () => {
    expect(formatMoney(1234567)).toBe('₹12,34,567');
    expect(formatMoney(8997.26, 'INR', 2)).toBe('₹8,997.26');
    expect(formatCompact(1_250_000)).toBe('₹12.50 Lakh');
    expect(formatCompact(12_000_000)).toBe('₹1.20 Crore');
  });
  it('uses the other currencies own grouping', () => {
    expect(formatMoney(1234567, 'USD')).toBe('$1,234,567');
    expect(formatCompact(2_500_000, 'USD')).toBe('$2.50M');
  });
  it('never shows -0 or NaN', () => {
    expect(formatNumber(-0, 0)).toBe('0');
    expect(formatNumber(NaN)).toBe('0');
    expect(formatMoney(-0.2)).toBe('₹0');
  });
});

import { describe, expect, it } from 'vitest';
import { calcBySlug, defaultValues } from '../../src/lib/calc';
import { GRATUITY_CAP, GRATUITY_RULES, INCOME_TAX_RULES, gratuity, NEW_REGIME_SLABS, OLD_REGIME_SLABS, incomeTax, slabTax } from '../../src/lib/calc/defs/tax';
import type { Values } from '../../src/lib/calc/types';

/**
 * Known answers for the income tax calculator, worked out by hand from the slabs in the Finance Bill 2026 memorandum, the rebate in section 156
 * and the standard deduction in section 19 of the Income-tax Act, 2025 (all read on 2026-11-14). The arithmetic is written out so a reader can check it.
 */
const L = 100_000;
const base = { other: 0, deductions: 0, age: 'u60' as const };

describe('income tax slabs (as published)', () => {
  it('new regime: ₹4 lakh nil, then 5, 10, 15, 20, 25 and 30 per cent', () => {
    expect(slabTax(4 * L, NEW_REGIME_SLABS)).toBe(0);
    expect(slabTax(8 * L, NEW_REGIME_SLABS)).toBe(20_000); // 4 lakh at 5%
    expect(slabTax(12 * L, NEW_REGIME_SLABS)).toBe(60_000); // + 4 lakh at 10%
    expect(slabTax(16 * L, NEW_REGIME_SLABS)).toBe(120_000); // + 4 lakh at 15%
    expect(slabTax(20 * L, NEW_REGIME_SLABS)).toBe(200_000); // + 4 lakh at 20%
    expect(slabTax(24 * L, NEW_REGIME_SLABS)).toBe(300_000); // + 4 lakh at 25%
    expect(slabTax(34 * L, NEW_REGIME_SLABS)).toBe(600_000); // + 10 lakh at 30%
  });
  it('old regime: nil up to ₹2.5 lakh (₹3 lakh at 60, ₹5 lakh at 80), 5%, 20%, 30%', () => {
    expect(slabTax(5 * L, OLD_REGIME_SLABS.u60)).toBe(12_500);
    expect(slabTax(10 * L, OLD_REGIME_SLABS.u60)).toBe(112_500);
    expect(slabTax(13 * L, OLD_REGIME_SLABS.u60)).toBe(202_500); // 1,12,500 + 3 lakh at 30%
    expect(slabTax(5 * L, OLD_REGIME_SLABS.s60)).toBe(10_000);
    expect(slabTax(10 * L, OLD_REGIME_SLABS.s60)).toBe(110_000);
    expect(slabTax(5 * L, OLD_REGIME_SLABS.ss80)).toBe(0);
    expect(slabTax(10 * L, OLD_REGIME_SLABS.ss80)).toBe(100_000);
  });
});

describe('income tax: new regime', () => {
  it('salary ₹15 lakh: ₹75,000 standard deduction, slabs ₹93,750, no rebate, 4% cess gives ₹97,500', () => {
    const r = incomeTax({ ...base, salary: 15 * L, regime: 'new' });
    expect(r.taxable).toBe(1_425_000);
    expect(r.slabTax).toBe(93_750); // 20,000 + 40,000 + 15% of 2,25,000
    expect(r.rebate).toBe(0);
    expect(Math.round(r.cess)).toBe(3_750);
    expect(Math.round(r.total)).toBe(97_500);
  });
  it('salary ₹12.75 lakh pays nothing: taxable income ₹12 lakh, tax ₹60,000, rebate ₹60,000', () => {
    const r = incomeTax({ ...base, salary: 1_275_000, regime: 'new' });
    expect(r.taxable).toBe(12 * L);
    expect(r.slabTax).toBe(60_000);
    expect(r.rebate).toBe(60_000);
    expect(r.total).toBe(0);
  });
  it('marginal relief just above ₹12 lakh: salary ₹13 lakh pays only the ₹25,000 above, plus cess', () => {
    const r = incomeTax({ ...base, salary: 13 * L, regime: 'new' });
    expect(r.taxable).toBe(1_225_000);
    expect(r.slabTax).toBe(63_750); // 60,000 + 15% of 25,000
    expect(r.afterRebate).toBe(25_000); // tax may not exceed the income above ₹12 lakh
    expect(Math.round(r.total)).toBe(26_000); // 25,000 + 4% cess
  });
  it('the rebate stops mattering once the tax is smaller than the excess: salary ₹14 lakh pays full tax', () => {
    const r = incomeTax({ ...base, salary: 14 * L, regime: 'new' });
    expect(r.taxable).toBe(1_325_000);
    expect(r.slabTax).toBe(78_750); // 60,000 + 15% of 1,25,000 (18,750)
    expect(r.rebate).toBe(0); // the ₹1,25,000 above ₹12 lakh is more than the tax, so there is no relief
    expect(Math.round(r.total)).toBe(81_900); // plus 4% cess of 3,150
  });
  it('a salary below the standard deduction has no taxable income', () => {
    const r = incomeTax({ ...base, salary: 50_000, regime: 'new' });
    expect(r.standardDeduction).toBe(50_000);
    expect(r.taxable).toBe(0);
    expect(r.total).toBe(0);
  });
  it('other income is added with no standard deduction: ₹10 lakh salary plus ₹2 lakh interest', () => {
    const r = incomeTax({ ...base, salary: 10 * L, other: 2 * L, regime: 'new' });
    expect(r.taxable).toBe(1_125_000); // 12 lakh − 75,000
    expect(r.total).toBe(0); // under ₹12 lakh, so the rebate covers the whole tax
  });
});

describe('income tax: old regime', () => {
  it('salary ₹15 lakh with ₹1.5 lakh of deductions: taxable ₹13 lakh, tax ₹2,02,500, cess gives ₹2,10,600', () => {
    const r = incomeTax({ ...base, salary: 15 * L, deductions: 150_000, regime: 'old' });
    expect(r.standardDeduction).toBe(50_000);
    expect(r.taxable).toBe(13 * L);
    expect(r.slabTax).toBe(202_500);
    expect(Math.round(r.cess)).toBe(8_100);
    expect(Math.round(r.total)).toBe(210_600);
  });
  it('rebate of up to ₹12,500 when taxable income is ₹5 lakh or less', () => {
    const r = incomeTax({ ...base, salary: 550_000, regime: 'old' }); // taxable 5,00,000
    expect(r.taxable).toBe(5 * L);
    expect(r.slabTax).toBe(12_500);
    expect(r.rebate).toBe(12_500);
    expect(r.total).toBe(0);
    const above = incomeTax({ ...base, salary: 560_000, regime: 'old' }); // taxable 5,10,000: no rebate
    expect(above.rebate).toBe(0);
    expect(Math.round(above.slabTax)).toBe(14_500); // 12,500 + 20% of 10,000
  });
  it('a senior citizen (60 to 79) has a ₹3 lakh nil band; an 80-year-old ₹5 lakh', () => {
    expect(incomeTax({ ...base, age: 's60', salary: 8 * L, regime: 'old' }).slabTax).toBe(slabTax(750_000, OLD_REGIME_SLABS.s60));
    expect(slabTax(750_000, OLD_REGIME_SLABS.s60)).toBe(60_000); // 5% of 2 lakh + 20% of 2.5 lakh
    expect(slabTax(750_000, OLD_REGIME_SLABS.ss80)).toBe(50_000); // 20% of 2.5 lakh
  });
  it('deductions are ignored in the new regime', () => {
    const a = incomeTax({ ...base, salary: 15 * L, deductions: 500_000, regime: 'new' });
    const b = incomeTax({ ...base, salary: 15 * L, deductions: 0, regime: 'new' });
    expect(a.total).toBe(b.total);
  });
});

describe('surcharge', () => {
  it('10% over ₹50 lakh: salary ₹60 lakh, new regime, taxable ₹59.25 lakh', () => {
    const r = incomeTax({ ...base, salary: 60 * L, regime: 'new' });
    expect(r.taxable).toBe(5_925_000);
    expect(r.slabTax).toBe(1_357_500); // 3,00,000 + 30% of 35.25 lakh
    expect(Math.round(r.surcharge)).toBe(135_750); // 10%
    expect(Math.round(r.total)).toBe(Math.round(1_357_500 * 1.1 * 1.04)); // 15,53,... with 4% cess
  });
  it('marginal relief just over ₹50 lakh: taxable ₹50.5 lakh pays the tax at ₹50 lakh plus the ₹50,000 above it', () => {
    const r = incomeTax({ ...base, salary: 5_125_000, regime: 'new' });
    expect(r.taxable).toBe(5_050_000);
    expect(r.slabTax).toBe(1_095_000); // 3,00,000 + 30% of 26.5 lakh
    expect(Math.round(r.afterRebate + r.surcharge)).toBe(1_130_000); // 10,80,000 at ₹50 lakh + 50,000
    expect(Math.round(r.total)).toBe(1_175_200); // plus 4% cess
  });
  it('the new regime caps the surcharge at 25% above ₹5 crore; the old regime goes to 37%', () => {
    const nw = incomeTax({ ...base, salary: 6 * 100 * L, regime: 'new' });
    const od = incomeTax({ ...base, salary: 6 * 100 * L, regime: 'old' });
    expect(nw.surcharge / nw.afterRebate).toBeCloseTo(0.25, 6);
    expect(od.surcharge / od.afterRebate).toBeCloseTo(0.37, 6);
  });
});

describe('the calculator', () => {
  const def = calcBySlug('income-tax-calculator')!;
  const run = (over: Values = {}) => def.compute({ ...defaultValues(def), ...over });
  const metric = (label: string, over: Values = {}) => run(over).metrics.find((m) => m.label.startsWith(label))!.value;

  it('gives the figures in its worked example', () => {
    expect(Math.round(Number(metric('Tax in the new regime')))).toBe(97_500);
    expect(Math.round(Number(metric('Tax in the old regime')))).toBe(210_600);
    expect(Math.round(Number(metric('The new regime costs less')))).toBe(113_100);
  });
  it('says which regime costs less', () => {
    expect(run().metrics[0]!.label).toBe('The new regime costs less');
    // Large deductions can make the old regime cheaper: salary ₹15 lakh, ₹7 lakh of deductions leaves ₹7.5 lakh taxable, tax ₹62,500, ₹65,000 with cess.
    const old = run({ ded: 700_000 });
    expect(old.metrics[0]!.label).toBe('The old regime costs less');
    expect(Math.round(Number(old.metrics.find((m) => m.label.startsWith('Tax in the old'))!.value))).toBe(65_000);
  });
  it('rejects negative amounts', () => {
    expect(run({ salary: -1 }).error).toBeTruthy();
    expect(run({ ded: -5 }).error).toBeTruthy();
  });
  it('cites the three official sources and the date they were read', () => {
    expect(def.rules).toBe(INCOME_TAX_RULES);
    expect(INCOME_TAX_RULES.asOf).toBe('2026-11-14');
    expect(INCOME_TAX_RULES.sources.map((x) => x.url)).toEqual([
      'https://www.indiabudget.gov.in/doc/memo.pdf',
      'https://www.incometaxindia.gov.in/w/section-156-84',
      'https://wm.incometaxindia.gov.in/w/section-19-206',
    ]);
  });
});

describe('GST calculator', () => {
  const def = calcBySlug('gst-calculator')!;
  const run = (over: Values) => def.compute({ ...defaultValues(def), ...over });
  const val = (over: Values, label: string) => Number(run(over).metrics.find((m) => m.label === label)!.value);

  it('adds GST: ₹10,000 at 18% is ₹1,800 of GST and ₹11,800 in all', () => {
    expect(val({}, 'GST amount')).toBeCloseTo(1_800, 9); // 10,000 x 18 / 100
    expect(val({}, 'Total with GST')).toBeCloseTo(11_800, 9);
    expect(val({}, 'Price without GST')).toBe(10_000);
  });
  it('removes GST: ₹11,800 at 18% is ₹10,000 plus ₹1,800 of GST', () => {
    const over = { mode: 'remove', amount: 11_800 };
    expect(val(over, 'Price without GST')).toBeCloseTo(10_000, 9); // 11,800 / 1.18
    expect(val(over, 'GST amount')).toBeCloseTo(1_800, 9);
    expect(val(over, 'Price with GST')).toBe(11_800);
  });
  it('the other main rates: 5% and 40%', () => {
    expect(val({ amount: 1_000, rate: 5 }, 'Total with GST')).toBeCloseTo(1_050, 9);
    expect(val({ amount: 1_000, rate: 5 }, 'GST amount')).toBeCloseTo(50, 9);
    expect(val({ amount: 10_000, rate: 40 }, 'Total with GST')).toBeCloseTo(14_000, 9);
    expect(val({ mode: 'remove', amount: 14_000, rate: 40 }, 'Price without GST')).toBeCloseTo(10_000, 9);
    expect(val({ mode: 'remove', amount: 2_100, rate: 5 }, 'Price without GST')).toBeCloseTo(2_000, 9);
    expect(val({ mode: 'remove', amount: 2_100, rate: 5 }, 'GST amount')).toBeCloseTo(100, 9);
  });
  it('subtracting the rate from the total is the common mistake: 18% of ₹11,800 is ₹2,124, which leaves ₹9,676, not ₹10,000', () => {
    expect((11_800 * 18) / 100).toBeCloseTo(2_124, 9);
    expect(11_800 - 2_124).toBe(9_676);
    expect(val({ mode: 'remove', amount: 11_800 }, 'Price without GST')).not.toBe(9_676);
  });
  it('a 0% rate changes nothing, and invalid input is refused', () => {
    expect(val({ rate: 0 }, 'Total with GST')).toBe(10_000);
    expect(run({ rate: -1 }).error).toBeTruthy();
    expect(run({ rate: 101 }).error).toBeTruthy();
    expect(run({ amount: -5 }).error).toBeTruthy();
  });
  it('cites the three official sources and the date they were read', () => {
    expect(def.rules?.asOf).toBe('2026-11-14');
    expect(def.rules?.sources.map((x) => x.url)).toEqual([
      'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2163555&reg=48&lang=2',
      'https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/oct/doc_10142_20261009_21430401.pdf',
      'https://cbic-gst.gov.in/aces/Documents/faq-on-gst.pdf',
    ]);
  });
});

describe('gratuity calculator', () => {
  const def = calcBySlug('gratuity-calculator')!;
  const run = (over: Values = {}) => def.compute({ ...defaultValues(def), ...over });
  const val = (label: string, over: Values = {}) => run(over).metrics.find((m) => m.label.startsWith(label))!.value as number;

  it('wages 60,000 and 10 years: fifteen days is 60,000 / 26 x 15 = 34,615.38, so gratuity is 3,46,153.85', () => {
    expect(val('Fifteen days')).toBeCloseTo(34_615.3846, 3);
    expect(val('Gratuity')).toBeCloseTo(346_153.846, 2);
    expect(Math.round(val('Gratuity'))).toBe(346_154);
  });
  it('the half-of-total-pay floor: basic 30,000 of 1,00,000 uses wages of 50,000, giving 2,88,461.54', () => {
    const over = { basic: 30_000, total: 100_000 };
    expect(val('Wages used', over)).toBe(50_000);
    expect(val('Fifteen days', over)).toBeCloseTo(28_846.1538, 3);
    expect(Math.round(val('Gratuity', over))).toBe(288_462);
  });
  it('basic above half of the total is used as it is', () => {
    expect(gratuity({ basicAndDa: 60_000, totalPay: 100_000, years: 1, months: 0 }).wages).toBe(60_000);
    expect(gratuity({ basicAndDa: 50_000, totalPay: 100_000, years: 1, months: 0 }).wages).toBe(50_000);
  });
  it('a part-year counts only when it is longer than six months', () => {
    expect(gratuity({ basicAndDa: 60_000, totalPay: 60_000, years: 7, months: 6 }).countedYears).toBe(7);
    expect(gratuity({ basicAndDa: 60_000, totalPay: 60_000, years: 7, months: 7 }).countedYears).toBe(8);
    expect(Math.round(val('Gratuity', { years: 7, months: 7 }))).toBe(276_923); // 8 x 34,615.38
    expect(Math.round(val('Gratuity', { years: 7, months: 6 }))).toBe(242_308); // 7 x 34,615.38
  });
  it('is capped at 20 lakh: wages 5,00,000 and 30 years give 86,53,846 on the formula but 20,00,000 is paid', () => {
    const g = gratuity({ basicAndDa: 500_000, totalPay: 500_000, years: 30, months: 0 });
    expect(Math.round(g.uncapped)).toBe(8_653_846);
    expect(g.capped).toBe(true);
    expect(g.amount).toBe(GRATUITY_CAP);
    expect(GRATUITY_CAP).toBe(2_000_000);
    expect(val('Gratuity', { basic: 500_000, total: 500_000, years: 30 })).toBe(2_000_000);
  });
  it('retirement or resignation needs five years; death or disablement does not', () => {
    const early = run({ years: 4, case: 'regular' });
    expect(early.metrics[0]!.label).toMatch(/once you have 5 years/);
    expect(early.note).toMatch(/Not payable yet/);
    expect(run({ years: 5, case: 'regular' }).metrics[0]!.label).toBe('Gratuity');
    expect(run({ years: 2, case: 'death' }).metrics[0]!.label).toBe('Gratuity');
  });
  it('refuses invalid input', () => {
    expect(run({ basic: 0, total: 0 }).error).toBeTruthy();
    expect(run({ months: 12 }).error).toBeTruthy();
    expect(run({ years: -1 }).error).toBeTruthy();
  });
  it('cites the three official sources and the date they were read', () => {
    expect(def.rules).toBe(GRATUITY_RULES);
    expect(GRATUITY_RULES.asOf).toBe('2026-11-14');
    expect(GRATUITY_RULES.sources.map((x) => x.url)).toEqual([
      'https://www.labour.gov.in/static/uploads/2025/07/b0620548445580767b5c0d18c95c26f7.pdf',
      'https://www.labour.gov.in/static/uploads/2026/01/de4758d5bfeffc456d7de97a801891b0.pdf',
      'https://www.labour.gov.in/static/uploads/2026/03/a4ccf4c6d97c4f1f36a6d83f8c64213d.pdf',
    ]);
  });
});

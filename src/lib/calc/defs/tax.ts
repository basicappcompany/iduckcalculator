import { fail, n, num, s, sel, type CalcDef, type Result, type RulesInfo } from '../types';

/**
 * Tax and salary calculators. Every rate, limit and rule here was read from an official source, and the source and the date it was read
 * are shown on the page (`rules`). Nothing is typed from memory. When a rule changes (a Budget, a notification), re-read the sources, change the
 * numbers in this file, update `asOf`, and update the figures in tests/unit/tax.test.ts and in the guides.
 */

const LAKH = 100_000;
const CRORE = 100 * LAKH;

/** The tax year these rules are for: income earned from 1 April 2026 to 31 March 2027, taxed under the Income-tax Act, 2025. */
export const TAX_YEAR = 'Tax year 2026-27 (income earned 1 April 2026 to 31 March 2027)';
export const TAX_RULES_READ_ON = '2026-11-14';

export const INCOME_TAX_RULES: RulesInfo = {
  year: TAX_YEAR,
  asOf: TAX_RULES_READ_ON,
  sources: [
    { name: 'Finance Bill 2026 memorandum (slabs, surcharge, cess)', url: 'https://www.indiabudget.gov.in/doc/memo.pdf' },
    { name: 'Income-tax Act, 2025, section 156 (rebate)', url: 'https://www.incometaxindia.gov.in/w/section-156-84' },
    { name: 'Income-tax Act, 2025, section 19 (standard deduction)', url: 'https://wm.incometaxindia.gov.in/w/section-19-206' },
  ],
};

/** Slabs as [upper limit of the band, rate]. The last band has no limit. Finance Bill 2026 memorandum, tax year 2026-27. */
type Slabs = readonly (readonly [number, number])[];
export const NEW_REGIME_SLABS: Slabs = [
  [4 * LAKH, 0],
  [8 * LAKH, 0.05],
  [12 * LAKH, 0.1],
  [16 * LAKH, 0.15],
  [20 * LAKH, 0.2],
  [24 * LAKH, 0.25],
  [Infinity, 0.3],
];
export const OLD_REGIME_SLABS: Record<'u60' | 's60' | 'ss80', Slabs> = {
  u60: [[2.5 * LAKH, 0], [5 * LAKH, 0.05], [10 * LAKH, 0.2], [Infinity, 0.3]],
  s60: [[3 * LAKH, 0], [5 * LAKH, 0.05], [10 * LAKH, 0.2], [Infinity, 0.3]],
  ss80: [[5 * LAKH, 0], [10 * LAKH, 0.2], [Infinity, 0.3]],
};

/** Section 19 of the Income-tax Act, 2025: ₹75,000 where tax is worked out under section 202(1) (the new regime), ₹50,000 otherwise. */
export const STANDARD_DEDUCTION = { new: 75_000, old: 50_000 } as const;
/** Section 156: new regime ₹60,000 up to total income of ₹12 lakh, with marginal relief above it; old regime ₹12,500 up to ₹5 lakh. */
export const REBATE = { newLimit: 12 * LAKH, newMax: 60_000, oldLimit: 5 * LAKH, oldMax: 12_500 } as const;
/** Health and education cess: 4% of the tax including surcharge (Finance Bill 2026 memorandum). */
export const CESS = 0.04;

export type AgeBand = 'u60' | 's60' | 'ss80';
export type Regime = 'new' | 'old';

export function slabTax(income: number, slabs: Slabs): number {
  let tax = 0;
  let lower = 0;
  for (const [upper, rate] of slabs) {
    if (income > lower) tax += (Math.min(income, upper) - lower) * rate;
    lower = upper;
  }
  return tax;
}

/** Surcharge on income tax (no dividend or capital gains): over ₹50 lakh 10%, over ₹1 crore 15%, over ₹2 crore 25%, over ₹5 crore 37% (25% in the new regime). */
function surchargeRate(income: number, regime: Regime): number {
  if (income > 5 * CRORE) return regime === 'new' ? 0.25 : 0.37;
  if (income > 2 * CRORE) return 0.25;
  if (income > CRORE) return 0.15;
  if (income > 50 * LAKH) return 0.1;
  return 0;
}
const SURCHARGE_THRESHOLDS = [50 * LAKH, CRORE, 2 * CRORE, 5 * CRORE];

export interface TaxResult {
  gross: number;
  standardDeduction: number;
  otherDeductions: number;
  taxable: number;
  slabTax: number;
  rebate: number;
  afterRebate: number;
  surcharge: number;
  cess: number;
  total: number;
}

/**
 * Income tax for one regime. Marginal relief on the rebate is section 156(2)(b); marginal relief on the surcharge is the usual rule: tax plus
 * surcharge may not exceed the tax at the threshold plus the income above it.
 */
export function incomeTax(o: { salary: number; other: number; deductions: number; age: AgeBand; regime: Regime }): TaxResult {
  const { salary, other, age, regime } = o;
  const standardDeduction = Math.min(salary, regime === 'new' ? STANDARD_DEDUCTION.new : STANDARD_DEDUCTION.old);
  const otherDeductions = regime === 'old' ? o.deductions : 0;
  const taxable = Math.max(0, salary + other - standardDeduction - otherDeductions);
  const slabs = regime === 'new' ? NEW_REGIME_SLABS : OLD_REGIME_SLABS[age];
  const base = slabTax(taxable, slabs);

  let rebate = 0;
  if (regime === 'new') {
    if (taxable <= REBATE.newLimit) rebate = Math.min(base, REBATE.newMax);
    else rebate = Math.max(0, base - (taxable - REBATE.newLimit));
  } else if (taxable <= REBATE.oldLimit) rebate = Math.min(base, REBATE.oldMax);
  const afterRebate = base - rebate;

  let withSurcharge = afterRebate * (1 + surchargeRate(taxable, regime));
  const crossed = SURCHARGE_THRESHOLDS.filter((t) => taxable > t).pop();
  if (crossed !== undefined) {
    const atThreshold = slabTax(crossed, slabs) * (1 + surchargeRate(crossed, regime));
    withSurcharge = Math.min(withSurcharge, atThreshold + (taxable - crossed));
  }
  const surcharge = withSurcharge - afterRebate;
  const cess = withSurcharge * CESS;
  return { gross: salary + other, standardDeduction, otherDeductions, taxable, slabTax: base, rebate, afterRebate, surcharge, cess, total: withSurcharge + cess };
}


/** A deduction shown as a negative amount, without a negative zero. */
const minus = (x: number): number => (x === 0 ? 0 : -x);

export const TAX: CalcDef[] = [
  {
    slug: 'income-tax-calculator',
    name: 'Income tax calculator: old vs new regime',
    group: 'tax',
    emoji: '🧮',
    summary: 'Compare the old and new tax regimes for tax year 2026-27, with rebate, surcharge and cess.',
    quick: 'Enter your yearly salary, any other income and the deductions you would claim in the old regime. A salary of ₹15,00,000 pays ₹97,500 in the new regime and ₹2,10,600 in the old with ₹1,50,000 of deductions.',
    keywords: 'income tax old vs new regime salary tax slab rebate surcharge cess standard deduction 2026-27 itr compare',
    title: 'Income Tax Calculator: old vs new regime 2026-27',
    description: 'Free income tax calculator for tax year 2026-27. Compare the old and new regimes side by side, with rebate, surcharge and cess, from official sources.',
    fields: [
      sel('age', 'Your age', 'u60', [['u60', 'Below 60'], ['s60', '60 to 79'], ['ss80', '80 or more']], 'Only the old regime has different slabs for senior citizens.'),
      num('salary', 'Salary per year', 1500000, { unit: 'money', min: 0, step: 10000, hint: 'Gross salary before any deduction. The standard deduction is applied for you.' }),
      num('other', 'Other income per year', 0, { unit: 'money', min: 0, step: 10000, hint: 'Interest, rent and similar income. Do not include capital gains or dividends.' }),
      num('ded', 'Deductions you would claim in the old regime', 150000, { unit: 'money', min: 0, step: 10000, hint: 'Your total for 80C, health insurance, HRA, home loan interest and so on. The calculator does not check the limits for you.' }),
    ],
    compute: (v) => {
      const salary = n(v, 'salary');
      const other = n(v, 'other');
      const deductions = n(v, 'ded');
      if (salary < 0 || other < 0 || deductions < 0) return fail('Enter amounts of 0 or more.');
      const age = (['u60', 's60', 'ss80'] as const).find((a) => a === s(v, 'age')) ?? 'u60';
      const nw = incomeTax({ salary, other, deductions, age, regime: 'new' });
      const od = incomeTax({ salary, other, deductions, age, regime: 'old' });
      const better = nw.total <= od.total ? 'new' : 'old';
      const saving = Math.abs(nw.total - od.total);
      const result: Result = {
        metrics: [
          { label: better === 'new' ? 'The new regime costs less' : 'The old regime costs less', value: saving, kind: 'money', big: true },
          { label: 'Tax in the new regime', value: nw.total, kind: 'money' },
          { label: 'Tax in the old regime', value: od.total, kind: 'money' },
          { label: 'Share of income paid, new regime', value: nw.gross > 0 ? (nw.total / nw.gross) * 100 : 0, kind: 'percent', decimals: 2 },
        ],
        table: {
          title: 'Step-by-step working',
          columns: ['Step', 'New regime', 'Old regime'],
          kinds: ['text', 'money', 'money'],
          rows: [
            ['Salary and other income', nw.gross, od.gross],
            ['Standard deduction', minus(nw.standardDeduction), minus(od.standardDeduction)],
            ['Other deductions', minus(nw.otherDeductions), minus(od.otherDeductions)],
            ['Taxable income', nw.taxable, od.taxable],
            ['Tax on the slabs', nw.slabTax, od.slabTax],
            ['Rebate', minus(nw.rebate), minus(od.rebate)],
            ['Surcharge', nw.surcharge, od.surcharge],
            ['Health and education cess (4%)', nw.cess, od.cess],
            ['Total tax', nw.total, od.total],
          ],
        },
        note: `For a resident individual, tax year 2026-27. ${better === 'new' ? 'The new regime is also the default.' : 'The old regime is not the default: you have to choose it.'} Capital gains, dividends and other special rates are not included.`,
      };
      return result;
    },
    formula: [
      'Tax = tax on the slabs − rebate + surcharge, then 4% cess on the total',
      'Taxable income = salary + other income − standard deduction (₹75,000 new regime, ₹50,000 old) − old-regime deductions',
      'New regime slabs: up to ₹4 lakh nil, then 5%, 10%, 15%, 20%, 25% and 30% in bands of ₹4 lakh, above ₹24 lakh 30%',
      'Old regime slabs: up to ₹2.5 lakh nil, 5% to ₹5 lakh, 20% to ₹10 lakh, 30% above (₹3 lakh and ₹5 lakh nil bands at 60 and 80)',
      'Rebate: new regime ₹60,000 up to ₹12 lakh of taxable income, with marginal relief just above; old regime ₹12,500 up to ₹5 lakh',
    ],
    example: `A salary of ₹15,00,000 in the new regime: ₹75,000 standard deduction leaves ₹14,25,000, and the slabs give ₹20,000 + ₹40,000 + ₹33,750 = ₹93,750. No rebate applies, and 4% cess of ₹3,750 makes ₹97,500. In the old regime with ₹1,50,000 of deductions the taxable income is ₹13,00,000 and the tax with cess is ₹2,10,600.`,
    how: [
      'The new regime is the default. It has lower rates and few deductions, and a rebate that makes tax nil up to ₹12 lakh of taxable income, which is ₹12.75 lakh of salary because of the ₹75,000 standard deduction. The old regime has higher rates but lets you deduct things such as 80C investments, health insurance, HRA and home loan interest.',
      'Enter your salary and, for the old regime, the total of the deductions you would claim. The calculator works out both regimes side by side and shows each step, so you can see where the difference comes from.',
      'Tax year 2026-27 is the first year of the Income-tax Act, 2025, which replaced the 1961 Act from 1 April 2026. The slabs are unchanged from the year before; the page shows the sources and the date they were read.',
    ],
    faqs: [
      { q: 'Which regime is the default?', a: 'The new regime. The rates in section 202 apply unless you opt for the old regime.' },
      { q: 'Why is there no tax on ₹12.75 lakh of salary in the new regime?', a: 'The ₹75,000 standard deduction brings it to ₹12 lakh of taxable income, and the section 156 rebate of up to ₹60,000 cancels the tax up to that level.' },
      { q: 'What goes in the old-regime deductions box?', a: 'The total of what you would claim, such as 80C, health insurance, HRA and home loan interest. The calculator does not apply the limits, so check them before you enter a figure.' },
      { q: 'Does it include capital gains or dividends?', a: 'No. They are taxed at special rates and are left out. Use this for salary, interest and rent.' },
      { q: 'Does it work for non-residents?', a: 'It is built for a resident individual. The rebate is for residents, and senior-citizen slabs apply to residents.' },
    ],
    related: ['percentage-calculator', 'sip-calculator', 'retirement-calculator'],
    rules: INCOME_TAX_RULES,
  },
];


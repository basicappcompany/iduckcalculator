import { fail, n, num, s, sel, type CalcDef, type Result } from '../types';
import type { RulesInfo } from '../types';
import { slabTax } from './tax';

/**
 * United States, federal tax and payroll tax for an employee, tax year 2026. Every figure below was read from the official IRS pages
 * listed in `US_SOURCES` on `US_RULES_READ_ON`; nothing is typed from memory. When the IRS publishes the next year's revenue procedure
 * (the inflation adjustments, usually in October or November), re-read it, change the numbers, bump the date, and update the
 * hand-worked figures in tests/unit/us-tax.test.ts and the guides.
 */
export const US_TAX_YEAR = 'Tax year 2026 (income earned 1 January to 31 December 2026)';
export const US_RULES_READ_ON = '2026-11-15';

const REV_PROC = { name: 'IRS Revenue Procedure 2025-32, section 4 (tax rate tables, standard deduction)', url: 'https://www.irs.gov/pub/irs-drop/rp-25-32.pdf' };
const IR_2025_103 = { name: 'IRS: tax inflation adjustments for tax year 2026 (IR-2025-103)', url: 'https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill' };
const TOPIC_751 = { name: 'IRS Topic 751: Social Security and Medicare withholding rates', url: 'https://www.irs.gov/taxtopics/tc751' };
const TOPIC_560 = { name: 'IRS Topic 560: Additional Medicare Tax', url: 'https://www.irs.gov/taxtopics/tc560' };

export const US_INCOME_TAX_RULES: RulesInfo = { year: US_TAX_YEAR, asOf: US_RULES_READ_ON, sources: [REV_PROC, IR_2025_103] };
export const US_TAKE_HOME_RULES: RulesInfo = { year: US_TAX_YEAR, asOf: US_RULES_READ_ON, sources: [REV_PROC, IR_2025_103, TOPIC_751, TOPIC_560] };

export type UsStatus = 'single' | 'mfj' | 'mfs' | 'hoh';
export const US_STATUSES: readonly UsStatus[] = ['single', 'mfj', 'mfs', 'hoh'];
export const US_STATUS_LABEL: Record<UsStatus, string> = {
  single: 'Single',
  mfj: 'Married filing jointly',
  mfs: 'Married filing separately',
  hoh: 'Head of household',
};

/** Bands as [upper limit of the band, rate]; the last band has no limit. Revenue Procedure 2025-32, section 4.01, Tables 1 to 4. */
type Bands = readonly (readonly [number, number])[];
export const US_BRACKETS: Record<UsStatus, Bands> = {
  // Table 3: unmarried individuals (other than surviving spouses and heads of households)
  single: [[12_400, 0.1], [50_400, 0.12], [105_700, 0.22], [201_775, 0.24], [256_225, 0.32], [640_600, 0.35], [Infinity, 0.37]],
  // Table 1: married individuals filing joint returns and surviving spouses
  mfj: [[24_800, 0.1], [100_800, 0.12], [211_400, 0.22], [403_550, 0.24], [512_450, 0.32], [768_700, 0.35], [Infinity, 0.37]],
  // Table 4: married individuals filing separate returns
  mfs: [[12_400, 0.1], [50_400, 0.12], [105_700, 0.22], [201_775, 0.24], [256_225, 0.32], [384_350, 0.35], [Infinity, 0.37]],
  // Table 2: heads of households
  hoh: [[17_700, 0.1], [67_450, 0.12], [105_700, 0.22], [201_750, 0.24], [256_200, 0.32], [640_600, 0.35], [Infinity, 0.37]],
};

/** Revenue Procedure 2025-32, section 4.14(1). */
export const US_STANDARD_DEDUCTION: Record<UsStatus, number> = { single: 16_100, mfj: 32_200, mfs: 16_100, hoh: 24_150 };

/** Social Security: 6.2% of wages up to the wage base, and Medicare 1.45% of all wages (IRS Topic 751). The 2026 wage base is $184,500. */
export const SOCIAL_SECURITY_RATE = 0.062;
export const SOCIAL_SECURITY_WAGE_BASE = 184_500;
export const MEDICARE_RATE = 0.0145;
/** Additional Medicare Tax (IRS Topic 560): 0.9% of Medicare wages above $250,000 married filing jointly, $125,000 married filing separately, $200,000 for everyone else. */
export const ADDITIONAL_MEDICARE_RATE = 0.009;
export const ADDITIONAL_MEDICARE_THRESHOLD: Record<UsStatus, number> = { single: 200_000, mfj: 250_000, mfs: 125_000, hoh: 200_000 };

const asStatus = (v: string): UsStatus => US_STATUSES.find((x) => x === v) ?? 'single';

export interface UsBand {
  rate: number;
  /** The part of taxable income that falls in this band. */
  income: number;
  tax: number;
}

export interface UsIncomeTax {
  income: number;
  deduction: number;
  usedStandard: boolean;
  taxable: number;
  tax: number;
  /** The rate on the next dollar of taxable income: the band the taxable income is in. 0 when there is no taxable income. */
  marginal: number;
  bands: UsBand[];
}

export function usIncomeTax(o: { income: number; status: UsStatus; itemized: number }): UsIncomeTax {
  const std = US_STANDARD_DEDUCTION[o.status];
  const usedStandard = o.itemized <= std;
  const deduction = usedStandard ? std : o.itemized;
  const taxable = Math.max(0, o.income - deduction);
  const brackets = US_BRACKETS[o.status];
  const bands: UsBand[] = [];
  let lower = 0;
  let marginal = 0;
  for (const [upper, rate] of brackets) {
    const income = Math.max(0, Math.min(taxable, upper) - lower);
    if (income > 0) {
      bands.push({ rate, income, tax: income * rate });
      marginal = rate;
    }
    lower = upper;
  }
  return { income: o.income, deduction, usedStandard, taxable, tax: slabTax(taxable, brackets), marginal, bands };
}

export interface UsPayroll {
  socialSecurity: number;
  medicare: number;
  additionalMedicare: number;
  total: number;
}

export function usPayrollTax(wages: number, status: UsStatus): UsPayroll {
  const socialSecurity = Math.min(wages, SOCIAL_SECURITY_WAGE_BASE) * SOCIAL_SECURITY_RATE;
  const medicare = wages * MEDICARE_RATE;
  const additionalMedicare = Math.max(0, wages - ADDITIONAL_MEDICARE_THRESHOLD[status]) * ADDITIONAL_MEDICARE_RATE;
  return { socialSecurity, medicare, additionalMedicare, total: socialSecurity + medicare + additionalMedicare };
}

/** A deduction shown as a negative amount, without a negative zero. */
const minus = (x: number): number => (x === 0 ? 0 : -x);

const STATUS_FIELD = sel('status', 'Filing status', 'single', US_STATUSES.map((k) => [k, US_STATUS_LABEL[k]] as const), 'Pick the status you will use on your return.');

export const US_TAX: CalcDef[] = [
  {
    slug: 'us-income-tax-calculator',
    country: 'us',
    currency: 'USD',
    name: 'US federal income tax calculator 2026',
    group: 'tax',
    emoji: '🏛️',
    summary: 'Federal income tax for tax year 2026 by filing status, with the standard deduction and a band-by-band breakdown.',
    quick: 'Enter your yearly income and pick your filing status. A single filer earning $75,000 owes $7,670 of federal income tax for 2026, an effective rate of 10.23%.',
    keywords: 'us federal income tax calculator 2026 irs tax brackets standard deduction single married filing jointly head of household effective rate marginal',
    title: 'US Federal Income Tax Calculator 2026',
    description: 'Free US federal income tax calculator for tax year 2026. Pick a filing status and see your tax, effective rate and each bracket, from IRS sources.',
    fields: [
      STATUS_FIELD,
      num('income', 'Income per year', 75000, { unit: 'money', min: 0, step: 1000, hint: 'Wages and other ordinary income for the year, before any deduction. Do not include capital gains.' }),
      num('itemized', 'Itemized deductions', 0, { unit: 'money', min: 0, step: 500, hint: 'Leave at 0 to use the standard deduction. If your itemized total is larger than the standard deduction, enter it and it is used instead.' }),
    ],
    compute: (v) => {
      const income = n(v, 'income');
      const itemized = n(v, 'itemized');
      if (income < 0 || itemized < 0) return fail('Enter amounts of 0 or more.');
      const status = asStatus(s(v, 'status'));
      const r = usIncomeTax({ income, status, itemized });
      const result: Result = {
        metrics: [
          { label: 'Federal income tax', value: r.tax, kind: 'money', big: true },
          { label: 'Taxable income', value: r.taxable, kind: 'money' },
          { label: 'Effective tax rate', value: income > 0 ? (r.tax / income) * 100 : 0, kind: 'percent', decimals: 2 },
          { label: 'Tax rate on your next dollar', value: r.marginal * 100, kind: 'percent', decimals: 0 },
          { label: r.usedStandard ? 'Standard deduction used' : 'Itemized deductions used', value: r.deduction, kind: 'money' },
        ],
        note: `For tax year 2026, ordinary income only. Credits, other taxes, state and local income tax, and capital gains are not included.`,
      };
      if (r.bands.length > 0) {
        result.table = {
          title: 'Tax in each bracket',
          columns: ['Rate', 'Income in the bracket', 'Tax'],
          kinds: ['percent', 'money', 'money'],
          rows: r.bands.map((b) => [b.rate * 100, b.income, b.tax]),
        };
      }
      return result;
    },
    formula: [
      'Tax = the sum of each bracket rate times the part of (income − deduction) that falls in that bracket',
      'Taxable income = income − the standard deduction (or your itemized deductions, if larger)',
      'The standard deduction for 2026 is $16,100 single, $32,200 married filing jointly, $16,100 married filing separately and $24,150 head of household',
      'Rates run 10%, 12%, 22%, 24%, 32%, 35% and 37%; a single filer pays 10% up to $12,400 of taxable income and 37% above $640,600',
      'Effective rate = tax ÷ income',
    ],
    example: 'A single filer with $75,000 of income: the $16,100 standard deduction leaves $58,900 of taxable income. The first $12,400 is taxed at 10% ($1,240), the next $38,000 at 12% ($4,560) and the last $8,500 at 22% ($1,870), so the tax is $7,670, which is 10.23% of income.',
    how: [
      'US federal income tax is marginal: only the income inside a bracket is taxed at that bracket’s rate, so moving into a higher bracket never reduces your take-home pay. You first subtract the standard deduction (or your itemized deductions if they are larger), then apply each rate to its slice of what is left.',
      'Enter your yearly income, pick your filing status and, if you itemize, enter the total of your itemized deductions. The calculator shows your tax, your effective rate, the rate on your next dollar and the tax in every bracket you reach.',
      'The figures are for tax year 2026, the income you earn in 2026 and report on the return you file in 2027. They come from the IRS’s Revenue Procedure 2025-32. The page shows the sources and the date they were read.',
    ],
    faqs: [
      { q: 'Which tax year is this?', a: 'Tax year 2026: income earned from 1 January to 31 December 2026, reported on the return you file in 2027. The brackets and standard deductions are the 2026 amounts the IRS published.' },
      { q: 'What is the difference between the effective rate and the bracket rate?', a: 'The bracket rate applies only to the slice of income inside that bracket. The effective rate is your total tax divided by your total income, so it is always lower than your top bracket rate.' },
      { q: 'Does it use the standard deduction or itemized deductions?', a: 'The standard deduction, unless you enter an itemized total that is larger. Most people take the standard deduction.' },
      { q: 'Does it include state tax, credits or capital gains?', a: 'No. It covers federal income tax on ordinary income only. Credits such as the child tax credit, state and local income tax, and capital gains are not included.' },
      { q: 'Why do the married filing jointly brackets go twice as far?', a: 'For every band up to 32% the joint limits are exactly twice the single limits, so a couple is not pushed into a higher bracket sooner than two single filers. Only the top of the 35% band differs: $768,700 jointly against $640,600 single.' },
    ],
    related: ['us-take-home-pay-calculator', 'percentage-calculator', 'percentage-change-calculator'],
    rules: US_INCOME_TAX_RULES,
  },
  {
    slug: 'us-take-home-pay-calculator',
    country: 'us',
    currency: 'USD',
    name: 'US take-home pay calculator 2026',
    group: 'tax',
    emoji: '💵',
    summary: 'Pay after federal income tax, Social Security and Medicare for 2026, per year and per month.',
    quick: 'Enter your yearly salary and pick your filing status. A single filer on $75,000 takes home $61,592.50 a year, which is $5,132.71 a month, after federal income tax, Social Security and Medicare.',
    keywords: 'us take home pay calculator 2026 paycheck salary after tax federal income tax social security medicare fica net pay monthly',
    title: 'US Take-Home Pay Calculator 2026 (federal)',
    description: 'Free US take-home pay calculator for 2026: salary after federal income tax, Social Security and Medicare, per year and month, from IRS sources.',
    fields: [
      STATUS_FIELD,
      num('salary', 'Salary per year', 75000, { unit: 'money', min: 0, step: 1000, hint: 'Gross wages for the year before any tax or deduction.' }),
    ],
    compute: (v) => {
      const salary = n(v, 'salary');
      if (salary < 0) return fail('Enter an amount of 0 or more.');
      const status = asStatus(s(v, 'status'));
      const inc = usIncomeTax({ income: salary, status, itemized: 0 });
      const pay = usPayrollTax(salary, status);
      const takeHome = salary - inc.tax - pay.total;
      const result: Result = {
        metrics: [
          { label: 'Take-home pay per year', value: takeHome, kind: 'money', decimals: 2, big: true },
          { label: 'Take-home pay per month', value: takeHome / 12, kind: 'money', decimals: 2 },
          { label: 'Federal income tax', value: inc.tax, kind: 'money', decimals: 2 },
          { label: 'Social Security and Medicare', value: pay.total, kind: 'money', decimals: 2 },
          { label: 'Share of your pay you keep', value: salary > 0 ? (takeHome / salary) * 100 : 0, kind: 'percent', decimals: 2 },
        ],
        table: {
          title: 'Where your pay goes',
          columns: ['Item', 'Per year', 'Per month'],
          kinds: ['text', 'money', 'money'],
          rows: [
            ['Gross pay', salary, salary / 12],
            ['Federal income tax', minus(inc.tax), minus(inc.tax / 12)],
            ['Social Security (6.2%)', minus(pay.socialSecurity), minus(pay.socialSecurity / 12)],
            ['Medicare (1.45%)', minus(pay.medicare), minus(pay.medicare / 12)],
            ['Additional Medicare (0.9%)', minus(pay.additionalMedicare), minus(pay.additionalMedicare / 12)],
            ['Take-home pay', takeHome, takeHome / 12],
          ],
        },
        note: 'Federal taxes only, for an employee with wages and the standard deduction. State and local income tax, state payroll taxes, health insurance, retirement contributions and other deductions come out of a real paycheck too, so it will be lower.',
      };
      return result;
    },
    formula: [
      'Take-home pay = salary − federal income tax − Social Security − Medicare',
      'Federal income tax uses the 2026 brackets on (salary − the standard deduction)',
      'Social Security = 6.2% of wages up to $184,500; Medicare = 1.45% of all wages',
      'Additional Medicare tax = 0.9% of wages above $200,000 ($250,000 married filing jointly, $125,000 married filing separately)',
    ],
    example: 'A single filer on $75,000: federal income tax is $7,670, Social Security is $4,650 and Medicare is $1,087.50. Together that is $13,407.50, which leaves $61,592.50 a year, or $5,132.71 a month.',
    how: [
      'Your gross salary is reduced by three federal charges. Federal income tax works through the brackets after the standard deduction. Social Security and Medicare are payroll taxes taken from every paycheck at flat rates, and Social Security stops once your wages pass the yearly wage base.',
      'Enter your yearly salary and your filing status. The calculator shows what you keep per year and per month, and a table of each charge. It does not know your state, your benefits or your retirement contributions, so treat the result as the federal part of the picture.',
      'The rates and limits are for 2026 and come from the IRS pages listed below, read on the date shown.',
    ],
    faqs: [
      { q: 'What is included in the take-home figure?', a: 'Federal income tax, Social Security tax and Medicare tax. State and local taxes, health insurance, retirement contributions and other paycheck deductions are not included.' },
      { q: 'What is the Social Security wage base?', a: 'The most wages that Social Security tax applies to in a year. For 2026 it is $184,500, so no more Social Security tax is taken above that.' },
      { q: 'What is the Additional Medicare Tax?', a: 'An extra 0.9% on Medicare wages above $200,000 for most filers, $250,000 married filing jointly and $125,000 married filing separately. Employers start withholding it above $200,000 whatever your status.' },
      { q: 'How is my pay per month worked out?', a: 'The yearly take-home divided by 12. Your actual paycheck depends on how often you are paid and on your withholding settings.' },
      { q: 'Does it work for the self-employed?', a: 'No. Self-employed people pay self-employment tax instead of the employee share of Social Security and Medicare, and the calculator does not work that out.' },
    ],
    related: ['us-income-tax-calculator', 'percentage-calculator', 'percentage-change-calculator'],
    rules: US_TAKE_HOME_RULES,
  },
];

import { fail, n, num, s, sel, type CalcDef, type Result } from '../types';
import type { RulesInfo } from '../types';
import { slabTax } from './tax';

/**
 * United Kingdom, Income Tax and employee National Insurance (Class 1, category A), tax year 2026 to 2027. Every figure below was read from
 * the official GOV.UK pages listed in `UK_SOURCES` on `UK_RULES_READ_ON`; nothing is typed from memory. When a Budget changes the rates, or
 * the new tax year starts on 6 April, re-read the pages, change the numbers, bump the date, and update tests/unit/uk-tax.test.ts and the guides.
 */
export const UK_TAX_YEAR = 'Tax year 2026 to 2027 (6 April 2026 to 5 April 2027)';
export const UK_RULES_READ_ON = '2026-11-15';

const INCOME_TAX_RATES = { name: 'GOV.UK: Income Tax rates and Personal Allowances', url: 'https://www.gov.uk/income-tax-rates' };
const SCOTTISH_RATES = { name: 'GOV.UK: Income Tax in Scotland', url: 'https://www.gov.uk/scottish-income-tax' };
const EMPLOYER_RATES = { name: 'GOV.UK: Rates and thresholds for employers 2026 to 2027', url: 'https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027' };
const NI_RATES = { name: 'GOV.UK: National Insurance rates and categories', url: 'https://www.gov.uk/national-insurance-rates-letters' };

export const UK_INCOME_TAX_RULES: RulesInfo = { year: UK_TAX_YEAR, asOf: UK_RULES_READ_ON, sources: [INCOME_TAX_RATES, SCOTTISH_RATES] };
export const UK_TAKE_HOME_RULES: RulesInfo = { year: UK_TAX_YEAR, asOf: UK_RULES_READ_ON, sources: [INCOME_TAX_RATES, SCOTTISH_RATES, EMPLOYER_RATES, NI_RATES] };

export type UkRegion = 'eng' | 'sco';
export const UK_REGIONS: readonly UkRegion[] = ['eng', 'sco'];
export const UK_REGION_LABEL: Record<UkRegion, string> = {
  eng: 'England, Wales or Northern Ireland',
  sco: 'Scotland',
};

/** The standard Personal Allowance. It goes down by £1 for every £2 of income above £100,000 and is nil from £125,140. */
export const UK_PERSONAL_ALLOWANCE = 12_570;
export const UK_TAPER_START = 100_000;

/**
 * Bands as [upper limit of the band, rate], measured on taxable income (income after the Personal Allowance). GOV.UK prints the bands as
 * income with the standard £12,570 allowance, so each limit below is the printed figure minus £12,570: England, Wales and Northern Ireland
 * basic rate 20% to £50,270 (37,700 of taxable income), higher rate 40% to £125,140, additional rate 45% above. £125,140 is both the
 * income at which the allowance is gone and the taxable income at which the top rate starts.
 */
type Bands = readonly (readonly [number, number])[];
export const UK_BANDS: Record<UkRegion, Bands> = {
  eng: [[37_700, 0.2], [125_140, 0.4], [Infinity, 0.45]],
  // Starter 19% to £16,537; basic 20% to £29,526; intermediate 21% to £43,662; higher 42% to £75,000; advanced 45% to £125,140; top 48%.
  sco: [[3_967, 0.19], [16_956, 0.2], [31_092, 0.21], [62_430, 0.42], [125_140, 0.45], [Infinity, 0.48]],
};

/** Employee Class 1 National Insurance, category A, 2026 to 2027 (GOV.UK rates and thresholds for employers): 8% from the Primary Threshold to the Upper Earnings Limit, 2% above. */
export const NI_PRIMARY_THRESHOLD = 12_570;
export const NI_UPPER_EARNINGS_LIMIT = 50_270;
export const NI_MAIN_RATE = 0.08;
export const NI_UPPER_RATE = 0.02;

const asRegion = (v: string): UkRegion => UK_REGIONS.find((x) => x === v) ?? 'eng';

export const ukPersonalAllowance = (income: number): number =>
  Math.max(0, UK_PERSONAL_ALLOWANCE - Math.max(0, income - UK_TAPER_START) / 2);

export interface UkBand {
  rate: number;
  /** The part of taxable income that falls in this band. */
  income: number;
  tax: number;
}

export interface UkIncomeTax {
  income: number;
  allowance: number;
  taxable: number;
  tax: number;
  /** The rate on the next pound of income, including the extra 20% slice in the £100,000 to £125,140 range where the allowance is withdrawn. */
  marginal: number;
  bands: UkBand[];
}

export function ukIncomeTax(o: { income: number; region: UkRegion }): UkIncomeTax {
  const allowance = ukPersonalAllowance(o.income);
  const taxable = Math.max(0, o.income - allowance);
  const brackets = UK_BANDS[o.region];
  const bands: UkBand[] = [];
  let lower = 0;
  let rate = 0;
  for (const [upper, r] of brackets) {
    const income = Math.max(0, Math.min(taxable, upper) - lower);
    if (income > 0) {
      bands.push({ rate: r, income, tax: income * r });
      rate = r;
    }
    lower = upper;
  }
  // While the allowance is being withdrawn, each extra £2 of income adds £3 of taxable income.
  const tapering = o.income > UK_TAPER_START && o.income < UK_PERSONAL_ALLOWANCE * 2 + UK_TAPER_START;
  return { income: o.income, allowance, taxable, tax: slabTax(taxable, brackets), marginal: tapering ? rate * 1.5 : rate, bands };
}

/** Employee National Insurance on a yearly salary. Real payroll works it out pay period by pay period, so a year of uneven pay can differ slightly. */
export function ukNationalInsurance(salary: number): { main: number; upper: number; total: number } {
  const main = Math.max(0, Math.min(salary, NI_UPPER_EARNINGS_LIMIT) - NI_PRIMARY_THRESHOLD) * NI_MAIN_RATE;
  const upper = Math.max(0, salary - NI_UPPER_EARNINGS_LIMIT) * NI_UPPER_RATE;
  return { main, upper, total: main + upper };
}

/** A deduction shown as a negative amount, without a negative zero. */
const minus = (x: number): number => (x === 0 ? 0 : -x);

const REGION_FIELD = sel('region', 'Where you live', 'eng', UK_REGIONS.map((k) => [k, UK_REGION_LABEL[k]] as const), 'Scotland sets its own Income Tax bands. National Insurance is the same everywhere.');

export const UK_TAX: CalcDef[] = [
  {
    slug: 'uk-income-tax-calculator',
    country: 'uk',
    currency: 'GBP',
    name: 'UK income tax calculator 2026-27',
    group: 'tax',
    emoji: '🇬🇧',
    summary: 'Income Tax for 2026 to 2027 in England, Wales, Northern Ireland or Scotland, with the Personal Allowance and each band.',
    quick: 'Enter your yearly income and say where you live. Someone in England earning £50,000 pays £7,486 of Income Tax in 2026 to 2027, an effective rate of 14.97%.',
    keywords: 'uk income tax calculator 2026 2027 hmrc personal allowance basic rate higher rate additional rate scotland scottish income tax bands effective rate',
    title: 'UK Income Tax Calculator 2026-27 (with Scotland)',
    description: 'Free UK Income Tax calculator for 2026 to 2027. See your tax, effective rate and each band for England, Wales, Northern Ireland or Scotland, from GOV.UK.',
    fields: [
      REGION_FIELD,
      num('income', 'Income per year', 50000, { unit: 'money', min: 0, step: 1000, hint: 'Pay and other taxable income for the year, before tax. Pension contributions, Gift Aid and other reliefs are not taken off.' }),
    ],
    compute: (v) => {
      const income = n(v, 'income');
      if (income < 0) return fail('Enter an amount of 0 or more.');
      const region = asRegion(s(v, 'region'));
      const r = ukIncomeTax({ income, region });
      const result: Result = {
        metrics: [
          { label: 'Income Tax', value: r.tax, kind: 'money', decimals: 2, big: true },
          { label: 'Taxable income', value: r.taxable, kind: 'money', decimals: 2 },
          { label: 'Effective tax rate', value: income > 0 ? (r.tax / income) * 100 : 0, kind: 'percent', decimals: 2 },
          { label: 'Tax rate on your next pound', value: r.marginal * 100, kind: 'percent', decimals: 1 },
          { label: 'Personal Allowance', value: r.allowance, kind: 'money', decimals: 2 },
        ],
        note: 'For 2026 to 2027, on income with the standard Personal Allowance and no other reliefs. National Insurance, student loans, savings and dividend tax are not included.',
      };
      if (r.bands.length > 0) {
        result.table = {
          title: 'Tax in each band',
          columns: ['Rate', 'Income in the band', 'Tax'],
          kinds: ['percent', 'money', 'money'],
          rows: r.bands.map((b) => [b.rate * 100, b.income, b.tax]),
        };
      }
      return result;
    },
    formula: [
      'Tax = the sum of each band rate times the part of (income − Personal Allowance) that falls in that band',
      'The Personal Allowance is £12,570. It goes down by £1 for every £2 of income above £100,000, so it is nil from £125,140',
      'England, Wales and Northern Ireland: 20% on the first £37,700 of taxable income, 40% up to £125,140, 45% above',
      'Scotland: 19%, 20%, 21%, 42%, 45% and 48% on bands that end at £3,967, £16,956, £31,092, £62,430 and £125,140 of taxable income',
      'Effective rate = tax ÷ income',
    ],
    example: 'Someone in England earning £50,000: the £12,570 Personal Allowance leaves £37,430 of taxable income, all inside the 20% basic rate band, so the tax is £7,486, which is 14.97% of income.',
    how: [
      'UK Income Tax is charged in bands: each rate applies only to the slice of income inside its band. You first take off your Personal Allowance, the part of your income that is tax free, then apply each rate to its slice of what is left.',
      'Enter your yearly income and choose where you live. Scotland sets its own rates and bands for most income; England, Wales and Northern Ireland share the UK ones. The calculator shows your tax, your effective rate, the rate on your next pound and the tax in every band you reach.',
      'The figures are for the 2026 to 2027 tax year, which runs from 6 April 2026 to 5 April 2027. They come from GOV.UK. The page shows the sources and the date they were read.',
    ],
    faqs: [
      { q: 'Which tax year is this?', a: 'The 2026 to 2027 tax year, from 6 April 2026 to 5 April 2027. The Personal Allowance and bands are the ones GOV.UK shows as current.' },
      { q: 'Why is the tax rate between £100,000 and £125,140 so high?', a: 'Your Personal Allowance goes down by £1 for every £2 of income above £100,000. The income lost to tax makes the effective rate on each extra pound 60% in England, Wales and Northern Ireland.' },
      { q: 'Is Scottish tax different?', a: 'Yes. Scotland has six bands from 19% to 48% on income other than savings and dividends. Choose Scotland to use them.' },
      { q: 'Does this include National Insurance?', a: 'No, this calculator shows Income Tax only. The take-home pay calculator includes employee National Insurance.' },
      { q: 'Does it include pension contributions or other reliefs?', a: 'No. It taxes the income you enter after the standard Personal Allowance. Pension contributions, Gift Aid, the Marriage Allowance, savings and dividend tax and student loans are not included.' },
    ],
    related: ['uk-take-home-pay-calculator', 'percentage-calculator', 'percentage-change-calculator'],
    rules: UK_INCOME_TAX_RULES,
  },
  {
    slug: 'uk-take-home-pay-calculator',
    country: 'uk',
    currency: 'GBP',
    name: 'UK take-home pay calculator 2026-27',
    group: 'tax',
    emoji: '💷',
    summary: 'Pay after Income Tax and employee National Insurance for 2026 to 2027, per year and per month.',
    quick: 'Enter your yearly salary and say where you live. Someone in England on £50,000 takes home £39,519.60 a year, which is £3,293.30 a month, after Income Tax and National Insurance.',
    keywords: 'uk take home pay calculator 2026 2027 salary after tax national insurance income tax net pay monthly scotland paye',
    title: 'UK Take-Home Pay Calculator 2026-27 (after tax)',
    description: 'Free UK take-home pay calculator for 2026 to 2027: salary after Income Tax and National Insurance, per year and month, from GOV.UK sources.',
    fields: [
      REGION_FIELD,
      num('salary', 'Salary per year', 50000, { unit: 'money', min: 0, step: 1000, hint: 'Gross pay for the year before any tax or deduction.' }),
    ],
    compute: (v) => {
      const salary = n(v, 'salary');
      if (salary < 0) return fail('Enter an amount of 0 or more.');
      const region = asRegion(s(v, 'region'));
      const inc = ukIncomeTax({ income: salary, region });
      const ni = ukNationalInsurance(salary);
      const takeHome = salary - inc.tax - ni.total;
      const result: Result = {
        metrics: [
          { label: 'Take-home pay per year', value: takeHome, kind: 'money', decimals: 2, big: true },
          { label: 'Take-home pay per month', value: takeHome / 12, kind: 'money', decimals: 2 },
          { label: 'Income Tax', value: inc.tax, kind: 'money', decimals: 2 },
          { label: 'National Insurance', value: ni.total, kind: 'money', decimals: 2 },
          { label: 'Share of your pay you keep', value: salary > 0 ? (takeHome / salary) * 100 : 0, kind: 'percent', decimals: 2 },
        ],
        table: {
          title: 'Where your pay goes',
          columns: ['Item', 'Per year', 'Per month'],
          kinds: ['text', 'money', 'money'],
          rows: [
            ['Gross pay', salary, salary / 12],
            ['Income Tax', minus(inc.tax), minus(inc.tax / 12)],
            ['National Insurance (8%)', minus(ni.main), minus(ni.main / 12)],
            ['National Insurance (2%)', minus(ni.upper), minus(ni.upper / 12)],
            ['Take-home pay', takeHome, takeHome / 12],
          ],
        },
        note: 'For an employee paid the same each month, with the standard Personal Allowance, tax code and National Insurance category A. Pension contributions, student loan repayments, benefits and other deductions come out of a real payslip too, so it will be lower.',
      };
      return result;
    },
    formula: [
      'Take-home pay = salary − Income Tax − employee National Insurance',
      'Income Tax uses the 2026 to 2027 bands on (salary − the Personal Allowance of £12,570, less £1 for every £2 above £100,000)',
      'National Insurance = 8% of earnings between £12,570 and £50,270, plus 2% of earnings above £50,270',
      'Scotland has its own Income Tax bands; National Insurance is the same everywhere in the UK',
    ],
    example: 'Someone in England on £50,000: Income Tax is £7,486 and National Insurance is 8% of £37,430, which is £2,994.40. Together that is £10,480.40, which leaves £39,519.60 a year, or £3,293.30 a month.',
    how: [
      'Your gross salary is reduced by two charges. Income Tax works through the bands after your Personal Allowance. Employee National Insurance is a separate payroll charge: 8% on earnings between £12,570 and £50,270 a year, and 2% on everything above.',
      'Enter your yearly salary and choose where you live. The calculator shows what you keep per year and per month, and a table of each charge. It does not know your pension, student loan, tax code or benefits, so treat the result as the tax part of the picture.',
      'The rates and limits are for the 2026 to 2027 tax year and come from the GOV.UK pages listed below, read on the date shown.',
    ],
    faqs: [
      { q: 'What is included in the take-home figure?', a: 'Income Tax and employee (Class 1, category A) National Insurance. Pension contributions, student loan repayments, benefits in kind and other payslip deductions are not included.' },
      { q: 'What are the National Insurance thresholds?', a: 'For 2026 to 2027 an employee pays nothing on the first £12,570 a year (the Primary Threshold), 8% from there to £50,270 (the Upper Earnings Limit) and 2% above it.' },
      { q: 'Does Scotland change my take-home pay?', a: 'Yes, through Income Tax: Scotland has its own bands and rates. National Insurance is the same everywhere in the UK.' },
      { q: 'How is my pay per month worked out?', a: 'The yearly take-home pay divided by 12. Real payroll works out National Insurance for each pay period, so your payslips can differ slightly.' },
      { q: 'Does it work for the self-employed?', a: 'No. Self-employed people pay Class 4 National Insurance and file a Self Assessment return, and the calculator does not work that out.' },
    ],
    related: ['uk-income-tax-calculator', 'percentage-calculator', 'percentage-change-calculator'],
    rules: UK_TAKE_HOME_RULES,
  },
];

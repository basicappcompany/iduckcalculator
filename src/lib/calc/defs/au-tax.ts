import { fail, n, num, type CalcDef, type Result } from '../types';
import type { RulesInfo } from '../types';
import { slabTax } from './tax';

/**
 * Australia, income tax and Medicare levy for a resident employee, income year 2026–27 (1 July 2026 to 30 June 2027). Every figure below was
 * read from the official ATO pages listed in `AU_SOURCES` on `AU_RULES_READ_ON`; nothing is typed from memory. The rates are for a resident
 * for the full year with the tax-free threshold. Left out: other tax offsets, the Medicare levy surcharge, HELP and other study loan
 * repayments, family and senior (SAPTO) Medicare levy thresholds, and salary sacrifice. Employer super is paid on top of salary and is not
 * taken off. The Medicare levy low-income thresholds are the 2025–26 ones, the latest the ATO had published when they were read.
 * When the ATO publishes the next year's rates and thresholds (the Budget is in May, the year starts on 1 July), re-read the pages, change the
 * numbers, bump the date, and update tests/unit/au-tax.test.ts and the guides.
 */
export const AU_TAX_YEAR = 'Income year 2026–27 (1 July 2026 to 30 June 2027)';
export const AU_RULES_READ_ON = '2026-11-22';

const RATES = { name: 'ATO: Tax rates – Australian resident', url: 'https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents' };
const LITO_PAGE = { name: 'ATO: Low income tax offset', url: 'https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/tax-offsets/low-income-tax-offset' };
const MEDICARE_PAGE = { name: 'ATO: Medicare levy reduction for low-income earners', url: 'https://www.ato.gov.au/individuals-and-families/medicare-and-private-health-insurance/medicare-levy/medicare-levy-reduction/medicare-levy-reduction-for-low-income-earners' };

export const AU_INCOME_TAX_RULES: RulesInfo = { year: AU_TAX_YEAR, asOf: AU_RULES_READ_ON, sources: [RATES, LITO_PAGE, MEDICARE_PAGE] };
export const AU_TAKE_HOME_RULES: RulesInfo = { year: AU_TAX_YEAR, asOf: AU_RULES_READ_ON, sources: [RATES, LITO_PAGE, MEDICARE_PAGE] };

/** Resident bands as [upper limit of the band, rate] (ATO, 2026–27). The ATO prints $4,020, $31,020 and $51,370 at the three upper limits. */
type Bands = readonly (readonly [number, number])[];
export const AU_BANDS: Bands = [[18_200, 0], [45_000, 0.15], [135_000, 0.3], [190_000, 0.37], [Infinity, 0.45]];

/** Low income tax offset (ATO): $700 up to $37,500, then $700 less 5c per $1 over $37,500, then $325 less 1.5c per $1 over $45,000 (nil from $66,667). */
export const LITO_MAX = 700;
export const LITO_FIRST_LIMIT = 37_500;
export const LITO_FIRST_RATE = 0.05;
export const LITO_SECOND_START = 45_000;
export const LITO_SECOND_BASE = 325;
export const LITO_SECOND_RATE = 0.015;
export const lowIncomeTaxOffset = (taxable: number): number => {
  if (taxable <= LITO_FIRST_LIMIT) return LITO_MAX;
  if (taxable <= LITO_SECOND_START) return LITO_MAX - (taxable - LITO_FIRST_LIMIT) * LITO_FIRST_RATE;
  return Math.max(0, LITO_SECOND_BASE - (taxable - LITO_SECOND_START) * LITO_SECOND_RATE);
};

/**
 * Medicare levy: 2% of taxable income. A single person with no dependants pays nothing at or below the lower threshold ($28,011 in 2025–26),
 * and between that and the upper threshold ($35,013) pays 10c for each $1 over the lower threshold, which meets the 2% line at the upper one.
 * The ATO's example (taxable income $29,000, levy $98.90) is checked in tests/unit/au-tax.test.ts.
 */
export const MEDICARE_RATE = 0.02;
export const MEDICARE_LOWER = 28_011;
export const MEDICARE_UPPER = 35_013;
export const MEDICARE_SHADE_IN = 0.1;
export const medicareLevy = (taxable: number): number => {
  if (taxable <= MEDICARE_LOWER) return 0;
  return Math.min(taxable * MEDICARE_RATE, (taxable - MEDICARE_LOWER) * MEDICARE_SHADE_IN);
};

export interface AuBand {
  rate: number;
  /** The part of taxable income that falls in this band. */
  income: number;
  tax: number;
}

export interface AuTax {
  taxable: number;
  /** Tax on the bands before the offset. */
  gross: number;
  /** The low income tax offset used: never more than the tax. */
  offset: number;
  /** Income tax after the offset. */
  tax: number;
  medicare: number;
  /** Income tax plus Medicare levy. */
  total: number;
  marginal: number;
  bands: AuBand[];
}

/** Income tax and Medicare levy on a taxable income for an Australian resident (the whole year, tax-free threshold claimed). */
export function auTax(taxable: number): AuTax {
  const bands: AuBand[] = [];
  let lower = 0;
  let marginal = 0;
  for (const [upper, rate] of AU_BANDS) {
    const income = Math.max(0, Math.min(taxable, upper) - lower);
    if (income > 0) {
      bands.push({ rate, income, tax: income * rate });
      marginal = rate;
    }
    lower = upper;
  }
  const gross = slabTax(taxable, AU_BANDS);
  const offset = Math.min(gross, lowIncomeTaxOffset(taxable));
  const tax = gross - offset;
  const medicare = medicareLevy(taxable);
  return { taxable, gross, offset, tax, medicare, total: tax + medicare, marginal, bands };
}

/** A deduction shown as a negative amount, without a negative zero. */
const minus = (x: number): number => (x === 0 ? 0 : -x);

export const AU_TAX: CalcDef[] = [
  {
    slug: 'au-income-tax-calculator',
    country: 'au',
    currency: 'AUD',
    name: 'Australia income tax calculator 2026–27',
    group: 'tax',
    emoji: '🦘',
    summary: 'Income tax for 2026–27 on your taxable income, with the low income tax offset, the Medicare levy and a band-by-band breakdown.',
    quick: 'Enter your taxable income. Someone with $60,000 of taxable income pays $8,420 of income tax and $1,200 of Medicare levy for 2026–27, $9,620 in all, an effective rate of 16.03%.',
    keywords: 'australia income tax calculator 2026-27 ato tax brackets medicare levy low income tax offset resident tax effective rate',
    title: 'Australia Income Tax Calculator 2026–27',
    description: 'Free Australia income tax calculator for 2026–27: income tax, Medicare levy, low income tax offset and each bracket, from ATO figures.',
    fields: [
      num('income', 'Taxable income per year', 60000, { unit: 'money', min: 0, step: 1000, hint: 'Your taxable income for the year: income after deductions. For an Australian resident for the whole year who claims the tax-free threshold.' }),
    ],
    compute: (v) => {
      const income = n(v, 'income');
      if (income < 0) return fail('Enter an amount of 0 or more.');
      const r = auTax(income);
      const result: Result = {
        metrics: [
          { label: 'Income tax payable', value: r.tax, kind: 'money', big: true },
          { label: 'Tax before the low income tax offset', value: r.gross, kind: 'money' },
          { label: 'Low income tax offset', value: r.offset, kind: 'money' },
          { label: 'Medicare levy', value: r.medicare, kind: 'money' },
          { label: 'Total income tax and Medicare levy', value: r.total, kind: 'money' },
          { label: 'Effective tax rate', value: income > 0 ? (r.total / income) * 100 : 0, kind: 'percent', decimals: 2 },
          { label: 'Bracket rate on your next dollar', value: r.marginal * 100, kind: 'percent', decimals: 1 },
        ],
        note: 'Income tax for 2026–27 for an Australian resident for the whole year, with the low income tax offset and the Medicare levy. The Medicare levy uses the 2025–26 low-income thresholds, the latest the ATO has published. Other tax offsets, the Medicare levy surcharge, HELP and other study loan repayments, family and senior thresholds are not included.',
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
      'Income tax = the sum of each bracket rate times the part of taxable income in that bracket, minus the low income tax offset',
      'The 2026–27 resident brackets are nil to $18,200, 15% to $45,000, 30% to $135,000, 37% to $190,000 and 45% above',
      'Low income tax offset = $700 up to $37,500; then $700 minus 5c for each $1 over $37,500; then $325 minus 1.5c for each $1 over $45,000, which reaches nil at $66,667; the offset cannot take the tax below 0',
      'Medicare levy = 2% of taxable income, reduced for low incomes: nil up to $28,011, then 10c for each $1 over $28,011 until it reaches 2%',
      'Effective rate = (income tax + Medicare levy) ÷ taxable income',
    ],
    example: 'Taxable income of $60,000: the first $18,200 is nil, the next $26,800 at 15% is $4,020 and the last $15,000 at 30% is $4,500, which is $8,520. The low income tax offset is $325 minus 1.5c on the $15,000 over $45,000, which is $100, so income tax is $8,420. The Medicare levy is 2% of $60,000, which is $1,200. Together that is $9,620, or 16.03% of income.',
    how: [
      'Australia taxes a resident\'s income in brackets: each rate applies only to the slice of income inside its bracket, and the first $18,200 is not taxed at all. Most people then get the low income tax offset, which takes up to $700 off the tax, and everyone pays the 2% Medicare levy.',
      'Enter your taxable income for 2026–27 and the calculator shows your income tax, the offset, the Medicare levy, the total and your effective rate, with the tax in each bracket you reach. Taxable income is your income after deductions, such as work-related expenses.',
      'It is an estimate for a resident for the whole year who claims the tax-free threshold. Other offsets, the Medicare levy surcharge, HELP repayments and family or senior thresholds are not included. The figures come from the ATO pages listed below, read on the date shown.',
    ],
    faqs: [
      { q: 'Which income year is this?', a: 'The 2026–27 income year, from 1 July 2026 to 30 June 2027, reported on the return you lodge after 30 June 2027.' },
      { q: 'Does it include the Medicare levy?', a: 'Yes. The levy is 2% of taxable income, reduced for low incomes. It uses the 2025–26 low-income thresholds, which are the latest the ATO has published.' },
      { q: 'What is the low income tax offset?', a: 'A tax offset the ATO applies automatically: $700 up to $37,500 of taxable income, then it reduces, and it is nil from $66,667. It can only reduce your tax to $0.' },
      { q: 'Who are these rates for?', a: 'An Australian resident for tax purposes for the full year who claims the tax-free threshold. Foreign residents and part-year residents are taxed differently.' },
      { q: 'Why is my tax lower than the bracket rate suggests?', a: 'Each rate applies only to the slice of income in its bracket, the first $18,200 is untaxed, and the low income tax offset reduces the tax. The effective rate is your tax divided by your income.' },
    ],
    related: ['au-take-home-pay-calculator', 'percentage-calculator', 'percentage-change-calculator'],
    rules: AU_INCOME_TAX_RULES,
  },
  {
    slug: 'au-take-home-pay-calculator',
    country: 'au',
    currency: 'AUD',
    name: 'Australia take-home pay calculator 2026–27',
    group: 'tax',
    emoji: '💵',
    summary: 'Pay after income tax and the Medicare levy for 2026–27, per year and per month. Employer super is paid on top and not taken off.',
    quick: 'Enter your yearly salary. On $60,000 you pay $8,420 of income tax and $1,200 of Medicare levy, leaving $50,380 a year, or $4,198 a month.',
    keywords: 'australia take home pay calculator 2026-27 salary after tax income tax medicare levy net pay monthly ato',
    title: 'Australia Take-Home Pay Calculator 2026–27',
    description: 'Free Australia take-home pay calculator for 2026–27: salary after income tax and the Medicare levy, per year and month, from ATO figures.',
    fields: [
      num('salary', 'Salary per year', 60000, { unit: 'money', min: 0, step: 1000, hint: 'Pay for the year before tax, not counting employer super. For a resident employee whose salary is also their taxable income.' }),
    ],
    compute: (v) => {
      const salary = n(v, 'salary');
      if (salary < 0) return fail('Enter an amount of 0 or more.');
      const e = auTax(salary);
      const takeHome = salary - e.total;
      const result: Result = {
        metrics: [
          { label: 'Take-home pay per year', value: takeHome, kind: 'money', decimals: 0, big: true },
          { label: 'Take-home pay per month', value: takeHome / 12, kind: 'money', decimals: 0 },
          { label: 'Income tax payable', value: e.tax, kind: 'money', decimals: 0 },
          { label: 'Medicare levy', value: e.medicare, kind: 'money', decimals: 0 },
          { label: 'Share of your pay you keep', value: salary > 0 ? (takeHome / salary) * 100 : 0, kind: 'percent', decimals: 2 },
        ],
        table: {
          title: 'Where your pay goes',
          columns: ['Item', 'Per year', 'Per month'],
          kinds: ['text', 'money', 'money'],
          rows: [
            ['Gross pay', salary, salary / 12],
            ['Income tax', minus(e.tax), minus(e.tax / 12)],
            ['Medicare levy', minus(e.medicare), minus(e.medicare / 12)],
            ['Take-home pay', takeHome, takeHome / 12],
          ],
        },
        note: 'For an Australian resident employee who claims the tax-free threshold and whose salary is their taxable income. Employer super is paid on top of your salary and is not taken off. Other offsets, the Medicare levy surcharge, HELP repayments, salary sacrifice and deductions are not included.',
      };
      return result;
    },
    formula: [
      'Take-home pay = salary − income tax − Medicare levy',
      'Income tax uses the 2026–27 resident brackets (nil to $18,200, 15% to $45,000, 30% to $135,000, 37% to $190,000, 45% above) less the low income tax offset',
      'Medicare levy = 2% of taxable income, reduced for low incomes (nil up to $28,011)',
      'Employer super is paid on top of your salary and is not taken off',
    ],
    example: 'On a $60,000 salary: income tax is $8,520 before the low income tax offset and $8,420 after the $100 offset, and the Medicare levy is $1,200. You keep $60,000 − $8,420 − $1,200 = $50,380 a year, about $4,198 a month, which is 83.97% of your pay.',
    how: [
      'Australia has no employee social contributions, so your pay is reduced by income tax and the Medicare levy only. Income tax follows the resident brackets, with the first $18,200 untaxed, and the low income tax offset takes up to $700 off the tax. The Medicare levy is 2% of taxable income.',
      'Enter your yearly salary to see what you keep per year and per month. The calculator treats your salary as your taxable income, so deductions you claim at tax time are not counted.',
      'Your employer pays superannuation on top of your salary, so it is not taken off here. Other offsets, the Medicare levy surcharge, HELP repayments and salary sacrifice are not included. The figures are for 2026–27 and come from the ATO pages listed below.',
    ],
    faqs: [
      { q: 'Is super taken off my pay?', a: 'No. Employer superannuation is paid on top of your salary and does not reduce the take-home pay shown here.' },
      { q: 'Does it include the Medicare levy?', a: 'Yes. The levy is 2% of taxable income, reduced for low incomes, using the 2025–26 low-income thresholds that the ATO has published.' },
      { q: 'Why does Australia have no social contributions here?', a: 'Employees do not pay a payroll contribution like the CPP or National Insurance. The deductions are income tax and the Medicare levy.' },
      { q: 'Does it include HELP or other study loan repayments?', a: 'No. Repayments of a study or training loan come out of your pay as well, so your real take-home pay may be lower.' },
      { q: 'How is the monthly figure worked out?', a: 'The yearly take-home pay divided by 12. Your actual pay depends on how often you are paid.' },
    ],
    related: ['au-income-tax-calculator', 'percentage-calculator', 'percentage-change-calculator'],
    rules: AU_TAKE_HOME_RULES,
  },
];

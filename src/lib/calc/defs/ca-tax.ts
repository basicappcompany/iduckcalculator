import { fail, n, num, type CalcDef, type Result } from '../types';
import type { RulesInfo } from '../types';
import { slabTax } from './tax';

/**
 * Canada, federal income tax and payroll contributions for an employee, tax year 2026. Every figure below was read from the official CRA
 * pages listed in `CA_SOURCES` on `CA_RULES_READ_ON`; nothing is typed from memory. Provincial and territorial income tax is NOT included
 * (it is a separate tax with its own rules in every province), and Quebec residents pay QPP and a lower EI premium, which this does not model.
 * When the CRA publishes the next year's amounts (CPP, EI and the indexation page, usually in the fall), re-read them, change the numbers,
 * bump the date, and update tests/unit/ca-tax.test.ts and the guides.
 */
export const CA_TAX_YEAR = 'Tax year 2026 (income earned 1 January to 31 December 2026)';
export const CA_RULES_READ_ON = '2026-11-15';

const RATES = { name: 'CRA: Current year tax rates and income brackets (2026)', url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/tax-rates-brackets/current-year.html' };
const INDEXATION = { name: 'CRA: Indexation adjustment for personal income tax and benefit amounts', url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/adjustment-personal-income-tax-benefit-amounts.html' };
const T4127 = { name: 'CRA: T4127 Payroll Deductions Formulas, 122nd edition (effective 1 January 2026)', url: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas/t4127-jan/t4127-jan-payroll-deductions-formulas-computer-programs.html' };
const CPP_PAGE = { name: 'CRA: CPP contribution rates, maximums and exemptions', url: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/canada-pension-plan-cpp/cpp-contribution-rates-maximums-exemptions.html' };
const CPP2_PAGE = { name: 'CRA: Second additional CPP contribution rates and maximums', url: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/calculating-deductions/making-deductions/second-additional-cpp-contribution-rates-maximums.html' };
const EI_PAGE = { name: 'CRA: EI premium rates and maximums', url: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/employment-insurance-ei/ei-premium-rates-maximums.html' };

export const CA_INCOME_TAX_RULES: RulesInfo = { year: CA_TAX_YEAR, asOf: CA_RULES_READ_ON, sources: [RATES, INDEXATION, T4127] };
export const CA_TAKE_HOME_RULES: RulesInfo = { year: CA_TAX_YEAR, asOf: CA_RULES_READ_ON, sources: [RATES, INDEXATION, T4127, CPP_PAGE, CPP2_PAGE, EI_PAGE] };

/** Federal bands as [upper limit of the band, rate] (CRA, 2026). */
type Bands = readonly (readonly [number, number])[];
export const CA_BANDS: Bands = [[58_523, 0.14], [117_045, 0.205], [181_440, 0.26], [258_482, 0.29], [Infinity, 0.33]];
/** Non-refundable credits are worth the lowest federal rate (T4127: "the lowest federal tax rate is used to calculate this credit"). */
export const CA_CREDIT_RATE = 0.14;

/** Basic personal amount (T4127 federal BPAF formula): $16,452 up to $181,440 of net income, falling in a straight line to $14,829 at $258,482. */
export const BPA_MAX = 16_452;
export const BPA_MIN = 14_829;
export const BPA_REDUCTION_START = 181_440;
export const BPA_REDUCTION_END = 258_482;
export const canadaBasicPersonalAmount = (netIncome: number): number => {
  if (netIncome <= BPA_REDUCTION_START) return BPA_MAX;
  if (netIncome >= BPA_REDUCTION_END) return BPA_MIN;
  return BPA_MAX - (netIncome - BPA_REDUCTION_START) * ((BPA_MAX - BPA_MIN) / (BPA_REDUCTION_END - BPA_REDUCTION_START));
};

/** Canada employment amount, 2026 (T4127 Table 8.2): the credit base is the lesser of this and your employment income. */
export const CANADA_EMPLOYMENT_AMOUNT = 1_501;

/** CPP, 2026 (CRA CPP pages and T4127): 5.95% from the $3,500 basic exemption up to the $74,600 YMPE, of which 4.95% is the base and 1% the first additional; CPP2 is 4% from $74,600 to $85,000. */
export const CPP_BASIC_EXEMPTION = 3_500;
export const CPP_YMPE = 74_600;
export const CPP_RATE = 0.0595;
export const CPP_BASE_SHARE = 0.0495 / 0.0595;
export const CPP2_YAMPE = 85_000;
export const CPP2_RATE = 0.04;
/** EI, 2026, outside Quebec: 1.63% of earnings up to $68,900. */
export const EI_MAX_INSURABLE = 68_900;
export const EI_RATE = 0.0163;

export interface CaBand {
  rate: number;
  /** The part of taxable income that falls in this band. */
  income: number;
  tax: number;
}

export interface CaIncomeTax {
  taxable: number;
  /** Tax on the bands before credits. */
  gross: number;
  credits: number;
  tax: number;
  marginal: number;
  bands: CaBand[];
}

/** Federal tax on taxable income, less the credit amounts given (each worth 14%). The result is never below 0. */
export function caFederalTax(taxable: number, creditAmounts: number): CaIncomeTax {
  const bands: CaBand[] = [];
  let lower = 0;
  let marginal = 0;
  for (const [upper, rate] of CA_BANDS) {
    const income = Math.max(0, Math.min(taxable, upper) - lower);
    if (income > 0) {
      bands.push({ rate, income, tax: income * rate });
      marginal = rate;
    }
    lower = upper;
  }
  const gross = slabTax(taxable, CA_BANDS);
  const credits = creditAmounts * CA_CREDIT_RATE;
  return { taxable, gross, credits, tax: Math.max(0, gross - credits), marginal, bands };
}

export interface CaPayroll {
  /** Total CPP: the base part (a credit) and the first additional part (a deduction). */
  cpp: number;
  cppBase: number;
  cppEnhanced: number;
  cpp2: number;
  ei: number;
  total: number;
}

export function caPayroll(salary: number): CaPayroll {
  const cpp = Math.max(0, Math.min(salary, CPP_YMPE) - CPP_BASIC_EXEMPTION) * CPP_RATE;
  const cpp2 = Math.max(0, Math.min(salary, CPP2_YAMPE) - CPP_YMPE) * CPP2_RATE;
  const ei = Math.min(salary, EI_MAX_INSURABLE) * EI_RATE;
  const cppBase = cpp * CPP_BASE_SHARE;
  return { cpp, cppBase, cppEnhanced: cpp - cppBase, cpp2, ei, total: cpp + cpp2 + ei };
}

export interface CaEmployeeTax extends CaIncomeTax {
  salary: number;
  payroll: CaPayroll;
  basicPersonalAmount: number;
}

/**
 * Annual federal tax for an employee on a salary (T4127 option 1): taxable income is the salary less the additional CPP contributions
 * (the first additional 1% and CPP2), and the credits are the basic personal amount, the Canada employment amount and the base CPP and EI.
 */
export function caEmployeeTax(salary: number): CaEmployeeTax {
  const payroll = caPayroll(salary);
  const taxable = Math.max(0, salary - payroll.cppEnhanced - payroll.cpp2);
  const bpa = canadaBasicPersonalAmount(taxable);
  const creditAmounts = bpa + Math.min(salary, CANADA_EMPLOYMENT_AMOUNT) + payroll.cppBase + payroll.ei;
  return { ...caFederalTax(taxable, creditAmounts), salary, payroll, basicPersonalAmount: bpa };
}

/** A deduction shown as a negative amount, without a negative zero. */
const minus = (x: number): number => (x === 0 ? 0 : -x);

export const CA_TAX: CalcDef[] = [
  {
    slug: 'ca-income-tax-calculator',
    country: 'ca',
    currency: 'CAD',
    name: 'Canada federal income tax calculator 2026',
    group: 'tax',
    emoji: '🍁',
    summary: 'Federal income tax for 2026 on your taxable income, with the basic personal amount and a band-by-band breakdown. Provincial tax is not included.',
    quick: 'Enter your taxable income. Someone with $60,000 of taxable income owes $6,193 of federal income tax for 2026, an effective rate of 10.32%, before provincial tax.',
    keywords: 'canada federal income tax calculator 2026 cra tax brackets basic personal amount effective rate marginal federal tax',
    title: 'Canada Federal Income Tax Calculator 2026',
    description: 'Free Canada federal income tax calculator for 2026: federal tax, effective rate and each bracket, from CRA figures. Provincial tax is not included.',
    fields: [
      num('income', 'Taxable income per year', 60000, { unit: 'money', min: 0, step: 1000, hint: 'Your taxable income for the year (line 26000 of your return): income after deductions such as RRSP contributions. Provincial tax is not included.' }),
    ],
    compute: (v) => {
      const income = n(v, 'income');
      if (income < 0) return fail('Enter an amount of 0 or more.');
      const bpa = canadaBasicPersonalAmount(income);
      const r = caFederalTax(income, bpa);
      const result: Result = {
        metrics: [
          { label: 'Federal income tax', value: r.tax, kind: 'money', big: true },
          { label: 'Tax before the basic personal amount credit', value: r.gross, kind: 'money' },
          { label: 'Effective federal tax rate', value: income > 0 ? (r.tax / income) * 100 : 0, kind: 'percent', decimals: 2 },
          { label: 'Federal rate on your next dollar', value: r.marginal * 100, kind: 'percent', decimals: 1 },
          { label: 'Basic personal amount', value: bpa, kind: 'money', decimals: 0 },
        ],
        note: 'Federal tax for 2026 only, with the basic personal amount credit. Provincial and territorial tax, the Canada employment amount, CPP and EI credits and other credits are not included, so your total tax is higher.',
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
      'Federal tax = the sum of each bracket rate times the part of taxable income in that bracket, minus the basic personal amount × 14%',
      'The 2026 brackets are 14% to $58,523, 20.5% to $117,045, 26% to $181,440, 29% to $258,482 and 33% above',
      'The basic personal amount is $16,452 up to $181,440 of income, falls in a straight line to $14,829 at $258,482, and stays there',
      'Credits are worth the lowest federal rate, 14%; the tax cannot go below 0',
      'Effective rate = federal tax ÷ taxable income',
    ],
    example: 'Taxable income of $60,000: $58,523 at 14% is $8,193.22 and the other $1,477 at 20.5% is $302.79, which is $8,496.01. The basic personal amount credit is 14% of $16,452, which is $2,303.28, so the federal tax is $6,192.73, or about $6,193: 10.32% of income.',
    how: [
      'Canada taxes income in brackets: each rate applies only to the slice of income inside its bracket. Everyone then subtracts tax credits, and the largest is the basic personal amount, which is worth 14% of $16,452 for most people.',
      'Enter your taxable income for 2026 and the calculator shows your federal income tax, your effective rate, the rate on your next dollar and the tax in each bracket you reach. High incomes between $181,440 and $258,482 get a smaller basic personal amount.',
      'This is federal tax only. Every province and territory charges its own income tax on top, so what you actually pay is higher. Quebec residents also file a separate provincial return. The figures are for 2026 and come from the CRA pages listed below, read on the date shown.',
    ],
    faqs: [
      { q: 'Does this include provincial or territorial tax?', a: 'No. It works out federal income tax only. Each province and territory charges its own income tax on top of it.' },
      { q: 'What is the basic personal amount?', a: 'A tax credit amount everyone can claim. For 2026 it is $16,452 for most people, worth 14% of that, or $2,303.28. It is reduced for incomes between $181,440 and $258,482.' },
      { q: 'Which tax year is this?', a: 'Tax year 2026: income earned from 1 January to 31 December 2026, reported on the return you file in 2027.' },
      { q: 'What is taxable income?', a: 'Your income after deductions such as RRSP contributions, line 26000 of your return. This calculator taxes the amount you enter.' },
      { q: 'Why is my tax lower than the bracket rate suggests?', a: 'Each rate applies only to the slice of income in its bracket, and credits such as the basic personal amount reduce the tax. The effective rate is your tax divided by your income.' },
    ],
    related: ['ca-take-home-pay-calculator', 'percentage-calculator', 'percentage-change-calculator'],
    rules: CA_INCOME_TAX_RULES,
  },
  {
    slug: 'ca-take-home-pay-calculator',
    country: 'ca',
    currency: 'CAD',
    name: 'Canada take-home pay calculator 2026 (federal)',
    group: 'tax',
    emoji: '💵',
    summary: 'Pay after federal income tax, CPP and EI for 2026, per year and per month. Provincial tax is not included.',
    quick: 'Enter your yearly salary. On $60,000 you pay $5,338 of federal income tax, $3,362 of CPP and $978 of EI, leaving $50,322 a year before provincial tax.',
    keywords: 'canada take home pay calculator 2026 salary after tax federal income tax cpp ei net pay monthly paycheque',
    title: 'Canada Take-Home Pay Calculator 2026 (federal)',
    description: 'Free Canada take-home pay calculator for 2026: salary after federal tax, CPP and EI, per year and month, from CRA sources. Provincial tax excluded.',
    fields: [
      num('salary', 'Salary per year', 60000, { unit: 'money', min: 0, step: 1000, hint: 'Gross pay for the year before any tax or deduction. For an employee outside Quebec.' }),
    ],
    compute: (v) => {
      const salary = n(v, 'salary');
      if (salary < 0) return fail('Enter an amount of 0 or more.');
      const e = caEmployeeTax(salary);
      const p = e.payroll;
      const takeHome = salary - e.tax - p.total;
      const result: Result = {
        metrics: [
          { label: 'Take-home pay per year', value: takeHome, kind: 'money', decimals: 0, big: true },
          { label: 'Take-home pay per month', value: takeHome / 12, kind: 'money', decimals: 0 },
          { label: 'Federal income tax', value: e.tax, kind: 'money', decimals: 0 },
          { label: 'CPP and EI', value: p.total, kind: 'money', decimals: 0 },
          { label: 'Share of your pay you keep', value: salary > 0 ? (takeHome / salary) * 100 : 0, kind: 'percent', decimals: 2 },
        ],
        table: {
          title: 'Where your pay goes',
          columns: ['Item', 'Per year', 'Per month'],
          kinds: ['text', 'money', 'money'],
          rows: [
            ['Gross pay', salary, salary / 12],
            ['Federal income tax', minus(e.tax), minus(e.tax / 12)],
            ['CPP (5.95%)', minus(p.cpp), minus(p.cpp / 12)],
            ['CPP2 (4%)', minus(p.cpp2), minus(p.cpp2 / 12)],
            ['EI (1.63%)', minus(p.ei), minus(p.ei / 12)],
            ['Take-home pay before provincial tax', takeHome, takeHome / 12],
          ],
        },
        note: 'Federal tax only: provincial and territorial income tax is not taken off, so your real pay is lower. For an employee outside Quebec who claims only the basic personal amount and the Canada employment amount. RRSP contributions, benefits and other deductions are not included.',
      };
      return result;
    },
    formula: [
      'Take-home pay = salary − federal income tax − CPP − CPP2 − EI (before provincial tax)',
      'CPP = 5.95% of earnings from $3,500 up to $74,600; CPP2 = 4% of earnings from $74,600 up to $85,000; EI = 1.63% of earnings up to $68,900',
      'Taxable income = salary − the additional CPP (1% of the CPP band) − CPP2',
      'Credits at 14%: the basic personal amount, the Canada employment amount ($1,501), the base CPP (4.95%) and EI',
    ],
    example: 'On a $60,000 salary: CPP is $3,361.75 (5.95% of $56,500) and EI is $978. The 1% extra part of CPP, $565, is deducted from income, so taxable income is $59,435 and the tax before credits is $8,380.18. Credits worth 14% of $16,452 + $1,501 + $2,796.75 + $978 come to $3,041.89, so federal tax is $5,338.30. You keep $50,321.96, about $50,322 a year, or $4,193 a month, before provincial tax.',
    how: [
      'Your gross salary is reduced by federal income tax and by two payroll contributions. CPP is 5.95% of earnings between a $3,500 exemption and $74,600, plus 4% on earnings from $74,600 to $85,000 (CPP2). EI is 1.63% of earnings up to $68,900.',
      'Federal tax follows the CRA payroll formulas: the extra part of CPP is deducted from income, and the basic personal amount, the Canada employment amount, the base CPP and EI each earn a credit worth 14%.',
      'Enter your yearly salary to see what you keep per year and per month. Provincial or territorial income tax comes off on top, which can be several thousand dollars, so treat the result as the federal part of the picture. The figures are for 2026 and come from the CRA pages listed below.',
    ],
    faqs: [
      { q: 'Is provincial tax included?', a: 'No. Only federal income tax, CPP and EI are taken off. Provincial or territorial income tax is a separate tax, so your real take-home pay is lower.' },
      { q: 'What are the CPP and EI limits for 2026?', a: 'CPP applies to earnings between $3,500 and $74,600 at 5.95%, and CPP2 to earnings from $74,600 to $85,000 at 4%. EI applies to earnings up to $68,900 at 1.63%.' },
      { q: 'Does it work for Quebec?', a: 'No. Quebec residents pay QPP instead of CPP and a lower EI premium, and the calculator uses the CPP and EI amounts for the rest of Canada.' },
      { q: 'Why is the CPP deducted from income?', a: 'Only the base 4.95% of CPP earns a credit. The extra 1% and CPP2 are deductions from taxable income, as in the CRA payroll formulas.' },
      { q: 'How is the monthly figure worked out?', a: 'The yearly take-home pay divided by 12. Your actual cheque depends on how often you are paid.' },
    ],
    related: ['ca-income-tax-calculator', 'percentage-calculator', 'percentage-change-calculator'],
    rules: CA_TAKE_HOME_RULES,
  },
];

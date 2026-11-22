import { afterEach, describe, expect, it, vi } from 'vitest';
import { GUIDES, guideBySlug } from '../../src/lib/guides';
import { CALCULATORS, calcBySlug, defaultValues } from '../../src/lib/calc';
import { evaluate } from '../../src/lib/calc/expr';
import { incomeTax } from '../../src/lib/calc/defs/tax';
import { auTax } from '../../src/lib/calc/defs/au-tax';
import { caEmployeeTax, caFederalTax } from '../../src/lib/calc/defs/ca-tax';
import { ukIncomeTax, ukNationalInsurance } from '../../src/lib/calc/defs/uk-tax';
import { usIncomeTax, usPayrollTax } from '../../src/lib/calc/defs/us-tax';
import { formatNumber } from '../../src/lib/format';
import type { Values } from '../../src/lib/calc/types';

/**
 * Every figure the how-to guides quote is recomputed here with the same calculators the site uses, then looked for in the guide's
 * text. If a calculator changes or a number in a guide is wrong, this fails.
 */
const metricOf = (calc: string, over: Values, label: string): number | string => {
  const def = calcBySlug(calc)!;
  const r = def.compute({ ...defaultValues(def), ...over });
  expect(r.error, `${calc} ${JSON.stringify(over)} errored: ${r.error}`).toBeUndefined();
  const m = r.metrics.find((x) => x.label === label || x.label.startsWith(label));
  if (!m) throw new Error(`${calc}: no metric "${label}" in ${r.metrics.map((x) => x.label).join(' | ')}`);
  return m.value;
};

const FORMAT = {
  inr: (v: number) => formatNumber(Math.round(v), 0, 'en-IN'), // 43,391 and 1,04,13,879
  d1: (v: number) => v.toFixed(1),
  us: (v: number) => formatNumber(Math.round(v), 0, 'en-US'), // 7,670 and 183,182
  us2: (v: number) => formatNumber(v, 2, 'en-US'), // 61,592.50
  num: (v: number) => String(Math.round(v * 100) / 100).replace('-', '−'), // 32.5, 61.75, 14.87, −7.17
  raw: (v: number | string) => String(v),
  // The age calculator prints "30 years, 6 months, 17 days"; the prose writes "30 years, 6 months and 17 days".
  ymd: (v: number | string) => String(v).replace(/, (\d+ days?)$/, ' and $1'),
  // Dates: the calculator prints "Saturday, 11 April 2026"; the prose may write the weekday without the comma, or no weekday.
  date: (v: number | string) => String(v).replace(/^[A-Za-z]+, /, ''),
} as const;
type Fmt = keyof typeof FORMAT;
type Claim = [guide: string, calc: string, over: Values, label: string, fmt: Fmt];

const L = (guide: string, calc: string): ((over: Values, label: string, fmt: Fmt) => Claim) => (over, label, fmt) => [guide, calc, over, label, fmt];

const home = L('how-to-calculate-home-loan-emi', 'home-loan-emi-calculator');
const car = L('how-to-calculate-car-loan-emi', 'car-loan-emi-calculator');
const personal = L('how-to-compare-personal-loan-offers', 'personal-loan-emi-calculator');
const prepay = L('how-to-save-interest-with-loan-prepayment', 'loan-prepayment-calculator');
const elig = L('how-much-loan-can-i-get', 'loan-eligibility-calculator');
const sip = L('how-to-calculate-sip-returns', 'sip-calculator');
const lump = L('how-to-calculate-lumpsum-returns', 'lumpsum-calculator');
const step = L('how-a-step-up-sip-works', 'step-up-sip-calculator');
const swp = L('how-to-plan-regular-withdrawals-swp', 'swp-calculator');
const fd = L('how-to-calculate-fd-maturity', 'fd-calculator');
const rd = L('how-to-calculate-rd-maturity', 'rd-calculator');
const comp = L('how-compound-interest-works', 'compound-interest-calculator');
const usTax = L('how-to-calculate-us-federal-income-tax', 'us-income-tax-calculator');
const usPay = L('how-to-calculate-us-take-home-pay', 'us-take-home-pay-calculator');
const ukTax = L('how-to-calculate-uk-income-tax', 'uk-income-tax-calculator');
const ukPay = L('how-to-calculate-uk-take-home-pay', 'uk-take-home-pay-calculator');
const auTaxG = L('how-to-calculate-australian-income-tax', 'au-income-tax-calculator');
const auPay = L('how-to-calculate-australian-take-home-pay', 'au-take-home-pay-calculator');
const caTax = L('how-to-calculate-canadian-federal-income-tax', 'ca-income-tax-calculator');
const caPay = L('how-to-calculate-canadian-take-home-pay', 'ca-take-home-pay-calculator');
const taxg = L('how-to-choose-old-or-new-tax-regime', 'income-tax-calculator');
const gstg = L('how-to-add-and-remove-gst', 'gst-calculator');
const gratg = L('how-to-calculate-gratuity', 'gratuity-calculator');
const hrag = L('how-to-calculate-hra-exemption', 'hra-calculator');
const ppfg = L('how-to-calculate-ppf-maturity', 'ppf-calculator');
const ssag = L('how-to-calculate-sukanya-samriddhi-maturity', 'sukanya-samriddhi-calculator');
const simp = L('how-to-calculate-simple-interest', 'simple-interest-calculator');
const simpComp = L('how-to-calculate-simple-interest', 'compound-interest-calculator');
const basicG = L('how-to-use-the-basic-calculator', 'basic-calculator');
const cagr = L('how-to-calculate-cagr', 'cagr-calculator');
const infl = L('how-inflation-reduces-your-money', 'inflation-calculator');
const ret = L('how-to-plan-your-retirement-corpus', 'retirement-calculator');
const pchg = L('how-to-calculate-percentage-change', 'percentage-change-calculator');
const disc = L('how-to-calculate-discount-and-final-price', 'discount-calculator');
const pl = L('how-to-calculate-profit-and-loss', 'profit-loss-calculator');
const avg = L('how-to-find-mean-median-and-mode', 'average-calculator');
const ratio = L('how-to-simplify-and-solve-ratios', 'ratio-calculator');
const frac = L('how-to-add-subtract-multiply-and-divide-fractions', 'fraction-calculator');
const bmi = L('how-to-calculate-bmi', 'bmi-calculator');
const bmr = L('how-to-calculate-bmr', 'bmr-calculator');
const tdee = L('how-to-calculate-daily-calories-tdee', 'tdee-calculator');
const fat = L('how-to-estimate-body-fat', 'body-fat-calculator');
const ideal = L('how-to-find-your-ideal-weight', 'ideal-weight-calculator');
const water = L('how-much-water-should-you-drink', 'water-intake-calculator');
const cgpa = L('how-to-convert-cgpa-to-percentage', 'cgpa-to-percentage-calculator');
const gpa = L('how-to-calculate-gpa', 'gpa-calculator');
const marks = L('how-to-calculate-marks-percentage', 'marks-percentage-calculator');
const attend = L('how-much-attendance-do-i-need', 'attendance-calculator');
const age = L('how-to-calculate-your-age', 'age-calculator');
const ddiff = L('how-to-find-the-days-between-two-dates', 'date-difference-calculator');
const addd = L('how-to-add-or-subtract-days-from-a-date', 'add-days-calculator');
const work = L('how-to-count-working-days', 'working-days-calculator');
const dur = L('how-to-calculate-time-duration', 'time-duration-calculator');

const CLAIMS: Claim[] = [
  // ---- loans
  home({}, 'Monthly EMI', 'inr'), home({}, 'Total payment', 'inr'), home({}, 'Total interest', 'inr'),
  home({ tenure: 10 }, 'Monthly EMI', 'inr'), home({ tenure: 10 }, 'Total interest', 'inr'),
  home({ tenure: 15 }, 'Monthly EMI', 'inr'), home({ tenure: 15 }, 'Total interest', 'inr'),
  home({ tenure: 25 }, 'Monthly EMI', 'inr'), home({ tenure: 25 }, 'Total interest', 'inr'),
  home({ rate: 7.5 }, 'Monthly EMI', 'inr'), home({ rate: 9.5 }, 'Monthly EMI', 'inr'),
  car({}, 'Monthly EMI', 'inr'), car({}, 'Total interest', 'inr'),
  car({ tenure: 3 }, 'Monthly EMI', 'inr'), car({ tenure: 3 }, 'Total interest', 'inr'),
  car({ tenure: 7 }, 'Monthly EMI', 'inr'), car({ tenure: 7 }, 'Total interest', 'inr'),
  car({ principal: 600000 }, 'Monthly EMI', 'inr'), car({ principal: 600000 }, 'Total interest', 'inr'),
  personal({}, 'Monthly EMI', 'inr'), personal({}, 'Total interest', 'inr'),
  ...[1, 2, 5].flatMap((tenure) => [personal({ tenure }, 'Monthly EMI', 'inr'), personal({ tenure }, 'Total interest', 'inr')]),
  ...[12, 16].flatMap((rate) => [personal({ rate }, 'Monthly EMI', 'inr'), personal({ rate }, 'Total interest', 'inr')]),
  prepay({}, 'Interest saved', 'inr'), prepay({}, 'New loan length', 'raw'), prepay({}, 'Interest without prepaying', 'inr'),
  prepay({ extra: 2000 }, 'Interest saved', 'inr'), prepay({ extra: 2000 }, 'New loan length', 'raw'),
  prepay({ extra: 10000 }, 'Interest saved', 'inr'), prepay({ extra: 10000 }, 'New loan length', 'raw'),
  prepay({ extra: 0, lump: 200000, lumpMonth: 24 }, 'Interest saved', 'inr'), prepay({ extra: 0, lump: 200000, lumpMonth: 24 }, 'New loan length', 'raw'),
  elig({}, 'Estimated eligible loan', 'inr'), elig({}, 'Affordable EMI', 'inr'),
  elig({ existing: 20000 }, 'Estimated eligible loan', 'inr'), elig({ existing: 20000 }, 'Affordable EMI', 'inr'),
  elig({ foir: 40 }, 'Estimated eligible loan', 'inr'), elig({ tenure: 25 }, 'Estimated eligible loan', 'inr'), elig({ rate: 9.5 }, 'Estimated eligible loan', 'inr'),
  // ---- savings
  ...[5, 10, 15, 20].map((years) => sip({ years }, 'Maturity value', 'inr')), ...[5, 10, 15, 20].map((years) => sip({ years }, 'Amount invested', 'inr')),
  sip({}, 'Gain', 'inr'), sip({ rate: 8 }, 'Maturity value', 'inr'), sip({ rate: 10 }, 'Maturity value', 'inr'), sip({ monthly: 10000 }, 'Maturity value', 'inr'),
  ...[5, 10, 15, 20].map((years) => lump({ years }, 'Maturity value', 'inr')), lump({}, 'Gain', 'inr'),
  lump({ rate: 8 }, 'Maturity value', 'inr'), lump({ rate: 10 }, 'Maturity value', 'inr'),
  step({ step: 0 }, 'Maturity value', 'inr'), step({ step: 5 }, 'Maturity value', 'inr'), step({ step: 5 }, 'Amount invested', 'inr'),
  step({}, 'Maturity value', 'inr'), step({}, 'Amount invested', 'inr'), step({}, 'Extra over a flat SIP', 'inr'),
  swp({}, 'Balance left at the end', 'inr'), swp({}, 'Total withdrawn', 'inr'),
  swp({ withdraw: 30000 }, 'Balance left at the end', 'inr'), swp({ withdraw: 30000 }, 'Total withdrawn', 'inr'),
  swp({ withdraw: 50000 }, 'Money runs out after', 'raw'), swp({ withdraw: 50000 }, 'Total withdrawn', 'inr'),
  swp({ withdraw: 60000 }, 'Money runs out after', 'raw'),
  fd({}, 'Maturity value', 'inr'), fd({}, 'Gain', 'inr'), fd({ freq: '1' }, 'Maturity value', 'inr'), fd({ freq: '12' }, 'Maturity value', 'inr'),
  fd({ years: 3 }, 'Maturity value', 'inr'), fd({ rate: 6 }, 'Maturity value', 'inr'),
  rd({}, 'Maturity value', 'inr'), rd({}, 'Gain', 'inr'), rd({ months: 12 }, 'Maturity value', 'inr'), rd({ months: 12 }, 'Gain', 'inr'),
  rd({ monthly: 10000, months: 36 }, 'Maturity value', 'inr'), rd({ monthly: 10000, months: 36 }, 'Gain', 'inr'),
  ...['1', '2', '4', '12', '365'].map((freq) => comp({ freq }, 'Amount after the period', 'inr')), comp({}, 'Compound interest earned', 'inr'),
  comp({ rate: 8, years: 3 }, 'Compound interest earned', 'inr'), comp({ rate: 8, years: 3 }, 'Simple interest', 'inr'),
  comp({ years: 20 }, 'Amount after the period', 'inr'), comp({ years: 20 }, 'Compound interest earned', 'inr'), comp({ years: 20 }, 'Simple interest', 'inr'),
  cagr({}, 'CAGR', 'num'), cagr({ start: 50000, end: 120000, years: 7 }, 'CAGR', 'num'), cagr({ start: 50000, end: 120000, years: 7 }, 'Total growth', 'num'),
  cagr({ start: 100000, end: 80000, years: 3 }, 'CAGR', 'num'), cagr({ start: 100000, end: 80000, years: 3 }, 'Total growth', 'num'), cagr({ years: 10 }, 'CAGR', 'num'),
  infl({}, 'Same things will cost', 'inr'), infl({}, 'Your money will buy only', 'inr'),
  infl({ inflation: 5 }, 'Same things will cost', 'inr'), infl({ inflation: 5 }, 'Your money will buy only', 'inr'),
  infl({ inflation: 7 }, 'Same things will cost', 'inr'), infl({ inflation: 7 }, 'Your money will buy only', 'inr'),
  infl({ years: 20 }, 'Same things will cost', 'inr'), infl({ years: 20 }, 'Your money will buy only', 'inr'),
  ret({}, 'Corpus needed at retirement', 'inr'), ret({}, 'Monthly SIP to reach it', 'inr'), ret({}, 'Yearly expenses in the first retirement year', 'inr'),
  ret({ retireAge: 55 }, 'Corpus needed at retirement', 'inr'), ret({ retireAge: 55 }, 'Monthly SIP to reach it', 'inr'),
  ret({ age: 25 }, 'Corpus needed at retirement', 'inr'), ret({ age: 25 }, 'Monthly SIP to reach it', 'inr'),
  ret({ expense: 30000 }, 'Corpus needed at retirement', 'inr'), ret({ expense: 30000 }, 'Monthly SIP to reach it', 'inr'),
  ret({ saved: 1000000 }, 'Monthly SIP to reach it', 'inr'),
  simp({}, 'Simple interest', 'inr'), simp({}, 'Total amount', 'inr'), simp({}, 'Interest every year', 'inr'), simp({ years: 0.75 }, 'Simple interest', 'inr'),
  simpComp({ rate: 8, years: 3 }, 'Compound interest earned', 'inr'),
  simpComp({ years: 20 }, 'Simple interest', 'inr'), simpComp({ years: 20 }, 'Compound interest earned', 'inr'),
  // ---- tax (rules read from official sources on 2026-11-14)
  taxg({}, 'Tax in the new regime', 'inr'), taxg({}, 'Tax in the old regime', 'inr'), taxg({}, 'The new regime costs less', 'inr'),
  taxg({ ded: 700000 }, 'Tax in the old regime', 'inr'),
  taxg({ salary: 1000000 }, 'Tax in the new regime', 'inr'), taxg({ salary: 1000000 }, 'Tax in the old regime', 'inr'),
  taxg({ salary: 1300000 }, 'Tax in the new regime', 'inr'),
  gstg({}, 'Total with GST', 'inr'), gstg({}, 'GST amount', 'inr'),
  gstg({ mode: 'remove', amount: 11800 }, 'Price without GST', 'inr'),
  gstg({ amount: 1000, rate: 5 }, 'Total with GST', 'inr'), gstg({ amount: 10000, rate: 40 }, 'Total with GST', 'inr'),
  gstg({ mode: 'remove', amount: 14000, rate: 40 }, 'Price without GST', 'inr'),
  gstg({ mode: 'remove', amount: 2100, rate: 5 }, 'Price without GST', 'inr'), gstg({ mode: 'remove', amount: 2100, rate: 5 }, 'GST amount', 'inr'),
  gratg({}, 'Gratuity', 'inr'), gratg({}, 'Fifteen days', 'inr'),
  gratg({ basic: 30000, total: 100000 }, 'Gratuity', 'inr'), gratg({ basic: 30000, total: 100000 }, 'Fifteen days', 'inr'),
  gratg({ years: 7, months: 7 }, 'Gratuity', 'inr'), gratg({ years: 7, months: 6 }, 'Gratuity', 'inr'),
  gratg({ basic: 500000, total: 500000, years: 30 }, 'Gratuity', 'inr'),
  hrag({}, 'HRA exempt', 'inr'), hrag({}, 'HRA that is taxable', 'inr'), hrag({}, 'Limit 1', 'inr'), hrag({}, 'Limit 2', 'inr'), hrag({}, 'Limit 3', 'inr'),
  hrag({ hra: 15000 }, 'HRA exempt', 'inr'),
  hrag({ basic: 20000, hra: 12000, rent: 15000 }, 'HRA exempt', 'inr'), hrag({ basic: 20000, hra: 12000, rent: 15000 }, 'HRA that is taxable', 'inr'),
  hrag({ basic: 20000, hra: 12000, rent: 15000, city: 'other' }, 'HRA exempt', 'inr'),
  ppfg({}, 'Maturity value', 'inr'), ppfg({}, 'Amount invested', 'inr'), ppfg({}, 'Interest earned', 'inr'),
  ppfg({ pattern: 'monthly' }, 'Maturity value', 'inr'), ppfg({ yearly: 50000 }, 'Maturity value', 'inr'),
  ppfg({ years: 20 }, 'Maturity value', 'inr'), ppfg({ years: 25 }, 'Maturity value', 'inr'),
  ssag({}, 'Maturity value', 'inr'), ssag({}, 'Amount invested', 'inr'), ssag({}, 'Interest earned', 'inr'),
  ssag({ years: 15 }, 'Maturity value', 'inr'), ssag({ yearly: 50000 }, 'Maturity value', 'inr'),
  ssag({ pattern: 'monthly' }, 'Maturity value', 'inr'),
  // ---- US tax (rules read from the IRS pages on 2026-11-15)
  usTax({}, 'Federal income tax', 'us'), usTax({}, 'Taxable income', 'us'), usTax({}, 'Effective tax rate', 'num'),
  usTax({ income: 100000 }, 'Federal income tax', 'us'), usTax({ income: 100000 }, 'Taxable income', 'us'), usTax({ income: 100000 }, 'Effective tax rate', 'num'),
  usTax({ status: 'mfj', income: 120000 }, 'Federal income tax', 'us'), usTax({ status: 'mfj', income: 120000 }, 'Taxable income', 'us'), usTax({ status: 'mfj', income: 120000 }, 'Effective tax rate', 'num'),
  usTax({ status: 'hoh', income: 75000 }, 'Federal income tax', 'us'), usTax({ status: 'hoh', income: 75000 }, 'Taxable income', 'us'),
  usTax({ income: 100000, itemized: 30000 }, 'Federal income tax', 'us'), usTax({ income: 100000, itemized: 30000 }, 'Taxable income', 'us'),
  usPay({}, 'Take-home pay per year', 'us2'), usPay({}, 'Take-home pay per month', 'us2'), usPay({}, 'Federal income tax', 'us'),
  usPay({}, 'Social Security and Medicare', 'us2'), usPay({}, 'Share of your pay', 'num'),
  usPay({ salary: 250000 }, 'Take-home pay per year', 'us'), usPay({ salary: 250000 }, 'Federal income tax', 'us'),
  usPay({ status: 'mfj', salary: 120000 }, 'Take-home pay per year', 'us'), usPay({ status: 'mfj', salary: 120000 }, 'Federal income tax', 'us'),
  // ---- UK tax (rules read from GOV.UK on 2026-11-15)
  ukTax({}, 'Income Tax', 'us'), ukTax({}, 'Taxable income', 'us'), ukTax({}, 'Effective tax rate', 'num'),
  ukTax({ income: 30000 }, 'Income Tax', 'us'), ukTax({ income: 30000 }, 'Effective tax rate', 'num'),
  ukTax({ income: 110000 }, 'Income Tax', 'us'), ukTax({ income: 110000 }, 'Taxable income', 'us'), ukTax({ income: 110000 }, 'Effective tax rate', 'num'),
  ukTax({ region: 'sco' }, 'Income Tax', 'us2'), ukTax({ region: 'sco' }, 'Effective tax rate', 'num'),
  ukPay({}, 'Take-home pay per year', 'us2'), ukPay({}, 'Take-home pay per month', 'us2'), ukPay({}, 'Income Tax', 'us'),
  ukPay({}, 'National Insurance', 'us2'), ukPay({}, 'Share of your pay', 'num'),
  ukPay({ salary: 30000 }, 'Take-home pay per year', 'us2'), ukPay({ salary: 30000 }, 'National Insurance', 'us2'),
  ukPay({ salary: 110000 }, 'Take-home pay per year', 'us2'), ukPay({ salary: 110000 }, 'National Insurance', 'us2'), ukPay({ salary: 110000 }, 'Income Tax', 'us'),
  ukPay({ region: 'sco' }, 'Take-home pay per year', 'us2'), ukPay({ region: 'sco' }, 'Income Tax', 'us2'),
  // ---- Canada tax (rules read from the CRA pages on 2026-11-15)
  caTax({}, 'Federal income tax', 'us'), caTax({}, 'Effective federal tax rate', 'num'),
  caTax({ income: 30000 }, 'Federal income tax', 'us'), caTax({ income: 30000 }, 'Effective federal tax rate', 'num'),
  caTax({ income: 100000 }, 'Federal income tax', 'us'), caTax({ income: 100000 }, 'Effective federal tax rate', 'num'), caTax({ income: 100000 }, 'Tax before', 'us2'),
  caPay({}, 'Take-home pay per year', 'us'), caPay({}, 'Take-home pay per month', 'us'), caPay({}, 'Federal income tax', 'us'),
  caPay({}, 'Share of your pay', 'num'),
  caPay({ salary: 40000 }, 'Take-home pay per year', 'us'), caPay({ salary: 40000 }, 'Federal income tax', 'us'),
  caPay({ salary: 90000 }, 'Take-home pay per year', 'us'), caPay({ salary: 90000 }, 'Federal income tax', 'us'),
  // ---- Australia tax (rules read from the ATO pages on 2026-11-22)
  auTaxG({}, 'Income tax payable', 'us'), auTaxG({}, 'Medicare levy', 'us'), auTaxG({}, 'Total income tax and Medicare levy', 'us'), auTaxG({}, 'Effective tax rate', 'num'),
  auTaxG({ income: 30000 }, 'Income tax payable', 'us'), auTaxG({ income: 30000 }, 'Medicare levy', 'us2'), auTaxG({ income: 30000 }, 'Total income tax and Medicare levy', 'us2'), auTaxG({ income: 30000 }, 'Effective tax rate', 'num'),
  auTaxG({ income: 100000 }, 'Income tax payable', 'us'), auTaxG({ income: 100000 }, 'Medicare levy', 'us'), auTaxG({ income: 100000 }, 'Total income tax and Medicare levy', 'us'), auTaxG({ income: 100000 }, 'Effective tax rate', 'num'),
  auPay({}, 'Take-home pay per year', 'us'), auPay({}, 'Take-home pay per month', 'us'), auPay({}, 'Income tax payable', 'us'), auPay({}, 'Medicare levy', 'us'), auPay({}, 'Share of your pay', 'num'),
  auPay({ salary: 40000 }, 'Take-home pay per year', 'us'), auPay({ salary: 40000 }, 'Take-home pay per month', 'us'), auPay({ salary: 40000 }, 'Income tax payable', 'us'), auPay({ salary: 40000 }, 'Medicare levy', 'us'),
  auPay({ salary: 100000 }, 'Take-home pay per year', 'us'), auPay({ salary: 100000 }, 'Take-home pay per month', 'us'), auPay({ salary: 100000 }, 'Income tax payable', 'us'), auPay({ salary: 100000 }, 'Medicare levy', 'us'), auPay({ salary: 100000 }, 'Share of your pay', 'num'),
  // ---- everyday maths
  pchg({}, 'Percentage increase', 'num'), pchg({ from: 100, to: 80 }, 'Percentage decrease', 'num'), pchg({ from: 50, to: 75 }, 'Percentage increase', 'num'), pchg({ from: 200, to: 150 }, 'Percentage decrease', 'num'),
  disc({}, 'You pay', 'inr'), disc({}, 'You save', 'inr'), disc({}, 'Effective discount', 'num'),
  disc({ price: 1000, d1: 40, d2: 20 }, 'You pay', 'inr'), disc({ price: 1000, d1: 40, d2: 20 }, 'You save', 'inr'), disc({ price: 1000, d1: 40, d2: 20 }, 'Effective discount', 'num'),
  pl({}, 'Profit', 'inr'), pl({}, 'Profit percentage', 'num'), pl({}, 'Margin', 'num'),
  pl({ cost: 1200, sell: 900 }, 'Loss', 'inr'), pl({ cost: 1200, sell: 900 }, 'Loss percentage', 'num'), pl({ cost: 1200, sell: 900 }, 'Margin', 'num'),
  pl({ cost: 500, sell: 650 }, 'Profit', 'inr'), pl({ cost: 500, sell: 650 }, 'Profit percentage', 'num'), pl({ cost: 500, sell: 650 }, 'Margin', 'num'),
  avg({}, 'Mean', 'num'), avg({}, 'Sum', 'num'), avg({ list: '4, 8, 8, 10, 15, 20' }, 'Mean', 'num'), avg({ list: '4, 8, 8, 10, 15, 20' }, 'Median', 'num'), avg({ list: '4, 8, 8, 10, 15, 20' }, 'Mode', 'raw'),
  avg({ list: '40 55 62 70 90' }, 'Mean', 'num'), avg({ list: '40 55 62 70 90' }, 'Median', 'num'), avg({ list: '40 55 62 70 90' }, 'Sum', 'num'), avg({ list: '40 55 62 70 90' }, 'Range', 'num'),
  ratio({}, 'Simplest ratio', 'raw'), ratio({}, 'D,', 'raw'), ratio({ a: 3, b: 4, c: 15 }, 'D,', 'raw'), ratio({ a: 2.5, b: 10, c: 4 }, 'Simplest ratio', 'raw'), ratio({ a: 2.5, b: 10, c: 4 }, 'D,', 'raw'),
  frac({}, 'Answer', 'raw'), frac({ n1: 3, d1: 4, op: 'sub', n2: 1, d2: 6 }, 'Answer', 'raw'), frac({ n1: 2, d1: 3, op: 'mul', n2: 3, d2: 5 }, 'Answer', 'raw'),
  frac({ n1: 1, d1: 2, op: 'div', n2: 1, d2: 4 }, 'Answer', 'raw'), frac({ n1: 7, d1: 8, op: 'add', n2: 3, d2: 4 }, 'Answer', 'raw'), frac({ n1: 7, d1: 8, op: 'add', n2: 3, d2: 4 }, 'Mixed number', 'raw'),
  basicG({}, '', 'raw'), basicG({ a: 125, b: 75, op: 'add' }, '', 'raw'), basicG({ a: 10, b: 4, op: 'sub' }, '', 'raw'), basicG({ a: 1, b: 3, op: 'div' }, '', 'raw'),
  basicG({ a: 2, b: 10, op: 'pow' }, '', 'raw'), basicG({ a: 17, b: 5, op: 'mod' }, '', 'raw'), basicG({ a: 15, b: 2400, op: 'pct' }, '', 'raw'),
  basicG({ a: 0.1, b: 0.2, op: 'add' }, '', 'raw'), basicG({ a: 2, b: 100, op: 'pow' }, '', 'raw'),
  // ---- dates
  age({ dob: '1995-06-15', asof: '2026-01-01' }, 'Your age', 'ymd'), age({ dob: '1990-01-31', asof: '2026-03-01' }, 'Your age', 'ymd'),
  age({ dob: '2000-02-29', asof: '2001-02-28' }, 'Your age', 'ymd'),
  ddiff({}, 'Days between', 'raw'), ddiff({}, 'Weeks and days', 'raw'), ddiff({}, 'Weeks and days', 'raw'), ddiff({}, 'Hours', 'inr'),
  ddiff({ from: '2026-03-01', to: '2026-06-01' }, 'Days between', 'raw'), 
  ddiff({ from: '2024-01-01', to: '2025-01-01' }, 'Days between', 'raw'), 
    addd({}, 'Resulting date', 'date'), addd({ start: '2026-01-31', amount: 1, unit: 'months' }, 'Resulting date', 'date'), addd({ start: '2026-03-15', dir: 'sub', amount: 90 }, 'Resulting date', 'date'),
  addd({ start: '2026-01-01', amount: 6, unit: 'weeks' }, 'Resulting date', 'date'), addd({ start: '2024-02-29', amount: 1, unit: 'years' }, 'Resulting date', 'date'),
  work({}, 'Working days', 'raw'), work({}, 'Weekend days', 'raw'), work({ holidays: 2 }, 'Working days', 'raw'),
  work({ from: '2026-02-01', to: '2026-02-28' }, 'Working days', 'raw'), work({ from: '2026-02-01', to: '2026-02-28' }, 'Weekend days', 'raw'),
  dur({}, 'Duration', 'raw'), dur({}, 'In decimal hours', 'num'), dur({}, 'In minutes', 'inr'),
  dur({ brk: 30 }, 'Duration', 'raw'), dur({ brk: 30 }, 'In decimal hours', 'num'), dur({ brk: 30 }, 'In minutes', 'inr'),
  dur({ sh: 8, sm: 45, eh: 18, em: 15, brk: 60 }, 'Duration', 'raw'), dur({ sh: 8, sm: 45, eh: 18, em: 15, brk: 60 }, 'In decimal hours', 'num'),
  // ---- health
  bmi({}, 'Your BMI', 'd1'), bmi({}, 'Healthy weight', 'raw'), bmi({ kg: 90, cm: 170 }, 'Your BMI', 'd1'), bmi({ kg: 90, cm: 170 }, 'Healthy weight', 'raw'),
  bmi({ kg: 50, cm: 170 }, 'Your BMI', 'd1'), bmi({ kg: 60, cm: 150 }, 'Your BMI', 'd1'), bmi({ kg: 60, cm: 150 }, 'Healthy weight', 'raw'),
  bmr({}, 'BMR (calories per day)', 'inr'), bmr({}, 'Per hour', 'inr'),
  ...['1.2', '1.375', '1.55', '1.725', '1.9'].map((act) => tdee({ act }, 'Maintain your weight', 'inr')),
  tdee({}, 'Lose about', 'inr'), tdee({}, 'Gain about', 'inr'),
  fat({}, 'Estimated body fat', 'd1'), fat({}, 'Fat mass', 'd1'), fat({}, 'Lean mass', 'd1'),
  fat({ sex: 'female', kg: 62, cm: 162, neck: 32, waist: 76, hip: 98 }, 'Fat mass', 'd1'), fat({ sex: 'female', kg: 62, cm: 162, neck: 32, waist: 76, hip: 98 }, 'Lean mass', 'd1'),
  ideal({}, 'Devine', 'd1'), ideal({}, 'Robinson', 'd1'), ideal({}, 'Healthy BMI range', 'raw'),
  ideal({ sex: 'female', cm: 162 }, 'Devine', 'd1'), ideal({ sex: 'female', cm: 162 }, 'Robinson', 'd1'), ideal({ sex: 'female', cm: 162 }, 'Healthy BMI range', 'raw'),
  water({}, 'Daily water target', 'num'), water({}, 'In glasses', 'raw'),
  water({ kg: 60, mins: 0 }, 'Daily water target', 'num'), water({ kg: 60, mins: 0 }, 'In glasses', 'raw'),
  water({ kg: 80, mins: 60 }, 'Daily water target', 'num'), water({ kg: 80, mins: 60 }, 'In glasses', 'raw'),
  // ---- pregnancy: the guide quotes the long dates without the weekday
  // ---- students
  cgpa({}, 'Percentage', 'num'), cgpa({ cgpa: 9 }, 'Percentage', 'num'), cgpa({ cgpa: 7.4 }, 'Percentage', 'num'), cgpa({ cgpa: 6.5 }, 'Percentage', 'num'),
  gpa({}, 'GPA', 'num'), gpa({}, 'Total grade points', 'num'), gpa({}, 'Total credits', 'raw'),
  gpa({ c1: 4, g1: 4, c2: 4, g2: 3, c3: 3, g3: 2, c4: 0, g4: 0, c5: 0, g5: 0 }, 'GPA', 'num'),
  marks({}, 'Percentage', 'num'), marks({}, 'Marks needed', 'raw'), marks({}, 'Marks short', 'raw'),
  marks({ got: 340, total: 400, target: 90 }, 'Percentage', 'num'), marks({ got: 340, total: 400, target: 90 }, 'Marks needed', 'raw'), marks({ got: 340, total: 400, target: 90 }, 'Marks short', 'raw'),
  marks({ got: 72, total: 80, target: 95 }, 'Percentage', 'num'), marks({ got: 72, total: 80, target: 95 }, 'Marks needed', 'raw'), marks({ got: 72, total: 80, target: 95 }, 'Marks short', 'raw'),
  attend({}, 'Your attendance', 'num'), attend({}, 'Classes to attend in a row', 'raw'),
  attend({ att: 80, held: 90 }, 'Your attendance', 'num'), attend({ att: 80, held: 90 }, 'Classes you can still miss', 'raw'),
  attend({ att: 30, held: 60, req: 80 }, 'Classes to attend in a row', 'raw'),
];

describe('guides quote the maths the calculators give', () => {
  it.each(CLAIMS.map((c) => [`${c[0]} ${c[1]} ${JSON.stringify(c[2])} ${c[3]}`, c] as const))('%s', (_name, [guide, calc, over, label, fmt]) => {
    const g = guideBySlug(guide);
    expect(g, `no guide ${guide}`).toBeDefined();
    const text = JSON.stringify(g);
    const raw = metricOf(calc, over, label);
    const shown = typeof raw === 'number' ? (FORMAT[fmt] as (v: number) => string)(raw) : (FORMAT[fmt] as (v: number | string) => string)(raw);
    expect(text, `${guide} should contain "${shown}" (${calc} ${label})`).toContain(shown);
  });

  it('quotes the ages, date gaps and weekdays in its own words', () => {
    const t = (slug: string) => JSON.stringify(guideBySlug(slug));
    expect(metricOf('age-calculator', { dob: '2000-02-29', asof: '2026-03-01' }, 'Your age')).toBe('26 years, 0 months, 0 days');
    expect(t('how-to-calculate-your-age')).toContain('turns 26 on 1 March 2026');
    expect(metricOf('date-difference-calculator', {}, 'In years, months and days')).toBe('0 years, 11 months, 24 days');
    expect(t('how-to-find-the-days-between-two-dates')).toContain('11 months and 24 days');
    expect(metricOf('date-difference-calculator', { from: '2026-03-01', to: '2026-06-01' }, 'In years, months and days')).toBe('0 years, 3 months, 0 days');
    expect(t('how-to-find-the-days-between-two-dates')).toContain('exactly 3 months');
    expect(metricOf('date-difference-calculator', { from: '2024-01-01', to: '2025-01-01' }, 'In years, months and days')).toBe('1 year, 0 months, 0 days');
    expect(t('how-to-find-the-days-between-two-dates')).toContain('1 year, 0 months and 0 days');
    // weekdays the add-days guide names
    expect(metricOf('add-days-calculator', {}, 'Resulting date')).toBe('Saturday, 11 April 2026');
    expect(t('how-to-add-or-subtract-days-from-a-date')).toContain('Saturday 11 April 2026');
    expect(metricOf('add-days-calculator', { start: '2026-03-15', dir: 'sub', amount: 90 }, 'Resulting date')).toBe('Monday, 15 December 2025');
    expect(t('how-to-add-or-subtract-days-from-a-date')).toContain('Monday 15 December 2025');
    expect(metricOf('add-days-calculator', { start: '2026-01-01', amount: 6, unit: 'weeks' }, 'Resulting date')).toBe('Thursday, 12 February 2026');
    expect(t('how-to-add-or-subtract-days-from-a-date')).toContain('Thursday 12 February 2026');
    // overnight shift
    expect(metricOf('time-duration-calculator', { sh: 22, sm: 0, eh: 6, em: 0 }, 'Duration')).toBe('8 hours 0 minutes');
    expect(t('how-to-calculate-time-duration')).toContain('the duration is 8 hours');
    // BMR for the woman in the example
    expect(metricOf('bmr-calculator', { sex: 'female', age: 28, kg: 60, cm: 162 }, 'BMR (calories per day)')).toBe(1311.5);
    expect(t('how-to-calculate-bmr')).toContain('1,311.5');
  });

  it('quotes the pregnancy dates the calculator gives', () => {
    const text = JSON.stringify(guideBySlug('how-a-pregnancy-due-date-is-calculated'));
    const due = (over: Values) => String(metricOf('pregnancy-due-date-calculator', over, 'Estimated due date'));
    const noDay = (s: string) => s.replace(/^[A-Za-z]+, /, '');
    expect(text).toContain(due({}).split(', ')[0]);
    expect(text).toContain(noDay(due({})));
    expect(text).toContain(noDay(due({ cycle: 32 })));
    expect(text).toContain(noDay(due({ cycle: 26 })));
    expect(text).toContain(noDay(String(metricOf('pregnancy-due-date-calculator', {}, 'Likely conception'))));
    expect(text).toContain(noDay(String(metricOf('pregnancy-due-date-calculator', {}, 'Second trimester starts'))));
    expect(text).toContain(noDay(String(metricOf('pregnancy-due-date-calculator', {}, 'Third trimester starts'))));
  });

  it('quotes the scientific and basic calculator examples correctly', () => {
    const text = JSON.stringify(guideBySlug('how-to-use-the-scientific-calculator'));
    const sums: [string, number][] = [['(2 + 3) * 4 + sqrt(16)', 24], ['2^10', 1024], ['sqrt(16)', 4], ['cbrt(27)', 3], ['log(1000)', 3], ['ln(e)', 1], ['5!', 120], ['27^(1/3)', 3], ['2^3^2', 512], ['-2^2', -4], ['(-2)^2', 4], ['2 + 3 * 4', 14], ['(2 + 3) * 4', 20], ['sin(180)', 0]];
    for (const [expr, value] of sums) expect(evaluate(expr, 'deg'), expr).toBeCloseTo(value, 9);
    expect(evaluate('sin(30)', 'deg')).toBeCloseTo(0.5, 12);
    for (const s of ['2^10 = 1,024', 'sqrt(16) = 4', 'cbrt(27) = 3', 'log(1000) = 3', 'ln(e) = 1', '5! = 120', '27^(1/3) = 3', 'sin(30) = 0.5', '2^3^2 is 2^9 = 512', '−2^2 is −4', '(2 + 3) × 4 is 20', '2 + 3 × 4 is 14']) expect(text, s).toContain(s);
    const basic = (over: Values) => String(metricOf('basic-calculator', over, ''));
    expect(basic({})).toBe('15,000');
    expect(basic({ a: 15, b: 2400, op: 'pct' })).toBe('360');
    expect(basic({ a: 17, b: 5, op: 'mod' })).toBe('2');
    expect(text).toContain('15,000');
    expect(text).toContain('15% of 2,400 is 360');
    expect(text).toContain('17 mod 5 is 2');
  });

  it('quotes the Sukanya Samriddhi figures worked by hand', () => {
    const t = JSON.stringify(guideBySlug('how-to-calculate-sukanya-samriddhi-maturity'));
    expect(Math.round(7_182_119.17 - 4_475_989.33)).toBe(2_706_130);
    for (const s of ['₹1,62,300', '₹27,06,130', '₹12,500', '₹2,49,471', '₹250', '₹1,50,000', '8.2%', '1 January 2024']) expect(t, s).toContain(s);
  });

  it('quotes the PPF figures worked by hand', () => {
    const t = JSON.stringify(guideBySlug('how-to-calculate-ppf-maturity'));
    for (const s of ['₹1,60,650', '₹1,23,610', '₹12,500', '₹22,50,000', '₹500', '₹1,50,000', '7.1%']) expect(t, s).toContain(s);
  });

  it('quotes the HRA figures worked by hand', () => {
    const t = JSON.stringify(guideBySlug('how-to-calculate-hra-exemption'));
    for (const s of ['₹6,00,000', '₹2,64,000', '₹2,40,000', '2,64,000 − 60,000', '₹1,80,000', '₹3,00,000', '₹2,04,000', '₹36,000', '₹1,20,000', '₹24,000', '₹96,000']) expect(t, s).toContain(s);
    for (const city of ['Mumbai', 'Kolkata', 'Delhi', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Bengaluru']) expect(t, city).toContain(city);
  });

  it('quotes the gratuity figures worked by hand, including the uncapped amount', () => {
    const t = JSON.stringify(guideBySlug('how-to-calculate-gratuity'));
    expect(Math.round((500_000 / 26) * 15 * 30)).toBe(8_653_846);
    for (const s of ['₹3,46,154', '₹34,615', '₹2,88,462', '₹28,846', '₹2,76,923', '₹2,42,308', '₹86,53,846', '₹20,00,000', '21 November 2025']) expect(t, s).toContain(s);
  });

  it('quotes the GST figures worked by hand, including the common mistake', () => {
    const t = JSON.stringify(guideBySlug('how-to-add-and-remove-gst'));
    expect(Math.round((11_800 * 18) / 100)).toBe(2_124);
    expect(11_800 - 2_124).toBe(9_676);
    for (const s of ['₹2,124', '₹9,676', '₹11,800', '₹10,000', '₹1,800', '₹1,050', '₹14,000', '₹2,100', '₹2,000']) expect(t, s).toContain(s);
    for (const s of ['5%', '18%', '40%', '22 September 2025']) expect(t, s).toContain(s);
  });

  it('quotes the tax figures worked by hand, and the break-even for deductions', () => {
    const t = JSON.stringify(guideBySlug('how-to-choose-old-or-new-tax-regime'));
    const nw = (salary: number) => incomeTax({ salary, other: 0, deductions: 0, age: 'u60', regime: 'new' });
    const od = (salary: number, deductions: number) => incomeTax({ salary, other: 0, deductions, age: 'u60', regime: 'old' });
    expect(nw(1_500_000).taxable).toBe(1_425_000);
    expect(Math.round(nw(1_000_000).slabTax)).toBe(32_500); // the slab tax the rebate then cancels
    expect(nw(1_000_000).total).toBe(0);
    expect(od(1_500_000, 150_000).taxable).toBe(1_300_000);
    // break-even: deductions at which the old regime costs the same as the new on a salary of 15 lakh
    expect(Math.round(od(1_500_000, 543_750).total)).toBe(Math.round(nw(1_500_000).total));
    expect(od(1_500_000, 540_000).total).toBeGreaterThan(nw(1_500_000).total);
    expect(od(1_500_000, 550_000).total).toBeLessThan(nw(1_500_000).total);
    for (const s of ['₹97,500', '₹2,10,600', '₹1,13,100', '₹65,000', '₹75,400', '₹26,000', '₹5,43,750', '₹32,500', '₹14,25,000', '₹13,00,000']) expect(t, s).toContain(s);
  });

  it('quotes the figures worked by hand in the text', () => {
    // simple interest turned round: R = I x 100 / (P x T), T = I x 100 / (P x R)
    expect((24000 * 100) / (100000 * 3)).toBe(8);
    expect((24000 * 100) / (100000 * 8)).toBe(3);

    const t = (slug: string) => JSON.stringify(guideBySlug(slug));
    // home loan: first month of interest and principal
    const home = Number(metricOf('home-loan-emi-calculator', {}, 'Monthly EMI'));
    const firstInterest = (5_000_000 * 0.085) / 12;
    expect(t('how-to-calculate-home-loan-emi')).toContain(FORMAT.inr(firstInterest));
    expect(t('how-to-calculate-home-loan-emi')).toContain(FORMAT.inr(home - firstInterest));
    // compounding gaps
    const amount = (freq: string) => Number(metricOf('compound-interest-calculator', { freq }, 'Amount after the period'));
    expect(t('how-compound-interest-works')).toContain(FORMAT.inr(amount('4') - amount('1')));
    expect(t('how-compound-interest-works')).toContain(FORMAT.inr(amount('365') - amount('12')));
    // car loan: the down payment saves about 52,000
    const interest = (principal: number) => Number(metricOf('car-loan-emi-calculator', { principal }, 'Total interest'));
    expect(Math.round((interest(800000) - interest(600000)) / 1000)).toBe(52);
    // a 10% step-up reaches about 2.4 times the first amount in year ten
    expect((1.1 ** 9).toFixed(1)).toBe('2.4');
    // the lumpsum grows about 1.76 times every five years at 12%
    expect((1.12 ** 5).toFixed(2)).toBe('1.76');
    // intro sums
    expect(Math.round(400 * 8.25)).toBe(3300);
  });

  it('counts down on a fixed clock as the countdown guide says', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 11, 1, 12, 0));
    expect(metricOf('countdown-timer', { target: '2027-01-01' }, 'Time left')).toBe('30 days 12 hours 0 minutes');
    expect(metricOf('countdown-timer', { target: '2027-01-01' }, 'Total hours')).toBe(732);
    expect(metricOf('countdown-timer', { target: '2027-01-01' }, 'Weeks and days')).toBe('4 weeks 2 days');
    const text = JSON.stringify(guideBySlug('how-to-count-down-to-a-date'));
    for (const s of ['30 days 12 hours', '732 hours', '4 weeks and 2 days']) expect(text, s).toContain(s);
  });
  afterEach(() => vi.useRealTimers());

  it('quotes the US tax figures worked by hand', () => {
    const t = (slug: string) => JSON.stringify(guideBySlug(slug));
    const tax = t('how-to-calculate-us-federal-income-tax');
    const r = usIncomeTax({ income: 75_000, status: 'single', itemized: 0 });
    expect(r.bands.map((b) => b.tax)).toEqual([1_240, 4_560, 1_870]);
    for (const s of ['$16,100', '$32,200', '$24,150', '$12,400', '$38,000', '$8,500', '$1,240', '$4,560', '$1,870', '$50,400', '13.17%', '22%', '$3,058']) expect(tax, s).toContain(s);
    expect(usIncomeTax({ income: 100_000, status: 'single', itemized: 0 }).tax - usIncomeTax({ income: 100_000, status: 'single', itemized: 30_000 }).tax).toBe(3_058);
    const pay = t('how-to-calculate-us-take-home-pay');
    const p75 = usPayrollTax(75_000, 'single');
    expect([p75.socialSecurity, p75.medicare, p75.total + r.tax]).toEqual([4_650, 1_087.5, 13_407.5]);
    for (const s of ['$4,650', '$1,087.50', '$13,407.50', '$184,500', '$200,000', '$250,000', '$125,000']) expect(pay, s).toContain(s);
    const p250 = usPayrollTax(250_000, 'single');
    [p250.socialSecurity, p250.medicare, p250.additionalMedicare, p250.total].forEach((x, i) => expect(x).toBeCloseTo([11_439, 3_625, 450, 15_514][i]!, 6));
    for (const s of ['$11,439', '$3,625', '$450', '$50,000']) expect(pay, s).toContain(s);
    const p120 = usPayrollTax(120_000, 'mfj');
    expect(p120.total).toBe(9_180);
    expect(pay).toContain('$9,180');
  });

  it('quotes the UK tax figures worked by hand', () => {
    const t = (slug: string) => JSON.stringify(guideBySlug(slug));
    const tax = t('how-to-calculate-uk-income-tax');
    const sco = ukIncomeTax({ income: 50_000, region: 'sco' });
    expect(sco.bands.map((b) => b.income)).toEqual([3_967, 12_989, 14_136, 6_338]);
    for (const s of ['£12,570', '£37,700', '£125,140', '£100,000', '£37,430', '£17,430', '£3,486', '£7,540', '£25,892', '£64,730', '£7,570', '£5,000', '£3,967', '£12,989', '£14,136', '£6,338', '£1,496.05']) expect(tax, s).toContain(s);
    expect(ukIncomeTax({ income: 110_000, region: 'eng' }).marginal).toBeCloseTo(0.6, 10);
    const pay = t('how-to-calculate-uk-take-home-pay');
    expect(ukNationalInsurance(110_000).total).toBeCloseTo(4_210.6, 6);
    for (const s of ['£12,570', '£50,270', '£10,480.40', '£3,016', '£59,730', '£1,194.60', '£4,210.60', '£33,432']) expect(pay, s).toContain(s);
  });

  it('quotes the Canada tax figures worked by hand', () => {
    const t = (slug: string) => JSON.stringify(guideBySlug(slug));
    const tax = t('how-to-calculate-canadian-federal-income-tax');
    const r = caFederalTax(60_000, 16_452);
    expect(r.bands[0]!.tax).toBeCloseTo(8_193.22, 6);
    expect(r.bands[1]!.tax).toBeCloseTo(302.785, 6); // written $302.79, half a cent rounded up
    for (const s of ['$58,523', '$117,045', '$181,440', '$258,482', '$16,452', '$14,829', '$2,303.28', '$8,193.22', '$302.79', '$8,496.01', '$6,192.73', '$4,200', '$41,477', '$16,696.01']) expect(tax, s).toContain(s);
    const pay = t('how-to-calculate-canadian-take-home-pay');
    const e = caEmployeeTax(60_000);
    expect([e.payroll.cpp, Math.round(e.payroll.ei * 100) / 100, e.payroll.cpp2]).toEqual([3_361.75, 978, 0]);
    expect(Math.round(e.tax + e.payroll.total)).toBe(9_678);
    const e90 = caEmployeeTax(90_000);
    expect([e90.payroll.cpp, e90.payroll.cpp2, e90.payroll.ei]).toEqual([4_230.45, 416, 1_123.07]);
    for (const s of ['$3,500', '$74,600', '$85,000', '$68,900', '$3,361.75', '$9,678', '$10,400', '$416', '$4,230.45', '$1,123.07']) expect(pay, s).toContain(s);
  });

  it('quotes the Australia tax figures worked by hand', () => {
    const t = (slug: string) => JSON.stringify(guideBySlug(slug));
    const tax = t('how-to-calculate-australian-income-tax');
    const r = auTax(60_000);
    expect([r.gross, r.offset, r.tax, r.medicare, r.total]).toEqual([8_520, 100, 8_420, 1_200, 9_620]);
    expect(r.bands.map((b) => [b.rate, b.income, b.tax])).toEqual([[0, 18_200, 0], [0.15, 26_800, 4_020], [0.3, 15_000, 4_500]]);
    const low = auTax(30_000);
    expect([low.gross, low.offset, low.tax, low.bands[1]!.income]).toEqual([1_770, 700, 1_070, 11_800]);
    expect(low.medicare).toBeCloseTo(198.9, 6);
    const high = auTax(100_000);
    expect([high.gross, high.offset, high.tax, high.medicare, high.total]).toEqual([20_520, 0, 20_520, 2_000, 22_520]);
    expect(high.bands.map((b) => [b.income, b.tax]).slice(1)).toEqual([[26_800, 4_020], [55_000, 16_500]]);
    for (const s of ['$18,200', '$45,000', '$135,000', '$190,000', '$700', '$37,500', '$66,667', '$8,520', '$8,420', '$1,200', '$9,620', '$4,020', '$4,500', '$100', '$1,770', '$1,070', '$11,800', '$28,011', '$20,520', '$16,500', '$26,800', '$55,000', '$22,520', '$2,000']) expect(tax, s).toContain(s);
    const pay = t('how-to-calculate-australian-take-home-pay');
    const forty = auTax(40_000);
    expect([forty.gross, forty.offset, forty.tax, forty.medicare]).toEqual([3_270, 575, 2_695, 800]);
    expect(Math.round((40_000 - forty.total) / 12)).toBe(3_042);
    for (const s of ['$8,520', '$8,420', '$1,200', '$9,620', '$50,380', '$4,198', '$2,695', '$575', '$800', '$36,505', '$3,042', '$20,520', '$2,000', '$77,480', '$6,457', '$28,011']) expect(pay, s).toContain(s);
  });

  it('links every live calculator from at least one guide', () => {
    const covered = new Set(GUIDES.flatMap((g) => g.calcs));
    const missing = CALCULATORS.map((c) => c.slug).filter((s) => !covered.has(s));
    expect(missing).toEqual([]);
  });
});

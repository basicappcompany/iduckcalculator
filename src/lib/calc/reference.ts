import { calcBySlug, defaultValues } from './index';
import { evaluate, showNumber } from './expr';
import { formatNumber } from '../format';
import type { Values } from './types';

/**
 * A reference table for each calculator: the kind of "EMI per ₹1 lakh" or "CGPA to percentage" table people search for. Every cell is
 * worked out by calling the calculator itself at build time, so a table can never disagree with the tool (tests/unit/reference.test.ts
 * also spot-checks known values). Cells are plain text so the table reads without JavaScript.
 */
export interface Reference {
  /** A question-style heading, for example "What is the EMI on ₹1 lakh?" */
  question: string;
  /** One line under the heading: what the table assumes. */
  note: string;
  columns: string[];
  rows: string[][];
}

const metric = (slug: string, over: Values, label: string): number | string => {
  const def = calcBySlug(slug)!;
  const r = def.compute({ ...defaultValues(def), ...over });
  if (r.error) throw new Error(`${slug} ${JSON.stringify(over)}: ${r.error}`);
  const m = r.metrics.find((x) => x.label === label || x.label.startsWith(label));
  if (!m) throw new Error(`${slug}: no metric "${label}"`);
  return m.value;
};
const n = (slug: string, over: Values, label: string): number => Number(metric(slug, over, label));
const s = (slug: string, over: Values, label: string): string => String(metric(slug, over, label));

const inr = (v: number) => formatNumber(Math.round(v), 0, 'en-IN');
const rs = (v: number) => `₹${inr(v)}`;
const usd = (v: number) => `$${formatNumber(Math.round(v), 0, 'en-US')}`;
const gbp = (v: number) => `£${formatNumber(Math.round(v), 0, 'en-GB')}`;
const pct = (v: number, dp = 2) => `${String(Math.round(v * 10 ** dp) / 10 ** dp)}%`;
const noDay = (d: string) => d.replace(/^[A-Za-z]+, /, '');
const yrs = (y: number) => `${y} year${y === 1 ? '' : 's'}`;

/** A grid: one row per `rows` value, one column per `cols` value, each cell a formatted calculator result. */
function grid<R, C>(o: {
  question: string;
  note: string;
  corner: string;
  rows: R[];
  cols: C[];
  rowLabel: (r: R) => string;
  colLabel: (c: C) => string;
  cell: (r: R, c: C) => string;
}): Reference {
  return {
    question: o.question,
    note: o.note,
    columns: [o.corner, ...o.cols.map(o.colLabel)],
    rows: o.rows.map((r) => [o.rowLabel(r), ...o.cols.map((c) => o.cell(r, c))]),
  };
}

const emiGrid = (slug: string, principal: number, rates: number[], tenures: number[], question: string, note: string): Reference =>
  grid({ question, note, corner: 'Interest rate', rows: rates, cols: tenures, rowLabel: (r) => `${r}%`, colLabel: yrs, cell: (r, t) => rs(n(slug, { principal, rate: r, tenure: t, tenureUnit: 'years' }, 'Monthly EMI')) });

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const iso = (y: number, m0: number, d: number) => `${y}-${String(m0 + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const lastDay = (y: number, m0: number) => new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate();

const TABLES: Record<string, () => Reference> = {
  // ---- loans
  'emi-calculator': () => emiGrid('emi-calculator', 100000, [7, 8, 9, 10, 11, 12], [5, 10, 15, 20], 'What is the EMI on ₹1 lakh?', 'Monthly EMI on a loan of ₹1,00,000. Multiply by the number of lakhs you borrow.'),
  'home-loan-emi-calculator': () => emiGrid('home-loan-emi-calculator', 5000000, [7, 7.5, 8, 8.5, 9, 9.5], [10, 15, 20, 25], 'What is the EMI on a ₹50 lakh home loan?', 'Monthly EMI on a home loan of ₹50,00,000.'),
  'car-loan-emi-calculator': () => emiGrid('car-loan-emi-calculator', 800000, [8, 9, 10, 11, 12], [3, 4, 5, 7], 'What is the EMI on an ₹8 lakh car loan?', 'Monthly EMI on a car loan of ₹8,00,000.'),
  'personal-loan-emi-calculator': () => emiGrid('personal-loan-emi-calculator', 300000, [10, 12, 14, 16, 18], [1, 2, 3, 5], 'What is the EMI on a ₹3 lakh personal loan?', 'Monthly EMI on a personal loan of ₹3,00,000.'),
  'loan-prepayment-calculator': () => ({
    question: 'How much interest does an extra monthly payment save?',
    note: 'For a ₹10,00,000 loan at 9% over 20 years, with the extra amount paid every month on top of the EMI.',
    columns: ['Extra every month', 'Interest saved', 'Loan ends after'],
    rows: [1000, 2000, 5000, 10000, 20000].map((extra) => [rs(extra), rs(n('loan-prepayment-calculator', { extra }, 'Interest saved')), s('loan-prepayment-calculator', { extra }, 'New loan length')]),
  }),
  'loan-eligibility-calculator': () => ({
    question: 'How much loan can I get on my income?',
    note: 'With no other EMIs, 50% of income allowed for EMIs, 8.5% interest and 20 years. An estimate: lenders also check your credit score and more.',
    columns: ['Monthly take-home income', 'Affordable EMI', 'Estimated loan'],
    rows: [30000, 50000, 75000, 100000, 150000, 200000].map((income) => [rs(income), rs(n('loan-eligibility-calculator', { income }, 'Affordable EMI')), rs(n('loan-eligibility-calculator', { income }, 'Estimated eligible loan'))]),
  }),
  // ---- savings and investing
  'sip-calculator': () => grid({ question: 'How much does a monthly SIP grow to?', note: 'Maturity value at an assumed 12% a year. Returns are not guaranteed.', corner: 'Monthly SIP', rows: [1000, 2000, 5000, 10000, 15000, 25000], cols: [5, 10, 15, 20], rowLabel: rs, colLabel: yrs, cell: (m, y) => rs(n('sip-calculator', { monthly: m, years: y }, 'Maturity value')) }),
  'lumpsum-calculator': () => grid({ question: 'What does a lumpsum investment grow to?', note: 'Maturity value at an assumed 12% a year. Returns are not guaranteed.', corner: 'Amount invested', rows: [10000, 50000, 100000, 500000, 1000000], cols: [5, 10, 15, 20], rowLabel: rs, colLabel: yrs, cell: (a, y) => rs(n('lumpsum-calculator', { amount: a, years: y }, 'Maturity value')) }),
  'step-up-sip-calculator': () => grid({ question: 'How much does a step-up SIP add?', note: 'Maturity value after 10 years at an assumed 12% a year, for each starting SIP and yearly increase.', corner: 'Starting SIP', rows: [5000, 10000, 25000], cols: [0, 5, 10], rowLabel: rs, colLabel: (p) => (p === 0 ? 'Flat (no step-up)' : `Up ${p}% a year`), cell: (m, p) => rs(n('step-up-sip-calculator', { monthly: m, step: p }, 'Maturity value')) }),
  'swp-calculator': () => ({
    question: 'How long does ₹50 lakh last with a monthly withdrawal?',
    note: 'A starting investment of ₹50,00,000 at an assumed 8% a year, over 20 years.',
    columns: ['Monthly withdrawal', 'Total withdrawn', 'What is left'],
    rows: [30000, 40000, 50000, 60000].map((w) => {
      const def = calcBySlug('swp-calculator')!;
      const r = def.compute({ ...defaultValues(def), withdraw: w });
      const first = r.metrics[0]!;
      return [rs(w), rs(n('swp-calculator', { withdraw: w }, 'Total withdrawn')), first.label.startsWith('Balance') ? `${rs(Number(first.value))} left after 20 years` : `Runs out after ${first.value}`];
    }),
  }),
  'fd-calculator': () => grid({ question: 'What does ₹1 lakh become in a fixed deposit?', note: 'Maturity value of ₹1,00,000 with interest compounded quarterly.', corner: 'Tenure', rows: [1, 2, 3, 5, 10], cols: [6, 6.5, 7, 7.5, 8], rowLabel: yrs, colLabel: (r) => `${r}%`, cell: (y, r) => rs(n('fd-calculator', { years: y, rate: r, freq: '4' }, 'Maturity value')) }),
  'rd-calculator': () => grid({ question: 'What does a recurring deposit mature at?', note: 'Maturity value at 7% a year, with interest compounded quarterly.', corner: 'Monthly deposit', rows: [1000, 2000, 5000, 10000], cols: [12, 24, 36, 60], rowLabel: rs, colLabel: (m) => `${m} months`, cell: (d, m) => rs(n('rd-calculator', { monthly: d, months: m }, 'Maturity value')) }),
  'compound-interest-calculator': () => ({
    question: 'How does compounding frequency change the result?',
    note: '₹1,00,000 at 10% a year for 5 years. Simple interest would give ₹50,000.',
    columns: ['Compounded', 'Amount after 5 years', 'Interest earned'],
    rows: ([['1', 'Yearly'], ['2', 'Half-yearly'], ['4', 'Quarterly'], ['12', 'Monthly'], ['365', 'Daily']] as const).map(([freq, name]) => [name, rs(n('compound-interest-calculator', { freq }, 'Amount after')), rs(n('compound-interest-calculator', { freq }, 'Compound interest earned'))]),
  }),
  'simple-interest-calculator': () => grid({ question: 'How much simple interest does ₹1 lakh earn?', note: 'Simple interest on ₹1,00,000, at each yearly rate.', corner: 'Time', rows: [1, 2, 3, 5, 10], cols: [6, 8, 10, 12], rowLabel: yrs, colLabel: (r) => `${r}%`, cell: (y, r) => rs(n('simple-interest-calculator', { years: y, rate: r }, 'Simple interest')) }),
  'cagr-calculator': () => grid({ question: 'What CAGR does it take to grow your money?', note: 'The yearly growth rate needed to turn the amount into the multiple shown in the given time.', corner: 'Growth to', rows: [1.5, 2, 3, 5], cols: [3, 5, 7, 10], rowLabel: (m) => `${m} times`, colLabel: yrs, cell: (m, y) => pct(n('cagr-calculator', { start: 10000, end: 10000 * m, years: y }, 'CAGR')) }),
  'inflation-calculator': () => grid({ question: 'What will ₹1 lakh of goods cost after inflation?', note: 'The future cost of something that costs ₹1,00,000 today.', corner: 'Inflation', rows: [4, 5, 6, 7, 8], cols: [5, 10, 20], rowLabel: (r) => `${r}% a year`, colLabel: yrs, cell: (r, y) => rs(n('inflation-calculator', { inflation: r, years: y }, 'Same things will cost')) }),
  'retirement-calculator': () => ({
    question: 'What retirement corpus do I need?',
    note: 'For someone aged 35 who retires at 60 and plans to 85, with 6% inflation, 10% return before and 8% after retirement.',
    columns: ['Monthly expenses today', 'Corpus needed at 60', 'Monthly SIP to build it'],
    rows: [30000, 50000, 75000, 100000].map((expense) => [rs(expense), rs(n('retirement-calculator', { expense }, 'Corpus needed')), rs(n('retirement-calculator', { expense }, 'Monthly SIP'))]),
  }),
  'income-tax-calculator': () => ({
    question: 'What tax do I pay at common salaries?',
    note: 'Tax year 2026-27 for a resident individual below 60 with salary only. The old regime column assumes ₹1,50,000 of deductions. Tax includes the rebate and 4% cess.',
    columns: ['Salary per year', 'New regime', 'Old regime'],
    rows: [500000, 750000, 1000000, 1275000, 1500000, 2000000, 3000000].map((salary) => [rs(salary), rs(n('income-tax-calculator', { salary }, 'Tax in the new')), rs(n('income-tax-calculator', { salary }, 'Tax in the old'))]),
  }),
  'gst-calculator': () => grid({ question: 'How much GST is charged on common prices?', note: 'The GST added to a price before GST, at the main rates: 5% merit, 18% standard and 40% special.', corner: 'Price before GST', rows: [100, 500, 1000, 5000, 10000, 50000], cols: [5, 18, 40], rowLabel: rs, colLabel: (r) => `${r}%`, cell: (a, r) => rs(n('gst-calculator', { mode: 'add', amount: a, rate: r }, 'GST amount')) }),
  'gratuity-calculator': () => grid({ question: 'What gratuity do common wages and years of service give?', note: 'Monthly wages (basic pay plus dearness allowance) and completed years of service, for a retirement or resignation. The maximum payable is ₹20 lakh.', corner: 'Monthly wages', rows: [30000, 50000, 75000, 100000, 150000], cols: [5, 10, 15, 20, 30], rowLabel: rs, colLabel: yrs, cell: (w, y) => rs(n('gratuity-calculator', { basic: w, total: w, years: y, months: 0 }, 'Gratuity')) }),
  'hra-calculator': () => grid({ question: 'How much HRA is exempt for common basic pay and rent?', note: 'Per month, for 12 months in a metro city, with HRA received equal to 40% of basic pay. HRA is exempt only in the old tax regime.', corner: 'Monthly basic pay', rows: [20000, 30000, 50000, 75000, 100000], cols: [10000, 20000, 30000, 40000], rowLabel: rs, colLabel: (r) => `Rent ${rs(r)}`, cell: (b, r) => rs(n('hra-calculator', { basic: b, hra: b * 0.4, rent: r, city: 'metro', months: 12 }, 'HRA exempt')) }),
  'ppf-calculator': () => grid({ question: 'What does a PPF account grow to?', note: 'Maturity value at 7.1% a year, with one deposit a year on or before 5 April. The rate can change every quarter.', corner: 'Invested each year', rows: [10000, 50000, 100000, 150000], cols: [15, 20, 25, 30], rowLabel: rs, colLabel: yrs, cell: (a, y) => rs(n('ppf-calculator', { yearly: a, years: y, pattern: 'yearly', rate: 7.1 }, 'Maturity value')) }),
  'sukanya-samriddhi-calculator': () => grid({ question: 'What does a Sukanya Samriddhi account grow to?', note: 'Balance at 8.2% a year, with one deposit a year on or before 5 April for 15 years. The rate can change every quarter.', corner: 'Invested each year', rows: [10000, 50000, 100000, 150000], cols: [15, 18, 21], rowLabel: rs, colLabel: yrs, cell: (a, y) => rs(n('sukanya-samriddhi-calculator', { yearly: a, pattern: 'yearly', depositYears: 15, years: y, rate: 8.2 }, 'Maturity value')) }),
  'us-income-tax-calculator': () => ({
    question: 'How much federal income tax do I owe at common incomes?',
    note: 'Tax year 2026, ordinary income only, with the standard deduction and no credits. Rounded to the dollar.',
    columns: ['Income per year', 'Single', 'Married filing jointly', 'Head of household'],
    rows: [30000, 50000, 75000, 100000, 150000, 250000].map((income) => [usd(income), ...(['single', 'mfj', 'hoh'] as const).map((status) => usd(n('us-income-tax-calculator', { income, status }, 'Federal income tax')))]),
  }),
  'us-take-home-pay-calculator': () => ({
    question: 'What is my take-home pay at common salaries?',
    note: 'Tax year 2026 for a single filer with the standard deduction: salary minus federal income tax, Social Security and Medicare. State and local taxes and benefits are not included.',
    columns: ['Salary per year', 'Take-home per year', 'Take-home per month', 'Share you keep'],
    rows: [40000, 60000, 75000, 100000, 150000, 250000].map((salary) => [usd(salary), usd(n('us-take-home-pay-calculator', { salary }, 'Take-home pay per year')), usd(n('us-take-home-pay-calculator', { salary }, 'Take-home pay per month')), pct(n('us-take-home-pay-calculator', { salary }, 'Share of your pay'), 1)]),
  }),
  'uk-income-tax-calculator': () => ({
    question: 'How much Income Tax do I pay at common incomes?',
    note: 'Tax year 2026 to 2027, with the standard Personal Allowance and no other reliefs. Rounded to the pound.',
    columns: ['Income per year', 'England, Wales and Northern Ireland', 'Scotland'],
    rows: [25000, 35000, 50000, 75000, 100000, 125140].map((income) => [gbp(income), ...(['eng', 'sco'] as const).map((region) => gbp(n('uk-income-tax-calculator', { income, region }, 'Income Tax')))]),
  }),
  'uk-take-home-pay-calculator': () => ({
    question: 'What is my take-home pay at common salaries?',
    note: 'Tax year 2026 to 2027 in England, Wales or Northern Ireland: salary minus Income Tax and employee National Insurance. Pensions, student loans and benefits are not included.',
    columns: ['Salary per year', 'Take-home per year', 'Take-home per month', 'Share you keep'],
    rows: [25000, 35000, 50000, 75000, 100000, 150000].map((salary) => [gbp(salary), gbp(n('uk-take-home-pay-calculator', { salary }, 'Take-home pay per year')), gbp(n('uk-take-home-pay-calculator', { salary }, 'Take-home pay per month')), pct(n('uk-take-home-pay-calculator', { salary }, 'Share of your pay'), 1)]),
  }),
  // ---- everyday maths
  'percentage-calculator': () => ({
    question: 'What are common percentages of 1,200 and 5,000?',
    note: 'X% of the number, worked out as X ÷ 100 × the number.',
    columns: ['Percentage', 'Of 1,200', 'Of 5,000'],
    rows: [5, 10, 12.5, 15, 18, 20, 25, 50].map((p) => [`${p}%`, showNumber(n('percentage-calculator', { mode: 'of', x: p, y: 1200 }, '')), showNumber(n('percentage-calculator', { mode: 'of', x: p, y: 5000 }, ''))]),
  }),
  'percentage-change-calculator': () => ({
    question: 'What is the percentage change between common values?',
    note: 'Percentage change = (new − old) ÷ old × 100. A negative result is a fall.',
    columns: ['Old value', 'New value', 'Change'],
    rows: ([[80, 100], [100, 80], [50, 75], [200, 150], [1000, 1200], [1200, 1000]] as const).map(([from, to]) => {
      const def = calcBySlug('percentage-change-calculator')!;
      const m = def.compute({ from, to }).metrics[0]!;
      const v = Number(m.value);
      return [showNumber(from), showNumber(to), `${m.label.includes('decrease') ? '−' : '+'}${showNumber(v)}%`];
    }),
  }),
  'discount-calculator': () => grid({ question: 'What is the final price after a discount?', note: 'The price you pay after one discount of the given percentage.', corner: 'Original price', rows: [500, 1000, 2000, 5000], cols: [10, 20, 25, 30, 40, 50], rowLabel: rs, colLabel: (d) => `${d}% off`, cell: (p, d) => rs(n('discount-calculator', { price: p, d1: d, d2: 0 }, 'You pay')) }),
  'profit-loss-calculator': () => ({
    question: 'What are the profit, loss and margin for common prices?',
    note: 'Profit percentage is on the cost price. Margin is on the selling price. A negative margin is a loss.',
    columns: ['Cost price', 'Selling price', 'Profit or loss', 'Percentage on cost', 'Margin'],
    rows: ([[800, 1000], [500, 650], [250, 300], [1200, 900]] as const).map(([cost, sell]) => {
      const def = calcBySlug('profit-loss-calculator')!;
      const r = def.compute({ cost, sell });
      const [a, b, c] = r.metrics;
      const sign = a!.label.startsWith('Loss') ? '−' : '';
      return [rs(cost), rs(sell), `${sign}${rs(Number(a!.value))}`, `${sign}${showNumber(Number(b!.value))}%`, `${showNumber(Number(c!.value))}%`];
    }),
  }),
  'average-calculator': () => ({
    question: 'What are the mean, median and mode of a list?',
    note: 'Three example lists. The mode is the most common value; "none" means no value repeats.',
    columns: ['Numbers', 'Mean', 'Median', 'Mode'],
    rows: ['12, 18, 24, 30, 36', '4, 8, 8, 10, 15, 20', '40, 55, 62, 70, 90'].map((list) => [list, showNumber(n('average-calculator', { list }, 'Mean')), showNumber(n('average-calculator', { list }, 'Median')), s('average-calculator', { list }, 'Mode').replace('No repeated value', 'none')]),
  }),
  'ratio-calculator': () => ({
    question: 'What do common ratios simplify to?',
    note: 'A ratio in lowest terms, and A ÷ B as a decimal.',
    columns: ['Ratio', 'Simplest form', 'As a decimal'],
    rows: ([[12, 18], [25, 100], [45, 60], [8, 12], [100, 250]] as const).map(([a, b]) => [`${a} : ${b}`, s('ratio-calculator', { a, b }, 'Simplest ratio'), showNumber(n('ratio-calculator', { a, b }, 'A ÷ B'))]),
  }),
  'fraction-calculator': () => ({
    question: 'What are common fractions as decimals and percentages?',
    note: 'Each fraction in lowest terms, as a decimal and as a percentage.',
    columns: ['Fraction', 'Decimal', 'Percentage'],
    rows: ([[1, 8], [1, 5], [1, 4], [1, 3], [3, 8], [1, 2], [2, 3], [3, 4]] as const).map(([a, b]) => {
      const dec = n('fraction-calculator', { n1: a, d1: b, op: 'add', n2: 0, d2: 1 }, 'Decimal');
      return [`${a}/${b}`, String(Math.round(dec * 10000) / 10000), pct(dec * 100, 1)];
    }),
  }),
  'basic-calculator': () => ({
    question: 'What do the basic operations give?',
    note: 'Examples of each operation the calculator offers.',
    columns: ['Operation', 'Example', 'Answer'],
    rows: ([
      ['Add', 125, 'add', 75, '125 + 75'], ['Subtract', 10, 'sub', 4, '10 − 4'], ['Multiply', 1250, 'mul', 12, '1,250 × 12'], ['Divide', 1, 'div', 3, '1 ÷ 3'],
      ['Power', 2, 'pow', 10, '2 ^ 10'], ['Remainder', 17, 'mod', 5, '17 mod 5'], ['Percent of', 15, 'pct', 2400, '15% of 2,400'],
    ] as const).map(([name, a, op, b, text]) => [name, text, s('basic-calculator', { a, op, b }, '')]),
  }),
  'scientific-calculator': () => ({
    question: 'What are the values of common functions?',
    note: 'Worked out in degrees where an angle is involved.',
    columns: ['Expression', 'Value'],
    rows: ['sin(30)', 'cos(60)', 'tan(45)', 'sqrt(2)', 'cbrt(27)', 'log(1000)', 'ln(e)', '5!', '2^10', 'pi'].map((e) => [e, showNumber(evaluate(e, 'deg'))]),
  }),
  // ---- dates and time
  'age-calculator': () => ({
    question: 'How many days old is someone at a given age?',
    note: 'Days lived by a person born on 1 January 2000, on their birthday. Leap days are counted.',
    columns: ['Age', 'Days lived'],
    rows: [1, 5, 10, 18, 21, 25, 30, 40, 50, 60].map((age) => [yrs(age), inr(n('date-difference-calculator', { from: '2000-01-01', to: iso(2000 + age, 0, 1) }, 'Days between'))]),
  }),
  'date-difference-calculator': () => ({
    question: 'How many days are in common periods?',
    note: 'Counted from 1 January 2026 to the date shown, on the real calendar.',
    columns: ['Period', 'Ends on', 'Days', 'Weeks and days'],
    rows: ([['1 month', '2026-02-01'], ['3 months', '2026-04-01'], ['6 months', '2026-07-01'], ['1 year', '2027-01-01'], ['2 years', '2028-01-01']] as const).map(([name, to]) => [name, to, inr(n('date-difference-calculator', { from: '2026-01-01', to }, 'Days between')), s('date-difference-calculator', { from: '2026-01-01', to }, 'Weeks and days')]),
  }),
  'add-days-calculator': () => ({
    question: 'What date is a number of days after 1 January 2026?',
    note: 'Start date 1 January 2026, adding the days shown.',
    columns: ['Days added', 'Resulting date'],
    rows: [30, 60, 90, 100, 180, 365].map((amount) => [String(amount), s('add-days-calculator', { start: '2026-01-01', amount, unit: 'days', dir: 'add' }, 'Resulting date')]),
  }),
  'working-days-calculator': () => ({
    question: 'How many working days are in each month of 2026?',
    note: 'Monday to Friday, before any public holidays.',
    columns: ['Month', 'Calendar days', 'Working days'],
    rows: MONTHS.map((name, m0) => {
      const over = { from: iso(2026, m0, 1), to: iso(2026, m0, lastDay(2026, m0)), holidays: 0 };
      return [name, String(lastDay(2026, m0)), s('working-days-calculator', over, 'Working days')];
    }),
  }),
  'time-duration-calculator': () => ({
    question: 'How do minutes convert to decimal hours?',
    note: 'Divide the minutes by 60. Useful for timesheets.',
    columns: ['Minutes', 'Decimal hours'],
    rows: [5, 10, 15, 20, 30, 45, 50].map((em) => [String(em), (Math.round(n('time-duration-calculator', { sh: 0, sm: 0, eh: 0, em, brk: 0 }, 'In decimal hours') * 100) / 100).toFixed(2)]),
  }),
  'countdown-timer': () => ({
    question: 'How many hours are in common periods?',
    note: 'Whole days of 24 hours each.',
    columns: ['Period', 'Days', 'Hours'],
    rows: ([['1 day', 1], ['1 week', 7], ['30 days', 30], ['90 days', 90], ['365 days', 365]] as const).map(([name, d]) => [name, String(d), inr(d * 24)]),
  }),
  // ---- health
  'bmi-calculator': () => ({
    question: 'What is a healthy weight for my height?',
    note: 'The weights that give a BMI of 18.5 to 24.9, the WHO normal range. A general guide, not medical advice.',
    columns: ['Height', 'Healthy weight range'],
    rows: [150, 155, 160, 165, 170, 175, 180, 185, 190].map((cm) => [`${cm} cm`, s('bmi-calculator', { cm, kg: 70 }, 'Healthy weight')]),
  }),
  'bmr-calculator': () => ({
    question: 'What is the BMR for different weights?',
    note: 'Calories a day at rest, for a 30-year-old who is 170 cm tall. A general estimate, not medical advice.',
    columns: ['Weight', 'Men', 'Women'],
    rows: [50, 60, 70, 80, 90].map((kg) => [`${kg} kg`, inr(n('bmr-calculator', { sex: 'male', age: 30, kg, cm: 170 }, 'BMR')), inr(n('bmr-calculator', { sex: 'female', age: 30, kg, cm: 170 }, 'BMR'))]),
  }),
  'tdee-calculator': () => ({
    question: 'How many calories do I need at each activity level?',
    note: 'Calories a day for a 30-year-old man, 70 kg and 175 cm. A general estimate, not medical advice.',
    columns: ['Activity level', 'Maintain weight', 'Lose about 0.5 kg a week', 'Gain about 0.5 kg a week'],
    rows: ([['1.2', 'Sedentary'], ['1.375', 'Light'], ['1.55', 'Moderate'], ['1.725', 'Active'], ['1.9', 'Very active']] as const).map(([act, name]) => [
      `${name} (×${act})`, inr(n('tdee-calculator', { act }, 'Maintain')), inr(n('tdee-calculator', { act }, 'Lose')), inr(n('tdee-calculator', { act }, 'Gain')),
    ]),
  }),
  'body-fat-calculator': () => ({
    question: 'How does waist size change body fat?',
    note: 'For a man 175 cm tall, 70 kg, with a 38 cm neck. A tape estimate can be several points off. General information, not medical advice.',
    columns: ['Waist', 'Estimated body fat', 'Fat mass'],
    rows: [75, 80, 85, 90, 95, 100].map((waist) => [`${waist} cm`, pct(n('body-fat-calculator', { sex: 'male', waist }, 'Estimated body fat'), 1), `${(Math.round(n('body-fat-calculator', { sex: 'male', waist }, 'Fat mass') * 10) / 10).toFixed(1)} kg`]),
  }),
  'ideal-weight-calculator': () => ({
    question: 'What is the ideal weight for my height?',
    note: 'The Devine formula for men and women, and the healthy BMI range. A general guide, not medical advice.',
    columns: ['Height', 'Devine, men', 'Devine, women', 'Healthy BMI range'],
    rows: [150, 155, 160, 165, 170, 175, 180, 185, 190].map((cm) => [
      `${cm} cm`, `${n('ideal-weight-calculator', { sex: 'male', cm }, 'Devine').toFixed(1)} kg`, `${n('ideal-weight-calculator', { sex: 'female', cm }, 'Devine').toFixed(1)} kg`, s('ideal-weight-calculator', { sex: 'male', cm }, 'Healthy BMI range'),
    ]),
  }),
  'water-intake-calculator': () => grid({ question: 'How much water should I drink for my weight?', note: 'Litres a day, counting all drinks. A general estimate, not medical advice.', corner: 'Weight', rows: [40, 50, 60, 70, 80, 90], cols: [0, 30, 60], rowLabel: (kg) => `${kg} kg`, colLabel: (m) => (m === 0 ? 'No exercise' : `${m} min exercise`), cell: (kg, m) => `${n('water-intake-calculator', { kg, mins: m }, 'Daily water target').toFixed(1)} L` }),
  'pregnancy-due-date-calculator': () => ({
    question: 'How does cycle length change the due date?',
    note: 'For a last period that began on 10 January 2026. A general estimate, not medical advice.',
    columns: ['Cycle length', 'Estimated due date'],
    rows: [24, 26, 28, 30, 32, 35].map((cycle) => [`${cycle} days`, noDay(s('pregnancy-due-date-calculator', { lmp: '2026-01-10', cycle }, 'Estimated due date'))]),
  }),
  // ---- students
  'cgpa-to-percentage-calculator': () => ({
    question: 'What percentage is my CGPA?',
    note: 'CGPA × 9.5, the CBSE convention. Your institution may publish its own rule.',
    columns: ['CGPA', 'Percentage'],
    rows: [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((c) => [c.toFixed(1), pct(n('cgpa-to-percentage-calculator', { cgpa: c, mult: 9.5 }, 'Percentage'))]),
  }),
  'gpa-calculator': () => ({
    question: 'What grade points does each grade give?',
    note: 'A common 4.0 scale. Use the scale your school publishes.',
    columns: ['Grade', 'Grade points'],
    rows: [['A', '4.0'], ['A−', '3.7'], ['B+', '3.3'], ['B', '3.0'], ['B−', '2.7'], ['C', '2.0'], ['D', '1.0'], ['F', '0']],
  }),
  'marks-percentage-calculator': () => ({
    question: 'What percentage is my score out of 500?',
    note: 'Marks obtained ÷ 500 × 100.',
    columns: ['Marks out of 500', 'Percentage'],
    rows: [300, 350, 400, 425, 450, 475].map((got) => [String(got), pct(n('marks-percentage-calculator', { got, total: 500 }, 'Percentage'))]),
  }),
  'attendance-calculator': () => ({
    question: 'How many classes can I miss, or must I attend?',
    note: 'With 75% attendance required.',
    columns: ['Attended', 'Held', 'Attendance', 'What it means'],
    rows: ([[45, 60], [60, 90], [70, 100], [80, 100], [90, 100]] as const).map(([att, held]) => {
      const def = calcBySlug('attendance-calculator')!;
      const r = def.compute({ att, held, req: 75 });
      const [a, b] = r.metrics;
      const meaning = b!.label.startsWith('Classes you can') ? `Can miss ${b!.value} more` : `Attend the next ${b!.value} in a row`;
      return [String(att), String(held), pct(Number(a!.value)), meaning];
    }),
  }),
};

export function referenceFor(slug: string): Reference | null {
  const make = TABLES[slug];
  return make ? make() : null;
}
export const REFERENCE_SLUGS = Object.keys(TABLES);

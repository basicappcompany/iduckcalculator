import { cagr, compound, compoundYears, inflate, recurringDeposit, retirementCorpus, simpleInterest, sipFutureValue, sipYears, stepUpSip, swp, type YearRow } from '../../finance';
import { fail, n, num, sel, yearsMonths, type CalcDef, type Result } from '../types';

/** Growth tables: invested so far, gain so far and the balance, per year. */
function growth(rows: YearRow[], opening = 0): Pick<Result, 'table' | 'chart'> {
  let invested = opening;
  const cum = rows.map((r) => {
    invested += r.paid;
    return { year: r.year, invested, gain: r.balance - invested, balance: r.balance };
  });
  return {
    table: {
      columns: ['Year', 'Invested so far', 'Gain so far', 'Balance'],
      kinds: ['number', 'money', 'money', 'money'],
      rows: cum.map((c) => [c.year, c.invested, c.gain, c.balance]),
    },
    chart: {
      title: 'How the balance grows: money in and gains',
      labels: cum.map((c) => String(c.year)),
      series: [
        { name: 'Invested', values: cum.map((c) => c.invested) },
        { name: 'Gain', values: cum.map((c) => Math.max(0, c.gain)) },
      ],
      money: true,
    },
  };
}

const summary = (invested: number, value: number) => [
  { label: 'Maturity value', value, kind: 'money' as const, big: true },
  { label: 'Amount invested', value: invested, kind: 'money' as const },
  { label: 'Gain', value: value - invested, kind: 'money' as const },
];

const RETURN_NOTE = 'Returns are not guaranteed. Real investments go up and down, so treat this as an illustration of the maths.';

export const SAVINGS: CalcDef[] = [
  {
    slug: 'sip-calculator',
    name: 'SIP calculator',
    group: 'savings',
    emoji: '📈',
    summary: 'See what a monthly mutual fund SIP could grow to.',
    quick: 'Enter your monthly SIP, the expected yearly return and the years. ₹5,000 a month at 12% for 10 years grows to about ₹11,61,695, of which ₹6,00,000 is what you put in.',
    keywords: 'systematic investment plan mutual fund monthly investment returns wealth',
    title: 'SIP Calculator: future value of a monthly investment',
    description: 'Free SIP calculator. Enter the monthly amount, expected return and years to see the maturity value, your gains and a year-by-year growth table.',
    fields: [
      num('monthly', 'Monthly investment', 5000, { unit: 'money', min: 0, step: 500 }),
      num('rate', 'Expected return per year', 12, { unit: 'percent', min: 0, max: 40, step: 0.1 }),
      num('years', 'Time period', 10, { unit: 'years', min: 1, max: 50, step: 1 }),
    ],
    compute: (v) => {
      const monthly = n(v, 'monthly');
      const years = Math.round(n(v, 'years'));
      if (monthly <= 0) return fail('Enter the monthly amount.');
      if (years <= 0) return fail('Enter the number of years.');
      const rows = sipYears(monthly, n(v, 'rate'), years);
      return { metrics: summary(monthly * years * 12, sipFutureValue(monthly, n(v, 'rate'), years * 12)), ...growth(rows), note: RETURN_NOTE };
    },
    formula: ['Future value = P × ((1 + i)^n − 1) ÷ i × (1 + i)', 'P = monthly amount, i = yearly return ÷ 12 ÷ 100, n = number of months', 'Each instalment is assumed to go in at the start of the month.'],
    example: '₹5,000 a month for 10 years at 12%: i = 0.01 and n = 120, so the value is ₹11,61,695. You invested ₹6,00,000, so the gain is ₹5,61,695.',
    how: [
      'A SIP puts a fixed amount into a fund every month. Each instalment buys units at that month’s price and then grows with the rest.',
      'The calculator assumes a steady return, which real markets never give. Treat the result as a way to compare plans, not a promise.',
      'The longer you stay invested, the more of the final value comes from growth on growth. The chart shows the gain overtaking what you put in.',
    ],
    faqs: [
      { q: 'What return should I enter for a SIP?', a: 'Nobody can know the future return. Many people test a range such as 8%, 10% and 12% to see how much the result moves.' },
      { q: 'Is the SIP return guaranteed?', a: 'No. Mutual fund returns vary and you can lose money. The calculator shows the arithmetic for a steady rate only.' },
      { q: 'Does the calculator include tax or fund charges?', a: 'No. Taxes, expense ratios and exit loads reduce what you keep, so the real figure is lower.' },
      { q: 'Is SIP better than a lumpsum?', a: 'A SIP spreads purchases over time, which suits a regular income. See the lumpsum calculator and the SIP vs lumpsum guide to compare.' },
      { q: 'Can I raise my SIP every year?', a: 'Yes. The step-up SIP calculator shows how a yearly increase changes the result.' },
    ],
    related: ['step-up-sip-calculator', 'lumpsum-calculator', 'swp-calculator'],
  },
  {
    slug: 'lumpsum-calculator',
    name: 'Lumpsum calculator',
    group: 'savings',
    emoji: '💼',
    summary: 'What a one-time investment grows to over the years.',
    quick: 'Enter the amount, the yearly return and the years. ₹1,00,000 at 12% for 10 years becomes about ₹3,10,585.',
    keywords: 'one time investment mutual fund growth future value',
    title: 'Lumpsum Calculator: one-time investment growth',
    description: 'Free lumpsum calculator. See what a single investment grows to at a given yearly return, with a year-by-year table and chart.',
    fields: [
      num('amount', 'Amount invested', 100000, { unit: 'money', min: 0, step: 10000 }),
      num('rate', 'Expected return per year', 12, { unit: 'percent', min: 0, max: 40, step: 0.1 }),
      num('years', 'Time period', 10, { unit: 'years', min: 1, max: 50, step: 1 }),
    ],
    compute: (v) => {
      const amount = n(v, 'amount');
      const years = Math.round(n(v, 'years'));
      if (amount <= 0) return fail('Enter the amount you invest.');
      if (years <= 0) return fail('Enter the number of years.');
      const rows = compoundYears(amount, n(v, 'rate'), years).map((r) => ({ ...r, paid: 0 }));
      return { metrics: summary(amount, compound(amount, n(v, 'rate'), years)), ...growth(rows, amount), note: RETURN_NOTE };
    },
    formula: ['Future value = P × (1 + r)^t', 'P = amount invested, r = yearly return ÷ 100, t = years'],
    example: '₹1,00,000 at 12% for 10 years: 1,00,000 × 1.12^10 = ₹3,10,585. The gain is ₹2,10,585.',
    how: [
      'A lumpsum goes in once and then compounds: each year’s gain earns its own gain the year after.',
      'Doubling the time does much more than double the gain, which is why starting early matters.',
      'Compare with a SIP of the same total to see how spreading the money out changes the answer.',
    ],
    faqs: [
      { q: 'What is the rule of 72?', a: 'Divide 72 by the yearly return to estimate the years needed to double your money. At 12% it is about 6 years.' },
      { q: 'Does the return compound every year?', a: 'Yes, the calculator compounds once a year.' },
      { q: 'Is a lumpsum riskier than a SIP?', a: 'Putting everything in at once exposes you to the market level on that one day. A SIP averages the entry price over time.' },
      { q: 'Are taxes included?', a: 'No. Tax on gains depends on the asset and holding period, and it reduces the final amount.' },
    ],
    related: ['sip-calculator', 'compound-interest-calculator', 'cagr-calculator'],
  },
  {
    slug: 'step-up-sip-calculator',
    name: 'Step-up SIP calculator',
    group: 'savings',
    emoji: '🪜',
    summary: 'A SIP that rises every year as your income does.',
    quick: 'Enter a starting SIP, the yearly step-up, the return and the years. ₹10,000 a month, raised 10% every year at 12% for 10 years, grows to about ₹33,74,326.',
    keywords: 'increasing sip annual increment top up sip raise investment',
    title: 'Step-up SIP Calculator: raise your SIP every year',
    description: 'Free step-up SIP calculator. See how raising your monthly SIP by a fixed percentage each year changes the final value, with a yearly table.',
    fields: [
      num('monthly', 'Starting monthly investment', 10000, { unit: 'money', min: 0, step: 500 }),
      num('step', 'Increase every year', 10, { unit: 'percent', min: 0, max: 50, step: 1 }),
      num('rate', 'Expected return per year', 12, { unit: 'percent', min: 0, max: 40, step: 0.1 }),
      num('years', 'Time period', 10, { unit: 'years', min: 1, max: 50, step: 1 }),
    ],
    compute: (v) => {
      const monthly = n(v, 'monthly');
      const years = Math.round(n(v, 'years'));
      if (monthly <= 0) return fail('Enter the starting monthly amount.');
      if (years <= 0) return fail('Enter the number of years.');
      const rows = stepUpSip(monthly, n(v, 'step'), n(v, 'rate'), years);
      const flat = sipFutureValue(monthly, n(v, 'rate'), years * 12);
      const final = rows.at(-1)!.balance;
      const invested = rows.reduce((t, r) => t + r.paid, 0);
      return {
        metrics: [...summary(invested, final), { label: 'Extra over a flat SIP', value: final - flat, kind: 'money' }],
        ...growth(rows),
        note: RETURN_NOTE,
      };
    },
    formula: ['Year 1 monthly amount = P; year k amount = P × (1 + step)^(k − 1)', 'Each month: balance = (balance + amount) × (1 + i), with i = yearly return ÷ 12 ÷ 100'],
    example: '₹10,000 a month raised 10% each year for 10 years at 12%: you invest ₹19,12,491 in total and reach ₹33,74,326. A flat ₹10,000 SIP would reach ₹23,23,391.',
    how: [
      'Salaries usually grow, so a SIP that grows with them is realistic. A 10% yearly step-up is a common choice.',
      'The first years carry little money, so most of the gain comes from the later, larger instalments. The table shows the investment rising each year.',
      'Compare with the plain SIP calculator to see what the step-up adds.',
    ],
    faqs: [
      { q: 'What step-up percentage should I use?', a: 'Match it to how fast your income grows. Even 5% a year adds a noticeable amount over a decade.' },
      { q: 'Does the step-up apply every month?', a: 'No. The amount is flat within a year and rises once, at the start of each new year.' },
      { q: 'Can I step up in rupees instead of percent?', a: 'This calculator uses a percentage. A fixed rupee step is not supported.' },
      { q: 'Do all funds allow a step-up?', a: 'Many mutual fund platforms offer a top-up SIP. Check with yours.' },
    ],
    related: ['sip-calculator', 'lumpsum-calculator', 'retirement-calculator'],
  },
  {
    slug: 'swp-calculator',
    name: 'SWP calculator',
    group: 'savings',
    emoji: '🏧',
    summary: 'How long a corpus lasts when you withdraw every month.',
    quick: 'Enter your corpus, the monthly withdrawal and the expected return. A ₹50,00,000 corpus with ₹40,000 withdrawn monthly at 8% still has about ₹9.16 lakh left after 20 years.',
    keywords: 'systematic withdrawal plan retirement income monthly payout corpus',
    title: 'SWP Calculator: monthly withdrawals from a corpus',
    description: 'Free SWP calculator. See how long your money lasts, and what is left, when you withdraw a fixed amount every month from an investment.',
    fields: [
      num('corpus', 'Total investment', 5000000, { unit: 'money', min: 0, step: 100000 }),
      num('withdraw', 'Withdrawal every month', 40000, { unit: 'money', min: 0, step: 1000 }),
      num('rate', 'Expected return per year', 8, { unit: 'percent', min: 0, max: 30, step: 0.1 }),
      num('years', 'Time period', 20, { unit: 'years', min: 1, max: 50, step: 1 }),
    ],
    compute: (v) => {
      const corpus = n(v, 'corpus');
      const years = Math.round(n(v, 'years'));
      if (corpus <= 0) return fail('Enter the amount you start with.');
      if (n(v, 'withdraw') <= 0) return fail('Enter the monthly withdrawal.');
      if (years <= 0) return fail('Enter the number of years.');
      const plan = swp(corpus, n(v, 'withdraw'), n(v, 'rate'), years);
      const rows = plan.years;
      return {
        metrics: [
          { label: plan.lasts ? 'Balance left at the end' : 'Money runs out after', value: plan.lasts ? plan.finalBalance : yearsMonths(plan.monthsLasted), kind: plan.lasts ? 'money' : 'text', big: true },
          { label: 'Total withdrawn', value: plan.totalWithdrawn, kind: 'money' },
          { label: 'Starting investment', value: corpus, kind: 'money' },
        ],
        table: { columns: ['Year', 'Withdrawn', 'Balance'], kinds: ['number', 'money', 'money'], rows: rows.map((r) => [r.year, r.paid, r.balance]) },
        chart: { title: 'Balance left at the end of each year', labels: rows.map((r) => String(r.year)), series: [{ name: 'Balance', values: rows.map((r) => r.balance) }], money: true },
        note: plan.lasts ? RETURN_NOTE : 'At this withdrawal the money is used up before the period ends. Lower the withdrawal or raise the corpus.',
      };
    },
    formula: ['Each month: take out the withdrawal, then the remaining balance grows by i = yearly return ÷ 12 ÷ 100', 'Balance = (balance − withdrawal) × (1 + i), until the balance reaches 0 or the period ends'],
    example: '₹50,00,000 with ₹40,000 withdrawn each month at 8% for 20 years: you take out ₹96,00,000 in total and ₹9,16,125 is still left.',
    how: [
      'A systematic withdrawal plan pays you a fixed amount from an investment while the rest keeps earning.',
      'If the withdrawal is bigger than the monthly return, the balance shrinks; if the balance hits zero early, the calculator says when.',
      'Inflation is not included, so the same ₹40,000 buys less each year. Keep a margin or raise the withdrawal over time.',
    ],
    faqs: [
      { q: 'What is a safe withdrawal rate?', a: 'A common rule of thumb is around 4% of the corpus a year, but the right figure depends on returns, inflation and how long you need the money.' },
      { q: 'Is SWP income taxable?', a: 'The gains part of each withdrawal can be taxed. The rules depend on the fund type and how long you held it, so check current rules.' },
      { q: 'What if returns are lower than I assumed?', a: 'The money runs out sooner. Try a lower return in the box to stress-test your plan.' },
      { q: 'Is the withdrawal taken at the start or end of the month?', a: 'At the start of each month, before that month’s growth.' },
    ],
    related: ['sip-calculator', 'retirement-calculator', 'fd-calculator'],
  },
  {
    slug: 'fd-calculator',
    name: 'FD calculator',
    group: 'savings',
    emoji: '🏦',
    summary: 'Maturity value of a fixed deposit with quarterly or monthly compounding.',
    quick: 'Enter the deposit, the interest rate and the years. ₹1,00,000 at 7% for 5 years with quarterly compounding matures at about ₹1,41,478.',
    keywords: 'fixed deposit bank interest maturity term deposit cumulative',
    title: 'FD Calculator: fixed deposit maturity and interest',
    description: 'Free fixed deposit calculator. Enter the amount, rate, tenure and compounding to see the maturity value and the interest earned.',
    fields: [
      num('amount', 'Deposit amount', 100000, { unit: 'money', min: 0, step: 10000 }),
      num('rate', 'Interest rate per year', 7, { unit: 'percent', min: 0, max: 20, step: 0.05 }),
      num('years', 'Tenure', 5, { unit: 'years', min: 0.25, max: 30, step: 0.25 }),
      sel('freq', 'Interest compounded', '4', [
        ['1', 'Yearly'],
        ['2', 'Half-yearly'],
        ['4', 'Quarterly'],
        ['12', 'Monthly'],
      ]),
    ],
    compute: (v) => {
      const amount = n(v, 'amount');
      const years = n(v, 'years');
      if (amount <= 0) return fail('Enter the deposit amount.');
      if (years <= 0) return fail('Enter the tenure.');
      const freq = Number(v['freq']) || 4;
      const whole = Math.floor(years);
      const rows = compoundYears(amount, n(v, 'rate'), whole, freq).map((r) => ({ ...r, paid: 0 }));
      const value = compound(amount, n(v, 'rate'), years, freq);
      return { metrics: summary(amount, value), ...(whole >= 1 ? growth(rows, amount) : {}), note: 'Interest on an FD is taxable. Banks may deduct TDS above a limit.' };
    },
    formula: ['Maturity = P × (1 + r ÷ m)^(m × t)', 'P = deposit, r = yearly rate ÷ 100, m = compounding periods per year, t = years'],
    example: '₹1,00,000 at 7% for 5 years compounded quarterly: m = 4, so 1,00,000 × (1.0175)^20 = ₹1,41,478. Monthly compounding gives ₹1,41,763.',
    how: [
      'A fixed deposit locks your money for a set time at a fixed rate. In a cumulative FD the interest is added back to the deposit and earns interest too.',
      'Banks usually compound quarterly. More frequent compounding gives a slightly higher maturity value for the same rate.',
      'Senior citizens often get a higher rate; enter the rate your bank quotes for you.',
    ],
    faqs: [
      { q: 'How often do banks compound FD interest?', a: 'Most compound quarterly. Your FD certificate or the bank’s page states it.' },
      { q: 'Is FD interest taxable?', a: 'Yes, it is added to your income and taxed at your slab rate. Banks may deduct TDS when interest crosses a yearly limit.' },
      { q: 'What about premature withdrawal?', a: 'Banks usually pay a lower rate and may charge a penalty if you break an FD early.' },
      { q: 'Is an FD safe?', a: 'Bank deposits are insured up to a limit per depositor per bank. Check the current limit with the deposit insurer.' },
    ],
    related: ['rd-calculator', 'compound-interest-calculator', 'inflation-calculator'],
  },
  {
    slug: 'rd-calculator',
    name: 'RD calculator',
    group: 'savings',
    emoji: '🔁',
    summary: 'Maturity value of a recurring deposit with monthly instalments.',
    quick: 'Enter the monthly deposit, the rate and the months. ₹5,000 a month for 60 months at 7% matures at about ₹3,59,664.',
    keywords: 'recurring deposit monthly saving bank post office rd maturity',
    title: 'RD Calculator: recurring deposit maturity amount',
    description: 'Free recurring deposit calculator. Enter the monthly deposit, interest rate and tenure to see the maturity value and the interest earned.',
    fields: [
      num('monthly', 'Monthly deposit', 5000, { unit: 'money', min: 0, step: 500 }),
      num('rate', 'Interest rate per year', 7, { unit: 'percent', min: 0, max: 20, step: 0.05 }),
      num('months', 'Tenure', 60, { unit: 'months', min: 3, max: 120, step: 3 }),
    ],
    compute: (v) => {
      const monthly = n(v, 'monthly');
      const months = Math.round(n(v, 'months'));
      if (monthly <= 0) return fail('Enter the monthly deposit.');
      if (months <= 0) return fail('Enter the tenure in months.');
      return { metrics: summary(monthly * months, recurringDeposit(monthly, n(v, 'rate'), months)), note: 'Interest on an RD is taxable.' };
    },
    formula: ['Maturity = R × ((1 + i)^q − 1) ÷ (1 − (1 + i)^(−1/3))', 'R = monthly deposit, i = yearly rate ÷ 400, q = months ÷ 3 (quarters)'],
    example: '₹5,000 a month for 60 months at 7%: i = 0.0175 and q = 20, so maturity = ₹3,59,664. You deposit ₹3,00,000, so the interest is ₹59,664.',
    how: [
      'A recurring deposit lets you save a fixed amount every month at a fixed rate. Banks compound the interest quarterly.',
      'Each deposit earns interest only from the day it goes in, so the early deposits earn the most.',
      'Missing an instalment usually brings a small penalty; the calculator assumes you pay every month.',
    ],
    faqs: [
      { q: 'How is an RD different from an FD?', a: 'An FD is one deposit at the start. An RD is a small deposit every month, which suits regular savers.' },
      { q: 'Which compounding does the RD calculator use?', a: 'Quarterly, which is how most Indian banks and the post office quote RD interest.' },
      { q: 'Is RD interest taxable?', a: 'Yes, as income. TDS may apply above the bank’s yearly interest limit.' },
      { q: 'Can I close an RD early?', a: 'Usually yes, but at a lower rate. Check your bank’s terms.' },
    ],
    related: ['fd-calculator', 'sip-calculator', 'compound-interest-calculator'],
  },
  {
    slug: 'compound-interest-calculator',
    name: 'Compound interest calculator',
    group: 'savings',
    emoji: '🌱',
    summary: 'Interest on interest: growth with yearly, quarterly or monthly compounding.',
    quick: 'Enter the principal, the rate, the years and how often it compounds. ₹1,00,000 at 10% for 5 years compounded yearly becomes ₹1,61,051.',
    keywords: 'interest on interest compounding future value growth principal',
    title: 'Compound Interest Calculator: growth with compounding',
    description: 'Free compound interest calculator. See how a sum grows when interest is added to the balance yearly, quarterly or monthly, with a yearly table.',
    fields: [
      num('principal', 'Principal', 100000, { unit: 'money', min: 0, step: 10000 }),
      num('rate', 'Interest rate per year', 10, { unit: 'percent', min: 0, max: 50, step: 0.1 }),
      num('years', 'Time period', 5, { unit: 'years', min: 1, max: 60, step: 1 }),
      sel('freq', 'Compounded', '1', [
        ['1', 'Yearly'],
        ['2', 'Half-yearly'],
        ['4', 'Quarterly'],
        ['12', 'Monthly'],
        ['365', 'Daily'],
      ]),
    ],
    compute: (v) => {
      const principal = n(v, 'principal');
      const years = Math.round(n(v, 'years'));
      if (principal <= 0) return fail('Enter the principal.');
      if (years <= 0) return fail('Enter the number of years.');
      const freq = Number(v['freq']) || 1;
      const rows = compoundYears(principal, n(v, 'rate'), years, freq);
      return {
        metrics: [
          { label: 'Amount after the period', value: compound(principal, n(v, 'rate'), years, freq), kind: 'money', big: true },
          { label: 'Principal', value: principal, kind: 'money' },
          { label: 'Compound interest earned', value: compound(principal, n(v, 'rate'), years, freq) - principal, kind: 'money' },
          { label: 'Simple interest would give', value: simpleInterest(principal, n(v, 'rate'), years), kind: 'money' },
        ],
        ...growth(rows, principal),
      };
    },
    formula: ['A = P × (1 + r ÷ m)^(m × t)', 'P = principal, r = yearly rate ÷ 100, m = times compounded per year, t = years'],
    example: '₹1,00,000 at 10% for 5 years compounded yearly: 1,00,000 × 1.10^5 = ₹1,61,051. Simple interest would give only ₹50,000.',
    how: [
      'With compound interest, each period’s interest is added to the balance, so the next period earns interest on a bigger sum.',
      'The more often interest compounds, the slightly more you earn; the bigger lever is time.',
      'The last number compares with simple interest so you can see the extra that compounding adds.',
    ],
    faqs: [
      { q: 'What is the difference between simple and compound interest?', a: 'Simple interest is charged only on the original sum. Compound interest is charged on the sum plus the interest already added.' },
      { q: 'Does compounding more often matter much?', a: 'A little. Going from yearly to monthly adds a modest amount; the number of years and the rate matter far more.' },
      { q: 'Can I use it for a loan?', a: 'Yes, for a loan where interest is added to the balance and nothing is repaid. For EMIs use the EMI calculator.' },
      { q: 'What is the effective annual rate?', a: 'The true yearly growth after compounding. A 10% rate compounded monthly is about 10.47% a year.' },
    ],
    related: ['simple-interest-calculator', 'lumpsum-calculator', 'fd-calculator'],
  },
  {
    slug: 'simple-interest-calculator',
    name: 'Simple interest calculator',
    group: 'savings',
    emoji: '➕',
    summary: 'Interest on the original sum only: principal × rate × time.',
    quick: 'Enter the principal, the rate and the years. ₹1,00,000 at 8% for 3 years earns ₹24,000 in simple interest, for a total of ₹1,24,000.',
    keywords: 'si interest formula principal rate time flat',
    title: 'Simple Interest Calculator: interest and total amount',
    description: 'Free simple interest calculator. Enter the principal, rate and time to see the interest earned and the total amount, with the formula shown.',
    fields: [
      num('principal', 'Principal', 100000, { unit: 'money', min: 0, step: 10000 }),
      num('rate', 'Interest rate per year', 8, { unit: 'percent', min: 0, max: 100, step: 0.1 }),
      num('years', 'Time period', 3, { unit: 'years', min: 0, max: 100, step: 0.5 }),
    ],
    compute: (v) => {
      const principal = n(v, 'principal');
      if (principal <= 0) return fail('Enter the principal.');
      const interest = simpleInterest(principal, n(v, 'rate'), n(v, 'years'));
      return {
        metrics: [
          { label: 'Simple interest', value: interest, kind: 'money', big: true },
          { label: 'Total amount', value: principal + interest, kind: 'money' },
          { label: 'Interest every year', value: interest / (n(v, 'years') || 1), kind: 'money' },
        ],
      };
    },
    formula: ['Simple interest = P × R × T ÷ 100', 'Total amount = P + simple interest', 'P = principal, R = rate per year (%), T = time in years'],
    example: 'P = ₹1,00,000, R = 8%, T = 3 years: interest = 1,00,000 × 8 × 3 ÷ 100 = ₹24,000, so the total is ₹1,24,000.',
    how: [
      'Simple interest is the same every year because it is worked out on the original principal only.',
      'It is used in some short-term loans, school maths and quick estimates. Most savings and loans use compound interest instead.',
      'Enter time in years; for months, divide by 12 (6 months = 0.5 years).',
    ],
    faqs: [
      { q: 'What is the simple interest formula?', a: 'Interest = Principal × Rate × Time ÷ 100, with the rate per year and the time in years.' },
      { q: 'How do I find the time if I know the interest?', a: 'Rearrange it: Time = Interest × 100 ÷ (Principal × Rate).' },
      { q: 'How do I enter months?', a: 'Divide by 12. Eight months is 0.67 years; use 0.6667 for accuracy.' },
      { q: 'When is simple interest used?', a: 'Some personal loans, bonds and exam questions. Bank deposits and most loans compound.' },
    ],
    related: ['compound-interest-calculator', 'fd-calculator', 'emi-calculator'],
  },
  {
    slug: 'cagr-calculator',
    name: 'CAGR calculator',
    group: 'savings',
    emoji: '📊',
    summary: 'The steady yearly growth rate between a start and an end value.',
    quick: 'Enter the starting value, the ending value and the years. Money that doubles in 5 years grew at a CAGR of 14.87%.',
    keywords: 'compound annual growth rate return investment growth annualised',
    title: 'CAGR Calculator: compound annual growth rate',
    description: 'Free CAGR calculator. Enter the start value, end value and years to find the compound annual growth rate of an investment.',
    fields: [
      num('start', 'Starting value', 10000, { unit: 'money', min: 0, step: 1000 }),
      num('end', 'Ending value', 20000, { unit: 'money', min: 0, step: 1000 }),
      num('years', 'Number of years', 5, { unit: 'years', min: 0, max: 100, step: 0.5 }),
    ],
    compute: (v) => {
      const rate = cagr(n(v, 'start'), n(v, 'end'), n(v, 'years'));
      if (!Number.isFinite(rate)) return fail('Enter a starting value above 0, an ending value and the years.');
      return {
        metrics: [
          { label: 'CAGR', value: rate, kind: 'percent', decimals: 2, big: true },
          { label: 'Total growth', value: ((n(v, 'end') - n(v, 'start')) / n(v, 'start')) * 100, kind: 'percent', decimals: 2 },
          { label: 'Absolute gain', value: n(v, 'end') - n(v, 'start'), kind: 'money' },
        ],
        note: 'CAGR smooths out the ups and downs. The real path was probably bumpier than a steady rate.',
      };
    },
    formula: ['CAGR = (End value ÷ Start value)^(1 ÷ years) − 1', 'Multiply by 100 to get a percentage'],
    example: '₹10,000 growing to ₹20,000 in 5 years: (20,000 ÷ 10,000)^(1/5) − 1 = 0.1487, so CAGR = 14.87% a year.',
    how: [
      'CAGR answers: what steady yearly rate would turn the start value into the end value over this time?',
      'It lets you compare investments held for different lengths of time on the same footing.',
      'It ignores what happened in between, so two very different journeys can have the same CAGR.',
    ],
    faqs: [
      { q: 'Is CAGR the same as average return?', a: 'No. An average of yearly returns ignores compounding. CAGR is the single steady rate that reproduces the final value.' },
      { q: 'Can CAGR be negative?', a: 'Yes, if the end value is lower than the start value.' },
      { q: 'Does CAGR work with SIPs?', a: 'Not directly, because money goes in at different times. Use XIRR for a SIP; this tool is for one start value and one end value.' },
      { q: 'What does CAGR ignore?', a: 'Volatility and the path taken. A fund that swung wildly and one that rose steadily can show the same CAGR.' },
    ],
    related: ['lumpsum-calculator', 'compound-interest-calculator', 'inflation-calculator'],
  },
  {
    slug: 'inflation-calculator',
    name: 'Inflation calculator',
    group: 'savings',
    emoji: '🎈',
    summary: 'What things will cost later, and what your money will be worth.',
    quick: 'Enter an amount, the yearly inflation and the years. Something that costs ₹1,00,000 today costs about ₹1,79,085 in 10 years at 6% inflation.',
    keywords: 'price rise cost of living purchasing power future cost value of money',
    title: 'Inflation Calculator: future cost and value of money',
    description: 'Free inflation calculator. See what a cost today will be in the future and how much purchasing power your money loses over the years.',
    fields: [
      num('amount', 'Amount today', 100000, { unit: 'money', min: 0, step: 10000 }),
      num('inflation', 'Inflation per year', 6, { unit: 'percent', min: 0, max: 50, step: 0.1 }),
      num('years', 'Number of years', 10, { unit: 'years', min: 1, max: 60, step: 1 }),
    ],
    compute: (v) => {
      const amount = n(v, 'amount');
      const years = Math.round(n(v, 'years'));
      if (amount <= 0) return fail('Enter the amount.');
      if (years <= 0) return fail('Enter the number of years.');
      const future = inflate(amount, n(v, 'inflation'), years);
      const rows = Array.from({ length: years }, (_, i) => [i + 1, inflate(amount, n(v, 'inflation'), i + 1)]);
      return {
        metrics: [
          { label: 'Same things will cost', value: future, kind: 'money', big: true },
          { label: 'Your money will buy only', value: (amount * amount) / future, kind: 'money' },
          { label: 'Purchasing power lost', value: (1 - amount / future) * 100, kind: 'percent', decimals: 1 },
        ],
        table: { columns: ['Year', 'Cost of the same things'], kinds: ['number', 'money'], rows },
        chart: { title: 'Cost of the same things, year by year', labels: rows.map((r) => String(r[0])), series: [{ name: 'Cost', values: rows.map((r) => Number(r[1])) }], money: true },
      };
    },
    formula: ['Future cost = amount × (1 + inflation)^years', 'Purchasing power of today’s money = amount ÷ (1 + inflation)^years'],
    example: '₹1,00,000 at 6% inflation for 10 years: 1,00,000 × 1.06^10 = ₹1,79,085. In that time ₹1,00,000 in cash buys only about ₹55,839 worth of today’s goods.',
    how: [
      'Inflation is the yearly rise in prices. A steady 6% means prices double in about 12 years.',
      'Money left idle loses purchasing power, which is why savings need to earn more than inflation to keep their value.',
      'Use the future cost to plan for school fees, a wedding or retirement.',
    ],
    faqs: [
      { q: 'What inflation rate should I use?', a: 'Long-run average consumer inflation in India has often been in the 4 to 7% range. Use a figure that matches your own costs, such as education or healthcare, which can rise faster.' },
      { q: 'Does it work backwards?', a: 'Yes in spirit: a price today of ₹1,79,085 equals ₹1,00,000 ten years ago at 6% a year.' },
      { q: 'What is real return?', a: 'Your return minus inflation, roughly. A 9% return with 6% inflation grows your buying power by about 3% a year.' },
      { q: 'Is inflation the same for everything?', a: 'No. Food, fuel, education and housing each move at their own pace. Use a rate that fits the thing you are planning for.' },
    ],
    related: ['retirement-calculator', 'fd-calculator', 'cagr-calculator'],
  },
  {
    slug: 'retirement-calculator',
    name: 'Retirement corpus calculator',
    group: 'savings',
    emoji: '🏖️',
    summary: 'How much you need at retirement and the monthly SIP to get there.',
    quick: 'Enter your age, retirement age, monthly expenses and inflation. With ₹50,000 of expenses today, 6% inflation, 25 years to go and 25 years of retirement, you need about ₹5.19 crore.',
    keywords: 'retire corpus fire pension nest egg how much do i need retirement planning',
    title: 'Retirement Calculator: corpus needed and monthly SIP',
    description: 'Free retirement corpus calculator. Estimate how much you need on the day you retire and the monthly SIP that builds it, allowing for inflation.',
    fields: [
      num('age', 'Your age now', 35, { unit: 'years', min: 18, max: 80, step: 1 }),
      num('retireAge', 'Retirement age', 60, { unit: 'years', min: 30, max: 90, step: 1 }),
      num('lifeAge', 'Plan to live until', 85, { unit: 'years', min: 40, max: 110, step: 1 }),
      num('expense', 'Monthly expenses today', 50000, { unit: 'money', min: 0, step: 5000 }),
      num('inflation', 'Inflation per year', 6, { unit: 'percent', min: 0, max: 20, step: 0.1 }),
      num('post', 'Return after retirement', 8, { unit: 'percent', min: 0, max: 20, step: 0.1 }),
      num('pre', 'Return before retirement', 10, { unit: 'percent', min: 0, max: 30, step: 0.1 }),
      num('saved', 'Savings you already have for retirement', 0, { unit: 'money', min: 0, step: 100000 }),
    ],
    compute: (v) => {
      const toGo = Math.round(n(v, 'retireAge') - n(v, 'age'));
      const inRetirement = Math.round(n(v, 'lifeAge') - n(v, 'retireAge'));
      if (toGo <= 0) return fail('Retirement age must be after your current age.');
      if (inRetirement <= 0) return fail('Plan to live longer than your retirement age.');
      if (n(v, 'expense') <= 0) return fail('Enter your monthly expenses.');
      const annualThen = inflate(n(v, 'expense') * 12, n(v, 'inflation'), toGo);
      const corpus = retirementCorpus(annualThen, n(v, 'inflation'), n(v, 'post'), inRetirement);
      const savedGrown = compound(n(v, 'saved'), n(v, 'pre'), toGo) || 0;
      const shortfall = Math.max(0, corpus - savedGrown);
      const factor = sipFutureValue(1, n(v, 'pre'), toGo * 12);
      return {
        metrics: [
          { label: 'Corpus needed at retirement', value: corpus, kind: 'money', big: true },
          { label: 'Monthly SIP to reach it', value: factor > 0 ? shortfall / factor : 0, kind: 'money' },
          { label: 'Yearly expenses in the first retirement year', value: annualThen, kind: 'money' },
          { label: 'Your current savings, grown to retirement', value: savedGrown, kind: 'money' },
        ],
        note: 'A planning estimate. It does not include tax, pensions, rental income or changes in lifestyle.',
      };
    },
    formula: ['Expenses at retirement = today’s yearly expenses × (1 + inflation)^years to go', 'Corpus = expenses × (1 − q^N) ÷ (1 − q), where q = (1 + inflation) ÷ (1 + return after retirement) and N = years in retirement', 'SIP needed = (corpus − savings grown) ÷ SIP factor, using the return before retirement'],
    example: '₹50,000 a month today at 6% inflation for 25 years becomes ₹25,75,122 a year at 60. Funding 25 years of that with an 8% return takes a corpus of ₹5,19,11,228.',
    how: [
      'The calculator first grows today’s expenses by inflation to the day you retire, then works out the pot that can pay a rising income for the rest of your life.',
      'It then divides the gap between that pot and your current savings by the growth factor of a monthly SIP.',
      'Small changes in inflation and post-retirement return move the answer a lot, so test a few settings.',
    ],
    faqs: [
      { q: 'How long should I plan to live?', a: 'Many planners use 85 to 95 to be safe. Running out of money is worse than leaving some behind.' },
      { q: 'Why is the corpus so big?', a: 'Inflation makes your future expenses much larger than today’s, and the pot must last for decades.' },
      { q: 'Should I count the EPF, NPS or a pension?', a: 'Yes: subtract what they will give from your expenses, or add their value to the savings box.' },
      { q: 'What return should I assume after retirement?', a: 'Retirees usually move to safer assets, so a lower return than before retirement is normal. Test a few values.' },
    ],
    related: ['sip-calculator', 'swp-calculator', 'inflation-calculator'],
  },
];

import { fail, n, num, sel, s, type CalcDef, type Result, type RulesInfo } from '../types';
import { TAX_RULES_READ_ON } from './tax';

/**
 * Government savings scheme calculators. The rules and rates here were read from the National Savings Institute (Ministry of Finance) and the
 * scheme rules on the date shown on each page. Rates are set by the Government and can change every quarter: re-read the sources, change the
 * numbers, bump the date, and update tests/unit/schemes.test.ts and the guides.
 */

export const PPF_RULES: RulesInfo = {
  year: 'PPF rules and the 7.1% rate shown by the National Savings Institute (the Government reviews the rate every quarter)',
  asOf: TAX_RULES_READ_ON,
  sources: [
    { name: 'National Savings Institute: Public Provident Fund account (limits, term, extension)', url: 'https://www.nsiindia.gov.in/(S(ox1txi55cvkbsb55cq5t1p55))/InternalPage.aspx?Id_Pk=55' },
    { name: 'National Savings Institute: PPF interest rates since 1968 (7.1% from 1 April 2020)', url: 'https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=178' },
    { name: 'Public Provident Fund Scheme, 2019 (paragraph 7: how interest is earned and credited)', url: 'https://www.nsiindia.gov.in/writereaddata/SchemeRules/PublicProvidentFundSchemeRule.pdf' },
  ],
};

export const PPF_RATE = 7.1;
export const PPF_MIN_YEARLY = 500;
export const PPF_MAX_YEARLY = 150_000;

export const SUKANYA_RULES: RulesInfo = {
  year: 'Sukanya Samriddhi Account Scheme, 2019, and the 8.2% rate shown by the National Savings Institute (the Government reviews the rate every quarter)',
  asOf: TAX_RULES_READ_ON,
  sources: [
    { name: 'National Savings Institute: Sukanya Samriddhi Account (limits, age, term)', url: 'https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=89' },
    { name: 'National Savings Institute: Sukanya Samriddhi interest rates since 2014 (8.2% from 1 January 2024)', url: 'https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=179' },
    { name: 'Sukanya Samriddhi Account Scheme, 2019 (deposits, how interest is earned, maturity)', url: 'https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=171' },
  ],
};

export const SUKANYA_RATE = 8.2;
export const SUKANYA_MIN_YEARLY = 250;
export const SUKANYA_MAX_YEARLY = 150_000;
export const SUKANYA_DEPOSIT_YEARS = 15;
export const SUKANYA_MATURITY_YEARS = 21;

export interface PpfYear {
  year: number;
  deposited: number;
  interest: number;
  balance: number;
}

/**
 * A PPF account year by year. Interest is earned on the lowest balance between the close of the 5th day and the end of each month, and credited at the
 * end of the year (Scheme paragraph 7). A month's interest is taken as the yearly rate divided by 12 on that balance. With one deposit a year made on
 * or before 5 April the whole deposit earns for all 12 months; with monthly deposits made on or before the 5th, each month's deposit earns from that month.
 */
export function ppfPlan(o: { yearly: number; years: number; rate: number; pattern: 'yearly' | 'monthly' }): PpfYear[] {
  return schemePlan({ yearly: o.yearly, depositYears: o.years, years: o.years, rate: o.rate, pattern: o.pattern });
}

/**
 * The engine shared by the savings-scheme calculators: deposits for `depositYears` years, then the balance keeps earning until `years`. Interest is
 * on the lowest balance between the close of the 5th day and the end of each month, taken as the yearly rate divided by 12, and is credited at the
 * end of each year. A yearly deposit is made on or before 5 April, so it earns for all 12 months; monthly deposits are made on or before the 5th,
 * so each earns from its own month. The schemes round the credited interest to the nearest rupee; this does not, so it can differ by a few rupees.
 */
export function schemePlan(o: { yearly: number; depositYears: number; years: number; rate: number; pattern: 'yearly' | 'monthly' }): PpfYear[] {
  const r = o.rate / 100;
  const rows: PpfYear[] = [];
  let balance = 0;
  for (let y = 1; y <= o.years; y++) {
    const deposit = y <= o.depositYears ? o.yearly : 0;
    let interest = 0;
    let running = balance;
    if (o.pattern === 'yearly') {
      running += deposit;
      interest = running * r;
    } else {
      for (let m = 0; m < 12; m++) {
        running += deposit / 12;
        interest += (running * r) / 12;
      }
    }
    balance = running + interest;
    rows.push({ year: y, deposited: deposit, interest, balance });
  }
  return rows;
}

export const SCHEMES: CalcDef[] = [
  {
    slug: 'ppf-calculator',
    name: 'PPF calculator',
    group: 'savings',
    emoji: '🇮🇳',
    summary: 'See what a Public Provident Fund account grows to, year by year.',
    quick: 'Enter what you put in each year, how you deposit, the years and the rate. ₹1,50,000 a year for 15 years at 7.1%, deposited on or before 5 April each year, grows to ₹40,68,209.',
    keywords: 'ppf public provident fund maturity 15 years 1.5 lakh 7.1% government savings scheme tax free interest calculator',
    title: 'PPF Calculator: maturity value of a 15-year account',
    description: 'Free PPF calculator. Enter your yearly deposit, years and rate to see the maturity value of a Public Provident Fund account, with a year-by-year table.',
    fields: [
      num('yearly', 'Amount invested each year', 150000, { unit: 'money', min: 500, max: 150000, step: 5000, hint: 'A PPF account takes ₹500 to ₹1,50,000 in a financial year.' }),
      sel('pattern', 'How do you deposit?', 'yearly', [['yearly', 'Once a year, on or before 5 April'], ['monthly', 'Every month, on or before the 5th']], 'Interest is earned on the lowest balance between the 5th and the end of each month, so an early deposit earns for the whole month.'),
      num('years', 'Years of deposits', 15, { unit: 'years', min: 1, max: 50, step: 1, hint: 'An account matures after 15 financial years and can be extended in blocks of 5 years with further deposits.' }),
      num('rate', 'Interest rate per year', PPF_RATE, { unit: 'percent', min: 0, max: 15, step: 0.1, hint: 'The Government sets the rate and reviews it every quarter. 7.1% is the rate the National Savings Institute shows from 1 April 2020.' }),
    ],
    compute: (v) => {
      const yearly = n(v, 'yearly');
      const years = Math.round(n(v, 'years'));
      const rate = n(v, 'rate');
      if (yearly < PPF_MIN_YEARLY) return fail('A PPF account needs at least ₹500 a year.');
      if (yearly > PPF_MAX_YEARLY) return fail('A PPF account takes at most ₹1,50,000 in a financial year.');
      if (years < 1 || years > 50) return fail('Enter 1 to 50 years.');
      if (rate < 0 || rate > 15) return fail('Enter a rate between 0 and 15.');
      const rows = ppfPlan({ yearly, years, rate, pattern: s(v, 'pattern') === 'monthly' ? 'monthly' : 'yearly' });
      const last = rows[rows.length - 1]!;
      const invested = yearly * years;
      const result: Result = {
        metrics: [
          { label: 'Maturity value', value: last.balance, kind: 'money', big: true },
          { label: 'Amount invested', value: invested, kind: 'money' },
          { label: 'Interest earned', value: last.balance - invested, kind: 'money' },
        ],
        table: { title: 'Year-by-year balance', columns: ['Year', 'Deposited', 'Interest', 'Balance'], kinds: ['number', 'money', 'money', 'money'], rows: rows.map((r) => [r.year, r.deposited, r.interest, r.balance]) },
        note: `At ${rate}% a year, with interest credited at the end of each year. The National Savings Institute states that the interest is free from income tax. The Government can change the rate every quarter, and this uses the rate you enter for every year.${years < 15 ? ' A PPF account runs for 15 financial years, so the money is not freely available at this point.' : ''}`,
      };
      return result;
    },
    formula: [
      'Each year, deposit made on or before 5 April: balance = (balance + deposit) × (1 + rate ÷ 100)',
      'Monthly deposits: each month the lowest balance earns the rate ÷ 12, and the year’s interest is added at the end of the year',
      'A PPF account takes ₹500 to ₹1,50,000 in a financial year and matures after 15 financial years',
    ],
    example: '₹1,50,000 put in each year on or before 5 April, for 15 years at 7.1%: the balance after year 1 is (0 + 1,50,000) × 1.071 = ₹1,60,650, and after 15 years it is ₹40,68,209, of which ₹22,50,000 is what you invested and ₹18,18,209 is interest. If the same ₹1,50,000 is paid in twelve monthly instalments of ₹12,500 it reaches ₹39,44,599.',
    how: [
      'A Public Provident Fund is a government savings account with a 15-year term. You can put in ₹500 to ₹1,50,000 in a financial year, and interest is credited to the account at the end of each year and then earns interest itself.',
      'The interest for a month is worked out on the lowest balance in the account between the close of the 5th day and the end of that month. So money deposited by the 5th earns for that whole month, and one deposit on or before 5 April earns for the full year. That is why the same amount deposited in one go early in the year grows more than the same amount spread over twelve months.',
      'The rate is set by the Government and the National Savings Institute lists it as 7.1% from 1 April 2020. It is reviewed every quarter, so the calculator lets you change it.',
    ],
    faqs: [
      { q: 'How much can I invest in PPF in a year?', a: 'At least ₹500 and at most ₹1,50,000 in a financial year.' },
      { q: 'How long does a PPF account run?', a: 'It matures after fifteen complete financial years from the end of the year it was opened. It can then be extended in blocks of 5 years with further deposits, or kept without deposits.' },
      { q: 'Why deposit before the 5th?', a: 'Interest is earned on the lowest balance between the close of the 5th day and the end of the month, so a deposit made on or before the 5th earns for that whole month.' },
      { q: 'What is the PPF interest rate?', a: 'The National Savings Institute shows 7.1% from 1 April 2020. The Government reviews the rate every quarter, so check the current one.' },
      { q: 'Is PPF interest taxed?', a: 'The National Savings Institute states that the interest is free from income tax. Check the current rules for your situation.' },
    ],
    related: ['sip-calculator', 'compound-interest-calculator', 'income-tax-calculator'],
    rules: PPF_RULES,
  },
  {
    slug: 'sukanya-samriddhi-calculator',
    name: 'Sukanya Samriddhi calculator',
    group: 'savings',
    emoji: '👧',
    summary: 'See what a Sukanya Samriddhi account grows to by maturity, year by year.',
    quick: 'Enter what you put in each year and the rate. ₹1,50,000 a year for 15 years at 8.2%, deposited on or before 5 April each year, grows to ₹71,82,119 at the end of 21 years.',
    keywords: 'sukanya samriddhi yojana ssy maturity girl child 21 years 15 years deposit 1.5 lakh 8.2% government savings scheme calculator',
    title: 'Sukanya Samriddhi Calculator: maturity after 21 years',
    description: 'Free Sukanya Samriddhi calculator. Enter your yearly deposit and rate to see the maturity value after 21 years, with a year-by-year table.',
    fields: [
      num('yearly', 'Amount invested each year', 150000, { unit: 'money', min: 250, max: 150000, step: 5000, hint: 'The account takes ₹250 to ₹1,50,000 in a financial year.' }),
      sel('pattern', 'How do you deposit?', 'yearly', [['yearly', 'Once a year, on or before 5 April'], ['monthly', 'Every month, on or before the 5th']], 'Interest is earned on the lowest balance between the 5th and the end of each month, so an early deposit earns for the whole month.'),
      num('depositYears', 'Years of deposits', 15, { unit: 'years', min: 1, max: 15, step: 1, hint: 'Deposits can be made for 15 years from the date of opening.' }),
      num('years', 'Show the balance after', 21, { unit: 'years', min: 1, max: 21, step: 1, hint: 'The account matures 21 years after it is opened. The balance keeps earning interest after deposits stop.' }),
      num('rate', 'Interest rate per year', SUKANYA_RATE, { unit: 'percent', min: 0, max: 15, step: 0.1, hint: 'The Government sets the rate and reviews it every quarter. 8.2% is the rate the National Savings Institute shows from 1 January 2024.' }),
    ],
    compute: (v) => {
      const yearly = n(v, 'yearly');
      const depositYears = Math.round(n(v, 'depositYears'));
      const years = Math.round(n(v, 'years'));
      const rate = n(v, 'rate');
      if (yearly < SUKANYA_MIN_YEARLY) return fail('The account needs at least ₹250 a year.');
      if (yearly > SUKANYA_MAX_YEARLY) return fail('The account takes at most ₹1,50,000 in a financial year.');
      if (depositYears < 1 || depositYears > SUKANYA_DEPOSIT_YEARS) return fail('Deposits can be made for 1 to 15 years.');
      if (years < 1 || years > SUKANYA_MATURITY_YEARS) return fail('Enter 1 to 21 years.');
      if (years < depositYears) return fail('The years shown cannot be fewer than the years of deposits.');
      if (rate < 0 || rate > 15) return fail('Enter a rate between 0 and 15.');
      const rows = schemePlan({ yearly, depositYears, years, rate, pattern: s(v, 'pattern') === 'monthly' ? 'monthly' : 'yearly' });
      const last = rows[rows.length - 1]!;
      const invested = yearly * depositYears;
      const result: Result = {
        metrics: [
          { label: 'Maturity value', value: last.balance, kind: 'money', big: true },
          { label: 'Amount invested', value: invested, kind: 'money' },
          { label: 'Interest earned', value: last.balance - invested, kind: 'money' },
        ],
        table: { title: 'Year-by-year balance', columns: ['Year', 'Deposited', 'Interest', 'Balance'], kinds: ['number', 'money', 'money', 'money'], rows: rows.map((r) => [r.year, r.deposited, r.interest, r.balance]) },
        note: `At ${rate}% a year, with interest credited at the end of each financial year. The National Savings Institute states that the interest is free from income tax. The Government can change the rate every quarter, and this uses the rate you enter for every year.${years < SUKANYA_MATURITY_YEARS ? ' The account matures after 21 years, so this is not the final maturity value.' : ''} The actual account starts in the year it is opened, so its financial years may not line up with these years.`,
      };
      return result;
    },
    formula: [
      'Each year: balance = (balance + deposit) × (1 + rate ÷ 100)',
      'A yearly deposit is made on or before 5 April, so it earns for the whole year',
      'After deposits stop at year 15: balance = balance × (1 + rate ÷ 100) each year until maturity at year 21',
      'Monthly deposits: each month the lowest balance earns the rate ÷ 12, and the year’s interest is added at the end of the year',
      'The account takes ₹250 to ₹1,50,000 in a financial year',
    ],
    example: '₹1,50,000 put in each year on or before 5 April, for 15 years at 8.2%: the balance after year 1 is (0 + 1,50,000) × 1.082 = ₹1,62,300, and after year 15 it is ₹44,75,989. No more is deposited after that, but the balance keeps earning and reaches ₹71,82,119 at year 21, of which ₹22,50,000 is what you invested and ₹49,32,119 is interest.',
    how: [
      'A Sukanya Samriddhi account is a government savings account opened by a guardian for a girl child. You can put in ₹250 to ₹1,50,000 in a financial year, for 15 years from the date of opening, and the account matures 21 years after it is opened.',
      'Interest for a month is worked out on the lowest balance between the close of the 5th day and the end of that month, and it is credited at the end of each financial year. So money deposited by the 5th earns for that whole month, and one deposit on or before 5 April earns for the full year.',
      'The rate is set by the Government and the National Savings Institute lists it as 8.2% from 1 January 2024. It is reviewed every quarter, so the calculator lets you change it. The calculator does not cover withdrawals for education or closure on marriage.',
    ],
    faqs: [
      { q: 'How much can I invest in a Sukanya Samriddhi account?', a: 'At least ₹250 and at most ₹1,50,000 in a financial year.' },
      { q: 'For how many years can I deposit?', a: 'For fifteen years from the date of opening the account. It matures after twenty-one years.' },
      { q: 'Does interest continue after the deposits stop?', a: 'Yes. The balance in the account keeps earning the scheme rate until it matures or is closed.' },
      { q: 'What is the Sukanya Samriddhi interest rate?', a: 'The National Savings Institute shows 8.2% from 1 January 2024. The Government reviews the rate every quarter, so check the current one.' },
      { q: 'Is the interest taxed?', a: 'The National Savings Institute states that the interest is free from income tax. Check the current rules for your situation.' },
    ],
    related: ['ppf-calculator', 'compound-interest-calculator', 'sip-calculator'],
    rules: SUKANYA_RULES,
  },
];

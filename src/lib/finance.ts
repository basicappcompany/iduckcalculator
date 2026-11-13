/** Pure money maths. No formatting, no browser. Every function here has a known-answer test in tests/unit/finance.test.ts. */

export interface YearRow {
  year: number;
  /** Money paid in (instalments or deposits) during the year. */
  paid: number;
  /** Interest or gain during the year. */
  interest: number;
  /** Principal repaid during the year (loans only). */
  principal: number;
  /** Balance left at the end of the year (loan outstanding, or investment value). */
  balance: number;
}

const monthlyRate = (annualPercent: number): number => annualPercent / 1200;

/** Monthly instalment for a loan: P r (1+r)^n / ((1+r)^n - 1). A 0% loan is just P / n. */
export function emi(principal: number, annualRatePercent: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = monthlyRate(annualRatePercent);
  if (r === 0) return principal / months;
  const f = (1 + r) ** months;
  return (principal * r * f) / (f - 1);
}

export interface LoanPlan {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  /** Months until the loan is actually cleared (shorter than asked when prepayments are used). */
  months: number;
  years: YearRow[];
}

/**
 * Month-by-month repayment, summed by year. `extraMonthly` is paid on top of the EMI every month and
 * `lumpSum` is paid once after `lumpSumMonth` instalments. Extra money goes straight to principal.
 */
export function loanPlan(principal: number, annualRatePercent: number, months: number, extraMonthly = 0, lumpSum = 0, lumpSumMonth = 0): LoanPlan {
  const base = emi(principal, annualRatePercent, months);
  const r = monthlyRate(annualRatePercent);
  let balance = principal;
  let totalInterest = 0;
  let totalPaid = 0;
  let m = 0;
  const years: YearRow[] = [];
  let row: YearRow = { year: 1, paid: 0, interest: 0, principal: 0, balance };
  while (balance > 0.005 && m < months * 2 + 12 && base > 0) {
    m += 1;
    const interest = balance * r;
    let principalPart = Math.min(balance, base - interest + extraMonthly);
    if (lumpSum > 0 && m === lumpSumMonth) principalPart = Math.min(balance, principalPart + lumpSum);
    // The last instalment may be smaller than the EMI.
    const paid = interest + principalPart;
    balance = Math.max(0, balance - principalPart);
    totalInterest += interest;
    totalPaid += paid;
    row.paid += paid;
    row.interest += interest;
    row.principal += principalPart;
    row.balance = balance;
    if (m % 12 === 0 || balance <= 0.005) {
      years.push(row);
      row = { year: years.length + 1, paid: 0, interest: 0, principal: 0, balance };
    }
  }
  return { emi: base, totalPayment: totalPaid, totalInterest, months: m, years };
}

/** The biggest loan whose EMI fits a monthly budget: the EMI formula solved for the principal. */
export function affordableLoan(monthlyBudget: number, annualRatePercent: number, months: number): number {
  if (monthlyBudget <= 0 || months <= 0) return 0;
  const r = monthlyRate(annualRatePercent);
  if (r === 0) return monthlyBudget * months;
  const f = (1 + r) ** months;
  return (monthlyBudget * (f - 1)) / (r * f);
}

/** Future value of a monthly SIP, paid at the start of each month (the usual convention): P ((1+i)^n - 1)/i (1+i). */
export function sipFutureValue(monthly: number, annualRatePercent: number, months: number): number {
  if (monthly <= 0 || months <= 0) return 0;
  const i = monthlyRate(annualRatePercent);
  if (i === 0) return monthly * months;
  return monthly * (((1 + i) ** months - 1) / i) * (1 + i);
}

/** SIP year by year (balance after each year). */
export function sipYears(monthly: number, annualRatePercent: number, years: number): YearRow[] {
  const rows: YearRow[] = [];
  let prev = 0;
  for (let y = 1; y <= years; y++) {
    const value = sipFutureValue(monthly, annualRatePercent, y * 12);
    const invested = monthly * 12;
    rows.push({ year: y, paid: invested, interest: value - prev - invested, principal: invested, balance: value });
    prev = value;
  }
  return rows;
}

/** A single deposit growing at an annual rate, compounded `perYear` times a year. */
export function compound(principal: number, annualRatePercent: number, years: number, perYear = 1): number {
  if (principal <= 0 || years < 0) return 0;
  return principal * (1 + annualRatePercent / 100 / perYear) ** (perYear * years);
}

export function compoundYears(principal: number, annualRatePercent: number, years: number, perYear = 1): YearRow[] {
  const rows: YearRow[] = [];
  let prev = principal;
  for (let y = 1; y <= years; y++) {
    const value = compound(principal, annualRatePercent, y, perYear);
    rows.push({ year: y, paid: 0, interest: value - prev, principal: 0, balance: value });
    prev = value;
  }
  return rows;
}

export function simpleInterest(principal: number, annualRatePercent: number, years: number): number {
  return (principal * annualRatePercent * years) / 100;
}

/** Compound annual growth rate in percent. Returns NaN when the start value or the period is not positive. */
export function cagr(start: number, end: number, years: number): number {
  if (start <= 0 || end < 0 || years <= 0) return NaN;
  return ((end / start) ** (1 / years) - 1) * 100;
}

/** SIP whose monthly amount rises by `stepPercent` at the start of every year. Deposits at the start of each month. */
export function stepUpSip(monthly: number, stepPercent: number, annualRatePercent: number, years: number): YearRow[] {
  const i = monthlyRate(annualRatePercent);
  const rows: YearRow[] = [];
  let balance = 0;
  let amount = monthly;
  for (let y = 1; y <= years; y++) {
    const start = balance;
    for (let m = 0; m < 12; m++) balance = (balance + amount) * (1 + i);
    const invested = amount * 12;
    rows.push({ year: y, paid: invested, interest: balance - start - invested, principal: invested, balance });
    amount *= 1 + stepPercent / 100;
  }
  return rows;
}

export interface SwpPlan {
  years: YearRow[];
  /** Months the money lasts, capped at the plan length. */
  monthsLasted: number;
  lasts: boolean;
  finalBalance: number;
  totalWithdrawn: number;
}

/** Systematic withdrawal: take `monthly` out at the start of each month, the rest earns the annual rate. */
export function swp(corpus: number, monthly: number, annualRatePercent: number, years: number): SwpPlan {
  const i = monthlyRate(annualRatePercent);
  let balance = corpus;
  let withdrawn = 0;
  let lasted = 0;
  const rows: YearRow[] = [];
  for (let y = 1; y <= years; y++) {
    const start = balance;
    let paid = 0;
    for (let m = 0; m < 12 && balance > 0; m++) {
      const take = Math.min(monthly, balance);
      balance = (balance - take) * (1 + i);
      paid += take;
      withdrawn += take;
      lasted += 1;
    }
    rows.push({ year: y, paid, interest: balance - start + paid, principal: paid, balance });
  }
  return { years: rows, monthsLasted: lasted, lasts: balance > 0 || lasted >= years * 12, finalBalance: balance, totalWithdrawn: withdrawn };
}

/** Recurring deposit maturity with quarterly compounding, the way Indian banks quote it: R((1+i)^n - 1) / (1 - (1+i)^(-1/3)), i = rate/400, n = quarters. */
export function recurringDeposit(monthly: number, annualRatePercent: number, months: number): number {
  if (monthly <= 0 || months <= 0) return 0;
  const i = annualRatePercent / 400;
  if (i === 0) return monthly * months;
  const quarters = months / 3;
  return (monthly * ((1 + i) ** quarters - 1)) / (1 - (1 + i) ** (-1 / 3));
}

/** What `amount` costs after `years` of `inflationPercent` a year. */
export function inflate(amount: number, inflationPercent: number, years: number): number {
  return amount * (1 + inflationPercent / 100) ** years;
}

/**
 * Money needed on the day you retire to fund `annualExpense` (in that day's rupees) for `retirementYears`, with the
 * expense rising by `inflationPercent` each year and the corpus earning `returnPercent`. Withdrawals at the start of each year.
 */
export function retirementCorpus(annualExpense: number, inflationPercent: number, returnPercent: number, retirementYears: number): number {
  const g = 1 + inflationPercent / 100;
  const r = 1 + returnPercent / 100;
  if (retirementYears <= 0 || annualExpense <= 0) return 0;
  const q = g / r;
  if (Math.abs(q - 1) < 1e-12) return annualExpense * retirementYears;
  return (annualExpense * (1 - q ** retirementYears)) / (1 - q);
}

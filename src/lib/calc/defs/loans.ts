import { affordableLoan, emi, loanPlan, type YearRow } from '../../finance';
import { fail, n, num, sel, type CalcDef, type Result, type Values } from '../types';

const loanTable = (years: YearRow[]) => ({
  columns: ['Year', 'Paid', 'Principal', 'Interest', 'Balance'],
  kinds: ['number', 'money', 'money', 'money', 'money'] as ('number' | 'money')[],
  rows: years.map((y) => [y.year, y.paid, y.principal, y.interest, y.balance]),
});
const loanChart = (years: YearRow[]) => ({
  title: 'Yearly payments: principal and interest',
  labels: years.map((y) => String(y.year)),
  series: [
    { name: 'Principal', values: years.map((y) => y.principal) },
    { name: 'Interest', values: years.map((y) => y.interest) },
  ],
  money: true,
});

/** Shared by the EMI family: principal, annual rate and tenure in years (or months). */
function emiResult(v: Values): Result {
  const principal = n(v, 'principal');
  const rate = n(v, 'rate');
  const months = Math.round(n(v, 'tenure') * (v['tenureUnit'] === 'months' ? 1 : 12));
  if (principal <= 0) return fail('Enter the loan amount.');
  if (months <= 0) return fail('Enter how long the loan runs.');
  if (rate < 0) return fail('The interest rate cannot be negative.');
  const plan = loanPlan(principal, rate, months);
  return {
    metrics: [
      { label: 'Monthly EMI', value: plan.emi, kind: 'money', big: true },
      { label: 'Total interest', value: plan.totalInterest, kind: 'money' },
      { label: 'Total payment', value: plan.totalPayment, kind: 'money' },
      { label: 'Interest share of what you pay', value: (plan.totalInterest / plan.totalPayment) * 100, kind: 'percent', decimals: 1 },
    ],
    table: loanTable(plan.years),
    chart: loanChart(plan.years),
  };
}

const loanFields = (principal: number, rate: number, tenure: number) =>
  [
    num('principal', 'Loan amount', principal, { unit: 'money', min: 0, step: 10000 }),
    num('rate', 'Interest rate per year', rate, { unit: 'percent', min: 0, max: 40, step: 0.05 }),
    num('tenure', 'Loan tenure', tenure, { min: 0, max: 40, step: 1 }),
    sel('tenureUnit', 'Tenure in', 'years', [
      ['years', 'Years'],
      ['months', 'Months'],
    ]),
  ] as const;

const EMI_FORMULA = ['EMI = P × r × (1 + r)^n ÷ ((1 + r)^n − 1)', 'P = loan amount, r = interest rate per year ÷ 12 ÷ 100, n = number of monthly instalments'];

export const LOANS: CalcDef[] = [
  {
    slug: 'emi-calculator',
    name: 'EMI calculator',
    group: 'loans',
    emoji: '💰',
    summary: 'Monthly instalment, total interest and a year-by-year repayment table for any loan.',
    quick: 'Enter the loan amount, the yearly interest rate and the tenure to see the monthly EMI. A ₹10,00,000 loan at 9% for 20 years has an EMI of about ₹8,997.',
    keywords: 'equated monthly instalment loan monthly payment repayment interest tenure bank',
    title: 'EMI Calculator: monthly loan instalment and interest',
    description: 'Free EMI calculator. Enter the loan amount, interest rate and tenure to see your monthly EMI, total interest and a year-by-year table. Runs in your browser.',
    fields: loanFields(1000000, 9, 20),
    compute: emiResult,
    formula: EMI_FORMULA,
    example: 'A loan of ₹10,00,000 at 9% a year for 20 years: r = 9 ÷ 12 ÷ 100 = 0.0075 and n = 240, so EMI = ₹8,997 a month. Over 240 months you pay ₹21,59,342, of which ₹11,59,342 is interest.',
    how: [
      'A loan is repaid in equal monthly instalments (EMIs). Each EMI has two parts: the interest on the balance still owed, and a slice of the principal.',
      'In the first months most of the EMI is interest. As the balance falls, the interest part shrinks and more of each EMI repays principal. The yearly table below shows this shift.',
      'The calculator uses the standard reducing-balance method that banks use. Your lender may add processing fees or round differently, so the bank schedule can differ by a few rupees.',
    ],
    faqs: [
      { q: 'What does EMI stand for?', a: 'Equated Monthly Instalment: the fixed amount you pay your lender every month until the loan is cleared.' },
      { q: 'Does a longer tenure lower the EMI?', a: 'Yes, but you pay far more interest overall. Stretching the example loan from 15 to 25 years lowers the EMI and raises the total interest by lakhs.' },
      { q: 'Is the interest rate fixed or floating?', a: 'The calculator assumes one rate for the whole loan. On a floating-rate loan the EMI or the tenure changes when the rate changes, so treat the result as an estimate.' },
      { q: 'Are processing fees included?', a: 'No. Fees, insurance and taxes charged by the lender are extra and not part of this calculation.' },
      { q: 'How is interest charged each month?', a: 'Each month the interest is the outstanding balance times the yearly rate divided by 12. That is why paying principal early saves interest.' },
    ],
    related: ['home-loan-emi-calculator', 'loan-prepayment-calculator', 'loan-eligibility-calculator'],
  },
  {
    slug: 'home-loan-emi-calculator',
    name: 'Home loan EMI calculator',
    group: 'loans',
    emoji: '🏠',
    summary: 'EMI for a home loan, with the interest you pay over 15 to 30 years.',
    quick: 'Enter the home loan amount, rate and years. A ₹50,00,000 home loan at 8.5% for 20 years costs about ₹43,391 a month and ₹54.14 lakh in interest.',
    keywords: 'housing loan mortgage property flat house bank sbi hdfc',
    title: 'Home Loan EMI Calculator: monthly payment and interest',
    description: 'Work out the EMI on a home loan. See the monthly instalment, the total interest over the full tenure and a yearly principal and interest table.',
    fields: loanFields(5000000, 8.5, 20),
    compute: emiResult,
    formula: EMI_FORMULA,
    example: 'A home loan of ₹50,00,000 at 8.5% for 20 years: EMI = ₹43,391. Total paid = ₹1,04,13,879, so interest is ₹54,13,879, more than the amount you borrowed.',
    how: [
      'A home loan runs for many years, so the interest adds up to a large share of what you repay. Even a small cut in the rate changes the total by lakhs.',
      'The table shows how much principal is left after each year. In the early years the balance falls slowly because most of the EMI goes to interest.',
      'Home loans usually allow part-payments without a penalty on floating rates. Try the loan prepayment calculator to see how much one lump sum saves.',
    ],
    faqs: [
      { q: 'How much home loan can I get?', a: 'Lenders look at your income and existing EMIs. The loan eligibility calculator estimates the largest loan your income can support.' },
      { q: 'What is a good tenure for a home loan?', a: 'A shorter tenure means a higher EMI but far less interest. Pick the shortest tenure whose EMI you can pay comfortably.' },
      { q: 'Does the EMI change if the repo rate changes?', a: 'On a floating-rate loan the lender adjusts the EMI or the tenure when the rate resets. This calculator uses one fixed rate.' },
      { q: 'Are stamp duty and registration included?', a: 'No. They are paid separately and are not part of the loan EMI.' },
    ],
    related: ['emi-calculator', 'loan-prepayment-calculator', 'loan-eligibility-calculator'],
  },
  {
    slug: 'car-loan-emi-calculator',
    name: 'Car loan EMI calculator',
    group: 'loans',
    emoji: '🚗',
    summary: 'EMI for a car loan over 3 to 7 years.',
    quick: 'Enter the loan amount after your down payment, the rate and the years. A ₹8,00,000 car loan at 9.5% for 5 years is about ₹16,801 a month.',
    keywords: 'auto vehicle loan car finance down payment',
    title: 'Car Loan EMI Calculator: monthly instalment and interest',
    description: 'Free car loan EMI calculator. Enter the amount you borrow, the interest rate and the tenure to see the monthly EMI and the total interest paid.',
    fields: loanFields(800000, 9.5, 5),
    compute: emiResult,
    formula: EMI_FORMULA,
    example: 'A car loan of ₹8,00,000 at 9.5% for 5 years (60 months): EMI = ₹16,801. You repay ₹10,08,089 in total, so the loan costs ₹2,08,089 in interest.',
    how: [
      'Enter only the amount you borrow, which is the car price minus your down payment. A bigger down payment lowers both the EMI and the interest.',
      'Car loans are short, so the interest share is smaller than on a home loan, but the rate is usually higher.',
      'Compare tenures: 3 years costs more each month and far less interest than 7 years.',
    ],
    faqs: [
      { q: 'Should I take a 5-year or 7-year car loan?', a: 'The 7-year EMI is lower but the total interest is much higher, and the car loses value faster than you repay. Choose the shortest tenure you can afford.' },
      { q: 'Does the down payment reduce the EMI?', a: 'Yes. Subtract it from the car price before entering the loan amount.' },
      { q: 'Is the on-road price what I should borrow against?', a: 'Lenders often finance a share of the ex-showroom price. Enter the amount the lender actually offers.' },
      { q: 'Can I close a car loan early?', a: 'Usually yes, sometimes with a foreclosure charge. Check your loan agreement, then use the prepayment calculator to see the saving.' },
    ],
    related: ['emi-calculator', 'personal-loan-emi-calculator', 'loan-prepayment-calculator'],
  },
  {
    slug: 'personal-loan-emi-calculator',
    name: 'Personal loan EMI calculator',
    group: 'loans',
    emoji: '🧾',
    summary: 'EMI for an unsecured personal loan, usually 1 to 5 years.',
    quick: 'Enter the amount, the rate and the tenure. A ₹3,00,000 personal loan at 14% for 3 years is about ₹10,253 a month.',
    keywords: 'unsecured loan cash loan instant loan wedding travel',
    title: 'Personal Loan EMI Calculator: instalment and total interest',
    description: 'Free personal loan EMI calculator. See the monthly EMI, total interest and repayment schedule for an unsecured loan before you apply.',
    fields: loanFields(300000, 14, 3),
    compute: emiResult,
    formula: EMI_FORMULA,
    example: 'A personal loan of ₹3,00,000 at 14% for 3 years: EMI = ₹10,253. You pay ₹3,69,118 in total, which is ₹69,118 of interest.',
    how: [
      'Personal loans carry no security, so rates are higher than for home or car loans. That makes the tenure choice matter more.',
      'Use the table to see how quickly the balance falls. If you can, repay a lump sum early; the prepayment calculator shows the interest saved.',
      'Remember that processing fees (often 1 to 3%) are not in this calculation.',
    ],
    faqs: [
      { q: 'Why is the personal loan rate higher?', a: 'There is no property or vehicle as security, so the lender takes more risk and charges more.' },
      { q: 'What EMI is safe for my income?', a: 'Lenders usually want all your EMIs together to stay under about 40 to 50% of monthly income. See the loan eligibility calculator.' },
      { q: 'Is a flat rate the same as a reducing rate?', a: 'No. A flat rate charges interest on the full amount for the whole tenure, so it costs much more than the same quoted reducing rate. This calculator uses the reducing rate.' },
      { q: 'Can I prepay a personal loan?', a: 'Often yes, after a few EMIs and sometimes with a fee of 2 to 5% of the amount prepaid. Read your agreement first.' },
    ],
    related: ['emi-calculator', 'car-loan-emi-calculator', 'loan-eligibility-calculator'],
  },
  {
    slug: 'loan-prepayment-calculator',
    name: 'Loan prepayment calculator',
    group: 'loans',
    emoji: '⏩',
    summary: 'See how much interest and time an extra payment saves.',
    quick: 'Add an extra monthly amount or a one-time lump sum to see how many months and how much interest you save. ₹5,000 extra a month on a ₹10,00,000, 9%, 20-year loan clears it in about 8 years 7 months instead of 20.',
    keywords: 'part payment foreclosure extra emi reduce tenure save interest',
    title: 'Loan Prepayment Calculator: interest and time saved',
    description: 'Free loan prepayment calculator. Enter an extra monthly payment or a lump sum and see the interest saved and the months cut from your loan.',
    fields: [
      num('principal', 'Loan amount', 1000000, { unit: 'money', min: 0, step: 10000 }),
      num('rate', 'Interest rate per year', 9, { unit: 'percent', min: 0, max: 40, step: 0.05 }),
      num('tenure', 'Original tenure', 20, { unit: 'years', min: 0, max: 40, step: 1 }),
      num('extra', 'Extra payment every month', 5000, { unit: 'money', min: 0, step: 500 }),
      num('lump', 'One-time lump sum', 0, { unit: 'money', min: 0, step: 10000 }),
      num('lumpMonth', 'Lump sum paid after this many EMIs', 24, { unit: 'months', min: 1, step: 1 }),
    ],
    compute: (v) => {
      const principal = n(v, 'principal');
      const rate = n(v, 'rate');
      const months = Math.round(n(v, 'tenure') * 12);
      if (principal <= 0) return fail('Enter the loan amount.');
      if (months <= 0) return fail('Enter the original tenure.');
      const base = loanPlan(principal, rate, months);
      const fast = loanPlan(principal, rate, months, n(v, 'extra'), n(v, 'lump'), Math.round(n(v, 'lumpMonth')));
      const saved = base.months - fast.months;
      return {
        metrics: [
          { label: 'Interest saved', value: base.totalInterest - fast.totalInterest, kind: 'money', big: true },
          { label: 'Time saved', value: `${Math.floor(saved / 12)} years ${saved % 12} months`, kind: 'text' },
          { label: 'New loan length', value: `${Math.floor(fast.months / 12)} years ${fast.months % 12} months`, kind: 'text' },
          { label: 'Interest without prepaying', value: base.totalInterest, kind: 'money' },
          { label: 'Interest with prepaying', value: fast.totalInterest, kind: 'money' },
        ],
        table: loanTable(fast.years),
        chart: loanChart(fast.years),
        note: 'The EMI stays the same; the extra money goes straight to principal, so the loan ends sooner.',
      };
    },
    formula: ['Each month: interest = balance × rate ÷ 12', 'Principal paid = EMI − interest + extra payment', 'The loan ends when the balance reaches 0; interest saved = interest without prepaying − interest with prepaying'],
    example: 'A ₹10,00,000 loan at 9% for 20 years with ₹5,000 extra every month: the loan ends after 103 months (8 years 7 months) instead of 240, and you save about ₹7.2 lakh in interest.',
    how: [
      'Every extra rupee you pay goes against the principal. A smaller principal means less interest next month, which compounds in your favour.',
      'This calculator keeps your EMI unchanged and shortens the loan. Some banks instead lower the EMI after a part-payment; ask yours which it does.',
      'The earlier in the loan you prepay, the more you save, because the balance carries the most interest then.',
    ],
    faqs: [
      { q: 'Is it better to prepay or invest the money?', a: 'If your loan rate is higher than what you can safely earn after tax, prepaying wins. If investments reliably beat the loan rate, investing may be better. It also depends on your comfort with risk.' },
      { q: 'Do banks charge for prepayment?', a: 'Floating-rate home loans to individuals usually have none. Fixed-rate and personal loans often do, so check the agreement.' },
      { q: 'Should I shorten the tenure or lower the EMI?', a: 'Shortening the tenure saves more interest. Lowering the EMI eases your monthly budget. This calculator shows the shorter-tenure result.' },
      { q: 'Can I combine a monthly extra and a lump sum?', a: 'Yes. Fill both boxes and the calculator applies both.' },
    ],
    related: ['emi-calculator', 'home-loan-emi-calculator', 'compound-interest-calculator'],
  },
  {
    slug: 'loan-eligibility-calculator',
    name: 'Loan eligibility calculator',
    group: 'loans',
    emoji: '✅',
    summary: 'Estimate the largest loan your income can support.',
    quick: 'Enter your monthly income, current EMIs, rate and tenure. With ₹1,00,000 income, no EMIs and a 50% limit, about ₹57.6 lakh of home loan fits at 8.5% over 20 years.',
    keywords: 'how much loan can i get borrow capacity foir income affordability',
    title: 'Loan Eligibility Calculator: how much can you borrow',
    description: 'Estimate how much loan you can get from your monthly income and existing EMIs, using the fixed obligation to income ratio lenders apply.',
    fields: [
      num('income', 'Monthly take-home income', 100000, { unit: 'money', min: 0, step: 5000 }),
      num('existing', 'Existing EMIs and obligations per month', 0, { unit: 'money', min: 0, step: 1000 }),
      num('foir', 'Share of income lenders allow for EMIs (FOIR)', 50, { unit: 'percent', min: 10, max: 80, step: 5, hint: 'Banks commonly use 40 to 55%. Ask yours.' }),
      num('rate', 'Interest rate per year', 8.5, { unit: 'percent', min: 0, max: 40, step: 0.05 }),
      num('tenure', 'Tenure', 20, { unit: 'years', min: 1, max: 40, step: 1 }),
    ],
    compute: (v) => {
      const income = n(v, 'income');
      if (income <= 0) return fail('Enter your monthly income.');
      const budget = (income * n(v, 'foir')) / 100 - n(v, 'existing');
      if (budget <= 0) return fail('Your existing obligations already use up the share of income lenders allow, so no new EMI fits.');
      const months = Math.round(n(v, 'tenure') * 12);
      const loan = affordableLoan(budget, n(v, 'rate'), months);
      return {
        metrics: [
          { label: 'Estimated eligible loan', value: loan, kind: 'money', big: true },
          { label: 'Affordable EMI', value: budget, kind: 'money' },
          { label: 'Total interest on that loan', value: budget * months - loan, kind: 'money' },
        ],
        note: 'An estimate. Lenders also check your credit score, age, job type and the property or vehicle value.',
      };
    },
    formula: ['Affordable EMI = income × FOIR − existing EMIs', 'Loan = EMI × ((1 + r)^n − 1) ÷ (r × (1 + r)^n)', 'r = rate per year ÷ 12 ÷ 100, n = tenure in months'],
    example: 'Income ₹1,00,000, no existing EMIs, FOIR 50%: affordable EMI = ₹50,000. At 8.5% for 20 years that supports a loan of ₹57,61,542.',
    how: [
      'Lenders cap your total EMIs at a share of your income, called FOIR (fixed obligation to income ratio). The calculator works backwards from the EMI you can carry to the loan it pays off.',
      'Existing EMIs on cards or other loans reduce the room for a new one, so list them all.',
      'A longer tenure or a lower rate raises the loan you qualify for, but it also raises the interest you pay in total.',
    ],
    faqs: [
      { q: 'What is FOIR?', a: 'Fixed Obligation to Income Ratio: the share of monthly income that goes to loan EMIs. Many banks allow 40 to 55%.' },
      { q: 'Does my credit score matter?', a: 'Yes. A low score can mean rejection or a higher rate, even if the income says you qualify.' },
      { q: 'Does this guarantee approval?', a: 'No. It is an estimate of capacity. The lender decides after checking your documents.' },
      { q: 'Should I borrow the full eligible amount?', a: 'Not necessarily. Borrowing less than the maximum leaves a buffer for rate rises and other expenses.' },
    ],
    related: ['emi-calculator', 'home-loan-emi-calculator', 'personal-loan-emi-calculator'],
  },
];

export { emi };

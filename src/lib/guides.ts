import { GUIDES_DATES } from './guides-dates';
import { GUIDES_HEALTH } from './guides-health';
import { GUIDES_LOANS } from './guides-loans';
import { GUIDES_MATHS } from './guides-maths';
import { GUIDES_SAVINGS } from './guides-savings';
import { GUIDES_STUDENTS } from './guides-students';
import { GUIDES_TAX } from './guides-tax';
import { GUIDES_US_TAX } from './guides-us-tax';

/** How-to guides. Every figure in them is checked by tests/unit/guides.test.ts against the same maths the calculators use. */
export interface Guide {
  slug: string;
  title: string;
  description: string;
  /** Answer-first opening, 25 to 60 words. */
  intro: string;
  steps: string[];
  sections: { h: string; p: string[] }[];
  faqs: { q: string; a: string }[];
  /** Calculators to link to. */
  calcs: string[];
  /** Other guides to link to. */
  related: string[];
  published: string;
  updated: string;
}

const CORE: readonly Guide[] = [
  {
    slug: 'how-emi-is-calculated',
    title: 'How EMI is calculated, with a worked example',
    description: 'Learn the EMI formula step by step, see how each instalment splits into interest and principal, and check a worked example for a ₹10,00,000 loan.',
    intro: 'EMI is worked out with P × r × (1 + r)^n ÷ ((1 + r)^n − 1), where P is the loan, r the monthly rate and n the number of months. A ₹10,00,000 loan at 9% for 20 years has an EMI of ₹8,997.',
    steps: [
      'Write down the loan amount (P), the yearly interest rate and the tenure.',
      'Divide the yearly rate by 12 and by 100 to get the monthly rate r. For 9% that is 0.0075.',
      'Turn the tenure into months (n). Twenty years is 240 months.',
      'Work out (1 + r)^n. Here 1.0075^240 is about 6.0092.',
      'Put the numbers into the formula to get the EMI: about ₹8,997.',
    ],
    sections: [
      {
        h: 'Why the EMI stays the same but its parts change',
        p: [
          'Every month the lender charges interest on what you still owe, not on the original loan. In month one the balance is ₹10,00,000, so the interest is 10,00,000 × 0.0075 = ₹7,500. The EMI is ₹8,997.26, so only ₹1,497 goes to principal.',
          'Next month the balance is a little lower, so the interest is a little lower and a little more of the same EMI repays principal. Near the end almost the whole instalment is principal. This is called a reducing-balance loan, and it is why paying down principal early saves so much interest.',
        ],
      },
      {
        h: 'How tenure changes what you pay',
        p: [
          'On the same ₹10,00,000 at 9%: a 10-year loan has an EMI of ₹12,668 and costs ₹5,20,109 in interest. At 15 years the EMI is ₹10,143 and the interest ₹8,25,680. At 20 years it is ₹8,997 and ₹11,59,342. At 25 years it is ₹8,392 and ₹15,17,589.',
          'A longer tenure lowers the monthly burden but makes the loan cost far more. Many people choose the shortest tenure whose EMI still fits their budget comfortably.',
        ],
      },
      {
        h: 'What the EMI does not include',
        p: ['The formula covers the principal and the interest only. Processing fees, insurance, GST on fees and any prepayment charges are separate. A lender’s schedule can also differ by a few rupees because of rounding and the date the first instalment is due.'],
      },
    ],
    faqs: [
      { q: 'What is the EMI formula?', a: 'EMI = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), with r = yearly rate ÷ 12 ÷ 100 and n = months.' },
      { q: 'Is more of my early EMI interest?', a: 'Yes. The interest is charged on the outstanding balance, which is largest at the start.' },
      { q: 'How can I reduce the total interest?', a: 'Choose a shorter tenure, make a larger down payment or prepay part of the principal.' },
      { q: 'Does a flat rate give the same EMI?', a: 'No. A flat rate charges interest on the full amount for the whole tenure and costs much more than the same quoted reducing rate.' },
    ],
    calcs: ['emi-calculator', 'home-loan-emi-calculator', 'loan-prepayment-calculator'],
    related: ['sip-vs-lumpsum'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'sip-vs-lumpsum',
    title: 'SIP vs lumpsum: which suits you, with numbers',
    description: 'Compare a monthly SIP and a one-time lumpsum with a worked example, and learn when each one makes sense for your income and risk.',
    intro: 'If you already have the money, a lumpsum has more time to grow at a steady return; if you earn month by month, a SIP is how you invest. At 12% for 10 years, ₹6,00,000 invested at once becomes ₹18,63,509, while ₹5,000 a month becomes ₹11,61,695.',
    steps: [
      'Decide whether you have a lump of money now or a regular income to invest.',
      'Pick a return you want to test, such as 8% and 12%, and the number of years.',
      'Run the lumpsum calculator with the full amount, then the SIP calculator with the monthly amount.',
      'Compare the final values, and think about what happens if markets fall right after you invest.',
    ],
    sections: [
      {
        h: 'The maths: why the lumpsum looks bigger',
        p: [
          'Assume a steady 12% a year. ₹6,00,000 invested on day one grows for the full 10 years: 6,00,000 × 1.12^10 = ₹18,63,509. A SIP of ₹5,000 a month puts in the same ₹6,00,000, but over 120 months, so most of the money is invested for less than 10 years. It reaches ₹11,61,695.',
          'That is not a fair fight: the lumpsum had all its money working from day one. If you compare like with like, a SIP is simply the way to invest money you do not have yet.',
        ],
      },
      {
        h: 'Where a SIP helps in real markets',
        p: [
          'Markets do not return a steady 12%. A SIP buys more units when prices are low and fewer when they are high, which averages your cost and removes the worry of choosing one entry day. A lumpsum invested just before a fall can take years to recover.',
          'Many people split a large sum into several parts and invest it over some months. This is not a guaranteed improvement, but it can make it easier to stay invested.',
        ],
      },
      {
        h: 'How to choose',
        p: [
          'Use a SIP if your money arrives monthly, if you are new to investing or if volatility worries you. Consider a lumpsum if you already have money you will not need for many years and you can accept the ups and downs. Whatever you choose, returns are not guaranteed, and fees and taxes reduce what you keep.',
        ],
      },
    ],
    faqs: [
      { q: 'Is SIP safer than a lumpsum?', a: 'A SIP spreads your entry over time, which reduces the risk of a badly timed purchase. It does not remove market risk.' },
      { q: 'Which gives higher returns?', a: 'It depends on what markets do. With a rising market a lumpsum usually wins; with a falling then recovering market a SIP can do better.' },
      { q: 'Can I do both?', a: 'Yes. Many investors put a lump sum in and also run a monthly SIP.' },
      { q: 'What return should I assume?', a: 'Test a range, such as 8%, 10% and 12%. No return is guaranteed.' },
    ],
    calcs: ['sip-calculator', 'lumpsum-calculator', 'step-up-sip-calculator'],
    related: ['how-emi-is-calculated'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-calculate-percentage',
    title: 'How to calculate percentage: every common case',
    description: 'Learn the five percentage calculations people need most: percent of a number, what percent, percent change, increase and decrease, with simple examples.',
    intro: 'A percentage is a number out of 100. To find X% of Y, multiply Y by X and divide by 100: 15% of 2,400 is 15 × 2,400 ÷ 100 = 360. The other common cases are shown below.',
    steps: [
      'Turn the percentage into a decimal by dividing by 100 (15% becomes 0.15).',
      'To find the percentage of a number, multiply the number by that decimal.',
      'To find what percent one number is of another, divide the part by the whole and multiply by 100.',
      'To find a percent change, subtract the old value from the new, divide by the old value and multiply by 100.',
      'To add or take off a percentage, multiply by 1 plus or minus the decimal.',
    ],
    sections: [
      {
        h: 'The five calculations',
        p: [
          'X% of Y: multiply. 20% of 80 is 0.2 × 80 = 16. What percent is X of Y: divide and multiply by 100. 30 out of 120 is 30 ÷ 120 × 100 = 25%.',
          'Increase a number by a percentage: multiply by 1 + the decimal. Adding 18% to ₹500 is 500 × 1.18 = ₹590. Decrease it: multiply by 1 − the decimal. 20% off 80 is 80 × 0.8 = 64. And to find the whole when you know a part, divide: if 360 is 15% of a number, the number is 360 ÷ 15 × 100 = 2,400.',
        ],
      },
      {
        h: 'Percentage change is not symmetric',
        p: [
          'From 80 to 100 is a 25% increase, because the change of 20 is 25% of 80. From 100 back to 80 is a 20% decrease, because the change of 20 is 20% of 100. The same gap is a different percentage depending on where you start.',
          'This is why two discounts do not add up. ₹2,000 with 25% off is ₹1,500, and a further 10% off gives ₹1,350. That is 32.5% off in total, not 35%.',
        ],
      },
      {
        h: 'Percent versus percentage points',
        p: ['If an interest rate moves from 10% to 12%, it has risen by 2 percentage points. As a percentage change of the rate itself, it has risen by 20%. News reports mix these up, so check which one is meant.'],
      },
    ],
    faqs: [
      { q: 'How do I calculate 15% of a number?', a: 'Multiply the number by 0.15, or by 15 and divide by 100.' },
      { q: 'How do I add GST to a price?', a: 'Multiply by 1 plus the rate as a decimal. At 18%, multiply by 1.18.' },
      { q: 'How do I find the original price after a discount?', a: 'Divide the sale price by 1 minus the discount. A ₹350 price after 30% off was 350 ÷ 0.7 = ₹500.' },
      { q: 'Why is a 50% rise then a 50% fall not back to the start?', a: 'The fall is taken on the bigger number. 100 up 50% is 150; 150 down 50% is 75.' },
    ],
    calcs: ['percentage-calculator', 'percentage-change-calculator', 'discount-calculator'],
    related: ['how-emi-is-calculated'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
];

/** Every guide, grouped as the guides index shows them: loans, savings, maths, dates, health, students. */
export const GUIDES: readonly Guide[] = [...CORE, ...GUIDES_LOANS, ...GUIDES_SAVINGS, ...GUIDES_TAX, ...GUIDES_US_TAX, ...GUIDES_MATHS, ...GUIDES_DATES, ...GUIDES_HEALTH, ...GUIDES_STUDENTS];

export const guidePath = (slug: string): string => `/guides/${slug}/`;
export const guideBySlug = (slug: string): Guide | undefined => GUIDES.find((g) => g.slug === slug);
export const wordCount = (g: Guide): number =>
  [g.intro, ...g.steps, ...g.sections.flatMap((s) => [s.h, ...s.p]), ...g.faqs.flatMap((f) => [f.q, f.a])].join(' ').split(/\s+/).filter(Boolean).length;

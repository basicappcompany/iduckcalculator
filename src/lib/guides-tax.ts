import type { Guide } from './guides';

/**
 * How-to guides for the tax and salary calculators. They quote rules that were read from official sources on 2026-11-14 (see
 * src/lib/calc/defs/tax.ts). Every figure is checked against the calculators in tests/unit/guides.test.ts. When the rules change, update both.
 */
export const GUIDES_TAX: readonly Guide[] = [
  {
    slug: 'how-to-choose-old-or-new-tax-regime',
    title: 'Old vs new tax regime: which is cheaper for you?',
    description: 'Compare the old and new income tax regimes for tax year 2026-27 with worked examples, the rebate, and how many deductions the old regime needs to win.',
    intro: 'Work out your tax both ways and choose the lower. For tax year 2026-27 a ₹15,00,000 salary pays ₹97,500 in the new regime and ₹2,10,600 in the old with ₹1,50,000 of deductions, and a salary up to ₹12.75 lakh pays nothing in the new regime.',
    steps: [
      'Write down your yearly salary and any other income, such as interest or rent.',
      'Add up the deductions you can really claim in the old regime, such as 80C investments, health insurance, HRA and home loan interest, and check the limit on each.',
      'Enter the salary, other income and deductions in the income tax calculator.',
      'Compare the two totals. The regime with the lower tax is the cheaper one for you this year.',
      'Choose it when you file your return or tell your employer. The new regime applies unless you opt for the old one.',
    ],
    sections: [
      {
        h: 'How the two regimes differ',
        p: [
          'In the new regime, which is the default, income up to ₹4 lakh is not taxed, and then the rate rises in bands of ₹4 lakh: 5%, 10%, 15%, 20%, 25% and 30% above ₹24 lakh. It allows a standard deduction of ₹75,000 and very few other deductions. A rebate of up to ₹60,000 makes the tax nil up to ₹12 lakh of taxable income.',
          'In the old regime income up to ₹2.5 lakh is not taxed, then 5% up to ₹5 lakh, 20% up to ₹10 lakh and 30% above. The standard deduction is ₹50,000, the rebate is up to ₹12,500 for taxable income up to ₹5 lakh, and you can deduct the things you invest in or pay for.',
        ],
      },
      {
        h: 'Worked examples for tax year 2026-27',
        p: [
          'A salary of ₹15,00,000. In the new regime the taxable income is ₹14,25,000 after the ₹75,000 standard deduction, and the tax with 4% cess is ₹97,500. In the old regime with ₹1,50,000 of deductions the taxable income is ₹13,00,000 and the tax with cess is ₹2,10,600, so the new regime costs ₹1,13,100 less.',
          'A salary of ₹10,00,000. In the new regime the tax on the slabs is ₹32,500, and the rebate cancels all of it, so you pay nothing. In the old regime with ₹1,50,000 of deductions you pay ₹75,400.',
          'Just above the rebate limit the tax rises gently, not suddenly. A salary of ₹13,00,000 pays ₹26,000 in the new regime: the tax is capped at the ₹25,000 by which the taxable income exceeds ₹12 lakh, plus cess.',
        ],
      },
      {
        h: 'When the old regime wins',
        p: ['The old regime wins when your deductions are large. On a ₹15,00,000 salary, ₹7,00,000 of deductions brings the old-regime tax to ₹65,000, below the ₹97,500 of the new regime. The break-even is ₹5,43,750 of deductions: below that the new regime is cheaper, above it the old regime is. Because the new regime also has lower rates and a rebate up to ₹12 lakh, it suits most people with modest deductions.'],
      },
    ],
    faqs: [
      { q: 'Which regime is the default?', a: 'The new regime. Its rates apply unless you opt for the old regime.' },
      { q: 'Why is there no tax on a ₹12.75 lakh salary in the new regime?', a: 'The ₹75,000 standard deduction leaves ₹12 lakh of taxable income, and the rebate of up to ₹60,000 cancels the tax on it.' },
      { q: 'How many deductions does the old regime need to win?', a: 'It depends on your income. On a ₹15,00,000 salary the break-even is ₹5,43,750 of deductions.' },
      { q: 'Are capital gains and dividends included?', a: 'No. They are taxed at special rates and the calculator leaves them out. It is for salary, interest and rent.' },
      { q: 'Can I change regime every year?', a: 'The Income Tax Department’s guidance says people with no business income can choose each year when they file their return. Check the current rules for your case.' },
    ],
    calcs: ['income-tax-calculator', 'percentage-calculator', 'sip-calculator'],
    related: ['how-to-calculate-percentage', 'how-to-calculate-sip-returns'],
    published: '2026-11-14',
    updated: '2026-11-14',
  },
  {
    slug: 'how-to-add-and-remove-gst',
    title: 'How to add and remove GST from a price, with examples',
    description: 'Add GST to a price or take it out of a GST-inclusive price, avoid the common mistake, and see the 5%, 18% and 40% rates with worked examples.',
    intro: 'To add GST multiply the price by 1 plus the rate; to remove it, divide by the same number. ₹10,000 plus 18% GST is ₹11,800, and removing 18% from ₹11,800 gives back ₹10,000. Do not just subtract 18% of the total.',
    steps: [
      'Write down the price and the GST rate for your item. The rate is on the invoice or in the official rate schedule.',
      'To add GST, turn the rate into a decimal and multiply the price by 1 plus it: 10,000 × 1.18 = ₹11,800.',
      'To find the GST alone, multiply the price by the rate: 10,000 × 18 ÷ 100 = ₹1,800.',
      'To remove GST from a price that includes it, divide by 1 plus the rate: 11,800 ÷ 1.18 = ₹10,000.',
      'Or enter the amount and the rate in the GST calculator and choose add or remove.',
    ],
    sections: [
      {
        h: 'The mistake to avoid when removing GST',
        p: [
          'It is tempting to take 18% off ₹11,800. That gives ₹2,124 of GST and a price of ₹9,676, which is wrong. The 18% was charged on the price before GST, which was ₹10,000, so the GST is ₹1,800. Always divide by 1.18 instead.',
          'The same applies at other rates. A ₹2,100 price that includes 5% GST is ₹2,000 before GST, because 2,100 ÷ 1.05 = 2,000, so ₹100 of it is GST.',
        ],
      },
      {
        h: 'The rates',
        p: [
          'After the GST reform that took effect on 22 September 2025 there are two main rates: a standard rate of 18% and a merit rate of 5%, plus a special rate of 40% for a select few goods and services. Some items are exempt or at 0%, and a few have special rates, so check the rate for your item. The Council’s October 2026 meeting changed processes such as registration, returns and refunds, not the rates.',
          'At 5%, ₹1,000 becomes ₹1,050. At 18%, ₹10,000 becomes ₹11,800. At 40%, ₹10,000 becomes ₹14,000, and removing 40% from ₹14,000 gives ₹10,000 again.',
        ],
      },
      {
        h: 'CGST, SGST and IGST',
        p: ['On an invoice the tax appears as CGST and SGST (or UTGST) when the sale is within one state, and as IGST when it is between states. The total tax is the same either way, because the IGST rate is the CGST and SGST rates added together. For a business, the GST you pay on purchases may be claimed back as input tax credit, which this calculator does not cover.'],
      },
    ],
    faqs: [
      { q: 'How do I add 18% GST?', a: 'Multiply the price by 1.18. ₹10,000 becomes ₹11,800.' },
      { q: 'How do I remove GST from a total?', a: 'Divide the total by 1 plus the rate as a decimal. ₹11,800 divided by 1.18 is ₹10,000.' },
      { q: 'What are the GST rates now?', a: 'The main rates are 5% and 18%, with a special 40% rate for a select few goods and services, in force from 22 September 2025. Some items are at 0% or have special rates.' },
      { q: 'Why does the invoice show CGST and SGST?', a: 'Because the sale is within one state. A sale between states shows IGST instead, at the same total rate.' },
    ],
    calcs: ['gst-calculator', 'percentage-calculator', 'discount-calculator'],
    related: ['how-to-calculate-percentage', 'how-to-calculate-discount-and-final-price'],
    published: '2026-11-14',
    updated: '2026-11-14',
  },
  {
    slug: 'how-to-calculate-gratuity',
    title: 'How to calculate gratuity with the 15-day formula',
    description: 'Calculate gratuity from your wages and years of service with the 15 days formula under the Code on Social Security, with worked examples and the cap.',
    intro: 'Gratuity = wages ÷ 26 × 15 × years of service, up to ₹20 lakh. With wages of ₹60,000 a month and 10 years of service it is ₹3,46,154. You need 5 years of continuous service for it on retirement or resignation, but not on death or disablement.',
    steps: [
      'Find your wages: monthly basic pay plus dearness allowance. Here: ₹60,000.',
      'Compare with half of your total monthly pay. If half the total is higher, use that instead. Here the total is ₹1,00,000, half is ₹50,000, so ₹60,000 stands.',
      'Work out fifteen days’ wages: 60,000 ÷ 26 × 15 = ₹34,615.',
      'Count your years of service. A part of a year longer than 6 months counts as a full year.',
      'Multiply: 34,615 × 10 years = ₹3,46,154. Or enter the numbers in the gratuity calculator.',
    ],
    sections: [
      {
        h: 'What counts as wages',
        p: [
          'Under the Code on Social Security, 2020, which has been in force since 21 November 2025, wages mean basic pay, dearness allowance and any retaining allowance. House rent allowance, conveyance allowance, overtime, commission and bonus are left out. But there is a floor: if those left-out payments are more than half of your total pay, the excess is added back, so wages are never less than half of your total remuneration.',
          'Suppose your basic pay is ₹30,000 of a ₹1,00,000 monthly pay. Half of the total, ₹50,000, is used as wages, so fifteen days’ wages are 50,000 ÷ 26 × 15 = ₹28,846 and 10 years gives ₹2,88,462.',
        ],
      },
      {
        h: 'Counting the years',
        p: ['Only completed years count, plus one more if the part-year is longer than six months. With wages of ₹60,000, 7 years and 7 months counts as 8 years and gives ₹2,76,923, while 7 years and 6 months counts as 7 years and gives ₹2,42,308. For a monthly salary the divisor is always 26, however many days the month has.'],
      },
      {
        h: 'Who gets it, and the maximum',
        p: ['For retirement, resignation or superannuation you need five years of continuous service. On death or disablement there is no minimum. The most that can be paid is the amount notified by the Central Government, which the Labour Ministry says is currently ₹20 lakh. For example, wages of ₹5,00,000 a month and 30 years of service give ₹86,53,846 on the formula, but only ₹20,00,000 is payable. Fixed-term, piece-rated and seasonal workers have their own rules, which the calculator does not cover.'],
      },
    ],
    faqs: [
      { q: 'How is gratuity calculated?', a: 'Wages ÷ 26 × 15 × years of service, with wages meaning basic pay plus dearness allowance, or half of total pay if that is more.' },
      { q: 'Why divide by 26?', a: 'For a monthly salary the law takes a month as 26 working days, so fifteen days’ wages is the monthly wages ÷ 26 × 15.' },
      { q: 'Do I get gratuity if I leave before five years?', a: 'Not on resignation or retirement. The five-year minimum does not apply on death or disablement.' },
      { q: 'Is there a maximum?', a: 'Yes. The Central Government notifies it, and the Labour Ministry says it is currently ₹20 lakh.' },
    ],
    calcs: ['gratuity-calculator', 'retirement-calculator', 'income-tax-calculator'],
    related: ['how-to-plan-your-retirement-corpus', 'how-to-choose-old-or-new-tax-regime'],
    published: '2026-11-14',
    updated: '2026-11-14',
  },
  {
    slug: 'how-to-calculate-hra-exemption',
    title: 'How to calculate HRA exemption, with the three limits',
    description: 'Work out the tax-free part of your house rent allowance as the least of three limits, with the eight 50% metro cities and worked examples.',
    intro: 'HRA exemption is the least of three amounts: the HRA you receive, the rent you pay minus 10% of salary, and 50% of salary in eight metro cities (40% elsewhere). With basic ₹50,000, HRA ₹20,000 and rent ₹22,000 a month in a metro, ₹2,04,000 a year is exempt.',
    steps: [
      'Write down your monthly basic pay plus dearness allowance, the HRA you get and the rent you pay. Here: ₹50,000, ₹20,000 and ₹22,000, for 12 months.',
      'Multiply by the months you lived there: salary ₹6,00,000, HRA received ₹2,40,000, rent paid ₹2,64,000.',
      'Limit 1 is the HRA received: ₹2,40,000. Limit 2 is the rent minus a tenth of salary: 2,64,000 − 60,000 = ₹2,04,000.',
      'Limit 3 is 50% of salary in a metro city (40% elsewhere): ₹3,00,000.',
      'The least of the three, ₹2,04,000, is exempt, and the remaining ₹36,000 of HRA is taxable. Or use the HRA calculator.',
    ],
    sections: [
      {
        h: 'Which limit applies',
        p: [
          'Any of the three can be the smallest. If your HRA is ₹15,000 a month, the HRA you receive, ₹1,80,000, is the smallest, so all of it is exempt. If basic pay is ₹20,000, HRA ₹12,000 and rent ₹15,000 in a metro city, the 50% limit of ₹1,20,000 is the smallest, so ₹1,20,000 is exempt and ₹24,000 is taxable. In a city outside the list the limit is 40%, ₹96,000, so the exemption falls to ₹96,000.',
          'If the rent you pay is not more than a tenth of your salary, the second limit is nil and nothing is exempt.',
        ],
      },
      {
        h: 'The eight cities and what counts as salary',
        p: ['Under rule 279 of the Income-tax Rules, 2026, the 50% limit applies in Mumbai, Kolkata, Delhi, Chennai, Hyderabad, Pune, Ahmedabad and Bengaluru, and the 40% limit applies in any other place. Salary means basic pay plus dearness allowance, if your terms of employment provide for it. Other allowances and perquisites are left out. The figures are for the months you actually lived in the rented home during the tax year.'],
      },
      {
        h: 'Old regime only',
        p: ['The Income Tax Department’s FAQ says HRA is exempt in the old tax regime and that the exemption is not available in the new regime. So the exemption only helps if you choose the old regime, and it must be weighed against the lower rates of the new one. Enter your total deductions, including the HRA exemption, in the income tax calculator to compare both regimes. Keep your rent receipts and your landlord’s details, because your employer or the tax department may ask for them.'],
      },
    ],
    faqs: [
      { q: 'How is HRA exemption calculated?', a: 'It is the least of three amounts: the HRA you receive, the rent you pay minus 10% of salary, and 50% (metro) or 40% of salary.' },
      { q: 'Which cities count as metro for HRA?', a: 'Mumbai, Kolkata, Delhi, Chennai, Hyderabad, Pune, Ahmedabad and Bengaluru. Everywhere else the limit is 40%.' },
      { q: 'Is HRA exempt in the new tax regime?', a: 'No. The Income Tax Department says the exemption is not available in the new regime.' },
      { q: 'What counts as salary for HRA?', a: 'Basic pay plus dearness allowance if your terms of employment provide for it. Other allowances do not count.' },
    ],
    calcs: ['hra-calculator', 'income-tax-calculator', 'percentage-calculator'],
    related: ['how-to-choose-old-or-new-tax-regime', 'how-to-calculate-percentage'],
    published: '2026-11-14',
    updated: '2026-11-14',
  },
  {
    slug: 'how-to-calculate-ppf-maturity',
    title: 'How to calculate PPF maturity, with worked examples',
    description: 'Work out what a Public Provident Fund account grows to, why depositing before the 5th matters, and the limits and rate, with worked examples.',
    intro: 'Each year the balance becomes (balance + deposit) × (1 + rate) when you deposit on or before 5 April. At 7.1%, ₹1,50,000 a year for 15 years grows to ₹40,68,209, of which ₹22,50,000 is what you put in and ₹18,18,209 is interest.',
    steps: [
      'Choose the yearly deposit, between ₹500 and ₹1,50,000, and the number of years. Here: ₹1,50,000 and 15.',
      'Take the interest rate. The National Savings Institute shows 7.1% from 1 April 2020, and the Government reviews it every quarter.',
      'After year 1: (0 + 1,50,000) × 1.071 = ₹1,60,650. For each later year add the deposit and multiply by 1.071.',
      'After 15 years the balance is ₹40,68,209. Subtract the ₹22,50,000 you invested to get the interest, ₹18,18,209.',
      'Or enter the deposit, the years and the rate in the PPF calculator, which also shows each year.',
    ],
    sections: [
      {
        h: 'Why the timing of deposits matters',
        p: [
          'The Scheme says interest is earned on the lowest balance in the account between the close of the 5th day and the end of the month, and is credited at the end of each year. A deposit made on or before 5 April therefore earns for all twelve months of the year.',
          'Spreading the same ₹1,50,000 over twelve monthly deposits of ₹12,500, each on or before the 5th, gives ₹39,44,599 after 15 years instead of ₹40,68,209. That is ₹1,23,610 less, only because the money went in later.',
        ],
      },
      {
        h: 'The effect of time and amount',
        p: ['At 7.1% with one deposit a year, ₹50,000 a year grows to ₹13,56,070 after 15 years. ₹1,50,000 a year grows to ₹40,68,209 after 15 years, ₹66,58,288 after 20 years and ₹1,03,08,015 after 25 years. The last years add the most, because interest is earned on interest.'],
      },
      {
        h: 'Limits, term and the rate',
        p: ['An account takes at least ₹500 and at most ₹1,50,000 in a financial year. It matures after fifteen complete financial years from the end of the year in which it was opened, and can then be extended in blocks of five years with further deposits. The rate is set by the Government and may change each quarter, so treat a long projection as an illustration. The National Savings Institute states that the interest is free from income tax.'],
      },
    ],
    faqs: [
      { q: 'How is PPF interest calculated?', a: 'On the lowest balance between the close of the 5th day and the end of each month, and credited at the end of the year.' },
      { q: 'When should I deposit?', a: 'On or before the 5th of the month, or on or before 5 April for a yearly deposit, so the money earns for the whole period.' },
      { q: 'What is the maximum I can invest?', a: '₹1,50,000 in a financial year. The minimum is ₹500.' },
      { q: 'What is the PPF rate?', a: 'The National Savings Institute shows 7.1% from 1 April 2020. It is reviewed every quarter.' },
    ],
    calcs: ['ppf-calculator', 'sip-calculator', 'compound-interest-calculator'],
    related: ['how-to-calculate-sip-returns', 'how-compound-interest-works'],
    published: '2026-11-14',
    updated: '2026-11-14',
  },
];

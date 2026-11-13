import type { Guide } from './guides';

/**
 * How-to guides for the tax and salary calculators. They quote rules for tax year 2026-27 that were read from official sources on 2026-11-14 (see
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
];

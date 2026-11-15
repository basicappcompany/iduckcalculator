import type { Guide } from './guides';

/**
 * How-to guides for the US tax calculators. They quote rules that were read from official IRS pages on 2026-11-15 (see
 * src/lib/calc/defs/us-tax.ts). Every figure is checked against the calculators in tests/unit/guides.test.ts and tests/unit/us-tax.test.ts.
 * When the rules change, update both.
 */
export const GUIDES_US_TAX: readonly Guide[] = [
  {
    slug: 'how-to-calculate-us-federal-income-tax',
    title: 'How to calculate US federal income tax for 2026',
    description: 'Work out US federal income tax for 2026 step by step: the standard deduction, the brackets, effective and marginal rates, with worked examples.',
    intro: 'Subtract your standard deduction from your income, then tax each slice of what is left at its bracket rate and add the slices up. A single filer earning $75,000 in 2026 has $58,900 of taxable income and owes $7,670, an effective rate of 10.23%.',
    steps: [
      'Pick your filing status: single, married filing jointly, married filing separately or head of household.',
      'Subtract the standard deduction for that status from your income. For 2026 it is $16,100 single, $32,200 married filing jointly and $24,150 head of household. Use your itemized deductions instead only if they are larger.',
      'Split the taxable income into slices at the bracket limits for your status and multiply each slice by its rate: 10%, 12%, 22%, 24%, 32%, 35% or 37%.',
      'Add the tax on each slice. That is your federal income tax before credits.',
      'Divide the tax by your income to get your effective rate, or enter the numbers in the US federal income tax calculator to see every bracket at once.',
    ],
    sections: [
      {
        h: 'A worked example: single, $75,000',
        p: [
          'The $16,100 standard deduction leaves $58,900 of taxable income. The first $12,400 is taxed at 10%, which is $1,240. The next $38,000, up to $50,400, is taxed at 12%, which is $4,560. The last $8,500 is taxed at 22%, which is $1,870. The tax is $7,670 in total, which is 10.23% of the $75,000 income.',
        ],
      },
      {
        h: 'Marginal rate and effective rate',
        p: [
          'Your marginal rate is the rate on your next dollar of taxable income. Your effective rate is what you pay on average. A single filer with $100,000 of income has $83,900 of taxable income and pays $13,170, an effective rate of 13.17%, although the marginal rate is 22%.',
          'Crossing into a higher bracket taxes only the income above the limit at the higher rate, not all of your income.',
        ],
      },
      {
        h: 'Married filing jointly and head of household',
        p: [
          'A married couple filing jointly with $120,000 of income takes the $32,200 standard deduction, has $87,800 of taxable income and owes $10,040, an effective rate of 8.37%. A head of household with $75,000 takes the $24,150 deduction, has $50,850 of taxable income and owes $5,748.',
        ],
      },
      {
        h: 'When itemizing helps',
        p: [
          'Itemize only if your deductions add up to more than the standard deduction. A single filer with $100,000 of income and $30,000 of itemized deductions has $70,000 of taxable income and owes $10,112 instead of $13,170, a saving of $3,058.',
        ],
      },
      {
        h: 'What this leaves out',
        p: [
          'The calculator covers federal income tax on ordinary income for tax year 2026. It does not include credits such as the child tax credit, state and local income tax, capital gains, self-employment tax or other taxes. The figures come from the IRS’s Revenue Procedure 2025-32 and were read on 15 November 2026. Check the IRS or a tax professional for your own return.',
        ],
      },
    ],
    faqs: [
      { q: 'Which year do these rates apply to?', a: 'Tax year 2026: income earned from 1 January to 31 December 2026, reported on the return you file in 2027.' },
      { q: 'What is the difference between the marginal and the effective tax rate?', a: 'The marginal rate is the rate on your next dollar of taxable income. The effective rate is your total tax divided by your total income, so it is lower.' },
      { q: 'Do I have to itemize deductions?', a: 'No. The standard deduction applies unless you itemize. Itemize only when your itemized deductions add up to more than the standard deduction.' },
      { q: 'Is Social Security tax part of federal income tax?', a: 'No. Social Security and Medicare are separate payroll taxes. The take-home pay calculator includes them.' },
      { q: 'Does the calculator include state tax?', a: 'No. It works out federal income tax only. Many states also tax income, and that is not included.' },
    ],
    calcs: ['us-income-tax-calculator', 'us-take-home-pay-calculator', 'percentage-calculator'],
    related: ['how-to-calculate-us-take-home-pay', 'how-to-calculate-percentage'],
    published: '2026-11-15',
    updated: '2026-11-15',
  },
  {
    slug: 'how-to-calculate-us-take-home-pay',
    title: 'How to calculate your US take-home pay for 2026',
    description: 'Work out your 2026 take-home pay after federal income tax, Social Security and Medicare, with worked examples and the wage base and extra Medicare rules.',
    intro: 'Take your salary and subtract federal income tax, 6.2% Social Security and 1.45% Medicare. A single filer on $75,000 pays $7,670 of income tax and $5,737.50 of payroll tax, and keeps $61,592.50 a year, or $5,132.71 a month.',
    steps: [
      'Write down your yearly salary and your filing status.',
      'Work out federal income tax: subtract the standard deduction, then apply the 2026 brackets (see the guide on federal income tax).',
      'Work out Social Security: 6.2% of your wages, but only up to the $184,500 wage base for 2026.',
      'Work out Medicare: 1.45% of all your wages, plus 0.9% on wages above $200,000 ($250,000 married filing jointly, $125,000 married filing separately).',
      'Subtract all three from your salary, and divide by 12 for a monthly figure. Or enter the salary in the take-home pay calculator.',
    ],
    sections: [
      {
        h: 'A worked example: single, $75,000',
        p: [
          'Federal income tax is $7,670. Social Security is 6.2% of $75,000, which is $4,650, and Medicare is 1.45%, which is $1,087.50. The three charges come to $13,407.50, so you keep $61,592.50 a year, or $5,132.71 a month, which is 82.12% of your pay.',
        ],
      },
      {
        h: 'A higher salary: single, $250,000',
        p: [
          'Social Security stops at the wage base, so it is $11,439 (6.2% of $184,500), not 6.2% of the whole salary. Medicare is $3,625, and the Additional Medicare Tax adds $450, which is 0.9% of the $50,000 above $200,000. With $51,304 of income tax, you keep $183,182 a year.',
        ],
      },
      {
        h: 'Married filing jointly, $120,000',
        p: [
          'A married couple filing jointly with one earner on $120,000 pays $10,040 of income tax and $9,180 of Social Security and Medicare, and keeps $100,780 a year.',
        ],
      },
      {
        h: 'What this leaves out',
        p: [
          'State and local income tax, state payroll taxes, health insurance, retirement contributions and other paycheck deductions are not included, so a real paycheck is lower. Self-employed people pay self-employment tax instead. The rates come from the IRS pages listed on the calculator, read on 15 November 2026.',
        ],
      },
    ],
    faqs: [
      { q: 'What is the Social Security wage base?', a: 'The most wages that Social Security tax applies to in a year. For 2026 it is $184,500, so no more Social Security tax is taken above that.' },
      { q: 'What is the Additional Medicare Tax?', a: 'An extra 0.9% on Medicare wages above $200,000 for most filers, $250,000 married filing jointly and $125,000 married filing separately.' },
      { q: 'Why is my real paycheck lower than the calculator says?', a: 'The calculator only takes off federal taxes. State and local tax, health insurance, retirement contributions and other deductions also come out of a real paycheck.' },
      { q: 'How is the monthly figure worked out?', a: 'The yearly take-home pay divided by 12. Your actual paycheck depends on how often you are paid.' },
    ],
    calcs: ['us-take-home-pay-calculator', 'us-income-tax-calculator', 'percentage-calculator'],
    related: ['how-to-calculate-us-federal-income-tax', 'how-to-calculate-percentage-change'],
    published: '2026-11-15',
    updated: '2026-11-15',
  },
];

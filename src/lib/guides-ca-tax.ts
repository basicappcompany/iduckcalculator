import type { Guide } from './guides';

/**
 * How-to guides for the Canada tax calculators. They quote rules that were read from official CRA pages on 2026-11-15 (see
 * src/lib/calc/defs/ca-tax.ts). Every figure is checked against the calculators in tests/unit/guides.test.ts and tests/unit/ca-tax.test.ts.
 * When the rules change, update both.
 */
export const GUIDES_CA_TAX: readonly Guide[] = [
  {
    slug: 'how-to-calculate-canadian-federal-income-tax',
    title: 'How to calculate Canadian federal income tax for 2026',
    description: 'Work out Canadian federal income tax for 2026 step by step: the five brackets, the basic personal amount credit and effective and marginal rates.',
    intro: 'Tax each slice of your taxable income at its bracket rate, add the slices up, then subtract the basic personal amount credit. Someone with $60,000 of taxable income owes $6,193 of federal income tax for 2026, an effective rate of 10.32%, before provincial tax.',
    steps: [
      'Start with your taxable income: your income after deductions such as RRSP contributions.',
      'Split it at the 2026 federal limits and multiply each slice by its rate: 14% up to $58,523, 20.5% up to $117,045, 26% up to $181,440, 29% up to $258,482 and 33% above.',
      'Add the tax on each slice.',
      'Subtract the basic personal amount credit: 14% of $16,452 for most people, which is $2,303.28. Above $181,440 of income the amount shrinks in a straight line to $14,829 at $258,482.',
      'Divide the result by your taxable income for your effective rate, or enter the figure in the Canada federal income tax calculator to see every bracket at once.',
    ],
    sections: [
      {
        h: 'A worked example: $60,000',
        p: [
          'The first $58,523 is taxed at 14%, which is $8,193.22. The other $1,477 is taxed at 20.5%, which is $302.79. The tax before credits is $8,496.01. The basic personal amount credit takes off $2,303.28, so the federal tax is $6,192.73, or about $6,193, which is 10.32% of the income.',
        ],
      },
      {
        h: 'Lower and higher incomes',
        p: [
          'On $30,000, everything is in the 14% bracket: $4,200 before the credit and $1,897 after it, an effective rate of 6.32%. On $100,000, $58,523 is taxed at 14% and the other $41,477 at 20.5%, which is $16,696.01 before the credit and $14,393 after it, an effective rate of 14.39%.',
        ],
      },
      {
        h: 'Marginal and effective rates',
        p: [
          'Your marginal rate is the rate on your next dollar of taxable income, which is 20.5% at $100,000. Your effective rate is what you pay on average, which is lower. Moving into a higher bracket taxes only the income above the limit at the higher rate, not all of your income.',
        ],
      },
      {
        h: 'What this leaves out',
        p: [
          'The calculator covers federal income tax for 2026 with the basic personal amount credit. It does not include provincial or territorial tax, which every province charges on top, the Canada employment amount, CPP and EI credits, or other credits and deductions. The figures come from the Canada Revenue Agency and were read on 15 November 2026. Check the CRA or a tax professional for your own return.',
        ],
      },
    ],
    faqs: [
      { q: 'Which tax year do these rates apply to?', a: 'Tax year 2026: income earned from 1 January to 31 December 2026, reported on the return you file in 2027.' },
      { q: 'Does the calculator include provincial tax?', a: 'No. It works out federal income tax only. Every province and territory charges its own income tax on top of it.' },
      { q: 'What is the basic personal amount?', a: 'A tax credit amount that almost everyone can claim. For 2026 it is $16,452, which is worth 14% of that, or $2,303.28, for most people.' },
      { q: 'What is the difference between the marginal and the effective rate?', a: 'The marginal rate is the rate on your next dollar of taxable income. The effective rate is your total tax divided by your income, so it is lower.' },
      { q: 'Is CPP part of income tax?', a: 'No. The Canada Pension Plan and Employment Insurance are separate payroll contributions. The take-home pay calculator includes them.' },
    ],
    calcs: ['ca-income-tax-calculator', 'ca-take-home-pay-calculator', 'percentage-calculator'],
    related: ['how-to-calculate-canadian-take-home-pay', 'how-to-calculate-percentage'],
    published: '2026-11-15',
    updated: '2026-11-15',
  },
  {
    slug: 'how-to-calculate-canadian-take-home-pay',
    title: 'How to calculate your Canadian take-home pay for 2026',
    description: 'Work out your 2026 Canadian pay after federal income tax, CPP and EI, with worked examples, the CPP2 band and why provincial tax comes off on top.',
    intro: 'Take your salary and subtract federal income tax, CPP and EI. On a $60,000 salary you pay $5,338 of federal income tax, $3,362 of CPP and $978 of EI, and keep $50,322 a year, or $4,193 a month, before provincial tax.',
    steps: [
      'Write down your yearly salary.',
      'Work out CPP: 5.95% of your earnings between $3,500 and $74,600, then 4% (CPP2) on earnings from $74,600 up to $85,000.',
      'Work out EI: 1.63% of your earnings up to $68,900.',
      'Work out federal income tax on your salary after taking off the extra part of CPP, then subtract the credits: the basic personal amount, the Canada employment amount, the base CPP and EI.',
      'Subtract all of them from your salary, and divide by 12 for a monthly figure. Or enter the salary in the take-home pay calculator. Provincial tax then comes off on top.',
    ],
    sections: [
      {
        h: 'A worked example: $60,000',
        p: [
          'CPP is 5.95% of $56,500, which is $3,361.75, and EI is 1.63% of $60,000, which is $978. Federal income tax comes to $5,338 after the credits. The three come to $9,678 in all, so you keep $50,322 a year, or $4,193 a month, which is 83.87% of your pay.',
        ],
      },
      {
        h: 'A lower salary: $40,000',
        p: [
          'With $40,000 you pay $2,691 of federal income tax, $2,172 of CPP and $652 of EI, and keep $34,485 a year.',
        ],
      },
      {
        h: 'A higher salary: $90,000',
        p: [
          'CPP stops at the $74,600 limit and CPP2 adds 4% on the next $10,400, which is $416. CPP is $4,230.45 and EI is $1,123.07, which is the most you can pay. With $11,252 of federal income tax you keep $72,979 a year.',
        ],
      },
      {
        h: 'What this leaves out',
        p: [
          'Provincial and territorial income tax is not included, so your real pay is lower. Quebec residents pay QPP and a lower EI premium instead. RRSP contributions, benefits and other deductions are not included either. The rates come from the CRA pages listed on the calculator, read on 15 November 2026.',
        ],
      },
    ],
    faqs: [
      { q: 'What is CPP2?', a: 'A second CPP contribution of 4% on earnings between $74,600 and $85,000 in 2026, which is at most $416.' },
      { q: 'What is the maximum EI premium for 2026?', a: 'EI is 1.63% of earnings up to $68,900 outside Quebec, so the most you pay is $1,123.07.' },
      { q: 'Why is my real paycheque lower than the calculator says?', a: 'The calculator only takes off federal income tax, CPP and EI. Provincial income tax, benefits and RRSP contributions also come out of a real paycheque.' },
      { q: 'Why is part of my CPP deducted from income?', a: 'Only the base 4.95% of CPP earns a credit. The extra 1% and CPP2 are deducted from your taxable income, which lowers your federal tax.' },
      { q: 'How is the monthly figure worked out?', a: 'The yearly take-home pay divided by 12. Your actual paycheque depends on how often you are paid.' },
    ],
    calcs: ['ca-take-home-pay-calculator', 'ca-income-tax-calculator', 'percentage-calculator'],
    related: ['how-to-calculate-canadian-federal-income-tax', 'how-to-calculate-percentage-change'],
    published: '2026-11-15',
    updated: '2026-11-15',
  },
];

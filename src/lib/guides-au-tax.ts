import type { Guide } from './guides';

/**
 * How-to guides for the Australia tax calculators. They quote rules that were read from official ATO pages on 2026-11-22 (see
 * src/lib/calc/defs/au-tax.ts). Every figure is checked against the calculators in tests/unit/guides.test.ts and tests/unit/au-tax.test.ts.
 * When the rules change, update both.
 */
export const GUIDES_AU_TAX: readonly Guide[] = [
  {
    slug: 'how-to-calculate-australian-income-tax',
    title: 'How to calculate Australian income tax for 2026–27',
    description: 'Work out Australian resident income tax for 2026–27 step by step: the brackets, the low income tax offset, the Medicare levy and your effective rate.',
    intro: 'Tax each slice of your taxable income at its bracket rate, add the slices up, subtract the low income tax offset, then add the 2% Medicare levy. Someone with $60,000 of taxable income pays $8,420 of income tax and $1,200 of Medicare levy for 2026–27, $9,620 in all, which is 16.03% of income.',
    steps: [
      'Start with your taxable income: your income after deductions.',
      'Split it at the 2026–27 resident limits and multiply each slice by its rate: nothing up to $18,200, 15% up to $45,000, 30% up to $135,000, 37% up to $190,000 and 45% above.',
      'Add the tax on each slice.',
      'Subtract the low income tax offset: $700 up to $37,500 of income, then $700 less 5c for each $1 over $37,500, then $325 less 1.5c for each $1 over $45,000. It is nil from $66,667 and can only take the tax down to $0.',
      'Add the Medicare levy, which is 2% of taxable income, or less on a low income. Or enter your income in the Australia income tax calculator to see every step at once.',
    ],
    sections: [
      {
        h: 'A worked example: $60,000',
        p: [
          'The first $18,200 is not taxed. The next $26,800 is taxed at 15%, which is $4,020, and the last $15,000 is taxed at 30%, which is $4,500, so the tax before the offset is $8,520. The low income tax offset is $325 less 1.5c on the $15,000 over $45,000, which is $100, so income tax is $8,420. The Medicare levy is 2% of $60,000, which is $1,200. You pay $9,620 in all, which is 16.03% of your income.',
        ],
      },
      {
        h: 'Lower and higher incomes',
        p: [
          'On $30,000, the $11,800 above the tax-free amount is taxed at 15%, which is $1,770. The full $700 offset applies, so income tax is $1,070. The Medicare levy is reduced to $198.90, which is 10c for each $1 over $28,011, instead of the full 2%. In all you pay $1,268.90, an effective rate of 4.23%.',
          'On $100,000, the $26,800 at 15% is $4,020 and the $55,000 at 30% is $16,500, which is $20,520. The offset has run out, because it ends at $66,667. The Medicare levy is $2,000, so you pay $22,520 in all, an effective rate of 22.52%.',
        ],
      },
      {
        h: 'Brackets, offsets and the levy',
        p: [
          'Your bracket rate is the rate on your next dollar of taxable income. Moving into a higher bracket taxes only the income above the limit at the higher rate, not all of your income. The low income tax offset comes off the tax itself, and the Medicare levy is a separate charge on top.',
        ],
      },
      {
        h: 'What this leaves out',
        p: [
          'The calculator is for an Australian resident for the whole year who claims the tax-free threshold, for the 2026–27 income year. It does not include other tax offsets, the Medicare levy surcharge, HELP or other study loan repayments, or the family and senior thresholds for the Medicare levy. It uses the Medicare levy thresholds for 2025–26, the latest the ATO had published. The figures come from the Australian Taxation Office and were read on 22 November 2026. Check the ATO or a tax professional for your own return.',
        ],
      },
    ],
    faqs: [
      { q: 'Which income year do these rates apply to?', a: 'The 2026–27 income year, from 1 July 2026 to 30 June 2027, reported on the return you lodge after 30 June 2027.' },
      { q: 'Does the calculator include the Medicare levy?', a: 'Yes. The levy is 2% of taxable income, reduced for low incomes. The calculator uses the low-income thresholds for 2025–26, the latest the ATO has published.' },
      { q: 'What is the low income tax offset?', a: 'An offset that reduces your tax by up to $700 if your taxable income is $66,667 or less. The ATO works it out for you when you lodge, and it cannot be refunded.' },
      { q: 'Who are these rates for?', a: 'An Australian resident for tax purposes for the full year who claims the tax-free threshold. Foreign residents and part-year residents are taxed differently.' },
      { q: 'What is the difference between the bracket rate and the effective rate?', a: 'The bracket rate is the rate on your next dollar of taxable income. The effective rate is your total tax divided by your income, so it is lower.' },
    ],
    calcs: ['au-income-tax-calculator', 'au-take-home-pay-calculator', 'percentage-calculator'],
    related: ['how-to-calculate-australian-take-home-pay', 'how-to-calculate-percentage'],
    published: '2026-11-22',
    updated: '2026-11-22',
  },
  {
    slug: 'how-to-calculate-australian-take-home-pay',
    title: 'How to calculate your Australian take-home pay 2026–27',
    description: 'Work out your 2026–27 Australian pay after income tax and the Medicare levy, with worked examples and a note on why super is not taken off.',
    intro: 'Take your salary and subtract income tax and the Medicare levy. On a $60,000 salary you pay $8,420 of income tax and $1,200 of Medicare levy, and keep $50,380 a year, or $4,198 a month, before any other deduction.',
    steps: [
      'Write down your yearly salary, not counting employer super.',
      'Work out income tax on it with the 2026–27 resident brackets: nothing up to $18,200, 15% up to $45,000, 30% up to $135,000, 37% up to $190,000 and 45% above.',
      'Subtract the low income tax offset, which is up to $700 and runs out at $66,667.',
      'Add the Medicare levy: 2% of your income, or less on a low income.',
      'Subtract both from your salary, and divide by 12 for a monthly figure. Or enter the salary in the take-home pay calculator.',
    ],
    sections: [
      {
        h: 'A worked example: $60,000',
        p: [
          'Income tax is $8,520 before the low income tax offset and $8,420 after the $100 offset. The Medicare levy is 2% of $60,000, which is $1,200. The two come to $9,620, so you keep $50,380 a year, or $4,198 a month, which is 83.97% of your pay.',
        ],
      },
      {
        h: 'A lower salary: $40,000',
        p: [
          'With $40,000 you pay $2,695 of income tax after a $575 offset and $800 of Medicare levy, and keep $36,505 a year, or $3,042 a month.',
        ],
      },
      {
        h: 'A higher salary: $100,000',
        p: [
          'The offset has run out, so income tax is $20,520 and the Medicare levy is $2,000. You keep $77,480 a year, or $6,457 a month, which is 77.48% of your pay.',
        ],
      },
      {
        h: 'Super and what this leaves out',
        p: [
          'Your employer pays superannuation on top of your salary, so it does not reduce the figure here. HELP and other study loan repayments, other offsets, the Medicare levy surcharge, salary sacrifice and deductions are not included, so your real pay can differ. The rates come from the ATO pages listed on the calculator, read on 22 November 2026.',
        ],
      },
    ],
    faqs: [
      { q: 'Is super taken off my pay?', a: 'No. Employer superannuation is paid on top of your salary and does not reduce the take-home pay shown here.' },
      { q: 'Why are there only two deductions?', a: 'Australian employees do not pay a payroll contribution like the CPP or National Insurance, so the deductions here are income tax and the Medicare levy.' },
      { q: 'Does it include HELP repayments?', a: 'No. Repayments of a study or training loan also come out of your pay, so your real take-home pay may be lower.' },
      { q: 'Why is the Medicare levy lower on a low income?', a: 'A single person pays no levy at or below $28,011 of taxable income, and pays 10c for each $1 over that until it reaches the full 2%.' },
      { q: 'How is the monthly figure worked out?', a: 'The yearly take-home pay divided by 12. Your actual pay depends on how often you are paid.' },
    ],
    calcs: ['au-take-home-pay-calculator', 'au-income-tax-calculator', 'percentage-calculator'],
    related: ['how-to-calculate-australian-income-tax', 'how-to-calculate-percentage-change'],
    published: '2026-11-22',
    updated: '2026-11-22',
  },
];

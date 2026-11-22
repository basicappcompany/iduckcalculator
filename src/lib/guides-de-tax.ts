import type { Guide } from './guides';

/**
 * How-to guides for the Germany tax calculators. They quote rules that were read from the official laws on gesetze-im-internet.de on
 * 2026-11-23 (see src/lib/calc/defs/de-tax.ts). Every figure is checked against the calculators in tests/unit/guides.test.ts and
 * tests/unit/de-tax.test.ts. When the rules change, update both.
 */
export const GUIDES_DE_TAX: readonly Guide[] = [
  {
    slug: 'how-to-calculate-german-income-tax',
    title: 'How to calculate German income tax for 2026',
    description: 'Work out German income tax (Einkommensteuer) for 2026 step by step: the formula zones, the Solidarity Surcharge, the splitting tariff and your rates.',
    intro: 'German income tax follows a formula, not fixed brackets: nothing up to €12,348, then a rate that climbs to 42%, and 45% above €277,825. A single person with €50,000 of taxable income owes €10,548 for 2026, which is 21.10%, with no Solidarity Surcharge.',
    steps: [
      'Start with your taxable income (zu versteuerndes Einkommen): your income after deductions and allowances, rounded down to a whole euro.',
      'Find your zone. Up to €12,348 there is no tax. From €12,349 to €17,799, from €17,800 to €69,878, from €69,879 to €277,825 and from €277,826 the law gives a different formula for each.',
      'In the second zone, tax = (914.51 × y + 1,400) × y, where y is your income above €12,348 divided by 10,000. In the third zone, tax = (173.10 × z + 2,397) × z + 1,034.87, where z is your income above €17,799 divided by 10,000.',
      'In the fourth zone, tax = 0.42 × income − 11,135.63, and in the fifth, 0.45 × income − 19,470.38. Round the result down to a whole euro.',
      'If the income tax is above €20,350, add the Solidarity Surcharge of 5.5%, limited to 11.9% of the amount above €20,350. Or enter your income in the Germany income tax calculator to see every step at once.',
    ],
    sections: [
      {
        h: 'A worked example: €50,000',
        p: [
          'For a single person with €50,000 of taxable income, z = (50,000 − 17,799) ÷ 10,000 = 3.2201. The tax is (173.10 × 3.2201 + 2,397) × 3.2201 + 1,034.87 = €10,548.33, which is rounded down to €10,548. The income tax is below €20,350, so there is no Solidarity Surcharge. The effective rate is 21.10%, and the rate on your next euro is about 35.12%.',
        ],
      },
      {
        h: 'Lower and higher incomes',
        p: [
          'On €30,000 the income tax is €4,217, an effective rate of 14.06%. On €100,000 it is €30,864. That is above €20,350, so the Solidarity Surcharge applies: 5.5% would be €1,697.52, but the limit of 11.9% of the €10,514 above €20,350 is lower, so the surcharge is €1,251.16. Together that is €32,115.16, or 32.12%.',
        ],
      },
      {
        h: 'Married couples: the splitting tariff',
        p: [
          'Couples assessed together halve their combined taxable income, work out the tax on the half and double it. A couple with €100,000 of combined taxable income is taxed as two halves of €50,000, which is €10,548 each, so €21,096 in all. That is below €40,700, the limit for couples, so there is no Solidarity Surcharge, and the effective rate is 21.10%.',
        ],
      },
      {
        h: 'What this leaves out',
        p: [
          'The calculator taxes the taxable income you enter for 2026. It does not work out that income from a salary, and it does not include church tax, child allowances, the progression clause or special rules for one-off payments and capital income. It is not your take-home pay, which also depends on social insurance contributions. The figures come from the German income tax and Solidarity Surcharge laws and were read on 23 November 2026. Check your own tax assessment or a tax adviser (Steuerberater) for your return.',
        ],
      },
    ],
    faqs: [
      { q: 'Which tax year do these figures apply to?', a: 'Tax year 2026, from 1 January to 31 December 2026, reported on the return you file in 2027.' },
      { q: 'What is the basic allowance?', a: 'The Grundfreibetrag. In 2026 no income tax is due on taxable income up to €12,348.' },
      { q: 'Why does the tax not use fixed brackets?', a: 'German law gives a formula for each zone, so the rate rises smoothly instead of jumping at fixed limits. The rate on your next euro starts at 14% and reaches 42% in the fourth zone.' },
      { q: 'Does the Solidarity Surcharge still apply?', a: 'Yes, but only on higher incomes. It is 5.5% of the income tax when the tax is above €20,350 (€40,700 for couples), phased in gradually above that limit.' },
      { q: 'Is this my take-home pay?', a: 'No. It taxes the taxable income you enter. Your net salary also depends on social insurance contributions and on how your payslip calculates tax during the year.' },
    ],
    calcs: ['de-income-tax-calculator', 'percentage-calculator', 'average-calculator'],
    related: ['how-to-calculate-percentage', 'how-to-calculate-percentage-change'],
    published: '2026-11-23',
    updated: '2026-11-23',
  },
];

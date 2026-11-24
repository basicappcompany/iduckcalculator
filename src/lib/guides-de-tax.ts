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
  {
    slug: 'how-to-calculate-german-take-home-pay',
    title: 'How to calculate German take-home pay for 2026',
    description: 'Work out your German net salary for 2026 step by step: wage tax by tax class, social insurance shares, the Solidarity Surcharge and an example.',
    intro: 'Your German take-home pay is your gross salary minus wage tax, the Solidarity Surcharge and your half of social insurance. In 2026 a single employee on €60,000 in tax class I, with no children, keeps €37,741 a year, about €3,145 a month, which is 62.9% of gross pay.',
    steps: [
      'Start with your gross salary (Brutto) for the year and your tax class (Steuerklasse) from your payslip.',
      'Work out your social insurance: pension 9.3% and unemployment 1.3% of salary up to €101,400, plus health 7.0% (and half your fund\'s additional contribution) and care insurance 1.8% of salary up to €69,750. Care is higher in Saxony and for people without children.',
      'Find the wage tax. Your employer takes off the €1,230 employee allowance, a €36 flat amount and a flat estimate of your insurance contributions (the Vorsorgepauschale), rounds down to whole euros and applies the income tax tariff for your tax class.',
      'If the wage tax is above €20,350 (€40,700 in tax class III), add the Solidarity Surcharge of 5.5%, limited to 11.9% of the amount above the limit.',
      'Subtract wage tax, Solidarity Surcharge and social insurance from your gross salary. Or enter your salary and tax class in the Germany take-home pay calculator to see each line at once.',
    ],
    sections: [
      {
        h: 'A worked example: €60,000 in tax class I',
        p: [
          'Take a single employee with no children, a 2.9% additional health contribution and a job outside Saxony. Pension is €5,580, unemployment €780, health €5,070 (8.45%) and care €1,440 (2.4%), so social insurance is €12,870.',
          'For the wage tax, the payroll method deducts a flat insurance estimate of €12,090 (€5,580 for pension plus €6,510 for health and care). The amount taxed is €60,000 − €1,230 − €36 − €12,090 = €46,644, which gives €9,389 of wage tax and no Solidarity Surcharge. You keep €60,000 − €9,389 − €12,870 = €37,741 a year, or €3,145 a month.',
        ],
      },
      {
        h: 'Lower and higher pay',
        p: [
          'On €36,000 in tax class I the wage tax is €3,517 and social insurance is €7,722, so you keep €24,761. On €100,000 the wage tax is €23,248, which is above €20,350, so the Solidarity Surcharge applies: 5.5% would be higher than 11.9% of the €2,898 above the limit, so it is €344.86. Social insurance is €18,167.88 because health and care stop rising at €69,750 and pension at €101,400. You keep €58,239.26.',
        ],
      },
      {
        h: 'Why the tax class matters',
        p: [
          'Tax class III halves the amount taxed and doubles the tax, so on €60,000 the wage tax is €4,822 instead of €9,389 and the take-home pay is €42,308. A partner in class V pays far more: on the same €60,000 the wage tax is €15,364. Couples often pick classes III and V, or both IV, but the final tax in the tax return is the same whichever classes are used.',
        ],
      },
      {
        h: 'What this leaves out',
        p: [
          'The calculator uses the 2026 payroll method of the Federal Ministry of Finance and the 2026 social insurance rates, read on 24 November 2026. It does not include church tax, child allowances, private health insurance, allowances on your tax card, bonuses or special employment such as mini jobs. Your own payslip is the final word, because your health fund\'s additional contribution and your tax data may differ.',
        ],
      },
    ],
    faqs: [
      { q: 'Will my payslip match this exactly?', a: 'Often within a few euros a month, but not always. Your payslip depends on your fund\'s real additional contribution, church tax, allowances on your tax card and bonuses, which the calculator does not include.' },
      { q: 'What is the Vorsorgepauschale?', a: 'A flat estimate of your social insurance that the payroll method deducts before working out the wage tax. The real contributions are only counted in your tax return, so the final tax can differ from the wage tax withheld.' },
      { q: 'Is church tax included?', a: 'No. Church tax is 8% or 9% of the wage tax depending on the state, and it lowers your take-home pay if you pay it.' },
      { q: 'Why does having children change my net pay?', a: 'Here only through the care insurance: without children you pay a 0.6% surcharge, and from the second child under 25 the rate is 0.25 points lower for each child. Child allowances affect only the Solidarity Surcharge and church tax.' },
      { q: 'Which health fund rate does it use?', a: 'The 2026 average additional contribution of 2.9%, of which you pay half. Enter your own fund\'s rate for a closer figure.' },
    ],
    calcs: ['de-take-home-pay-calculator', 'de-income-tax-calculator', 'percentage-calculator'],
    related: ['how-to-calculate-german-income-tax', 'how-to-calculate-percentage'],
    published: '2026-11-24',
    updated: '2026-11-24',
  },
];

import type { Guide } from './guides';

/**
 * How-to guides for the UK tax calculators. They quote rules that were read from official GOV.UK pages on 2026-11-15 (see
 * src/lib/calc/defs/uk-tax.ts). Every figure is checked against the calculators in tests/unit/guides.test.ts and tests/unit/uk-tax.test.ts.
 * When the rules change, update both.
 */
export const GUIDES_UK_TAX: readonly Guide[] = [
  {
    slug: 'how-to-calculate-uk-income-tax',
    title: 'How to calculate UK Income Tax for 2026 to 2027',
    description: 'Work out UK Income Tax for 2026 to 2027 step by step: the Personal Allowance, the bands, Scotland’s rates and the £100,000 taper, with worked examples.',
    intro: 'Subtract your £12,570 Personal Allowance from your income, then tax each slice of what is left at its band rate and add the slices up. Someone in England earning £50,000 in 2026 to 2027 has £37,430 of taxable income and pays £7,486, an effective rate of 14.97%.',
    steps: [
      'Write down your total taxable income for the tax year, which runs from 6 April to 5 April.',
      'Take off your Personal Allowance. It is £12,570, but it goes down by £1 for every £2 of income above £100,000 and is nil from £125,140.',
      'In England, Wales and Northern Ireland, tax the first £37,700 of what is left at 20%, the next slice up to £125,140 at 40%, and anything above at 45%. In Scotland, use its six bands from 19% to 48%.',
      'Add the tax on each slice. That is your Income Tax before any other reliefs.',
      'Divide the tax by your income to get your effective rate, or enter the numbers in the UK Income Tax calculator to see every band at once.',
    ],
    sections: [
      {
        h: 'A worked example: England, £50,000',
        p: [
          'The £12,570 Personal Allowance leaves £37,430 of taxable income. All of it is inside the 20% basic rate band, which runs to £37,700 of taxable income. The tax is 20% of £37,430, which is £7,486, or 14.97% of the £50,000 income.',
        ],
      },
      {
        h: 'A lower income: £30,000',
        p: [
          'With £30,000 of income, £17,430 is taxable and the tax is £3,486, an effective rate of 11.62%.',
        ],
      },
      {
        h: 'Between £100,000 and £125,140',
        p: [
          'Your Personal Allowance goes down by £1 for every £2 above £100,000. Someone on £110,000 loses £5,000 of allowance, keeps £7,570 and has £102,430 of taxable income. They pay £7,540 at 20% on the first £37,700 and £25,892 at 40% on the remaining £64,730, which is £33,432 in all, an effective rate of 30.39%. Each extra pound in this range is taxed at an effective 60%, because it also uses up allowance.',
        ],
      },
      {
        h: 'Scotland',
        p: [
          'Scotland sets its own bands. On £50,000, the same £37,430 of taxable income is taxed at 19% on the first £3,967, 20% on the next £12,989, 21% on the next £14,136 and 42% on the last £6,338. The tax is £8,982.05, an effective rate of 17.96%, which is £1,496.05 more than in England.',
        ],
      },
      {
        h: 'What this leaves out',
        p: [
          'The calculator covers Income Tax on ordinary income for the 2026 to 2027 tax year. It does not include National Insurance, student loan repayments, pension relief, Gift Aid, the Marriage Allowance, or tax on savings and dividends. The figures come from GOV.UK and were read on 15 November 2026. Check GOV.UK or HMRC for your own return.',
        ],
      },
    ],
    faqs: [
      { q: 'Which tax year do these rates apply to?', a: 'The 2026 to 2027 tax year, from 6 April 2026 to 5 April 2027.' },
      { q: 'What is the Personal Allowance?', a: 'The part of your income you pay no Income Tax on. The standard amount is £12,570 for 2026 to 2027, reduced by £1 for every £2 of income above £100,000.' },
      { q: 'Why does Scotland have different rates?', a: 'Scotland sets its own Income Tax bands and rates for most income. The rest of the UK uses the 20%, 40% and 45% bands.' },
      { q: 'Is National Insurance part of Income Tax?', a: 'No. National Insurance is a separate payroll charge. The take-home pay calculator includes it.' },
      { q: 'Does the calculator include pension contributions?', a: 'No. It taxes the income you enter after the standard Personal Allowance, with no other reliefs.' },
    ],
    calcs: ['uk-income-tax-calculator', 'uk-take-home-pay-calculator', 'percentage-calculator'],
    related: ['how-to-calculate-uk-take-home-pay', 'how-to-calculate-percentage'],
    published: '2026-11-15',
    updated: '2026-11-15',
  },
  {
    slug: 'how-to-calculate-uk-take-home-pay',
    title: 'How to calculate your UK take-home pay for 2026-27',
    description: 'Work out your 2026 to 2027 UK take-home pay after Income Tax and National Insurance, with worked examples for England and Scotland.',
    intro: 'Take your salary and subtract Income Tax and employee National Insurance. Someone in England on £50,000 pays £7,486 of Income Tax and £2,994.40 of National Insurance, and keeps £39,519.60 a year, or £3,293.30 a month.',
    steps: [
      'Write down your yearly salary and whether you live in Scotland.',
      'Work out Income Tax: subtract the £12,570 Personal Allowance, then apply the bands (see the guide on UK Income Tax).',
      'Work out National Insurance: 8% of your earnings between £12,570 and £50,270 a year.',
      'Add 2% of any earnings above £50,270.',
      'Subtract both charges from your salary, and divide by 12 for a monthly figure. Or enter the salary in the take-home pay calculator.',
    ],
    sections: [
      {
        h: 'A worked example: England, £50,000',
        p: [
          'Income Tax is £7,486. National Insurance is 8% of the £37,430 between £12,570 and your pay, which is £2,994.40. The two charges come to £10,480.40, so you keep £39,519.60 a year, or £3,293.30 a month, which is 79.04% of your pay.',
        ],
      },
      {
        h: 'A lower salary: £30,000',
        p: [
          'Income Tax is £3,486 and National Insurance is £1,394.40, so you keep £25,119.60 a year.',
        ],
      },
      {
        h: 'A higher salary: £110,000',
        p: [
          'National Insurance is £3,016 on the band between £12,570 and £50,270, plus 2% of the £59,730 above it, which is £1,194.60, so £4,210.60 in all. With £33,432 of Income Tax (the Personal Allowance is reduced above £100,000), you keep £72,357.40 a year.',
        ],
      },
      {
        h: 'Scotland, £50,000',
        p: [
          'National Insurance is the same, £2,994.40, but Scottish Income Tax is £8,982.05, so you keep £38,023.55 a year.',
        ],
      },
      {
        h: 'What this leaves out',
        p: [
          'Pension contributions, student loan repayments, benefits in kind, your tax code and other payslip deductions are not included, so a real payslip can be lower. Self-employed people pay Class 4 National Insurance instead. The rates come from the GOV.UK pages listed on the calculator, read on 15 November 2026.',
        ],
      },
    ],
    faqs: [
      { q: 'What are the National Insurance thresholds for 2026 to 2027?', a: 'An employee pays nothing on the first £12,570 a year, 8% from £12,570 to £50,270, and 2% above £50,270.' },
      { q: 'Does Scotland change National Insurance?', a: 'No. National Insurance is the same everywhere in the UK. Only Income Tax differs in Scotland.' },
      { q: 'Why is my real payslip lower than the calculator says?', a: 'The calculator only takes off Income Tax and National Insurance. Pension contributions, student loans and other deductions also come out of a real payslip.' },
      { q: 'How is the monthly figure worked out?', a: 'The yearly take-home pay divided by 12. Payroll works out National Insurance for each pay period, so your payslips can differ slightly.' },
    ],
    calcs: ['uk-take-home-pay-calculator', 'uk-income-tax-calculator', 'percentage-calculator'],
    related: ['how-to-calculate-uk-income-tax', 'how-to-calculate-percentage-change'],
    published: '2026-11-15',
    updated: '2026-11-15',
  },
];

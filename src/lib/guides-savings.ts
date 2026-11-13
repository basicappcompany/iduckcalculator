import type { Guide } from './guides';

/** How-to guides for the savings and investing calculators. Every figure is checked against the calculators in tests/unit/guides.test.ts. */
export const GUIDES_SAVINGS: readonly Guide[] = [
  {
    slug: 'how-to-calculate-sip-returns',
    title: 'How to calculate SIP returns, with a worked example',
    description: 'Learn how a SIP grows, how to work out its maturity value, and how time and the return you assume change the result, with ₹5,000 a month as the example.',
    intro: 'The SIP maturity value is P × ((1 + i)^n − 1) ÷ i × (1 + i), where P is the monthly amount, i the monthly return and n the months. ₹5,000 a month for 10 years at 12% grows to ₹11,61,695 on ₹6,00,000 invested.',
    steps: [
      'Decide the monthly amount, the yearly return you want to test and the number of years. Here: ₹5,000, 12% and 10 years.',
      'Turn the yearly return into a monthly one: 12 ÷ 12 ÷ 100 = 0.01.',
      'Turn the years into months: 10 × 12 = 120.',
      'Put the numbers into the formula, or enter them in the SIP calculator, to get ₹11,61,695.',
      'Subtract what you paid in, ₹6,00,000, to see the gain: ₹5,61,695.',
    ],
    sections: [
      {
        h: 'Time does most of the work',
        p: [
          'Keep ₹5,000 a month at 12% and change only the years. After 5 years it is ₹4,12,432 on ₹3,00,000 invested. After 10 years it is ₹11,61,695 on ₹6,00,000. After 15 years it is ₹25,22,880 on ₹9,00,000. After 20 years it is ₹49,95,740 on ₹12,00,000.',
          'Doubling the time from 10 to 20 years more than quadruples the result. Most of the growth in the later years comes from returns earning returns, which is why starting early matters more than the size of the monthly amount.',
        ],
      },
      {
        h: 'The return you assume matters too',
        p: ['For 10 years at ₹5,000 a month, an 8% return gives ₹9,20,828, a 10% return gives ₹10,32,760 and a 12% return gives ₹11,61,695. Double the monthly amount to ₹10,000 at 12% and the result doubles to ₹23,23,391. Test a range of returns rather than trusting one number.'],
      },
      {
        h: 'What the calculation leaves out',
        p: ['The calculator assumes each instalment goes in at the start of the month and a steady return every month. Real investments go up and down, so the actual path will be bumpier, and fund charges and tax reduce what you keep. Use the result to compare plans, not as a promise.'],
      },
    ],
    faqs: [
      { q: 'What is the SIP formula?', a: 'Future value = P × ((1 + i)^n − 1) ÷ i × (1 + i), with i = yearly return ÷ 12 ÷ 100 and n = number of months.' },
      { q: 'Is a SIP return guaranteed?', a: 'No. The calculator shows what a steady assumed return would give. Actual returns vary and can be negative.' },
      { q: 'How much should I invest each month?', a: 'Start with an amount you can keep up through good and bad months, and raise it as your income grows. The step-up SIP calculator shows the effect of raising it each year.' },
      { q: 'What return should I assume?', a: 'Try a low, a middle and a high figure, such as 8%, 10% and 12%, and plan around the lower ones.' },
    ],
    calcs: ['sip-calculator', 'step-up-sip-calculator', 'lumpsum-calculator'],
    related: ['sip-vs-lumpsum', 'how-a-step-up-sip-works'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-calculate-lumpsum-returns',
    title: 'How to calculate lumpsum investment returns',
    description: 'Work out what a one-time investment grows to with the lumpsum formula, and see how years and return change ₹1,00,000, with worked numbers.',
    intro: 'A lumpsum grows as P × (1 + r)^t. ₹1,00,000 invested for 10 years at 12% becomes 1,00,000 × 1.12^10 = ₹3,10,585, a gain of ₹2,10,585. At a steady 12% an amount roughly doubles every six years.',
    steps: [
      'Take the amount you will invest once. Here it is ₹1,00,000.',
      'Write the yearly return as a decimal: 12% is 0.12, so 1 + r = 1.12.',
      'Raise 1.12 to the number of years: 1.12^10 = 3.1058.',
      'Multiply by the amount: 1,00,000 × 3.1058 = ₹3,10,585.',
      'Subtract the amount invested to get the gain, ₹2,10,585, or enter the numbers in the lumpsum calculator.',
    ],
    sections: [
      {
        h: 'How the years change the result',
        p: [
          'At 12% the same ₹1,00,000 becomes ₹1,76,234 after 5 years, ₹3,10,585 after 10 years, ₹5,47,357 after 15 years and ₹9,64,629 after 20 years.',
          'Each extra five years multiplies the amount by about 1.76, so the later years add far more rupees than the early ones. This is compounding: the return is earned on the growth as well as on the original amount.',
        ],
      },
      {
        h: 'How the return changes the result',
        p: ['Over 10 years, ₹1,00,000 grows to ₹2,15,892 at 8%, ₹2,59,374 at 10% and ₹3,10,585 at 12%. A few points of return make a large difference over a long time, so compare options on their likely return after charges and tax, and keep the assumption modest.'],
      },
      {
        h: 'Lumpsum or SIP',
        p: ['A lumpsum works if you already have the money, because all of it is invested from day one. If you earn month by month, a SIP is how you invest. The SIP vs lumpsum guide compares the two with the same numbers.'],
      },
    ],
    faqs: [
      { q: 'What is the lumpsum formula?', a: 'Future value = P × (1 + r)^t, where r is the yearly return as a decimal and t is the number of years.' },
      { q: 'How long does money take to double?', a: 'At a steady 12% it takes a little over six years. The rule of 72, 72 divided by the return, gives a quick estimate.' },
      { q: 'Is the return guaranteed?', a: 'No. Only a few products, such as some fixed deposits, state the return in advance. Market investments vary.' },
      { q: 'Should I invest everything at once?', a: 'That is a personal decision about risk. Some people split a lump sum into parts over a few months. Tax and charges also matter.' },
    ],
    calcs: ['lumpsum-calculator', 'sip-calculator', 'compound-interest-calculator'],
    related: ['sip-vs-lumpsum', 'how-compound-interest-works'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-a-step-up-sip-works',
    title: 'How a step-up SIP works, and how much extra it earns',
    description: 'See how raising your SIP by a fixed percentage every year grows the final value, with ₹10,000 a month as the worked example.',
    intro: 'A step-up SIP raises your monthly amount by a fixed percentage every year. Starting at ₹10,000 a month and raising it 10% a year for 10 years at 12%, you invest ₹19,12,491 and reach ₹33,74,326, against ₹23,23,391 for a flat SIP.',
    steps: [
      'Choose the starting monthly amount. Here it is ₹10,000.',
      'Choose how much to raise it each year. Here it is 10%, so year two is ₹11,000 and year three is ₹12,100.',
      'Choose the return you want to test and the years: 12% and 10.',
      'Enter the numbers in the step-up SIP calculator.',
      'Compare the result with a flat SIP, shown as the extra over a flat SIP.',
    ],
    sections: [
      {
        h: 'What the step-up adds',
        p: [
          'A flat SIP of ₹10,000 for 10 years at 12% reaches ₹23,23,391 on ₹12,00,000 invested. Raise it 5% a year and you reach ₹27,86,942 on ₹15,09,347. Raise it 10% a year and you reach ₹33,74,326 on ₹19,12,491.',
          'The 10% step-up ends ₹10,50,936 ahead of the flat SIP. Part of that is simply more money going in, and part is that the larger amounts of the later years also grow.',
        ],
      },
      {
        h: 'Why it suits most careers',
        p: ['Income usually rises through your working life, so a fixed amount that felt large in year one feels small in year ten. Linking the SIP to your raises keeps the share of income you save about the same, without a big jump in any one year.'],
      },
      {
        h: 'Keep the step realistic',
        p: ['A 10% yearly increase compounds: by year ten the monthly amount is about 2.4 times the first. Pick a step you can actually afford, and remember that the calculation assumes a steady return, which real markets do not give.'],
      },
    ],
    faqs: [
      { q: 'What is a step-up SIP?', a: 'A SIP whose monthly amount rises by a fixed percentage every year, so your investing keeps pace with your income.' },
      { q: 'Is a step-up SIP better than a flat SIP?', a: 'It puts more money in over time, so with the same return it ends higher. It also needs a higher monthly commitment as the years go by.' },
      { q: 'What step-up should I choose?', a: 'One that matches your expected pay rises and that you can keep up. Five to ten percent is common in examples.' },
      { q: 'Does the calculator include tax or charges?', a: 'No. It shows the maths of a steady return only.' },
    ],
    calcs: ['step-up-sip-calculator', 'sip-calculator', 'retirement-calculator'],
    related: ['how-to-calculate-sip-returns', 'sip-vs-lumpsum'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-plan-regular-withdrawals-swp',
    title: 'How to plan regular withdrawals with an SWP',
    description: 'Learn how a systematic withdrawal plan works, how long ₹50,00,000 lasts at different monthly withdrawals, and how to choose a sustainable amount.',
    intro: 'In a systematic withdrawal plan you take a fixed amount each month while the rest stays invested. ₹50,00,000 at 8% with ₹40,000 withdrawn monthly for 20 years pays out ₹96,00,000 and still leaves ₹9,16,125.',
    steps: [
      'Enter the amount you will start with. Here it is ₹50,00,000.',
      'Enter the monthly withdrawal you want. Here it is ₹40,000.',
      'Enter the return you expect and the number of years: 8% and 20.',
      'Read the balance left at the end, or how long the money lasts if it runs out.',
      'Try other withdrawals until the plan lasts as long as you need.',
    ],
    sections: [
      {
        h: 'How the withdrawal changes how long the money lasts',
        p: [
          'On ₹50,00,000 at 8%, a withdrawal of ₹30,000 a month still leaves ₹68,45,597 after 20 years, having paid out ₹72,00,000. A withdrawal of ₹40,000 leaves ₹9,16,125. A withdrawal of ₹50,000 runs the money out after 13 years 8 months, having paid out ₹81,68,051. A withdrawal of ₹60,000 runs out after 10 years 1 month.',
          'A small increase in the monthly amount makes a large difference to how long the money lasts, because every rupee taken out stops earning a return.',
        ],
      },
      {
        h: 'How the plan works each month',
        p: ['The calculator takes the withdrawal out first and then lets the remaining balance grow by one month of return. When the return is higher than the withdrawal rate the balance can even grow, and when it is lower the balance shrinks until it reaches zero.'],
      },
      {
        h: 'Things the plan does not show',
        p: ['It uses a steady return, but real returns vary, and a poor stretch early on does more damage to a withdrawal plan than the same stretch later. It also ignores inflation and tax. If you need the income to rise with prices, test a lower withdrawal or a lower return, and keep a cash buffer for bad years.'],
      },
    ],
    faqs: [
      { q: 'What is an SWP?', a: 'A systematic withdrawal plan: you take a fixed amount from an investment at regular intervals while the rest stays invested.' },
      { q: 'How much can I safely withdraw?', a: 'It depends on the return and on how long the money must last. Test several withdrawals and a lower return than you expect.' },
      { q: 'What if my money runs out early?', a: 'The calculator tells you how many years and months it lasts. Lower the withdrawal or plan for a shorter period.' },
      { q: 'Is the withdrawal taxed?', a: 'Part of a withdrawal can be a taxable gain. The calculator ignores tax, so check the rules for your investment.' },
    ],
    calcs: ['swp-calculator', 'retirement-calculator', 'lumpsum-calculator'],
    related: ['how-to-plan-your-retirement-corpus', 'how-to-calculate-lumpsum-returns'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-calculate-fd-maturity',
    title: 'How to calculate fixed deposit maturity amount',
    description: 'Work out what a fixed deposit pays at maturity with the compound interest formula, and see how the compounding frequency changes a ₹1,00,000 deposit.',
    intro: 'FD maturity = P × (1 + r ÷ m)^(m × t). A ₹1,00,000 deposit at 7% for 5 years, compounded quarterly, matures at ₹1,41,478, so the interest earned is ₹41,478.',
    steps: [
      'Note the deposit, the yearly rate and the tenure. Here: ₹1,00,000, 7% and 5 years.',
      'Find how many times a year the bank compounds the interest, m. Quarterly means 4.',
      'Divide the rate by m: 0.07 ÷ 4 = 0.0175.',
      'Raise 1.0175 to the power m × t = 20, which is 1.4148, and multiply by the deposit to get ₹1,41,478.',
      'Subtract the deposit to see the interest, or enter the numbers in the FD calculator.',
    ],
    sections: [
      {
        h: 'Why the compounding frequency matters',
        p: [
          'On ₹1,00,000 at 7% for 5 years: compounded yearly the FD matures at ₹1,40,255; quarterly, ₹1,41,478; monthly, ₹1,41,763. More frequent compounding adds a little more each time, but the gain from quarterly to monthly is small.',
          'Ask your bank how often it compounds and whether the rate it quotes is the rate or the effective yield, because the two differ.',
        ],
      },
      {
        h: 'Tenure and rate',
        p: ['At 7% compounded quarterly, a 3-year deposit of ₹1,00,000 matures at ₹1,23,144 and a 5-year deposit at ₹1,41,478. At 6% for 5 years the same deposit matures at ₹1,34,686. A single percentage point is worth about ₹6,800 over five years on this amount.'],
      },
      {
        h: 'Tax and early withdrawal',
        p: ['Interest on an FD is taxable, and a bank may deduct tax at source above a limit that changes from time to time. Breaking an FD before maturity usually earns a lower rate and may carry a charge. The calculator shows the gross interest only, so check what you will actually keep.'],
      },
    ],
    faqs: [
      { q: 'What is the FD maturity formula?', a: 'Maturity = P × (1 + r ÷ m)^(m × t), with r the yearly rate as a decimal, m the compounding periods a year and t the years.' },
      { q: 'Is quarterly compounding common?', a: 'It is the most common for term deposits, but banks differ, so check yours.' },
      { q: 'Is FD interest taxable?', a: 'Yes. Banks may also deduct tax at source above a limit. The calculator does not include tax.' },
      { q: 'What if I break the FD early?', a: 'Banks usually pay a lower rate and may charge a penalty, so the maturity figure no longer applies.' },
    ],
    calcs: ['fd-calculator', 'rd-calculator', 'compound-interest-calculator'],
    related: ['how-compound-interest-works', 'how-to-calculate-rd-maturity'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-calculate-rd-maturity',
    title: 'How to calculate recurring deposit maturity',
    description: 'Learn how a recurring deposit grows, how banks compound it quarterly, and what ₹5,000 a month earns over 60 months, with the formula and examples.',
    intro: 'A recurring deposit adds a fixed amount each month and earns interest compounded quarterly. ₹5,000 a month for 60 months at 7% matures at ₹3,59,664: you deposit ₹3,00,000 and earn ₹59,664.',
    steps: [
      'Note the monthly deposit, the yearly rate and the tenure in months. Here: ₹5,000, 7% and 60.',
      'Work out the quarterly rate, i = 7 ÷ 400 = 0.0175, and the number of quarters, q = 60 ÷ 3 = 20.',
      'Apply the formula: maturity = R × ((1 + i)^q − 1) ÷ (1 − (1 + i)^(−1/3)).',
      'Read the maturity value, ₹3,59,664, or enter the numbers in the RD calculator.',
      'Subtract the total deposited, ₹3,00,000, to see the interest.',
    ],
    sections: [
      {
        h: 'Tenure changes the interest a lot',
        p: [
          'With ₹5,000 a month at 7%, a 12-month RD matures at ₹62,311 on ₹60,000 deposited, so the interest is only ₹2,311. A 60-month RD earns ₹59,664 on ₹3,00,000.',
          'Early deposits stay in longer and earn more, so the interest grows faster than the tenure. Raise the deposit to ₹10,000 for 36 months and the RD matures at ₹4,01,373 on ₹3,60,000 deposited, an interest of ₹41,373.',
        ],
      },
      {
        h: 'RD or SIP',
        p: ['An RD gives a known return, which suits money you cannot risk, such as a fund for a fixed goal. A SIP into a market investment may earn more, but it can also lose value. Use the SIP calculator to see what a higher assumed return would give, and remember that it is not guaranteed.'],
      },
      {
        h: 'Practical points',
        p: ['Miss a monthly deposit and many banks charge a small penalty or reduce the interest. Interest on an RD is taxable, and the calculator shows the gross figure. Banks may round the deposit dates and the quarters differently, so the maturity in your receipt can differ by a few rupees.'],
      },
    ],
    faqs: [
      { q: 'How is RD interest compounded?', a: 'Most banks compound it quarterly. The calculator uses the quarterly rate, which is the yearly rate divided by 400.' },
      { q: 'What happens if I miss a deposit?', a: 'Banks usually charge a penalty or reduce the interest. The rules differ between banks.' },
      { q: 'Is RD interest taxable?', a: 'Yes. The calculator shows interest before tax.' },
      { q: 'How is an RD different from an FD?', a: 'An FD takes one lump sum at the start. An RD takes a fixed amount every month.' },
    ],
    calcs: ['rd-calculator', 'fd-calculator', 'sip-calculator'],
    related: ['how-to-calculate-fd-maturity', 'how-to-calculate-sip-returns'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-calculate-simple-interest',
    title: 'How to calculate simple interest, with examples',
    description: 'Calculate simple interest with P × R × T ÷ 100, work out the total, the rate or the time, and see how it differs from compound interest.',
    intro: 'Simple interest = P × R × T ÷ 100, with the principal P, the yearly rate R in per cent and the time T in years. ₹1,00,000 at 8% for 3 years earns ₹24,000, so the total is ₹1,24,000, and the interest is ₹8,000 every year.',
    steps: [
      'Write down the principal, the yearly rate and the time in years. Here: ₹1,00,000, 8% and 3 years.',
      'Multiply them: 1,00,000 × 8 × 3 = 24,00,000.',
      'Divide by 100: 24,00,000 ÷ 100 = ₹24,000. That is the simple interest.',
      'Add it to the principal for the total amount: 1,00,000 + 24,000 = ₹1,24,000.',
      'Or enter the three numbers in the simple interest calculator, which also shows the interest for each year.',
    ],
    sections: [
      {
        h: 'Finding the rate, the time or the principal',
        p: [
          'The formula can be turned round. The rate is R = interest × 100 ÷ (P × T): ₹24,000 earned on ₹1,00,000 over 3 years gives 24,000 × 100 ÷ (1,00,000 × 3) = 8%. The time is T = interest × 100 ÷ (P × R), which is 24,000 × 100 ÷ (1,00,000 × 8) = 3 years.',
          'For a part of a year, turn the months into years first. 9 months is 0.75 years, so ₹1,00,000 at 8% for 9 months earns 1,00,000 × 8 × 0.75 ÷ 100 = ₹6,000.',
        ],
      },
      {
        h: 'Simple interest compared with compound interest',
        p: ['Simple interest is charged on the original principal only, so it adds the same amount every year. Compound interest is charged on the principal plus the interest already added. At 8% for 3 years on ₹1,00,000, simple interest gives ₹24,000 while yearly compounding gives ₹25,971. The gap grows with time: over 20 years at 10%, simple interest is ₹2,00,000 while compounding earns ₹5,72,750.'],
      },
      {
        h: 'Where simple interest is used',
        p: ['Some short-term loans, personal lending between people, a few bonds and many school-level exercises use simple interest. Bank deposits and most loans compound, and an EMI loan is a reducing-balance loan, not a simple-interest one. Check the terms to see which kind applies before relying on the answer.'],
      },
    ],
    faqs: [
      { q: 'What is the simple interest formula?', a: 'Simple interest = principal × rate × time ÷ 100, with the rate in per cent a year and the time in years.' },
      { q: 'How do I calculate simple interest for months?', a: 'Divide the months by 12 to get years, then use the formula. 9 months is 0.75 years.' },
      { q: 'How do I find the rate from the interest?', a: 'Rate = interest × 100 ÷ (principal × time).' },
      { q: 'Is simple interest the same as an EMI loan?', a: 'No. An EMI loan charges interest on the balance that is left each month, so the interest falls as you repay.' },
    ],
    calcs: ['simple-interest-calculator', 'compound-interest-calculator', 'fd-calculator'],
    related: ['how-compound-interest-works', 'how-to-calculate-fd-maturity'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-compound-interest-works',
    title: 'How compound interest works, simple vs compound',
    description: 'Understand simple and compound interest with worked numbers: how ₹1,00,000 grows at 10%, and how often interest is added changes the final amount.',
    intro: 'Simple interest is P × R × T ÷ 100. Compound interest adds the interest to the amount each period, so it earns interest too. ₹1,00,000 at 10% for 5 years gives ₹50,000 of simple interest but ₹61,051 compounded yearly.',
    steps: [
      'For simple interest, multiply the principal by the rate and the years, then divide by 100: 1,00,000 × 10 × 5 ÷ 100 = ₹50,000.',
      'For compound interest, write the rate as a decimal and divide by the times compounded a year, m.',
      'Raise 1 plus that to the power m × t. Yearly at 10% for 5 years: 1.10^5 = 1.61051.',
      'Multiply by the principal: 1,00,000 × 1.61051 = ₹1,61,051.',
      'Subtract the principal to get the compound interest, ₹61,051, or use the compound interest calculator.',
    ],
    sections: [
      {
        h: 'How often the interest is added',
        p: [
          'On ₹1,00,000 at 10% for 5 years the final amount is ₹1,61,051 compounded yearly, ₹1,62,889 half-yearly, ₹1,63,862 quarterly, ₹1,64,531 monthly and ₹1,64,861 daily.',
          'More frequent compounding always helps a little, but the gains shrink quickly. The jump from yearly to quarterly is ₹2,811; from monthly to daily it is only ₹330.',
        ],
      },
      {
        h: 'The gap widens with time',
        p: ['At 8% for 3 years, ₹1,00,000 earns ₹24,000 as simple interest and ₹25,971 compounded yearly, a small difference. At 10% for 20 years the simple interest is ₹2,00,000, while compounding gives ₹6,72,750 in total, which means ₹5,72,750 of interest. Compounding is slow at first and then takes over.'],
      },
      {
        h: 'Which one applies',
        p: ['Most savings, deposits and investments compound. Some short loans and a few bonds use simple interest. Loans compound against you when you do not repay on time, which is why an unpaid balance grows so fast. Check the terms to see which kind applies and how often it is added.'],
      },
    ],
    faqs: [
      { q: 'What is the difference between simple and compound interest?', a: 'Simple interest is charged on the original amount only. Compound interest is charged on the amount plus the interest already added.' },
      { q: 'What is the compound interest formula?', a: 'A = P × (1 + r ÷ m)^(m × t), where r is the yearly rate as a decimal, m the compounding periods a year and t the years.' },
      { q: 'Does more frequent compounding matter?', a: 'A little. Going from yearly to monthly adds a noticeable amount, but going from monthly to daily adds very little.' },
      { q: 'Does compound interest work against borrowers too?', a: 'Yes. Unpaid interest on a loan or a card is added to the balance and then earns interest itself.' },
    ],
    calcs: ['compound-interest-calculator', 'simple-interest-calculator', 'fd-calculator'],
    related: ['how-to-calculate-fd-maturity', 'how-to-calculate-lumpsum-returns'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-calculate-cagr',
    title: 'How to calculate CAGR, with examples',
    description: 'Learn how to calculate compound annual growth rate from a start value, an end value and the years, and how to compare investments fairly with it.',
    intro: 'CAGR = (End value ÷ Start value)^(1 ÷ years) − 1. Money that grows from ₹10,000 to ₹20,000 in 5 years has a CAGR of (2)^(1/5) − 1 = 14.87% a year. It is the steady yearly rate that would give the same result.',
    steps: [
      'Take the starting value and the ending value. Here: ₹10,000 and ₹20,000.',
      'Divide the end by the start: 20,000 ÷ 10,000 = 2.',
      'Raise the result to the power of 1 divided by the years: 2^(1/5) = 1.1487.',
      'Subtract 1 and multiply by 100 to get the percentage: 14.87%.',
      'Or enter the three numbers in the CAGR calculator and read the rate.',
    ],
    sections: [
      {
        h: 'Why CAGR is better than a simple average',
        p: [
          'Total growth hides how long it took. ₹10,000 doubling in 5 years is a CAGR of 14.87%, while the same doubling in 10 years is only 7.18%. Both are a 100% total gain, yet the first is twice as good a rate.',
          'CAGR turns any gain over any period into one yearly rate, so you can compare a stock, a fund and a deposit on equal terms.',
        ],
      },
      {
        h: 'Other examples, including a loss',
        p: ['₹50,000 growing to ₹1,20,000 over 7 years is a CAGR of 13.32%, a total growth of 140%. A fall works the same way: ₹1,00,000 shrinking to ₹80,000 in 3 years is a CAGR of −7.17% a year, a total change of −20%.'],
      },
      {
        h: 'What CAGR hides',
        p: ['CAGR smooths out the ups and downs. An investment that fell 30% one year and rose the next shows the same CAGR as one that grew steadily, but it was a harder ride. CAGR also ignores money added or taken out along the way, so for a SIP use the SIP calculator or an XIRR-style measure instead.'],
      },
    ],
    faqs: [
      { q: 'What is CAGR?', a: 'The compound annual growth rate: the steady yearly rate that would take a starting value to an ending value over a number of years.' },
      { q: 'Can CAGR be negative?', a: 'Yes. If the ending value is lower than the start, the CAGR is negative.' },
      { q: 'Is CAGR the same as the average return?', a: 'No. An average of yearly returns ignores compounding, while CAGR accounts for it.' },
      { q: 'Does CAGR work for a SIP?', a: 'Not directly, because money goes in at different times. Use a measure that accounts for the dates of each investment.' },
    ],
    calcs: ['cagr-calculator', 'lumpsum-calculator', 'inflation-calculator'],
    related: ['how-to-calculate-lumpsum-returns', 'how-inflation-reduces-your-money'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-inflation-reduces-your-money',
    title: 'How inflation reduces your money, with numbers',
    description: 'See how inflation raises what things cost and lowers what your savings can buy, with ₹1,00,000 and rates of 5%, 6% and 7% over 10 and 20 years.',
    intro: 'At 6% inflation, something that costs ₹1,00,000 today costs ₹1,79,085 in 10 years, and ₹1,00,000 in cash buys only about ₹55,839 worth of today’s goods, a loss of 44% of its purchasing power.',
    steps: [
      'Enter the amount you have or the price today. Here it is ₹1,00,000.',
      'Enter a yearly inflation rate and the number of years: 6% and 10.',
      'The future cost is the amount × (1 + inflation)^years = 1,00,000 × 1.06^10 = ₹1,79,085.',
      'The buying power of today’s money is the amount ÷ (1 + inflation)^years = ₹55,839.',
      'Compare with the return on your savings to see whether they stay ahead of prices.',
    ],
    sections: [
      {
        h: 'Small differences in the rate add up',
        p: [
          'Over 10 years, ₹1,00,000 of goods costs ₹1,62,889 at 5% inflation, ₹1,79,085 at 6% and ₹1,96,715 at 7%. In the same years your ₹1,00,000 of cash buys ₹61,391, ₹55,839 and ₹50,835 worth of today’s goods.',
          'At 7% your money loses about half its buying power in 10 years. Because the effect compounds, a seemingly small rate is a large change over a long time.',
        ],
      },
      {
        h: 'Longer horizons',
        p: ['Over 20 years at 6%, what costs ₹1,00,000 today costs ₹3,20,714, and ₹1,00,000 in cash buys only ₹31,180 worth of today’s goods. That is why long-term plans, such as retirement, must use inflation-adjusted figures, and why money that earns less than inflation is slowly losing value.'],
      },
      {
        h: 'What to do with the number',
        p: ['Use it to set goals in future money: a goal that costs ₹10,00,000 today needs more by the time you reach it. Compare the interest on a deposit with the inflation rate to see your real return. The calculator uses one steady rate; actual inflation changes from year to year and differs between goods, such as education, health and food.'],
      },
    ],
    faqs: [
      { q: 'What is inflation?', a: 'A general rise in prices over time, so the same money buys less.' },
      { q: 'What inflation rate should I use?', a: 'Try a range, such as 5%, 6% and 7%. Costs such as education and healthcare often rise faster than the general rate.' },
      { q: 'Does inflation affect savings in the bank?', a: 'Yes. If the interest is lower than inflation, your money buys less each year even though the balance grows.' },
      { q: 'How do I plan for it?', a: 'State future goals in future prices and choose investments you expect to beat inflation over the long term, accepting the risk that comes with that.' },
    ],
    calcs: ['inflation-calculator', 'retirement-calculator', 'cagr-calculator'],
    related: ['how-to-plan-your-retirement-corpus', 'how-to-calculate-cagr'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-plan-your-retirement-corpus',
    title: 'How to plan your retirement corpus step by step',
    description: 'Estimate the retirement corpus you need and the monthly SIP to build it, with a worked example for a 35-year-old spending ₹50,000 a month today.',
    intro: 'Your corpus must fund your expenses after inflation for the years you expect to live. Someone aged 35 who spends ₹50,000 a month today, retires at 60 and plans to 85 needs about ₹5,19,11,228, which takes a SIP of about ₹38,801 a month.',
    steps: [
      'Enter your age, the age you want to retire and the age you plan to live to: 35, 60 and 85.',
      'Enter your monthly expenses today, ₹50,000, and the inflation rate, 6%.',
      'Enter the returns you expect before and after retirement: 10% and 8%.',
      'Add any savings you already have set aside for retirement.',
      'Read the corpus needed and the monthly SIP to reach it, and test other ages and returns.',
    ],
    sections: [
      {
        h: 'How the corpus is worked out',
        p: [
          'First, today’s expenses are raised by inflation to the year you retire: ₹6,00,000 a year becomes ₹25,75,122 in the first retirement year after 25 years at 6%. Then the calculator finds the sum that pays those growing expenses for the years you plan, while the rest earns the after-retirement return. That gives ₹5,19,11,228.',
          'The monthly SIP is what you must invest from now to the retirement age, at the pre-retirement return, to grow to that corpus: about ₹38,801.',
        ],
      },
      {
        h: 'Test what you can change',
        p: [
          'Retire at 55 instead of 60 and the corpus is ₹4,46,01,505, but the SIP rises to ₹58,250, because you have five fewer years to build it. Start at 25 instead of 35 and the corpus is larger, ₹9,29,65,102, since you plan for 35 years of inflation, but the SIP falls to ₹24,284. Spend ₹30,000 instead of ₹50,000 and the corpus is ₹3,11,46,737 and the SIP ₹23,280.',
          'If you already have ₹10,00,000 saved for retirement, the SIP falls from ₹38,801 to ₹30,702.',
        ],
      },
      {
        h: 'A planning estimate, not a promise',
        p: ['The calculator uses steady returns and one inflation rate. It does not include tax, pensions, rental income, a change in lifestyle or big medical costs. Revisit the plan every year or two, and keep a cash buffer for the years when markets fall.'],
      },
    ],
    faqs: [
      { q: 'How much do I need to retire?', a: 'It depends on your spending, inflation, how long you will live and the return you earn. The calculator works it out from those numbers.' },
      { q: 'What age should I plan to?', a: 'Plan a little longer than you expect, such as 85 or 90, because running out of money is worse than leaving some.' },
      { q: 'Should I count my EPF or pension?', a: 'Yes, if you know the amount. Enter what you have saved for retirement, or lower your expenses by the pension you expect.' },
      { q: 'How often should I review the plan?', a: 'Every year or two, and after any big change in income or expenses.' },
    ],
    calcs: ['retirement-calculator', 'step-up-sip-calculator', 'swp-calculator'],
    related: ['how-inflation-reduces-your-money', 'how-a-step-up-sip-works'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
];

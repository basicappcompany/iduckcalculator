import type { Guide } from './guides';

/** How-to guides for the loan calculators. Every figure is checked against the calculators in tests/unit/guides.test.ts. */
export const GUIDES_LOANS: readonly Guide[] = [
  {
    slug: 'how-to-calculate-home-loan-emi',
    title: 'How to calculate home loan EMI, with an example',
    description: 'Work out your home loan EMI step by step, see how tenure and rate change the cost, and check a worked example for a ₹50,00,000 loan at 8.5%.',
    intro: 'Use EMI = P × r × (1 + r)^n ÷ ((1 + r)^n − 1). For a ₹50,00,000 home loan at 8.5% over 20 years the EMI is ₹43,391 a month, and you repay ₹1,04,13,879 in all, so ₹54,13,879 of it is interest.',
    steps: [
      'Take the loan amount: the property price minus your down payment. Here it is ₹50,00,000.',
      'Turn the yearly rate into a monthly rate: 8.5 ÷ 12 ÷ 100 = 0.00708.',
      'Turn the tenure into months: 20 years × 12 = 240.',
      'Put the three numbers into the EMI formula, or enter them in the home loan calculator, to get ₹43,391.',
      'Multiply the unrounded EMI by the months to see the total repaid, ₹1,04,13,879, and subtract the loan to see the interest.',
    ],
    sections: [
      {
        h: 'What changes the EMI most: tenure and rate',
        p: [
          'On the same ₹50,00,000 at 8.5%, a 10-year loan has an EMI of ₹61,993 and costs ₹24,39,141 in interest. At 15 years the EMI is ₹49,237 and the interest ₹38,62,656. At 20 years it is ₹43,391 and ₹54,13,879. At 25 years it is ₹40,261 and ₹70,78,406.',
          'The rate matters too. Keep the 20 years and move the rate: at 7.5% the EMI is ₹40,280, and at 9.5% it is ₹46,607. A single percentage point is worth about ₹3,000 a month on a loan this size.',
        ],
      },
      {
        h: 'Why the first instalments are mostly interest',
        p: [
          'Interest is charged on what you still owe. In month one you owe the full ₹50,00,000, so the interest is 50,00,000 × 0.085 ÷ 12 = ₹35,417. Out of the ₹43,391 EMI only ₹7,974 repays the loan.',
          'Each month the balance falls a little, the interest falls with it, and a bigger share of the same EMI goes to principal. This is why a part-payment in the early years saves far more than one near the end.',
        ],
      },
      {
        h: 'What the EMI does not include',
        p: ['The formula covers principal and interest only. Processing fees, insurance, valuation charges and any prepayment charge are separate, and a lender’s own schedule can differ by a few rupees because of rounding and the date of the first instalment. On a floating-rate loan, ask your lender whether a rate change alters your EMI or your tenure.'],
      },
    ],
    faqs: [
      { q: 'How long should a home loan tenure be?', a: 'Pick the shortest tenure whose EMI you can pay comfortably. Every extra five years lowers the EMI a little but adds a lot of interest.' },
      { q: 'Is the total interest really more than the loan?', a: 'On a 20-year loan at 8.5% it is. You repay about ₹1.04 crore on ₹50 lakh, so the interest alone exceeds the amount borrowed.' },
      { q: 'Does a bigger down payment help?', a: 'Yes. It lowers the loan amount, and the EMI and the interest fall in the same proportion.' },
      { q: 'Can I get the EMI without the formula?', a: 'Yes. Enter the amount, the rate and the tenure in the home loan EMI calculator and read the EMI and the year-by-year schedule.' },
    ],
    calcs: ['home-loan-emi-calculator', 'emi-calculator', 'loan-prepayment-calculator'],
    related: ['how-emi-is-calculated', 'how-to-save-interest-with-loan-prepayment'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-calculate-car-loan-emi',
    title: 'How to calculate car loan EMI and the real cost',
    description: 'Find your car loan EMI, see how tenure and down payment change the interest, and check a worked example for an ₹8,00,000 loan at 9.5%.',
    intro: 'A car loan EMI uses the same formula as any reducing-balance loan. For ₹8,00,000 at 9.5% over 5 years (60 months) the EMI is ₹16,801, and you repay ₹10,08,089, so the loan costs ₹2,08,089 in interest.',
    steps: [
      'Work out the amount to borrow: the on-road price minus your down payment. Here it is ₹8,00,000.',
      'Enter the yearly interest rate, 9.5%, and the tenure, 5 years, in the car loan calculator.',
      'Read the monthly EMI, ₹16,801, and the total interest, ₹2,08,089.',
      'Change the tenure to 3 and 7 years to compare, and keep the EMI that fits your monthly budget.',
      'Add the costs the EMI does not cover: insurance, fuel, servicing and any processing fee.',
    ],
    sections: [
      {
        h: 'How tenure changes the cost',
        p: [
          'On ₹8,00,000 at 9.5%: a 3-year loan has an EMI of ₹25,626 and costs ₹1,22,549 in interest. A 5-year loan has an EMI of ₹16,801 and ₹2,08,089 of interest. A 7-year loan lowers the EMI to ₹13,075 but costs ₹2,98,316.',
          'Going from 3 to 7 years cuts the monthly payment by about half, yet the interest more than doubles. A car also loses value quickly, so a very long loan can leave you owing more than the car is worth for longer.',
        ],
      },
      {
        h: 'What a bigger down payment does',
        p: ['Borrow ₹6,00,000 instead of ₹8,00,000 on the same terms and the EMI drops to ₹12,601 and the interest to ₹1,56,067. The ₹2,00,000 you pay up front saves about ₹52,000 of interest over the five years, besides lowering the EMI.'],
      },
      {
        h: 'Check the rate type and the fees',
        p: ['Quotes are sometimes given as a flat rate, which is charged on the full amount for the whole tenure and costs much more than the same number quoted as a reducing rate. Ask which one you are being offered, and add the processing fee to the cost of the loan when you compare lenders.'],
      },
    ],
    faqs: [
      { q: 'What tenure is best for a car loan?', a: 'Three to five years is common. A shorter loan costs less in interest, and you stop paying while the car still has good value.' },
      { q: 'Is a flat rate the same as a reducing rate?', a: 'No. A flat rate does not fall as you repay, so the same quoted number costs far more. Compare lenders on the reducing-balance rate.' },
      { q: 'Should I pay a larger down payment?', a: 'If you can, yes. It lowers the loan, the EMI and the total interest, and it reduces the chance of owing more than the car is worth.' },
      { q: 'Does the EMI include insurance?', a: 'No. The EMI repays the loan and its interest only. Insurance, registration and running costs are extra.' },
    ],
    calcs: ['car-loan-emi-calculator', 'emi-calculator', 'loan-eligibility-calculator'],
    related: ['how-emi-is-calculated', 'how-to-compare-personal-loan-offers'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-compare-personal-loan-offers',
    title: 'How to compare personal loan offers by EMI and cost',
    description: 'Compare personal loan offers by monthly EMI and total interest, and see how a longer tenure or a higher rate changes what a ₹3,00,000 loan costs.',
    intro: 'Compare personal loans by total interest, not just the EMI. A ₹3,00,000 loan at 14% for 3 years has an EMI of ₹10,253 and costs ₹69,118 in interest; stretched to 5 years, the EMI falls to ₹6,980 but the interest rises to ₹1,18,829.',
    steps: [
      'Collect each offer’s loan amount, yearly interest rate, tenure and processing fee.',
      'Enter the amount, rate and tenure of each offer in the personal loan calculator.',
      'Note the EMI and the total interest for every offer.',
      'Add the processing fee to the total interest to get the true cost of each offer.',
      'Choose the offer with the lowest total cost whose EMI still fits comfortably in your monthly budget.',
    ],
    sections: [
      {
        h: 'Tenure: lower EMI, higher cost',
        p: [
          'On ₹3,00,000 at 14%, a 1-year loan has an EMI of ₹26,936 and ₹23,234 of interest. At 2 years it is ₹14,404 and ₹45,693. At 3 years it is ₹10,253 and ₹69,118. At 5 years it is ₹6,980 and ₹1,18,829.',
          'Stretching from 3 to 5 years saves about ₹3,300 a month but adds about ₹49,700 in interest. Personal loans are unsecured and the rates are higher than for a home or car loan, so the cost of extra years builds up quickly.',
        ],
      },
      {
        h: 'How much the rate matters',
        p: ['Keep the amount and the 3 years and change only the rate. At 12% the EMI is ₹9,964 and the interest ₹58,715. At 14% it is ₹10,253 and ₹69,118. At 16% it is ₹10,547 and ₹79,696. Each two points of rate adds roughly ₹10,000 of interest on this loan, so it is worth comparing several lenders.'],
      },
      {
        h: 'Fees and prepayment',
        p: ['Processing fees, insurance add-ons and a prepayment or foreclosure charge are not in the EMI. Ask for them in writing. If you expect to repay early, the prepayment calculator shows how much interest an extra payment saves, and whether the charge cancels the gain.'],
      },
    ],
    faqs: [
      { q: 'Which is better, a lower EMI or lower total interest?', a: 'It depends on your budget. Choose the lowest total cost whose EMI you can pay without strain, and avoid stretching the tenure only to get a smaller number.' },
      { q: 'How do I find the true cost of a loan?', a: 'Add the total interest and every fee. The EMI alone hides the cost.' },
      { q: 'Does a personal loan need security?', a: 'Usually no, which is why the rate is higher than for secured loans such as home or car loans.' },
      { q: 'Can I repay a personal loan early?', a: 'Often yes, but check for a prepayment charge. Use the prepayment calculator to see whether the interest saved is worth it.' },
    ],
    calcs: ['personal-loan-emi-calculator', 'loan-prepayment-calculator', 'emi-calculator'],
    related: ['how-emi-is-calculated', 'how-to-calculate-car-loan-emi'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-save-interest-with-loan-prepayment',
    title: 'How to save interest by prepaying a loan',
    description: 'See how much interest and time you save by paying extra every month or making a lump-sum prepayment, with worked numbers for a ₹10,00,000 loan.',
    intro: 'Extra payments go straight to principal, so they cut the interest and the loan length. On ₹10,00,000 at 9% for 20 years, an extra ₹5,000 a month ends the loan in 8 years 7 months and saves ₹7,21,616 of interest.',
    steps: [
      'Enter the loan amount, the rate and the original tenure in the prepayment calculator.',
      'Enter the extra amount you can pay every month, or a one-time lump sum and the EMI number after which you will pay it.',
      'Read the interest saved, the time saved and the new loan length.',
      'Try a few amounts and keep the one you can keep up without touching your emergency savings.',
      'Tell your lender how the extra payment should be applied, so that it reduces the principal.',
    ],
    sections: [
      {
        h: 'Extra every month',
        p: [
          'The loan is ₹10,00,000 at 9% for 20 years. With no extra payment you pay ₹11,59,342 in interest. With ₹2,000 extra a month the loan ends in 12 years 10 months and you save ₹4,73,149. With ₹5,000 extra it ends in 8 years 7 months and you save ₹7,21,616. With ₹10,000 extra it ends in 5 years 8 months and you save ₹8,82,545.',
          'The savings do not grow in a straight line. Each extra rupee reduces the balance that interest is charged on, so the early payments work for longer.',
        ],
      },
      {
        h: 'A one-time lump sum',
        p: ['A single ₹2,00,000 paid after 24 EMIs, with nothing extra otherwise, shortens the same loan to 13 years 3 months and saves ₹5,32,499. A lump sum is easiest to manage when you receive a bonus, and it works best early, while the balance and the remaining interest are both large.'],
      },
      {
        h: 'Before you prepay',
        p: ['Check for a prepayment charge, which some lenders add, and whether your lender reduces the tenure or the EMI when you prepay. The calculator assumes the EMI stays the same and the loan ends sooner. Keep an emergency fund first, because borrowed money is hard to take back once you have paid it off.'],
      },
    ],
    faqs: [
      { q: 'Is it better to prepay or to invest the money?', a: 'Compare the loan’s interest rate with the return you could reasonably expect after tax and risk. A guaranteed saving at the loan rate is certain, while an investment return is not.' },
      { q: 'Does prepaying lower my EMI?', a: 'Not in this calculation. The EMI stays the same and the loan ends sooner. Some lenders can lower the EMI instead if you ask.' },
      { q: 'When is the best time to prepay?', a: 'As early as you can. The balance is largest at the start, so each rupee of principal removed saves the most interest.' },
      { q: 'Will I be charged for prepaying?', a: 'It depends on the loan and the lender. Ask for any prepayment or foreclosure charge in writing before you pay.' },
    ],
    calcs: ['loan-prepayment-calculator', 'emi-calculator', 'home-loan-emi-calculator'],
    related: ['how-emi-is-calculated', 'how-to-calculate-home-loan-emi'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-much-loan-can-i-get',
    title: 'How much loan can I get? Estimate your eligibility',
    description: 'Estimate the loan you can afford from your income and existing EMIs, and see how the FOIR share, rate and tenure change the amount a lender may offer.',
    intro: 'A lender looks at how much of your monthly income can go to EMIs. With ₹1,00,000 of take-home income, no other EMIs and 50% allowed, the affordable EMI is ₹50,000, which supports a loan of about ₹57,61,542 at 8.5% for 20 years.',
    steps: [
      'Take your monthly take-home income. Here it is ₹1,00,000.',
      'Add up the EMIs and other obligations you already pay each month.',
      'Enter the share of income lenders allow for EMIs (called FOIR), the rate and the tenure in the eligibility calculator.',
      'Read the affordable EMI and the estimated eligible loan.',
      'Treat it as an estimate: lenders also check your credit score, age, job and the value of the property or vehicle.',
    ],
    sections: [
      {
        h: 'How the estimate is worked out',
        p: [
          'The affordable EMI is income × FOIR − existing EMIs: 1,00,000 × 50% = ₹50,000. The loan that this EMI can repay is found by running the EMI formula backwards, using the rate and the tenure. At 8.5% for 20 years, ₹50,000 a month repays about ₹57,61,542.',
          'The FOIR share is set by the lender and varies, so use the figure your lender quotes, and try a lower one to be careful.',
        ],
      },
      {
        h: 'What moves the answer',
        p: [
          'Existing EMIs come straight off the affordable EMI. With ₹20,000 of other EMIs the affordable EMI falls to ₹30,000 and the loan to about ₹34,56,925. If the FOIR is 40% instead of 50%, the loan falls to about ₹46,09,234.',
          'A longer tenure raises the amount you can borrow: 25 years instead of 20 gives about ₹62,09,428. A higher rate lowers it: at 9.5% the loan is about ₹53,64,052. The extra amount from a longer tenure comes with much more interest, so look at the total cost too.',
        ],
      },
      {
        h: 'Eligible is not the same as comfortable',
        p: ['Borrowing the maximum leaves no room for a rate rise, a job gap or a big expense. Many people choose a loan well below the limit. Use the EMI calculator on the amount you plan to borrow and check that you could still save every month after paying it.'],
      },
    ],
    faqs: [
      { q: 'What is FOIR?', a: 'Fixed obligations to income ratio: the share of your monthly income that goes to loan EMIs and other fixed payments. Lenders set a limit on it.' },
      { q: 'Does my credit score affect eligibility?', a: 'Yes. Lenders check it as well as your income, so this calculator gives an estimate, not an approval.' },
      { q: 'Will a co-applicant raise the amount?', a: 'Often yes, because the lender can count both incomes. Enter the combined take-home income to see the effect.' },
      { q: 'Should I borrow the full amount?', a: 'Not necessarily. Choose an EMI you can pay comfortably and still save, even if the lender would offer more.' },
    ],
    calcs: ['loan-eligibility-calculator', 'home-loan-emi-calculator', 'emi-calculator'],
    related: ['how-to-calculate-home-loan-emi', 'how-emi-is-calculated'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
];

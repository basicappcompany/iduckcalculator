import type { Guide } from './guides';

/** How-to guides for the everyday maths calculators. Every figure is checked against the calculators in tests/unit/guides.test.ts. */
export const GUIDES_MATHS: readonly Guide[] = [
  {
    slug: 'how-to-calculate-percentage-change',
    title: 'How to calculate percentage change, up or down',
    description: 'Calculate the percentage increase or decrease between two numbers with one formula, and see why a rise and the same fall are not the same percentage.',
    intro: 'Percentage change = (new − old) ÷ old × 100. From 80 to 100 it is (100 − 80) ÷ 80 × 100 = 25%, an increase. A positive answer is a rise and a negative answer is a fall, so 100 back to 80 is −20%.',
    steps: [
      'Write down the old value and the new value. Here: 80 and 100.',
      'Subtract the old from the new: 100 − 80 = 20.',
      'Divide that difference by the old value: 20 ÷ 80 = 0.25.',
      'Multiply by 100 to get the percentage: 25%.',
      'A positive result is an increase and a negative result is a decrease. Or enter both numbers in the percentage change calculator.',
    ],
    sections: [
      {
        h: 'Always divide by the old value',
        p: [
          'The percentage is measured against where you started, so the old value goes underneath. Going from 50 to 75 is an increase of 25, which is 50% of 50. Going from 200 to 150 is a decrease of 50, which is 25% of 200.',
          'Using the new value instead is the most common mistake, and it gives a wrong answer every time the two numbers differ.',
        ],
      },
      {
        h: 'Why the way back is a different percentage',
        p: ['From 80 to 100 is up 25%. From 100 back to 80 is down 20%. The gap is the same 20, but it is measured against 80 in one case and 100 in the other. This is also why a 50% rise followed by a 50% fall does not bring you back to the start: 100 becomes 150, and 150 becomes 75.'],
      },
      {
        h: 'Percentage change or percentage points',
        p: ['If a rate rises from 10% to 12%, it has gone up 2 percentage points, but by 20% as a percentage change of the rate itself. Reports mix the two, so check which one is meant. Use percentage change for prices, salaries, sales and any other quantity, and percentage points for changes in a rate.'],
      },
    ],
    faqs: [
      { q: 'What is the formula for percentage change?', a: 'Percentage change = (new − old) ÷ old × 100.' },
      { q: 'How do I calculate a percentage decrease?', a: 'Use the same formula. The result is negative, which means a decrease: from 100 to 80 is −20%.' },
      { q: 'What if the old value is zero?', a: 'The percentage is undefined, because you cannot divide by zero. Use the difference instead.' },
      { q: 'Why is a 20% rise followed by a 20% fall not back to the start?', a: 'The fall is taken on the larger number, so you end up slightly lower than you began.' },
    ],
    calcs: ['percentage-change-calculator', 'percentage-calculator', 'discount-calculator'],
    related: ['how-to-calculate-percentage', 'how-to-calculate-discount-and-final-price'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-calculate-discount-and-final-price',
    title: 'How to calculate a discount and the final price',
    description: 'Find the sale price after a discount, work out what two successive discounts really add up to, and see how much you save, with worked examples.',
    intro: 'Final price = price × (1 − discount ÷ 100). ₹2,000 with 25% off is ₹1,500. A further 10% off takes ₹150 more, so you pay ₹1,350 and save ₹650, which is 32.5% off overall, not 35%.',
    steps: [
      'Write down the original price and the discount. Here: ₹2,000 and 25%.',
      'Turn the discount into a decimal and subtract it from 1: 1 − 0.25 = 0.75.',
      'Multiply the price by that: 2,000 × 0.75 = ₹1,500.',
      'For a second discount, multiply again: 1,500 × 0.90 = ₹1,350.',
      'Subtract the final price from the original to see what you save: ₹650. Or use the discount calculator.',
    ],
    sections: [
      {
        h: 'Two discounts do not add up',
        p: [
          'A second discount applies to the already reduced price, not to the original. ₹2,000 with 25% then 10% off is ₹1,350, a saving of ₹650 or 32.5% of ₹2,000. Adding 25% and 10% to get 35% would give ₹1,300, which is wrong.',
          'The same holds for bigger offers. ₹1,000 with 40% off and then a further 20% off costs ₹480. You save ₹520, which is 52% overall, not 60%.',
        ],
      },
      {
        h: 'Working backwards',
        p: ['If you know the sale price, divide by one minus the discount to find the original. A price of ₹1,500 after 25% off was 1,500 ÷ 0.75 = ₹2,000. This is useful for checking whether a claimed original price is real.'],
      },
      {
        h: 'Compare offers fairly',
        p: ['A bigger percentage on a higher price can cost more than a smaller percentage on a lower one, so compare final prices, not the discount figures. Watch for delivery, packing and tax that are added after the discount. Percentage-off and flat-amount-off coupons are best compared by working out the final price of each.'],
      },
    ],
    faqs: [
      { q: 'How do I calculate 25% off a price?', a: 'Multiply the price by 0.75. A ₹2,000 item is then ₹1,500.' },
      { q: 'What is 20% off after 40% off?', a: 'It is 52% off in total. Multiply by 0.6 and then by 0.8, which is 0.48.' },
      { q: 'How do I find the original price from the sale price?', a: 'Divide the sale price by 1 minus the discount as a decimal.' },
      { q: 'Is the discount before or after tax?', a: 'It depends on the shop. Check the final bill, because tax may be added after the discount.' },
    ],
    calcs: ['discount-calculator', 'percentage-calculator', 'profit-loss-calculator'],
    related: ['how-to-calculate-percentage', 'how-to-calculate-percentage-change'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-calculate-profit-and-loss',
    title: 'How to calculate profit, loss and margin',
    description: 'Calculate profit or loss from a cost and a selling price, find the profit percentage and the margin, and learn why the two percentages differ.',
    intro: 'Profit = selling price − cost price. Bought for ₹800 and sold for ₹1,000, the profit is ₹200. That is 25% of the cost (200 ÷ 800 × 100) and a margin of 20% of the selling price (200 ÷ 1,000 × 100).',
    steps: [
      'Write down the cost price and the selling price. Here: ₹800 and ₹1,000.',
      'Subtract the cost from the selling price: 1,000 − 800 = ₹200. A negative answer is a loss.',
      'For the profit percentage, divide the profit by the cost and multiply by 100: 200 ÷ 800 × 100 = 25%.',
      'For the margin, divide the profit by the selling price: 200 ÷ 1,000 × 100 = 20%.',
      'Or enter the two prices in the profit and loss calculator.',
    ],
    sections: [
      {
        h: 'Profit percentage and margin are different',
        p: [
          'Profit percentage, also called markup, is measured against what you paid. Margin is measured against what you charged. The same ₹200 profit is 25% on cost but 20% on the selling price. A shop that says it earns a 20% margin has added 25% to its cost.',
          'Mixing them up leads to wrong prices. To earn a 20% margin you must charge cost ÷ 0.8, which is ₹1,000 on a cost of ₹800, not cost × 1.2, which is only ₹960.',
        ],
      },
      {
        h: 'Working out a loss',
        p: ['Bought for ₹1,200 and sold for ₹900, the loss is ₹300. As a percentage of the cost it is 25%, since 300 ÷ 1,200 × 100 = 25. Measured against the selling price it is −33.33%. A loss percentage is nearly always quoted on the cost.'],
      },
      {
        h: 'Another example and some cautions',
        p: ['A cost of ₹500 sold for ₹650 earns ₹150, a profit of 30% on cost and a margin of 23.08%. These are gross figures: they do not include rent, wages, delivery, tax or the discounts you give. For a real business, subtract those costs before calling the amount profit.'],
      },
    ],
    faqs: [
      { q: 'What is the profit percentage formula?', a: 'Profit percentage = profit ÷ cost price × 100.' },
      { q: 'What is the difference between markup and margin?', a: 'Markup is profit as a share of the cost. Margin is profit as a share of the selling price, so it is always the smaller number.' },
      { q: 'How do I calculate loss percentage?', a: 'Loss ÷ cost price × 100. A ₹300 loss on a ₹1,200 cost is 25%.' },
      { q: 'How do I price something to earn a given margin?', a: 'Divide the cost by 1 minus the margin as a decimal. For a 20% margin, divide by 0.8.' },
    ],
    calcs: ['profit-loss-calculator', 'discount-calculator', 'percentage-calculator'],
    related: ['how-to-calculate-percentage', 'how-to-calculate-discount-and-final-price'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-find-mean-median-and-mode',
    title: 'How to find the mean, median and mode of numbers',
    description: 'Find the average, median and mode of a list of numbers by hand, learn when to use each, and check the results with worked examples.',
    intro: 'The mean is the sum divided by the count, the median is the middle value once sorted, and the mode is the most common value. For 12, 18, 24, 30 and 36 the sum is 120, so the mean is 24, and the median is 24 as well.',
    steps: [
      'Write the numbers in a list and count them. Here there are 5: 12, 18, 24, 30, 36.',
      'Add them up: 120. Divide by the count to get the mean: 120 ÷ 5 = 24.',
      'Sort them from smallest to largest and pick the middle one for the median: 24.',
      'If the count is even, take the average of the two middle numbers.',
      'For the mode, find the value that appears most often. If none repeats, there is no mode.',
    ],
    sections: [
      {
        h: 'An example with an even count and a mode',
        p: [
          'Take 4, 8, 8, 10, 15, 20. The sum is 65 and there are 6 numbers, so the mean is 10.83. Sorted, the two middle numbers are 8 and 10, so the median is 9. The value 8 appears twice, so the mode is 8.',
          'The three answers differ because the list is not symmetric: the large value, 20, pulls the mean above the median.',
        ],
      },
      {
        h: 'Which one to use',
        p: ['Use the mean when the values are fairly even, such as test scores. Use the median when a few extreme values would distort the mean, such as salaries or house prices. Use the mode for the most common choice, such as the most popular shoe size. A list can have more than one mode if two values tie.'],
      },
      {
        h: 'Spread as well as the middle',
        p: ['The range, the largest minus the smallest, shows how spread out the numbers are. For 40, 55, 62, 70 and 90 the sum is 317, the mean 63.4, the median 62 and the range 50. Two sets can share a mean and still be very different, so look at the range or the individual values too.'],
      },
    ],
    faqs: [
      { q: 'What is the difference between mean and median?', a: 'The mean uses every value, so extremes affect it. The median is only the middle value and ignores how extreme the ends are.' },
      { q: 'Can a list have no mode?', a: 'Yes. If no value repeats, there is no mode. A list can also have two or more modes.' },
      { q: 'How do I find the median of an even number of values?', a: 'Sort the list and take the mean of the two middle values.' },
      { q: 'How do I find a weighted average?', a: 'Multiply each value by its weight, add the results and divide by the total weight.' },
    ],
    calcs: ['average-calculator', 'percentage-calculator', 'marks-percentage-calculator'],
    related: ['how-to-calculate-percentage', 'how-to-calculate-marks-percentage'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-simplify-and-solve-ratios',
    title: 'How to simplify a ratio and solve proportions',
    description: 'Simplify a ratio to its lowest terms, find a missing number in an equal ratio, and split an amount in a ratio, with simple worked examples.',
    intro: 'To simplify a ratio, divide both numbers by their greatest common divisor. For 12 : 18 that divisor is 6, so the ratio is 2 : 3. To find a missing number in A : B = C : D, use D = C × B ÷ A, which gives 15 when C is 10.',
    steps: [
      'Write the ratio, for example 12 : 18.',
      'Find the greatest number that divides both exactly. For 12 and 18 it is 6.',
      'Divide both by it: 12 ÷ 6 = 2 and 18 ÷ 6 = 3, so the ratio is 2 : 3.',
      'To solve 12 : 18 = 10 : D, cross-multiply: D = 10 × 18 ÷ 12 = 15.',
      'Or enter A, B and C in the ratio calculator and read the simplest ratio and D.',
    ],
    sections: [
      {
        h: 'More examples, including decimals',
        p: [
          'The ratio 3 : 4 is already in its simplest form, and 3 : 4 = 15 : D gives D = 15 × 4 ÷ 3 = 20. A ratio with decimals, such as 2.5 : 10, is simplified by scaling to whole numbers first: it is 1 : 4. Then 2.5 : 10 = 4 : D gives D = 16.',
          'A ratio can also be written as a decimal. 12 : 18 is 12 ÷ 18 = 0.6667, which is the same as 2 : 3.',
        ],
      },
      {
        h: 'Splitting an amount in a ratio',
        p: ['To share ₹500 in the ratio 2 : 3, add the parts, 2 + 3 = 5, divide the total by that sum, 500 ÷ 5 = 100, and multiply by each part. One person gets ₹200 and the other gets ₹300. The same method works for dividing profits, ingredients or costs between people.'],
      },
      {
        h: 'Scaling a recipe or a map',
        p: ['A ratio keeps its meaning when both sides are multiplied or divided by the same number. If a recipe uses flour and sugar in the ratio 3 : 1 and you want 15 parts of flour, you need 5 parts of sugar. On a map, a scale of 1 : 50,000 means 1 cm on the map is 50,000 cm, or 500 m, on the ground.'],
      },
    ],
    faqs: [
      { q: 'What is a ratio?', a: 'A comparison of two quantities, written A : B, such as 2 : 3.' },
      { q: 'What is a proportion?', a: 'A statement that two ratios are equal, such as 12 : 18 = 10 : 15.' },
      { q: 'How do I cross-multiply?', a: 'In A : B = C : D, A × D = B × C. Solve for the missing number by dividing.' },
      { q: 'Can ratios have more than two parts?', a: 'Yes, such as 2 : 3 : 5. Add all the parts to split an amount between them.' },
    ],
    calcs: ['ratio-calculator', 'fraction-calculator', 'percentage-calculator'],
    related: ['how-to-add-subtract-multiply-and-divide-fractions', 'how-to-calculate-percentage'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-add-subtract-multiply-and-divide-fractions',
    title: 'How to add, subtract, multiply and divide fractions',
    description: 'Do the four operations on fractions step by step, simplify the answer and turn it into a mixed number, with worked examples you can check.',
    intro: 'To add 1/2 and 1/3, put them over a common denominator: (1 × 3 + 1 × 2) ÷ (2 × 3) = 5/6. To multiply, multiply the tops and the bottoms. To divide, flip the second fraction and multiply, and then simplify.',
    steps: [
      'To add or subtract, cross-multiply: a/b + c/d = (ad + bc) ÷ bd. For 1/2 + 1/3 that is 5/6.',
      'To multiply, multiply the numerators and the denominators: 2/3 × 3/5 = 6/15.',
      'To divide, multiply by the reciprocal: 1/2 ÷ 1/4 = 1/2 × 4/1 = 4/2.',
      'Simplify by dividing the top and bottom by their greatest common divisor: 6/15 becomes 2/5 and 4/2 becomes 2.',
      'If the top is bigger than the bottom, write it as a mixed number. Or use the fraction calculator.',
    ],
    sections: [
      {
        h: 'Worked examples',
        p: [
          'Subtract: 3/4 − 1/6 = (3 × 6 − 1 × 4) ÷ (4 × 6) = 14/24, which simplifies to 7/12. Multiply: 2/3 × 3/5 = 6/15 = 2/5. Divide: 1/2 ÷ 1/4 = 2.',
          'Add with a result above one: 7/8 + 3/4 = (7 × 4 + 3 × 8) ÷ (8 × 4) = 52/32, which simplifies to 13/8. As a mixed number that is 1 5/8, and as a decimal 1.625.',
        ],
      },
      {
        h: 'Why a common denominator is needed',
        p: ['You can only add or subtract pieces of the same size. Halves and thirds are different sizes, so rewrite both as sixths first: 1/2 = 3/6 and 1/3 = 2/6, and then 3/6 + 2/6 = 5/6. Cross-multiplying does this in one step, at the price of a larger denominator that you may then need to simplify.'],
      },
      {
        h: 'Common slips to avoid',
        p: ['Do not add the denominators: 1/2 + 1/3 is not 2/5. Do not forget to flip only the second fraction when dividing. And always check whether the answer can be simplified. A fraction is in its simplest form when the top and bottom share no divisor except 1.'],
      },
    ],
    faqs: [
      { q: 'How do I add fractions with different denominators?', a: 'Rewrite them over a common denominator, add the numerators and simplify.' },
      { q: 'How do I divide by a fraction?', a: 'Multiply by its reciprocal: flip the second fraction and multiply.' },
      { q: 'What is a mixed number?', a: 'A whole number with a fraction, such as 1 5/8, which equals 13/8.' },
      { q: 'How do I simplify a fraction?', a: 'Divide the numerator and the denominator by their greatest common divisor.' },
    ],
    calcs: ['fraction-calculator', 'ratio-calculator', 'percentage-calculator'],
    related: ['how-to-simplify-and-solve-ratios', 'how-to-calculate-percentage'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-use-the-scientific-calculator',
    title: 'How to use the scientific and basic calculators',
    description: 'Type sums with brackets, powers, roots, logs, factorials and trigonometry into the scientific calculator, and use the basic calculator for two-number sums.',
    intro: 'In the scientific calculator type the whole expression and read the answer: (2 + 3) × 4 + sqrt(16) gives 24. For a quick sum of two numbers use the basic calculator, for example 1,250 × 12 = 15,000.',
    steps: [
      'Open the scientific calculator and type an expression, such as (2 + 3) * 4 + sqrt(16).',
      'Use + - * / for the four operations, ^ for powers, ! for factorials and mod for remainders. You can also type × and ÷.',
      'For trigonometry, choose degrees or radians, then type sin(30), cos(60) or tan(45).',
      'Read the answer. If the expression is not valid, the calculator says what is wrong, such as an unclosed bracket.',
      'For two numbers and one operation, use the basic calculator instead.',
    ],
    sections: [
      {
        h: 'The order of operations',
        p: [
          'The calculator works brackets first, then powers and factorials, then multiplication, division and mod, then addition and subtraction. So 2 + 3 × 4 is 14, not 20, and (2 + 3) × 4 is 20. Powers go from right to left, so 2^3^2 is 2^9 = 512.',
          'A minus sign in front of a power applies after it: −2^2 is −4. Write (−2)^2 if you want 4.',
        ],
      },
      {
        h: 'Functions and constants',
        p: ['Try 2^10 = 1,024, sqrt(16) = 4, cbrt(27) = 3, log(1000) = 3 (base 10), ln(e) = 1 (natural log), 5! = 120 and 27^(1/3) = 3. In degrees, sin(30) = 0.5 and sin(180) is exactly 0. The names pi and e stand for 3.14159… and 2.71828…, and 2pi or 3(4 + 5) work without a multiplication sign.'],
      },
      {
        h: 'The basic calculator',
        p: ['Enter the first number, choose an operation and enter the second. It handles add, subtract, multiply, divide, power, remainder and percent of: 15% of 2,400 is 360, and 17 mod 5 is 2. It will not divide by zero, and it tells you so instead of showing a wrong answer. Nothing you type leaves your device.'],
      },
    ],
    faqs: [
      { q: 'How do I enter a square root?', a: 'Type sqrt(16), or use the √ sign before a number, such as √16.' },
      { q: 'Is it degrees or radians?', a: 'Your choice, set under the expression. Degrees is the default.' },
      { q: 'How do I type a power?', a: 'Use ^, so 2^10 is 1,024.' },
      { q: 'Why does it say a bracket is not closed?', a: 'Every opening bracket needs a closing one. Count them and add the missing one.' },
    ],
    calcs: ['scientific-calculator', 'basic-calculator', 'percentage-calculator'],
    related: ['how-to-calculate-percentage', 'how-to-add-subtract-multiply-and-divide-fractions'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
];

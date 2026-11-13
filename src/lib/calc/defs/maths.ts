import { fail, n, num, s, sel, type CalcDef } from '../types';

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
/** Round to 10 decimals so 0.1 + 0.2 shows as 0.3. */
const tidy = (x: number) => Math.round(x * 1e10) / 1e10;

export const MATHS: CalcDef[] = [
  {
    slug: 'percentage-calculator',
    name: 'Percentage calculator',
    group: 'maths',
    emoji: '％',
    summary: 'All the common percentage questions in one place.',
    quick: 'Pick the question, enter two numbers and read the answer. For example, 15% of 2,400 is 360.',
    keywords: 'percent of what percent increase decrease by percentage find',
    title: 'Percentage Calculator: % of, what %, increase and decrease',
    description: 'Free percentage calculator. Find X% of a number, what percent one number is of another, or increase and decrease a number by a percentage.',
    fields: [
      sel('mode', 'What do you want to find?', 'of', [
        ['of', 'X% of Y'],
        ['is', 'X is what % of Y'],
        ['whole', 'X is Y% of what number'],
        ['up', 'Increase X by Y%'],
        ['down', 'Decrease X by Y%'],
      ]),
      num('x', 'X (the first number)', 15, { step: 1 }),
      num('y', 'Y (the second number)', 2400, { step: 1 }),
    ],
    compute: (v) => {
      const x = n(v, 'x');
      const y = n(v, 'y');
      const mode = s(v, 'mode');
      let answer: number;
      let label: string;
      let sentence: string;
      if (mode === 'of') {
        answer = (x / 100) * y;
        label = `${x}% of ${y}`;
        sentence = `${x} ÷ 100 × ${y}`;
      } else if (mode === 'is') {
        if (y === 0) return fail('Y cannot be 0.');
        answer = (x / y) * 100;
        label = `${x} as a percentage of ${y}`;
        sentence = `${x} ÷ ${y} × 100`;
      } else if (mode === 'whole') {
        if (y === 0) return fail('Y cannot be 0.');
        answer = (x / y) * 100;
        label = `The number that ${x} is ${y}% of`;
        sentence = `${x} ÷ ${y} × 100`;
      } else if (mode === 'up') {
        answer = x * (1 + y / 100);
        label = `${x} increased by ${y}%`;
        sentence = `${x} × (1 + ${y} ÷ 100)`;
      } else {
        answer = x * (1 - y / 100);
        label = `${x} decreased by ${y}%`;
        sentence = `${x} × (1 − ${y} ÷ 100)`;
      }
      const isPercent = mode === 'is';
      return { metrics: [{ label, value: tidy(answer), kind: isPercent ? 'percent' : 'number', decimals: 2, big: true }], note: `Worked as ${sentence}.` };
    },
    formula: ['X% of Y = X ÷ 100 × Y', 'X is what % of Y = X ÷ Y × 100', 'X is Y% of what = X ÷ Y × 100', 'Increase X by Y% = X × (1 + Y ÷ 100)', 'Decrease X by Y% = X × (1 − Y ÷ 100)'],
    example: '15% of 2,400 = 15 ÷ 100 × 2,400 = 360. And 360 is 15% of 2,400 because 360 ÷ 2,400 × 100 = 15.',
    how: [
      '"Percent" means "out of 100", so 15% is 15 out of every 100, or 0.15. To find a percentage of a number, multiply by it.',
      'To go the other way, divide the part by the whole and multiply by 100.',
      'Pick the question that matches your problem and the calculator picks the right formula.',
    ],
    faqs: [
      { q: 'How do I calculate a percentage of a number?', a: 'Divide the percentage by 100 and multiply by the number. 20% of 80 is 0.2 × 80 = 16.' },
      { q: 'How do I find what percent one number is of another?', a: 'Divide the first by the second and multiply by 100. 30 out of 120 is 30 ÷ 120 × 100 = 25%.' },
      { q: 'How do I add a percentage to a price?', a: 'Multiply by 1 plus the percentage as a decimal. Adding 18% to 500 is 500 × 1.18 = 590.' },
      { q: 'What is the difference between percent and percentage points?', a: 'Going from 10% to 12% is a rise of 2 percentage points, but a 20% increase in the rate itself.' },
    ],
    related: ['percentage-change-calculator', 'discount-calculator', 'profit-loss-calculator'],
  },
  {
    slug: 'percentage-change-calculator',
    name: 'Percentage change calculator',
    group: 'maths',
    emoji: '📉',
    summary: 'Percent increase or decrease from an old value to a new one.',
    quick: 'Enter the old and the new value. A rise from 80 to 100 is a 25% increase.',
    keywords: 'percent increase decrease growth rise fall difference change',
    title: 'Percentage Change Calculator: increase or decrease',
    description: 'Free percentage change calculator. Enter an old and a new value to see the percent increase or decrease and the difference.',
    fields: [num('from', 'Old value', 80, { step: 1 }), num('to', 'New value', 100, { step: 1 })],
    compute: (v) => {
      const from = n(v, 'from');
      const to = n(v, 'to');
      if (from === 0) return fail('The old value cannot be 0, because a change from nothing has no percentage.');
      const change = ((to - from) / Math.abs(from)) * 100;
      return {
        metrics: [
          { label: change >= 0 ? 'Percentage increase' : 'Percentage decrease', value: Math.abs(tidy(change)), kind: 'percent', decimals: 2, big: true },
          { label: 'Difference', value: tidy(to - from), kind: 'number', decimals: 2 },
        ],
      };
    },
    formula: ['Percentage change = (new − old) ÷ |old| × 100', 'A positive result is an increase and a negative one is a decrease'],
    example: 'From 80 to 100: (100 − 80) ÷ 80 × 100 = 25%. From 100 back to 80 is (80 − 100) ÷ 100 × 100 = −20%, so the way back is a smaller percentage.',
    how: [
      'Percentage change compares the size of the move with where you started.',
      'It is not symmetric: a 25% rise needs only a 20% fall to return to the start.',
      'Use it for price rises, marks, population, salary hikes and anything measured at two points in time.',
    ],
    faqs: [
      { q: 'How do I calculate percent increase?', a: 'Subtract the old value from the new, divide by the old value and multiply by 100.' },
      { q: 'Why is a 50% rise then a 50% fall not back to the start?', a: 'The fall is worked out on the larger number. 100 up 50% is 150, and 150 down 50% is 75.' },
      { q: 'What if the old value is 0?', a: 'The percentage is undefined, so the calculator asks for a different starting value.' },
      { q: 'How is this different from percentage difference?', a: 'Percentage change has a clear before and after. Percentage difference compares two values with no order, using their average as the base.' },
    ],
    related: ['percentage-calculator', 'profit-loss-calculator', 'cagr-calculator'],
  },
  {
    slug: 'discount-calculator',
    name: 'Discount calculator',
    group: 'maths',
    emoji: '🏷️',
    summary: 'Sale price after a discount, with an optional second discount.',
    quick: 'Enter the price and the discount. A ₹2,000 item with 25% off and then 10% off costs ₹1,350, a saving of ₹650.',
    keywords: 'sale price off coupon offer discount percent final price savings',
    title: 'Discount Calculator: sale price and how much you save',
    description: 'Free discount calculator. Enter the original price and the discount percent to see the sale price and the money saved, with an optional second discount.',
    fields: [
      num('price', 'Original price', 2000, { unit: 'money', min: 0, step: 100 }),
      num('d1', 'Discount', 25, { unit: 'percent', min: 0, max: 100, step: 1 }),
      num('d2', 'Extra discount after the first (optional)', 10, { unit: 'percent', min: 0, max: 100, step: 1 }),
    ],
    compute: (v) => {
      const price = n(v, 'price');
      if (price <= 0) return fail('Enter the original price.');
      const final = price * (1 - n(v, 'd1') / 100) * (1 - n(v, 'd2') / 100);
      return {
        metrics: [
          { label: 'You pay', value: final, kind: 'money', decimals: 2, big: true },
          { label: 'You save', value: price - final, kind: 'money', decimals: 2 },
          { label: 'Effective discount', value: ((price - final) / price) * 100, kind: 'percent', decimals: 2 },
        ],
        note: 'Two discounts do not add up: 25% then 10% is 32.5% off, not 35%.',
      };
    },
    formula: ['Price after one discount = price × (1 − d1 ÷ 100)', 'With a second discount: × (1 − d2 ÷ 100)', 'You save = original price − final price'],
    example: '₹2,000 with 25% off is ₹1,500. A further 10% off takes ₹150 more, so you pay ₹1,350 and save ₹650, which is 32.5% off overall.',
    how: [
      'Each discount applies to the price left after the one before it, which is why two discounts give less than their sum.',
      'Leave the second box at 0 for a single discount.',
      'Remember GST and delivery charges may be added after the discount.',
    ],
    faqs: [
      { q: 'How do I calculate the sale price?', a: 'Multiply the price by (1 minus the discount as a decimal). 30% off ₹500 is 500 × 0.70 = ₹350.' },
      { q: 'Is 20% off then 10% off the same as 30% off?', a: 'No. It is 28% off, because the 10% applies to the already-reduced price.' },
      { q: 'How do I find the original price from the sale price?', a: 'Divide the sale price by (1 minus the discount). A ₹350 price after 30% off was 350 ÷ 0.7 = ₹500.' },
      { q: 'Does the discount include tax?', a: 'It depends on the shop. Check whether the label price includes GST.' },
    ],
    related: ['percentage-calculator', 'profit-loss-calculator', 'percentage-change-calculator'],
  },
  {
    slug: 'profit-loss-calculator',
    name: 'Profit and loss calculator',
    group: 'maths',
    emoji: '🛍️',
    summary: 'Profit or loss, as a percentage of cost, from cost and selling price.',
    quick: 'Enter the cost price and the selling price. Buying at ₹800 and selling at ₹1,000 gives a ₹200 profit, which is 25% of the cost.',
    keywords: 'cost price selling price margin markup gain loss business',
    title: 'Profit and Loss Calculator: profit percent and margin',
    description: 'Free profit and loss calculator. Enter cost price and selling price to see the profit or loss, the profit percentage on cost and the margin on sales.',
    fields: [num('cost', 'Cost price', 800, { unit: 'money', min: 0, step: 50 }), num('sell', 'Selling price', 1000, { unit: 'money', min: 0, step: 50 })],
    compute: (v) => {
      const cost = n(v, 'cost');
      const sell = n(v, 'sell');
      if (cost <= 0) return fail('Enter the cost price.');
      const diff = sell - cost;
      return {
        metrics: [
          { label: diff >= 0 ? 'Profit' : 'Loss', value: Math.abs(diff), kind: 'money', decimals: 2, big: true },
          { label: diff >= 0 ? 'Profit percentage (on cost)' : 'Loss percentage (on cost)', value: Math.abs((diff / cost) * 100), kind: 'percent', decimals: 2 },
          { label: 'Margin (on selling price)', value: sell > 0 ? (diff / sell) * 100 : 0, kind: 'percent', decimals: 2 },
        ],
      };
    },
    formula: ['Profit = selling price − cost price (a negative result is a loss)', 'Profit % = profit ÷ cost price × 100', 'Margin % = profit ÷ selling price × 100'],
    example: 'Cost ₹800, sold for ₹1,000: profit = ₹200. Profit % = 200 ÷ 800 × 100 = 25%. Margin = 200 ÷ 1,000 × 100 = 20%.',
    how: [
      'Profit percentage in school maths is on the cost price. Shopkeepers often quote margin, which is on the selling price, so the two figures differ.',
      'If the selling price is below the cost price the result is a loss, shown with the same percentages.',
      'To hit a target profit, work backwards: selling price = cost × (1 + profit%).',
    ],
    faqs: [
      { q: 'What is the difference between margin and markup?', a: 'Markup is profit on cost (25% in the example). Margin is profit on the selling price (20% in the example).' },
      { q: 'How do I find the selling price for a target profit?', a: 'Multiply the cost by (1 + profit% ÷ 100). For 25% on ₹800: 800 × 1.25 = ₹1,000.' },
      { q: 'Is loss percentage also on cost?', a: 'Yes, in standard school maths: loss ÷ cost price × 100.' },
      { q: 'Does it include expenses like rent?', a: 'No. Enter your total cost including any expenses to get true profit.' },
    ],
    related: ['percentage-calculator', 'discount-calculator', 'percentage-change-calculator'],
  },
  {
    slug: 'average-calculator',
    name: 'Average calculator',
    group: 'maths',
    emoji: '⚖️',
    summary: 'Mean, median, mode, sum and range of a list of numbers.',
    quick: 'Type your numbers separated by commas or spaces. The numbers 12, 18, 24, 30 and 36 have a mean and a median of 24.',
    keywords: 'mean median mode average numbers list range sum',
    title: 'Average Calculator: mean, median and mode',
    description: 'Free average calculator. Paste a list of numbers to get the mean, median, mode, sum, count, smallest, largest and range at once.',
    fields: [{ kind: 'text', id: 'list', label: 'Numbers (separated by commas, spaces or new lines)', default: '12, 18, 24, 30, 36' }],
    compute: (v) => {
      const nums = s(v, 'list')
        .split(/[\s,;]+/)
        .filter(Boolean)
        .map(Number);
      if (nums.length === 0 || nums.some((x) => !Number.isFinite(x))) return fail('Enter numbers separated by commas or spaces.');
      const sorted = [...nums].sort((a, b) => a - b);
      const sum = nums.reduce((a, b) => a + b, 0);
      const mid = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
      const counts = new Map<number, number>();
      for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1);
      const top = Math.max(...counts.values());
      const modes = [...counts].filter(([, c]) => c === top).map(([k]) => k);
      return {
        metrics: [
          { label: 'Mean (average)', value: tidy(sum / nums.length), kind: 'number', decimals: 4, big: true },
          { label: 'Median', value: tidy(median), kind: 'number', decimals: 4 },
          { label: 'Mode', value: top === 1 ? 'No repeated value' : modes.join(', '), kind: 'text' },
          { label: 'Sum', value: tidy(sum), kind: 'number', decimals: 4 },
          { label: 'Count', value: nums.length, kind: 'number', decimals: 0 },
          { label: 'Smallest', value: sorted[0]!, kind: 'number', decimals: 4 },
          { label: 'Largest', value: sorted[sorted.length - 1]!, kind: 'number', decimals: 4 },
          { label: 'Range', value: tidy(sorted[sorted.length - 1]! - sorted[0]!), kind: 'number', decimals: 4 },
        ],
      };
    },
    formula: ['Mean = sum of the numbers ÷ how many there are', 'Median = the middle number once sorted (the mean of the two middle ones if the count is even)', 'Mode = the value that appears most often'],
    example: '12, 18, 24, 30, 36: the sum is 120 and there are 5 numbers, so the mean is 24. Sorted, the middle number is 24, so the median is 24 too.',
    how: [
      'The mean is the usual average. The median is the middle value and is less affected by one very large or very small number.',
      'The mode is the most common value; if nothing repeats there is no mode.',
      'Paste a column from a spreadsheet and the calculator splits it for you.',
    ],
    faqs: [
      { q: 'When should I use the median instead of the mean?', a: 'When a few extreme values would pull the mean away from what is typical, such as salaries or house prices.' },
      { q: 'Can a list have more than one mode?', a: 'Yes. If two values appear equally often, both are shown.' },
      { q: 'How do I find a weighted average?', a: 'Multiply each value by its weight, add them up and divide by the total of the weights. This calculator gives the plain average.' },
      { q: 'How do I find the average of percentages?', a: 'Averaging is right only if each percentage is out of the same total. Otherwise use the totals.' },
    ],
    related: ['percentage-calculator', 'ratio-calculator', 'marks-percentage-calculator'],
  },
  {
    slug: 'ratio-calculator',
    name: 'Ratio calculator',
    group: 'maths',
    emoji: '➗',
    summary: 'Simplify a ratio and find the missing number in an equal ratio.',
    quick: 'Enter A and B to simplify the ratio, and C to find D so that A : B = C : D. The ratio 12 : 18 simplifies to 2 : 3, and 10 : 15 is equal to it.',
    keywords: 'simplify ratio proportion equivalent a:b missing value scale',
    title: 'Ratio Calculator: simplify and solve proportions',
    description: 'Free ratio calculator. Simplify a ratio to its lowest terms and solve A : B = C : D for the missing number.',
    fields: [num('a', 'A', 12, { step: 1 }), num('b', 'B', 18, { step: 1 }), num('c', 'C (to find D)', 10, { step: 1 })],
    compute: (v) => {
      const a = n(v, 'a');
      const b = n(v, 'b');
      if (a === 0 || b === 0) return fail('A and B cannot be 0.');
      const dec = (x: number) => Math.round(x * 1e6);
      const g = Number.isInteger(a) && Number.isInteger(b) ? gcd(a, b) : gcd(dec(a), dec(b)) / (Number.isInteger(a) && Number.isInteger(b) ? 1 : 1e6);
      return {
        metrics: [
          { label: 'Simplest ratio', value: `${tidy(a / g)} : ${tidy(b / g)}`, kind: 'text', big: true },
          { label: `D, so that ${a} : ${b} = ${n(v, 'c')} : D`, value: tidy((n(v, 'c') * b) / a), kind: 'number', decimals: 4 },
          { label: 'A ÷ B as a decimal', value: tidy(a / b), kind: 'number', decimals: 4 },
        ],
      };
    },
    formula: ['Simplify by dividing A and B by their greatest common divisor', 'A : B = C : D  gives  D = C × B ÷ A'],
    example: '12 : 18: the greatest common divisor is 6, so the ratio is 2 : 3. If C = 10, then D = 10 × 18 ÷ 12 = 15, so 12 : 18 = 10 : 15.',
    how: [
      'A ratio compares two quantities. Dividing both by the same number does not change it, so 12 : 18 and 2 : 3 are the same ratio.',
      'To scale a recipe or a map, keep the ratio and solve for the missing number.',
      'Cross-multiplying is the shortcut: A × D = B × C.',
    ],
    faqs: [
      { q: 'How do I simplify a ratio?', a: 'Divide both numbers by their greatest common divisor. For 12 : 18 that is 6, giving 2 : 3.' },
      { q: 'How do I split an amount in a ratio?', a: 'Add the parts, divide the total by that sum and multiply by each part. ₹500 in 2 : 3 is ₹200 and ₹300.' },
      { q: 'Can ratios use decimals?', a: 'Yes. The calculator scales decimals to whole numbers before simplifying.' },
      { q: 'What is a proportion?', a: 'A statement that two ratios are equal, such as 12 : 18 = 10 : 15.' },
    ],
    related: ['percentage-calculator', 'fraction-calculator', 'average-calculator'],
  },
  {
    slug: 'fraction-calculator',
    name: 'Fraction calculator',
    group: 'maths',
    emoji: '½',
    summary: 'Add, subtract, multiply and divide fractions, simplified.',
    quick: 'Enter two fractions and choose an operation. 1/2 + 1/3 = 5/6, which is 0.8333 as a decimal.',
    keywords: 'add subtract multiply divide fractions simplify mixed number numerator denominator',
    title: 'Fraction Calculator: add, subtract, multiply, divide',
    description: 'Free fraction calculator. Add, subtract, multiply or divide two fractions and get the simplified answer, the mixed number and the decimal.',
    fields: [
      num('n1', 'First fraction: numerator', 1, { step: 1 }),
      num('d1', 'First fraction: denominator', 2, { step: 1 }),
      sel('op', 'Operation', 'add', [
        ['add', '+ add'],
        ['sub', '− subtract'],
        ['mul', '× multiply'],
        ['div', '÷ divide'],
      ]),
      num('n2', 'Second fraction: numerator', 1, { step: 1 }),
      num('d2', 'Second fraction: denominator', 3, { step: 1 }),
    ],
    compute: (v) => {
      const [n1, d1, n2, d2] = [n(v, 'n1'), n(v, 'd1'), n(v, 'n2'), n(v, 'd2')];
      if (![n1, d1, n2, d2].every(Number.isInteger)) return fail('Use whole numbers for numerators and denominators.');
      if (d1 === 0 || d2 === 0) return fail('A denominator cannot be 0.');
      const op = s(v, 'op');
      let num_: number;
      let den: number;
      if (op === 'add') [num_, den] = [n1 * d2 + n2 * d1, d1 * d2];
      else if (op === 'sub') [num_, den] = [n1 * d2 - n2 * d1, d1 * d2];
      else if (op === 'mul') [num_, den] = [n1 * n2, d1 * d2];
      else {
        if (n2 === 0) return fail('You cannot divide by a fraction whose numerator is 0.');
        [num_, den] = [n1 * d2, d1 * n2];
      }
      if (den < 0) [num_, den] = [-num_, -den];
      const g = gcd(num_, den) || 1;
      const [a, b] = [num_ / g, den / g];
      const whole = Math.trunc(a / b);
      const rem = Math.abs(a) % b;
      return {
        metrics: [
          { label: 'Answer', value: b === 1 ? String(a) : `${a}/${b}`, kind: 'text', big: true },
          { label: 'Mixed number', value: rem === 0 ? String(whole) : whole === 0 ? `${a < 0 ? '-' : ''}${rem}/${b}` : `${whole} ${rem}/${b}`, kind: 'text' },
          { label: 'Decimal', value: tidy(a / b), kind: 'number', decimals: 6 },
        ],
      };
    },
    formula: ['a/b + c/d = (ad + bc) ÷ bd,  a/b − c/d = (ad − bc) ÷ bd', 'a/b × c/d = ac ÷ bd,  a/b ÷ c/d = ad ÷ bc', 'Then divide top and bottom by their greatest common divisor'],
    example: '1/2 + 1/3 = (1 × 3 + 1 × 2) ÷ (2 × 3) = 5/6. The decimal is 0.833333.',
    how: [
      'To add or subtract fractions, give them the same denominator first; the calculator does this by cross-multiplying.',
      'To multiply, multiply the tops and the bottoms. To divide, flip the second fraction and multiply.',
      'The answer is always reduced to lowest terms and also shown as a mixed number.',
    ],
    faqs: [
      { q: 'How do I add fractions with different denominators?', a: 'Rewrite them over a common denominator, add the numerators, then simplify. 1/2 + 1/3 = 3/6 + 2/6 = 5/6.' },
      { q: 'How do I simplify a fraction?', a: 'Divide the numerator and denominator by their greatest common divisor. 6/8 becomes 3/4.' },
      { q: 'How do I divide by a fraction?', a: 'Multiply by its reciprocal. 1/2 ÷ 1/4 = 1/2 × 4/1 = 2.' },
      { q: 'What is a mixed number?', a: 'A whole number with a fraction, such as 1 1/2, which equals 3/2.' },
    ],
    related: ['ratio-calculator', 'percentage-calculator', 'average-calculator'],
  },
];

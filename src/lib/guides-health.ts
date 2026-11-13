import type { Guide } from './guides';

/** How-to guides for the health calculators. They give general information, not medical advice. Every figure is checked against the calculators in tests/unit/guides.test.ts. */
export const GUIDES_HEALTH: readonly Guide[] = [
  {
    slug: 'how-to-calculate-bmi',
    title: 'How to calculate BMI and what the result means',
    description: 'Calculate body mass index from your weight and height, read the WHO categories, and learn what BMI can and cannot tell you, with worked examples.',
    intro: 'BMI = weight in kg ÷ (height in metres)². A person weighing 70 kg at 175 cm has a BMI of 70 ÷ (1.75 × 1.75) = 22.9, which is in the normal range. The healthy weight range for that height is 56.7 to 76.3 kg.',
    steps: [
      'Measure your weight in kilograms and your height in centimetres. Here: 70 kg and 175 cm.',
      'Turn the height into metres: 175 cm is 1.75 m.',
      'Multiply the height by itself: 1.75 × 1.75 = 3.0625.',
      'Divide the weight by that: 70 ÷ 3.0625 = 22.9.',
      'Compare with the WHO categories, or enter your numbers in the BMI calculator.',
    ],
    sections: [
      {
        h: 'The WHO categories',
        p: [
          'Under 18.5 is underweight, 18.5 to 24.9 is normal weight, 25 to 29.9 is overweight and 30 or more is obese. At 170 cm, 90 kg gives a BMI of 31.1 (obese), 50 kg gives 17.3 (underweight), and the healthy range is 53.5 to 72.0 kg. At 150 cm, 60 kg gives 26.7, which is overweight, and the healthy range is 41.6 to 56.0 kg.',
          'The healthy range is worked backwards from the 18.5 and 24.9 limits, so it shows the weights that would put you in the normal category at your height.',
        ],
      },
      {
        h: 'What BMI does not show',
        p: ['BMI does not see muscle, bone or where fat sits on the body, so a muscular person can score high without carrying much fat. It also varies with age and sex. Some Asian health guidelines use lower cut-offs, with overweight starting near 23. Treat BMI as a screening number, not a diagnosis.'],
      },
      {
        h: 'What to do with the result',
        p: ['If your BMI is outside the normal range, it is a reason to talk to a doctor or dietitian, not a reason for a crash diet. A waist measurement or a body fat estimate gives a second view. This page gives general information, not medical advice.'],
      },
    ],
    faqs: [
      { q: 'What is the BMI formula?', a: 'Weight in kilograms divided by height in metres squared.' },
      { q: 'What is a normal BMI?', a: 'The WHO normal range is 18.5 to 24.9.' },
      { q: 'Is BMI accurate for athletes?', a: 'Not always. Muscle weighs more than fat, so a muscular person can have a high BMI without excess fat.' },
      { q: 'Is the BMI cut-off different in India?', a: 'Some Asian guidelines use lower cut-offs, with overweight starting near 23. Ask your doctor which applies to you.' },
    ],
    calcs: ['bmi-calculator', 'ideal-weight-calculator', 'body-fat-calculator'],
    related: ['how-to-find-your-ideal-weight', 'how-to-estimate-body-fat'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-calculate-bmr',
    title: 'How to calculate BMR: the calories you burn at rest',
    description: 'Calculate your basal metabolic rate with the Mifflin-St Jeor equation, with worked examples for a man and a woman, and learn what the number means.',
    intro: 'BMR is the energy your body uses at rest. For men it is 10 × weight (kg) + 6.25 × height (cm) − 5 × age + 5. A 30-year-old man at 70 kg and 175 cm has a BMR of 1,649 calories a day.',
    steps: [
      'Note your sex, age, weight in kg and height in cm. Here: a man, 30, 70 kg, 175 cm.',
      'Multiply the weight by 10: 700. Multiply the height by 6.25: 1,093.75.',
      'Multiply the age by 5: 150.',
      'Add the first two, subtract the age part and add 5 for a man: 700 + 1,093.75 − 150 + 5 = 1,648.75.',
      'For a woman subtract 161 instead of adding 5, or use the BMR calculator.',
    ],
    sections: [
      {
        h: 'A worked example for a woman',
        p: [
          'A woman aged 28 at 60 kg and 162 cm: 10 × 60 = 600, 6.25 × 162 = 1,012.5, and 5 × 28 = 140. Then 600 + 1,012.5 − 140 − 161 = 1,311.5 calories a day.',
          'The calculator also shows the figure per hour: about 69 calories an hour for the man above.',
        ],
      },
      {
        h: 'What BMR is and is not',
        p: ['BMR is the energy needed to keep you alive at rest: breathing, circulation, temperature and cell repair. It is not what you eat in a day, because you also move, work and digest food. To estimate your daily needs, multiply the BMR by an activity factor, which the daily calories guide explains.'],
      },
      {
        h: 'How accurate it is',
        p: ['The equation is an estimate based on averages. Your real rate depends on muscle mass, genes, hormones and health, and can differ by a few hundred calories. Use it as a starting point and adjust by how your weight changes over a few weeks. This page gives general information, not medical advice.'],
      },
    ],
    faqs: [
      { q: 'What is the BMR formula?', a: 'For men, 10 × weight + 6.25 × height − 5 × age + 5. For women, the same with − 161 instead of + 5. Weight is in kg and height in cm.' },
      { q: 'Is BMR the same as the calories I need a day?', a: 'No. BMR is the energy at rest. Daily needs are higher once activity is included.' },
      { q: 'Does muscle change BMR?', a: 'Yes. More muscle raises it a little, because muscle uses more energy than fat at rest.' },
      { q: 'Should I eat my BMR to lose weight?', a: 'Not as a rule. Very low intakes can be unsafe. Talk to a doctor or dietitian.' },
    ],
    calcs: ['bmr-calculator', 'tdee-calculator', 'bmi-calculator'],
    related: ['how-to-calculate-daily-calories-tdee', 'how-to-calculate-bmi'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-calculate-daily-calories-tdee',
    title: 'How to calculate your daily calories (TDEE)',
    description: 'Estimate the calories you need each day to keep, lose or gain weight by multiplying your BMR by an activity factor, with a worked example.',
    intro: 'TDEE = BMR × activity factor. A man with a BMR of 1,648.75 who exercises moderately (factor 1.55) needs about 2,556 calories a day to stay at the same weight. Eating about 500 fewer a day is a loss of roughly 0.5 kg a week.',
    steps: [
      'Work out your BMR, or enter your sex, age, weight and height in the daily calories calculator. Here the BMR is 1,648.75.',
      'Choose the activity factor: 1.2 sedentary, 1.375 light, 1.55 moderate, 1.725 active, 1.9 very active.',
      'Multiply: 1,648.75 × 1.55 = 2,555.6 calories to maintain your weight.',
      'For about 0.5 kg a week of loss, subtract 500: 2,056 calories.',
      'For about 0.5 kg a week of gain, add 500: 3,056 calories.',
    ],
    sections: [
      {
        h: 'How the activity level changes the answer',
        p: [
          'For the same man, the calories to maintain his weight are 1,979 if sedentary, 2,267 with light activity, 2,556 with moderate activity, 2,844 if active and 3,133 if very active. The difference between the lowest and highest level is over 1,100 calories a day.',
          'Be honest about your activity. Most people overestimate it, and a desk job with three workouts a week is usually light or moderate, not active.',
        ],
      },
      {
        h: 'Where the 500 calories comes from',
        p: ['About 7,700 calories is roughly one kilogram of body fat, so eating 500 fewer calories a day is 3,500 a week, or about 0.5 kg. In practice weight does not change in a perfectly straight line, because water, food in the gut and muscle also change. Use the number as a guide and check your weight over several weeks.'],
      },
      {
        h: 'A few cautions',
        p: ['Do not go far below your BMR without medical advice. Children, teenagers, pregnant women and people with medical conditions have different needs. The calculation is an estimate from averages, so adjust it by what happens to your weight. This page gives general information, not medical advice.'],
      },
    ],
    faqs: [
      { q: 'What is TDEE?', a: 'Total daily energy expenditure: the calories you burn in a day, including activity. It is your BMR times an activity factor.' },
      { q: 'How many calories should I cut to lose weight?', a: 'A common starting point is about 500 a day below your TDEE, for roughly 0.5 kg a week, but a doctor or dietitian can advise you for your case.' },
      { q: 'Which activity level should I pick?', a: 'Choose the lower one if unsure. It is better to adjust upward than to overestimate.' },
      { q: 'Does the estimate stay the same as I lose weight?', a: 'No. As your weight falls your BMR falls, so recalculate every few kilograms.' },
    ],
    calcs: ['tdee-calculator', 'bmr-calculator', 'water-intake-calculator'],
    related: ['how-to-calculate-bmr', 'how-much-water-should-you-drink'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-estimate-body-fat',
    title: 'How to estimate body fat with a tape measure',
    description: 'Estimate your body fat percentage from neck, waist and height measurements with the U.S. Navy method, and see what the result means.',
    intro: 'The tape-measure method uses your height, neck and waist (and hips for women) with logarithms. A man 175 cm tall with a 38 cm neck and an 85 cm waist comes out at about 16.9% body fat, or 11.9 kg of fat on a 70 kg body.',
    steps: [
      'Measure your height, neck (below the larynx) and waist (at the navel) in centimetres. Women also measure the hips at the widest point.',
      'Use a soft tape, keep it level and snug without squeezing, and breathe out normally.',
      'Enter the measurements and your weight in the body fat calculator.',
      'Read the body fat percentage, the fat mass and the lean mass.',
      'Measure again under the same conditions every few weeks to see the trend.',
    ],
    sections: [
      {
        h: 'The formulas',
        p: [
          'For men: body fat % = 495 ÷ (1.0324 − 0.19077 × log10(waist − neck) + 0.15456 × log10(height)) − 450. For women the waist, hips and neck are combined: 495 ÷ (1.29579 − 0.35004 × log10(waist + hip − neck) + 0.22100 × log10(height)) − 450. All lengths are in centimetres.',
          'For the man above the waist minus neck is 47 cm, which gives about 16.9%, so 11.9 kg of fat and 58.1 kg of lean mass. A woman at 162 cm and 62 kg, with a neck of 32 cm, a waist of 76 cm and hips of 98 cm, comes out at about 30% body fat, or 18.8 kg of fat and 43.2 kg of lean mass.',
        ],
      },
      {
        h: 'How accurate is it',
        p: ['A tape estimate can be several percentage points off, because it infers body fat from a few circumferences. It is best used to follow your own trend, since measuring the same way each time cancels much of the error. Scans in a clinic or lab are more accurate but not available for everyday use.'],
      },
      {
        h: 'What the number means',
        p: ['Healthy ranges differ by age and sex, and women naturally carry more essential fat than men. Rather than aim at a target figure from a table, look at whether the waist is shrinking and the weight, strength and energy are going the right way. This page gives general information, not medical advice.'],
      },
    ],
    faqs: [
      { q: 'How accurate is the tape measure method?', a: 'It can be several percentage points off, but it is useful for tracking change if you measure the same way each time.' },
      { q: 'Where do I measure my waist?', a: 'At the navel for the Navy method, with the tape level and without pulling it tight.' },
      { q: 'Why do women also measure hips?', a: 'The formula for women uses the hips as well, because fat is stored differently.' },
      { q: 'What is lean mass?', a: 'Your weight minus the fat: muscle, bone, organs and water.' },
    ],
    calcs: ['body-fat-calculator', 'bmi-calculator', 'ideal-weight-calculator'],
    related: ['how-to-calculate-bmi', 'how-to-find-your-ideal-weight'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-find-your-ideal-weight',
    title: 'How to find your ideal weight range from height',
    description: 'Compare the Devine and Robinson formulas with the healthy BMI range for your height, with worked examples for a man at 175 cm and a woman at 162 cm.',
    intro: 'The Devine formula gives men 50 kg plus 2.3 kg for each inch over 5 feet, and women 45.5 kg plus 2.3 kg. A man 175 cm tall (8.9 inches over 5 feet) comes out at 70.5 kg, and the healthy BMI range for that height is 56.7 to 76.3 kg.',
    steps: [
      'Convert your height to inches: 175 cm ÷ 2.54 = 68.9 inches.',
      'Subtract 60 inches (5 feet): 8.9 inches over.',
      'Devine for a man: 50 + 2.3 × 8.9 = 70.5 kg. Robinson: 52 + 1.9 × 8.9 = 68.9 kg.',
      'For a woman use 45.5 + 2.3 per inch (Devine) or 49 + 1.7 per inch (Robinson).',
      'Compare with the healthy BMI range: 18.5 × height² to 24.9 × height², with height in metres.',
    ],
    sections: [
      {
        h: 'A worked example for a woman',
        p: [
          'A woman 162 cm tall is 63.8 inches, which is 3.8 over 5 feet. Devine gives 54.2 kg and Robinson gives 55.4 kg. The healthy BMI range for her height is 48.6 to 65.3 kg.',
          'The formulas give one number each, while the BMI range gives a span. The span is the more useful guide, since healthy bodies come in a range.',
        ],
      },
      {
        h: 'Why there are several answers',
        p: ['The Devine and Robinson formulas were made for general guidance, mainly to set medicine doses, not to define a perfect weight. They ignore age, frame size and how much of your weight is muscle. Two people of the same height can be equally healthy at weights that differ by 10 kg or more.'],
      },
      {
        h: 'Use it sensibly',
        p: ['Treat the result as a rough reference, and look at how you feel, your fitness and your medical checks. If you are well outside the range, a doctor or dietitian can look at your whole health. This page gives general information, not medical advice.'],
      },
    ],
    faqs: [
      { q: 'Which formula is more accurate?', a: 'Neither is exact. They are guides that often differ by a kilogram or two, so use the range.' },
      { q: 'Does frame size matter?', a: 'Yes. People with a larger frame or more muscle may be healthy at the upper end or above.' },
      { q: 'Is the ideal weight the same as a healthy BMI?', a: 'No. The formulas give a single figure, while the healthy BMI range gives a span of weights.' },
      { q: 'Does age change it?', a: 'The formulas do not account for age, but healthy weight can change over a lifetime.' },
    ],
    calcs: ['ideal-weight-calculator', 'bmi-calculator', 'body-fat-calculator'],
    related: ['how-to-calculate-bmi', 'how-to-estimate-body-fat'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-much-water-should-you-drink',
    title: 'How much water should you drink a day?',
    description: 'Estimate your daily water target from your weight and exercise with a simple rule, and see the answer in litres and in glasses, with examples.',
    intro: 'A common rule of thumb is 35 ml of water per kg of body weight, plus 350 ml for every 30 minutes of exercise. For 70 kg and 30 minutes of exercise that is 2,450 + 350 = 2,800 ml, or 2.8 litres, about 11 glasses.',
    steps: [
      'Multiply your weight in kilograms by 35 to get millilitres: 70 × 35 = 2,450 ml.',
      'Add 350 ml for each 30 minutes of exercise you do in a day: 350 ml for 30 minutes.',
      'Add them: 2,800 ml, which is 2.8 litres.',
      'Divide by 250 ml to get glasses: about 11.',
      'Or enter your weight and exercise minutes in the water intake calculator.',
    ],
    sections: [
      {
        h: 'Examples',
        p: [
          'A person weighing 60 kg who does no exercise gets 2.1 litres, about 8 glasses. A person weighing 80 kg who exercises for an hour gets 80 × 35 + 700 = 3,500 ml, or 3.5 litres, about 14 glasses.',
          'The target counts all drinks, and many foods such as fruit, vegetables and soup contribute water too, so you do not need to drink the whole figure as plain water.',
        ],
      },
      {
        h: 'What changes your need',
        p: ['Hot weather, high altitude, illness with fever or diarrhoea, pregnancy and breastfeeding raise the need. Thirst and the colour of your urine are good everyday signs: pale yellow usually means enough. Drinking far more than you need is not helpful and in rare cases is harmful.'],
      },
      {
        h: 'Medical conditions',
        p: ['Some conditions, including certain heart, kidney and liver problems, require limiting fluids, and a doctor’s advice then overrides any formula. The result here is a general estimate for a healthy adult, not medical advice.'],
      },
    ],
    faqs: [
      { q: 'Is 8 glasses a day right for everyone?', a: 'No. Needs depend on weight, activity, weather and health, which is why this calculator uses your weight and exercise.' },
      { q: 'Does tea or coffee count?', a: 'Yes, in moderation. All drinks count toward the total.' },
      { q: 'Can I drink too much water?', a: 'Yes, though it is rare. Drinking far more than you need can upset the body’s salt balance.' },
      { q: 'How do I know I am drinking enough?', a: 'Pale yellow urine and not feeling thirsty are good signs.' },
    ],
    calcs: ['water-intake-calculator', 'tdee-calculator', 'bmi-calculator'],
    related: ['how-to-calculate-daily-calories-tdee', 'how-to-calculate-bmi'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-a-pregnancy-due-date-is-calculated',
    title: 'How a pregnancy due date is calculated',
    description: 'Learn how the due date comes from the first day of your last period using the Naegele rule, how cycle length changes it, and how trimesters are dated.',
    intro: 'The due date is the first day of your last period plus 280 days, which is 40 weeks (the Naegele rule). A last period that began on 10 January 2026, with a 28-day cycle, gives a due date of Saturday, 17 October 2026.',
    steps: [
      'Note the first day of your last menstrual period. Here: 10 January 2026.',
      'Add 280 days, which is 40 weeks: 17 October 2026.',
      'If your cycle is not 28 days, add or subtract the difference. A 32-day cycle adds 4 days.',
      'Enter the date and your usual cycle length in the due date calculator to see the due date.',
      'Your doctor will confirm the date, often with an early scan.',
    ],
    sections: [
      {
        h: 'How the cycle length changes the date',
        p: [
          'The rule assumes ovulation around day 14. With a 32-day cycle the same last period gives 21 October 2026, four days later. With a 26-day cycle it gives 15 October 2026, two days earlier.',
          'The calculator also shows the likely conception date, about two weeks after the period began (24 January 2026 in the first example), and the start of the second trimester (18 April 2026) and the third (25 July 2026).',
        ],
      },
      {
        h: 'It is an estimate',
        p: ['Only about 1 in 20 babies arrives on the due date, and a healthy full-term birth can be a few weeks either side. An early ultrasound measures the baby and can correct the date if the last period was unsure or the cycle irregular.'],
      },
      {
        h: 'Use it with your doctor',
        p: ['Use the date to plan visits, scans and leave, but let your doctor confirm it. Seek medical advice for any concern in pregnancy. This page gives general information, not medical advice.'],
      },
    ],
    faqs: [
      { q: 'What is the Naegele rule?', a: 'It adds 280 days (40 weeks) to the first day of the last menstrual period to estimate the due date.' },
      { q: 'What if my cycle is not 28 days?', a: 'Add or subtract the difference. Enter your usual cycle length in the calculator.' },
      { q: 'How accurate is the due date?', a: 'It is an estimate. Only about 1 in 20 babies arrives on the date.' },
      { q: 'When does each trimester start?', a: 'The second starts at about 14 weeks from the last period and the third at about 28 weeks.' },
    ],
    calcs: ['pregnancy-due-date-calculator', 'date-difference-calculator', 'add-days-calculator'],
    related: ['how-to-add-or-subtract-days-from-a-date', 'how-to-calculate-your-age'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
];

import { fail, n, num, s, sel, date, type CalcDef } from '../types';
import { dateOf, daysBetween, longDate } from './dates';

const SEX = [
  ['male', 'Male'],
  ['female', 'Female'],
] as const;
const NOT_MEDICAL = 'A general estimate, not medical advice. Talk to a doctor or dietitian about your own health.';
const tidy = (x: number) => Math.round(x * 100) / 100;

/** Mifflin-St Jeor, the equation most dietitians use today. */
export const bmr = (sex: string, kg: number, cm: number, age: number): number => 10 * kg + 6.25 * cm - 5 * age + (sex === 'male' ? 5 : -161);
const inchesOver60 = (cm: number) => Math.max(0, cm / 2.54 - 60);

const ACTIVITY = [
  ['1.2', 'Sedentary: little or no exercise'],
  ['1.375', 'Light: exercise 1 to 3 days a week'],
  ['1.55', 'Moderate: exercise 3 to 5 days a week'],
  ['1.725', 'Active: hard exercise 6 to 7 days a week'],
  ['1.9', 'Very active: hard exercise and a physical job'],
] as const;

export const HEALTH: CalcDef[] = [
  {
    slug: 'bmi-calculator',
    name: 'BMI calculator',
    group: 'health',
    emoji: '⚖️',
    summary: 'Body mass index from your weight and height, with the healthy range.',
    quick: 'Enter your weight in kg and height in cm. A person who weighs 70 kg and is 175 cm tall has a BMI of 22.9, in the normal range.',
    keywords: 'body mass index weight height overweight underweight obese healthy weight',
    title: 'BMI Calculator: body mass index and healthy weight range',
    description: 'Free BMI calculator. Enter your weight and height to see your body mass index, your category and the weight range that counts as healthy for your height.',
    fields: [num('kg', 'Weight', 70, { unit: 'kg', min: 0, step: 0.5 }), num('cm', 'Height', 175, { unit: 'cm', min: 0, step: 1 })],
    compute: (v) => {
      const kg = n(v, 'kg');
      const m = n(v, 'cm') / 100;
      if (kg <= 0 || m <= 0) return fail('Enter your weight and height.');
      const bmi = kg / (m * m);
      const cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal weight' : bmi < 30 ? 'Overweight' : 'Obese';
      return {
        metrics: [
          { label: 'Your BMI', value: tidy(bmi), kind: 'number', decimals: 1, big: true },
          { label: 'Category (WHO)', value: cat, kind: 'text' },
          { label: 'Healthy weight for your height', value: `${(18.5 * m * m).toFixed(1)} to ${(24.9 * m * m).toFixed(1)} kg`, kind: 'text' },
        ],
        note: 'BMI does not see muscle, bone or where fat sits. Some Asian health guidelines use lower cut-offs, with overweight starting near 23. ' + NOT_MEDICAL,
      };
    },
    formula: ['BMI = weight in kg ÷ (height in metres)²', 'WHO categories: under 18.5 underweight, 18.5 to 24.9 normal, 25 to 29.9 overweight, 30 and above obese'],
    example: '70 kg at 175 cm (1.75 m): 70 ÷ (1.75 × 1.75) = 70 ÷ 3.0625 = 22.9, which is normal weight. The healthy range for that height is 56.7 to 76.3 kg.',
    how: [
      'BMI is a quick screening number: weight divided by height squared.',
      'It is a rough guide only. A muscular athlete can score as overweight, and an older person can have a normal BMI with little muscle.',
      'Waist size, fitness and blood tests tell a doctor much more than BMI alone.',
    ],
    faqs: [
      { q: 'What is a healthy BMI?', a: 'The WHO range for normal weight is 18.5 to 24.9. Some Asian guidelines set the upper end lower.' },
      { q: 'Is BMI accurate for athletes?', a: 'Not always. Muscle weighs more than fat, so a very fit person can have a high BMI and a healthy body.' },
      { q: 'Does BMI work for children?', a: 'Children are judged against age and sex charts, not these adult cut-offs. Ask a paediatrician.' },
      { q: 'How can I lower my BMI?', a: 'Changes in eating and activity over time. A doctor or dietitian can give a safe plan for you.' },
    ],
    related: ['bmr-calculator', 'ideal-weight-calculator', 'body-fat-calculator'],
  },
  {
    slug: 'bmr-calculator',
    name: 'BMR calculator',
    group: 'health',
    emoji: '🔥',
    summary: 'Calories your body burns at rest each day.',
    quick: 'Enter your sex, age, weight and height. A 30-year-old man who weighs 70 kg and is 175 cm tall has a BMR of about 1,649 calories a day.',
    keywords: 'basal metabolic rate calories at rest mifflin st jeor metabolism',
    title: 'BMR Calculator: calories your body burns at rest',
    description: 'Free BMR calculator using the Mifflin-St Jeor equation. See the calories you burn at rest each day from your age, sex, weight and height.',
    fields: [sel('sex', 'Sex', 'male', SEX), num('age', 'Age', 30, { unit: 'years', min: 1, max: 120, step: 1 }), num('kg', 'Weight', 70, { unit: 'kg', min: 0, step: 0.5 }), num('cm', 'Height', 175, { unit: 'cm', min: 0, step: 1 })],
    compute: (v) => {
      const kg = n(v, 'kg');
      if (kg <= 0 || n(v, 'cm') <= 0 || n(v, 'age') <= 0) return fail('Enter your age, weight and height.');
      const r = bmr(s(v, 'sex'), kg, n(v, 'cm'), n(v, 'age'));
      return { metrics: [{ label: 'BMR (calories per day)', value: r, kind: 'number', decimals: 0, big: true }, { label: 'Per hour', value: r / 24, kind: 'number', decimals: 0 }], note: NOT_MEDICAL };
    },
    formula: ['Men: BMR = 10 × weight (kg) + 6.25 × height (cm) − 5 × age + 5', 'Women: BMR = 10 × weight (kg) + 6.25 × height (cm) − 5 × age − 161'],
    example: 'Man, 30 years, 70 kg, 175 cm: 700 + 1,093.75 − 150 + 5 = 1,648.75, about 1,649 calories a day.',
    how: [
      'Your basal metabolic rate is the energy your body needs just to stay alive: breathing, circulation, keeping warm.',
      'This calculator uses the Mifflin-St Jeor equation, which is widely used for healthy adults.',
      'Your real needs are higher because you move. The daily calories (TDEE) calculator adds activity.',
    ],
    faqs: [
      { q: 'What is BMR?', a: 'Basal metabolic rate: the calories you would burn in a day lying still.' },
      { q: 'Is BMR the same as the calories I should eat?', a: 'No. You also burn calories moving about. Use the TDEE calculator for a daily target.' },
      { q: 'Why do men and women get different results?', a: 'On average men carry more muscle, which burns more energy at rest. The equation reflects that.' },
      { q: 'How accurate is it?', a: 'It is an estimate that can be off by a few hundred calories for any one person.' },
    ],
    related: ['tdee-calculator', 'bmi-calculator', 'water-intake-calculator'],
  },
  {
    slug: 'tdee-calculator',
    name: 'Daily calories (TDEE) calculator',
    group: 'health',
    emoji: '🍽️',
    summary: 'Calories you burn in a day, and targets to lose or gain weight.',
    quick: 'Add your activity level to your details. A 30-year-old man, 70 kg and 175 cm, moderately active, burns about 2,556 calories a day.',
    keywords: 'total daily energy expenditure maintenance calories weight loss gain calorie target',
    title: 'TDEE Calculator: daily calories to maintain, lose or gain',
    description: 'Free TDEE calculator. Work out the calories you burn each day from your activity level, and see targets for losing or gaining weight.',
    fields: [
      sel('sex', 'Sex', 'male', SEX),
      num('age', 'Age', 30, { unit: 'years', min: 1, max: 120, step: 1 }),
      num('kg', 'Weight', 70, { unit: 'kg', min: 0, step: 0.5 }),
      num('cm', 'Height', 175, { unit: 'cm', min: 0, step: 1 }),
      sel('act', 'Activity level', '1.55', ACTIVITY),
    ],
    compute: (v) => {
      if (n(v, 'kg') <= 0 || n(v, 'cm') <= 0 || n(v, 'age') <= 0) return fail('Enter your age, weight and height.');
      const tdee = bmr(s(v, 'sex'), n(v, 'kg'), n(v, 'cm'), n(v, 'age')) * Number(s(v, 'act'));
      return {
        metrics: [
          { label: 'Maintain your weight', value: tdee, kind: 'number', decimals: 0, big: true },
          { label: 'Lose about 0.5 kg a week', value: tdee - 500, kind: 'number', decimals: 0 },
          { label: 'Gain about 0.5 kg a week', value: tdee + 500, kind: 'number', decimals: 0 },
        ],
        note: 'About 7,700 calories is roughly one kilogram of body fat, so 500 fewer calories a day is about 0.5 kg a week. ' + NOT_MEDICAL,
      };
    },
    formula: ['TDEE = BMR × activity factor', 'Factors: 1.2 sedentary, 1.375 light, 1.55 moderate, 1.725 active, 1.9 very active', 'Weight loss or gain targets are TDEE − 500 or + 500 calories'],
    example: 'BMR 1,648.75 × 1.55 (moderate) = 2,555.6, about 2,556 calories a day to stay at the same weight.',
    how: [
      'Total daily energy expenditure is your resting burn (BMR) multiplied by a factor for how active you are.',
      'Be honest about the activity level; most people overestimate. If unsure, choose the lower one.',
      'Do not go far below your BMR for long. Very low intakes can harm health.',
    ],
    faqs: [
      { q: 'What is TDEE?', a: 'Total Daily Energy Expenditure: all the calories you burn in a day, including exercise and daily movement.' },
      { q: 'How many calories should I eat to lose weight?', a: 'A moderate deficit of around 500 calories below your TDEE is a common starting point. A professional can tailor it.' },
      { q: 'Which activity level should I pick?', a: 'Count planned exercise, not just a busy day. An office job with 3 gym sessions a week is usually moderate or light.' },
      { q: 'Does it count the calories from food types?', a: 'No. It only estimates energy. Protein, fibre and nutrients matter too.' },
    ],
    related: ['bmr-calculator', 'bmi-calculator', 'water-intake-calculator'],
  },
  {
    slug: 'body-fat-calculator',
    name: 'Body fat calculator',
    group: 'health',
    emoji: '📏',
    summary: 'Estimate body fat percentage from tape measurements.',
    quick: 'Measure your neck and waist (and hips for women) and enter your height. A man 175 cm tall with a 38 cm neck and 85 cm waist has about 17% body fat.',
    keywords: 'us navy method fat percentage tape measure waist neck hip lean mass',
    title: 'Body Fat Calculator: US Navy method estimate',
    description: 'Free body fat calculator using the US Navy tape method. Enter height, neck, waist and hip to estimate your body fat percentage and lean mass.',
    fields: [
      sel('sex', 'Sex', 'male', SEX),
      num('kg', 'Weight', 70, { unit: 'kg', min: 0, step: 0.5 }),
      num('cm', 'Height', 175, { unit: 'cm', min: 0, step: 1 }),
      num('neck', 'Neck, below the larynx', 38, { unit: 'cm', min: 0, step: 0.5 }),
      num('waist', 'Waist, at the navel', 85, { unit: 'cm', min: 0, step: 0.5 }),
      num('hip', 'Hips, widest point (women only)', 95, { unit: 'cm', min: 0, step: 0.5 }),
    ],
    compute: (v) => {
      const [h, neck, waist, hip, kg] = [n(v, 'cm'), n(v, 'neck'), n(v, 'waist'), n(v, 'hip'), n(v, 'kg')];
      const male = s(v, 'sex') === 'male';
      const girth = male ? waist - neck : waist + hip - neck;
      if (h <= 0 || neck <= 0 || waist <= 0 || (!male && hip <= 0) || girth <= 0) return fail('Enter your height and measurements. The waist must be larger than the neck.');
      const bf = male ? 495 / (1.0324 - 0.19077 * Math.log10(girth) + 0.15456 * Math.log10(h)) - 450 : 495 / (1.29579 - 0.35004 * Math.log10(girth) + 0.221 * Math.log10(h)) - 450;
      if (!Number.isFinite(bf) || bf < 0 || bf > 70) return fail('Those measurements give an unlikely result. Check them and measure again.');
      return {
        metrics: [
          { label: 'Estimated body fat', value: bf, kind: 'percent', decimals: 1, big: true },
          ...(kg > 0 ? [{ label: 'Fat mass', value: (kg * bf) / 100, kind: 'number' as const, decimals: 1 }, { label: 'Lean mass', value: kg - (kg * bf) / 100, kind: 'number' as const, decimals: 1 }] : []),
        ],
        note: 'A tape estimate can be several percentage points off. ' + NOT_MEDICAL,
      };
    },
    formula: ['Men: 495 ÷ (1.0324 − 0.19077 × log10(waist − neck) + 0.15456 × log10(height)) − 450', 'Women: 495 ÷ (1.29579 − 0.35004 × log10(waist + hip − neck) + 0.22100 × log10(height)) − 450', 'All measurements in centimetres'],
    example: 'Man, height 175 cm, neck 38 cm, waist 85 cm: waist − neck = 47, and the formula gives about 16.9% body fat.',
    how: [
      'The US Navy method estimates body fat from a few tape measurements instead of a lab scan.',
      'Measure the waist at the navel, relaxed and breathing out, and the neck just below the larynx. Take each twice.',
      'It suits tracking your own change over time better than comparing with other people.',
    ],
    faqs: [
      { q: 'What is a healthy body fat percentage?', a: 'It varies with age and sex. Many sources put roughly 10 to 20% for adult men and 18 to 28% for adult women as healthy, but a doctor can advise you.' },
      { q: 'How accurate is the tape method?', a: 'It can be off by several percentage points. DEXA scans and other lab methods are more accurate.' },
      { q: 'Why are hips needed for women?', a: 'The equation for women uses hips because fat is distributed differently.' },
      { q: 'How often should I measure?', a: 'Every few weeks, at the same time of day and in the same way.' },
    ],
    related: ['bmi-calculator', 'ideal-weight-calculator', 'tdee-calculator'],
  },
  {
    slug: 'ideal-weight-calculator',
    name: 'Ideal weight calculator',
    group: 'health',
    emoji: '🎯',
    summary: 'Ideal body weight formulas and the healthy BMI range for your height.',
    quick: 'Enter your sex and height. For a man 175 cm tall the Devine formula gives about 70.5 kg, inside the healthy BMI range of 56.7 to 76.3 kg.',
    keywords: 'ideal body weight devine robinson healthy weight for height target weight',
    title: 'Ideal Weight Calculator: healthy weight for your height',
    description: 'Free ideal weight calculator. See the Devine and Robinson formula results and the healthy BMI weight range for your height.',
    fields: [sel('sex', 'Sex', 'male', SEX), num('cm', 'Height', 175, { unit: 'cm', min: 100, max: 250, step: 1 })],
    compute: (v) => {
      const cm = n(v, 'cm');
      if (cm <= 0) return fail('Enter your height.');
      const male = s(v, 'sex') === 'male';
      const inch = inchesOver60(cm);
      const m = cm / 100;
      return {
        metrics: [
          { label: 'Devine formula', value: (male ? 50 : 45.5) + 2.3 * inch, kind: 'number', decimals: 1, big: true },
          { label: 'Robinson formula', value: (male ? 52 : 49) + (male ? 1.9 : 1.7) * inch, kind: 'number', decimals: 1 },
          { label: 'Healthy BMI range (18.5 to 24.9)', value: `${(18.5 * m * m).toFixed(1)} to ${(24.9 * m * m).toFixed(1)} kg`, kind: 'text' },
        ],
        note: 'Formulas were made for general guidance. Your frame, muscle and health matter more. ' + NOT_MEDICAL,
      };
    },
    formula: ['Devine: men 50 kg + 2.3 kg for each inch over 5 feet, women 45.5 kg + 2.3 kg per inch', 'Robinson: men 52 kg + 1.9 kg per inch, women 49 kg + 1.7 kg per inch', 'Healthy range: 18.5 × h² to 24.9 × h², h in metres'],
    example: 'Man, 175 cm = 68.9 inches, which is 8.9 over 5 feet: Devine = 50 + 2.3 × 8.9 = 70.5 kg, Robinson = 52 + 1.9 × 8.9 = 68.9 kg.',
    how: [
      'Several old formulas estimate an ideal weight from height. They agree roughly but not exactly.',
      'The BMI-based range is the best guide: any weight inside it counts as normal for your height.',
      'Treat all of these as a starting point and talk to a doctor if you are unsure.',
    ],
    faqs: [
      { q: 'Which formula is most accurate?', a: 'None is exact. The healthy BMI range is a more useful target than a single number.' },
      { q: 'Does age change ideal weight?', a: 'These formulas ignore age. Older adults may be healthier at a slightly higher weight.' },
      { q: 'What if I am under 5 feet?', a: 'The formulas assume a height above 5 feet (152 cm), so use the BMI range instead.' },
      { q: 'Does muscle matter?', a: 'Yes. Muscle weighs more than fat, so a fit person can be heavier than the formula and still be healthy.' },
    ],
    related: ['bmi-calculator', 'body-fat-calculator', 'bmr-calculator'],
  },
  {
    slug: 'water-intake-calculator',
    name: 'Water intake calculator',
    group: 'health',
    emoji: '💧',
    summary: 'A daily water target from your weight and exercise.',
    quick: 'Enter your weight and exercise time. A 70 kg person who exercises 30 minutes a day is looking at about 2.8 litres of fluids.',
    keywords: 'how much water to drink daily litres hydration glasses',
    title: 'Water Intake Calculator: how much to drink a day',
    description: 'Free water intake calculator. Get a daily fluid target in litres and glasses from your body weight and how much you exercise.',
    fields: [num('kg', 'Weight', 70, { unit: 'kg', min: 0, step: 0.5 }), num('mins', 'Exercise per day', 30, { unit: 'number', min: 0, step: 5, hint: 'In minutes' })],
    compute: (v) => {
      if (n(v, 'kg') <= 0) return fail('Enter your weight.');
      const litres = (n(v, 'kg') * 35 + (n(v, 'mins') / 30) * 350) / 1000;
      return {
        metrics: [
          { label: 'Daily water target', value: litres, kind: 'number', decimals: 2, big: true },
          { label: 'In glasses of 250 ml', value: Math.round(litres * 4), kind: 'number', decimals: 0 },
        ],
        note: 'Litres, counting all drinks. Hot weather, illness and pregnancy raise needs; some medical conditions limit fluids. ' + NOT_MEDICAL,
      };
    },
    formula: ['Water (ml) = weight in kg × 35 + 350 ml for every 30 minutes of exercise', 'Divide by 1,000 for litres'],
    example: '70 kg × 35 = 2,450 ml, plus 350 ml for 30 minutes of exercise = 2,800 ml, which is 2.8 litres or about 11 glasses.',
    how: [
      'A common rule of thumb is about 35 ml of fluid for each kilogram of body weight, with extra for exercise and heat.',
      'Food, tea and other drinks count towards the total, not only plain water.',
      'Pale yellow urine and not feeling thirsty are the simplest signs you are drinking enough.',
    ],
    faqs: [
      { q: 'Do I really need eight glasses a day?', a: 'The eight-glasses rule is a rough habit, not a law. Your size, climate and activity set your real need.' },
      { q: 'Does tea or coffee count?', a: 'Yes, they count towards fluid intake.' },
      { q: 'Can you drink too much water?', a: 'Yes, though it is rare. Very large amounts in a short time can be dangerous. Drink steadily through the day.' },
      { q: 'Does hot weather change it?', a: 'Yes. Sweating raises your need, so add extra on hot days or when you are ill.' },
    ],
    related: ['bmr-calculator', 'tdee-calculator', 'bmi-calculator'],
  },
  {
    slug: 'pregnancy-due-date-calculator',
    name: 'Pregnancy due date calculator',
    group: 'health',
    emoji: '🤰',
    summary: 'Estimated due date from the first day of your last period.',
    quick: 'Enter the first day of your last period. If it was 10 January 2026 with a 28-day cycle, the due date is Saturday, 17 October 2026.',
    keywords: 'edd expected delivery date lmp last menstrual period weeks pregnant conception trimester',
    title: 'Pregnancy Due Date Calculator: estimated delivery date',
    description: 'Free due date calculator. Enter the first day of your last period to see the estimated due date, how many weeks pregnant you are and the trimester dates.',
    fields: [date('lmp', 'First day of your last period', '2026-01-10'), num('cycle', 'Usual cycle length', 28, { unit: 'days', min: 21, max: 45, step: 1 })],
    compute: (v) => {
      const lmp = dateOf(v, 'lmp');
      if (!lmp) return fail('Enter a valid date.');
      const cycle = Math.round(n(v, 'cycle')) || 28;
      const add = (days: number) => new Date(lmp.getTime() + days * 86_400_000);
      const due = add(280 + (cycle - 28));
      const today = dateOf({ d: 'today' }, 'd')!;
      const gest = daysBetween(lmp, today);
      return {
        metrics: [
          { label: 'Estimated due date', value: longDate(due), kind: 'text', big: true },
          { label: 'Likely conception', value: longDate(add(14 + (cycle - 28))), kind: 'text' },
          { label: 'Second trimester starts', value: longDate(add(14 * 7 + (cycle - 28))), kind: 'text' },
          { label: 'Third trimester starts', value: longDate(add(28 * 7 + (cycle - 28))), kind: 'text' },
          ...(gest >= 0 && gest <= 300 ? [{ label: 'Pregnant today', value: `${Math.floor(gest / 7)} weeks ${gest % 7} days`, kind: 'text' as const }] : []),
        ],
        note: 'Only about 1 in 20 babies arrives on the due date. ' + NOT_MEDICAL + ' Your doctor will confirm the date with a scan.',
      };
    },
    formula: ['Due date = first day of the last period + 280 days (40 weeks), the Naegele rule', 'For a cycle that is not 28 days, add or subtract the difference'],
    example: 'Last period began 10 January 2026, cycle 28 days: 10 January + 280 days = 17 October 2026, a Saturday.',
    how: [
      'Doctors count pregnancy from the first day of the last period, so you are already "2 weeks pregnant" at conception.',
      'The Naegele rule adds 280 days. If your cycle is longer or shorter than 28 days, the date shifts by the difference.',
      'An early ultrasound can give a more exact date, and your doctor may use that instead.',
    ],
    faqs: [
      { q: 'How is the due date calculated?', a: 'By adding 280 days (40 weeks) to the first day of your last period.' },
      { q: 'What if my cycle is irregular?', a: 'The estimate is less reliable. A dating scan is the best way to confirm.' },
      { q: 'How accurate is a due date?', a: 'It is an estimate. Most babies arrive between 37 and 42 weeks.' },
      { q: 'When does the second trimester start?', a: 'Around week 14 and the third around week 28, counted from the last period.' },
    ],
    related: ['date-difference-calculator', 'add-days-calculator', 'age-calculator'],
  },
];

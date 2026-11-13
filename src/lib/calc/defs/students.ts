import { fail, n, num, type CalcDef } from '../types';

const tidy = (x: number, d = 2) => Math.round(x * 10 ** d) / 10 ** d;
const COURSES = [1, 2, 3, 4, 5, 6];

export const STUDENTS: CalcDef[] = [
  {
    slug: 'cgpa-to-percentage-calculator',
    name: 'CGPA to percentage calculator',
    group: 'students',
    emoji: '🎓',
    summary: 'Turn a CGPA into a percentage, and a percentage back into a CGPA.',
    quick: 'Enter your CGPA. With the CBSE multiplier of 9.5, a CGPA of 8.2 is 77.9%.',
    keywords: 'cgpa percentage convert 10 point grade cbse university marks equivalent',
    title: 'CGPA to Percentage Calculator: 10-point scale converter',
    description: 'Free CGPA to percentage calculator. Convert a 10-point CGPA to a percentage with the CBSE 9.5 multiplier or your own, and convert back.',
    fields: [
      num('cgpa', 'Your CGPA (out of 10)', 8.2, { min: 0, max: 10, step: 0.01 }),
      num('mult', 'Multiplier', 9.5, { min: 1, max: 20, step: 0.05, hint: 'CBSE uses 9.5. Some universities use a different formula, so check yours.' }),
    ],
    compute: (v) => {
      const cgpa = n(v, 'cgpa');
      const mult = n(v, 'mult');
      if (cgpa <= 0 || cgpa > 10) return fail('Enter a CGPA between 0 and 10.');
      if (mult <= 0) return fail('Enter the multiplier your board or university uses.');
      return {
        metrics: [
          { label: 'Percentage', value: tidy(cgpa * mult), kind: 'percent', decimals: 2, big: true },
          { label: 'A percentage of this converts back to a CGPA of', value: tidy(tidy(cgpa * mult) / mult), kind: 'number', decimals: 2 },
        ],
        note: 'Some universities publish their own conversion. If your institution has one, use it for official purposes.',
      };
    },
    formula: ['Percentage = CGPA × multiplier', 'CGPA = percentage ÷ multiplier', 'CBSE multiplier = 9.5'],
    example: 'CGPA 8.2 × 9.5 = 77.9%. Going back, 77.9 ÷ 9.5 = 8.2.',
    how: [
      'CBSE announced that its CGPA to percentage rule is to multiply the CGPA by 9.5. Many other boards and colleges use their own formulas.',
      'Change the multiplier if your institution publishes a different one, such as 10 or 9.25.',
      'For an official percentage on a certificate or application, use the number your institution issues.',
    ],
    faqs: [
      { q: 'How do I convert CGPA to percentage?', a: 'Multiply the CGPA by the multiplier your board or university uses. For CBSE it is 9.5.' },
      { q: 'Is 9.5 the same for every university?', a: 'No. Universities set their own rules, so check yours.' },
      { q: 'How do I convert percentage to CGPA?', a: 'Divide the percentage by the same multiplier. The tool shows this too.' },
      { q: 'Does it work for a 4-point GPA?', a: 'No, this is for the 10-point scale. Use the GPA calculator for a 4-point scale.' },
    ],
    related: ['marks-percentage-calculator', 'gpa-calculator', 'percentage-calculator'],
  },
  {
    slug: 'gpa-calculator',
    name: 'GPA calculator',
    group: 'students',
    emoji: '📚',
    summary: 'Weighted GPA from your course credits and grade points.',
    quick: 'Enter the credits and grade points (for example A = 4.0) for each course. Five courses with 15 credits and 53.7 grade-point credits give a GPA of 3.58.',
    keywords: 'grade point average semester credits courses 4.0 scale weighted college',
    title: 'GPA Calculator: weighted grade point average',
    description: 'Free GPA calculator. Enter credits and grade points for each course to get your weighted GPA on a 4.0 scale or any scale you choose.',
    fields: COURSES.flatMap((i) => [
      num(`c${i}`, `Course ${i}: credits`, [3, 4, 3, 3, 2, 0][i - 1] ?? 0, { min: 0, max: 30, step: 0.5 }),
      num(`g${i}`, `Course ${i}: grade points`, [4, 3.7, 3, 3.3, 4, 0][i - 1] ?? 0, { min: 0, max: 10, step: 0.1 }),
    ]),
    compute: (v) => {
      let credits = 0;
      let points = 0;
      for (const i of COURSES) {
        const c = n(v, `c${i}`);
        if (c > 0) {
          credits += c;
          points += c * n(v, `g${i}`);
        }
      }
      if (credits <= 0) return fail('Enter the credits for at least one course.');
      return {
        metrics: [
          { label: 'GPA', value: tidy(points / credits), kind: 'number', decimals: 2, big: true },
          { label: 'Total credits', value: credits, kind: 'number', decimals: 1 },
          { label: 'Total grade points earned', value: tidy(points), kind: 'number', decimals: 1 },
        ],
        note: 'A common 4.0 scale is A = 4.0, A− = 3.7, B+ = 3.3, B = 3.0, B− = 2.7, C = 2.0, D = 1.0, F = 0. Use the scale your school publishes. Leave unused courses at 0 credits.',
      };
    },
    formula: ['GPA = sum of (credits × grade points) ÷ total credits'],
    example: 'Credits and grade points 3 × 4.0, 4 × 3.7, 3 × 3.0, 3 × 3.3, 2 × 4.0: points = 12 + 14.8 + 9 + 9.9 + 8 = 53.7 over 15 credits, so GPA = 3.58.',
    how: [
      'A course with more credits counts for more of your GPA. Multiply each grade point by its credits, add up, and divide by the total credits.',
      'Enter 0 credits for rows you do not use.',
      'Scales differ between schools, so use your own school’s grade point table.',
    ],
    faqs: [
      { q: 'What is a weighted GPA?', a: 'A GPA where each course counts in proportion to its credits.' },
      { q: 'What GPA do I need?', a: 'It depends on the school or job. Check the requirement you are aiming for.' },
      { q: 'Can I use a 10-point scale?', a: 'Yes. Enter the grade points on your own scale and the maths is the same.' },
      { q: 'How do I calculate a cumulative GPA?', a: 'Add the courses from all semesters as rows (or total up the credits and points) and divide.' },
    ],
    related: ['cgpa-to-percentage-calculator', 'marks-percentage-calculator', 'average-calculator'],
  },
  {
    slug: 'marks-percentage-calculator',
    name: 'Marks percentage calculator',
    group: 'students',
    emoji: '📝',
    summary: 'Percentage from marks obtained, and the marks needed for a target.',
    quick: 'Enter the marks you got and the total. 432 out of 500 is 86.4%, and you would need 450 for 90%.',
    keywords: 'marks percent score exam result obtained total target percentage needed',
    title: 'Marks Percentage Calculator: score and target marks',
    description: 'Free marks percentage calculator. Enter obtained marks and total marks to get the percentage, and see how many marks you need for a target percentage.',
    fields: [
      num('got', 'Marks obtained', 432, { min: 0, step: 1 }),
      num('total', 'Total marks', 500, { min: 0, step: 1 }),
      num('target', 'Target percentage', 90, { unit: 'percent', min: 0, max: 100, step: 1 }),
    ],
    compute: (v) => {
      const [got, total, target] = [n(v, 'got'), n(v, 'total'), n(v, 'target')];
      if (total <= 0) return fail('Enter the total marks.');
      if (got < 0 || got > total) return fail('The marks obtained must be between 0 and the total.');
      const needed = (target / 100) * total;
      return {
        metrics: [
          { label: 'Percentage', value: tidy((got / total) * 100), kind: 'percent', decimals: 2, big: true },
          { label: `Marks needed for ${target}%`, value: Math.ceil(needed - 1e-9), kind: 'number', decimals: 0 },
          { label: needed > got ? 'Marks short of the target' : 'Marks above the target', value: Math.abs(Math.ceil(needed - 1e-9) - got), kind: 'number', decimals: 0 },
        ],
      };
    },
    formula: ['Percentage = marks obtained ÷ total marks × 100', 'Marks needed for a target = target % ÷ 100 × total marks (rounded up)'],
    example: '432 out of 500: 432 ÷ 500 × 100 = 86.4%. For 90% you need 0.9 × 500 = 450 marks, which is 18 more.',
    how: [
      'Divide your marks by the total and multiply by 100.',
      'For several subjects, add the marks and the totals first, then divide once.',
      'The target box tells you how many marks you need in total to reach a percentage.',
    ],
    faqs: [
      { q: 'How do I calculate my percentage from marks?', a: 'Divide the marks you got by the total marks and multiply by 100.' },
      { q: 'How do I find the percentage over several subjects?', a: 'Add all marks obtained, add all totals, and divide the first sum by the second.' },
      { q: 'How many marks do I need for a target percentage?', a: 'Multiply the target percentage by the total marks and divide by 100.' },
      { q: 'Does it round the result?', a: 'The percentage is shown to two decimal places. Needed marks are rounded up to a whole number.' },
    ],
    related: ['cgpa-to-percentage-calculator', 'percentage-calculator', 'attendance-calculator'],
  },
  {
    slug: 'attendance-calculator',
    name: 'Attendance calculator',
    group: 'students',
    emoji: '🙋',
    summary: 'Classes you must attend, or can still miss, to meet an attendance rule.',
    quick: 'Enter classes attended, total classes held and the required percentage. At 60 of 90 classes (66.7%) with 75% required, you must attend the next 30 classes in a row.',
    keywords: 'attendance percentage required 75 classes bunk skip shortage eligible exam',
    title: 'Attendance Calculator: classes needed or safe to miss',
    description: 'Free attendance calculator. Enter classes attended, total classes and the required percentage to see how many classes you need to attend or can still miss.',
    fields: [
      num('att', 'Classes attended', 60, { min: 0, step: 1 }),
      num('held', 'Total classes held so far', 90, { min: 0, step: 1 }),
      num('req', 'Attendance required', 75, { unit: 'percent', min: 1, max: 99, step: 1 }),
    ],
    compute: (v) => {
      const [att, held, req] = [Math.round(n(v, 'att')), Math.round(n(v, 'held')), n(v, 'req')];
      if (held <= 0) return fail('Enter the total classes held.');
      if (att < 0 || att > held) return fail('Classes attended must be between 0 and the total held.');
      if (req <= 0 || req >= 100) return fail('The required attendance must be between 0 and 100%.');
      const r = req / 100;
      const pct = (att / held) * 100;
      if (pct + 1e-9 >= req) {
        const canMiss = Math.floor(att / r - held + 1e-9);
        return {
          metrics: [
            { label: 'Your attendance', value: tidy(pct), kind: 'percent', decimals: 2 },
            { label: 'Classes you can still miss', value: canMiss, kind: 'number', decimals: 0, big: true },
          ],
          note: 'This assumes you attend every other class from now on.',
        };
      }
      const need = Math.ceil((r * held - att) / (1 - r) - 1e-9);
      return {
        metrics: [
          { label: 'Your attendance', value: tidy(pct), kind: 'percent', decimals: 2 },
          { label: 'Classes to attend in a row to reach the requirement', value: need, kind: 'number', decimals: 0, big: true },
        ],
        note: `You are below ${req}%. Attend the next ${need} classes without a miss and you will meet it.`,
      };
    },
    formula: ['Attendance % = attended ÷ total × 100', 'Classes needed: x such that (attended + x) ÷ (total + x) ≥ required, so x = (required × total − attended) ÷ (1 − required)', 'Classes you can miss: m such that attended ÷ (total + m) ≥ required, so m = attended ÷ required − total'],
    example: '60 of 90 classes is 66.67%. For 75%: x = (0.75 × 90 − 60) ÷ 0.25 = 30. After 30 more classes you have 90 of 120, which is exactly 75%.',
    how: [
      'If you are below the rule, every class you attend raises both the top and the bottom of the fraction. The calculator finds how many in a row you need.',
      'If you are above it, it shows how many classes you can skip before you drop to the limit.',
      'Counts must be whole classes; some colleges count lab hours differently, so use their definition.',
    ],
    faqs: [
      { q: 'How is attendance percentage calculated?', a: 'Classes attended divided by classes held, times 100.' },
      { q: 'What attendance do colleges require?', a: 'Many Indian universities ask for 75%, but rules differ. Check your institution.' },
      { q: 'Do medical leaves count?', a: 'Some colleges allow condonation for medical leave. Ask your office; this tool uses plain counts.' },
      { q: 'Does it assume I never miss again?', a: 'For the classes you need, yes. For classes you can miss, it assumes you attend all the others.' },
    ],
    related: ['marks-percentage-calculator', 'percentage-calculator', 'cgpa-to-percentage-calculator'],
  },
];

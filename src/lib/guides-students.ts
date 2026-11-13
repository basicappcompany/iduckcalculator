import type { Guide } from './guides';

/** How-to guides for the student calculators. Every figure is checked against the calculators in tests/unit/guides.test.ts. */
export const GUIDES_STUDENTS: readonly Guide[] = [
  {
    slug: 'how-to-convert-cgpa-to-percentage',
    title: 'How to convert CGPA to percentage, with examples',
    description: 'Convert a CGPA out of 10 to a percentage with the CBSE multiplier of 9.5, convert back, and learn why some universities use a different rule.',
    intro: 'Under the CBSE rule, percentage = CGPA × 9.5. A CGPA of 8.2 is 8.2 × 9.5 = 77.9%. To go the other way, divide the percentage by 9.5: 77.9 ÷ 9.5 = 8.2.',
    steps: [
      'Write your CGPA on the 10-point scale. Here it is 8.2.',
      'Multiply it by 9.5: 8.2 × 9.5 = 77.9.',
      'Write the answer as a percentage: 77.9%.',
      'To convert a percentage to CGPA, divide it by 9.5.',
      'Or enter your CGPA in the calculator. You can change the multiplier if your institution uses another one.',
    ],
    sections: [
      {
        h: 'More examples',
        p: [
          'A CGPA of 9.0 is 85.5%. A CGPA of 7.4 is 70.3%. A CGPA of 6.5 is 61.75%. Every 0.1 of CGPA is 0.95 of a percentage point, so a small change in CGPA moves the percentage by almost one point.',
          'The multiplier is only a convention. It maps a CGPA of 10 to 95%, not to 100%, so a perfect CGPA does not mean a perfect percentage.',
        ],
      },
      {
        h: 'When the rule differs',
        p: ['Universities and boards may publish their own conversion, which can be a different multiplier or a table by grade. If your institution has one, use it for any official purpose such as an application or a form, and use this calculator only for an estimate. When a form asks for the percentage, check whether it accepts a conversion or needs the figure from your marksheet.'],
      },
      {
        h: 'CGPA and GPA',
        p: ['CGPA is the cumulative grade point average across all semesters on a 10-point scale. GPA on a 4.0 scale is a different system, and the two are not interchangeable by multiplying by 9.5. For a GPA from course credits and grade points, use the GPA calculator.'],
      },
    ],
    faqs: [
      { q: 'What is the CBSE formula for CGPA to percentage?', a: 'Percentage = CGPA × 9.5.' },
      { q: 'How do I convert percentage to CGPA?', a: 'Divide the percentage by 9.5. For 77.9% that gives 8.2.' },
      { q: 'Does every university use 9.5?', a: 'No. Many publish their own rule or table, so use the one your institution publishes.' },
      { q: 'Is CGPA the same as GPA?', a: 'No. CGPA is usually out of 10 and GPA out of 4. Use the matching calculator.' },
    ],
    calcs: ['cgpa-to-percentage-calculator', 'gpa-calculator', 'marks-percentage-calculator'],
    related: ['how-to-calculate-gpa', 'how-to-calculate-marks-percentage'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-calculate-gpa',
    title: 'How to calculate GPA from credits and grades',
    description: 'Calculate your GPA by weighting each course’s grade points by its credits, with a worked example and the common 4.0 grade scale.',
    intro: 'GPA = the sum of (credits × grade points) ÷ total credits. With courses of 3 credits at 4.0, 4 at 3.7, 3 at 3.0, 3 at 3.3 and 2 at 4.0, the points are 53.7 over 15 credits, so the GPA is 3.58.',
    steps: [
      'List each course with its credits and the grade points you earned.',
      'Multiply the credits by the grade points for each course: 3 × 4.0 = 12, 4 × 3.7 = 14.8, 3 × 3.0 = 9, 3 × 3.3 = 9.9, 2 × 4.0 = 8.',
      'Add the results: 12 + 14.8 + 9 + 9.9 + 8 = 53.7.',
      'Add the credits: 3 + 4 + 3 + 3 + 2 = 15.',
      'Divide: 53.7 ÷ 15 = 3.58. Or enter the courses in the GPA calculator.',
    ],
    sections: [
      {
        h: 'The common 4.0 scale',
        p: [
          'A is 4.0, A− is 3.7, B+ is 3.3, B is 3.0, B− is 2.7, C is 2.0, D is 1.0 and F is 0. Use the scale your school publishes, because some schools differ, for example by giving A+ 4.3 or leaving out the minus grades.',
          'Courses with more credits count for more. Take a 4-credit course at 4.0, a 4-credit course at 3.0 and a 3-credit course at 2.0: the GPA is (16 + 12 + 6) ÷ 11 = 3.09, not the plain average of the three grades, which is 3.0.',
        ],
      },
      {
        h: 'Planning ahead',
        p: ['To see what you need, add the credits and grade points you already have to the courses you expect. If you have 60 credits at a 3.2 GPA, you have 192 grade points; add the next semester’s courses to the totals and divide again. This is how you find the grades needed to reach a target GPA.'],
      },
      {
        h: 'What to leave out',
        p: ['Leave unused course slots at 0 credits. Courses taken pass or fail usually carry no grade points and are left out of the GPA, though policies differ. For an official GPA, always use the figure on your transcript.'],
      },
    ],
    faqs: [
      { q: 'What is the GPA formula?', a: 'The sum of credits times grade points for every course, divided by the total credits.' },
      { q: 'Why is the GPA not a plain average of my grades?', a: 'Because courses are weighted by credits. A course with more credits counts for more.' },
      { q: 'How do I raise my GPA?', a: 'Earn higher grades in courses with more credits. Retaking a course may replace the old grade, depending on your school’s rules.' },
      { q: 'Is a 4.0 GPA the same everywhere?', a: 'The scale is common but schools differ. Use the scale your school publishes.' },
    ],
    calcs: ['gpa-calculator', 'cgpa-to-percentage-calculator', 'marks-percentage-calculator'],
    related: ['how-to-convert-cgpa-to-percentage', 'how-to-calculate-marks-percentage'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-calculate-marks-percentage',
    title: 'How to calculate your marks percentage and target',
    description: 'Work out your percentage from marks obtained and total marks, and find the marks you need to reach a target such as 90%, with worked examples.',
    intro: 'Percentage = marks obtained ÷ total marks × 100. For 432 out of 500 that is 432 ÷ 500 × 100 = 86.4%. To reach 90% you need 0.9 × 500 = 450 marks, which is 18 more.',
    steps: [
      'Add up your marks obtained and the total marks. Here: 432 and 500.',
      'Divide the marks obtained by the total: 432 ÷ 500 = 0.864.',
      'Multiply by 100: 86.4%.',
      'For a target, multiply the target percentage by the total and divide by 100: 90 × 500 ÷ 100 = 450.',
      'Subtract what you have to see what is missing: 450 − 432 = 18. Or use the marks percentage calculator.',
    ],
    sections: [
      {
        h: 'More examples',
        p: [
          'Scoring 340 out of 400 is 85%. To reach 90% you need 360 marks, which is 20 more. Scoring 72 out of 80 is exactly 90%. For 95% you need 76 marks, which is 4 more.',
          'The marks needed are rounded up to the next whole mark, because you cannot score a fraction of a mark in most exams, and falling short by even a little misses the target.',
        ],
      },
      {
        h: 'Across several papers',
        p: ['To get an overall percentage, add all the marks obtained and all the total marks, and divide once. Do not average the percentages of papers with different totals, because that gives a larger paper the same weight as a smaller one. If the papers have the same total, the two methods agree.'],
      },
      {
        h: 'Using the target',
        p: ['Work backwards from the target to plan. Suppose the earlier papers gave 340 out of 400 and the last paper is out of 100. A target of 85% of 500 is 425 marks, so the last paper must give 85. Check your board’s rules on rounding and on which papers count, because the percentage printed on a marksheet is the one used officially.'],
      },
    ],
    faqs: [
      { q: 'How do I calculate percentage from marks?', a: 'Divide marks obtained by total marks and multiply by 100.' },
      { q: 'How many marks do I need for 90%?', a: 'Multiply the total marks by 0.9. For 500 that is 450.' },
      { q: 'Should I average the percentages of different papers?', a: 'No. Add all marks obtained and all total marks, then divide once.' },
      { q: 'Does it round the marks needed?', a: 'Yes, it rounds up to the next whole mark.' },
    ],
    calcs: ['marks-percentage-calculator', 'percentage-calculator', 'cgpa-to-percentage-calculator'],
    related: ['how-to-calculate-percentage', 'how-to-find-mean-median-and-mode'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-much-attendance-do-i-need',
    title: 'How to calculate attendance and the classes you can miss',
    description: 'Calculate your attendance percentage, how many classes in a row you must attend to reach the required level, and how many you can still miss.',
    intro: 'Attendance % = classes attended ÷ classes held × 100. Attending 60 of 90 classes is 66.67%. To reach 75% you must attend the next 30 in a row, because 90 of 120 is exactly 75%.',
    steps: [
      'Count the classes you attended and the total classes held so far. Here: 60 and 90.',
      'Divide and multiply by 100: 60 ÷ 90 × 100 = 66.67%.',
      'To reach a required level R (as a decimal), find x so that (attended + x) ÷ (held + x) ≥ R: x = (R × held − attended) ÷ (1 − R).',
      'For 75%: (0.75 × 90 − 60) ÷ 0.25 = 30 classes in a row.',
      'Or enter the numbers in the attendance calculator.',
    ],
    sections: [
      {
        h: 'When you are above the requirement',
        p: [
          'If you have attended 80 of 90 classes, your attendance is 88.89% and you can still miss 16 classes and stay at or above 75%. The calculation is m = attended ÷ R − held, which is 80 ÷ 0.75 − 90 = 16.67, rounded down to 16.',
          'If you have attended 45 of 60 classes you are exactly at 75%, so you can miss none of the next ones without falling below.',
        ],
      },
      {
        h: 'A higher requirement is much harder to recover',
        p: ['If you attended 30 of 60 classes, you are at 50%. To reach 80% you would need to attend the next 90 in a row, since (0.8 × 60 − 30) ÷ 0.2 = 90. The lower your attendance and the higher the requirement, the more classes it takes, so recover early rather than late.'],
      },
      {
        h: 'Check the rules',
        p: ['The required percentage differs between institutions and sometimes between subjects, and a medical certificate or approved leave may count. The calculator assumes that every future class you attend counts and that the total held keeps growing, so confirm the actual rule and the number of classes still to be held with your institution.'],
      },
    ],
    faqs: [
      { q: 'How do I calculate attendance percentage?', a: 'Divide the classes attended by the classes held and multiply by 100.' },
      { q: 'How many classes can I miss and still keep 75%?', a: 'Use attended ÷ 0.75 − held, rounded down. The calculator does it for you.' },
      { q: 'What if I am below the requirement?', a: 'The calculator tells you how many classes in a row you must attend to reach it.' },
      { q: 'Do medical leaves count?', a: 'It depends on your institution’s rules. Check with them and adjust the numbers if leave counts as attended.' },
    ],
    calcs: ['attendance-calculator', 'percentage-calculator', 'marks-percentage-calculator'],
    related: ['how-to-calculate-percentage', 'how-to-calculate-marks-percentage'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
];

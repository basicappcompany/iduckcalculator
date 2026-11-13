import type { Guide } from './guides';

/** How-to guides for the date and time calculators. Every figure is checked against the calculators in tests/unit/guides.test.ts. */
export const GUIDES_DATES: readonly Guide[] = [
  {
    slug: 'how-to-calculate-your-age',
    title: 'How to calculate your exact age in years and days',
    description: 'Work out your age in years, months and days from your date of birth, and find your next birthday, with a worked example and the leap-day rule.',
    intro: 'Subtract your date of birth from the date you want, year by year, month by month and day by day. Born on 15 June 1995 and measured on 1 January 2026, you are 30 years, 6 months and 17 days old.',
    steps: [
      'Write down your date of birth and the date you are measuring to, which is usually today. Here: 15 June 1995 and 1 January 2026.',
      'Count the whole years: from 15 June 1995 to 15 June 2025 is 30 years.',
      'Count the whole months after that: 15 June 2025 to 15 December 2025 is 6 months.',
      'Count the days left: 15 December 2025 to 1 January 2026 is 17 days.',
      'Or enter the dates in the age calculator, which also gives your total days and weeks and your next birthday.',
    ],
    sections: [
      {
        h: 'When the day of the month is bigger than the month is long',
        p: [
          'If you were born on the 31st, the month count has to deal with shorter months. Born on 31 January 1990 and measured on 1 March 2026, you are 36 years, 1 month and 1 day old: 31 January plus one month lands on the last day of February, the 28th, and one more day takes you to 1 March.',
          'The usual method is to count whole months first, using the last day of a shorter month when the date does not exist, and then count the days that remain.',
        ],
      },
      {
        h: 'Leap-day birthdays',
        p: ['A birthday on 29 February happens only in leap years. The calculator treats a 29 February birthday as falling on 1 March in other years. Someone born on 29 February 2000 is 0 years, 11 months and 30 days old on 28 February 2001, and turns 26 on 1 March 2026. Some places use 28 February instead, so use the rule that your official documents follow.'],
      },
      {
        h: 'What else the date of birth tells you',
        p: ['The age calculator also shows the weekday you were born on, the total days and weeks you have lived and the days until your next birthday. Change the second date to find your age on a future or past date, which is useful for age limits on forms, exams and policies.'],
      },
    ],
    faqs: [
      { q: 'How do I calculate age from date of birth?', a: 'Subtract the birth date from the later date in years, months and days, borrowing from the previous unit when a part comes out negative.' },
      { q: 'How do I find my age on a future date?', a: 'Change the second date in the age calculator to the date you want.' },
      { q: 'How is a 29 February birthday handled?', a: 'In non-leap years the calculator counts the birthday on 1 March. Check which rule your document uses.' },
      { q: 'How many days old am I?', a: 'The age calculator shows the total days and weeks lived, as well as years, months and days.' },
    ],
    calcs: ['age-calculator', 'date-difference-calculator', 'countdown-timer'],
    related: ['how-to-find-the-days-between-two-dates', 'how-to-count-down-to-a-date'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-find-the-days-between-two-dates',
    title: 'How to find the number of days between two dates',
    description: 'Count the days, weeks and months between two dates, learn whether the start and end day are included, and see examples for 2026 and a leap year.',
    intro: 'Subtract the earlier date from the later one. From 1 January 2026 to 25 December 2026 is 358 days, which is 11 months and 24 days, or 51 weeks and 1 day. The start day is not counted and the end day is.',
    steps: [
      'Write the start date and the end date. Here: 1 January 2026 and 25 December 2026.',
      'Enter them in the date difference calculator.',
      'Read the number of days: 358.',
      'Read the same gap in weeks and days (51 weeks 1 day) and in months and days (11 months 24 days).',
      'If you need both the first and the last day counted, add 1 to the number of days.',
    ],
    sections: [
      {
        h: 'Whether to count the first day',
        p: [
          'The calculator counts the days after the start date up to and including the end date. 1 March to 1 June 2026 is 92 days. If you are counting days of a stay or a leave, where both the first and last days count, add 1: that is 93.',
          'For deadlines, check whether the rule says days from a date or days including it, because the answer differs by one.',
        ],
      },
      {
        h: 'Leap years',
        p: ['A leap year has 366 days, because February has 29. The gap from 1 January 2024 to 1 January 2025 is 366 days, which is 1 year, 0 months and 0 days. The calculator uses the real calendar, so you never need to add leap days yourself.'],
      },
      {
        h: 'Weeks, months and hours',
        p: ['The same gap can be shown in different units. 358 days is 51 weeks and 1 day, or 8,592 hours. Months are counted as complete calendar months, so the number of days in a month does not matter: 1 March to 1 June is exactly 3 months, even though it is 92 days. To count only the weekdays, use the working days calculator instead.'],
      },
    ],
    faqs: [
      { q: 'Is the start date included?', a: 'No. The count starts the day after it. The end date is included. Add 1 for both.' },
      { q: 'How many days are there between two dates in different years?', a: 'Enter both dates; the calculator handles the year boundary and leap years for you.' },
      { q: 'How do I count only working days?', a: 'Use the working days calculator, which skips Saturdays and Sundays and subtracts holidays you enter.' },
      { q: 'How do I convert days to weeks?', a: 'Divide by 7. The whole number is the weeks and the remainder is the days.' },
    ],
    calcs: ['date-difference-calculator', 'working-days-calculator', 'add-days-calculator'],
    related: ['how-to-count-working-days', 'how-to-add-or-subtract-days-from-a-date'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-add-or-subtract-days-from-a-date',
    title: 'How to add or subtract days, weeks and months to a date',
    description: 'Find the date that is a number of days, weeks, months or years before or after a start date, and learn how month ends and leap days are handled.',
    intro: 'Add the days to the start date and carry over month ends. 1 January 2026 plus 100 days is Saturday 11 April 2026, because January has 31 days, February 28 and March 31, leaving 11 days into April.',
    steps: [
      'Choose the start date. Here it is 1 January 2026.',
      'Choose whether to add or subtract, the number and the unit: days, weeks, months or years.',
      'Enter 100 days. The result is Saturday, 11 April 2026.',
      'Check the weekday shown, which helps if the date falls on a weekend or a holiday.',
      'To go backwards, choose subtract: 15 March 2026 minus 90 days is Monday 15 December 2025.',
    ],
    sections: [
      {
        h: 'Weeks and months',
        p: [
          'Weeks are 7 days each, so 6 weeks after 1 January 2026 is 42 days later, Thursday 12 February 2026. Months and years keep the day of the month. 15 January plus 3 months is 15 April.',
          'When the target month is shorter, the last day of that month is used. 31 January 2026 plus 1 month is 28 February 2026, and 29 February 2024 plus 1 year is 28 February 2025.',
        ],
      },
      {
        h: 'Where this helps',
        p: ['Use it for a notice period, a warranty or return window, a due date, a course end date or a treatment plan. Add the days of a 90-day period to the start date to see when it ends, or subtract days from a deadline to find when work must begin.'],
      },
      {
        h: 'Check what the rule means',
        p: ['Contracts and laws sometimes count the start day as day one and sometimes as day zero, and some exclude weekends or holidays. The calculator counts days from the start date, so the start day itself is day zero. If the rule counts working days only, use the working days calculator and check the dates against the calendar.'],
      },
    ],
    faqs: [
      { q: 'How do I find the date 90 days from today?', a: 'Enter today as the start date, choose add, 90 and days.' },
      { q: 'What is one month after 31 January?', a: 'The last day of February, because February has no 31st: 28 February in 2026.' },
      { q: 'Is the start day counted?', a: 'No. The start date is day zero, so 1 January plus 1 day is 2 January.' },
      { q: 'How do I count back from a deadline?', a: 'Choose subtract and enter the number of days or weeks before the deadline.' },
    ],
    calcs: ['add-days-calculator', 'date-difference-calculator', 'working-days-calculator'],
    related: ['how-to-find-the-days-between-two-dates', 'how-to-count-working-days'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-count-working-days',
    title: 'How to count working days between two dates',
    description: 'Count the Monday to Friday days between two dates, subtract public holidays and see worked examples for January and February 2026.',
    intro: 'Working days are the Monday to Friday days between two dates, both included, minus any holidays. January 2026 has 31 calendar days and 9 Saturdays and Sundays, which leaves 22 working days; two weekday holidays make it 20.',
    steps: [
      'Choose the first and the last day. Both are counted. Here: 1 to 31 January 2026.',
      'Count the calendar days: 31.',
      'Remove the Saturdays and Sundays: 9 of them, leaving 22 working days.',
      'Enter the number of public holidays that fall on weekdays and subtract them: two holidays leave 20.',
      'Or enter the dates and the holidays in the working days calculator.',
    ],
    sections: [
      {
        h: 'Another example',
        p: [
          'February 2026 has 28 calendar days and 8 weekend days, so it has 20 working days. A month of four full weeks always has 20 working days before holidays, and months of 30 and 31 days have 20 to 23 depending on where the weekends fall.',
          'Because both the first and the last day are included, a single Monday counts as 1 working day.',
        ],
      },
      {
        h: 'Holidays and half-days',
        p: ['The calculator treats Saturday and Sunday as days off and takes the number of holidays you give it. Count only the holidays that fall on a weekday, because a holiday on a Sunday does not reduce the working days. Where your workplace works on some Saturdays or has a different weekly off, adjust the result yourself.'],
      },
      {
        h: 'Use it for planning',
        p: ['Working days are what matter for delivery times, loan or visa processing, notice periods counted in business days, payroll and project plans. Divide your task’s workdays by the number of people to estimate the time, and add buffer days for holidays you may not have entered. For calendar days, use the date difference calculator instead.'],
      },
    ],
    faqs: [
      { q: 'Are the start and end dates counted?', a: 'Yes. Both are included if they are weekdays.' },
      { q: 'How many working days are there in a month?', a: 'Between 20 and 23, before holidays. It depends on the length of the month and where the weekends fall.' },
      { q: 'How do I handle public holidays?', a: 'Enter the number that fall on a weekday and the calculator subtracts them.' },
      { q: 'What if my week is different?', a: 'The calculator assumes Saturday and Sunday off. For a different pattern, use the calendar days and adjust by hand.' },
    ],
    calcs: ['working-days-calculator', 'date-difference-calculator', 'add-days-calculator'],
    related: ['how-to-find-the-days-between-two-dates', 'how-to-calculate-time-duration'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-calculate-time-duration',
    title: 'How to calculate time duration and hours worked',
    description: 'Work out the hours and minutes between two clock times, handle shifts past midnight, subtract a break and convert to decimal hours for a timesheet.',
    intro: 'Convert both times to minutes and subtract. From 09:30 to 17:45 is (17 × 60 + 45) − (9 × 60 + 30) = 1,065 − 570 = 495 minutes, which is 8 hours 15 minutes, or 8.25 hours.',
    steps: [
      'Write the start and end times on the 24-hour clock. Here: 09:30 and 17:45.',
      'Turn each into minutes after midnight: 570 and 1,065.',
      'Subtract the start from the end: 495 minutes.',
      'If the end is earlier than the start, the shift passed midnight, so add 24 × 60 minutes first.',
      'Subtract any unpaid break, then convert: 495 ÷ 60 = 8.25 hours. Or use the time duration calculator.',
    ],
    sections: [
      {
        h: 'Overnight shifts and breaks',
        p: [
          'A shift from 22:00 to 06:00 has an end time earlier than the start, so the calculator adds a day: the duration is 8 hours. With a 30-minute unpaid break, the 09:30 to 17:45 day is 7 hours 45 minutes, or 7.75 hours, which is 465 minutes.',
          'A day from 08:45 to 18:15 with a 60-minute break is 8 hours 30 minutes, or 8.5 hours.',
        ],
      },
      {
        h: 'Decimal hours for pay',
        p: ['Timesheets and payroll usually want decimal hours, not hours and minutes. Divide the minutes by 60: 15 minutes is 0.25, 30 minutes is 0.5 and 45 minutes is 0.75 of an hour. So 8 hours 15 minutes is 8.25 hours, and at ₹400 an hour that is ₹3,300.'],
      },
      {
        h: 'Limits',
        p: ['The calculator covers a span of up to 24 hours on a single clock. For a longer gap across several days, use the date difference calculator. It does not adjust for daylight saving changes or for time zones, so for work that crosses them, compare the clock times in the same time zone first.'],
      },
    ],
    faqs: [
      { q: 'How do I calculate hours between two times?', a: 'Convert both to minutes, subtract, and divide by 60 for hours.' },
      { q: 'How do I handle a shift that crosses midnight?', a: 'If the end is earlier than the start, add 24 hours to the end before subtracting. The calculator does it for you.' },
      { q: 'How do I convert minutes to decimal hours?', a: 'Divide by 60. 45 minutes is 0.75 hours.' },
      { q: 'Does the calculator handle breaks?', a: 'Yes. Enter the unpaid break in minutes and it is subtracted.' },
    ],
    calcs: ['time-duration-calculator', 'working-days-calculator', 'date-difference-calculator'],
    related: ['how-to-count-working-days', 'how-to-find-the-days-between-two-dates'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
  {
    slug: 'how-to-count-down-to-a-date',
    title: 'How to count down the days to an exam, trip or event',
    description: 'Find how many days, weeks, hours and minutes are left until a date, and learn how the countdown uses your device clock and counts to the start of the day.',
    intro: 'Pick the date and the countdown shows the time left until the start of that day on your device’s clock. At noon on 1 December 2026, a countdown to 1 January 2027 shows 30 days 12 hours, which is 4 weeks and 2 days.',
    steps: [
      'Open the countdown calculator and choose the target date, such as an exam, a trip or a birthday.',
      'Read the time left in days, hours and minutes.',
      'Read the same time in weeks and days, and the total hours.',
      'Reload the page or change the date to refresh the figure.',
      'If the date has passed, it tells you how many days ago it was.',
    ],
    sections: [
      {
        h: 'How the countdown is measured',
        p: [
          'It counts to midnight at the start of the chosen day, using your device’s clock and time zone. At noon on 1 December 2026 the start of 1 January 2027 is 31 days minus half a day away, which is 30 days 12 hours, or 732 hours in total.',
          'So on the morning of the target day the countdown is already over, and the date itself is not counted as a full day left. If you want to include the day itself, add 1.',
        ],
      },
      {
        h: 'Useful ways to use it',
        p: ['Count down to an exam to plan your revision: divide the topics by the weeks left. Count down to a trip, a wedding or a deadline. Pair it with the working days calculator to see how many working days you have left before a date, since weekends are not usable for most work.'],
      },
      {
        h: 'Things to know',
        p: ['The figure does not update by itself while the page is open; reload it or change the date. Nothing is saved or sent anywhere. If your device clock or time zone is wrong, the countdown will be off by the same amount, so check the clock if the answer looks odd.'],
      },
    ],
    faqs: [
      { q: 'Does it update live?', a: 'It recalculates when you change the date or reload the page.' },
      { q: 'Which time zone does it use?', a: 'The one set on your device.' },
      { q: 'Does the target day count?', a: 'It counts down to the start of that day, so the target day is not counted as a full day left.' },
      { q: 'Can I count working days instead?', a: 'Yes. Use the working days calculator between today and the date.' },
    ],
    calcs: ['countdown-timer', 'date-difference-calculator', 'working-days-calculator'],
    related: ['how-to-find-the-days-between-two-dates', 'how-to-count-working-days'],
    published: '2026-11-13',
    updated: '2026-11-13',
  },
];

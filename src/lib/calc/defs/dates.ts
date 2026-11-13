import { fail, n, num, s, sel, date, type CalcDef, type Values } from '../types';

const DAY = 86_400_000;
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Today in the visitor's own time zone as YYYY-MM-DD. */
export function todayISO(now = new Date()): string {
  const p = (x: number) => String(x).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

/** Parse YYYY-MM-DD as a UTC midnight so daylight saving never shifts a day. Returns null for anything else. */
export function parseDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.getUTCMonth() === Number(m[2]) - 1 ? d : null;
}

export const dateOf = (v: Values, id: string): Date | null => parseDate(s(v, id) === 'today' ? todayISO() : s(v, id));
export const daysBetween = (a: Date, b: Date): number => Math.round((b.getTime() - a.getTime()) / DAY);
const daysInMonth = (y: number, m0: number) => new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate();

/** `from` moved forward by `m` months; if the target month is shorter, the last day of it (31 Jan + 1 month = 28 Feb). */
function plusMonths(from: Date, m: number): Date {
  const total = from.getUTCFullYear() * 12 + from.getUTCMonth() + m;
  const y = Math.floor(total / 12);
  const mo = total - y * 12;
  return new Date(Date.UTC(y, mo, Math.min(from.getUTCDate(), daysInMonth(y, mo))));
}

/** Whole years, months and days from `from` to `to` (to is on or after from). */
export function ymd(from: Date, to: Date): { years: number; months: number; days: number } {
  let years = to.getUTCFullYear() - from.getUTCFullYear();
  let months = to.getUTCMonth() - from.getUTCMonth();
  let days = to.getUTCDate() - from.getUTCDate();
  if (days < 0) {
    months -= 1;
    const prev = to.getUTCMonth() === 0 ? [to.getUTCFullYear() - 1, 11] : [to.getUTCFullYear(), to.getUTCMonth() - 1];
    days += daysInMonth(prev[0]!, prev[1]!);
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  // Borrowing the previous month is not enough when the start day is later than that month is long (31 Jan to 1 Mar):
  // count the whole months with the start day clamped to the month end (31 Jan + 1 month = 28 Feb), then the days left.
  if (days < 0) days = daysBetween(plusMonths(from, years * 12 + months), to);
  return { years, months, days };
}

export const isoOf = (d: Date): string => d.toISOString().slice(0, 10);
export const longDate = (d: Date): string => `${WEEKDAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
const plural = (x: number, w: string) => `${x} ${w}${x === 1 ? '' : 's'}`;

/** Count Monday to Friday days from `a` to `b`, both included. */
export function weekdaysBetween(a: Date, b: Date): number {
  const total = daysBetween(a, b) + 1;
  const full = Math.floor(total / 7);
  let count = full * 5;
  for (let i = 0; i < total % 7; i++) {
    const wd = new Date(a.getTime() + (full * 7 + i) * DAY).getUTCDay();
    if (wd !== 0 && wd !== 6) count += 1;
  }
  return count;
}

export const DATES: CalcDef[] = [
  {
    slug: 'age-calculator',
    name: 'Age calculator',
    group: 'dates',
    emoji: '🎂',
    summary: 'Exact age in years, months and days, and days to the next birthday.',
    quick: 'Enter a date of birth. Someone born on 15 June 1995 is 30 years, 6 months and 17 days old on 1 January 2026.',
    keywords: 'how old am i date of birth birthday years months days chronological age',
    title: 'Age Calculator: exact age in years, months and days',
    description: 'Free age calculator. Enter a date of birth to see your exact age in years, months and days, total days lived and days until your next birthday.',
    fields: [date('dob', 'Date of birth', '1995-06-15'), date('asof', 'Age on this date', 'today')],
    compute: (v) => {
      const dob = dateOf(v, 'dob');
      const asof = dateOf(v, 'asof');
      if (!dob || !asof) return fail('Enter a valid date of birth.');
      if (dob > asof) return fail('The date of birth is after the date you are measuring to.');
      const a = ymd(dob, asof);
      let next = new Date(Date.UTC(asof.getUTCFullYear(), dob.getUTCMonth(), dob.getUTCDate()));
      if (next < asof) next = new Date(Date.UTC(asof.getUTCFullYear() + 1, dob.getUTCMonth(), dob.getUTCDate()));
      const total = daysBetween(dob, asof);
      return {
        metrics: [
          { label: 'Your age', value: `${plural(a.years, 'year')}, ${plural(a.months, 'month')}, ${plural(a.days, 'day')}`, kind: 'text', big: true },
          { label: 'Total days lived', value: total, kind: 'number', decimals: 0 },
          { label: 'Total weeks', value: Math.floor(total / 7), kind: 'number', decimals: 0 },
          { label: 'Next birthday in', value: `${plural(daysBetween(asof, next), 'day')} (${longDate(next)})`, kind: 'text' },
          { label: 'Born on a', value: WEEKDAYS[dob.getUTCDay()]!, kind: 'text' },
        ],
      };
    },
    formula: ['Subtract the date of birth from the later date, year by year, month by month and day by day', 'If the day count goes negative, borrow the length of the previous month; if the month count does, borrow a year'],
    example: 'Born 15 June 1995, measured on 1 January 2026: 30 years to 15 June 2025, 6 months more to 15 December 2025 and 17 days to 1 January 2026, so 30 years, 6 months and 17 days.',
    how: [
      'The calculator counts complete years first, then complete months, then the days left over.',
      'Change the second date to find your age on any day: a past exam date, a form deadline or a future date.',
      'People born on 29 February have their birthday on 1 March in non-leap years for the "next birthday" count.',
    ],
    faqs: [
      { q: 'How do I calculate my exact age?', a: 'Subtract your birth date from today’s date in years, months and days. Enter your date of birth and the calculator does it for you.' },
      { q: 'Can I find my age on a past or future date?', a: 'Yes. Change "Age on this date" to the day you need, such as a form cut-off date.' },
      { q: 'How many days old am I?', a: 'The total days lived is shown under your age.' },
      { q: 'What about leap years?', a: 'They are handled: February 29 is counted in the day totals and the months are worked out on real month lengths.' },
    ],
    related: ['date-difference-calculator', 'add-days-calculator', 'countdown-timer'],
  },
  {
    slug: 'date-difference-calculator',
    name: 'Date difference calculator',
    group: 'dates',
    emoji: '📆',
    summary: 'Days, weeks, months and years between two dates.',
    quick: 'Enter two dates. From 1 January 2026 to 25 December 2026 is 358 days, which is 11 months and 24 days.',
    keywords: 'days between dates how many days difference duration months weeks',
    title: 'Date Difference Calculator: days between two dates',
    description: 'Free date difference calculator. See the number of days, weeks, months and years between any two dates.',
    fields: [date('from', 'From', '2026-01-01'), date('to', 'To', '2026-12-25')],
    compute: (v) => {
      let a = dateOf(v, 'from');
      let b = dateOf(v, 'to');
      if (!a || !b) return fail('Enter two valid dates.');
      if (a > b) [a, b] = [b, a];
      const days = daysBetween(a, b);
      const d = ymd(a, b);
      return {
        metrics: [
          { label: 'Days between', value: days, kind: 'number', decimals: 0, big: true },
          { label: 'In years, months and days', value: `${plural(d.years, 'year')}, ${plural(d.months, 'month')}, ${plural(d.days, 'day')}`, kind: 'text' },
          { label: 'Weeks and days', value: `${plural(Math.floor(days / 7), 'week')} ${plural(days % 7, 'day')}`, kind: 'text' },
          { label: 'Hours', value: days * 24, kind: 'number', decimals: 0 },
        ],
        note: 'The start day is not counted, the end day is. Add 1 if you need both days included.',
      };
    },
    formula: ['Days = end date − start date', 'Years, months and days are counted as complete calendar units'],
    example: '1 January 2026 to 25 December 2026: 358 days. As calendar units that is 11 months and 24 days, or 51 weeks and 1 day.',
    how: [
      'The tool counts the days between the two dates as calendar days, including leap days.',
      'If the first date is later than the second, it swaps them so you still get the gap.',
      'For business days only, use the working days calculator.',
    ],
    faqs: [
      { q: 'Does it count the start and end date?', a: 'It counts the days from the start date up to and including the end date, so the start day itself is not counted. Add 1 for an inclusive count.' },
      { q: 'How many days are in a year?', a: '365, or 366 in a leap year.' },
      { q: 'Does it work across leap years?', a: 'Yes. Real calendar dates are used.' },
      { q: 'How do I count only weekdays?', a: 'Use the working days calculator.' },
    ],
    related: ['age-calculator', 'working-days-calculator', 'add-days-calculator'],
  },
  {
    slug: 'add-days-calculator',
    name: 'Add or subtract days',
    group: 'dates',
    emoji: '➕',
    summary: 'The date that is a number of days, weeks or months from a start date.',
    quick: 'Enter a start date and a number of days. 100 days after 1 January 2026 is Saturday, 11 April 2026.',
    keywords: 'date plus days minus days due date deadline calculate future date',
    title: 'Add or Subtract Days from a Date: future and past dates',
    description: 'Free date calculator. Add or subtract days, weeks, months or years from any date and see the resulting date and weekday.',
    fields: [
      date('start', 'Start date', '2026-01-01'),
      sel('dir', 'Add or subtract', 'add', [
        ['add', 'Add'],
        ['sub', 'Subtract'],
      ]),
      num('amount', 'How many', 100, { step: 1, min: 0 }),
      sel('unit', 'Unit', 'days', [
        ['days', 'Days'],
        ['weeks', 'Weeks'],
        ['months', 'Months'],
        ['years', 'Years'],
      ]),
    ],
    compute: (v) => {
      const start = dateOf(v, 'start');
      if (!start) return fail('Enter a valid start date.');
      const k = Math.round(n(v, 'amount')) * (s(v, 'dir') === 'sub' ? -1 : 1);
      const unit = s(v, 'unit');
      const out = new Date(start);
      if (unit === 'days') out.setUTCDate(out.getUTCDate() + k);
      else if (unit === 'weeks') out.setUTCDate(out.getUTCDate() + k * 7);
      else {
        const day = start.getUTCDate();
        out.setUTCDate(1);
        if (unit === 'months') out.setUTCMonth(out.getUTCMonth() + k);
        else out.setUTCFullYear(out.getUTCFullYear() + k);
        out.setUTCDate(Math.min(day, daysInMonth(out.getUTCFullYear(), out.getUTCMonth())));
      }
      return {
        metrics: [
          { label: 'Resulting date', value: longDate(out), kind: 'text', big: true },
          { label: 'As a number', value: isoOf(out), kind: 'text' },
          { label: 'Days from the start date', value: Math.abs(daysBetween(start, out)), kind: 'number', decimals: 0 },
        ],
      };
    },
    formula: ['Result = start date ± the number of days (weeks × 7)', 'For months and years the day of the month is kept, or the last day of a shorter month'],
    example: '1 January 2026 plus 100 days: January has 31 days, February 28, March 31, so 100 days later is 11 April 2026, a Saturday.',
    how: [
      'Adding days moves along the calendar one day at a time, crossing month ends and leap days correctly.',
      'Adding months keeps the same day of the month. If that day does not exist (31 March plus one month), you get the last day of the shorter month.',
      'Useful for notice periods, due dates, warranties and course end dates.',
    ],
    faqs: [
      { q: 'How do I find the date 90 days from today?', a: 'Set the start date to today, choose Add and enter 90 days.' },
      { q: 'What is 31 January plus one month?', a: 'The last day of February, because February has no 31st.' },
      { q: 'Does it skip weekends?', a: 'No, it counts calendar days. The working days calculator handles weekdays.' },
      { q: 'Can I go back in time?', a: 'Yes. Choose Subtract.' },
    ],
    related: ['date-difference-calculator', 'working-days-calculator', 'age-calculator'],
  },
  {
    slug: 'working-days-calculator',
    name: 'Working days calculator',
    group: 'dates',
    emoji: '💼',
    summary: 'Count Monday to Friday days between two dates.',
    quick: 'Enter two dates. January 2026 has 22 working days (Monday to Friday) and 9 weekend days.',
    keywords: 'business days weekdays workdays excluding weekends between dates holidays',
    title: 'Working Days Calculator: weekdays between two dates',
    description: 'Free working days calculator. Count the Monday to Friday days between two dates, and subtract any holidays you list.',
    fields: [date('from', 'From (included)', '2026-01-01'), date('to', 'To (included)', '2026-01-31'), num('holidays', 'Holidays falling on weekdays', 0, { step: 1, min: 0 })],
    compute: (v) => {
      let a = dateOf(v, 'from');
      let b = dateOf(v, 'to');
      if (!a || !b) return fail('Enter two valid dates.');
      if (a > b) [a, b] = [b, a];
      const total = daysBetween(a, b) + 1;
      const week = weekdaysBetween(a, b);
      const holidays = Math.max(0, Math.round(n(v, 'holidays')));
      return {
        metrics: [
          { label: 'Working days', value: Math.max(0, week - holidays), kind: 'number', decimals: 0, big: true },
          { label: 'Calendar days', value: total, kind: 'number', decimals: 0 },
          { label: 'Weekend days (Saturday and Sunday)', value: total - week, kind: 'number', decimals: 0 },
        ],
        note: 'Saturdays and Sundays are treated as days off. Enter the number of public holidays that fall on weekdays to subtract them.',
      };
    },
    formula: ['Working days = Monday to Friday days from the start date to the end date, both included, minus holidays you enter'],
    example: '1 to 31 January 2026: 31 calendar days, 9 of them Saturdays or Sundays, leaving 22 working days.',
    how: [
      'The calculator counts whole weeks as 5 working days each, then checks the leftover days one by one.',
      'It does not know your local holidays, so count the holidays that fall on a weekday and enter them to subtract.',
      'Both the start and the end date are included in the count.',
    ],
    faqs: [
      { q: 'Does it include the start and end dates?', a: 'Yes, both are counted if they are weekdays.' },
      { q: 'Does it know public holidays?', a: 'No. Holidays differ by country and state, so enter how many fall on weekdays and they are subtracted.' },
      { q: 'What if my week is Sunday to Thursday?', a: 'This tool assumes Saturday and Sunday are the days off.' },
      { q: 'How many working days are in a year?', a: 'About 260 to 261, before holidays.' },
    ],
    related: ['date-difference-calculator', 'add-days-calculator', 'time-duration-calculator'],
  },
  {
    slug: 'time-duration-calculator',
    name: 'Time duration calculator',
    group: 'dates',
    emoji: '⏱️',
    summary: 'Hours and minutes between a start time and an end time.',
    quick: 'Enter a start and an end time on the 24-hour clock. From 09:30 to 17:45 is 8 hours 15 minutes, or 8.25 hours.',
    keywords: 'hours minutes between two times shift work hours timesheet elapsed',
    title: 'Time Duration Calculator: hours between two times',
    description: 'Free time duration calculator. Enter a start and end time to get the hours and minutes between them, with a break option and overnight shifts handled.',
    fields: [
      num('sh', 'Start hour (0 to 23)', 9, { min: 0, max: 23, step: 1 }),
      num('sm', 'Start minute', 30, { min: 0, max: 59, step: 1 }),
      num('eh', 'End hour (0 to 23)', 17, { min: 0, max: 23, step: 1 }),
      num('em', 'End minute', 45, { min: 0, max: 59, step: 1 }),
      num('brk', 'Unpaid break', 0, { unit: 'number', min: 0, step: 5, hint: 'In minutes' }),
    ],
    compute: (v) => {
      const start = n(v, 'sh') * 60 + n(v, 'sm');
      const end = n(v, 'eh') * 60 + n(v, 'em');
      if ([n(v, 'sh'), n(v, 'eh')].some((h) => h < 0 || h > 23) || [n(v, 'sm'), n(v, 'em')].some((m) => m < 0 || m > 59)) return fail('Hours go from 0 to 23 and minutes from 0 to 59.');
      let mins = end - start;
      if (mins < 0) mins += 24 * 60;
      mins -= Math.max(0, n(v, 'brk'));
      if (mins < 0) return fail('The break is longer than the time worked.');
      return {
        metrics: [
          { label: 'Duration', value: `${Math.floor(mins / 60)} hours ${mins % 60} minutes`, kind: 'text', big: true },
          { label: 'In decimal hours', value: mins / 60, kind: 'number', decimals: 2 },
          { label: 'In minutes', value: mins, kind: 'number', decimals: 0 },
        ],
        note: end < start ? 'The end time is earlier than the start time, so this counts an overnight span.' : '',
      };
    },
    formula: ['Minutes = (end hour × 60 + end minute) − (start hour × 60 + start minute)', 'If that is negative, add 24 × 60 for a span past midnight; then subtract the break'],
    example: '09:30 to 17:45: (17 × 60 + 45) − (9 × 60 + 30) = 1,065 − 570 = 495 minutes, which is 8 hours 15 minutes or 8.25 hours.',
    how: [
      'Times are on the 24-hour clock, so 5:45 pm is 17:45.',
      'If the end is earlier than the start, the calculator assumes you worked past midnight.',
      'The decimal hours figure is handy for timesheets and pay: 8 hours 15 minutes is 8.25 hours.',
    ],
    faqs: [
      { q: 'How do I enter pm times?', a: 'Add 12 to the hour: 3 pm is 15, 11 pm is 23. Midnight is 0.' },
      { q: 'Does it handle night shifts?', a: 'Yes. A 22:00 to 06:00 shift is 8 hours.' },
      { q: 'How do I convert minutes to decimal hours?', a: 'Divide by 60. 15 minutes is 0.25 hours.' },
      { q: 'Can it span more than one day?', a: 'No, it covers up to 24 hours. Use the date difference calculator for longer gaps.' },
    ],
    related: ['working-days-calculator', 'date-difference-calculator', 'countdown-timer'],
  },
  {
    slug: 'countdown-timer',
    name: 'Countdown to a date',
    group: 'dates',
    emoji: '⏳',
    summary: 'Days, hours and minutes left until a date you choose.',
    quick: 'Pick a date to see how many days, weeks and hours are left until the start of that day. At noon on 1 December 2026, a countdown to 1 January 2027 shows 30 days 12 hours.',
    keywords: 'days until countdown how many days left event deadline birthday exam',
    title: 'Countdown Calculator: days left until a date',
    description: 'Free countdown calculator. Choose a date and see how many days, weeks, hours and minutes are left until then.',
    fields: [date('target', 'Count down to', '2027-01-01')],
    compute: (v) => {
      const target = dateOf(v, 'target');
      if (!target) return fail('Enter a valid date.');
      const now = new Date();
      const t = new Date(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate()).getTime();
      const ms = t - now.getTime();
      if (ms <= 0) return { metrics: [{ label: 'That date has passed', value: `${plural(Math.ceil(-ms / DAY), 'day')} ago`, kind: 'text', big: true }] };
      const days = Math.floor(ms / DAY);
      return {
        metrics: [
          { label: 'Time left', value: `${days} days ${Math.floor((ms % DAY) / 3_600_000)} hours ${Math.floor((ms % 3_600_000) / 60_000)} minutes`, kind: 'text', big: true },
          { label: 'Weeks and days', value: `${plural(Math.floor(days / 7), 'week')} ${plural(days % 7, 'day')}`, kind: 'text' },
          { label: 'Total hours', value: Math.floor(ms / 3_600_000), kind: 'number', decimals: 0 },
          { label: 'Date', value: longDate(target), kind: 'text' },
        ],
        note: 'Counts down to the start of that day on your device’s clock.',
      };
    },
    formula: ['Time left = start of the chosen day − the current time on your device', 'Days = whole 24-hour periods; the rest is shown in hours and minutes'],
    example: 'On 1 December 2026 at noon, a countdown to 1 January 2027 shows 30 days 12 hours, because 31 days minus half a day remain.',
    how: [
      'The count uses your device’s clock and time zone, so it is right for where you are.',
      'Reload or change the date to refresh the figure. Nothing is sent anywhere.',
      'Handy for exams, trips, birthdays and deadlines.',
    ],
    faqs: [
      { q: 'Does it update live?', a: 'It recalculates whenever you change the date or reload the page.' },
      { q: 'Which time zone does it use?', a: 'The one set on your device.' },
      { q: 'Does it count the target day?', a: 'It counts down to midnight at the start of that day.' },
      { q: 'What happens after the date?', a: 'It tells you how many days ago the date was.' },
    ],
    related: ['date-difference-calculator', 'age-calculator', 'add-days-calculator'],
  },
];

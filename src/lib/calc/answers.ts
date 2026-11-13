import type { CalcDef } from './types';

/**
 * The answer-first block under each calculator's heading, the part search and AI answers quote: what the thing is, the formula, and a
 * worked example with real numbers. It is put together from three pieces so the numbers can never drift from the calculator: a plain
 * "what it is" sentence (below), the calculator's own first formula line, and the example sentence from its `quick` text (which tests
 * check against the calculator). tests/unit/answers.test.ts keeps every answer between 40 and 60 words.
 */
export interface AnswerMeta {
  /** How the topic reads in a heading: "How is {topic} calculated?" */
  topic: string;
  /** One plain sentence: what this is. */
  what: string;
}

export const ANSWER_META: Record<string, AnswerMeta> = {
  'emi-calculator': { topic: 'EMI', what: 'An EMI, or equated monthly instalment, is the fixed amount you repay every month on a loan, interest included.' },
  'home-loan-emi-calculator': { topic: 'a home loan EMI', what: 'A home loan EMI is the fixed monthly payment that repays a housing loan over its tenure, interest included.' },
  'car-loan-emi-calculator': { topic: 'a car loan EMI', what: 'A car loan EMI is the fixed monthly payment that repays the loan you take to buy a car.' },
  'personal-loan-emi-calculator': { topic: 'a personal loan EMI', what: 'A personal loan EMI is the fixed monthly payment on an unsecured loan, which usually has a short tenure and a higher rate.' },
  'loan-prepayment-calculator': { topic: 'interest saved by prepaying a loan', what: 'Prepaying means paying extra towards the principal, which cuts the interest you owe and ends the loan sooner.' },
  'loan-eligibility-calculator': { topic: 'loan eligibility', what: 'Loan eligibility is the largest loan whose EMI fits within the share of income that lenders allow for repayments.' },
  'sip-calculator': { topic: 'SIP returns', what: 'A SIP invests a fixed amount every month, and its value is each instalment compounded at the assumed return.' },
  'lumpsum-calculator': { topic: 'lumpsum returns', what: 'A lumpsum is a single investment that grows by compounding at an assumed yearly return, so the longer it stays invested, the more it earns.' },
  'step-up-sip-calculator': { topic: 'a step-up SIP', what: 'A step-up SIP raises the monthly investment by a fixed percentage every year, so it grows with your income.' },
  'swp-calculator': { topic: 'SWP withdrawals', what: 'A systematic withdrawal plan takes a fixed amount from an investment each month while the balance keeps earning a return.' },
  'fd-calculator': { topic: 'FD maturity', what: 'A fixed deposit pays interest that is added to the deposit at set intervals, so its value grows by compounding.' },
  'rd-calculator': { topic: 'RD maturity', what: 'A recurring deposit takes a fixed amount every month and pays interest that banks compound quarterly.' },
  'compound-interest-calculator': { topic: 'compound interest', what: 'Compound interest is earned on the principal and on interest already added, so growth speeds up over time.' },
  'simple-interest-calculator': { topic: 'simple interest', what: 'Simple interest is charged on the original principal only, so it adds the same amount every year.' },
  'cagr-calculator': { topic: 'CAGR', what: 'CAGR, the compound annual growth rate, is the steady yearly rate that takes a starting value to an ending value.' },
  'inflation-calculator': { topic: 'the effect of inflation', what: 'Inflation raises prices over time, so the same money buys less and the same goods cost more.' },
  'retirement-calculator': { topic: 'a retirement corpus', what: 'A retirement corpus is the sum needed at retirement to pay your expenses, raised by inflation, for the years you expect to live.' },
  'income-tax-calculator': { topic: 'income tax', what: 'Income tax is charged in slabs, and you can choose the default new regime or the old one.' },
  'gst-calculator': { topic: 'GST', what: 'GST is a percentage added to a price; the main rates are 5% and 18%, with a special 40% rate for a few goods.' },
  'gratuity-calculator': { topic: 'gratuity', what: 'Gratuity is a lump sum your employer pays when you leave after long service: fifteen days’ wages for each completed year.' },
  'hra-calculator': { topic: 'HRA exemption', what: 'HRA is part of your salary, and the tax-free part is the least of three limits, if you pay rent and choose the old regime.' },
  'percentage-calculator': { topic: 'a percentage', what: 'A percentage is a number out of 100, and this tool answers the five questions people ask most, from percent of to increase and decrease.' },
  'percentage-change-calculator': { topic: 'percentage change', what: 'Percentage change measures how much a value rose or fell compared with where it started, and a negative result means a fall.' },
  'discount-calculator': { topic: 'a discount', what: 'A discount takes a percentage off a price, and a second discount applies to the price already reduced.' },
  'profit-loss-calculator': { topic: 'profit and loss', what: 'Profit is the selling price minus the cost price; a negative result is a loss.' },
  'average-calculator': { topic: 'the average', what: 'The mean is the sum divided by the count, the median is the middle value and the mode is the most common.' },
  'ratio-calculator': { topic: 'a ratio', what: 'A ratio compares two quantities, and simplifying it divides both by their greatest common divisor.' },
  'fraction-calculator': { topic: 'fraction sums', what: 'Fractions are added, subtracted, multiplied or divided, and the answer is reduced to lowest terms.' },
  'basic-calculator': { topic: 'a basic sum', what: 'The basic calculator does one operation on two numbers: add, subtract, multiply, divide, power, remainder or percent of, with the working shown.' },
  'scientific-calculator': { topic: 'a scientific sum', what: 'The scientific calculator reads a whole expression with brackets, powers, roots, logs and trigonometry, in the usual order of operations.' },
  'age-calculator': { topic: 'age', what: 'Your exact age is the time from your date of birth to a chosen date, counted in years, months and days.' },
  'date-difference-calculator': { topic: 'the days between two dates', what: 'The gap between two dates is the number of days from the start date to the end date.' },
  'add-days-calculator': { topic: 'adding days to a date', what: 'Adding days moves a date forward or back on the calendar, carrying over month ends and leap days.' },
  'working-days-calculator': { topic: 'working days', what: 'Working days are the Monday to Friday days in a period, with any weekday holidays taken off.' },
  'time-duration-calculator': { topic: 'time duration', what: 'Time duration is the gap between two clock times, found by subtracting the start from the end.' },
  'countdown-timer': { topic: 'a countdown', what: 'A countdown shows the time left until a chosen date, measured to the start of that day on your device’s clock.' },
  'bmi-calculator': { topic: 'BMI', what: 'BMI, or body mass index, relates weight to height and puts the result into a standard category.' },
  'bmr-calculator': { topic: 'BMR', what: 'BMR, or basal metabolic rate, is the energy your body uses at rest, from the Mifflin-St Jeor equation.' },
  'tdee-calculator': { topic: 'daily calories (TDEE)', what: 'TDEE, total daily energy expenditure, is the calories you burn in a day: your BMR times an activity factor.' },
  'body-fat-calculator': { topic: 'body fat', what: 'This estimate uses the U.S. Navy tape-measure method, which works out body fat from height, neck and waist (and hips for women).' },
  'ideal-weight-calculator': { topic: 'ideal weight', what: 'Devine and Robinson formulas estimate a healthy weight from height and sex alone.' },
  'water-intake-calculator': { topic: 'daily water intake', what: 'A rule of thumb for water intake is 35 ml per kg of body weight, plus extra for exercise.' },
  'pregnancy-due-date-calculator': { topic: 'a pregnancy due date', what: 'The due date is estimated by adding 280 days, or 40 weeks, to the first day of the last menstrual period.' },
  'cgpa-to-percentage-calculator': { topic: 'CGPA to percentage', what: 'Converting a CGPA to a percentage multiplies it by a factor, which is 9.5 under the CBSE convention, and some universities use their own rule.' },
  'gpa-calculator': { topic: 'GPA', what: 'GPA is the average of your grade points, weighted by each course’s credits, so a course with more credits counts for more.' },
  'marks-percentage-calculator': { topic: 'a marks percentage', what: 'Your percentage is the marks you obtained divided by the total marks, times 100, and the calculator also finds the marks needed for a target.' },
  'attendance-calculator': { topic: 'attendance', what: 'Attendance is the share of classes held that you attended, and the calculator shows how many more you need or can miss.' },
};

/** The sentences of `quick` that are not an instruction ("Enter...", "Type...", "Pick...", "Add...", "Measure..."): the worked example. */
export function exampleOf(def: CalcDef): string {
  const sentences = def.quick.split(/(?<=[.!?])\s+(?=[A-Z₹(0-9])/);
  const rest = sentences.filter((s) => !/^(Enter|Type|Pick|Add|Measure|Choose)\b/.test(s));
  return (rest.length > 0 ? rest : sentences).join(' ');
}

/** The 40 to 60 word answer shown directly under the heading: what it is, the formula, a worked example. */
export function answerFor(def: CalcDef): string {
  const meta = ANSWER_META[def.slug];
  if (!meta) throw new Error(`No answer text for ${def.slug}`);
  return `${meta.what} Formula: ${def.formula[0]}. ${exampleOf(def)}`;
}

export const topicOf = (def: CalcDef): string => ANSWER_META[def.slug]?.topic ?? def.name;
export const wordsIn = (s: string): number => s.split(/\s+/).filter(Boolean).length;

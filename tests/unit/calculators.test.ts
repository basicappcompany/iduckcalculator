import { describe, expect, it } from 'vitest';
import { CALCULATORS, calcBySlug, defaultValues, searchCalcs } from '../../src/lib/calc';
import type { Metric, Values } from '../../src/lib/calc/types';

const run = (slug: string, over: Values = {}) => {
  const def = calcBySlug(slug)!;
  return def.compute({ ...defaultValues(def), ...over });
};
const metric = (slug: string, label: RegExp | string, over: Values = {}): Metric => {
  const r = run(slug, over);
  expect(r.error, `${slug} errored: ${r.error}`).toBeUndefined();
  const m = r.metrics.find((x) => (typeof label === 'string' ? x.label === label : label.test(x.label)));
  if (!m) throw new Error(`${slug}: no metric ${String(label)} in ${r.metrics.map((x) => x.label).join(' | ')}`);
  return m;
};

describe('registry', () => {
  it('has unique slugs and every page field the template needs', () => {
    const slugs = CALCULATORS.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const c of CALCULATORS) {
      expect(c.title.length, `${c.slug} title`).toBeLessThanOrEqual(65);
      expect(c.description.length, `${c.slug} description`).toBeGreaterThanOrEqual(70);
      expect(c.description.length, `${c.slug} description`).toBeLessThanOrEqual(175);
      expect(c.faqs.length, `${c.slug} faqs`).toBeGreaterThanOrEqual(4);
      expect(c.faqs.length, `${c.slug} faqs`).toBeLessThanOrEqual(6);
      expect(c.how.length, `${c.slug} how`).toBeGreaterThanOrEqual(2);
      expect(c.formula.length, `${c.slug} formula`).toBeGreaterThanOrEqual(1);
      expect(c.example.length, `${c.slug} example`).toBeGreaterThan(30);
      expect(c.related, `${c.slug} related`).toHaveLength(3);
      for (const r of c.related) expect(calcBySlug(r), `${c.slug} -> ${r}`).toBeDefined();
      expect(c.related).not.toContain(c.slug);
    }
  });
  it('computes cleanly from the default values', () => {
    for (const c of CALCULATORS) {
      const r = c.compute(defaultValues(c));
      expect(r.error, `${c.slug}: ${r.error}`).toBeUndefined();
      expect(r.metrics.length, c.slug).toBeGreaterThan(0);
      for (const m of r.metrics) if (typeof m.value === 'number') expect(Number.isFinite(m.value), `${c.slug} ${m.label}`).toBe(true);
    }
  });
  it('reports a plain error, never throws, on empty or nonsense input', () => {
    for (const c of CALCULATORS) {
      const blank = Object.fromEntries(c.fields.map((f) => [f.id, f.kind === 'select' ? f.default : '']));
      expect(() => c.compute(blank), c.slug).not.toThrow();
      const nan = Object.fromEntries(c.fields.map((f) => [f.id, f.kind === 'select' ? f.default : 'abc']));
      expect(() => c.compute(nan), c.slug).not.toThrow();
    }
  });
  it('searches by plain words', () => {
    expect(searchCalcs('emi')[0]?.slug).toBe('emi-calculator');
    expect(searchCalcs('how old')[0]?.slug).toBe('age-calculator');
    expect(searchCalcs('cgpa').map((c) => c.slug)).toContain('cgpa-to-percentage-calculator');
    expect(searchCalcs('zzzz')).toHaveLength(0);
  });
});

describe('known answers: loans', () => {
  it('EMI ₹10,00,000 at 9% for 20 years', () => {
    expect(Math.round(metric('emi-calculator', 'Monthly EMI').value as number)).toBe(8997);
    expect(Math.round(metric('emi-calculator', 'Total interest').value as number)).toBe(1159342);
    expect(Math.round(metric('emi-calculator', 'Total payment').value as number)).toBe(2159342);
  });
  it('tenure in months gives the same EMI as in years', () => {
    expect(metric('emi-calculator', 'Monthly EMI', { tenure: 240, tenureUnit: 'months' }).value).toBeCloseTo(metric('emi-calculator', 'Monthly EMI').value as number, 6);
  });
  it('home, car and personal loan pages', () => {
    expect(Math.round(metric('home-loan-emi-calculator', 'Monthly EMI').value as number)).toBe(43391);
    expect(Math.round(metric('home-loan-emi-calculator', 'Total interest').value as number)).toBe(5413879);
    expect(Math.round(metric('car-loan-emi-calculator', 'Monthly EMI').value as number)).toBe(16801);
    expect(Math.round(metric('car-loan-emi-calculator', 'Total payment').value as number)).toBe(1008089);
    expect(Math.round(metric('personal-loan-emi-calculator', 'Monthly EMI').value as number)).toBe(10253);
    expect(Math.round(metric('personal-loan-emi-calculator', 'Total payment').value as number)).toBe(369118);
  });
  it('prepayment: 103 months and about ₹7.2 lakh saved', () => {
    expect(metric('loan-prepayment-calculator', 'New loan length').value).toBe('8 years 7 months');
    expect(Math.round(metric('loan-prepayment-calculator', 'Interest saved').value as number)).toBe(721616);
  });
  it('eligibility: ₹1,00,000 income, 50% FOIR, 8.5%, 20 years', () => {
    expect(Math.round(metric('loan-eligibility-calculator', 'Estimated eligible loan').value as number)).toBe(5761542);
    expect(run('loan-eligibility-calculator', { existing: 60000 }).error).toBeTruthy();
  });
});

describe('known answers: savings', () => {
  it('SIP, lumpsum, compound, simple, CAGR', () => {
    expect(Math.round(metric('sip-calculator', 'Maturity value').value as number)).toBe(1161695);
    expect(metric('sip-calculator', 'Amount invested').value).toBe(600000);
    expect(Math.round(metric('lumpsum-calculator', 'Maturity value').value as number)).toBe(310585);
    expect(Math.round(metric('compound-interest-calculator', 'Amount after the period').value as number)).toBe(161051);
    expect(metric('simple-interest-calculator', 'Simple interest').value).toBe(24000);
    expect(metric('simple-interest-calculator', 'Total amount').value).toBe(124000);
    expect(metric('cagr-calculator', 'CAGR').value as number).toBeCloseTo(14.87, 2);
  });
  it('step-up SIP, SWP, FD, RD', () => {
    expect(Math.round(metric('step-up-sip-calculator', 'Maturity value').value as number)).toBe(3374326);
    expect(Math.round(metric('step-up-sip-calculator', 'Amount invested').value as number)).toBe(1912491);
    expect(Math.round(metric('swp-calculator', 'Balance left at the end').value as number)).toBe(916125);
    expect(metric('swp-calculator', 'Total withdrawn').value).toBe(9600000);
    expect(run('swp-calculator', { withdraw: 60000, years: 30 }).metrics[0]!.label).toBe('Money runs out after');
    expect(Math.round(metric('fd-calculator', 'Maturity value').value as number)).toBe(141478);
    expect(Math.round(metric('fd-calculator', 'Maturity value', { freq: '12' }).value as number)).toBe(141763);
    expect(Math.round(metric('rd-calculator', 'Maturity value').value as number)).toBe(359664);
  });
  it('inflation and retirement', () => {
    expect(Math.round(metric('inflation-calculator', 'Same things will cost').value as number)).toBe(179085);
    expect(Math.round(metric('inflation-calculator', 'Your money will buy only').value as number)).toBe(55839);
    expect(Math.round(metric('retirement-calculator', 'Corpus needed at retirement').value as number)).toBe(51911228);
    expect(Math.round(metric('retirement-calculator', /Yearly expenses/).value as number)).toBe(2575122);
  });
});

describe('known answers: everyday maths', () => {
  it('percentage in every form', () => {
    expect(metric('percentage-calculator', /15% of 2400/).value).toBe(360);
    expect(metric('percentage-calculator', /as a percentage/, { mode: 'is', x: 30, y: 120 }).value).toBe(25);
    expect(metric('percentage-calculator', /number that/, { mode: 'whole', x: 360, y: 15 }).value).toBe(2400);
    expect(metric('percentage-calculator', /increased/, { mode: 'up', x: 500, y: 18 }).value).toBe(590);
    expect(metric('percentage-calculator', /decreased/, { mode: 'down', x: 80, y: 20 }).value).toBe(64);
    expect(run('percentage-calculator', { mode: 'is', y: 0 }).error).toBeTruthy();
  });
  it('percentage change, discount, profit and loss', () => {
    expect(metric('percentage-change-calculator', 'Percentage increase').value).toBe(25);
    expect(metric('percentage-change-calculator', 'Percentage decrease', { from: 100, to: 80 }).value).toBe(20);
    expect(run('percentage-change-calculator', { from: 0 }).error).toBeTruthy();
    expect(metric('discount-calculator', 'You pay').value).toBeCloseTo(1350, 6);
    expect(metric('discount-calculator', 'You save').value).toBeCloseTo(650, 6);
    expect(metric('discount-calculator', 'Effective discount').value).toBeCloseTo(32.5, 6);
    expect(metric('profit-loss-calculator', 'Profit').value).toBe(200);
    expect(metric('profit-loss-calculator', /Profit percentage/).value).toBe(25);
    expect(metric('profit-loss-calculator', /Margin/).value).toBe(20);
    expect(metric('profit-loss-calculator', 'Loss', { cost: 1000, sell: 900 }).value).toBe(100);
  });
  it('average, ratio, fraction', () => {
    expect(metric('average-calculator', 'Mean (average)').value).toBe(24);
    expect(metric('average-calculator', 'Median').value).toBe(24);
    expect(metric('average-calculator', 'Median', { list: '1 2 3 4' }).value).toBe(2.5);
    expect(metric('average-calculator', 'Mode', { list: '1 2 2 3' }).value).toBe('2');
    expect(run('average-calculator', { list: '1, x' }).error).toBeTruthy();
    expect(metric('ratio-calculator', 'Simplest ratio').value).toBe('2 : 3');
    expect(metric('ratio-calculator', /^D,/).value).toBe(15);
    expect(metric('fraction-calculator', 'Answer').value).toBe('5/6');
    expect(metric('fraction-calculator', 'Decimal').value).toBeCloseTo(0.833333, 6);
    expect(metric('fraction-calculator', 'Answer', { op: 'div', n1: 1, d1: 2, n2: 1, d2: 4 }).value).toBe('2');
    expect(metric('fraction-calculator', 'Mixed number', { op: 'add', n1: 3, d1: 2, n2: 1, d2: 1 }).value).toBe('2 1/2');
    expect(run('fraction-calculator', { d1: 0 }).error).toBeTruthy();
  });
});

describe('known answers: dates', () => {
  it('age on a fixed date', () => {
    expect(metric('age-calculator', 'Your age', { asof: '2026-01-01' }).value).toBe('30 years, 6 months, 17 days');
    expect(metric('age-calculator', 'Born on a', { asof: '2026-01-01' }).value).toBe('Thursday');
    expect(run('age-calculator', { dob: '2030-01-01', asof: '2026-01-01' }).error).toBeTruthy();
    expect(metric('age-calculator', 'Your age', { dob: '2000-02-29', asof: '2001-02-28' }).value).toBe('0 years, 11 months, 30 days');
  });
  it('date difference, add days, working days, time duration', () => {
    expect(metric('date-difference-calculator', 'Days between').value).toBe(358);
    expect(metric('date-difference-calculator', 'In years, months and days').value).toBe('0 years, 11 months, 24 days');
    expect(metric('date-difference-calculator', 'Days between', { from: '2026-12-25', to: '2026-01-01' }).value).toBe(358);
    expect(metric('add-days-calculator', 'As a number').value).toBe('2026-04-11');
    expect(metric('add-days-calculator', 'Resulting date').value).toBe('Saturday, 11 April 2026');
    expect(metric('add-days-calculator', 'As a number', { start: '2026-01-31', unit: 'months', amount: 1 }).value).toBe('2026-02-28');
    expect(metric('add-days-calculator', 'As a number', { dir: 'sub', amount: 1, unit: 'days' }).value).toBe('2025-12-31');
    expect(metric('working-days-calculator', 'Working days').value).toBe(22);
    expect(metric('working-days-calculator', /Weekend/).value).toBe(9);
    expect(metric('working-days-calculator', 'Working days', { holidays: 2 }).value).toBe(20);
    expect(metric('time-duration-calculator', 'Duration').value).toBe('8 hours 15 minutes');
    expect(metric('time-duration-calculator', 'In decimal hours').value).toBe(8.25);
    expect(metric('time-duration-calculator', 'Duration', { sh: 22, sm: 0, eh: 6, em: 0 }).value).toBe('8 hours 0 minutes');
  });
});

describe('known answers: health', () => {
  it('BMI, BMR, TDEE', () => {
    expect(metric('bmi-calculator', 'Your BMI').value).toBeCloseTo(22.86, 2);
    expect(metric('bmi-calculator', /Category/).value).toBe('Normal weight');
    expect(metric('bmi-calculator', /Healthy weight/).value).toBe('56.7 to 76.3 kg');
    expect(metric('bmi-calculator', /Category/, { kg: 90 }).value).toBe('Overweight');
    expect(Math.round(metric('bmr-calculator', /BMR/).value as number)).toBe(1649);
    expect(metric('bmr-calculator', /BMR/, { sex: 'female', age: 25, kg: 60, cm: 165 }).value).toBeCloseTo(1345.25, 2);
    expect(Math.round(metric('tdee-calculator', 'Maintain your weight').value as number)).toBe(2556);
  });
  it('body fat, ideal weight, water, due date', () => {
    expect(metric('body-fat-calculator', 'Estimated body fat').value as number).toBeCloseTo(16.9, 1);
    expect(metric('ideal-weight-calculator', 'Devine formula').value as number).toBeCloseTo(70.5, 1);
    expect(metric('ideal-weight-calculator', 'Robinson formula').value as number).toBeCloseTo(68.9, 1);
    expect(metric('water-intake-calculator', 'Daily water target').value).toBeCloseTo(2.8, 6);
    expect(metric('pregnancy-due-date-calculator', 'Estimated due date').value).toBe('Saturday, 17 October 2026');
    expect(metric('pregnancy-due-date-calculator', 'Estimated due date', { cycle: 32 }).value).toBe('Wednesday, 21 October 2026');
  });
});

describe('known answers: students', () => {
  it('CGPA, GPA, marks, attendance', () => {
    expect(metric('cgpa-to-percentage-calculator', 'Percentage').value).toBe(77.9);
    expect(metric('gpa-calculator', 'GPA').value).toBe(3.58);
    expect(metric('gpa-calculator', 'Total credits').value).toBe(15);
    expect(metric('marks-percentage-calculator', 'Percentage').value).toBe(86.4);
    expect(metric('marks-percentage-calculator', /Marks needed/).value).toBe(450);
    expect(metric('marks-percentage-calculator', /short/).value).toBe(18);
    expect(metric('attendance-calculator', /in a row/).value).toBe(30);
    expect(metric('attendance-calculator', /can still miss/, { att: 80, held: 100 }).value).toBe(6);
    expect(run('marks-percentage-calculator', { got: 600 }).error).toBeTruthy();
  });
});

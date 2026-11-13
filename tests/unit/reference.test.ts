import { describe, expect, it } from 'vitest';
import { CALCULATORS, calcBySlug, defaultValues } from '../../src/lib/calc';
import { REFERENCE_SLUGS, referenceFor } from '../../src/lib/calc/reference';

const cell = (slug: string, row: string, col = 1): string => {
  const ref = referenceFor(slug)!;
  const r = ref.rows.find((x) => x[0] === row);
  if (!r) throw new Error(`${slug}: no row "${row}" in ${ref.rows.map((x) => x[0]).join(' | ')}`);
  return r[col]!;
};

describe('reference tables', () => {
  it('exist for every calculator, with real content', () => {
    expect(REFERENCE_SLUGS.sort()).toEqual(CALCULATORS.map((c) => c.slug).sort());
    for (const c of CALCULATORS) {
      const t = referenceFor(c.slug)!;
      expect(t.question, c.slug).toMatch(/\?$/);
      expect(t.note.length, `${c.slug} note`).toBeGreaterThan(15);
      expect(t.rows.length, `${c.slug} rows`).toBeGreaterThanOrEqual(3);
      for (const row of t.rows) {
        expect(row.length, `${c.slug} row width`).toBe(t.columns.length);
        for (const v of row) expect(v, `${c.slug} cell`).not.toMatch(/NaN|undefined|Infinity|^$/);
      }
    }
  });

  it('matches known answers', () => {
    expect(cell('emi-calculator', '9%', 4)).toBe('₹900'); // EMI on 1 lakh at 9% for 20 years
    expect(cell('home-loan-emi-calculator', '8.5%', 3)).toBe('₹43,391');
    expect(cell('car-loan-emi-calculator', '9%', 3)).toMatch(/^₹[\d,]+$/);
    expect(cell('sip-calculator', '₹5,000', 2)).toBe('₹11,61,695'); // 10 years at 12%
    expect(cell('lumpsum-calculator', '₹1,00,000', 2)).toBe('₹3,10,585');
    expect(cell('fd-calculator', '5 years', 3)).toBe('₹1,41,478'); // 7%, quarterly
    expect(cell('rd-calculator', '₹5,000', 4)).toBe('₹3,59,664');
    expect(cell('compound-interest-calculator', 'Yearly', 1)).toBe('₹1,61,051');
    expect(cell('simple-interest-calculator', '3 years', 2)).toBe('₹24,000'); // 8%
    expect(cell('cagr-calculator', '2 times', 2)).toBe('14.87%'); // 5 years
    expect(cell('inflation-calculator', '6% a year', 2)).toBe('₹1,79,085');
    expect(cell('discount-calculator', '₹2,000', 3)).toBe('₹1,500'); // 25% off
    expect(cell('percentage-calculator', '15%', 1)).toBe('180');
    expect(cell('ratio-calculator', '12 : 18', 1)).toBe('2 : 3');
    expect(cell('fraction-calculator', '1/8', 1)).toBe('0.125');
    expect(cell('basic-calculator', 'Multiply', 2)).toBe('15,000');
    expect(cell('scientific-calculator', 'sin(30)', 1)).toBe('0.5');
    expect(cell('age-calculator', '18 years', 1)).toBe('6,575'); // 18 x 365 plus 5 leap days
    expect(cell('working-days-calculator', 'January', 2)).toBe('22');
    expect(cell('working-days-calculator', 'February', 2)).toBe('20');
    expect(cell('add-days-calculator', '100', 1)).toBe('Saturday, 11 April 2026');
    expect(cell('time-duration-calculator', '15', 1)).toBe('0.25');
    expect(cell('countdown-timer', '1 week', 2)).toBe('168');
    expect(cell('bmi-calculator', '175 cm', 1)).toBe('56.7 to 76.3 kg');
    expect(cell('cgpa-to-percentage-calculator', '8.0', 1)).toBe('76%');
    expect(cell('cgpa-to-percentage-calculator', '10.0', 1)).toBe('95%');
    expect(cell('marks-percentage-calculator', '450', 1)).toBe('90%');
    expect(cell('attendance-calculator', '60', 3)).toBe('Attend the next 30 in a row');
    expect(cell('attendance-calculator', '80', 3)).toBe('Can miss 6 more');
    expect(cell('pregnancy-due-date-calculator', '32 days', 1)).toBe('21 October 2026');
    expect(cell('water-intake-calculator', '70 kg', 2)).toBe('2.8 L'); // 30 minutes of exercise
  });

  it('lists the same grade points the GPA calculator quotes', () => {
    const def = calcBySlug('gpa-calculator')!;
    const note = def.compute(defaultValues(def)).note ?? '';
    for (const [grade, points] of referenceFor('gpa-calculator')!.rows) expect(note, grade).toContain(`${grade} = ${points}`);
  });
});

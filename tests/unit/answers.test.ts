import { describe, expect, it } from 'vitest';
import { CALCULATORS } from '../../src/lib/calc';
import { ANSWER_META, answerFor, wordsIn } from '../../src/lib/calc/answers';

describe('answer-first text under each calculator heading', () => {
  it('has a plain sentence for every calculator and none for a calculator that does not exist', () => {
    expect(Object.keys(ANSWER_META).sort()).toEqual(CALCULATORS.map((c) => c.slug).sort());
  });
  it('is 40 to 60 words and states the formula and a worked example', () => {
    const bad = CALCULATORS.map((c) => ({ slug: c.slug, n: wordsIn(answerFor(c)) })).filter((x) => x.n < 40 || x.n > 60);
    expect(bad, 'answers outside 40 to 60 words').toEqual([]);
    for (const c of CALCULATORS) {
      const a = answerFor(c);
      expect(a, `${c.slug} formula`).toContain('Formula: ');
      expect(a, `${c.slug} formula line`).toContain(c.formula[0]!);
      expect(a, `${c.slug} has real numbers`).toMatch(/\d/);
      expect(a, `${c.slug} has no instruction left over`).not.toMatch(/\b(Enter|Type|Pick|Measure) /);
    }
  });
});

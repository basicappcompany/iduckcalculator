import { afterEach, describe, expect, it, vi } from 'vitest';
import { calcBySlug, defaultValues } from '../../src/lib/calc';
import { evaluate, ExprError } from '../../src/lib/calc/expr';
import type { Values } from '../../src/lib/calc/types';

const run = (slug: string, over: Values = {}) => {
  const def = calcBySlug(slug)!;
  return def.compute({ ...defaultValues(def), ...over });
};
const answer = (slug: string, over: Values = {}) => {
  const r = run(slug, over);
  expect(r.error, `${slug} errored: ${r.error}`).toBeUndefined();
  return r.metrics[0]!.value;
};

describe('expression evaluator', () => {
  it('follows the order of operations', () => {
    expect(evaluate('2 + 3 * 4')).toBe(14);
    expect(evaluate('(2 + 3) * 4')).toBe(20);
    expect(evaluate('10 - 4 - 3')).toBe(3);
    expect(evaluate('100 / 5 / 4')).toBe(5);
    expect(evaluate('7 mod 3 + 1')).toBe(2);
  });
  it('handles powers, signs and factorials', () => {
    expect(evaluate('2^10')).toBe(1024);
    expect(evaluate('2^3^2')).toBe(512); // right to left: 2^(3^2)
    expect(evaluate('-2^2')).toBe(-4);
    expect(evaluate('2^-1')).toBe(0.5);
    expect(evaluate('5!')).toBe(120);
    expect(evaluate('0!')).toBe(1);
    expect(evaluate('-3!')).toBe(-6);
    expect(evaluate('27^(1/3)')).toBeCloseTo(3, 12);
  });
  it('knows the constants and functions', () => {
    expect(evaluate('pi')).toBeCloseTo(3.14159265358979, 12);
    expect(evaluate('e')).toBeCloseTo(2.718281828459045, 12);
    expect(evaluate('sqrt(16)')).toBe(4);
    expect(evaluate('√16')).toBe(4);
    expect(evaluate('log(1000)')).toBeCloseTo(3, 12);
    expect(evaluate('ln(e)')).toBeCloseTo(1, 12);
    expect(evaluate('abs(-7.5)')).toBe(7.5);
    expect(evaluate('cbrt(27)')).toBeCloseTo(3, 12);
  });
  it('does trigonometry in degrees and radians, with exact multiples of 90', () => {
    expect(evaluate('sin(30)', 'deg')).toBeCloseTo(0.5, 12);
    expect(evaluate('cos(60)', 'deg')).toBeCloseTo(0.5, 12);
    expect(evaluate('tan(45)', 'deg')).toBeCloseTo(1, 12);
    expect(evaluate('sin(180)', 'deg')).toBe(0);
    expect(evaluate('cos(90)', 'deg')).toBe(0);
    expect(evaluate('sin(pi/2)', 'rad')).toBeCloseTo(1, 12);
    expect(evaluate('asin(0.5)', 'deg')).toBeCloseTo(30, 10);
    expect(() => evaluate('tan(90)', 'deg')).toThrow(ExprError);
  });
  it('allows implicit multiplication and the × ÷ − symbols', () => {
    expect(evaluate('2pi')).toBeCloseTo(6.283185307179586, 12);
    expect(evaluate('3(4 + 5)')).toBe(27);
    expect(evaluate('2 sin(30)', 'deg')).toBeCloseTo(1, 12);
    expect(evaluate('6 × 7 ÷ 2 − 1')).toBe(20);
    expect(evaluate('1.5e3')).toBe(1500);
  });
  it('rejects anything it cannot read, and never runs code', () => {
    for (const bad of ['', '2 +', '(1 + 2', '1 + 2)', '1 / 0', '5 mod 0', 'sqrt(-1)', 'ln(0) + ln(0)', '2.5!', '(-1)!', '171!', 'foo(2)', 'alert(1)', 'process.exit()', '1 $ 2', '2 3 )'])
      expect(() => evaluate(bad), bad).toThrow(ExprError);
    expect(() => evaluate('1+'.repeat(150) + '1')).toThrow(ExprError); // over 200 characters
    expect(() => evaluate('('.repeat(60) + '1' + ')'.repeat(60))).toThrow(ExprError);
  });
});

describe('basic calculator', () => {
  it('gives known answers', () => {
    expect(answer('basic-calculator')).toBe('15,000'); // 1,250 x 12
    expect(answer('basic-calculator', { a: 125, b: 75, op: 'add' })).toBe('200');
    expect(answer('basic-calculator', { a: 10, b: 4, op: 'sub' })).toBe('6');
    expect(answer('basic-calculator', { a: 1, b: 3, op: 'div' })).toBe('0.333333333333');
    expect(answer('basic-calculator', { a: 0.1, b: 0.2, op: 'add' })).toBe('0.3');
    expect(answer('basic-calculator', { a: 17, b: 5, op: 'mod' })).toBe('2');
    expect(answer('basic-calculator', { a: 2, b: 10, op: 'pow' })).toBe('1,024');
    expect(answer('basic-calculator', { a: 15, b: 2400, op: 'pct' })).toBe('360');
  });
  it('refuses to divide by zero and to show a result that is not a number', () => {
    expect(run('basic-calculator', { b: 0, op: 'div' }).error).toBeTruthy();
    expect(run('basic-calculator', { b: 0, op: 'mod' }).error).toBeTruthy();
    expect(run('basic-calculator', { a: 10, b: 400, op: 'pow' }).error).toBeTruthy();
  });
});

describe('scientific calculator', () => {
  it('gives known answers in degrees and radians', () => {
    expect(answer('scientific-calculator')).toBe('24'); // (2 + 3) * 4 + sqrt(16)
    expect(answer('scientific-calculator', { expr: 'sin(30)' })).toBe('0.5');
    expect(answer('scientific-calculator', { expr: 'sin(pi/6)', mode: 'rad' })).toBe('0.5');
    expect(answer('scientific-calculator', { expr: '5!' })).toBe('120');
    expect(answer('scientific-calculator', { expr: '0.1 + 0.2' })).toBe('0.3');
    expect(answer('scientific-calculator', { expr: '2^100' })).toBe('1.2676506e+30');
    expect(answer('scientific-calculator', { expr: '1/3' })).toBe('0.333333333333');
  });
  it('explains an error instead of showing a wrong answer', () => {
    expect(run('scientific-calculator', { expr: '1/0' }).error).toMatch(/zero/);
    expect(run('scientific-calculator', { expr: '(1+2' }).error).toMatch(/bracket/);
    expect(run('scientific-calculator', { expr: 'sqrt(-4)' }).error).toMatch(/real number/);
    expect(run('scientific-calculator', { expr: '' }).error).toBeTruthy();
  });
});

describe('countdown timer', () => {
  afterEach(() => vi.useRealTimers());
  const at = (y: number, m0: number, d: number, h = 0, min = 0) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(y, m0, d, h, min)); // the visitor's own clock, local time
  };
  it('counts days, hours and minutes to the start of the target day', () => {
    at(2026, 11, 1, 12, 0); // 1 Dec 2026, noon
    const r = run('countdown-timer', { target: '2027-01-01' });
    expect(r.error).toBeUndefined();
    expect(r.metrics.find((m) => m.label === 'Time left')!.value).toBe('30 days 12 hours 0 minutes');
    expect(r.metrics.find((m) => m.label === 'Weeks and days')!.value).toBe('4 weeks 2 days');
  });
  it('says how long ago a past date was, and rejects a bad date', () => {
    at(2026, 11, 10, 9, 0);
    expect(run('countdown-timer', { target: '2026-12-01' }).metrics[0]!.value).toBe('10 days ago');
    expect(run('countdown-timer', { target: 'not a date' }).error).toBeTruthy();
  });
});

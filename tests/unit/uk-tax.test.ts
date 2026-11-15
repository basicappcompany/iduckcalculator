import { describe, expect, it } from 'vitest';
import { calcBySlug, defaultValues } from '../../src/lib/calc';
import { UK_BANDS, ukIncomeTax, ukNationalInsurance, ukPersonalAllowance } from '../../src/lib/calc/defs/uk-tax';
import type { Values } from '../../src/lib/calc/types';

/**
 * Known answers for the UK calculators, worked by hand from the GOV.UK figures read on 2026-11-15 (Income Tax rates and Personal
 * Allowances, Income Tax in Scotland, rates and thresholds for employers 2026 to 2027).
 */
const run = (slug: string, over: Values) => {
  const def = calcBySlug(slug)!;
  const r = def.compute({ ...defaultValues(def), ...over });
  expect(r.error).toBeUndefined();
  return r;
};
const metric = (slug: string, over: Values, label: string): number => Number(run(slug, over).metrics.find((m) => m.label.startsWith(label))!.value);

describe('UK Income Tax', () => {
  it('the band limits are the printed income limits minus the £12,570 allowance', () => {
    // England etc.: basic to £50,270, higher to £125,140. Scotland: starter £16,537, basic £29,526, intermediate £43,662, higher £75,000, advanced £125,140.
    expect(UK_BANDS.eng.map((b) => b[0])).toEqual([50_270 - 12_570, 125_140, Infinity]);
    expect(UK_BANDS.sco.map((b) => b[0])).toEqual([16_537 - 12_570, 29_526 - 12_570, 43_662 - 12_570, 75_000 - 12_570, 125_140, Infinity]);
    expect(UK_BANDS.eng.map((b) => b[1])).toEqual([0.2, 0.4, 0.45]);
    expect(UK_BANDS.sco.map((b) => b[1])).toEqual([0.19, 0.2, 0.21, 0.42, 0.45, 0.48]);
  });

  it('the Personal Allowance is £12,570, drops £1 for every £2 above £100,000 and is nil from £125,140', () => {
    expect(ukPersonalAllowance(50_000)).toBe(12_570);
    expect(ukPersonalAllowance(100_000)).toBe(12_570);
    expect(ukPersonalAllowance(110_000)).toBe(7_570);
    expect(ukPersonalAllowance(125_140)).toBe(0);
    expect(ukPersonalAllowance(200_000)).toBe(0);
  });

  it('England on £50,000 pays £7,486 (the worked example)', () => {
    const r = ukIncomeTax({ income: 50_000, region: 'eng' });
    expect(r.taxable).toBe(37_430);
    expect(r.tax).toBeCloseTo(7_486, 6);
    expect(r.marginal).toBe(0.2);
  });

  it('no tax up to the allowance, a band boundary at £50,270 and the higher rate above it', () => {
    expect(ukIncomeTax({ income: 12_570, region: 'eng' }).tax).toBe(0);
    expect(ukIncomeTax({ income: 12_570, region: 'eng' }).marginal).toBe(0);
    expect(ukIncomeTax({ income: 50_270, region: 'eng' }).tax).toBeCloseTo(7_540, 6);
    expect(ukIncomeTax({ income: 60_270, region: 'eng' }).tax).toBeCloseTo(7_540 + 4_000, 6);
  });

  it('£110,000 pays £33,432 and each extra pound is taxed at an effective 60%', () => {
    const r = ukIncomeTax({ income: 110_000, region: 'eng' });
    expect(r.taxable).toBe(102_430);
    expect(r.tax).toBeCloseTo(7_540 + 64_730 * 0.4, 6);
    expect(r.marginal).toBeCloseTo(0.6, 10);
    const more = ukIncomeTax({ income: 110_100, region: 'eng' }).tax - r.tax;
    expect(more).toBeCloseTo(60, 6);
  });

  it('£125,140 and above: no allowance, the 45% rate starts above £125,140 of taxable income', () => {
    expect(ukIncomeTax({ income: 125_140, region: 'eng' }).tax).toBeCloseTo(7_540 + (125_140 - 37_700) * 0.4, 6);
    expect(ukIncomeTax({ income: 150_000, region: 'eng' }).tax).toBeCloseTo(7_540 + (125_140 - 37_700) * 0.4 + (150_000 - 125_140) * 0.45, 6);
    expect(ukIncomeTax({ income: 150_000, region: 'eng' }).marginal).toBe(0.45);
  });

  it('Scotland on £50,000 pays £8,982.05', () => {
    const r = ukIncomeTax({ income: 50_000, region: 'sco' });
    expect(r.bands.map((b) => [b.rate, b.income])).toEqual([[0.19, 3_967], [0.2, 12_989], [0.21, 14_136], [0.42, 6_338]]);
    expect(r.tax).toBeCloseTo(753.73 + 2_597.8 + 2_968.56 + 2_661.96, 6);
    expect(r.tax).toBeCloseTo(8_982.05, 6);
    expect(r.marginal).toBe(0.42);
  });

  it('the calculator page reports the same figures', () => {
    expect(metric('uk-income-tax-calculator', {}, 'Income Tax')).toBeCloseTo(7_486, 6);
    expect(metric('uk-income-tax-calculator', {}, 'Taxable income')).toBe(37_430);
    expect(metric('uk-income-tax-calculator', {}, 'Effective tax rate')).toBeCloseTo(14.972, 3);
    expect(metric('uk-income-tax-calculator', {}, 'Personal Allowance')).toBe(12_570);
    expect(metric('uk-income-tax-calculator', { region: 'sco' }, 'Income Tax')).toBeCloseTo(8_982.05, 6);
    expect(run('uk-income-tax-calculator', {}).table?.rows).toHaveLength(1);
    expect(run('uk-income-tax-calculator', { income: 0 }).table).toBeUndefined();
    const def = calcBySlug('uk-income-tax-calculator')!;
    expect(def.compute({ ...defaultValues(def), income: -1 }).error).toBeTruthy();
  });
});

describe('UK National Insurance and take-home pay', () => {
  it('8% from £12,570 to £50,270 and 2% above', () => {
    expect(ukNationalInsurance(12_570).total).toBe(0);
    expect(ukNationalInsurance(10_000).total).toBe(0);
    expect(ukNationalInsurance(50_000).total).toBeCloseTo(2_994.4, 6);
    expect(ukNationalInsurance(50_270).total).toBeCloseTo(3_016, 6);
    expect(ukNationalInsurance(110_000).total).toBeCloseTo(3_016 + 59_730 * 0.02, 6);
  });

  it('England on £50,000 takes home £39,519.60 a year, £3,293.30 a month (the worked example)', () => {
    expect(metric('uk-take-home-pay-calculator', {}, 'Take-home pay per year')).toBeCloseTo(39_519.6, 6);
    expect(metric('uk-take-home-pay-calculator', {}, 'Take-home pay per month')).toBeCloseTo(3_293.3, 6);
    expect(metric('uk-take-home-pay-calculator', {}, 'Income Tax')).toBeCloseTo(7_486, 6);
    expect(metric('uk-take-home-pay-calculator', {}, 'National Insurance')).toBeCloseTo(2_994.4, 6);
    expect(metric('uk-take-home-pay-calculator', {}, 'Share of your pay')).toBeCloseTo(79.0392, 3);
  });

  it('Scotland takes home less on £50,000 and the table adds up', () => {
    expect(metric('uk-take-home-pay-calculator', { region: 'sco' }, 'Take-home pay per year')).toBeCloseTo(50_000 - 8_982.05 - 2_994.4, 6);
    const rows = run('uk-take-home-pay-calculator', { salary: 110_000 }).table!.rows;
    const yearly = rows.map((r) => Number(r[1]));
    expect(yearly[0]! + yearly[1]! + yearly[2]! + yearly[3]!).toBeCloseTo(yearly[4]!, 6);
  });
});

describe('UK pages use pounds whatever the visitor chose in Settings', () => {
  it('both calculators pin GBP and are marked as UK', () => {
    for (const slug of ['uk-income-tax-calculator', 'uk-take-home-pay-calculator']) {
      const def = calcBySlug(slug)!;
      expect(def.country).toBe('uk');
      expect(def.currency).toBe('GBP');
      expect(def.rules?.sources.length).toBeGreaterThan(1);
      expect(def.rules?.asOf).toBe('2026-11-15');
    }
  });
});

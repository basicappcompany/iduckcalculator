import { describe, expect, it } from 'vitest';
import { calcBySlug, defaultValues } from '../../src/lib/calc';
import { ALV_EMPLOYEE_RATE, BBG_KV_PV, BBG_RV_ALV, KV_BASE_EMPLOYEE_RATE, PV_EMPLOYEE_RATE, RV_EMPLOYEE_RATE, dePayroll, pvRate, type DeTaxClass } from '../../src/lib/calc/defs/de-payroll';
import type { Values } from '../../src/lib/calc/types';

/**
 * Known answers for the Germany take-home pay calculator: the "Allgemeine maschinelle Jahreslohnsteuer 2026 (Prüftabelle)" printed on page 39
 * of the BMF Programmablaufplan 2026 (Anlage 1, Stand 12.11.2025, endgültig), read on 2026-11-24. The BMF computed it with ALV, KRV and
 * PKV = 0 (statutory insurance), KVZ = 2.90, PVZ = 1 in every tax class except II (where PVZ = 0), no allowances. Columns: gross salary per
 * year, then the annual wage tax in tax classes I, II, III, IV, V and VI, in whole euros.
 */
export const GENERAL_TABLE: readonly (readonly number[])[] = [
  [5000, 0, 0, 0, 0, 372, 558],
  [7500, 0, 0, 0, 0, 647, 838],
  [10000, 0, 0, 0, 0, 922, 1117],
  [12500, 0, 0, 0, 0, 1197, 1397],
  [15000, 0, 0, 0, 0, 1472, 1676],
  [17500, 51, 0, 0, 51, 1778, 1956],
  [20000, 380, 0, 0, 380, 2234, 2766],
  [22500, 782, 32, 0, 782, 3073, 3604],
  [25000, 1251, 359, 0, 1251, 3911, 4443],
  [27500, 1742, 759, 0, 1742, 4749, 5281],
  [30000, 2248, 1230, 0, 2248, 5588, 6120],
  [32500, 2767, 1724, 0, 2767, 6426, 6952],
  [35000, 3300, 2233, 294, 3300, 7216, 7682],
  [37500, 3847, 2756, 628, 3847, 7954, 8436],
  [40000, 4407, 3293, 1000, 4407, 8720, 9218],
  [42500, 4982, 3843, 1406, 4982, 9512, 10030],
  [45000, 5570, 4408, 1850, 5570, 10334, 10865],
  [47500, 6172, 4987, 2324, 6172, 11171, 11703],
  [50000, 6788, 5580, 2810, 6788, 12010, 12542],
  [52500, 7417, 6186, 3302, 7417, 12848, 13380],
  [55000, 8060, 6807, 3802, 8060, 13687, 14218],
  [57500, 8718, 7442, 4308, 8718, 14525, 15057],
  [60000, 9389, 8091, 4822, 9389, 15364, 15895],
  [62500, 10073, 8754, 5342, 10073, 16202, 16734],
  [65000, 10772, 9430, 5870, 10772, 17040, 17572],
  [67500, 11484, 10121, 6402, 11484, 17879, 18410],
  [70000, 12220, 10835, 6952, 12220, 18729, 19260],
  [72500, 13062, 11647, 7574, 13062, 19681, 20213],
  [75000, 13922, 12476, 8206, 13922, 20633, 21165],
  [77500, 14799, 13323, 8846, 14799, 21585, 22117],
  [80000, 15694, 14188, 9496, 15694, 22538, 23070],
  [82500, 16607, 15071, 10154, 16607, 23490, 24022],
  [85000, 17538, 15971, 10822, 17538, 24443, 24974],
  [87500, 18486, 16890, 11498, 18486, 25395, 25927],
  [90000, 19438, 17826, 12182, 19438, 26347, 26879],
  [92500, 20390, 18777, 12876, 20390, 27300, 27831],
  [95000, 21343, 19729, 13580, 21343, 28252, 28784],
  [97500, 22295, 20682, 14292, 22295, 29204, 29736],
  [100000, 23248, 21634, 15012, 23248, 30157, 30689],
  [102500, 24243, 22629, 15774, 24243, 31152, 31684],
  [105000, 25293, 23679, 16590, 25293, 32202, 32734],
  [107500, 26343, 24729, 17416, 26343, 33252, 33784],
  [110000, 27393, 25779, 18252, 27393, 34302, 34834],
];

describe('Germany payroll: the BMF check table for 2026 (tax classes I to VI)', () => {
  const classes: DeTaxClass[] = [1, 2, 3, 4, 5, 6];
  for (const row of GENERAL_TABLE) {
    it(`gross ${row[0]}: wage tax in every class matches the BMF table`, () => {
      const got = classes.map((taxClass) => dePayroll({ gross: row[0]!, taxClass, children: taxClass === 2 ? 1 : 0, kvAdditional: 2.9, saxony: false }).wageTax);
      expect(got).toEqual(row.slice(1));
    });
  }
});

describe('Germany payroll: contributions, Solidarity Surcharge and the calculator', () => {
  const base = { children: 0, kvAdditional: 2.9, saxony: false } as const;

  it('the contribution rates and ceilings are the 2026 figures the plan states', () => {
    expect([BBG_RV_ALV, BBG_KV_PV]).toEqual([101_400, 69_750]);
    expect([RV_EMPLOYEE_RATE, ALV_EMPLOYEE_RATE, KV_BASE_EMPLOYEE_RATE, PV_EMPLOYEE_RATE]).toEqual([0.093, 0.013, 0.07, 0.018]);
  });

  it('care insurance: childless surcharge, discount from the second child up to the fifth, Saxony', () => {
    expect(pvRate(0, false)).toBeCloseTo(0.024, 10);
    expect(pvRate(1, false)).toBeCloseTo(0.018, 10);
    expect(pvRate(2, false)).toBeCloseTo(0.0155, 10);
    expect(pvRate(5, false)).toBeCloseTo(0.008, 10);
    expect(pvRate(9, false)).toBeCloseTo(0.008, 10); // the discount stops at the fifth child
    expect(pvRate(0, true)).toBeCloseTo(0.029, 10);
    expect(pvRate(1, true)).toBeCloseTo(0.023, 10);
  });

  it('works out €60,000 in tax class I by hand', () => {
    const p = dePayroll({ gross: 60_000, taxClass: 1, ...base });
    expect([p.pension, p.unemployment, p.health, p.care]).toEqual([5_580, 780, 5_070, 1_440]);
    expect(p.vsp).toBe(12_090); // 5,580 + 60,000 × (0.0845 + 0.024)
    expect(p.zve).toBe(46_644); // 60,000 − 1,230 − 36 − 12,090
    expect([p.wageTax, p.soli, p.net]).toEqual([9_389, 0, 37_741]);
  });

  it('cuts the health and care base at 69,750 and the pension and unemployment base at 101,400', () => {
    const p = dePayroll({ gross: 150_000, taxClass: 1, ...base });
    expect(p.health).toBeCloseTo(5_893.88, 2); // 69,750 × 0.0845
    expect(p.care).toBe(1_674); // 69,750 × 0.024
    expect(p.pension).toBeCloseTo(9_430.2, 2); // 101,400 × 0.093
    expect(p.unemployment).toBeCloseTo(1_318.2, 2); // 101,400 × 0.013
  });

  it('Solidarity Surcharge: nil below the limit, phased in above it, 5.5% beyond that, and a doubled limit in class III', () => {
    expect(dePayroll({ gross: 60_000, taxClass: 1, ...base }).soli).toBe(0);
    // wage tax 23,248 → 11.9% × (23,248 − 20,350) = 344.86 is lower than 5.5% × 23,248 = 1,278.64
    expect(dePayroll({ gross: 100_000, taxClass: 1, ...base }).soli).toBe(344.86);
    // wage tax 44,193 → 5.5% = 2,430.615, cents cut off
    expect(dePayroll({ gross: 150_000, taxClass: 1, ...base }).soli).toBe(2_430.61);
    // class III at 150,000 is taxed on half and doubled: its limit is 40,700
    const c3 = dePayroll({ gross: 150_000, taxClass: 3, ...base });
    expect(c3.soli).toBeLessThan(0.055 * c3.wageTax);
    expect(dePayroll({ gross: 100_000, taxClass: 3, ...base }).soli).toBe(0);
  });

  it('no pay, no deductions', () => {
    const p = dePayroll({ gross: 0, taxClass: 1, ...base });
    expect([p.wageTax, p.soli, p.social, p.net]).toEqual([0, 0, 0, 0]);
  });

  it('the calculator page gives the same answer and names each deduction', () => {
    const def = calcBySlug('de-take-home-pay-calculator')!;
    const r = def.compute({ ...defaultValues(def) });
    expect(r.error).toBeUndefined();
    const m = (label: string) => Number(r.metrics.find((x) => x.label.startsWith(label))!.value);
    expect(m('Take-home pay per year')).toBe(37_741);
    expect(m('Take-home pay per month')).toBeCloseTo(3_145.08, 2);
    expect(m('Wage tax')).toBe(9_389);
    expect(m('Social insurance')).toBe(12_870);
    expect(m('Share of your pay')).toBeCloseTo(62.9, 1);
    expect(r.table!.rows.map((row) => row[0])).toEqual(['Gross pay', 'Wage tax', 'Solidarity surcharge', 'Pension insurance', 'Unemployment insurance', 'Health insurance', 'Care insurance', 'Take-home pay']);
  });

  it('the calculator takes the tax class, children, health rate and Saxony into account, and rejects bad input', () => {
    const def = calcBySlug('de-take-home-pay-calculator')!;
    const net = (over: Values) => Number(def.compute({ ...defaultValues(def), ...over }).metrics[0]!.value);
    expect(net({ taxClass: '3' })).toBe(42_308);
    expect(net({ taxClass: '5' })).toBeLessThan(net({ taxClass: '1' }));
    expect(net({ saxony: 'yes' })).toBe(37_543); // care 2.9% instead of 2.4%
    expect(net({ children: 2 })).toBe(38_078);
    expect(net({ kv: 1.5 })).toBeGreaterThan(net({ kv: 2.9 }));
    expect(def.compute({ ...defaultValues(def), salary: -1 }).error).toBeTruthy();
    expect(def.compute({ ...defaultValues(def), kv: 9 }).error).toBeTruthy();
  });
});

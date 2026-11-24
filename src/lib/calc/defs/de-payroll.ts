import { fail, n, num, s, sel, type CalcDef, type Result } from '../types';
import type { RulesInfo } from '../types';
import { SOLI_LIMIT_SINGLE, SOLI_PHASE_IN_RATE, SOLI_RATE, deTariffTax } from './de-tax';

/**
 * Germany, take-home pay (Nettolohn) for an employee, tax year 2026. The wage tax (Lohnsteuer) is worked out the way a payslip does it:
 * the BMF "Programmablaufplan für die maschinelle Berechnung der vom Arbeitslohn einzubehaltenden Lohnsteuer ... für 2026" (Anlage 1 to the
 * BMF letter of 12 November 2025, "Stand: 12.11.2025 (endgültig)"), read on `DE_PAYROLL_READ_ON`. It is NOT the annual assessment of
 * `de-tax.ts`: the payroll method deducts a "Vorsorgepauschale" (a flat estimate of the employee's social insurance) instead of the real
 * contributions, and has its own tax class rules. The tariff itself (§ 32a EStG) is the one in `de-tax.ts`.
 *
 * Covered: an employee paid a salary, tax classes I to VI, statutory health and care insurance with the employee's half of the
 * contributions, pension and unemployment insurance, the Solidarity Surcharge. Left out and said on the page: church tax, child
 * allowances (they only change the Solidarity Surcharge and church tax), private health insurance, pension income, the age relief,
 * allowances entered on the tax card (Freibetrag), one-off payments (bonuses), the Midijob transition zone, short-term and other
 * special employment.
 * Each autumn the BMF publishes the next year's plan: re-read it, change the numbers below, bump the date, and re-check
 * tests/unit/de-payroll.test.ts, which holds the check tables printed at the end of the plan (annual wage tax 2026, tax classes I to VI).
 */
export const DE_PAYROLL_YEAR = 'Tax year 2026 (1 January to 31 December 2026)';
export const DE_PAYROLL_READ_ON = '2026-11-24';

const PAP_2026 = {
  name: 'Bundesministerium der Finanzen: Programmablaufplan für den Lohnsteuerabzug 2026 (Anlage 1, Stand 12.11.2025, endgültig)',
  url: 'https://www.ihk-muenchen.de/ihk/documents/Recht-Steuern/Steuerrecht/Einkommensteuer/2025-11-12-PAP-2026-anlage-1.pdf',
};
const BEITRAGSGRENZEN = { name: 'Bundesregierung: Beitragsbemessungsgrenzen 2026', url: 'https://www.bundesregierung.de/breg-de/aktuelles/beitragsgemessungsgrenzen-2386514' };
const KV_ZUSATZ = { name: 'Bundesministerium für Gesundheit: Beiträge der gesetzlichen Krankenversicherung (14,6 % und durchschnittlicher Zusatzbeitragssatz)', url: 'https://www.bundesgesundheitsministerium.de/beitraege' };

export const DE_TAKE_HOME_RULES: RulesInfo = { year: DE_PAYROLL_YEAR, asOf: DE_PAYROLL_READ_ON, sources: [PAP_2026, BEITRAGSGRENZEN, KV_ZUSATZ] };

/** Figures set in the 2026 plan (section 5, "MPARA") and in the plan's own text; the contribution ceilings are in euros per year. */
export const BBG_RV_ALV = 101_400; // pension and unemployment insurance ceiling
export const BBG_KV_PV = 69_750; // health and care insurance ceiling
export const RV_EMPLOYEE_RATE = 0.093; // half of 18.6%
export const ALV_EMPLOYEE_RATE = 0.013; // half of 2.6%
export const KV_BASE_EMPLOYEE_RATE = 0.07; // half of the 14.6% general rate
export const PV_EMPLOYEE_RATE = 0.018; // half of 3.6%
export const PV_EMPLOYEE_RATE_SAXONY = 0.023; // in Saxony the employee pays more of the care insurance
export const PV_CHILDLESS_SURCHARGE = 0.006; // paid by the employee alone
export const PV_CHILD_DISCOUNT = 0.0025; // per child from the second to the fifth
export const DEFAULT_KV_ADDITIONAL = 2.9; // average additional contribution 2026, in percent (the full rate; the employee pays half)
const EMPLOYEE_ALLOWANCE = 1_230; // Arbeitnehmer-Pauschbetrag
const SPECIAL_EXPENSES_FLAT = 36; // Sonderausgaben-Pauschbetrag
const SINGLE_PARENT_RELIEF = 4_260; // Entlastungsbetrag für Alleinerziehende (tax class II)
const VSP_UNEMPLOYMENT_CAP = 1_900; // the cap in the Höchstbetragsberechnung
/** Limits for tax classes V and VI (W1STKL5, W2STKL5, W3STKL5). */
const W1 = 14_071;
const W2 = 34_939;
const W3 = 222_260;

export type DeTaxClass = 1 | 2 | 3 | 4 | 5 | 6;
export const DE_TAX_CLASSES: readonly DeTaxClass[] = [1, 2, 3, 4, 5, 6];
export const asTaxClass = (v: string): DeTaxClass => {
  const c = Math.round(Number(v));
  return (c >= 1 && c <= 6 ? c : 1) as DeTaxClass;
};

export interface DePayrollInput {
  /** Gross salary for the year in euros. */
  gross: number;
  taxClass: DeTaxClass;
  /** Number of children under 25 (care insurance only): 0 means the childless surcharge applies. */
  children: number;
  /** The health fund's full additional contribution in percent, e.g. 2.9. */
  kvAdditional: number;
  saxony: boolean;
}

export interface DePayroll {
  gross: number;
  taxClass: DeTaxClass;
  /** Vorsorgepauschale: the flat social insurance allowance the payroll method deducts, in euros. */
  vsp: number;
  /** Taxable amount the tariff is applied to (ZVE), in euros. */
  zve: number;
  /** Annual wage tax (LSTJAHR) in whole euros. */
  wageTax: number;
  /** Annual Solidarity Surcharge in euros and cents. */
  soli: number;
  pension: number;
  unemployment: number;
  health: number;
  care: number;
  /** All social insurance contributions of the employee. */
  social: number;
  net: number;
}

const r2 = (x: number): number => Math.round(x * 100) / 100;

/** Care insurance rate of the employee (PVSATZAN): Saxony or not, the childless surcharge (PVZ) or the discount from the second child (PVA). */
export function pvRate(children: number, saxony: boolean): number {
  const base = saxony ? PV_EMPLOYEE_RATE_SAXONY : PV_EMPLOYEE_RATE;
  if (children <= 0) return base + PV_CHILDLESS_SURCHARGE;
  const pva = Math.min(Math.max(Math.floor(children) - 1, 0), 4);
  return base - pva * PV_CHILD_DISCOUNT;
}

/** The tax for classes V and VI (MST5-6), which works on the tariff at 1.25 and 0.75 times the amount and then at fixed rates above limits. */
function tariffClass56(zzx: number): number {
  const up56 = (zx: number): number => {
    const st1 = deTariffTax(Math.floor(zx * 1.25));
    const st2 = deTariffTax(Math.floor(zx * 0.75));
    const diff = (st1 - st2) * 2;
    const mist = Math.floor(zx * 0.14);
    return mist > diff ? mist : diff;
  };
  if (zzx > W2) {
    let st = up56(W2);
    if (zzx > W3) {
      st += Math.floor((W3 - W2) * 0.42);
      st += Math.floor((zzx - W3) * 0.45);
    } else {
      st += Math.floor((zzx - W2) * 0.42);
    }
    return st;
  }
  let st = up56(zzx);
  if (zzx > W1) {
    const vergl = st;
    const hoch = up56(W1) + Math.floor((zzx - W1) * 0.42);
    st = hoch < vergl ? hoch : vergl;
  }
  return st;
}

/**
 * Annual wage tax and contributions as the BMF plan computes them for the whole year (LZZ = 1), for a statutory-insured employee without
 * allowances on the tax card (KRV = 0, ALV = 0, PKV = 0, F = 1, no pension income, under 64).
 */
export function dePayroll(i: DePayrollInput): DePayroll {
  const gross = Math.max(0, Math.round(i.gross * 100) / 100);
  const taxClass = i.taxClass;
  const zre4 = gross;

  // MZTABFB: the fixed allowances (without the Vorsorgepauschale)
  const anp = taxClass === 6 ? 0 : Math.min(zre4, EMPLOYEE_ALLOWANCE);
  const sap = taxClass === 6 ? 0 : SPECIAL_EXPENSES_FLAT;
  const efa = taxClass === 2 ? SINGLE_PARENT_RELIEF : 0;
  const kztab = taxClass === 3 ? 2 : 1;
  const ztabfb = efa + anp + sap;

  // MPARA rates
  const kvRate = i.kvAdditional / 2 / 100 + KV_BASE_EMPLOYEE_RATE;
  const pv = pvRate(i.children, i.saxony);

  // UPEVP: Vorsorgepauschale
  const rvBase = Math.min(zre4, BBG_RV_ALV);
  const kvBase = Math.min(zre4, BBG_KV_PV);
  const vspR = rvBase * RV_EMPLOYEE_RATE;
  const vspKvPv = Math.max(0, kvBase * (kvRate + pv));
  let vsp = vspKvPv + vspR;
  if (taxClass !== 6) {
    const vspAlv = ALV_EMPLOYEE_RATE * rvBase;
    const vsphb = Math.min(vspAlv + vspKvPv, VSP_UNEMPLOYMENT_CAP);
    const vspn = vspR + vsphb;
    if (vspn > vsp) vsp = vspn;
  }
  // The plan rounds the Vorsorgepauschale up to a whole euro; the micro-euro rounding stops 8,060.000000000001 from becoming 8,061.
  vsp = Math.ceil(Math.round(vsp * 1e6) / 1e6);

  // MLSTJAHR / UPMLST: taxable amount and tariff
  const zveRaw = zre4 - ztabfb - vsp;
  const zve = zveRaw < 1 ? 0 : zveRaw;
  const x = zve < 1 ? 0 : Math.floor(zve / kztab);
  const wageTax = taxClass >= 5 ? tariffClass56(x) : deTariffTax(x) * kztab;

  // MSOLZ: Solidarity Surcharge on the annual wage tax (no child allowances, so JBMG = LSTJAHR)
  const limit = SOLI_LIMIT_SINGLE * kztab;
  let soli = 0;
  if (wageTax > limit) {
    const full = Math.floor(wageTax * SOLI_RATE * 100) / 100;
    const phased = (wageTax - limit) * SOLI_PHASE_IN_RATE;
    soli = Math.min(full, phased);
    soli = Math.floor(soli * 100) / 100;
  }

  // The employee's actual contributions
  const pension = r2(rvBase * RV_EMPLOYEE_RATE);
  const unemployment = r2(rvBase * ALV_EMPLOYEE_RATE);
  const health = r2(kvBase * kvRate);
  const care = r2(kvBase * pv);
  const social = r2(pension + unemployment + health + care);
  const net = r2(gross - wageTax - soli - social);
  return { gross, taxClass, vsp, zve, wageTax, soli, pension, unemployment, health, care, social, net };
}

const minus = (x: number): number => (x === 0 ? 0 : -x);

const TAX_CLASS_FIELD = sel(
  'taxClass',
  'Tax class (Steuerklasse)',
  '1',
  [
    ['1', 'I: single, divorced or widowed'],
    ['2', 'II: single parent'],
    ['3', 'III: married, the partner is in class V or has no income'],
    ['4', 'IV: married, both earn about the same'],
    ['5', 'V: married, the partner is in class III'],
    ['6', 'VI: a second or further job'],
  ],
  'Your tax class is on your payslip and on your ELStAM tax data. Class II includes the €4,260 relief for single parents.',
);

export const DE_PAYROLL: CalcDef[] = [
  {
    slug: 'de-take-home-pay-calculator',
    country: 'de',
    currency: 'EUR',
    name: 'Germany take-home pay calculator 2026',
    group: 'tax',
    emoji: '💶',
    summary: 'Net salary in Germany for 2026 after wage tax, the Solidarity Surcharge and the employee share of social insurance, per year and per month, for tax classes I to VI.',
    quick: 'Enter your gross salary and tax class. On €60,000 in tax class I, with no children, you pay €9,389 of wage tax and €12,870 of social insurance, leaving €37,741 a year, or €3,145 a month.',
    keywords: 'germany take home pay calculator 2026 net salary brutto netto gehaltsrechner lohnsteuer steuerklasse social insurance health pension unemployment care insurance solidarity surcharge',
    title: 'Germany Take-Home Pay Calculator 2026',
    description: 'Free Germany take-home pay calculator for 2026: net salary after wage tax and social insurance, tax classes I to VI, per year and month, from BMF rules.',
    fields: [
      num('salary', 'Gross salary per year', 60000, { unit: 'money', min: 0, step: 1000, hint: 'Your pay for the year before tax and social insurance (Brutto), as a regular salary. Bonuses and other one-off payments are not treated separately.' }),
      TAX_CLASS_FIELD,
      num('children', 'Children under 25', 0, { unit: 'number', min: 0, max: 10, step: 1, hint: 'Only used for the care insurance: with no children you pay a 0.6% surcharge, and from the second child the rate falls by 0.25 points for each child up to the fifth. Child allowances are not applied.' }),
      num('kv', 'Health fund additional contribution', DEFAULT_KV_ADDITIONAL, { unit: 'percent', min: 0, max: 6, step: 0.1, hint: 'The full additional contribution of your statutory health fund (you pay half of it). 2.9% is the 2026 average that the Federal Ministry of Health publishes; your fund may differ.' }),
      sel('saxony', 'Do you work in Saxony?', 'no', [['no', 'No'], ['yes', 'Yes']], 'In Saxony employees pay a larger share of the care insurance (2.3% instead of 1.8%).'),
    ],
    compute: (v) => {
      const salary = n(v, 'salary');
      if (salary < 0) return fail('Enter an amount of 0 or more.');
      const kv = n(v, 'kv');
      if (kv < 0 || kv > 6) return fail('Enter the additional contribution as a percentage between 0 and 6.');
      const children = Math.max(0, Math.floor(n(v, 'children')));
      const p = dePayroll({ gross: salary, taxClass: asTaxClass(s(v, 'taxClass')), children, kvAdditional: kv, saxony: s(v, 'saxony') === 'yes' });
      const result: Result = {
        metrics: [
          { label: 'Take-home pay per year', value: p.net, kind: 'money', decimals: 0, big: true },
          { label: 'Take-home pay per month', value: p.net / 12, kind: 'money', decimals: 0 },
          { label: 'Wage tax', value: p.wageTax, kind: 'money', decimals: 0 },
          { label: 'Solidarity surcharge', value: p.soli, kind: 'money', decimals: 0 },
          { label: 'Social insurance contributions', value: p.social, kind: 'money', decimals: 0 },
          { label: 'Share of your pay you keep', value: p.gross > 0 ? (p.net / p.gross) * 100 : 0, kind: 'percent', decimals: 2 },
        ],
        table: {
          title: 'Where your pay goes',
          columns: ['Item', 'Per year', 'Per month'],
          kinds: ['text', 'money', 'money'],
          rows: [
            ['Gross pay', p.gross, p.gross / 12],
            ['Wage tax', minus(p.wageTax), minus(p.wageTax / 12)],
            ['Solidarity surcharge', minus(p.soli), minus(p.soli / 12)],
            ['Pension insurance', minus(p.pension), minus(p.pension / 12)],
            ['Unemployment insurance', minus(p.unemployment), minus(p.unemployment / 12)],
            ['Health insurance', minus(p.health), minus(p.health / 12)],
            ['Care insurance', minus(p.care), minus(p.care / 12)],
            ['Take-home pay', p.net, p.net / 12],
          ],
        },
        note: 'For an employee with statutory health insurance, using the 2026 payroll method. Monthly figures are the yearly amounts divided by 12; a payslip rounds each month down to the cent. Church tax, child allowances, private health insurance, allowances on your tax card, bonuses and special employment such as mini jobs are not included.',
      };
      return result;
    },
    formula: [
      'Take-home pay = gross salary − wage tax − solidarity surcharge − your share of social insurance',
      'Wage tax follows the BMF payroll method for 2026: your gross salary less the €1,230 employee allowance, the €36 special-expenses flat amount and a flat estimate of your insurance contributions (the Vorsorgepauschale), rounded down to whole euros, then taxed with the § 32a tariff. Tax class III halves the amount and doubles the tax; classes V and VI use their own rule',
      'Pension 9.3% and unemployment 1.3% of salary up to €101,400 a year; health 7.0% plus half the additional contribution and care 1.8% (2.3% in Saxony, plus 0.6% if childless, less 0.25 points per child from the second) of salary up to €69,750 a year',
      'Solidarity surcharge = 5.5% of the wage tax, only when the wage tax is above €20,350 (€40,700 in class III), and never more than 11.9% of the amount above that limit',
      'Monthly figures are the yearly amounts divided by 12',
    ],
    example: 'On €60,000 in tax class I with no children, a 2.9% additional health contribution and outside Saxony: pension €5,580, unemployment €780, health €5,070 (8.45%) and care €1,440 (2.4%) make €12,870. The payroll method deducts a flat €12,090 estimate for insurance (€5,580 + €6,510), so the amount taxed is €60,000 − €1,230 − €36 − €12,090 = €46,644, which gives €9,389 of wage tax and no Solidarity Surcharge. You keep €60,000 − €9,389 − €12,870 = €37,741 a year, about €3,145 a month, which is 62.90% of your pay.',
    how: [
      'In Germany your employer takes wage tax and your half of the social insurance from every payslip. This calculator follows the method the Federal Ministry of Finance (BMF) publishes for employers in its Programmablaufplan: the same steps and the same tax classes, and it reproduces the ministry\'s own check table for 2026 in every tax class.',
      'Wage tax is not worked out on your real insurance contributions. The payroll method deducts a flat estimate of them (the Vorsorgepauschale) from your salary and then applies the § 32a income tax tariff, so the wage tax on your payslip can differ from the final income tax in your tax return. Enter your gross salary, your tax class and the number of children under 25 (for the care insurance), and the calculator gives your net pay per year and per month.',
      'The social insurance shares are pension 9.3%, unemployment 1.3%, health 7.0% plus half of your fund\'s additional contribution, and care insurance 1.8% (more in Saxony, more if you have no children, less from the second child). Pension and unemployment stop at €101,400 of salary, health and care at €69,750. Church tax, child allowances, private health insurance and allowances on your tax card are not included. The figures come from the BMF plan and the sources listed below, read on the date shown.',
    ],
    faqs: [
      { q: 'Will this match my payslip exactly?', a: 'Often within a few euros a month, but not always. Your payslip depends on your health fund\'s real additional contribution, church tax, allowances on your tax card, bonuses and other items this calculator does not include.' },
      { q: 'Why is wage tax different from the income tax calculator?', a: 'Wage tax is what your employer withholds during the year using the BMF payroll method, with a flat estimate for insurance. Income tax is the final tax on your tax return, worked out from your real deductions. The income tax calculator taxes a taxable income you enter.' },
      { q: 'Which tax class should I choose?', a: 'The one on your payslip: I for single people, II for single parents, III, IV or V for married couples (III and V together, or IV and IV) and VI for a second job. Class III halves your taxable amount; classes V and VI tax more at low pay.' },
      { q: 'Is church tax included?', a: 'No. Church tax is 8% or 9% of the wage tax depending on the state, and it lowers your take-home pay if you pay it.' },
      { q: 'Why do children change my pay?', a: 'Only through the care insurance here: with no children you pay a 0.6% surcharge, and from the second child under 25 the rate is 0.25 points lower per child. Child allowances change only the Solidarity Surcharge and church tax, so they are not applied.' },
      { q: 'What does the additional contribution mean?', a: 'Each statutory health fund charges its own additional contribution on top of the 14.6% general rate, and you pay half. The calculator uses the 2.9% average for 2026; change it to your fund\'s rate.' },
    ],
    related: ['de-income-tax-calculator', 'percentage-calculator', 'percentage-change-calculator'],
    rules: DE_TAKE_HOME_RULES,
  },
];

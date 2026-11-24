import { fail, n, num, s, sel, type CalcDef, type Result } from '../types';
import type { RulesInfo } from '../types';

/**
 * Germany, income tax (Einkommensteuer) and Solidarity Surcharge on taxable income, tax year 2026. Every figure below was read from the
 * official texts listed in `DE_SOURCES` on `DE_RULES_READ_ON` (the consolidated laws on gesetze-im-internet.de, which print the 2026
 * tariff: "ab dem Veranlagungszeitraum 2026"); nothing is typed from memory. The calculator taxes the taxable income (zu versteuerndes
 * Einkommen) it is given: it does not work out that income from a salary. Left out and said on the page: church tax, child allowances,
 * the progression clause, the Fünftelregelung and other special rules, capital income taxed at the flat rate.
 * Take-home pay (a payslip's Lohnsteuer follows the BMF Programmablaufplan, not this annual tariff) is a separate calculator.
 * Each autumn the new tariff is published (Grundfreibetrag and the formula zones change): re-read § 32a, change the numbers, bump the
 * date, and update tests/unit/de-tax.test.ts and the guide.
 */
export const DE_TAX_YEAR = 'Tax year 2026 (1 January to 31 December 2026)';
export const DE_RULES_READ_ON = '2026-11-23';

const EST_32A = { name: 'Einkommensteuergesetz (EStG) § 32a: Einkommensteuertarif', url: 'https://www.gesetze-im-internet.de/estg/__32a.html' };
const SOLZ_3 = { name: 'Solidaritätszuschlaggesetz 1995 § 3: Bemessungsgrundlage und zeitliche Anwendung', url: 'https://www.gesetze-im-internet.de/solzg_1995/__3.html' };
const SOLZ_4 = { name: 'Solidaritätszuschlaggesetz 1995 § 4: Zuschlagsatz', url: 'https://www.gesetze-im-internet.de/solzg_1995/__4.html' };

export const DE_INCOME_TAX_RULES: RulesInfo = { year: DE_TAX_YEAR, asOf: DE_RULES_READ_ON, sources: [EST_32A, SOLZ_3, SOLZ_4] };

/** § 32a (1) EStG, tariff from tax year 2026. The basic allowance (Grundfreibetrag) and the top of each formula zone, in whole euros. */
export const GRUNDFREIBETRAG = 12_348;
export const ZONE2_END = 17_799;
export const ZONE3_END = 69_878;
export const ZONE4_END = 277_825;

/**
 * Income tax from the § 32a (1) tariff for 2026. The taxable income is rounded down to a whole euro, and so is the tax (§ 32a (1) sentences 1 and 6).
 */
export function deTariffTax(taxableIncome: number): number {
  const x = Math.floor(taxableIncome);
  if (x <= GRUNDFREIBETRAG) return 0;
  let tax: number;
  if (x <= ZONE2_END) {
    const y = (x - GRUNDFREIBETRAG) / 10_000;
    tax = (914.51 * y + 1400) * y;
  } else if (x <= ZONE3_END) {
    const z = (x - ZONE2_END) / 10_000;
    tax = (173.1 * z + 2397) * z + 1034.87;
  } else if (x <= ZONE4_END) {
    tax = 0.42 * x - 11_135.63;
  } else {
    tax = 0.45 * x - 19_470.38;
  }
  return Math.floor(tax);
}

/** The rate on the next euro of taxable income (the slope of the § 32a formula), as a fraction, before the Solidarity Surcharge. */
export function deMarginalRate(taxableIncome: number): number {
  const x = Math.floor(taxableIncome);
  if (x <= GRUNDFREIBETRAG) return 0;
  if (x <= ZONE2_END) return (2 * 914.51 * ((x - GRUNDFREIBETRAG) / 10_000) + 1400) / 10_000;
  if (x <= ZONE3_END) return (2 * 173.1 * ((x - ZONE2_END) / 10_000) + 2397) / 10_000;
  return x <= ZONE4_END ? 0.42 : 0.45;
}

/** Assessment: 'single' uses the basic tariff, 'joint' the splitting tariff of § 32a (5): twice the tax on half the combined income. */
export type DeAssessment = 'single' | 'joint';
export const DE_ASSESSMENTS: readonly DeAssessment[] = ['single', 'joint'];
export const asAssessment = (v: string): DeAssessment => (v === 'joint' ? 'joint' : 'single');

export function deIncomeTax(taxableIncome: number, assessment: DeAssessment): number {
  const x = Math.floor(taxableIncome);
  return assessment === 'joint' ? 2 * deTariffTax(x / 2) : deTariffTax(x);
}

/** Solidarity Surcharge, § 3 (3) and § 4 SolzG: 5.5% of the income tax, only above the limit, and never more than 11.9% of the amount over it. Cents are cut off. */
export const SOLI_RATE = 0.055;
export const SOLI_PHASE_IN_RATE = 0.119;
export const SOLI_LIMIT_SINGLE = 20_350;
export const SOLI_LIMIT_JOINT = 40_700;
export function deSolidaritySurcharge(incomeTax: number, assessment: DeAssessment): number {
  const limit = assessment === 'joint' ? SOLI_LIMIT_JOINT : SOLI_LIMIT_SINGLE;
  if (incomeTax <= limit) return 0;
  return Math.floor(Math.min(SOLI_RATE * incomeTax, SOLI_PHASE_IN_RATE * (incomeTax - limit)) * 100) / 100;
}

export interface DeTax {
  taxable: number;
  incomeTax: number;
  soli: number;
  total: number;
  marginal: number;
}

export function deTax(taxableIncome: number, assessment: DeAssessment): DeTax {
  const taxable = Math.floor(taxableIncome);
  const incomeTax = deIncomeTax(taxable, assessment);
  const soli = deSolidaritySurcharge(incomeTax, assessment);
  const marginal = deMarginalRate(assessment === 'joint' ? taxable / 2 : taxable);
  return { taxable, incomeTax, soli, total: incomeTax + soli, marginal };
}

const ASSESSMENT_FIELD = sel(
  'status',
  'Assessment',
  'single',
  [
    ['single', 'Single (basic tariff)'],
    ['joint', 'Married, assessed together (splitting tariff)'],
  ],
  'Pick how you are assessed. For a married couple assessed together, enter your combined taxable income.',
);

export const DE_TAX: CalcDef[] = [
  {
    slug: 'de-income-tax-calculator',
    country: 'de',
    currency: 'EUR',
    name: 'Germany income tax calculator 2026',
    group: 'tax',
    emoji: '🇩🇪',
    summary: 'German income tax (Einkommensteuer) for 2026 on your taxable income, with the Solidarity Surcharge, for single people and couples assessed together.',
    quick: 'Enter your taxable income. A single person with €50,000 of taxable income owes €10,548 of income tax for 2026, an effective rate of 21.10%, and pays no Solidarity Surcharge.',
    keywords: 'germany income tax calculator 2026 einkommensteuer tariff grundfreibetrag solidarity surcharge solidaritaetszuschlag splitting tariff effective rate',
    title: 'Germany Income Tax Calculator 2026',
    description: 'Free Germany income tax calculator for 2026: Einkommensteuer from the § 32a tariff, the Solidarity Surcharge and your rates, for singles and couples.',
    fields: [
      num('income', 'Taxable income per year', 50000, { unit: 'money', min: 0, step: 1000, hint: 'Your taxable income for the year (zu versteuerndes Einkommen): income after deductions and allowances. Cents are cut off.' }),
      ASSESSMENT_FIELD,
    ],
    compute: (v) => {
      const income = n(v, 'income');
      if (income < 0) return fail('Enter an amount of 0 or more.');
      const a = asAssessment(s(v, 'status'));
      const r = deTax(income, a);
      const result: Result = {
        metrics: [
          { label: 'Income tax payable', value: r.incomeTax, kind: 'money', big: true },
          { label: 'Solidarity surcharge', value: r.soli, kind: 'money', decimals: 2 },
          { label: 'Total income tax and solidarity surcharge', value: r.total, kind: 'money', decimals: 2 },
          { label: 'Effective tax rate', value: r.taxable > 0 ? (r.total / r.taxable) * 100 : 0, kind: 'percent', decimals: 2 },
          { label: 'Income tax rate on your next euro', value: r.marginal * 100, kind: 'percent', decimals: 2 },
        ],
        note: 'Income tax for 2026 from the § 32a tariff, with the Solidarity Surcharge. The calculator taxes the taxable income you enter; it does not work out that income from a salary. Church tax, child allowances, the progression clause and special rules for one-off payments or capital income are not included.',
      };
      return result;
    },
    formula: [
      'Income tax = the § 32a formula applied to taxable income, rounded down to whole euros',
      'Nil up to €12,348 (the basic allowance); from €12,349 to €17,799: (914.51 × y + 1,400) × y, where y = (income − 12,348) ÷ 10,000',
      'From €17,800 to €69,878: (173.10 × z + 2,397) × z + 1,034.87, where z = (income − 17,799) ÷ 10,000',
      'From €69,879 to €277,825: 0.42 × income − 11,135.63; from €277,826: 0.45 × income − 19,470.38',
      'Couples assessed together (splitting tariff): twice the tax on half of their combined taxable income',
      'Solidarity surcharge = 5.5% of the income tax, only when the tax is above €20,350 (€40,700 for couples), and never more than 11.9% of the amount above that limit',
      'Effective rate = (income tax + solidarity surcharge) ÷ taxable income',
    ],
    example: 'Taxable income of €50,000, single: z = (50,000 − 17,799) ÷ 10,000 = 3.2201, so the tax is (173.10 × 3.2201 + 2,397) × 3.2201 + 1,034.87 = €10,548.33, which is rounded down to €10,548. The income tax is below €20,350, so there is no Solidarity Surcharge. The effective rate is 21.10%.',
    how: [
      'German income tax does not use fixed brackets. The tax rises smoothly along a formula: nothing up to the basic allowance of €12,348, then a rate that climbs from 14% to about 24%, then from about 24% to 42% in the next zone, then a flat 42%, and 45% on the very highest incomes. Enter your taxable income and the calculator applies the formula for 2026 and rounds down to whole euros, as the law says.',
      'On top of the income tax comes the Solidarity Surcharge of 5.5%. Since 2021 most people do not pay it: it applies only when the income tax is above €20,350 (€40,700 for couples assessed together), and it phases in gradually above that limit.',
      'Married couples assessed together use the splitting tariff: the combined taxable income is halved, taxed, and the tax doubled. Enter the combined income and choose the splitting tariff. The calculator taxes the taxable income you enter, which is your income after deductions and allowances. Church tax, child allowances and special rules are not included. The figures come from the German laws listed below, read on the date shown.',
    ],
    faqs: [
      { q: 'Which tax year is this?', a: 'Tax year 2026, from 1 January to 31 December 2026, reported on the return you file in 2027.' },
      { q: 'What is the basic allowance?', a: 'The Grundfreibetrag: up to €12,348 of taxable income, no income tax is due in 2026.' },
      { q: 'Is the Solidarity Surcharge included?', a: 'Yes. It is 5.5% of the income tax, but only when the income tax is above €20,350 (€40,700 for couples), phased in above that limit. Church tax is not included.' },
      { q: 'What is the difference between the basic and the splitting tariff?', a: 'Single people use the basic tariff. Married couples assessed together use the splitting tariff: twice the tax on half of their combined taxable income, which usually lowers the tax when the incomes differ.' },
      { q: 'Is this my take-home pay?', a: 'No. It taxes your taxable income. It leaves out social insurance contributions and the way a payslip calculates tax during the year, so it is not your net salary.' },
    ],
    related: ['de-take-home-pay-calculator', 'percentage-calculator', 'percentage-change-calculator'],
    rules: DE_INCOME_TAX_RULES,
  },
];

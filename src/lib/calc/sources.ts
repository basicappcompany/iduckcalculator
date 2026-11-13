import type { CalcDef } from './types';
import { GST_RULES, INCOME_TAX_RULES } from './defs/tax';

/**
 * Where each finance and health formula comes from, shown on the calculator and guide pages next to a "Last reviewed" date and an
 * "estimate only" line. Every link was checked to load when it was added (2026-11-13). The finance links are general references for the
 * standard formulas; they are not a lender's or a regulator's rulebook, and the page says so.
 */
export interface SourceRef {
  name: string;
  url: string;
}
export interface Trust {
  /** The kind of page: finance and health pages carry the strictest wording. */
  kind: 'finance' | 'health';
  /** One plain sentence on where the maths comes from. */
  basis: string;
  sources: SourceRef[];
}

/** The date the formulas, sources and wording of the finance and health pages were last checked. Bump it when you re-check them. */
export const LAST_REVIEWED = '2026-11-13';

const EMI: SourceRef = { name: 'Equated monthly instalment (reference)', url: 'https://en.wikipedia.org/wiki/Equated_monthly_installment' };
const COMPOUND: SourceRef = { name: 'Compound interest (reference)', url: 'https://en.wikipedia.org/wiki/Compound_interest' };
const ANNUITY: SourceRef = { name: 'Annuity, the future-value formula (reference)', url: 'https://en.wikipedia.org/wiki/Annuity' };
const MIFFLIN: SourceRef = { name: 'Mifflin et al., 1990, Am J Clin Nutr', url: 'https://doi.org/10.1093/ajcn/51.2.241' };
const BMR_REF: SourceRef = { name: 'Basal metabolic rate (reference)', url: 'https://en.wikipedia.org/wiki/Basal_metabolic_rate' };

const LOAN_BASIS = 'The standard reducing-balance EMI formula that lenders use. Your lender’s schedule can differ by a few rupees because of rounding and dates.';
const GROWTH_BASIS = 'The standard compound-growth formulas, with a steady assumed return. Real returns vary and are not guaranteed.';

export const TRUST: Record<string, Trust> = {
  'emi-calculator': { kind: 'finance', basis: LOAN_BASIS, sources: [EMI] },
  'home-loan-emi-calculator': { kind: 'finance', basis: LOAN_BASIS, sources: [EMI] },
  'car-loan-emi-calculator': { kind: 'finance', basis: LOAN_BASIS, sources: [EMI] },
  'personal-loan-emi-calculator': { kind: 'finance', basis: LOAN_BASIS, sources: [EMI] },
  'loan-prepayment-calculator': { kind: 'finance', basis: 'The same EMI formula, applied month by month with the extra payment taken off the balance.', sources: [EMI] },
  'loan-eligibility-calculator': { kind: 'finance', basis: 'The EMI formula run backwards. The share of income allowed for EMIs is set by each lender, so use the figure yours quotes.', sources: [EMI] },
  'sip-calculator': { kind: 'finance', basis: GROWTH_BASIS, sources: [ANNUITY] },
  'step-up-sip-calculator': { kind: 'finance', basis: GROWTH_BASIS, sources: [ANNUITY] },
  'lumpsum-calculator': { kind: 'finance', basis: GROWTH_BASIS, sources: [COMPOUND] },
  'swp-calculator': { kind: 'finance', basis: 'Month-by-month withdrawal from a balance that grows at a steady assumed return.', sources: [ANNUITY] },
  'fd-calculator': { kind: 'finance', basis: 'The compound interest formula. Banks differ in how often they compound, so check yours.', sources: [COMPOUND, { name: 'Fixed deposit (reference)', url: 'https://en.wikipedia.org/wiki/Fixed_deposit' }] },
  'rd-calculator': { kind: 'finance', basis: 'Quarterly compounding on monthly deposits, the usual bank method. Banks can round differently.', sources: [{ name: 'Recurring deposit (reference)', url: 'https://en.wikipedia.org/wiki/Recurring_deposit' }, COMPOUND] },
  'compound-interest-calculator': { kind: 'finance', basis: GROWTH_BASIS, sources: [COMPOUND] },
  'simple-interest-calculator': { kind: 'finance', basis: 'The simple interest formula, P × R × T ÷ 100.', sources: [{ name: 'Simple interest (reference)', url: 'https://en.wikipedia.org/wiki/Simple_interest' }] },
  'cagr-calculator': { kind: 'finance', basis: 'The standard compound annual growth rate formula. It smooths out the ups and downs of a real investment.', sources: [{ name: 'Compound annual growth rate (reference)', url: 'https://en.wikipedia.org/wiki/Compound_annual_growth_rate' }] },
  'inflation-calculator': { kind: 'finance', basis: 'Compounding at a steady inflation rate. Real inflation changes from year to year and differs between goods.', sources: [{ name: 'Inflation (reference)', url: 'https://en.wikipedia.org/wiki/Inflation' }] },
  'retirement-calculator': { kind: 'finance', basis: 'Inflation-adjusted expenses funded by a corpus that earns a steady return. It leaves out tax, pensions and changes in lifestyle.', sources: [ANNUITY] },
  'income-tax-calculator': { kind: 'finance', basis: 'The slabs, rebate, standard deduction, surcharge and cess for tax year 2026-27, read from the official sources below on 14 November 2026. The Income-tax Act, 2025 applies from 1 April 2026.', sources: INCOME_TAX_RULES.sources },
  'gst-calculator': { kind: 'finance', basis: 'Plain percentage arithmetic. The rates (5%, 18% and a special 40%, from 22 September 2025) were read from the official sources below on 14 November 2026. The rate for your item is on the invoice or in the official schedule.', sources: GST_RULES.sources },
  'bmi-calculator': { kind: 'health', basis: 'Weight in kg divided by height in metres squared, with the WHO categories.', sources: [{ name: 'WHO: obesity and overweight', url: 'https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight' }] },
  'bmr-calculator': { kind: 'health', basis: 'The Mifflin-St Jeor equation.', sources: [MIFFLIN, BMR_REF] },
  'tdee-calculator': { kind: 'health', basis: 'The Mifflin-St Jeor BMR times a standard activity factor. The factors are conventions, not exact measurements.', sources: [MIFFLIN, BMR_REF] },
  'body-fat-calculator': { kind: 'health', basis: 'The U.S. Navy tape-measure method. A tape estimate can be several percentage points off.', sources: [{ name: 'Body fat percentage (reference)', url: 'https://en.wikipedia.org/wiki/Body_fat_percentage' }] },
  'ideal-weight-calculator': { kind: 'health', basis: 'The Devine and Robinson formulas and the WHO normal BMI range, as general guidance only.', sources: [{ name: 'Ideal body weight (reference)', url: 'https://en.wikipedia.org/wiki/Ideal_body_weight' }, { name: 'WHO: obesity and overweight', url: 'https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight' }] },
  'water-intake-calculator': { kind: 'health', basis: 'A rule of thumb used here, 35 ml per kg of body weight plus 350 ml for every 30 minutes of exercise. It is not an official guideline.', sources: [] },
  'pregnancy-due-date-calculator': { kind: 'health', basis: 'Naegele’s rule: the first day of the last period plus 280 days. A scan can change the date.', sources: [{ name: 'Naegele’s rule (reference)', url: 'https://en.wikipedia.org/wiki/Naegele%27s_rule' }] },
};

export const DISCLAIMER = {
  finance: 'An estimate only, not financial or tax advice. Real products, charges and taxes differ, so check the terms with your lender, bank, adviser or the tax department.',
  health: 'An estimate only, not medical advice. Talk to a doctor or dietitian about your own health.',
} as const;

export const trustOf = (def: Pick<CalcDef, 'slug'>): Trust | undefined => TRUST[def.slug];

/** Every distinct source, for the "How we check our calculators" page. */
export function allSources(): SourceRef[] {
  const seen = new Map<string, SourceRef>();
  for (const t of Object.values(TRUST)) for (const s of t.sources) seen.set(s.url, s);
  return [...seen.values()];
}

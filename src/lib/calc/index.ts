import { CALC_GROUPS, type CalcDef, type GroupId, type Values } from './types';
import { LOANS } from './defs/loans';
import { SAVINGS } from './defs/savings';
import { SCHEMES } from './defs/schemes';
import { TAX } from './defs/tax';
import { AU_TAX } from './defs/au-tax';
import { CA_TAX } from './defs/ca-tax';
import { DE_TAX } from './defs/de-tax';
import { UK_TAX } from './defs/uk-tax';
import { US_TAX } from './defs/us-tax';
import { MATHS } from './defs/maths';
import { DATES } from './defs/dates';
import { HEALTH } from './defs/health';
import { STUDENTS } from './defs/students';

export { CALC_GROUPS };
export type { CalcDef, GroupId };

/** Every live calculator, in sidebar order. The home page, sidebar, search, sitemap and related links all read this list. */
export const CALCULATORS: readonly CalcDef[] = [...LOANS, ...SAVINGS, ...SCHEMES, ...TAX, ...US_TAX, ...UK_TAX, ...CA_TAX, ...AU_TAX, ...DE_TAX, ...MATHS, ...DATES, ...HEALTH, ...STUDENTS];

/** The home page's "Popular right now", in this order. Slugs that are not live yet are skipped. */
const POPULAR = ['emi-calculator', 'sip-calculator', 'income-tax-calculator', 'gst-calculator', 'percentage-calculator', 'age-calculator', 'bmi-calculator', 'cgpa-to-percentage-calculator'];

export const calcPath = (slug: string): string => `/${slug}/`;
export const calcBySlug = (slug: string): CalcDef | undefined => CALCULATORS.find((c) => c.slug === slug);
export const calcsInGroup = (group: GroupId): CalcDef[] => CALCULATORS.filter((c) => c.group === group);
export const popularCalcs = (): CalcDef[] => POPULAR.map(calcBySlug).filter((c): c is CalcDef => !!c);
export const groupName = (id: GroupId): string => CALC_GROUPS.find((g) => g.id === id)!.name;
export const groupEmoji = (id: GroupId): string => CALC_GROUPS.find((g) => g.id === id)!.emoji;
/** Groups that have at least one live calculator. */
export const liveGroups = () => CALC_GROUPS.filter((g) => calcsInGroup(g.id).length > 0);

export function defaultValues(def: CalcDef): Values {
  return Object.fromEntries(def.fields.map((f) => [f.id, f.default]));
}

/** Word-start search over name, summary and keywords, best matches first. */
export function searchCalcs(query: string, list: readonly CalcDef[] = CALCULATORS): CalcDef[] {
  const words = query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  if (words.length === 0) return [...list];
  const scored = list
    .map((c) => {
      const name = c.name.toLowerCase();
      const hay = `${c.name} ${c.summary} ${c.keywords}`.toLowerCase().split(/[^a-z0-9]+/);
      if (!words.every((w) => hay.some((h) => h.startsWith(w)))) return null;
      return { c, score: words.reduce((t, w) => t + (name.startsWith(w) ? 3 : name.includes(w) ? 2 : 1), 0) };
    })
    .filter((x): x is { c: CalcDef; score: number } => !!x);
  return scored.sort((a, b) => b.score - a.score).map((x) => x.c);
}

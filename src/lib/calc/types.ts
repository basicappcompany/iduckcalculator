/**
 * The calculator model. A calculator is a list of fields and one pure `compute` function that turns the field
 * values into a Result. One Preact component (CalculatorTool) renders any of them and one Astro route builds every page,
 * so adding a calculator means adding an entry here, a known-answer test, and nothing else.
 */

export type Unit = 'money' | 'percent' | 'years' | 'months' | 'days' | 'kg' | 'cm' | 'number';

export interface NumberField {
  kind: 'number';
  id: string;
  label: string;
  default: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: Unit;
  hint?: string;
}
export interface SelectField {
  kind: 'select';
  id: string;
  label: string;
  default: string;
  options: readonly { value: string; label: string }[];
  hint?: string;
}
export interface DateField {
  kind: 'date';
  id: string;
  label: string;
  /** An ISO date (YYYY-MM-DD), or 'today'. */
  default: string;
  hint?: string;
}
export interface TextField {
  kind: 'text';
  id: string;
  label: string;
  default: string;
  hint?: string;
}
export type Field = NumberField | SelectField | DateField | TextField;
export type Values = Record<string, number | string>;

export type MetricKind = 'money' | 'compact' | 'percent' | 'number' | 'text';
export interface Metric {
  label: string;
  value: number | string;
  kind: MetricKind;
  /** Decimal places for money, percent and number. */
  decimals?: number;
  /** The headline answer, shown larger. */
  big?: boolean;
}

export interface Table {
  columns: string[];
  rows: (number | string)[][];
  /** How to format each column; text by default. */
  kinds?: ('money' | 'number' | 'percent' | 'text')[];
}

export interface Chart {
  title: string;
  /** One label per bar (usually the year). */
  labels: string[];
  /** Series stack on top of each other. Money series are formatted with the chosen currency. */
  series: { name: string; values: number[] }[];
  money?: boolean;
}

export interface Result {
  metrics: Metric[];
  table?: Table;
  chart?: Chart;
  /** A plain sentence under the results, such as a warning or a category. */
  note?: string;
  /** Shown instead of results when the input cannot be used. */
  error?: string;
}

export const CALC_GROUPS = [
  { id: 'loans', name: 'Loans & EMI', emoji: '💰' },
  { id: 'savings', name: 'Savings & investing', emoji: '📈' },
  { id: 'tax', name: 'Tax & salary (India)', emoji: '🧾' },
  { id: 'maths', name: 'Everyday maths', emoji: '🧮' },
  { id: 'dates', name: 'Dates & time', emoji: '📅' },
  { id: 'health', name: 'Health', emoji: '❤️' },
  { id: 'students', name: 'Students', emoji: '🎓' },
] as const;
export type GroupId = (typeof CALC_GROUPS)[number]['id'];

export interface Faq {
  q: string;
  a: string;
}

/** For tax and scheme calculators: the rules the maths follows, with where they were read. */
export interface RulesInfo {
  /** For example "FY 2026-27 (AY 2027-28)". */
  year: string;
  /** ISO date the official source was read. */
  asOf: string;
  sources: { name: string; url: string }[];
}

export interface CalcDef {
  slug: string;
  name: string;
  group: GroupId;
  emoji: string;
  /** One line for cards. */
  summary: string;
  /** Answer-first sentence at the top of the page. */
  quick: string;
  /** Extra words people search for. */
  keywords: string;
  /** Page title (50 to 60 characters) and meta description (70 to 160). */
  title: string;
  description: string;
  fields: readonly Field[];
  compute: (v: Values) => Result;
  /** The formula, one line per step. */
  formula: string[];
  /** A worked example with real numbers that the tests check. */
  example: string;
  /** "How it works": plain-English paragraphs. */
  how: string[];
  faqs: readonly Faq[];
  /** Exactly three related slugs. */
  related: readonly [string, string, string];
  rules?: RulesInfo;
}

export const num = (id: string, label: string, def: number, o: Partial<Omit<NumberField, 'kind' | 'id' | 'label' | 'default'>> = {}): NumberField => ({
  kind: 'number',
  id,
  label,
  default: def,
  ...o,
});
export const sel = (id: string, label: string, def: string, options: readonly (readonly [string, string])[], hint?: string): SelectField => ({
  kind: 'select',
  id,
  label,
  default: def,
  options: options.map(([value, label]) => ({ value, label })),
  ...(hint ? { hint } : {}),
});
export const date = (id: string, label: string, def: string, hint?: string): DateField => ({ kind: 'date', id, label, default: def, ...(hint ? { hint } : {}) });

/** A number from the form values; empty or invalid input counts as 0. */
export const n = (v: Values, id: string): number => {
  const x = typeof v[id] === 'number' ? (v[id] as number) : parseFloat(String(v[id] ?? ''));
  return Number.isFinite(x) ? x : 0;
};
/** "8 years 7 months", "1 year 1 month": a length of time given in months. */
export const yearsMonths = (total: number): string => {
  const y = Math.floor(total / 12);
  const m = total % 12;
  return `${y} year${y === 1 ? '' : 's'} ${m} month${m === 1 ? '' : 's'}`;
};
export const s = (v: Values, id: string): string => String(v[id] ?? '');
export const fail = (error: string): Result => ({ metrics: [], error });

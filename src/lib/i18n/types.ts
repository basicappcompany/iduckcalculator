/** The shapes every language file fills in. English (`en.ts`) is the source: a test fails if another language misses a key or a placeholder. */

export type LangCode = 'en' | 'en-gb' | 'hi' | 'bn' | 'pt-br' | 'id' | 'ru' | 'de' | 'es' | 'fr' | 'tr';

export interface Language {
  /** Also the URL prefix: /de/, /pt-br/. English (US) has no prefix. */
  code: LangCode;
  /** The value for <html lang> and hreflang links. */
  hreflang: string;
  /** The language's own name, shown in the menu. */
  native: string;
  /** Open Graph locale, such as de_DE. */
  ogLocale: string;
  /** The key in `flags.ts`. */
  flag: string;
  /** False until a native speaker has read the language. Unreviewed pages say so at the top. */
  reviewed: boolean;
}

/** Words and sentences used around the site: the menu, the footer and the headings on calculator pages. */
export interface Chrome {
  skip: string;
  home: string;
  helper: string;
  all: string;
  guides: string;
  calculators: string;
  community: string;
  alsoFrom: string;
  search: string;
  searchPlaceholder: string;
  searchAria: string;
  support: string;
  language: string;
  theme: string;
  menu: string;
  runs: string;
  noSignup: string;
  noAds: string;
  quick: string;
  how: string;
  formula: string;
  example: string;
  faq: string;
  related: string;
  readGuide: string;
  rulesAsOf: string;
  footerTagline: string;
  /** Shown at the top of every page in a language nobody has read yet. */
  machine: string;
  roadmap: string;
  request: string;
  feedback: string;
  settings: string;
  about: string;
  privacy: string;
  terms: string;
  supportFull: string;
  howWeCheck: string;
  siteMenu: string;
  homeAria: string;
  mainNav: string;
  /** Placeholders {pdf}, {img} and {convert} become links to the sister sites. */
  alsoTry: string;
  /** Placeholder {date}. */
  lastUpdated: string;
}

export interface HomeText {
  title: string;
  description: string;
  h1Before: string;
  h1Mark: string;
  h1After: string;
  /** Placeholder {total}. */
  intro: string;
  /** Holds <b> tags around the keys. */
  kbdHint: string;
  helperTitle: string;
  helperText: string;
  popular: string;
  /** Placeholder {total}. */
  allTitle: string;
  allHint: string;
  filterAria: string;
  /** Placeholder {n}. */
  everything: string;
  nextTitle: string;
  nextText: string;
  next: { emoji: string; title: string; text: string }[];
  /** Placeholders {roadmap} and {request}. */
  nextLinks: string;
  nextRoadmap: string;
  nextRequest: string;
  why: { emoji: string; title: string; text: string }[];
  guidesTitle: string;
  guidesText: string;
  /** Placeholder {n}. */
  allGuides: string;
  faqTitle: string;
  /** Placeholder {total} in the first answer. */
  faqs: { q: string; a: string }[];
  supportTitle: string;
  supportText: string;
  supportButton: string;
}

export interface Locale {
  chrome: Chrome;
  /** Calculator group names by id (loans, savings, tax, maths, dates, health, students). */
  groups: Record<'loans' | 'savings' | 'tax' | 'maths' | 'dates' | 'health' | 'students', string>;
  home: HomeText;
}

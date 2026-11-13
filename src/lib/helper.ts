/**
 * "Ask the helper" (Duck): a plain matcher, not an AI. It answers simple sums and "X% of Y" itself, points people to
 * the right calculator, and answers a few questions about the site. It runs in the browser and sends nothing anywhere.
 */
import { CALCULATORS, calcBySlug, calcPath, type CalcDef } from './calc';
import { evaluate, ExprError, showNumber } from './calc/expr';

export interface ToolCard {
  slug: string;
  name: string;
  emoji: string;
  summary: string;
  href: string;
}
export interface Reply {
  text: string;
  /** Calculators to open, shown as cards. */
  tools: ToolCard[];
  /** Other pages, shown as buttons. */
  links: { label: string; href: string }[];
}

export const GREETING = 'Hi, I am Duck 🦆 Tell me what you want to work out, or just type a sum such as 15% of 2,400 and I will answer it right here.';
export const STARTERS = ['Monthly loan payment', 'How old am I', '15% of 2,400', 'Discount on a price', 'Is my data safe?', 'What can you do?'];

const card = (c: CalcDef): ToolCard => ({ slug: c.slug, name: c.name, emoji: c.emoji, summary: c.summary, href: calcPath(c.slug) });
const cards = (...slugs: string[]): ToolCard[] => slugs.map(calcBySlug).filter((c): c is CalcDef => !!c).map(card);
const reply = (text: string, o: { tools?: ToolCard[]; links?: Reply['links'] } = {}): Reply => ({ text, tools: o.tools ?? [], links: o.links ?? [] });

/** Everyday words people use, mapped to words the calculators are indexed by. */
const SYNONYMS: [RegExp, string][] = [
  [/\b(borrow|mortgage|instal+ment|installment)\b/, 'emi loan'],
  [/\b(invest|investment|mutual fund)\b/, 'sip lumpsum'],
  [/\b(how old|birthday|dob)\b/, 'age'],
  [/\b(fat|thin|weight)\b/, 'bmi'],
  [/\b(marks|grades?|score)\b/, 'percentage marks'],
  [/\b(sale|offer|coupon)\b/, 'discount'],
  [/\b(retire|retirement|pension)\b/, 'retirement'],
  [/\b(days between|how many days)\b/, 'date difference'],
];

const topics: { test: RegExp; reply: Reply }[] = [
  {
    test: /(privacy|safe|secure|upload|data|track|cookie|server)/,
    reply: reply('Every calculation runs in your browser. The numbers you type are not sent to us or anyone else. The only thing saved is your theme, currency and language choice, in your own browser.', { links: [{ label: 'Read the privacy page', href: '/privacy/' }] }),
  },
  {
    test: /(free|price|cost|pay|ads?|sign.?up|account|login)/,
    reply: reply('iDuckCalculator is free. There is no sign-up and there are no ads. Support is by tips only, and it is never required.', { links: [{ label: 'Support iDuckCalculator', href: '/support/' }] }),
  },
  {
    test: /(feedback|bug|broken|wrong|mistake|error|report)/,
    reply: reply('Sorry about that, and thank you for telling us. Say which calculator and what you expected, and we will look at it.', { links: [{ label: 'Send feedback', href: '/feedback/' }] }),
  },
  {
    test: /(request|suggest|missing|add a|new calculator|wish)/,
    reply: reply('We love ideas. Tell us what you would like to see; real examples help most.', { links: [{ label: 'Request a calculator', href: '/request/' }, { label: 'See the roadmap', href: '/roadmap/' }] }),
  },
  {
    test: /(dark|light|theme|currency|language|turkish|settings)/,
    reply: reply('Theme, currency and language are in Settings. You can also switch the theme with the moon button at the top.', { links: [{ label: 'Open Settings', href: '/settings/' }] }),
  },
];

const GREET = /^(hi|hello|hey|hiya|yo|good (morning|afternoon|evening)|namaste|merhaba)\b[\s!.?]*$/;
const THANKS = /^(thanks?|thank you|thx|ty|great|cool|nice|ok(ay)?|got it)\b[\s!.?]*$/;
const HELP = /(what can you do|what do you do|help|how does this work|who are you|what are you)/;

const STOP = new Set(['calculator', 'calculate', 'calculation', 'how', 'do', 'i', 'can', 'what', 'is', 'my', 'the', 'a', 'an', 'to', 'for', 'of', 'find', 'work', 'out', 'am', 'me', 'on', 'in', 'and', 'add', 'get', 'want']);
const tokens = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w && !STOP.has(w));

/** How many of the words match the start of a word in the calculator's name, summary or keywords (name matches count double). */
function score(c: CalcDef, words: string[]): number {
  const name = tokens(c.name);
  const rest = tokens(`${c.summary} ${c.keywords}`);
  return words.reduce((t, w) => t + (name.some((h) => h.startsWith(w)) ? 2 : rest.some((h) => h.startsWith(w)) ? 1 : 0), 0);
}

const plain = (s: string) => s.replace(/(\d),(?=\d{3}\b)/g, '$1');

/** "15% of 2400", "what is 15 percent of 2,400". */
function percentOf(raw: string): Reply | null {
  const m = /(-?\d+(?:\.\d+)?)\s*(?:%|percent)\s*of\s*(-?\d+(?:\.\d+)?)/.exec(plain(raw));
  if (!m) return null;
  const [a, b] = [parseFloat(m[1]!), parseFloat(m[2]!)];
  return reply(`${showNumber(a)}% of ${showNumber(b)} is ${showNumber((a / 100) * b)}.`, { tools: cards('percentage-calculator') });
}

/** A sum typed into the chat, such as "(2 + 3) * 4" or "what is sqrt(16)". */
function sum(raw: string): Reply | null {
  const cleaned = plain(raw).replace(/^(what('| i)?s|whats|calculate|compute|work out|solve|find|=)\s*/i, '').replace(/\s*=\s*\??$/, '').replace(/\?$/, '').trim();
  if (!/\d/.test(cleaned) || !/[+\-*/^×÷!(]/.test(cleaned)) return null;
  if (/\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}/.test(cleaned) && !/[*×÷^!(]/.test(cleaned)) return null; // a date, not a sum
  try {
    const value = evaluate(cleaned, 'deg');
    return reply(`${cleaned} = ${showNumber(value)}`, { tools: cards('scientific-calculator') });
  } catch (e) {
    if (e instanceof ExprError && /zero/.test(e.message)) return reply('That one divides by zero, which has no answer.', { tools: cards('basic-calculator') });
    return null;
  }
}

export function respond(message: string): Reply {
  const raw = message.toLowerCase().trim();
  if (!raw) return reply('Type what you want to work out, such as "monthly loan payment" or "how old am I".');
  if (GREET.test(raw)) return reply('Hello! 🦆 What would you like to work out today? A loan, a saving plan, a date, a percentage?');
  if (THANKS.test(raw)) return reply('You are welcome! Ask me anything else you want to work out.');
  if (HELP.test(raw) && !/\b(loan|sip|tax|bmi|age)\b/.test(raw))
    return reply(`I can point you to the right one of our ${CALCULATORS.length} calculators if you say what you want to work out, answer a quick sum or "15% of 2,400" right here, and answer questions about privacy, price and settings.`, {
      links: [{ label: 'Browse all calculators', href: '/calculators/' }],
    });

  const direct = percentOf(raw) ?? sum(raw);
  if (direct) return direct;

  let expanded = raw;
  for (const [re, extra] of SYNONYMS) if (re.test(raw)) expanded += ` ${extra}`;
  const words = [...new Set(tokens(expanded))];
  const ranked = CALCULATORS.map((c) => ({ c, s: score(c, words) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);
  const best = ranked[0]?.s ?? 0;
  const topic = topics.find((t) => t.test.test(raw));
  // A clear calculator match wins; a weak one gives way to a topic answer such as privacy or support.
  if (best >= 2 || (best >= 1 && !topic)) {
    const hits = ranked.filter((x) => x.s >= Math.max(1, best - 1)).slice(0, 3).map((x) => x.c);
    const text = hits.length === 1 ? `That sounds like ${hits[0]!.name}. Here it is:` : best >= 2 ? 'These should help:' : 'I am not completely sure, but these might be what you mean:';
    return reply(text, { tools: hits.map(card) });
  }
  if (topic) return topic.reply;
  return reply('Hmm, I am not sure which calculator that is. Try words like loan, SIP, age, BMI, discount or percentage. You can also search with Ctrl K, or browse the full list.', {
    links: [{ label: 'Browse all calculators', href: '/calculators/' }],
  });
}

/**
 * "Ask the helper": a plain keyword matcher, not an AI. It points people to the right calculator and answers a few
 * questions about the site. It sends nothing anywhere.
 */
import { CALCULATORS, calcPath, type CalcDef } from './calc';

export interface Reply {
  text: string;
  links: { name: string; href: string }[];
}

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
    reply: { text: 'Every calculation runs in your browser. The numbers you type are not sent to us or anyone else. The only thing saved is your theme, currency and language choice, in your own browser.', links: [{ name: 'Privacy', href: '/privacy/' }] },
  },
  {
    test: /(free|price|cost|pay|ads?|sign.?up|account|login)/,
    reply: { text: 'iDuckCalculator is free. There is no sign-up and there are no ads. Support is by tips only, and it is never required.', links: [{ name: 'Support iDuckCalculator', href: '/support/' }] },
  },
  {
    test: /(feedback|bug|broken|wrong|mistake|error|report)/,
    reply: { text: 'Thank you. Tell us which calculator and what you expected, and we will look at it.', links: [{ name: 'Send feedback', href: '/feedback/' }] },
  },
  {
    test: /(request|suggest|missing|add a|new calculator|wish)/,
    reply: { text: 'Tell us what you would like to see. Real examples help most.', links: [{ name: 'Request a calculator', href: '/request/' }, { name: 'Roadmap', href: '/roadmap/' }] },
  },
  {
    test: /(dark|light|theme|currency|language|turkish|settings)/,
    reply: { text: 'Theme, currency and language are in Settings. You can also switch the theme with the moon button at the top.', links: [{ name: 'Settings', href: '/settings/' }] },
  },
];

const STOP = new Set(['calculator', 'calculate', 'calculation', 'how', 'do', 'i', 'can', 'what', 'is', 'my', 'the', 'a', 'an', 'to', 'for', 'of', 'find', 'work', 'out', 'am', 'me', 'on', 'in', 'and', 'add', 'get', 'want']);
const tokens = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w && !STOP.has(w));

/** How many of the words match the start of a word in the calculator's name, summary or keywords (name matches count double). */
function score(c: CalcDef, words: string[]): number {
  const name = tokens(c.name);
  const rest = tokens(`${c.summary} ${c.keywords}`);
  return words.reduce((t, w) => t + (name.some((h) => h.startsWith(w)) ? 2 : rest.some((h) => h.startsWith(w)) ? 1 : 0), 0);
}

export function respond(message: string): Reply {
  const raw = message.toLowerCase().trim();
  if (!raw) return { text: 'Type what you want to work out, such as "monthly loan payment" or "how old am I".', links: [] };
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
    return { text: hits.length === 1 ? 'This looks like the right one:' : 'These should help:', links: hits.map((c) => ({ name: `${c.emoji} ${c.name}`, href: calcPath(c.slug) })) };
  }
  if (topic) return topic.reply;
  return { text: 'I could not find a match. Try other words, search with Ctrl K, or browse the full list.', links: [{ name: 'All calculators', href: '/calculators/' }] };
}

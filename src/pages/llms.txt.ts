import { CALCULATORS, CALC_GROUPS, calcPath } from '../lib/calc';
import { GUIDES, guidePath } from '../lib/guides';
import { SITE_URL } from '../lib/seo';

/** A plain-text map of the site for AI answer engines, built from the same lists the pages use. */
export function GET() {
  const lines = [
    '# iDuckCalculator',
    '',
    '> Free calculators that run in your browser: loans and EMI, savings and investing, everyday maths, dates, health and students. No sign-up, no ads. By Basic App Company.',
    '',
    ...CALC_GROUPS.flatMap((g) => {
      const list = CALCULATORS.filter((c) => c.group === g.id);
      if (list.length === 0) return [];
      return [`## ${g.name}`, ...list.map((c) => `- [${c.name}](${SITE_URL}${calcPath(c.slug)}): ${c.summary}`), ''];
    }),
    '## How-to guides',
    ...GUIDES.map((g) => `- [${g.title}](${SITE_URL}${guidePath(g.slug)}): ${g.description}`),
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}

/** The list the Ctrl K window searches, in one language. Built at build time into /palette/<lang>.json and fetched when the window first opens. */
import { CALCULATORS, calcPath } from '../calc';
import { COMMUNITY, communityPath } from '../community';
import { GUIDES, guidePath } from '../guides';
import { localeOf } from './index';
import { pageHref } from './pages';
import { trFor } from './loader';
import type { LangCode } from './types';

export interface PaletteData {
  calcs: { s: string; n: string; e: string; k: string; h: string }[];
  pages: { to: string; label: string; icon: string; kw: string; hint: string }[];
  ui: { calculators: string; pages: string; actions: string; calculator: string; page: string; guide: string; guides: string; action: string; theme: string; empty: string; results: string };
}

export function paletteData(lang: LangCode): PaletteData {
  const tt = trFor(lang);
  const c = localeOf(lang).chrome;
  const href = (k: string) => pageHref(lang, k);
  const community: Record<string, string> = { roadmap: c.roadmap, request: c.request, feedback: c.feedback, support: c.supportFull, settings: c.settings, 'how-we-check': c.howWeCheck, about: c.about };
  return {
    calcs: CALCULATORS.map((d) => ({ s: d.slug, n: tt(d.name), e: d.emoji, k: `${d.name} ${tt(d.summary)} ${d.keywords}`, h: href(calcPath(d.slug)) })),
    pages: [
      { to: href('/'), label: c.home, icon: '🏠', kw: 'home start main', hint: tt('Page') },
      { to: '/chat/', label: c.helper, icon: '💬', kw: 'chat assistant help which calculator', hint: tt('Page') },
      { to: href('/calculators/'), label: c.all, icon: '🧮', kw: 'browse list everything calculators', hint: tt('Page') },
      { to: href('/guides/'), label: c.guides, icon: '📖', kw: 'learn tutorial help steps how to guides', hint: tt('Guides') },
      ...GUIDES.map((g) => ({ to: href(guidePath(g.slug)), label: tt(g.title), icon: '📖', kw: `${g.title} ${tt(g.description)}`, hint: tt('Guide') })),
      ...COMMUNITY.map((p) => ({
        to: href(communityPath(p.slug)),
        label: community[p.slug] ?? p.name,
        icon: p.emoji,
        kw: `${p.name} ${p.summary}${p.slug === 'support' ? ' donate tip help share' : ''}${p.slug === 'settings' ? ' theme dark light currency language' : ''}`,
        hint: tt('Page'),
      })),
      { to: '/privacy/', label: tt('Privacy policy'), icon: '🔒', kw: 'privacy policy data cookies legal', hint: tt('Page') },
      { to: '/terms/', label: tt('Terms of use'), icon: '📜', kw: 'terms of use legal rules conditions', hint: tt('Page') },
    ],
    ui: {
      calculators: tt('Calculators'),
      pages: tt('Pages'),
      actions: tt('Actions'),
      calculator: tt('Calculator'),
      page: tt('Page'),
      guide: tt('Guide'),
      guides: tt('Guides'),
      action: tt('Action'),
      theme: tt('Switch light / dark'),
      empty: tt('Nothing matches "{0}". Try "emi", "sip" or "age".'),
      results: tt('Results'),
    },
  };
}

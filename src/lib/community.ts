/**
 * The "Community" pages in the sidebar. Each slug is a page under src/pages; a unit test fails if the two lists disagree.
 * Pages with little to find in a search engine (forms, settings) are not indexable: they get a noindex tag and stay out of the sitemap.
 */
export interface CommunityPage {
  slug: string;
  name: string;
  emoji: string;
  summary: string;
  indexable: boolean;
}

export const COMMUNITY: readonly CommunityPage[] = [
  { slug: 'roadmap', name: 'Roadmap', emoji: '🗺️', summary: 'What is live and what we are thinking about next.', indexable: true },
  { slug: 'request', name: 'Request a calculator', emoji: '💡', summary: 'Tell us about a calculator or improvement you would like.', indexable: false },
  { slug: 'feedback', name: 'Send feedback', emoji: '📮', summary: 'Something broke, could be better, or worked great.', indexable: false },
  { slug: 'support', name: 'Support iDuckCalculator', emoji: '💛', summary: 'Ways to help keep it free.', indexable: true },
  { slug: 'settings', name: 'Settings', emoji: '⚙️', summary: 'Theme, currency, language and keyboard shortcuts.', indexable: false },
  { slug: 'how-we-check', name: 'How we check', emoji: '✅', summary: 'How each result is tested and where the formulas come from.', indexable: true },
  { slug: 'about', name: 'About', emoji: '🦆', summary: 'Who runs iDuckCalculator, what it costs and how it is built.', indexable: true },
];

export const communityPath = (slug: string): string => `/${slug}/`;

/** URL paths that must stay out of search results and the sitemap. */
export const NOINDEX_PATHS: readonly string[] = [...COMMUNITY.filter((p) => !p.indexable).map((p) => communityPath(p.slug)), '/chat/'];

/** Pages that are neither a calculator nor a community page: home, 404, the calculator template, the hub, guides and the legal pages. */
export const OTHER_PAGES: readonly string[] = ['index', '404', '[slug]', 'calculators', 'privacy', 'terms', 'chat', 'guides', 'llms.txt'];

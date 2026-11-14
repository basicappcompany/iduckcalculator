import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { NOINDEX_PATHS } from './src/lib/community';
import { guideBySlug } from './src/lib/guides';
import { LAST_UPDATED } from './src/lib/seo';
import { DEFAULT_LANG, LANGUAGES } from './src/lib/i18n';

export default defineConfig({
  site: 'https://iduckcalculator.com',
  output: 'static',
  integrations: [
    preact(),
    // Pages that are noindex (forms, settings, helper) stay out of the sitemap too.
    // Every URL carries a lastmod: a guide's own updated date, or the site's "Last updated" date for everything else.
    sitemap({
      // Adds the alternate-language links to each URL that exists in more than one language.
      i18n: { defaultLocale: DEFAULT_LANG, locales: Object.fromEntries(LANGUAGES.map((l) => [l.code, l.hreflang])) },
      filter: (page) => !NOINDEX_PATHS.some((path) => page.endsWith(path)),
      serialize(item) {
        const guide = /\/guides\/([^/]+)\/$/.exec(item.url);
        item.lastmod = (guide && guideBySlug(guide[1]!)?.updated) || LAST_UPDATED;
        return item;
      },
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});

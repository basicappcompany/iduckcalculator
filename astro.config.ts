import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { NOINDEX_PATHS } from './src/lib/community';

export default defineConfig({
  site: 'https://iduckcalculator.com',
  output: 'static',
  integrations: [
    preact(),
    // Pages that are noindex (forms, settings, helper) stay out of the sitemap too.
    sitemap({ filter: (page) => !NOINDEX_PATHS.some((path) => page.endsWith(path)) }),
  ],
  vite: { plugins: [tailwindcss()] },
});

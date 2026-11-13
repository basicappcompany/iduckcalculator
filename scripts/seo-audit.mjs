// Checks the built site (run `pnpm build` first): `node scripts/seo-audit.mjs`. Prints a report and exits 1 if a rule is broken.
// Rules: one <h1> per page; a unique <title> under 60 characters and a unique description under 155; a robots meta tag with
// index,follow and the large-preview directives on every public page; a canonical URL that matches the page; the sitemap lists exactly
// the indexable pages, each with a lastmod date.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DIST = 'dist';
const SITE = 'https://iduckcalculator.com';
const ROBOTS = 'index,follow,max-image-preview:large,max-snippet:-1';
const NOINDEX_PAGES = new Set(['/404.html']); // pages that must be noindex whatever else is true

const pages = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (p.endsWith('.html')) {
      const html = readFileSync(p, 'utf8');
      let rel = '/' + relative(DIST, p).split(sep).join('/');
      rel = rel.replace(/index\.html$/, '');
      pages.push({
        rel,
        html,
        title: /<title>([\s\S]*?)<\/title>/.exec(html)?.[1] ?? '',
        description: /<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? '',
        robots: /<meta name="robots" content="([^"]*)"/.exec(html)?.[1] ?? '',
        canonical: /<link rel="canonical" href="([^"]*)"/.exec(html)?.[1] ?? '',
        h1: (html.match(/<h1\b/g) ?? []).length,
      });
    }
  }
})(DIST);

const problems = [];
const add = (rel, msg) => problems.push(`${rel}: ${msg}`);
const byTitle = new Map();
const byDescription = new Map();
for (const p of pages) {
  if (p.h1 !== 1) add(p.rel, `${p.h1} <h1> elements`);
  if (p.title === '') add(p.rel, 'no <title>');
  if (p.title.length >= 60) add(p.rel, `title is ${p.title.length} characters: "${p.title}"`);
  if (p.description === '') add(p.rel, 'no meta description');
  if (p.description.length >= 155) add(p.rel, `description is ${p.description.length} characters`);
  if (p.rel !== '/404.html') {
    byTitle.set(p.title, [...(byTitle.get(p.title) ?? []), p.rel]);
    byDescription.set(p.description, [...(byDescription.get(p.description) ?? []), p.rel]);
  }
  p.noindex = p.robots === 'noindex';
  if (NOINDEX_PAGES.has(p.rel) && !p.noindex) add(p.rel, 'must be noindex');
  if (!p.noindex) {
    if (p.robots !== ROBOTS) add(p.rel, `robots meta is "${p.robots}", expected "${ROBOTS}"`);
    if (p.canonical !== `${SITE}${p.rel}`) add(p.rel, `canonical is "${p.canonical}"`);
  }
}
for (const [t, rels] of byTitle) if (rels.length > 1) add(rels.join(', '), `same title "${t}"`);
for (const [d, rels] of byDescription) if (rels.length > 1) add(rels.join(', '), `same description "${d.slice(0, 50)}..."`);

// Sitemap: every indexable page, a lastmod on each, nothing else.
const sitemapFile = join(DIST, 'sitemap-0.xml');
if (!existsSync(sitemapFile)) add('sitemap', 'dist/sitemap-0.xml is missing');
else {
  const xml = readFileSync(sitemapFile, 'utf8');
  const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({ loc: /<loc>(.*?)<\/loc>/.exec(m[1])?.[1], lastmod: /<lastmod>(.*?)<\/lastmod>/.exec(m[1])?.[1] }));
  const inMap = new Set(entries.map((e) => e.loc));
  for (const p of pages) {
    if (p.noindex) {
      if (inMap.has(`${SITE}${p.rel}`)) add(p.rel, 'is in the sitemap but not meant to be indexed');
    } else if (!inMap.has(`${SITE}${p.rel}`)) add(p.rel, 'is missing from the sitemap');
  }
  for (const e of entries) if (!e.lastmod || !/^\d{4}-\d{2}-\d{2}/.test(e.lastmod)) add(e.loc ?? '?', 'sitemap entry has no lastmod');
  const known = new Set(pages.map((p) => `${SITE}${p.rel}`));
  for (const e of entries) if (!known.has(e.loc)) add(e.loc ?? '?', 'sitemap lists a page that was not built');
}

const robotsTxt = existsSync('public/robots.txt') ? readFileSync('public/robots.txt', 'utf8') : '';
if (!/^Sitemap: https:\/\/iduckcalculator\.com\/sitemap-index\.xml$/m.test(robotsTxt)) add('robots.txt', 'does not name the sitemap');
for (const bot of ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'Bingbot'])
  if (!new RegExp(`User-agent: ${bot}\\s+Allow: /`).test(robotsTxt)) add('robots.txt', `no Allow group for ${bot}`);
if (/Disallow:\s*\S/.test(robotsTxt)) add('robots.txt', 'has a Disallow rule');

console.log(`${pages.length} pages checked.`);
if (problems.length) {
  console.error(`${problems.length} problem(s):\n${problems.slice(0, 60).join('\n')}${problems.length > 60 ? `\n... and ${problems.length - 60} more` : ''}`);
  process.exit(1);
}
console.log('SEO audit passed.');

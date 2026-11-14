// Checks the built site (run `pnpm build` first): `node scripts/seo-audit.mjs`. Prints a report and exits 1 if a rule is broken.
// Rules: one <h1> per page; a unique <title> under 60 characters and a unique description under 155 (unique within one language); a robots meta tag with
// index,follow and the large-preview directives on every public page; a canonical URL that matches the page; the sitemap lists exactly
// the indexable pages, each with a lastmod date.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DIST = 'dist';
const SITE = 'https://iduckcalculator.com';
const ROBOTS = 'index,follow,max-image-preview:large,max-snippet:-1';
const NOINDEX_PAGES = new Set(['/404.html']); // pages that must be noindex whatever else is true

const decode = (s) => s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
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
        // Measured as a visitor sees it in a search result: &#39; is one character, not five.
        title: decode(/<title>([\s\S]*?)<\/title>/.exec(html)?.[1] ?? ''),
        description: decode(/<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? ''),
        robots: /<meta name="robots" content="([^"]*)"/.exec(html)?.[1] ?? '',
        canonical: /<link rel="canonical" href="([^"]*)"/.exec(html)?.[1] ?? '',
        h1: (html.match(/<h1\b/g) ?? []).length,
        lang: /<html lang="([^"]*)"/.exec(html)?.[1] ?? '',
        alternates: [...html.matchAll(/<link rel="alternate" hreflang="([^"]*)" href="([^"]*)"/g)].map((m) => ({ hreflang: m[1], href: m[2] })),
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
    // Two pages in different languages may share a title (a brand name, say); two in the same language may not.
    byTitle.set(`${p.lang}|${p.title}`, [...(byTitle.get(`${p.lang}|${p.title}`) ?? []), p.rel]);
    byDescription.set(`${p.lang}|${p.description}`, [...(byDescription.get(`${p.lang}|${p.description}`) ?? []), p.rel]);
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

// Languages: every page that lists alternates must list itself and x-default, point only at pages that were built, and be listed back by each of them.
const byUrl = new Map(pages.map((p) => [`${SITE}${p.rel}`, p]));
for (const p of pages) {
  if (p.alternates.length === 0) continue;
  const self = `${SITE}${p.rel}`;
  if (!p.alternates.some((a) => a.href === self)) add(p.rel, 'hreflang links do not include the page itself');
  if (!p.alternates.some((a) => a.hreflang === 'x-default')) add(p.rel, 'hreflang links have no x-default');
  const seen = new Set();
  for (const a of p.alternates) {
    if (seen.has(a.hreflang)) add(p.rel, `hreflang ${a.hreflang} appears twice`);
    seen.add(a.hreflang);
    const target = byUrl.get(a.href);
    if (!target) add(p.rel, `hreflang ${a.hreflang} points at ${a.href}, which was not built`);
    else if (a.hreflang !== 'x-default' && target.lang !== a.hreflang) add(p.rel, `hreflang ${a.hreflang} points at a page in language "${target.lang}"`);
    else if (!target.alternates.some((b) => b.href === self)) add(p.rel, `${a.href} does not link back`);
  }
}
// The English home page must offer every language, and a translated page must declare its own language.
const home = pages.find((p) => p.rel === '/');
if (home && home.alternates.length < 3) add('/', 'the home page lists fewer than 3 language versions');
for (const p of pages) {
  const m = /^\/([a-z]{2}(?:-[a-z]{2})?)\//.exec(p.rel);
  if (m && p.rel !== '/404.html' && p.lang.toLowerCase() !== m[1]) add(p.rel, `html lang is "${p.lang}", expected "${m[1]}"`);
}

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

// Structured data (JSON-LD): every block must parse, and each kind of page needs its types with the required fields.
const defSource = ['loans', 'savings', 'maths', 'dates', 'health', 'students'].map((f) => readFileSync(`src/lib/calc/defs/${f}.ts`, 'utf8')).join(' ');
const calcSlugs = new Set([...defSource.matchAll(/slug: '([a-z0-9-]+)'/g)].map((m) => `/${m[1]}/`));
for (const p of pages) {
  const blocks = [...p.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => {
    try {
      return JSON.parse(m[1]);
    } catch (e) {
      add(p.rel, `JSON-LD does not parse: ${e.message}`);
      return null;
    }
  });
  const get = (type) => blocks.find((b) => b && b['@type'] === type);
  const need = (type) => {
    const b = get(type);
    if (!b) add(p.rel, `missing JSON-LD ${type}`);
    return b;
  };
  if (calcSlugs.has(p.rel)) {
    const app = need('WebApplication');
    if (app) {
      if (app.operatingSystem !== 'Any') add(p.rel, 'WebApplication operatingSystem is not "Any"');
      if (!app.applicationCategory) add(p.rel, 'WebApplication has no applicationCategory');
      if (app.offers?.price !== '0') add(p.rel, 'WebApplication offers.price is not 0');
    }
    const faq = need('FAQPage');
    if (faq && !(faq.mainEntity?.length >= 4)) add(p.rel, 'FAQPage has fewer than 4 questions');
    need('BreadcrumbList');
  } else if (p.rel.startsWith('/guides/') && p.rel !== '/guides/') {
    const art = need('Article');
    if (art && !(art.datePublished && art.dateModified)) add(p.rel, 'Article needs datePublished and dateModified');
    need('FAQPage');
    need('BreadcrumbList');
  } else if (p.rel === '/') {
    const org = need('Organization');
    if (org && !(org.name === 'Basic App Company' && org.sameAs?.length >= 3)) add(p.rel, 'Organization needs the name and 3 sameAs links');
    need('WebSite');
  }
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

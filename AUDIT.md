# Security, SEO and AI-answer audit: iduckcalculator.com

Started 2026-11-13. Each item is **Fixed**, **Already fine** or **Needs you**. The log at the bottom says what was checked and when.

## Part A: Security

| # | Item | Status | What was found or done |
|---|------|--------|------------------------|
| A1 | Baseline grades | Done | Before: securityheaders.com **D**; Mozilla Observatory **D (35/100)**, 3 tests failed. |
| A2 | Headers and Content-Security-Policy | Fixed | `public/_headers` now sets HSTS (1 year, includeSubDomains), nosniff, X-Frame-Options DENY, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy (camera, microphone, geolocation, payment, usb and sensors off), COOP same-origin and a CSP. The CSP is `default-src 'self'` with no outside hosts, no `unsafe-inline` and no `unsafe-eval`; `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`. The few inline scripts and the one inline style the build emits are allowed by hash: `scripts/csp.mjs` runs after `astro build`, hashes them and writes `dist/_headers`, and fails the build if a page has an inline style attribute or event handler. Three inline `style=` attributes (chart legend swatches, chat bubble shadow) became CSS classes. Every browser test now runs under the production policy, and one test proves an injected script and style are blocked. |
| A3a | No `eval()` / `new Function()` | Already fine | The scientific calculator uses a hand-written parser (`src/lib/calc/expr.ts`). A search of `src/` finds no `eval`, `new Function`, `document.write` or `dangerouslySetInnerHTML`. |
| A3b | No `innerHTML` with user input | Already fine | The only `innerHTML` use writes the built-in flag SVGs from a fixed table (`src/lib/flags.ts`); `set:html` is used only for the site's own JSON-LD. Search, the helper chat and settings use text nodes. Nothing is read from the URL. |
| A3c | Outside scripts and styles | Already fine | There are none. Every script, stylesheet and font is served from the site itself, so there is nothing to pin or hash. The CSP lists no outside host. |
| A4 | Forms, keys and secrets | Already fine | The feedback and request forms open the visitor's own mail app with a `mailto:` link (with a copy fallback). They post to no server, so there is nothing to protect with Turnstile and nothing is stored. A search of the working tree and all 21 commits for API keys, tokens, private keys and password assignments found nothing, and no `.env` or key file was ever committed. `.env` files are git-ignored. |
| A5a | Dependabot | Fixed in the repo; alerts need you | Added `.github/dependabot.yml` (weekly npm updates, monthly Actions updates) and a CI step `pnpm audit --prod --audit-level=high`. Production dependencies: no known vulnerabilities. One moderate issue in dev-only tooling (`minimatch` through ESLint) that never ships. GitHub's own **Dependabot alerts and security updates are off** (the API returns 404 for them); switching them on is an account setting, so it is yours. |
| A5b | Secret scanning and push protection | Needs you | The repo is private on GitHub's free plan. GitHub offers secret scanning and push protection for private repositories only as a paid feature. Not changed. No secrets are in the history today (see A4). |
| A5c | Branch protection on `main` | Needs you | GitHub answers "Upgrade to GitHub Pro or make this repository public to enable this feature" for both branch protection and rulesets. Not changed (no upgrades). Until then the rule is kept by habit: every change goes through a branch and a pull request with green CI. |
| A5d | Two-factor login | Needs you | GitHub does not tell this account's token. Check at https://github.com/settings/security. I did not set anything up. |
| A6 | Cloudflare TLS and bot settings | Needs you | Account-level security settings. Steps below. |
| A6b | SPF and DMARC records | Needs you (decision) | The domain does not send mail but **does receive** it through Cloudflare Email Routing, which already added `v=spf1 include:_spf.mx.cloudflare.net ~all`. A domain may have only one SPF record, so adding `v=spf1 -all` would replace the one Email Routing set up. Recommended: keep Cloudflare's record, change `~all` to `-all`, and add `_dmarc` = `v=DMARC1; p=reject;`. Not done. |
| A7 | DNSSEC | Needs you | Account-level security setting at Cloudflare and GoDaddy. Steps below. |
| A8 | GoDaddy domain lock and auto-renew | Needs you (report only) | Not checked: it needs a GoDaddy sign-in. Steps below. |
| A9 | `/.well-known/security.txt` | Fixed | Contact is the feedback page, expires 2027-11-13. A unit test keeps the expiry in the future. |
| A10 | Re-run the grades | Done | After the headers went live: securityheaders.com **A+**; Mozilla Observatory **A+ (130/100)**, 12 of 12 tests passed. Run on 2026-11-13 against https://iduckcalculator.com/. |

### Needs you: account settings (each takes a few minutes)
1. **GitHub, two-factor login:** https://github.com/settings/security. Turn on two-factor authentication if it is off.
2. **GitHub, Dependabot:** repository Settings, Advanced Security. Turn on "Dependabot alerts" and "Dependabot security updates".
3. **GitHub, secret scanning and branch protection:** both need a paid plan or a public repository. Decide whether either is worth it. If the repository is ever made public, turn on secret scanning with push protection and add a ruleset for `main` that blocks force pushes and deletion.
4. **Cloudflare, SSL/TLS (zone iduckcalculator.com):** SSL/TLS, Overview: encryption mode Full (strict). Edge Certificates: Always Use HTTPS on; Minimum TLS Version 1.2; TLS 1.3 on; Automatic HTTPS Rewrites on. Security, Bots: Bot Fight Mode on.
5. **Cloudflare, DNSSEC (do last):** DNS, Settings, DNSSEC, Enable. Copy the DS record details (key tag, algorithm, digest type, digest) into GoDaddy, Domain, DNS, DNSSEC, add the DS record. Then check the site loads. If anything fails, remove the DS record at GoDaddy first, then turn DNSSEC off at Cloudflare.
6. **GoDaddy:** Domain settings for iduckcalculator.com: Domain lock on, Auto-renew on.
7. **SPF and DMARC:** the decision in A6b.

## Part B: SEO, AEO and GEO

`pnpm seo:check` (`scripts/seo-audit.mjs`) now runs in CI after the build and fails on: more or fewer than one `<h1>`; a `<title>` of 60 characters or more, or a repeated one; a description of 155 characters or more, or a repeated one; a missing robots meta or canonical; a page missing from the sitemap, or a sitemap entry with no `lastmod`; a missing AI-crawler group in `robots.txt`.

| # | Item | Status | What was found or done |
|---|------|--------|------------------------|
| B1a | Robots meta on every page | Fixed | Every indexable page now has `<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">`. Before, none had one. Pages that are meant to stay out of search results (helper, feedback, request, settings, 404) keep `noindex` and are not in the sitemap. I could not read iduckpdf.com's tag to match it, because that site renders in the browser; the value is the one you specified. |
| B1b | robots.txt | Fixed | It allowed everything and named the sitemap already. Added explicit groups for Bingbot and Applebot; GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended and Applebot-Extended were there. |
| B1c | Cloudflare AI-bot settings, managed robots.txt, Crawler Hints | Needs you | Dashboard settings on the Cloudflare zone; see "Needs you" below. |
| B1d | Sitemap | Fixed | Lists every calculator, guide and content page (nothing that is noindex), every entry now has a `lastmod` (a guide's own updated date, or the site's last-updated date). The audit checks that each URL matches a built page, so none is broken. Redirects are not an issue: the site has none. |
| B8a | Family links | Fixed | iDuckConvert added to the "Also from iDuck" sidebar, the footer, the About page and the Organization `sameAs`. iDuckConvert is live and already links to this site. |
| B8b | "iDuckImg" to "iDuckIMG" | Fixed | Changed everywhere in this repo (pages, share text, tests, docs). |
| B8c | Do the sister sites link here? | Report only | iduckconvert.com: yes (2 links in its page source). iduckimg.com: no link to iduckcalculator.com in its page source. iduckpdf.com: its pages are built in the browser, so I could not see its links from the page source; check by hand. I did not edit them. |
| B8d | Bug found: share button | Fixed | The "Share" button on the Support page said "Share iDuckImg" and described image tools. It now shares iDuckCalculator. |
| B9a | Missing guide | Fixed | There were 42 guides for 43 calculators because the simple interest and basic calculators only shared a guide. Added "How to calculate simple interest" and "How to use the basic calculator": 44 guides, each calculator has its own. |
| B9b | Titles and descriptions | Fixed | Every `<title>` is now under 60 characters (the brand suffix is added only when the whole title still fits) and every description under 155; none repeats. Unit tests and the audit enforce it. |

### Needs you: Part B
1. **Cloudflare, AI crawlers (zone iduckcalculator.com):** Security, Bots (it may be called "AI Crawl Control" or "Block AI bots"): make sure AI crawlers are **allowed** and that "Manage your robots.txt" / managed robots.txt is off, so Cloudflare does not add its own rules on top of ours. Caching, Configuration: turn on "Crawler Hints" (IndexNow).
2. **Google Search Console:** add `iduckcalculator.com` as a **Domain** property, copy the TXT record it shows into Cloudflare DNS (`@` TXT), then Verify and submit `https://iduckcalculator.com/sitemap-index.xml`.
3. **Bing Webmaster Tools:** sign in, choose "Import from Google Search Console", and pick the property. Check that the sitemap shows.

## Log
- 2026-11-13: baseline scans. securityheaders.com: D. Mozilla Observatory: D (35). GitHub CLI is signed in as basicappcompany.

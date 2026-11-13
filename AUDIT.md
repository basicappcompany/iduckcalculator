# Security, SEO and AI-answer audit: iduckcalculator.com

Started 2026-11-13. Each item is **Fixed**, **Already fine** or **Needs you**. The log at the bottom says what was checked and when.

## Part A: Security

| # | Item | Status | What was found or done |
|---|------|--------|------------------------|
| A1 | Baseline grades | Done | Before: securityheaders.com **D**; Mozilla Observatory **D (35/100)**, 3 tests failed. After: see the end of this file. |
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
| A10 | Re-run the grades | See the end | |

### Needs you: account settings (each takes a few minutes)
1. **GitHub, two-factor login:** https://github.com/settings/security. Turn on two-factor authentication if it is off.
2. **GitHub, Dependabot:** repository Settings, Advanced Security. Turn on "Dependabot alerts" and "Dependabot security updates".
3. **GitHub, secret scanning and branch protection:** both need a paid plan or a public repository. Decide whether either is worth it. If the repository is ever made public, turn on secret scanning with push protection and add a ruleset for `main` that blocks force pushes and deletion.
4. **Cloudflare, SSL/TLS (zone iduckcalculator.com):** SSL/TLS, Overview: encryption mode Full (strict). Edge Certificates: Always Use HTTPS on; Minimum TLS Version 1.2; TLS 1.3 on; Automatic HTTPS Rewrites on. Security, Bots: Bot Fight Mode on.
5. **Cloudflare, DNSSEC (do last):** DNS, Settings, DNSSEC, Enable. Copy the DS record details (key tag, algorithm, digest type, digest) into GoDaddy, Domain, DNS, DNSSEC, add the DS record. Then check the site loads. If anything fails, remove the DS record at GoDaddy first, then turn DNSSEC off at Cloudflare.
6. **GoDaddy:** Domain settings for iduckcalculator.com: Domain lock on, Auto-renew on.
7. **SPF and DMARC:** the decision in A6b.

## Part B: SEO, AEO and GEO
(filled in as each batch ships)

## Log
- 2026-11-13: baseline scans. securityheaders.com: D. Mozilla Observatory: D (35). GitHub CLI is signed in as basicappcompany.

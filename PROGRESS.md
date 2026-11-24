# iDuckCalculator build progress

Tick items as they ship. A later session can pick up from the first unticked box.
Template: iDuckIMG (Astro static + Preact islands + Tailwind 4, pnpm). Theme matches iduckpdf.com and iduckimg.com.
Workflow: never push to main. Branch, PR, fix CI on the same PR, merge when green. Run `pnpm verify` before each commit.
Last synced 2026-11-22. Live: https://iduckcalculator.com. Detail and owners: `docs/status.html`.

## Step 0 and 1: setup
- [x] Account check: GitHub logged in as basicappcompany, primary email set to the company inbox (verified)
- [x] Studied sister repos (iduckpdf = Expo, iDuckIMG = Astro). Chose Astro (iDuckIMG) as the template
- [x] Repo created (meant to be private like the sisters, but it is PUBLIC; found on 2026-11-23, the owner keeps it public; recreated on 2026-11-23 with a cleaned history, see open items)
- [x] Scaffold: config, theme (global.css), shell (sidebar, top bar, Ctrl K, theme toggle, language switch, footer)
- [x] Generic calculator engine: registry, live form, formula, worked example, table, SVG chart, FAQ schema
- [x] Home, All calculators, settings (theme, currency, language), helper chat, roadmap, request, feedback, support, about, privacy, terms, 404
- [x] SEO: sitemap (1411 URLs, each with a lastmod), robots, canonical, OG/Twitter tags, og.png, favicon, llms.txt, _headers (canonical and social tags not re-read at last sync)
- [x] How-to guides: 56, one or more for every live calculator, figures checked by tests (tax guide included). Each new tax or scheme calculator needs its own guide.
- [x] Localization stage 1: 11 languages (en-US, en-GB, hi, bn, pt-BR, id, ru, de, es, fr, tr) with real URLs (`/de/`), hreflang, sitemap alternates, translated menus, footer and home page. None of the 9 machine-translated languages has been read by a native speaker
- [x] Localization stages 2 to 4: every calculator (text, form labels, results, notes and errors), every guide, the calculators and guides lists, About, Roadmap, Support, How we check and the search window, in all 11 languages. Privacy, Terms, the helper chat, Feedback, Request and Settings stay English
- [x] CI (verify + build + e2e) green on main

## Step 3: calculators (58 live of 61 planned)
### Loans & EMI
- [x] EMI  - [x] Home loan EMI  - [x] Car loan EMI  - [x] Personal loan EMI  - [x] Loan prepayment savings  - [x] Loan eligibility
### Savings & investing
- [x] SIP  - [x] Lumpsum  - [x] Step-up SIP  - [x] SWP  - [x] FD  - [x] RD  - [x] PPF (NSI and PPF Scheme 2019, read on 2026-11-14)  - [x] Sukanya Samriddhi (NSI and the 2019 Scheme, read on 2026-11-14)  - [ ] NPS
- [x] Compound interest  - [x] Simple interest  - [x] CAGR  - [x] Inflation  - [x] Retirement corpus
### Tax & salary (India) - rules MUST be looked up on official sources first
- [x] Income tax old vs new (tax year 2026-27, read from official sources on 2026-11-14)  - [ ] In-hand salary from CTC  - [x] HRA exemption (Income-tax Rules 2026, rule 279, read on 2026-11-14)  - [x] Gratuity (Code on Social Security, read on 2026-11-14)  - [x] GST add/remove (rates read from PIB and CBIC on 2026-11-14)  - [ ] TDS basics
### Tax & salary (United States) - rules read from IRS pages on 2026-11-15
- [x] US federal income tax (tax year 2026)  - [x] US take-home pay (federal income tax, Social Security, Medicare)  - [x] UK (see below)  - [x] Canada (see below)  - [x] Australia (see below)  - [x] Germany (see below) (plan: `docs/country-tax-design.md`)
### Tax & salary (United Kingdom) - rules read from GOV.UK pages on 2026-11-15
- [x] UK Income Tax (2026 to 2027, England, Wales, Northern Ireland and Scotland)  - [x] UK take-home pay (Income Tax and employee National Insurance)
### Tax & salary (Canada) - rules read from CRA pages on 2026-11-15
- [x] Canada federal income tax (2026)  - [x] Canada take-home pay (federal tax, CPP, EI; provincial tax NOT included)
### Tax & salary (Australia) - rules read from ATO pages (pasted by the owner) on 2026-11-22
- [x] Australia income tax (2026-27, with the low income tax offset and the Medicare levy)  - [x] Australia take-home pay (income tax and Medicare levy; employer super is not taken off)
### Tax & salary (Germany) - rules read from gesetze-im-internet.de on 2026-11-23 and the BMF Programmablaufplan 2026 on 2026-11-24
- [x] Germany income tax (2026: the section 32a tariff, splitting tariff, Solidarity Surcharge)  - [x] Germany take-home pay (2026: the BMF payroll algorithm for tax classes I to VI, the Solidarity Surcharge and the employee social insurance shares; the unit tests reproduce the plan's own check table)
### Everyday maths
- [x] Percentage (all forms)  - [x] Percentage change  - [x] Discount  - [x] Profit and loss  - [x] Average  - [x] Ratio  - [x] Fraction
- [x] Scientific  - [x] Basic
### Dates & time
- [x] Age  - [x] Date difference  - [x] Add/subtract days  - [x] Working days  - [x] Time duration  - [x] Countdown
### Health
- [x] BMI  - [x] BMR  - [x] TDEE  - [x] Body fat  - [x] Ideal weight  - [x] Water intake  - [x] Pregnancy due date
### Students
- [x] CGPA to percentage  - [x] GPA  - [x] Marks percentage  - [x] Attendance needed

## Step 4: guides
- [x] How EMI is calculated  - [x] Old vs new tax regime  - [x] SIP vs lumpsum  - [x] How to calculate percentage
- [x] 48 more how-to guides (59 in all), covering all 58 calculators (loans, savings, tax and schemes, maths, dates, health, students), grouped on the guides page

## Step 5: checks
- [x] Every calculator spot-checked against a known answer (unit tests)
- [x] Dark/light, Ctrl+K, language switch, no console errors, no sideways scroll on every page (Playwright, 152 passing on 2026-11-15; the sideways-scroll check was not re-confirmed at a phone-width viewport by hand)
- [x] Broken links check (2026-11-14): 126,900 internal links and anchors across 1173 built pages resolve; 33 of 34 external links return 200, and incometaxindia.gov.in/w/section-156-84 returns 403 to scripts (likely bot blocking; open it in a browser)

Measured 2026-11-24 on the Germany take-home branch before its merge: 744 unit tests passing (1 skipped) in 20 files (`pnpm verify`), 1470 pages built, 1465 sitemap URLs, SEO and i18n audits passed. Browser tests: 168 passing on 2026-11-22 (Australia build); on 2026-11-24 only the new calculator page and /tax/de/ were run locally (2 passed), and CI runs the full set on the pull request. CI: green again from 2026-11-23 (see open items). Security headers A+ on securityheaders.com and Mozilla Observatory (13 Nov); mobile PageSpeed 100/100/100/100 on the home page, the EMI page and a guide (13 Nov, not re-measured). See AUDIT.md for the security and SEO audit.

## Open items and decisions
- Email Routing is set up for hello@ and feedback@iduckcalculator.com (MX, SPF, DKIM live; both rules Active, forwarding to the company inbox; catch-all off). A real test message has not been sent: send one from another mailbox to each address and confirm it arrives.
- Income tax, GST, gratuity, HRA, PPF and Sukanya Samriddhi are built, each citing the official sources read on 2026-11-14. In-hand salary, TDS and NPS are not built: read the official sources first, and give each page a "rules as of" date.
- DuckConvert (iduckconvert.com) is live, links back here, and is in the sidebar, footer and About. iduckimg.com does not link to this site in its page source; iduckpdf.com's links could not be read.
- Ask the helper is now "Duck", styled like iDuckIMG, and answers simple sums and "X% of Y" itself. Every page, the home page included, defaults to light whatever the device setting, with a light/dark toggle; a saved choice (light, dark or Match my device) stays on every page until changed.
- Mobile Lighthouse (PageSpeed Insights, 13 Nov): the home page, the EMI page and a guide score 100 on Performance, Accessibility, Best Practices and SEO. Other pages were not measured.
- Security headers: A+ on securityheaders.com and Mozilla Observatory (13 Nov). Search Console (Success) and Bing (Processing) have the sitemap; keep the Google verification TXT record in DNS.
- Needs the account owner (steps in AUDIT.md): GitHub two-factor login and Dependabot alerts (secret scanning and branch protection need a paid plan), Cloudflare TLS and bot settings, Crawler Hints, DNSSEC, GoDaddy lock and auto-renew, the SPF and DMARC decision.
- Country tax and salary calculators (US, UK, Canada, Australia, Germany): plan in `docs/country-tax-design.md`. Built: the plumbing (country and currency fields, group renamed "Tax & salary"), the `/tax/` hubs, the US federal slice (income tax and take-home pay, two guides, IRS sources read 2026-11-15, state tax and credits left out) and the UK (Income Tax with Scotland, take-home pay with National Insurance, two guides, GOV.UK sources read 2026-11-15, student loans and pension relief left out) and Canada (federal income tax, take-home pay with CPP and EI, two guides, CRA sources read 2026-11-15, provincial tax left out) and Australia (income tax with the low income tax offset and the Medicare levy, take-home pay, two guides, ATO pages read 2026-11-22, other offsets, HELP and the Medicare levy surcharge left out; the Medicare levy thresholds are the 2025-26 ones, the latest published). and Germany (income tax from the section 32a tariff with the Solidarity Surcharge and the splitting tariff, laws read on gesetze-im-internet.de 2026-11-23; take-home pay from the BMF payroll algorithm, the PAP 2026 read on 2026-11-24, with tax classes I to VI and the employee social insurance shares, matching the plan's printed check table; two guides; church tax, child allowances, private health insurance and special rules left out). Next: Canadian provinces, then India salary/TDS/NPS.
- Hardening done 2026-11-16 (PRs 29 to 32): a weekly check of the official tax pages (`scripts/rules-watch.mjs`; India not covered (Germany added on 2026-11-24), Australia cannot be because the ATO returns 403 to scripts; the workflow had a YAML error on its first run, fixed; a manual run on 2026-11-16 succeeded), `scripts/i18n/orphans.mjs` to keep translations when English is reworded, an extra machine-translation warning on tax pages in the nine unreviewed languages (decision: keep all 11 languages), and browser tests that serve the existing build (`E2E_NO_BUILD=1`). Still open from the architecture review: rules as versioned data files, a shared tax engine, the English-only pages, generated doc counts.
- **Needs the account owner now (2026-11-23):** a credential (an API key in `claude-toggle.bat`) was committed on 2026-11-14 and was readable in the public repo for 9 days. The file is untracked and ignored and the key is not in the new repository (see the next item), but the old repository still holds it until it is deleted. Do, in order: (1) rotate the key in the Anthropic Console and check usage since 14 Nov, (2) turn on secret scanning and push protection on the new repo (free on a public repo), (3) delete `iduckcalculator-old` (the site no longer depends on it). Then read the new key from an environment variable in the launcher instead of writing it into the file.
- **Repository recreated (2026-11-23):** `basicappcompany/iduckcalculator` is a new public repository holding the cleaned history (47 commits: no `claude-toggle.bat`, no key, no company mailbox in any file, author or committer; identities are GitHub noreply addresses). The old repository was renamed `iduckcalculator-old` and made private; pull request numbers restart at #1, and every `#nn` in these notes refers to the old repo. Cloudflare Pages was reconnected to the new repo on 2026-11-24: the existing project (no new project, no domain move, no DNS change; the Cloudflare GitHub app first needed the new repo under Repository access). Cloudflare reported a successful deploy of `main` (0f9c4bf) and the live home page, /au-income-tax-calculator/ and /tax/de/ answer 200 without a noindex header. CI has not run on the new repo yet (the first pushes were docs-only, skipped by `paths-ignore`; the first code pull request runs it).
- GitHub Actions: the run for the #41 merge failed to start on 2026-11-22 ("recent account payments have failed or your spending limit needs to be increased"); jobs start and pass again from 2026-11-23 (old-repo PRs 44, 45, 46 and the rewritten main green). The cause was not confirmed. The footer "Last updated" date (`LAST_UPDATED` in `src/lib/seo.ts`) is 2026-11-24 (changed in the Germany take-home pay pull request).
- CI minutes (2026-11-22, PR #40): Dependabot now runs monthly with minor and patch updates grouped into one pull request, TypeScript major versions are ignored (`astro check` does not support TypeScript 7), and a change to `.github/dependabot.yml` starts no run. Merged on 2026-11-22: astro 7.4.13, @astrojs/sitemap 3.7.6, @astrojs/preact 6.1.6 and the dev-tooling group (eslint 10.15.0, prettier 3.10.1, typescript-eslint 8.73.0, vitest 5.1.1, @playwright/test 1.65.1).
- Australia (PR #42, 2026-11-22): the pasted ATO rates page lost its year headings (the 15c table was read as 2026-27 from its order) and the Medicare levy thresholds are the 2025-26 ones; re-read the ATO pages in July and after the May Budget. The 2026-27 Medicare levy thresholds are not yet published.
- Not yet done: tips provider (Dodo Payments), native read-throughs of the 9 machine-translated languages. The US, UK and Canada tax sources were last read on 2026-11-15, the India ones on 2026-11-14; the weekly check covers the first three and, since 2026-11-24, the Germany law and contribution pages (read on 2026-11-23 and 2026-11-24).
- Some office or VPN resolvers still cache the old GoDaddy parking page for iduckcalculator.com (up to 48 hours from the nameserver change); check the live site with `curl --resolve` or from a phone on mobile data.

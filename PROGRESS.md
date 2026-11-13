# iDuckCalculator build progress

Tick items as they ship. A later session can pick up from the first unticked box.
Template: iDuckIMG (Astro 7.4.10 static + Preact islands + Tailwind 4, pnpm). Theme matches iduckpdf.com and iduckimg.com.
Workflow: never push to main. Branch, PR, fix CI on the same PR, merge when green. Run `pnpm verify` before each commit.
Last synced 2026-11-13. Live: https://iduckcalculator.com. Detail and owners: `docs/status.html`.

## Step 0 and 1: setup
- [x] Account check: GitHub logged in as basicappcompany, primary email the company inbox (verified)
- [x] Studied sister repos (iduckpdf = Expo, iDuckIMG = Astro). Chose Astro (iDuckIMG) as the template
- [x] Private repo created (same visibility as sisters)
- [x] Scaffold: config, theme (global.css), shell (sidebar, top bar, Ctrl K, theme toggle, language switch, footer)
- [x] Generic calculator engine: registry, live form, formula, worked example, table, SVG chart, FAQ schema
- [x] Home, All calculators, settings (theme, currency, language), helper chat, roadmap, request, feedback, support, about, privacy, terms, 404
- [x] SEO: sitemap (96 URLs, each with a lastmod), robots, canonical, OG/Twitter tags, og.png, favicon, llms.txt, _headers (canonical and social tags not re-read at last sync)
- [x] How-to guides: 45, one or more for every live calculator, figures checked by tests (tax guide included). Each new tax or scheme calculator needs its own guide.
- [x] Turkish (TR) chrome translation (not reviewed by a native speaker)
- [x] CI (verify + build + e2e) green on main

## Step 3: calculators (46 live of 52 planned)
### Loans & EMI
- [x] EMI  - [x] Home loan EMI  - [x] Car loan EMI  - [x] Personal loan EMI  - [x] Loan prepayment savings  - [x] Loan eligibility
### Savings & investing
- [x] SIP  - [x] Lumpsum  - [x] Step-up SIP  - [x] SWP  - [x] FD  - [x] RD  - [ ] PPF  - [ ] Sukanya Samriddhi  - [ ] NPS
- [x] Compound interest  - [x] Simple interest  - [x] CAGR  - [x] Inflation  - [x] Retirement corpus
### Tax & salary (India) - rules MUST be looked up on official sources first
- [x] Income tax old vs new (tax year 2026-27, read from official sources on 2026-11-14)  - [ ] In-hand salary from CTC  - [ ] HRA exemption  - [x] Gratuity (Code on Social Security, read on 2026-11-14)  - [x] GST add/remove (rates read from PIB and CBIC on 2026-11-14)  - [ ] TDS basics
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
- [x] 39 more how-to guides, covering all 43 calculators (loans, savings, maths, dates, health, students), grouped on the guides page

## Step 5: checks
- [x] Every calculator spot-checked against a known answer (unit tests)
- [x] Dark/light, Ctrl+K, language switch, no console errors, no sideways scroll on every page (Playwright, 117 passing; the sideways-scroll check was not re-confirmed at a phone-width viewport by hand)
- [ ] Broken links check (no link checker has been run)

Measured at last sync: 405 unit tests in 10 files, 123 browser tests, 107 pages built, 102 sitemap URLs. Security headers A+ on securityheaders.com and Mozilla Observatory; mobile PageSpeed 100/100/100/100 on the home page, the EMI page and a guide. See AUDIT.md for the security and SEO audit.

## Open items and decisions
- Email Routing is set up for hello@ and feedback@iduckcalculator.com (MX, SPF, DKIM live; both rules Active, forwarding to the company inbox; catch-all off). A real test message has not been sent: send one from another mailbox to each address and confirm it arrives.
- Tax, salary, GST, TDS, PPF, Sukanya and NPS calculators are not built. The official sources must be read first (they were unreadable from this machine earlier), and each page needs a "rules as of" date.
- DuckConvert (iduckconvert.com) is live, links back here, and is in the sidebar, footer and About. iduckimg.com does not link to this site in its page source; iduckpdf.com's links could not be read.
- Ask the helper is now "Duck", styled like iDuckIMG, and answers simple sums and "X% of Y" itself. Every page, the home page included, defaults to light whatever the device setting, with a light/dark toggle; a saved choice (light, dark or Match my device) stays on every page until changed.
- Mobile Lighthouse (PageSpeed Insights, 13 Nov): the home page, the EMI page and a guide score 100 on Performance, Accessibility, Best Practices and SEO. Other pages were not measured.
- Security headers: A+ on securityheaders.com and Mozilla Observatory (13 Nov). Search Console (Success) and Bing (Processing) have the sitemap; keep the Google verification TXT record in DNS.
- Needs the account owner (steps in AUDIT.md): GitHub two-factor login and Dependabot alerts (secret scanning and branch protection need a paid plan), Cloudflare TLS and bot settings, Crawler Hints, DNSSEC, GoDaddy lock and auto-renew, the SPF and DMARC decision, Dependabot PR #9.
- Not yet done: tips provider (Dodo Payments), native Turkish read-through, a broken-link check.
- Some office or VPN resolvers still cache the old GoDaddy parking page for iduckcalculator.com (up to 48 hours from the nameserver change); check the live site with `curl --resolve` or from a phone on mobile data.

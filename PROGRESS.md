# iDuckCalculator build progress

Tick items as they ship. A later session can pick up from the first unticked box.
Template: iDuckImg (Astro 7.4.10 static + Preact islands + Tailwind 4, pnpm). Theme matches iduckpdf.com and iduckimg.com.
Workflow: never push to main. Branch, PR, fix CI on the same PR, merge when green. Run `pnpm verify` before each commit.
Last synced 2026-11-13. Live: https://iduckcalculator.com. Detail and owners: `docs/status.html`.

## Step 0 and 1: setup
- [x] Account check: GitHub logged in as basicappcompany, primary email the company inbox (verified)
- [x] Studied sister repos (iduckpdf = Expo, iDuckImg = Astro). Chose Astro (iDuckImg) as the template
- [x] Private repo created (same visibility as sisters)
- [x] Scaffold: config, theme (global.css), shell (sidebar, top bar, Ctrl K, theme toggle, language switch, footer)
- [x] Generic calculator engine: registry, live form, formula, worked example, table, SVG chart, FAQ schema
- [x] Home, All calculators, settings (theme, currency, language), helper chat, roadmap, request, feedback, support, about, privacy, terms, 404
- [x] SEO: sitemap (52 URLs), robots, canonical, OG/Twitter tags, og.png, favicon, llms.txt, _headers (canonical and social tags not re-read at last sync)
- [ ] Four starter guides: 3 of 4 done (EMI, SIP vs lumpsum, percentage); old vs new tax regime waits on the income tax calculator
- [x] Turkish (TR) chrome translation (not reviewed by a native speaker)
- [x] CI (verify + build + e2e) green on main

## Step 3: calculators (41 live of 52 planned)
### Loans & EMI
- [x] EMI  - [x] Home loan EMI  - [x] Car loan EMI  - [x] Personal loan EMI  - [x] Loan prepayment savings  - [x] Loan eligibility
### Savings & investing
- [x] SIP  - [x] Lumpsum  - [x] Step-up SIP  - [x] SWP  - [x] FD  - [x] RD  - [ ] PPF  - [ ] Sukanya Samriddhi  - [ ] NPS
- [x] Compound interest  - [x] Simple interest  - [x] CAGR  - [x] Inflation  - [x] Retirement corpus
### Tax & salary (India) - rules MUST be looked up on official sources first
- [ ] Income tax old vs new  - [ ] In-hand salary from CTC  - [ ] HRA exemption  - [ ] Gratuity  - [ ] GST add/remove  - [ ] TDS basics
### Everyday maths
- [x] Percentage (all forms)  - [x] Percentage change  - [x] Discount  - [x] Profit and loss  - [x] Average  - [x] Ratio  - [x] Fraction
- [ ] Scientific  - [ ] Basic
### Dates & time
- [x] Age  - [x] Date difference  - [x] Add/subtract days  - [x] Working days  - [x] Time duration  - [x] Countdown (built, no known-answer test yet)
### Health
- [x] BMI  - [x] BMR  - [x] TDEE  - [x] Body fat  - [x] Ideal weight  - [x] Water intake  - [x] Pregnancy due date
### Students
- [x] CGPA to percentage  - [x] GPA  - [x] Marks percentage  - [x] Attendance needed

## Step 4: guides
- [x] How EMI is calculated  - [ ] Old vs new tax regime  - [x] SIP vs lumpsum  - [x] How to calculate percentage

## Step 5: checks
- [ ] Every calculator spot-checked against a known answer (unit tests): 40 of 41; countdown timer has none
- [x] Dark/light, Ctrl+K, language switch, no console errors, no sideways scroll on every page (Playwright, 66 passing; the sideways-scroll check was not re-confirmed at a phone-width viewport by hand)
- [ ] Broken links check (no link checker has been run)

Measured at last sync: 47 unit tests in 3 files, 66 browser tests, 57 pages built, 52 sitemap URLs, CI green on main.

## Open items and decisions
- Email Routing is set up for hello@ and feedback@iduckcalculator.com (MX, SPF, DKIM live; both rules Active, forwarding to the company inbox; catch-all off). A real test message has not been sent: send one from another mailbox to each address and confirm it arrives.
- Tax, salary, GST, TDS, PPF, Sukanya and NPS calculators are not built. The official sources must be read first (they were unreadable from this machine earlier), and each page needs a "rules as of" date.
- Scientific and basic calculators need their own interface.
- No CLAUDE.md in the repo yet.
- DuckConvert: the Cloudflare account has an iduckconvert.com zone, but the footer and sidebar link iDuckPDF and iDuckImg only until it is live.
- Not yet done: mobile Lighthouse measurement, Search Console property and sitemap submission, tips provider (Dodo Payments), native Turkish read-through.
- Some office or VPN resolvers still cache the old GoDaddy parking page for iduckcalculator.com (up to 48 hours from the nameserver change); check the live site with `curl --resolve` or from a phone on mobile data.

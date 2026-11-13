# iDuckCalculator build progress

Tick items as they ship. A later session can pick up from the first unticked box.
Template: iDuckImg (Astro 7.4.10 static + Preact islands + Tailwind 4, pnpm). Theme matches iduckpdf.com and iduckimg.com.
Workflow: never push to main. Branch, PR, fix CI on the same PR, merge when green. Run `pnpm verify` before each commit.

## Step 0 and 1: setup
- [x] Account check: GitHub logged in as basicappcompany, primary email the company inbox (verified)
- [x] Studied sister repos (iduckpdf = Expo, iDuckImg = Astro). Chose Astro (iDuckImg) as the template
- [x] Private repo created (same visibility as sisters)
- [ ] Scaffold: config, theme (global.css), shell (sidebar, top bar, Ctrl K, theme toggle, language switch, footer)
- [ ] Generic calculator engine: registry, live form, formula, worked example, table, SVG chart, FAQ schema
- [ ] Home, All calculators, settings (theme, currency, language), helper chat, roadmap, request, feedback, support, about, privacy, terms, 404
- [ ] SEO: sitemap, robots, canonical, OG/Twitter tags, og.png 1200x630, favicon, llms.txt, _headers
- [ ] Four starter guides
- [ ] Turkish (TR) chrome translation
- [ ] CI (verify + build + e2e) green

## Step 3: calculators
### Loans & EMI
- [ ] EMI  - [ ] Home loan EMI  - [ ] Car loan EMI  - [ ] Personal loan EMI  - [ ] Loan prepayment savings  - [ ] Loan eligibility
### Savings & investing
- [ ] SIP  - [ ] Lumpsum  - [ ] Step-up SIP  - [ ] SWP  - [ ] FD  - [ ] RD  - [ ] PPF  - [ ] Sukanya Samriddhi  - [ ] NPS
- [ ] Compound interest  - [ ] Simple interest  - [ ] CAGR  - [ ] Inflation  - [ ] Retirement corpus
### Tax & salary (India) - rules MUST be looked up on official sources first
- [ ] Income tax old vs new  - [ ] In-hand salary from CTC  - [ ] HRA exemption  - [ ] Gratuity  - [ ] GST add/remove  - [ ] TDS basics
### Everyday maths
- [ ] Percentage (all forms)  - [ ] Percentage change  - [ ] Discount  - [ ] Profit and loss  - [ ] Average  - [ ] Ratio  - [ ] Fraction
- [ ] Scientific  - [ ] Basic
### Dates & time
- [ ] Age  - [ ] Date difference  - [ ] Add/subtract days  - [ ] Working days  - [ ] Time duration  - [ ] Countdown
### Health
- [ ] BMI  - [ ] BMR  - [ ] TDEE  - [ ] Body fat  - [ ] Ideal weight  - [ ] Water intake  - [ ] Pregnancy due date
### Students
- [ ] CGPA to percentage  - [ ] GPA  - [ ] Marks percentage  - [ ] Attendance needed

## Step 4: guides
- [ ] How EMI is calculated  - [ ] Old vs new tax regime  - [ ] SIP vs lumpsum  - [ ] How to calculate percentage

## Step 5: checks
- [ ] Every calculator spot-checked against a known answer (unit tests)
- [ ] Dark/light, mobile width, Ctrl+K, language switch, no console errors, no broken links

## Open items and decisions
- The repo has no commits on main yet. Pushing the first commit straight to main was blocked, so work starts on a branch.
- Contact addresses hello@ and feedback@iduckcalculator.com need Cloudflare Email Routing set up (receive only), as on iduckimg.com.
- DuckConvert is named in the brief as a sister site but no repo or site was found; the footer links iDuckPDF and iDuckImg only until it exists.

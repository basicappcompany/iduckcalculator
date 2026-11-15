# Country tax and salary calculators: design

Status: step 1 (plumbing, PR #25) and step 2 (United States federal, with the `/tax/` hubs) built on 2026-11-15; steps 3 onward not started. First countries decided by the owner on 2026-11-15: United States, United Kingdom, Canada, Australia, Germany, in that order. The language question (section 6) was not answered, so the default stands: the full set of 11 languages, no new code. Decisions marked **[you]** are still open.

## 1. Decision and goal

Keep one website (iduckcalculator.com) and add the **country** as a second dimension next to the language. Today the tax group is India only (`Tax & salary (India)`: income tax, GST, gratuity, HRA). The goal is the same kinds of calculators for the main countries, each built from that country's official source and shown with the tax year and the date it was read.

Language and country stay independent: a German speaker can read the US page in German, and an English speaker can read the German page in English.

## 2. What the code looks like today (read on 2026-11-15)

- `CalcDef` (`src/lib/calc/types.ts`) has no country. `CALC_GROUPS` has one `tax` group named "Tax & salary (India)". `rules?: RulesInfo` (year, asOf, sources) already exists and is shown on the page.
- India's tax code is `src/lib/calc/defs/tax.ts`: slabs, a rebate with marginal relief, surcharge, cess, two regimes. Its figures are hand-worked in `tests/unit/tax.test.ts` and quoted by the tax guide.
- Every calculator is one flat URL, `/<slug>/`, built by `src/pages/[slug].astro`, and `/<lang>/<slug>/` by `src/pages/[lang]/[slug].astro`. Sitemap alternates, hreflang, the SEO audit, the i18n catalog test and the e2e suite all walk the registry, so anything that is a registry entry on a flat URL is covered for free.
- Money: `CalculatorTool.tsx` formats money in the currency chosen in Settings (default INR, six currencies). That is wrong for a country page: US brackets shown in rupees mean nothing.
- "India" appears in a few visible places outside the tax file (the group name, `RoadmapPage.astro`, `en.ts`, some scheme and student calculators), which need a wording pass.

## 3. URL scheme (changed from my first suggestion)

I first suggested `/tax/<country>/<calculator>/`. Reading the routing, a flat slug with a country prefix is better, because it needs no new routes and keeps every existing check working.

| Thing | URL | Notes |
|---|---|---|
| India calculators | `/income-tax-calculator/`, `/gst-calculator/` ... | Unchanged. Keep their ranking. |
| Other countries | `/us-income-tax-calculator/`, `/uk-income-tax-calculator/`, `/ca-take-home-pay-calculator/` | Slug = country code + name. Flat, keyword-rich, one registry entry each. |
| Country hub | `/tax/` (all countries) and `/tax/us/` (one country) | Listing pages only. They link to that country's calculators and guides. |
| Other languages | `/de/us-income-tax-calculator/`, `/de/tax/us/` | Same mechanism as today. |

Rules: a country calculator's slug starts with its lowercase ISO code; India's legacy slugs stay without a prefix and are never renamed or redirected. Use `uk` for the United Kingdom, as people search for it. The hub paths do not collide with the language routes because `tax` is not a language code; a registry test should forbid a slug or language equal to `tax`.

## 4. Data model

Add to `CalcDef`:

- `country?: CountryCode` (`'in'` for the existing tax group; absent for country-neutral calculators such as EMI or percentage).
- `currency?: string`: when set, the page uses this currency and ignores the Settings choice, and shows no currency selector effect. Grouping and decimals come from that currency's locale.

New `src/lib/calc/countries.ts`:

```ts
interface Country {
  code: 'us' | 'uk' | 'ca' | ...;
  name: string;               // "United States"
  currency: string;           // 'USD'
  taxYearLabel: (v) => string;
  authority: { name: string; url: string };   // IRS, HMRC, CRA, ATO...
}
```

New `src/lib/calc/tax/<cc>.ts` per country: a **rule pack**, which is data plus small pure functions, with its own `RulesInfo` (year, `asOf`, official sources) at the top:

- `brackets` (by filing status where the country has them), `standardDeduction` or personal allowance, credits, employee social contributions (rate, floor, ceiling), and an optional regional layer (US state, Canadian province).
- A shared helper `bracketTax(income, brackets)` (India's `slabTax` is the same function; I would move it, not rewrite it).
- Countries differ too much for one rule engine with options for everything (India has a rebate with marginal relief and surcharges; the UK has a tapered allowance and Scottish bands; Germany has a formula, not brackets). So: **shared helpers, one hand-written `compute` per country**, each tested against official worked examples. Do not build a generic rules interpreter.

Leave `tax.ts` (India) as it is in the first pass. Moving it onto the new layout can come later if it is cheap; the risk is its hand-worked tests and the tax guide.

Registry changes: rename the group to "Tax & salary", and make the home page, sidebar, All calculators page, Ctrl K and `llms.txt` show the country (a country label, or sub-headings under the group). `related` stays exactly three existing slugs, kept within the same country.

## 5. Calculator set per country

| Wave | Calculator | Notes |
|---|---|---|
| 1 | Income tax | Resident employee, one filing status at a time, national tax only. |
| 1 | Take-home pay (salary after tax) | Income tax plus employee social contributions. |
| 2 | VAT / sales tax / GST add and remove | Mostly a rate table; the country's own page reads the official rate. |
| later | Pension, capital gains, self-employed | Only when asked for, and only with sources read. |

Every page states **what it leaves out** (for example, US state tax in v1, student loans, pension salary sacrifice) and says it is an estimate, not advice. The India "In-hand salary from CTC", TDS and NPS stay on the existing to-do list.

## 6. Language

The existing pipeline applies unchanged: a country page asks `tt('...')` for its text, the catalog tests demand all 11 languages, and `pnpm i18n:audit` fails if a translated page shows English. Cost: each country adds a few hundred strings to be translated for 10 languages, and the Haiku translations of tax terms have not been read by native speakers, which matters more for tax than for a percentage calculator. **[you]** Default: keep the full set (no new code). Alternative: limit country pages to English plus the country's own language; that needs a `langs` field and changes to the catalog test, the audit and hreflang.

## 7. Sources, accuracy and upkeep

- Per country, an official government source is read by a person in a browser in that session (as for India), and the page shows tax year and `asOf` date. No figure from memory; if a source cannot be read, the calculator is not built.
- Tax years differ: the US and Germany follow the calendar year, the UK starts 6 April, India 1 April, Australia 1 July. Add a yearly review item per country to `docs/status.html` and to `docs-sync` (re-read, bump `asOf`, update the hand-worked test figures).
- Do not add a test that fails when a date gets old: it would turn CI red for reasons unrelated to a PR. Keep it as a docs-sync check.
- Known-answer tests use the authority's own worked examples where one exists, and hand calculation otherwise, recorded in the test.

## 8. First countries **[you]**

I have not measured demand, so this is by reasoning, not data. Check Search Console and a keyword tool before fixing the order.

- Wave 1 (large audiences, and sources that exist in English): United States (federal), United Kingdom, Canada (federal; provinces later), Australia, Germany.
- Wave 2 (the site's other languages): France, Spain, Brazil, Indonesia, Turkey, then others by demand. Russia needs a deliberate decision.
- Note: the UAE and some other countries have no personal income tax, so a take-home page would be a different, shorter page (social contributions and end-of-service benefits).

## 9. Delivery plan (each step is one pull request)

1. **Plumbing, no new country (built).** `country` and `currency` fields on `CalcDef`, the currency pinned on a country page (`CalculatorTool`), CAD and AUD added to the currency list, the group renamed to "Tax & salary" in every language, `src/lib/calc/countries.ts` (currency per country), `tests/unit/countries.test.ts` (slug prefix rule, `tax` reserved, pinned currency, related links stay in one country), the six India calculators tagged `country: 'in'`. India's pages and URLs are unchanged. **Moved to step 2:** the `/tax/` and `/tax/<cc>/` hub pages and the country labels in the list views. A hub that lists one country (India) is a thin page, and the labels and hubs need country names and intro text translated into 10 languages; both are worth doing once the second country exists.
2. **United States, federal, as a vertical slice:** the `/tax/` and `/tax/us/` hubs and country labels (see step 1), rule pack, income tax and take-home pay, a guide, translations, tests, the hub, `TRUST` entry and the status page. This proves the pattern.
3. **UK, Canada, Australia, Germany**, one PR per country, using the checklist below.
4. Wave 2 and VAT / sales tax by demand.

Checklist for a country PR: read and cite the official sources with the date, rule pack, known-answer tests from official examples, calculator entries (title 65 characters or fewer, 4 to 6 FAQs, 3 related), `answers.ts`, `reference.ts`, `sources.ts` entries, a guide with every figure recomputed in `guides.test.ts`, hub link, translations for all languages, `pnpm verify`, `pnpm build`, `pnpm test:e2e`, status page.

## 10. Risks and open questions

- **Upkeep grows with every country.** About one source re-read per country per year, done by hand because government sites often block scripts.
- **Wrong figures cost trust.** Keep the scope narrow, say what is left out, and show the source and date.
- **US state and Canadian provincial tax** matter for take-home pay. v1 is federal only and says so; add states or provinces one at a time through a select field.
- **Mixed scope in the list views**: country-neutral calculators and country-specific ones need clear labelling so a visitor in one country does not land on another's tax page. A country filter on the tax group is the simplest fix.
- **Search ranking**: English pages for several countries share one language, so each needs a distinct title and H1 with the country name; the SEO audit already enforces unique titles.
- **[you]** First countries and order; full 11-language set or limited; whether India moves onto the new layout later.

# iDuckCalculator

Free calculators that run in the browser. https://iduckcalculator.com. Third site in the iDuck family by Basic App Company (iduckpdf.com, iduckimg.com). Repo `basicappcompany/iduckcalculator` (private).

## Stack and commands
Astro 7.4.10 (static output), Preact 11.2.0 islands, Tailwind 4.3.5, TypeScript 6.0.3, Vitest 5.1.0, Playwright 1.65.0, pnpm 12.14.0, Node 22.23.4 (`.node-version`). All versions are exact pins in `package.json`.

- `pnpm dev` | `pnpm build` (output `dist/`) | `pnpm preview`
- `pnpm verify` = `astro check` + `eslint` + `vitest run`. Run it before every commit.
- `pnpm test:e2e` = Playwright against a built site. Needs `pnpm build` first.
- CI (`.github/workflows/ci.yml`): check, lint, test, build, e2e on every PR and on `main`.

## Workflow (the user's rules)
- Never push to `main`. New branch, commit, push, pull request, fix CI on the same PR, merge when green, delete the branch, pull `main`.
- Docs-only changes are batched into one PR at the end of the day (the `docs-sync` skill), unless the user asks sooner. Docs that describe code go in that code's PR.
- Commit and PR bodies end with the attribution lines the harness gives.
- Ask for an explicit yes in chat before changing DNS records or nameservers.

## Deploy
Cloudflare Pages git integration deploys `main` (project `iduckcalculator`, build `pnpm build`, output `dist`). Domain on Cloudflare DNS, registrar GoDaddy. `iduckcalculator.pages.dev` sends `X-Robots-Tag: noindex`; the real domain must not (`public/_headers`, never a bare `/*` noindex rule).
Contact mail: Cloudflare Email Routing forwards hello@ and feedback@iduckcalculator.com to the company inbox (receive only, catch-all off).

## Layout
- `src/lib/calc/types.ts`: the `CalcDef` model. A calculator is a field list plus one pure `compute` function.
- `src/lib/calc/defs/*.ts`: the calculators by group; `src/lib/calc/index.ts` is the registry (home page, sidebar, search, sitemap and related links all read it).
- `src/lib/calc/expr.ts`: the safe expression parser behind the scientific calculator (no `eval`).
- `src/components/CalculatorTool.tsx` renders any calculator; `src/pages/[slug].astro` builds every calculator page.
- `src/pages/` the rest of the site; `src/lib/i18n.ts` EN/TR chrome; `src/lib/seo.ts` has `LAST_UPDATED` (footer date).
- `tests/unit` (Vitest), `tests/e2e` (Playwright), `docs/status.html` (self-contained project status page, no external requests), `PROGRESS.md` (checklist).

## Adding a calculator
1. Add an entry to the right file in `src/lib/calc/defs/`: slug, name, group, summary, quick answer, title (<= 65 chars), description (70 to 175), fields, `compute`, formula, worked example, `how`, 4 to 6 FAQs, exactly 3 `related` slugs that exist.
2. Add a known-answer unit test (the worked example's numbers). The registry test already enforces the page fields.
3. Run `pnpm verify`, `pnpm build`, `pnpm test:e2e`. The e2e suite reads the registry, so the new page is covered automatically.
4. Tax and savings-scheme calculators: read the official source first (incometax.gov.in, India Post, the Finance Ministry), put the financial year and the date it was read in `rules`, and never use a rate from memory.

## Gotchas
- A built calculator counts as done only with its page on `main`, a known-answer test, FAQs and 3 related links.
- Do not trust this machine's DNS for iduckcalculator.com: an office or VPN resolver cached the old GoDaddy parking page, which answers 200 for every path. Check the live site with `curl --resolve iduckcalculator.com:443:104.21.85.203 https://iduckcalculator.com/...` (use `MSYS_NO_PATHCONV=1` in Git Bash) or from a phone on mobile data.
- The e2e test "typing into the EMI calculator updates the result live" failed once when the machine was heavily loaded and passed alone and on repeat. If it fails, re-run it before suspecting the code.
- Turkish covers the page chrome only; calculator copy stays English. Never mark it reviewed before a native speaker reads it.
- Not built yet: income tax, salary, HRA, gratuity, GST, TDS, PPF, Sukanya, NPS (official sources not read), and the "old vs new tax regime" guide.

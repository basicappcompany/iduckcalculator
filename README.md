# iDuckCalculator (iduckcalculator.com)

Free calculators that run in your browser. No sign-up, no ads, nothing uploaded. Part of the iDuck family by Basic App Company, sharing the look of iduckpdf.com and iduckimg.com.

Stack: Astro 7 (static), Preact islands, Tailwind 4, pnpm, Vitest, Playwright. See PROGRESS.md for status.

`pnpm dev` | `pnpm build` | `pnpm verify` | `pnpm test:e2e`

### Languages
The site is offered in 11 languages: English (US) at the root, English (UK) under `/en-gb/`, and Hindi, Bengali, Brazilian Portuguese, Indonesian, Russian, German, Spanish, French and Turkish under `/hi/`, `/bn/`, `/pt-br/`, `/id/`, `/ru/`, `/de/`, `/es/`, `/fr/` and `/tr/`. The English text stays in the code and the translations are flat catalogs in `src/i18n/catalog/<code>.json`. `pnpm test` fails when a catalog misses a string, and `I18N_LOG=1 pnpm build && pnpm i18n:audit` fails when a translated page shows English. How to add or change text is in CLAUDE.md (Localization).


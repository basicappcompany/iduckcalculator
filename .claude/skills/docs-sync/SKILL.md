---
name: docs-sync
description: Sync iDuckCalculator's documents (docs/status.html, PROGRESS.md, CLAUDE.md, README.md, the site footer date) with what actually shipped and was verified. Run when the user says "docs-sync", "update the docs", "sync the docs", or at the end of a work session. Docs-only changes are batched to this one run.
---

# docs-sync for iDuckCalculator

Bring every project document in line with reality, in one pull request. Never write a claim you have not verified in this session or in the repo. When asked mid-day, run it then; otherwise it runs once at the end of the day, and docs edits stay uncommitted until then.

The documents this skill owns:
- `docs/status.html` (the project status page)
- `PROGRESS.md` (the checklist a later session resumes from)
- `CLAUDE.md` (stack, conventions, commands, gotchas), once it exists
- `README.md` (only when setup, commands, layout or release flow changed)
- `docs/HANDOFF.md`, if it exists
- Dated claims on the site itself: the footer "Last updated YYYY-MM-DD", each guide's `updated` date, and each tax or savings-scheme page's "rules as of" date.

## 1. Work out what changed
- `git log --oneline main` since the last "Docs" commit, plus `gh pr list --repo basicappcompany/iduckcalculator --state merged --limit 20` and any open PRs.
- Things done outside the repo, in dashboards (Cloudflare Pages, domain registrar, Email Routing, Search Console, the payment provider). Take these from the conversation, not from guesses.
- Anything newly discovered or still open: a failed attempt, a blocked action, a decision waiting on the user.

## 2. Re-measure what the docs quote
Never copy numbers from old docs. Re-read them from the source:
- Calculators: the registry in `src/lib/calculators.ts`, and the live pages. A calculator is "ready" only if its page is on `main`, answers on https://iduckcalculator.com, and has a unit test against a known answer, FAQs and 3 related links.
- Tests: `pnpm test` (Vitest) and `pnpm test:e2e` (Playwright). Quote real pass counts and file counts.
- Pages: `pnpm build`, then count built pages and sitemap URLs from `dist/`.
- Performance: quote Lighthouse only if measured this session, say it is mobile and on which URL; otherwise "Not measured".
- Live checks: `curl -sI https://iduckcalculator.com/...` for status codes, redirects and the noindex header on the `pages.dev` hosts; the latest Cloudflare Pages deploy status.
- Dependency versions: from `package.json`, never from memory.
- Money rules: for every tax, GST, PPF, Sukanya, NPS or gratuity page, check the cited official source still shows the same slabs, rates and limits. If a new Finance Act, Budget or notification changed them, say so, mark the item `todo`, and do not silently edit the maths. Update the "rules as of" date only after re-reading the source.

## 3. Update, in this order
1. `docs/status.html`:
   - The `CALCS` list is the single source for the Phases items and the Tools table. Add a slug to `READY` when a calculator ships; add new calculators to `CALCS`.
   - `PHASES`: state `done | progress | todo | waiting | later`, owner `me | you | both | none | external`, `when`, an honest `note`, and numbered `steps` for anything the owner must do. Add new items rather than stretching old ones. Ids are `phase.number`; never reuse one.
   - Then `DECISIONS`, `TIMELINE` (newest last), `SCORECARD` and `VERIFIED`.
2. `PROGRESS.md`: tick or untick every box to match `READY`, the PRs merged and the checks run. Keep "Open items and decisions" current.
3. `CLAUDE.md`: only where stack, versions, conventions, commands or milestones changed. Record newly verified facts (for example which official source a tax rule came from, and when it was read).
4. `README.md`: only if setup, commands, layout or release flow changed.
5. Sweep stale values: `grep -rn` for old counts (calculators, pages, tests), "planned", "coming soon", old versions, old URLs and old dates across `README.md CLAUDE.md PROGRESS.md docs src public .github`. Anything that now disagrees gets fixed, unasked.

## 4. Verify
- `pnpm verify` and `pnpm build` pass.
- Open `docs/status.html` in a browser (light and dark, phone width and desktop; the browser tool cannot open `file://`, so serve the `docs/` folder on localhost): every item renders, the "Pending from you" and "What I can do" counts equal their cards, the Tools table row count equals the number of calculators in `CALCS`, there are no console errors and no horizontal overflow.
- The counts in `PROGRESS.md`, `status.html` and the home page ("All N tools") agree.

## 5. Ship it (the repo's workflow rules apply)
- Never push to `main`. New branch `docs-sync-YYYY-MM-DD`, commit, push, open a PR, fix CI on the same PR, merge when green, delete the branch, pull `main`, and confirm the deploy succeeded.
- Docs-only changes are batched: leave them uncommitted during the day; one commit, push and PR at the end of the day unless the user asks sooner. If code changed the same day, docs that describe that code go in that code's PR.
- The status page is one self-contained file with no external requests, so it opens straight from disk. Keep it that way.
- Commit and PR bodies end with the attribution lines the harness gives for the session.

## 6. Report
List what changed in the docs, the verified numbers, and what is still waiting on the user, split into "needs you" and "I can do". Say plainly what was not checked. Update project memory only with facts that matter to later sessions.

## Boundaries
- Do not mark an item done on the user's word alone if it can be checked (a page, a redirect, a deploy); check it. If it cannot be checked (a mail landing in the inbox, a real phone), say so and leave the item open with the exact next step.
- Do not enter passwords, keys or tokens anywhere, and do not change DNS or security settings: list them as owner steps.
- Never present a tax or scheme rule as current without having read the official source in this run.

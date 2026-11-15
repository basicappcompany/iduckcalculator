import { expect, test, type Page } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { CALCULATORS, calcPath, liveGroups } from '../../src/lib/calc';
import { GUIDES, guidePath } from '../../src/lib/guides';

const STATIC = ['/', '/calculators/', '/guides/', '/tax/', '/tax/in/', '/tax/us/', '/tax/uk/', '/chat/', '/roadmap/', '/request/', '/feedback/', '/support/', '/settings/', '/about/', '/privacy/', '/terms/'];
const CALC_PATHS = CALCULATORS.map((c) => calcPath(c.slug));
const GUIDE_PATHS = GUIDES.map((g) => guidePath(g.slug));

/**
 * Every test runs under the same Content-Security-Policy the live site sends (the one `pnpm build` wrote to dist/_headers), so a blocked
 * script, style or request fails the test instead of only failing for visitors.
 */
const BUILT_HEADERS = existsSync('dist/_headers') ? readFileSync('dist/_headers', 'utf8') : '';
const CSP = /^\s*Content-Security-Policy:\s*(.+)$/m.exec(BUILT_HEADERS)?.[1]?.trim();
const violations = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const seen: string[] = [];
  violations.set(page, seen);
  page.on('console', (m) => /Content Security Policy|Refused to/i.test(m.text()) && seen.push(m.text()));
  if (!CSP) return;
  await page.route('**/*', async (route) => {
    if (route.request().resourceType() !== 'document') return route.continue();
    const response = await route.fetch();
    await route.fulfill({ response, headers: { ...response.headers(), 'content-security-policy': CSP } });
  });
});
test.afterEach(async ({ page }) => {
  expect(violations.get(page) ?? [], 'Content-Security-Policy violations').toEqual([]);
});
test('the production Content-Security-Policy was built and is strict', () => {
  expect(CSP, 'dist/_headers has a Content-Security-Policy (run pnpm build first)').toBeTruthy();
  expect(CSP).not.toMatch(/unsafe-inline|unsafe-eval/);
});

test('the policy really blocks an injected script and an injected inline style', async ({ page }) => {
  test.skip(!CSP, 'needs the built policy');
  await page.goto('/about/');
  await page.evaluate(() => {
    document.body.insertAdjacentHTML('beforeend', '<script>window.injected = 1</script><p id="probe" style="color: rgb(255, 0, 0)">x</p>');
  });
  expect(await page.evaluate(() => (window as unknown as { injected?: number }).injected), 'inline script ran').toBeUndefined();
  expect(await page.evaluate(() => getComputedStyle(document.getElementById('probe')!).color), 'inline style applied').not.toBe('rgb(255, 0, 0)');
  expect(violations.get(page)!.length, 'the browser reported the violations').toBeGreaterThanOrEqual(1);
  violations.set(page, []); // expected here, so do not fail the afterEach check
});

/** Opens a page and waits until its interactive parts (the Preact islands) have loaded, so a test never types before they can listen. */
async function openReady(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
}

/** Collects console errors and failed requests so every test can assert there were none. */
function watch(page: Page) {
  const problems: string[] = [];
  page.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text()}`));
  page.on('pageerror', (e) => problems.push(`exception: ${e.message}`));
  page.on('response', (r) => r.status() >= 400 && problems.push(`${r.status()} ${r.url()}`));
  return problems;
}

for (const path of [...STATIC, ...GUIDE_PATHS]) {
  test(`page ${path} loads with no errors and no sideways scroll`, async ({ page }) => {
    const problems = watch(page);
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(path);
    await expect(page.locator('h1').first()).toBeVisible();
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, 'sideways scroll').toBeLessThanOrEqual(0);
    expect(problems).toEqual([]);
  });
}

test.describe('every calculator page', () => {
  for (const path of CALC_PATHS) {
    test(`${path} shows a live result, FAQs and related links`, async ({ page }) => {
      const problems = watch(page);
      await page.goto(path);
      await expect(page.getByTestId('big-result')).toBeVisible();
      await expect(page.getByTestId('big-result')).not.toContainText(/NaN|undefined|Infinity/);
      expect(await page.locator('details.card').count()).toBeGreaterThanOrEqual(4);
      expect(await page.locator('[data-related-nav] a.card').count()).toBe(3);
      expect(await page.locator('script[type="application/ld+json"]').count()).toBeGreaterThanOrEqual(3);
      expect(problems).toEqual([]);
    });
  }
});

test('typing into the EMI calculator updates the result live', async ({ page }) => {
  await openReady(page, '/emi-calculator/');
  await expect(page.getByTestId('big-result')).toHaveText('₹8,997');
  await page.getByLabel('Loan amount').fill('5000000');
  await page.getByLabel('Interest rate per year').fill('8.5');
  await expect(page.getByTestId('big-result')).toHaveText('₹43,391');
  await page.getByLabel('Loan amount').fill('');
  await expect(page.getByRole('alert')).toContainText('Enter the loan amount');
  await page.getByRole('button', { name: 'Reset to the example' }).click();
  await expect(page.getByTestId('big-result')).toHaveText('₹8,997');
});

test('the scientific calculator reads a typed expression and explains a bad one', async ({ page }) => {
  await openReady(page, '/scientific-calculator/');
  await expect(page.getByTestId('big-result')).toHaveText('24');
  await page.getByLabel('Expression').fill('sin(30) + 2^3');
  await expect(page.getByTestId('big-result')).toHaveText('8.5');
  await page.getByLabel('Expression').fill('1/0');
  await expect(page.getByRole('alert')).toContainText('divide by zero');
});

test('the basic calculator multiplies and refuses to divide by zero', async ({ page }) => {
  await openReady(page, '/basic-calculator/');
  await expect(page.getByTestId('big-result')).toHaveText('15,000');
  await page.getByLabel('Operation', { exact: true }).selectOption('div');
  await page.getByLabel('Second number').fill('0');
  await expect(page.getByRole('alert')).toContainText('divide by zero');
});

test('the currency chosen in Settings applies to calculators', async ({ page }) => {
  await page.goto('/settings/');
  await page.getByRole('radio', { name: 'US dollar ($)' }).click();
  await expect(page.getByTestId('currency-preview')).toContainText('$1,234,567.50');
  await openReady(page, '/emi-calculator/');
  await expect(page.getByTestId('big-result')).toHaveText('$8,997');
});

test('a US page keeps dollars even when another currency is chosen in Settings', async ({ page }) => {
  await page.goto('/settings/');
  await page.getByRole('radio', { name: 'Euro (€)' }).click();
  await openReady(page, '/us-take-home-pay-calculator/');
  await expect(page.getByTestId('big-result')).toHaveText('$61,592.50');
  await expect(page.getByTestId('big-result')).not.toContainText('€');
  await openReady(page, '/emi-calculator/');
  await expect(page.getByTestId('big-result')).toContainText('€');
});

test('the tax hubs list the countries and link to their calculators', async ({ page }) => {
  await page.goto('/tax/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Tax and salary calculators by country');
  await expect(page.getByRole('link', { name: 'United States', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'India', exact: true })).toBeVisible();
  await page.goto('/tax/us/');
  await expect(page.getByRole('link', { name: /US federal income tax calculator 2026/ }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /US take-home pay calculator 2026/ }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /Income tax calculator: old vs new regime/ })).toHaveCount(0);
  await page.getByRole('link', { name: /US federal income tax calculator 2026/ }).first().click();
  await expect(page.getByRole('link', { name: 'United States', exact: true })).toHaveAttribute('href', '/tax/us/');
});

test('Ctrl K opens search, finds a calculator and opens it', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Control+k');
  await expect(page.locator('#palette')).toBeVisible();
  await page.locator('#palette-input').fill('sip');
  await expect(page.locator('.palette-row').first()).toContainText('SIP calculator');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/sip-calculator\/$/);
  await page.keyboard.press('Control+k');
  await page.keyboard.press('Escape');
  await expect(page.locator('#palette')).toBeHidden();
});

test('the theme toggle switches and is remembered', async ({ page }) => {
  await openReady(page, '/emi-calculator/');
  await page.locator('#theme-toggle').click();
  const first = await page.locator('html').getAttribute('data-theme');
  expect(['light', 'dark']).toContain(first);
  await page.reload();
  expect(await page.locator('html').getAttribute('data-theme')).toBe(first);
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe(first === 'dark' ? 'rgb(18, 18, 18)' : 'rgb(255, 253, 245)');
});

test('"Match my device" follows a dark system and uses #121212', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'dark' });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('duck.theme', 'system'));
  await openReady(page, '/emi-calculator/');
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(18, 18, 18)');
  await ctx.close();
});

test('the home page defaults to light even when the system is dark, and the toggle switches it and is remembered', async ({ browser }) => {
  const LIGHT = 'rgb(255, 253, 245)';
  const DARK = 'rgb(18, 18, 18)';
  const ctx = await browser.newContext({ colorScheme: 'dark' });
  const page = await ctx.newPage();
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await openReady(page, '/');
  expect(await bg(), 'light by default, whatever the system says').toBe(LIGHT);
  await expect(page.locator('#theme-toggle')).toBeVisible();
  await page.locator('#theme-toggle').click();
  expect(await bg()).toBe(DARK);
  await page.reload();
  expect(await bg(), 'the choice is remembered on the home page').toBe(DARK);
  await openReady(page, '/emi-calculator/');
  expect(await bg(), 'and on every other page').toBe(DARK);
  await openReady(page, '/');
  await page.locator('#theme-toggle').click();
  expect(await bg(), 'and the toggle switches back to light').toBe(LIGHT);
  await ctx.close();
});

test('every page is light by default, even with a dark system, and stays that way until changed', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'dark' });
  const page = await ctx.newPage();
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  for (const path of ['/', '/emi-calculator/', '/guides/', '/settings/']) {
    await page.goto(path);
    expect(await bg(), path).toBe('rgb(255, 253, 245)');
  }
  await ctx.close();
});

test('"Match my device" is remembered on every page, and clearing the saved settings goes back to light', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'dark' });
  const page = await ctx.newPage();
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await openReady(page, '/settings/');
  await page.getByRole('radio', { name: /Match my device/ }).click();
  expect(await bg()).toBe('rgb(18, 18, 18)');
  for (const path of ['/', '/emi-calculator/']) {
    await page.goto(path);
    expect(await bg(), `${path} follows the device`).toBe('rgb(18, 18, 18)');
  }
  await openReady(page, '/settings/');
  await page.getByRole('button', { name: /Clear saved settings/ }).click();
  expect(await bg(), 'back to the light default').toBe('rgb(255, 253, 245)');
  await ctx.close();
});

const LANG_PAGES: [string, string, string][] = [
  ['/', 'en-US', 'quacked'],
  ['/en-gb/', 'en-GB', 'quacked'],
  ['/hi/', 'hi', 'क्वैक'],
  ['/bn/', 'bn', 'কোয়াকে'],
  ['/pt-br/', 'pt-BR', 'quá'],
  ['/id/', 'id', 'kwek'],
  ['/ru/', 'ru', 'кря'],
  ['/de/', 'de', 'quakend'],
  ['/es/', 'es', 'cuac'],
  ['/fr/', 'fr', 'coin-coin'],
  ['/tr/', 'tr', 'vaklayarak'],
];

/** What a language's catalog says for an English string, so the test does not repeat the translation. */
const said = (lang: string, english: string): string => (JSON.parse(readFileSync(`src/i18n/catalog/${lang}.json`, 'utf8')) as Record<string, string>)[english]!;

test('the language menu opens the same page in another language and links back', async ({ page }) => {
  await openReady(page, '/emi-calculator/');
  await page.locator('[data-lang-menu] summary').click();
  await page.locator('[data-lang="de"]').click();
  await expect(page).toHaveURL(/\/de\/emi-calculator\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(page.locator('h1')).toContainText(said('de', 'EMI calculator'));
  await expect(page.locator('[data-machine-note]')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Startseite' }).first()).toBeVisible();
  await page.locator('[data-lang-menu] summary').click();
  await page.locator('[data-lang="en"]').click();
  await expect(page).toHaveURL(/\/emi-calculator\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
  await expect(page.locator('[data-machine-note]')).toHaveCount(0);
});

test('a page that exists only in English sends the menu to the other language\'s home page', async ({ page }) => {
  await page.goto('/privacy/');
  await page.locator('[data-lang-menu] summary').click();
  await page.locator('[data-lang="fr"]').click();
  await expect(page).toHaveURL(/\/fr\/$/);
});

test('a calculator page in German is translated and still calculates', async ({ page }) => {
  await openReady(page, '/de/emi-calculator/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  // the form's words, the result's words and the page's questions all come from the German catalog
  await expect(page.getByRole('button', { name: said('de', 'Reset to the example') })).toBeVisible();
  await expect(page.getByText(said('de', 'Common questions'.replace('Common questions', 'How is EMI calculated?')), { exact: false }).first()).toBeVisible();
  const big = page.getByTestId('big-result');
  await expect(big).toContainText(/\d/);
  const before = await big.textContent();
  await page.getByLabel(said('de', 'Loan amount')).fill('2000000');
  await expect(big).not.toHaveText(before ?? '');
  // an unchanged English page carries its own words, and the canonical points at itself
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://iduckcalculator.com/de/emi-calculator/');
});

test('the search window works in Hindi, with letters of that script', async ({ page }) => {
  await openReady(page, '/hi/');
  await page.keyboard.press('Control+k');
  const box = page.locator('#palette-input');
  await expect(box).toBeVisible();
  await expect(page.locator('.palette-row').first()).toBeVisible();
  await box.fill(said('hi', 'EMI calculator').split(' ')[0]!);
  await expect(page.locator('.palette-row').first()).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/hi\/[a-z-]*emi[a-z-]*calculator\//);
});

for (const [path, lang, word] of LANG_PAGES) {
  test(`the home page in ${lang} loads, declares its language and links to every other language`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toContainText(word);
    expect(await page.locator('link[rel="alternate"][hreflang]').count(), 'hreflang links').toBe(12);
    expect(await page.locator('[data-lang-menu] [data-lang]').count(), 'menu links').toBe(11);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://iduckcalculator.com${path}`);
    const machine = page.locator('[data-machine-note]');
    if (lang === 'en-US' || lang === 'en-GB') await expect(machine).toHaveCount(0);
    else await expect(machine).toBeVisible();
  });
}

test('home page has the promised sections and filters by group', async ({ page }) => {
  await page.goto('/');
  for (const name of ['Popular right now', 'New and next', 'How-to guides', 'Common questions']) await expect(page.getByRole('heading', { name })).toBeVisible();
  await expect(page.getByRole('heading', { name: `All ${CALCULATORS.length} calculators` })).toBeVisible();
  await page.getByRole('switch', { name: /Health/ }).click();
  await expect(page.locator('[data-card-group]:not([hidden])')).toHaveCount(1);
  await page.getByRole('switch', { name: /Everything/ }).click();
  await expect(page.locator('[data-card-group]:not([hidden])')).toHaveCount(liveGroups().length);
});

test('unknown addresses show the 404 page', async ({ page }) => {
  const res = await page.goto('/does-not-exist/');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: /flew/ })).toBeVisible();
});

test('the helper finds a calculator from plain words', async ({ page }) => {
  await openReady(page, '/chat/');
  await page.getByLabel('Describe what you want to calculate').fill('how old am I');
  await page.getByRole('button', { name: 'Ask' }).click();
  await expect(page.getByRole('log').getByRole('link', { name: /Age calculator/ })).toBeVisible();
});

test('the helper greets, shows typing, answers a sum itself and offers starters', async ({ page }) => {
  await openReady(page, '/chat/');
  const log = page.getByRole('log');
  await expect(log).toContainText('Hi, I am Duck');
  await expect(log.getByRole('button', { name: 'Is my data safe?' })).toBeVisible();
  await log.getByRole('button', { name: 'Is my data safe?' }).click();
  await expect(log).toContainText('Every calculation runs in your browser');
  await page.getByLabel('Describe what you want to calculate').fill('15% of 2,400');
  await page.getByRole('button', { name: 'Ask' }).click();
  await expect(log).toContainText('15% of 2,400 is 360.');
  await expect(log.getByRole('link', { name: /Percentage calculator/ })).toBeVisible();
});

test('the footer carries the brand line and the sister sites', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');
  await expect(footer).toContainText('© 2026 Basic App Company · iDuckCalculator · iduckcalculator.com ·');
  await expect(footer).toContainText('Free calculators that run in your browser.');
  await expect(footer).toContainText(/Last updated \d{4}-\d{2}-\d{2}\./);
  await expect(footer.getByRole('link', { name: 'iDuckPDF' })).toHaveAttribute('href', 'https://iduckpdf.com/');
  await expect(footer.getByRole('link', { name: 'iDuckIMG' })).toHaveAttribute('href', 'https://iduckimg.com/');
  await expect(footer.getByRole('link', { name: 'iDuckConvert' })).toHaveAttribute('href', 'https://iduckconvert.com/');
});

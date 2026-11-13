import { expect, test, type Page } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { CALCULATORS, calcPath } from '../../src/lib/calc';
import { GUIDES, guidePath } from '../../src/lib/guides';

const STATIC = ['/', '/calculators/', '/guides/', '/chat/', '/roadmap/', '/request/', '/feedback/', '/support/', '/settings/', '/about/', '/privacy/', '/terms/'];
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
  await page.goto('/emi-calculator/');
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
  await page.goto('/scientific-calculator/');
  await expect(page.getByTestId('big-result')).toHaveText('24');
  await page.getByLabel('Expression').fill('sin(30) + 2^3');
  await expect(page.getByTestId('big-result')).toHaveText('8.5');
  await page.getByLabel('Expression').fill('1/0');
  await expect(page.getByRole('alert')).toContainText('divide by zero');
});

test('the basic calculator multiplies and refuses to divide by zero', async ({ page }) => {
  await page.goto('/basic-calculator/');
  await expect(page.getByTestId('big-result')).toHaveText('15,000');
  await page.getByLabel('Operation').selectOption('div');
  await page.getByLabel('Second number').fill('0');
  await expect(page.getByRole('alert')).toContainText('divide by zero');
});

test('the currency chosen in Settings applies to calculators', async ({ page }) => {
  await page.goto('/settings/');
  await page.getByRole('radio', { name: 'US dollar ($)' }).click();
  await expect(page.getByTestId('currency-preview')).toContainText('$1,234,567.50');
  await page.goto('/emi-calculator/');
  await expect(page.getByTestId('big-result')).toHaveText('$8,997');
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
  await page.goto('/emi-calculator/');
  await page.locator('#theme-toggle').click();
  const first = await page.locator('html').getAttribute('data-theme');
  expect(['light', 'dark']).toContain(first);
  await page.reload();
  expect(await page.locator('html').getAttribute('data-theme')).toBe(first);
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe(first === 'dark' ? 'rgb(18, 18, 18)' : 'rgb(255, 253, 245)');
});

test('dark mode follows the system and uses #121212', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'dark' });
  const page = await ctx.newPage();
  await page.goto('/emi-calculator/');
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(18, 18, 18)');
  await ctx.close();
});

test('the start page is always light, even with a dark system and a saved dark choice', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'dark' });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('duck.theme', 'dark'));
  await page.goto('/');
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(await bg()).toBe('rgb(255, 253, 245)');
  await expect(page.locator('#theme-toggle')).toBeHidden();
  await page.goto('/emi-calculator/'); // every other page still honours the choice
  expect(await bg()).toBe('rgb(18, 18, 18)');
  await ctx.close();
});

test('the language switch changes the page chrome to Turkish and back', async ({ page }) => {
  await page.goto('/emi-calculator/');
  await page.locator('[data-lang-menu] summary').click();
  await page.locator('[data-lang="tr"]').click();
  await expect(page.locator('[data-i18n="home"]').first()).toHaveText('Ana sayfa');
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
  await expect(page.locator('[data-machine-note]')).toBeVisible();
  await page.reload();
  await expect(page.locator('[data-i18n="home"]').first()).toHaveText('Ana sayfa');
  await page.locator('[data-lang-menu] summary').click();
  await page.locator('[data-lang="en"]').click();
  await expect(page.locator('[data-i18n="home"]').first()).toHaveText('Home');
});

test('home page has the promised sections and filters by group', async ({ page }) => {
  await page.goto('/');
  for (const name of ['Popular right now', 'New and next', 'How-to guides', 'Common questions']) await expect(page.getByRole('heading', { name })).toBeVisible();
  await expect(page.getByRole('heading', { name: `All ${CALCULATORS.length} calculators` })).toBeVisible();
  await page.getByRole('switch', { name: /Health/ }).click();
  await expect(page.locator('[data-card-group]:not([hidden])')).toHaveCount(1);
  await page.getByRole('switch', { name: /Everything/ }).click();
  await expect(page.locator('[data-card-group]:not([hidden])')).toHaveCount(6);
});

test('unknown addresses show the 404 page', async ({ page }) => {
  const res = await page.goto('/does-not-exist/');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: /flew/ })).toBeVisible();
});

test('the helper finds a calculator from plain words', async ({ page }) => {
  await page.goto('/chat/');
  await page.getByLabel('Describe what you want to calculate').fill('how old am I');
  await page.getByRole('button', { name: 'Ask' }).click();
  await expect(page.getByRole('log').getByRole('link', { name: /Age calculator/ })).toBeVisible();
});

test('the helper greets, shows typing, answers a sum itself and offers starters', async ({ page }) => {
  await page.goto('/chat/');
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

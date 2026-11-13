// Renders public/og.png (1200x630) from an HTML snippet in the site's look. Run: node scripts/make-og.mjs
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';

const html = `<!doctype html><html><body style="margin:0;width:1200px;height:630px;background:#fffdf5;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#17160f;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden">
<div style="position:absolute;inset:24px;border:6px solid #17160f;border-radius:36px;box-shadow:12px 12px 0 #17160f"></div>
<div style="display:flex;align-items:center;gap:56px;padding:0 90px;position:relative">
  <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 64 64"><g stroke="#17160f" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M8 40c0-8 6-12 14-12h6c-2-12 4-20 14-20s14 8 10 16l8 4-8 4c0 12-10 22-24 22-12 0-20-4-20-14z" fill="#ffd23f"/><path d="M44 24l11 4-11 4z" fill="#ff8a1f"/><path d="M18 40c4 6 14 6 18-2" fill="none"/></g><circle cx="43" cy="19" r="2.6" fill="#000"/></svg>
  <div>
    <div style="font-size:30px;font-weight:900;letter-spacing:3px;text-transform:uppercase">iDuckCalculator</div>
    <div style="font-size:92px;font-weight:900;line-height:1.02;letter-spacing:-3px;margin-top:14px">Numbers,<br><span style="background:#ffd23f;padding:0 14px;border-radius:14px">quacked</span> open.</div>
    <div style="font-size:30px;margin-top:26px;color:#6b685b">EMI, SIP, percentage, age, BMI and more.<br>Free, no sign-up, no ads. Runs in your browser.</div>
  </div>
</div></body></html>`;

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
writeFileSync('public/og.png', await page.screenshot({ type: 'png' }));
await browser.close();
console.log('wrote public/og.png');

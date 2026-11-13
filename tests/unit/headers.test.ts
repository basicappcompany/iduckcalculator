import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

const source = readFileSync('public/_headers', 'utf8');
/** The header lines under one rule, keyed by lower-case name. */
function rules(text: string): { pattern: string; headers: Record<string, string> }[] {
  const out: { pattern: string; headers: Record<string, string> }[] = [];
  for (const raw of text.split(/\r?\n/)) {
    if (raw.trim() === '' || raw.trim().startsWith('#')) continue;
    if (!/^\s/.test(raw)) out.push({ pattern: raw.trim(), headers: {} });
    else {
      const i = raw.indexOf(':');
      out[out.length - 1]!.headers[raw.slice(0, i).trim().toLowerCase()] = raw.slice(i + 1).trim();
    }
  }
  return out;
}

describe('public/_headers', () => {
  const all = rules(source);
  const site = all.find((r) => r.pattern === '/*')!;

  it('sets the security headers on every page', () => {
    expect(site, 'a /* rule').toBeDefined();
    expect(site.headers['strict-transport-security']).toMatch(/max-age=31536000; includeSubDomains/);
    expect(site.headers['x-content-type-options']).toBe('nosniff');
    expect(site.headers['x-frame-options']).toBe('DENY');
    expect(site.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(site.headers['cross-origin-opener-policy']).toBe('same-origin');
    for (const f of ['camera', 'microphone', 'geolocation', 'payment']) expect(site.headers['permissions-policy'], f).toContain(`${f}=()`);
    expect(site.headers['content-security-policy']).toBe('__CSP__');
  });

  it('never puts noindex on the real domain', () => {
    for (const r of all) {
      if (r.headers['x-robots-tag']) expect(r.pattern, 'noindex only on pages.dev hosts').toMatch(/pages\.dev/);
    }
    expect(all.some((r) => r.pattern === '/*' && r.headers['x-robots-tag'])).toBe(false);
    expect(all.filter((r) => /pages\.dev/.test(r.pattern) && r.headers['x-robots-tag'] === 'noindex')).toHaveLength(2);
  });
});

describe('the built Content-Security-Policy (needs `pnpm build` first)', () => {
  const built = existsSync('dist/_headers') ? readFileSync('dist/_headers', 'utf8') : null;
  const csp = built ? rules(built).find((r) => r.pattern === '/*')?.headers['content-security-policy'] : undefined;
  it.skipIf(!built)('is strict: no unsafe-inline or unsafe-eval, no outside hosts, no framing', () => {
    expect(csp).toBeDefined();
    expect(csp).not.toMatch(/unsafe-inline|unsafe-eval|\*|https?:/);
    for (const d of ["default-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'"]) expect(csp, d).toContain(d);
    expect(csp).toMatch(/script-src 'self' 'sha256-/);
  });
});

describe('public/.well-known/security.txt', () => {
  const txt = readFileSync('public/.well-known/security.txt', 'utf8');
  it('has a contact on the site and an expiry date that is in the future but within about a year', () => {
    expect(txt).toMatch(/^Contact: https:\/\/iduckcalculator\.com\/feedback\/$/m);
    const expires = new Date(/^Expires: (.+)$/m.exec(txt)![1]!);
    expect(expires.getTime()).toBeGreaterThan(Date.now());
    expect(expires.getTime()).toBeLessThan(Date.now() + 400 * 86_400_000);
  });
});

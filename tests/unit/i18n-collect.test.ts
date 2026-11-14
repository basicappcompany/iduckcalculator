import { mkdirSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { collect } from '../../src/lib/i18n/collect';

/** `I18N_EXPORT=1 pnpm exec vitest run tests/unit/i18n-collect.test.ts` writes i18n-work/source.json: every English key, for the translators. */
describe('i18n collector', () => {
  const c = collect();
  it('finds the strings of every page', () => {
    expect(c.entries.size).toBeGreaterThan(500);
    expect(c.calcKeys.size).toBeGreaterThan(40);
  });
  it.runIf(process.env['I18N_EXPORT'] === '1')('writes the source list', () => {
    mkdirSync('i18n-work', { recursive: true });
    const list = [...c.entries.values()].map((e) => ({ k: e.key, kind: e.kind, where: e.where }));
    writeFileSync('i18n-work/source.json', JSON.stringify(list, null, 0));
    const chars = list.reduce((n, e) => n + e.k.length, 0);
    console.log(`I18N entries=${list.length} chars=${chars} words~${Math.round(chars / 6)}`);
  });
});

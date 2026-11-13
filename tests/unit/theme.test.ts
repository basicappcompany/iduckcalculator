import { describe, expect, it } from 'vitest';
import { createTheme, type ThemeEnv } from '../../src/lib/theme-client';
import { THEME_STORAGE_KEY } from '../../src/lib/theme';

/** A fake page and browser: the attribute on <html>, localStorage, and the device setting. */
function fake(opts: { attr?: string; stored?: Record<string, string>; deviceDark?: boolean; storageBlocked?: boolean } = {}) {
  const attrs = new Map<string, string>(opts.attr ? [['data-theme', opts.attr]] : []);
  const stored = new Map(Object.entries(opts.stored ?? {}));
  let notified = 0;
  const blocked = {
    getItem: () => {
      throw new Error('blocked');
    },
    setItem: () => {
      throw new Error('blocked');
    },
    removeItem: () => {
      throw new Error('blocked');
    },
  } as unknown as Storage;
  const env: ThemeEnv = {
    root: {
      getAttribute: (n) => attrs.get(n) ?? null,
      setAttribute: (n, v) => void attrs.set(n, v),
      removeAttribute: (n) => void attrs.delete(n),
    },
    storage: opts.storageBlocked ? blocked : { getItem: (k) => stored.get(k) ?? null, setItem: (k, v) => void stored.set(k, v), removeItem: (k) => void stored.delete(k) },
    systemPrefersDark: () => opts.deviceDark ?? false,
    notify: () => void notified++,
  };
  return { theme: createTheme(env), attrs, stored, notified: () => notified };
}

describe('theme', () => {
  it('starts light with nothing saved, even on a dark device', () => {
    const { theme } = fake({ attr: 'light', deviceDark: true });
    expect(theme.choice()).toBe('light');
    expect(theme.isDark()).toBe(false);
    expect(theme.saved()).toBeNull();
  });

  it('the toggle flips light and dark and saves the choice so every page keeps it', () => {
    const { theme, attrs, stored, notified } = fake({ attr: 'light', deviceDark: true });
    theme.toggle();
    expect(attrs.get('data-theme')).toBe('dark');
    expect(stored.get(THEME_STORAGE_KEY)).toBe('dark');
    expect(theme.saved()).toBe('dark');
    theme.toggle();
    expect(attrs.get('data-theme')).toBe('light');
    expect(stored.get(THEME_STORAGE_KEY)).toBe('light');
    expect(notified()).toBe(2);
  });

  it('"match my device" is saved, removes the attribute and follows the device', () => {
    const dark = fake({ attr: 'light', deviceDark: true });
    dark.theme.set('system');
    expect(dark.attrs.has('data-theme')).toBe(false);
    expect(dark.stored.get(THEME_STORAGE_KEY)).toBe('system');
    expect(dark.theme.choice()).toBe('system');
    expect(dark.theme.isDark()).toBe(true);
    const light = fake({ attr: 'light', deviceDark: false });
    light.theme.set('system');
    expect(light.theme.isDark()).toBe(false);
  });

  it('clearing the saved settings goes back to the light default', () => {
    const { theme, attrs, stored } = fake({ attr: 'dark', stored: { [THEME_STORAGE_KEY]: 'dark' }, deviceDark: true });
    theme.clearSaved();
    expect(attrs.get('data-theme')).toBe('light');
    expect(stored.has(THEME_STORAGE_KEY)).toBe(false);
    expect(theme.saved()).toBeNull();
    expect(theme.isDark()).toBe(false);
  });

  it('ignores a saved value it does not know, and keeps working when storage is blocked', () => {
    expect(fake({ attr: 'light', stored: { [THEME_STORAGE_KEY]: 'purple' } }).theme.saved()).toBeNull();
    const blocked = fake({ attr: 'light', storageBlocked: true });
    expect(blocked.theme.saved()).toBeNull();
    blocked.theme.toggle(); // the choice still applies for this visit
    expect(blocked.attrs.get('data-theme')).toBe('dark');
  });
});

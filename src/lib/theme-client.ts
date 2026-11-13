import { THEME_STORAGE_KEY } from './theme';

export type ThemeChoice = 'system' | 'light' | 'dark';

/** The parts of the page and the browser the theme needs. Passed in so tests can fake them. */
export interface ThemeEnv {
  root: Pick<HTMLElement, 'getAttribute' | 'setAttribute' | 'removeAttribute'>;
  /** Null when storage is unavailable. Any call may also throw (blocked storage). */
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null;
  systemPrefersDark: () => boolean;
  /** Called after every change so other parts of the page can update. */
  notify: () => void;
}

/**
 * One place that knows how the theme works. Every page starts light: the HTML says data-theme="light" and nothing is saved.
 * A choice is saved in this browser and wins on every page until it is changed: "light" and "dark" set the attribute;
 * "system" (match my device) is saved as "system" and removes it, so the device setting applies. The header toggle and the
 * Settings page both use this, so they cannot disagree.
 */
export function createTheme(env: ThemeEnv) {
  const choice = (): ThemeChoice => {
    const v = env.root.getAttribute('data-theme');
    return v === 'light' || v === 'dark' ? v : 'system';
  };
  const isDark = (): boolean => {
    const c = choice();
    return c === 'dark' || (c === 'system' && env.systemPrefersDark());
  };
  const save = (fn: () => void) => {
    try {
      fn();
    } catch {
      // Storage can be blocked (private mode). The choice still applies for this visit.
    }
  };
  return {
    choice,
    isDark,
    set(next: ThemeChoice) {
      if (next === 'system') env.root.removeAttribute('data-theme');
      else env.root.setAttribute('data-theme', next);
      save(() => env.storage?.setItem(THEME_STORAGE_KEY, next));
      env.notify();
    },
    /** Flip to the opposite of what is showing now. */
    toggle() {
      this.set(isDark() ? 'light' : 'dark');
    },
    /** Forget the saved choice: back to the default, which is light. */
    clearSaved() {
      env.root.setAttribute('data-theme', 'light');
      save(() => env.storage?.removeItem(THEME_STORAGE_KEY));
      env.notify();
    },
    /** The saved choice as stored, or null when nothing is saved (not what is currently applied). */
    saved(): ThemeChoice | null {
      try {
        const v = env.storage?.getItem(THEME_STORAGE_KEY);
        return v === 'light' || v === 'dark' || v === 'system' ? v : null;
      } catch {
        return null;
      }
    },
  };
}

export const THEME_EVENT = 'duck-theme';

/** The real thing, for use in the browser. */
export function browserTheme() {
  let storage: Storage | null = null;
  try {
    storage = window.localStorage;
  } catch {
    storage = null;
  }
  return createTheme({
    root: document.documentElement,
    storage,
    systemPrefersDark: () => matchMedia('(prefers-color-scheme: dark)').matches,
    notify: () => window.dispatchEvent(new CustomEvent(THEME_EVENT)),
  });
}

import { useEffect, useState } from 'preact/hooks';
import Chips from './Chips';
import { CURRENCY_EVENT } from './CalculatorTool';
import { THEME_EVENT, browserTheme, type ThemeChoice } from '../lib/theme-client';
import { CURRENCIES, CURRENCY_STORAGE_KEY, DEFAULT_CURRENCY, currencyByCode, formatMoney } from '../lib/format';
import { LANGUAGES, localePath } from '../lib/i18n/languages';

const THEME_OPTIONS: { id: ThemeChoice; emoji: string; label: string }[] = [
  { id: 'system', emoji: '🖥️', label: 'Match my device' },
  { id: 'light', emoji: '☀️', label: 'Light' },
  { id: 'dark', emoji: '🌙', label: 'Dark' },
];

const SHORTCUTS: { keys: string[]; does: string }[] = [
  { keys: ['Ctrl', 'K'], does: 'Search the calculators (on a Mac, Cmd and K).' },
  { keys: ['/'], does: 'Open the search when you are not typing in a box.' },
  { keys: ['Enter'], does: 'In the search box, open the highlighted result.' },
  { keys: ['Esc'], does: 'Close the search window or the phone menu.' },
  { keys: ['Tab'], does: 'First press: skip straight to the page content.' },
];

const read = (key: string, fallback: string): string => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

export default function SettingsPanel() {
  // Created after the page loads: it needs the browser (window, localStorage), which the build does not have.
  const [theme, setTheme] = useState<ReturnType<typeof browserTheme> | null>(null);
  const [choice, setChoice] = useState<ThemeChoice>('light');
  const [saved, setSaved] = useState<ThemeChoice | null>(null);
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [note, setNote] = useState('');

  useEffect(() => {
    const t = browserTheme();
    setTheme(t);
    const sync = () => {
      setChoice(t.choice());
      setSaved(t.saved());
    };
    sync();
    setCurrency(currencyByCode(read(CURRENCY_STORAGE_KEY, DEFAULT_CURRENCY)).code);
    // The header button changes the theme too, so keep this page in step with it.
    window.addEventListener(THEME_EVENT, sync);
    return () => window.removeEventListener(THEME_EVENT, sync);
  }, []);

  const pickCurrency = (code: string) => {
    setCurrency(code);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, code);
    } catch {
      // Private mode: the choice still applies on this page.
    }
    window.dispatchEvent(new CustomEvent(CURRENCY_EVENT));
  };
  const clearAll = () => {
    theme?.clearSaved();
    try {
      localStorage.removeItem(CURRENCY_STORAGE_KEY);
    } catch {
      // Nothing was saved.
    }
    setCurrency(DEFAULT_CURRENCY);
    window.dispatchEvent(new CustomEvent(CURRENCY_EVENT));
    setNote('Cleared. Theme follows your device, the currency is ₹.');
  };

  return (
    <div class="grid gap-5">
      <section class="card p-5" aria-labelledby="appearance">
        <h2 id="appearance" class="text-2xl font-black tracking-tight">
          Appearance
        </h2>
        <div class="mt-3">
          <Chips
            label="Theme"
            options={THEME_OPTIONS}
            value={choice}
            onChange={(c) => {
              theme?.set(c);
              setNote('');
            }}
          />
        </div>
        <p class="mt-3 text-sm text-muted">"Match my device" follows your phone or computer's light or dark setting. Your choice is remembered in this browser only.</p>
      </section>

      <section class="card p-5" aria-labelledby="currency">
        <h2 id="currency" class="text-2xl font-black tracking-tight">
          Currency
        </h2>
        <div class="mt-3">
          <Chips label="Currency" options={CURRENCIES.map((c) => ({ id: c.code, label: c.name }))} value={currency} onChange={pickCurrency} />
        </div>
        <p class="mt-3 text-sm text-muted" data-testid="currency-preview">
          Preview: {formatMoney(1234567.5, currency, 2)}. The symbol and digit grouping change; amounts are not converted. Rupees use lakh and crore commas.
        </p>
      </section>

      <section class="card p-5" aria-labelledby="language">
        <h2 id="language" class="text-2xl font-black tracking-tight">
          Language
        </h2>
        <div class="mt-3">
          <ul class="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <li key={l.code}>
                <a class="btn btn-sm" href={localePath(l.code, '/')} lang={l.hreflang} hreflang={l.hreflang} aria-current={l.code === 'en' ? 'true' : undefined}>
                  {l.native}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p class="mt-3 text-sm text-muted">Each language has its own address, such as /de/ for German. Pages that are not translated yet stay in English. Machine-made translations say so at the top of the page until a native speaker has read them.</p>
      </section>

      <section class="card p-5" aria-labelledby="local-data">
        <h2 id="local-data" class="text-2xl font-black tracking-tight">
          Saved in this browser
        </h2>
        <p class="mt-2 text-sm text-muted" data-testid="saved-summary">
          {saved === null && currency === DEFAULT_CURRENCY ? 'Nothing is saved: everything follows the defaults (light theme).' : `Saved: theme ${saved ?? 'light (default)'}, currency ${currency}.`} That is all we keep. The numbers you type are never saved.
        </p>
        <div class="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" class="btn" onClick={clearAll}>
            Clear saved settings
          </button>
          <span role="status" class="text-sm font-bold" data-testid="clear-note">
            {note}
          </span>
        </div>
      </section>

      <section class="card p-5" aria-labelledby="shortcuts">
        <h2 id="shortcuts" class="text-2xl font-black tracking-tight">
          Keyboard shortcuts
        </h2>
        <ul class="mt-3 grid gap-3">
          {SHORTCUTS.map((s) => (
            <li key={s.does} class="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span class="flex gap-1">
                {s.keys.map((k) => (
                  <kbd key={k} class="rounded-md border-2 border-line px-1.5 py-0.5 text-xs font-black">
                    {k}
                  </kbd>
                ))}
              </span>
              <span class="text-sm">{s.does}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

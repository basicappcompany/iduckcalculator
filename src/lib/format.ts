/** Number and money formatting. Indian grouping (lakh, crore) is the default; the visitor can pick another currency in Settings. */

export interface Currency {
  code: string;
  symbol: string;
  /** Intl locale that gives this currency its usual digit grouping. */
  locale: string;
  name: string;
}

export const CURRENCIES: readonly Currency[] = [
  { code: 'INR', symbol: '₹', locale: 'en-IN', name: 'Indian rupee (₹)' },
  { code: 'USD', symbol: '$', locale: 'en-US', name: 'US dollar ($)' },
  { code: 'EUR', symbol: '€', locale: 'de-DE', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', locale: 'en-GB', name: 'British pound (£)' },
  { code: 'CAD', symbol: 'CA$', locale: 'en-CA', name: 'Canadian dollar (CA$)' },
  { code: 'AUD', symbol: 'A$', locale: 'en-AU', name: 'Australian dollar (A$)' },
  { code: 'AED', symbol: 'AED ', locale: 'en-AE', name: 'UAE dirham (AED)' },
  { code: 'TRY', symbol: '₺', locale: 'tr-TR', name: 'Turkish lira (₺)' },
];

export const DEFAULT_CURRENCY = 'INR';
export const CURRENCY_STORAGE_KEY = 'duck.currency';

export function currencyByCode(code: string): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0]!;
}

/** 1234567.891 -> "12,34,567.89" for en-IN. Negative zero and NaN become "0". */
export function formatNumber(n: number, decimals = 2, locale = 'en-IN'): string {
  if (!Number.isFinite(n)) return '0';
  const v = Object.is(n, -0) ? 0 : n;
  return new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v);
}

/** Money with the currency symbol: "₹8,997" (0 decimals) or "₹8,997.26". */
export function formatMoney(n: number, code = DEFAULT_CURRENCY, decimals = 0): string {
  const c = currencyByCode(code);
  const body = formatNumber(Math.abs(n), decimals, c.locale);
  return `${n < 0 && Number(body.replace(/[^\d]/g, '')) !== 0 ? '-' : ''}${c.symbol}${body}`;
}

/** A short spoken form for big rupee amounts: "₹12.50 Lakh", "₹1.20 Crore". Other currencies use K, M, B. */
export function formatCompact(n: number, code = DEFAULT_CURRENCY): string {
  const c = currencyByCode(code);
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (code === 'INR') {
    if (abs >= 1e7) return `${sign}${c.symbol}${formatNumber(abs / 1e7, 2, c.locale)} Crore`;
    if (abs >= 1e5) return `${sign}${c.symbol}${formatNumber(abs / 1e5, 2, c.locale)} Lakh`;
    return formatMoney(n, code);
  }
  if (abs >= 1e9) return `${sign}${c.symbol}${formatNumber(abs / 1e9, 2, c.locale)}B`;
  if (abs >= 1e6) return `${sign}${c.symbol}${formatNumber(abs / 1e6, 2, c.locale)}M`;
  if (abs >= 1e3) return `${sign}${c.symbol}${formatNumber(abs / 1e3, 2, c.locale)}K`;
  return formatMoney(n, code);
}

export function formatPercent(n: number, decimals = 2): string {
  return `${formatNumber(n, decimals, 'en-US')}%`;
}

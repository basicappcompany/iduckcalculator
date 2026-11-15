import type { CountryCode } from './types';

/**
 * The currency of each country that has tax calculators. A calculator with a `country` other than India must pin this currency
 * (`currency` on its CalcDef), because a US tax table shown in rupees is meaningless. A test enforces it.
 * India's calculators came first and follow the visitor's Settings choice, so they pin nothing.
 */
export const COUNTRY_CURRENCY: Readonly<Record<CountryCode, string>> = {
  in: 'INR',
  us: 'USD',
  uk: 'GBP',
  ca: 'CAD',
  au: 'AUD',
  de: 'EUR',
};

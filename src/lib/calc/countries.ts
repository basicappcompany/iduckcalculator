import { CALCULATORS } from './index';
import { COUNTRY_CODES, type CalcDef, type CountryCode } from './types';

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

/** The English name of each country, for page text. A page translates it with tt(). */
export const COUNTRY_NAME: Readonly<Record<CountryCode, string>> = {
  in: 'India',
  us: 'United States',
  uk: 'United Kingdom',
  ca: 'Canada',
  au: 'Australia',
  de: 'Germany',
};

/** A country's tax hub page: `/tax/us/`. The list of all countries is `/tax/`. */
export const hubPath = (code?: CountryCode): string => (code ? `/tax/${code}/` : '/tax/');

export const calcsInCountry = (code: CountryCode): CalcDef[] => CALCULATORS.filter((c) => c.country === code);
/** Countries that have at least one live calculator. Only these get a hub page. */
export const liveCountries = (): CountryCode[] => COUNTRY_CODES.filter((code) => calcsInCountry(code).length > 0);

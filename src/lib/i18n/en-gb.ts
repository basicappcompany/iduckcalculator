import { en } from './en';
import type { Locale } from './types';

/**
 * English (UK). The wording is the same as English (US) today, because the site already uses British spelling for maths and dates.
 * It has its own URL so that readers in the UK, Ireland, Australia and elsewhere get the page for their region. Put any UK-only wording here.
 */
export const enGb: Locale = {
  ...en,
  home: { ...en.home, description: 'Free EMI, SIP, percentage, age, BMI and more calculators. No sign-up, no ads, and everything runs in your browser, so your numbers stay on your device.' },
};

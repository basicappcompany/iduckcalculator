import { en } from './en';
import { ukDeep } from './uk';
import type { Locale } from './types';

/**
 * English (UK) is made from the English (US) text when the site is built (see uk.ts), so it can never fall behind and there is no
 * second set of words to keep in step. Write the English source in US spelling.
 */
export const enGb: Locale = ukDeep(en);

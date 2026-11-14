import type { APIRoute } from 'astro';
import { LANGUAGES } from '../../lib/i18n/languages';
import { paletteData } from '../../lib/i18n/palette';
import type { LangCode } from '../../lib/i18n/types';

/** /palette/<lang>.json: the list the Ctrl K window searches, in that language. Fetched the first time the window opens. */
export function getStaticPaths() {
  return LANGUAGES.map((l) => ({ params: { lang: l.code } }));
}
export const GET: APIRoute = ({ params }) =>
  new Response(JSON.stringify(paletteData(params['lang'] as LangCode)), { headers: { 'content-type': 'application/json; charset=utf-8' } });

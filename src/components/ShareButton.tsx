import { useState } from 'preact/hooks';
import { copyText } from '../lib/clipboard';
import { SITE_URL } from '../lib/contact';
import { makeTr } from '../lib/i18n/catalog';

/** Share the site with the phone's or computer's share sheet, or copy the link if there is none. */
export default function ShareButton({ strings }: { strings?: Record<string, string> | undefined }) {
  const tr = strings ? makeTr(strings) : (s: string) => s;
  const [note, setNote] = useState('');

  const copyLink = async () => {
    const ok = await copyText(SITE_URL);
    setNote(ok ? tr('Link copied. Paste it anywhere.') : `${tr('Could not copy. The address is')} ${SITE_URL}`);
  };

  const share = async () => {
    const data = { title: 'iDuckCalculator', text: tr('Free calculators that run in your browser.'), url: SITE_URL };
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(data);
        setNote(tr('Thanks for sharing!'));
        return;
      } catch (error) {
        // Closing the share sheet is not an error; anything else falls back to copying.
        if (error instanceof Error && error.name === 'AbortError') return;
      }
    }
    await copyLink();
  };

  return (
    <div class="flex flex-wrap items-center gap-3">
      <button type="button" class="btn btn-primary btn-lg" onClick={share}>
        <span aria-hidden="true">📣</span> {tr('Share iDuckCalculator')}
      </button>
      <button type="button" class="btn btn-lg" onClick={copyLink}>
        {tr('Copy link')}
      </button>
      <span role="status" class="text-sm font-bold" data-testid="share-note">
        {note}
      </span>
    </div>
  );
}

import { useRef, useState } from 'preact/hooks';
import { respond, type Reply } from '../lib/helper';

interface Turn {
  me: string;
  reply: Reply;
}
const STARTERS = ['Monthly loan payment', 'How old am I', 'Is my data safe', 'Discount on a price', 'Percentage of a number', 'Request a calculator'];

/** Not an AI: it matches words to calculators on this device and sends nothing anywhere. */
export default function ChatHelper() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState('');
  const end = useRef<HTMLDivElement>(null);
  const ask = (q: string) => {
    const message = q.trim();
    if (!message) return;
    setTurns((t) => [...t, { me: message, reply: respond(message) }]);
    setText('');
    setTimeout(() => end.current?.scrollIntoView({ block: 'nearest' }), 0);
  };
  return (
    <div class="card grid gap-4 p-5">
      <p class="text-sm text-muted">This is not an AI. It matches your words to a calculator on your own device. Nothing you type is sent anywhere.</p>
      <div class="grid gap-3" role="log" aria-live="polite" aria-label="Conversation">
        {turns.length === 0 && (
          <div class="flex flex-wrap gap-2" role="group" aria-label="Try asking">
            {STARTERS.map((s) => (
              <button type="button" key={s} class="chip" onClick={() => ask(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
        {turns.map((t, i) => (
          <div key={i} class="grid gap-2">
            <p class="ml-auto max-w-[85%] rounded-2xl border-2 border-line bg-duck px-3 py-2 font-bold text-duckink">{t.me}</p>
            <div class="max-w-[85%] rounded-2xl border-2 border-line bg-soft px-3 py-2">
              <p>{t.reply.text}</p>
              {t.reply.links.length > 0 && (
                <ul class="mt-2 grid gap-1">
                  {t.reply.links.map((l) => (
                    <li key={l.href}>
                      <a class="link font-bold" href={l.href}>
                        {l.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
        <div ref={end} />
      </div>
      <form
        class="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          ask(text);
        }}
      >
        <label class="sr-only" for="helper-input">
          Describe what you want to calculate
        </label>
        <input id="helper-input" class="input min-w-0 flex-1" placeholder="What do you want to work out?" value={text} onInput={(e) => setText(e.currentTarget.value)} autoComplete="off" />
        <button class="btn btn-primary" type="submit">
          Ask
        </button>
      </form>
    </div>
  );
}

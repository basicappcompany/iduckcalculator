import { useEffect, useMemo, useState } from 'preact/hooks';
import { calcBySlug, defaultValues } from '../lib/calc';
import { todayISO } from '../lib/calc/defs/dates';
import type { Chart, Field, Metric, Result, Table, Values } from '../lib/calc/types';
import { CURRENCY_STORAGE_KEY, DEFAULT_CURRENCY, currencyByCode, formatCompact, formatMoney, formatNumber, formatPercent } from '../lib/format';

export const CURRENCY_EVENT = 'duck-currency';

function useCurrency(): string {
  const [code, setCode] = useState(DEFAULT_CURRENCY);
  useEffect(() => {
    const read = () => {
      try {
        setCode(currencyByCode(localStorage.getItem(CURRENCY_STORAGE_KEY) ?? DEFAULT_CURRENCY).code);
      } catch {
        setCode(DEFAULT_CURRENCY);
      }
    };
    read();
    window.addEventListener(CURRENCY_EVENT, read);
    return () => window.removeEventListener(CURRENCY_EVENT, read);
  }, []);
  return code;
}

const UNIT_LABEL: Record<string, string> = { percent: '%', years: 'years', months: 'months', days: 'days', kg: 'kg', cm: 'cm' };

function fmtMetric(m: Metric, cur: string): string {
  if (typeof m.value === 'string') return m.value;
  switch (m.kind) {
    case 'money':
      return formatMoney(m.value, cur, m.decimals ?? 0);
    case 'compact':
      return formatCompact(m.value, cur);
    case 'percent':
      return formatPercent(m.value, m.decimals ?? 2);
    default:
      return formatNumber(m.value, m.decimals ?? 2, currencyByCode(cur).locale === 'en-IN' ? 'en-IN' : 'en-US');
  }
}

function fmtCell(v: number | string, kind: string | undefined, cur: string): string {
  if (typeof v === 'string') return v;
  if (kind === 'money') return formatMoney(v, cur, 0);
  if (kind === 'percent') return formatPercent(v, 2);
  if (kind === 'number') return formatNumber(v, 0, 'en-US');
  return String(v);
}

const SERIES_FILL = ['var(--d-duck)', 'var(--d-orange)', 'var(--d-ok)'];

function BarChart({ chart, cur }: { chart: Chart; cur: string }) {
  const W = 640;
  const H = 260;
  const L = 56;
  const B = 28;
  const T = 10;
  const count = chart.labels.length;
  const totals = chart.labels.map((_, i) => chart.series.reduce((s, x) => s + Math.max(0, x.values[i] ?? 0), 0));
  const max = Math.max(1, ...totals);
  const slot = (W - L - 8) / Math.max(1, count);
  const barW = Math.min(36, slot * 0.7);
  const step = Math.max(1, Math.ceil(count / 12));
  const y = (val: number) => T + (H - T - B) * (1 - val / max);
  const money = chart.money;
  const fmt = (val: number) => (money ? formatCompact(val, cur) : formatNumber(val, 0));
  return (
    <figure class="card p-4">
      <figcaption class="text-sm font-black">{chart.title}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={chart.title} class="mt-2 h-auto w-full">
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line x1={L} x2={W - 4} y1={y(max * t)} y2={y(max * t)} stroke="var(--d-muted)" stroke-opacity="0.35" stroke-dasharray="3 4" />
            <text x={L - 6} y={y(max * t) + 4} text-anchor="end" font-size="11" fill="var(--d-muted)">
              {fmt(max * t)}
            </text>
          </g>
        ))}
        {chart.labels.map((label, i) => {
          let acc = 0;
          const x = L + slot * i + (slot - barW) / 2;
          return (
            <g key={label + i}>
              {chart.series.map((s, k) => {
                const v = Math.max(0, s.values[i] ?? 0);
                const top = y(acc + v);
                const h = y(acc) - top;
                acc += v;
                return (
                  <rect key={s.name} x={x} y={top} width={barW} height={Math.max(0, h)} fill={SERIES_FILL[k % 3]} stroke="var(--d-line)" stroke-width={h > 1.5 ? 1 : 0}>
                    <title>{`Year ${label}, ${s.name}: ${fmt(v)}`}</title>
                  </rect>
                );
              })}
              {i % step === 0 && (
                <text x={x + barW / 2} y={H - 8} text-anchor="middle" font-size="11" fill="var(--d-muted)">
                  {label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <ul class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {chart.series.map((s, k) => (
          <li key={s.name} class="flex items-center gap-1.5">
            <span aria-hidden="true" class="inline-block h-3 w-3 rounded-sm border border-line" style={`background:${SERIES_FILL[k % 3]}`} />
            {s.name}
          </li>
        ))}
      </ul>
    </figure>
  );
}

function DataTable({ table, cur }: { table: Table; cur: string }) {
  return (
    <details class="card p-4" open>
      <summary class="cursor-pointer text-sm font-black">Year-by-year table</summary>
      <div class="mt-3 max-h-96 overflow-auto">
        <table class="w-full min-w-[28rem] text-sm">
          <thead>
            <tr>
              {table.columns.map((c, i) => (
                <th key={c} scope="col" class={`sticky top-0 border-b-2 border-line bg-card px-2 py-1.5 ${i === 0 ? 'text-left' : 'text-right'}`}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, r) => (
              <tr key={r} class="border-b border-line/30">
                {row.map((cell, i) => (
                  <td key={i} class={`px-2 py-1.5 tabular-nums ${i === 0 ? 'text-left font-bold' : 'text-right'}`}>
                    {fmtCell(cell, table.kinds?.[i], cur)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function FieldInput({ f, value, onChange, cur }: { f: Field; value: number | string; onChange: (v: string) => void; cur: string }) {
  const id = `f-${f.id}`;
  if (f.kind === 'select') {
    return (
      <div class="grid gap-1">
        <label for={id} class="text-sm font-bold">
          {f.label}
        </label>
        <select id={id} class="input" value={String(value)} onChange={(e) => onChange(e.currentTarget.value)}>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {f.hint && <p class="text-xs text-muted">{f.hint}</p>}
      </div>
    );
  }
  if (f.kind === 'date') {
    return (
      <div class="grid gap-1">
        <label for={id} class="text-sm font-bold">
          {f.label}
        </label>
        <input id={id} type="date" class="input" value={value === 'today' ? todayISO() : String(value)} onInput={(e) => onChange(e.currentTarget.value)} />
        {f.hint && <p class="text-xs text-muted">{f.hint}</p>}
      </div>
    );
  }
  if (f.kind === 'text') {
    return (
      <div class="grid gap-1">
        <label for={id} class="text-sm font-bold">
          {f.label}
        </label>
        <textarea id={id} class="input min-h-20" value={String(value)} onInput={(e) => onChange(e.currentTarget.value)} />
        {f.hint && <p class="text-xs text-muted">{f.hint}</p>}
      </div>
    );
  }
  const num = parseFloat(String(value));
  const suffix = f.unit ? UNIT_LABEL[f.unit] : undefined;
  return (
    <div class="grid gap-1">
      <label for={id} class="text-sm font-bold">
        {f.label}
      </label>
      <div class="flex items-center gap-2">
        {f.unit === 'money' && (
          <span aria-hidden="true" class="font-black">
            {currencyByCode(cur).symbol.trim()}
          </span>
        )}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          class="input min-w-0 flex-1"
          value={String(value)}
          min={f.min}
          max={f.max}
          step={f.step ?? 'any'}
          onInput={(e) => onChange(e.currentTarget.value)}
        />
        {suffix && (
          <span aria-hidden="true" class="text-sm font-bold text-muted">
            {suffix}
          </span>
        )}
      </div>
      {f.unit === 'money' && Number.isFinite(num) && num >= 1e5 && <p class="text-xs text-muted">{formatCompact(num, cur)}</p>}
      {f.hint && <p class="text-xs text-muted">{f.hint}</p>}
    </div>
  );
}

export default function CalculatorTool({ slug }: { slug: string }) {
  const def = calcBySlug(slug);
  const cur = useCurrency();
  const [values, setValues] = useState<Values>(() => (def ? defaultValues(def) : {}));
  // "today" defaults become the real date on the visitor's device; the build has a different "today".
  useEffect(() => {
    if (!def) return;
    setValues((v) => Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x === 'today' ? todayISO() : x])));
  }, [slug]);
  const result: Result = useMemo(() => {
    if (!def) return { metrics: [], error: 'Calculator not found.' };
    try {
      return def.compute(values);
    } catch {
      return { metrics: [], error: 'Those numbers cannot be used. Check each box.' };
    }
  }, [def, values]);
  if (!def) return null;
  const big = result.metrics.find((m) => m.big);
  const rest = result.metrics.filter((m) => m !== big);
  return (
    <div class="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <form class="card grid content-start gap-4 p-5" onSubmit={(e) => e.preventDefault()} aria-label={`${def.name} inputs`} noValidate>
        {def.fields.map((f) => (
          <FieldInput key={f.id} f={f} cur={cur} value={values[f.id] ?? ''} onChange={(v) => setValues((old) => ({ ...old, [f.id]: v }))} />
        ))}
        <button type="button" class="btn btn-sm justify-self-start" onClick={() => setValues(defaultValues(def))}>
          Reset to the example
        </button>
      </form>

      <div class="grid content-start gap-4" aria-live="polite">
        {result.error ? (
          <p class="card p-5 font-bold text-danger" role="alert">
            {result.error}
          </p>
        ) : (
          <>
            <section class="card bg-duck p-5 text-duckink" aria-label="Result">
              {big && (
                <>
                  <p class="eyebrow">{big.label}</p>
                  <p class="mt-1 break-words text-3xl font-black tracking-tight min-[420px]:text-4xl" data-testid="big-result">
                    {fmtMetric(big, cur)}
                  </p>
                </>
              )}
              {rest.length > 0 && (
                <dl class="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                  {rest.map((m) => (
                    <div key={m.label}>
                      <dt class="text-xs font-bold uppercase tracking-wide opacity-80">{m.label}</dt>
                      <dd class="break-words font-black">{fmtMetric(m, cur)}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {!big && rest.length === 0 && <p>Nothing to show yet.</p>}
            </section>
            {result.note && <p class="text-sm text-muted">{result.note}</p>}
            {result.chart && <BarChart chart={result.chart} cur={cur} />}
            {result.table && <DataTable table={result.table} cur={cur} />}
          </>
        )}
      </div>
    </div>
  );
}

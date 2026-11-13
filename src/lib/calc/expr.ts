/**
 * A small, safe maths expression evaluator for the scientific calculator. It is a hand-written parser, so nothing a
 * visitor types is ever run as code. Supports + - * / ^ mod ! parentheses, implicit multiplication (2pi, 3(4+5)),
 * the constants pi and e, and the functions listed in FUNCS. Throws ExprError with a plain-English message.
 */

export class ExprError extends Error {}

export type AngleMode = 'deg' | 'rad';

const MAX_LENGTH = 200;
const MAX_DEPTH = 40;

type Token = { t: 'num'; v: number } | { t: 'id'; v: string } | { t: 'op'; v: string };

function tokenize(src: string): Token[] {
  const text = src.replace(/×/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-').replace(/π/g, ' pi ').replace(/√/g, ' sqrt ');
  const out: Token[] = [];
  let i = 0;
  while (i < text.length) {
    const c = text[i]!;
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    const rest = text.slice(i);
    const num = /^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(rest);
    if (num) {
      out.push({ t: 'num', v: parseFloat(num[0]) });
      i += num[0].length;
      continue;
    }
    const id = /^[a-zA-Z][a-zA-Z0-9]*/.exec(rest);
    if (id) {
      out.push({ t: 'id', v: id[0].toLowerCase() });
      i += id[0].length;
      continue;
    }
    if ('+-*/^()!,'.includes(c)) {
      out.push({ t: 'op', v: c });
      i++;
      continue;
    }
    throw new ExprError(`I do not understand "${c}".`);
  }
  return out;
}

const CONSTS: Record<string, number> = { pi: Math.PI, e: Math.E };

const factorial = (x: number): number => {
  if (!Number.isInteger(x) || x < 0) throw new ExprError('Factorial needs a whole number that is 0 or more.');
  if (x > 170) throw new ExprError('That factorial is too large to show.');
  let r = 1;
  for (let k = 2; k <= x; k++) r *= k;
  return r;
};

type Fn = (x: number, mode: AngleMode) => number;
const toRad = (x: number, m: AngleMode) => (m === 'deg' ? (x * Math.PI) / 180 : x);
const fromRad = (x: number, m: AngleMode) => (m === 'deg' ? (x * 180) / Math.PI : x);
/** In degrees, exact multiples of 90 must give exact answers (sin 180 = 0, not 1.2e-16). */
const FUNCS: Record<string, Fn> = {
  sin: (x, m) => (m === 'deg' && x % 180 === 0 ? 0 : Math.sin(toRad(x, m))),
  cos: (x, m) => (m === 'deg' && (x - 90) % 180 === 0 ? 0 : Math.cos(toRad(x, m))),
  tan: (x, m) => {
    if (m === 'deg' && (x - 90) % 180 === 0) throw new ExprError('tan is undefined at 90 degrees and every 180 degrees after it.');
    return m === 'deg' && x % 180 === 0 ? 0 : Math.tan(toRad(x, m));
  },
  asin: (x, m) => fromRad(Math.asin(x), m),
  acos: (x, m) => fromRad(Math.acos(x), m),
  atan: (x, m) => fromRad(Math.atan(x), m),
  sinh: (x) => Math.sinh(x),
  cosh: (x) => Math.cosh(x),
  tanh: (x) => Math.tanh(x),
  ln: (x) => Math.log(x),
  log: (x) => Math.log10(x),
  log2: (x) => Math.log2(x),
  sqrt: (x) => Math.sqrt(x),
  cbrt: (x) => Math.cbrt(x),
  abs: (x) => Math.abs(x),
  exp: (x) => Math.exp(x),
  floor: (x) => Math.floor(x),
  ceil: (x) => Math.ceil(x),
  round: (x) => Math.round(x),
  fact: (x) => factorial(x),
};
export const FUNCTION_NAMES = Object.keys(FUNCS);

/** Evaluate an expression. Throws ExprError for anything that is not a real number. */
export function evaluate(src: string, mode: AngleMode = 'deg'): number {
  if (src.length > MAX_LENGTH) throw new ExprError(`Keep the expression under ${MAX_LENGTH} characters.`);
  const tokens = tokenize(src);
  if (tokens.length === 0) throw new ExprError('Type an expression, for example 2 + 3 * 4.');
  let pos = 0;
  let depth = 0;

  const peek = () => tokens[pos];
  const isOp = (v: string) => {
    const t = peek();
    return t !== undefined && t.t === 'op' && t.v === v;
  };
  const isWord = (v: string) => {
    const t = peek();
    return t !== undefined && t.t === 'id' && t.v === v;
  };
  /** True when the next token can start a value, which makes "2pi" and "3(4)" an implicit multiplication. */
  const startsValue = () => {
    const t = peek();
    if (!t) return false;
    if (t.t === 'num') return true;
    if (t.t === 'id') return t.v !== 'mod';
    return t.v === '(';
  };

  function expression(): number {
    let v = term();
    while (isOp('+') || isOp('-')) {
      const plus = isOp('+');
      pos++;
      const r = term();
      v = plus ? v + r : v - r;
    }
    return v;
  }
  function term(): number {
    let v = unary();
    for (;;) {
      if (isOp('*')) {
        pos++;
        v *= unary();
      } else if (isOp('/')) {
        pos++;
        const d = unary();
        if (d === 0) throw new ExprError('You cannot divide by zero.');
        v /= d;
      } else if (isWord('mod')) {
        pos++;
        const d = unary();
        if (d === 0) throw new ExprError('You cannot take a remainder by zero.');
        v %= d;
      } else if (startsValue()) {
        v *= unary();
      } else return v;
    }
  }
  function unary(): number {
    if (isOp('-')) {
      pos++;
      return -unary();
    }
    if (isOp('+')) {
      pos++;
      return unary();
    }
    return power();
  }
  function power(): number {
    const base = postfix();
    if (isOp('^')) {
      pos++;
      return Math.pow(base, unary());
    }
    return base;
  }
  function postfix(): number {
    let v = primary();
    while (isOp('!')) {
      pos++;
      v = factorial(v);
    }
    return v;
  }
  function primary(): number {
    const t = peek();
    if (!t) throw new ExprError('The expression ends too soon.');
    if (t.t === 'num') {
      pos++;
      return t.v;
    }
    if (t.t === 'id') {
      pos++;
      if (t.v in CONSTS) return CONSTS[t.v]!;
      const fn = FUNCS[t.v];
      if (!fn) throw new ExprError(`I do not know "${t.v}".`);
      // Allow sin(30), sin 30 and √16.
      const arg = isOp('(') ? group() : unary();
      return fn(arg, mode);
    }
    if (t.v === '(') return group();
    throw new ExprError(`Unexpected "${t.v}".`);
  }
  function group(): number {
    if (++depth > MAX_DEPTH) throw new ExprError('Too many brackets inside brackets.');
    pos++; // (
    const v = expression();
    if (!isOp(')')) throw new ExprError('A bracket is not closed.');
    pos++;
    depth--;
    return v;
  }

  const result = expression();
  if (pos < tokens.length) {
    const t = tokens[pos]!;
    throw new ExprError(t.t === 'op' && t.v === ')' ? 'There is a closing bracket with no opening one.' : `Unexpected "${t.v}".`);
  }
  if (Number.isNaN(result)) throw new ExprError('That is not a real number (for example the square root of a negative number).');
  if (!Number.isFinite(result)) throw new ExprError('That number is too large to show.');
  return result;
}

/** A readable number for the keypad-style calculators: 12 significant digits, no 0.30000000000000004, grouped in thousands. */
export function showNumber(x: number): string {
  if (x === 0) return '0';
  const p = parseFloat(x.toPrecision(12));
  const abs = Math.abs(p);
  if (abs >= 1e15 || abs < 1e-9) return p.toExponential(8).replace(/\.?0+e/, 'e');
  return p.toLocaleString('en-US', { maximumFractionDigits: 12 });
}

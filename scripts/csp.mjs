// Runs after `astro build`. Writes dist/_headers with a Content-Security-Policy that lists the exact hash of every inline script and
// style the built pages contain, so the policy needs no 'unsafe-inline'. It fails the build if a page has anything the policy cannot
// allow (an inline style attribute or event handler), which keeps the policy from being loosened by accident.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const hash = (text) => `'sha256-${createHash('sha256').update(text, 'utf8').digest('base64')}'`;

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? htmlFiles(p) : p.endsWith('.html') ? [p] : [];
  });
}

const scripts = new Set();
const styles = new Set();
const problems = [];
for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, 'utf8');
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    const attrs = m[1];
    if (/\bsrc\s*=/.test(attrs)) continue; // an external file: allowed by 'self'
    if (/type\s*=\s*["']application\/ld\+json["']/.test(attrs)) continue; // a data block, never executed
    scripts.add(hash(m[2]));
  }
  for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)) styles.add(hash(m[1]));
  // Anything that is not inside a <script> or <style> block.
  const markup = html.replace(/<script\b[\s\S]*?<\/script>/g, '').replace(/<style\b[\s\S]*?<\/style>/g, '');
  if (/\sstyle\s*=\s*["']/.test(markup)) problems.push(`${file}: inline style attribute`);
  if (/\son[a-z]+\s*=\s*["']/i.test(markup)) problems.push(`${file}: inline event handler`);
}
if (problems.length) {
  console.error(`CSP: the built pages contain things the policy cannot allow:\n${[...new Set(problems)].join('\n')}`);
  process.exit(1);
}

const csp = [
  "default-src 'self'",
  `script-src 'self' ${[...scripts].sort().join(' ')}`,
  `style-src 'self' ${[...styles].sort().join(' ')}`,
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const source = readFileSync('public/_headers', 'utf8');
const line = /^(\s*Content-Security-Policy:\s*)__CSP__\s*$/m;
if (!line.test(source)) {
  console.error('CSP: public/_headers has no "Content-Security-Policy: __CSP__" line.');
  process.exit(1);
}
writeFileSync(join(DIST, '_headers'), source.replace(line, (_m, head) => `${head}${csp}`));
console.log(`CSP: ${scripts.size} inline script hash(es), ${styles.size} style hash(es), written to dist/_headers`);

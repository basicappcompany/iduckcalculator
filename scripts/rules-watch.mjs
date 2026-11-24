// Checks that the official pages behind the tax calculators still show the figures the code uses.
// Run: node scripts/rules-watch.mjs   (exit 1 if a page loads but a figure is gone; unreachable pages are reported, not failed).
// When a figure changes: re-read the source, update the calculator, its tests and guides, then update the figure here.
// `norm: true` is for the German law pages: they print 12 348 with a no-break space and 12348 without one, so tags are stripped and
// digit groups are joined before matching (write the figures here without a separator: 12348, 11135,63).
// Not covered (no stable, scriptable source): the BMF Programmablaufplan (a PDF), the pension and unemployment rates, the Saxony care rate.
const CHECKS = [
  { url: 'https://www.gov.uk/income-tax-rates', has: ['12,570', '50,270', '125,140'] },
  { url: 'https://www.gov.uk/scottish-income-tax', has: ['16,537', '29,526', '43,662'] },
  { url: 'https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027', has: ['12,570', '50,270'] },
  { url: 'https://www.irs.gov/taxtopics/tc751', has: ['6.2%', '1.45%', '184,500'] },
  { url: 'https://www.irs.gov/taxtopics/tc560', has: ['0.9%', '200,000'] },
  { url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/tax-rates-brackets/current-year.html', has: ['58,523', '117,045', '181,440', '258,482'] },
  { url: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/canada-pension-plan-cpp/cpp-contribution-rates-maximums-exemptions.html', has: ['74,600', '5.95'] },
  { url: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/employment-insurance-ei/ei-premium-rates-maximums.html', has: ['68,900', '1.63'] },
  { url: 'https://www.gesetze-im-internet.de/estg/__32a.html', norm: true, has: ['Veranlagungszeitraum 2026', '12348', '17799', '69878', '277825', '914,51', '173,10', '2397', '1034,87', '11135,63', '19470,38'] },
  { url: 'https://www.gesetze-im-internet.de/solzg_1995/__3.html', norm: true, has: ['20350', '40700'] },
  { url: 'https://www.gesetze-im-internet.de/solzg_1995/__4.html', norm: true, has: ['5,5', '11,9'] },
  { url: 'https://www.gesetze-im-internet.de/estg/__9a.html', norm: true, has: ['1230'] },
  { url: 'https://www.gesetze-im-internet.de/estg/__10c.html', norm: true, has: ['36 Euro'] },
  { url: 'https://www.bundesregierung.de/breg-de/aktuelles/beitragsgemessungsgrenzen-2386514', has: ['101.400', '69.750'] },
  { url: 'https://www.bundesgesundheitsministerium.de/beitraege', has: ['14,6', '2,9'] },
];
const normalize = (html) => html.replace(/&#160;|&nbsp;|\u00a0/g, ' ').replace(/<[^>]+>/g, ' ').replace(/(\d) (?=\d{3}(?!\d))/g, '$1').replace(/\s+/g, ' ');
let bad = 0;
for (const { url, has, norm } of CHECKS) {
  try {
    const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (rules-watch)' } });
    if (!r.ok) { console.log(`SKIP ${r.status} ${url}`); continue; }
    const t = norm ? normalize(await r.text()) : await r.text();
    const missing = has.filter((s) => !t.includes(s));
    if (missing.length) { bad++; console.log(`CHANGED ${url}\n  not found: ${missing.join(', ')}`); } else console.log(`ok   ${url}`);
  } catch (e) { console.log(`SKIP ${e.message} ${url}`); }
}
process.exit(bad ? 1 : 0);

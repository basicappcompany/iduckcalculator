// Checks that the official pages behind the tax calculators still show the figures the code uses.
// Run: node scripts/rules-watch.mjs   (exit 1 if a page loads but a figure is gone; unreachable pages are reported, not failed).
// When a figure changes: re-read the source, update the calculator, its tests and guides, then update the figure here.
const CHECKS = [
  { url: 'https://www.gov.uk/income-tax-rates', has: ['12,570', '50,270', '125,140'] },
  { url: 'https://www.gov.uk/scottish-income-tax', has: ['16,537', '29,526', '43,662'] },
  { url: 'https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027', has: ['12,570', '50,270'] },
  { url: 'https://www.irs.gov/taxtopics/tc751', has: ['6.2%', '1.45%', '184,500'] },
  { url: 'https://www.irs.gov/taxtopics/tc560', has: ['0.9%', '200,000'] },
  { url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/tax-rates-brackets/current-year.html', has: ['58,523', '117,045', '181,440', '258,482'] },
  { url: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/canada-pension-plan-cpp/cpp-contribution-rates-maximums-exemptions.html', has: ['74,600', '5.95'] },
  { url: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/employment-insurance-ei/ei-premium-rates-maximums.html', has: ['68,900', '1.63'] },
];
let bad = 0;
for (const { url, has } of CHECKS) {
  try {
    const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (rules-watch)' } });
    if (!r.ok) { console.log(`SKIP ${r.status} ${url}`); continue; }
    const t = await r.text();
    const missing = has.filter((s) => !t.includes(s));
    if (missing.length) { bad++; console.log(`CHANGED ${url}\n  not found: ${missing.join(', ')}`); } else console.log(`ok   ${url}`);
  } catch (e) { console.log(`SKIP ${e.message} ${url}`); }
}
process.exit(bad ? 1 : 0);

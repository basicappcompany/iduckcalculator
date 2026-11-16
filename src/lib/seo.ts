/** Structured data (JSON-LD) builders. Pure functions so they can be unit tested. */
export const SITE_URL = 'https://iduckcalculator.com';
export const SITE_NAME = 'iDuckCalculator';
export const OG_IMAGE = `${SITE_URL}/og.png`;
export const GITHUB_URL = 'https://github.com/basicappcompany/iduckcalculator';

type Json = Record<string, unknown>;

export function absolute(path: string): string {
  return new URL(path, SITE_URL).href;
}

export function organizationLd(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Basic App Company',
    url: SITE_URL,
    logo: absolute('/favicon.svg'),
    sameAs: ['https://iduckpdf.com/', 'https://iduckimg.com/', 'https://iduckconvert.com/'],
    contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: 'hello@iduckcalculator.com', url: absolute('/feedback/') },
  };
}

export function websiteLd(inLanguage = 'en', description = 'Free calculators that run in your browser.'): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description,
    inLanguage,
  };
}

const APP_CATEGORY: Record<string, string> = { loans: 'FinanceApplication', savings: 'FinanceApplication', tax: 'FinanceApplication', health: 'HealthApplication', students: 'EducationApplication' };

export function webApplicationLd(name: string, path: string, description: string, group = '', inLanguage = 'en'): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    url: absolute(path),
    description,
    inLanguage,
    applicationCategory: APP_CATEGORY[group] ?? 'UtilitiesApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires a modern browser with JavaScript',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'Basic App Company', url: SITE_URL },
  };
}

export function breadcrumbLd(trail: { name: string; path: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: absolute(t.path) })),
  };
}

export function howToLd(name: string, steps: string[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    step: steps.map((text, i) => ({ '@type': 'HowToStep', position: i + 1, text })),
  };
}

export function faqLd(faqs: readonly { q: string; a: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

/** A how-to article. Dates are ISO (YYYY-MM-DD). The author and publisher are the company, not a person. */
export function articleLd(a: { headline: string; description: string; path: string; datePublished: string; dateModified: string; inLanguage?: string }): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.headline,
    description: a.description,
    url: absolute(a.path),
    mainEntityOfPage: absolute(a.path),
    datePublished: a.datePublished,
    dateModified: a.dateModified,
    inLanguage: a.inLanguage ?? 'en',
    image: OG_IMAGE,
    author: { '@type': 'Organization', name: 'Basic App Company', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'Basic App Company', url: SITE_URL, logo: { '@type': 'ImageObject', url: absolute('/favicon.svg') } },
  };
}

/** A list page: a collection of pages in order. */
export function collectionLd(name: string, path: string, description: string, items: { name: string; path: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    url: absolute(path),
    description,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: absolute(it.path) })),
    },
  };
}

/** JSON for inside a <script>: "<" is escaped so the data can never close the tag early. */
export function serialize(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** The date shown in the footer ("Last updated"). The docs-sync skill updates it when it re-checks the site. */
export const LAST_UPDATED = '2026-11-16';

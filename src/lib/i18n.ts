/**
 * Language support for the page chrome: English (US) and Turkish. The pages are built in English; elements marked
 * `data-i18n="key"` (text), `data-i18n-aria` or `data-i18n-placeholder` are swapped on the visitor's device when they pick Turkish.
 * The choice is saved in localStorage under `duck.lang`. Calculator names, labels, formulas and FAQs stay English for now.
 * Turkish is machine-written and has not been read by a person, so the menu says so.
 */
export const LANG_STORAGE_KEY = 'duck.lang';

export interface Language {
  code: 'en' | 'tr';
  hreflang: string;
  native: string;
  reviewed: boolean;
}
export const LANGUAGES: readonly Language[] = [
  { code: 'en', hreflang: 'en-US', native: 'English (US)', reviewed: true },
  { code: 'tr', hreflang: 'tr', native: 'Türkçe', reviewed: false },
];

export const EN = {
  skip: 'Skip to the calculator',
  home: 'Home',
  helper: 'Ask the helper',
  all: 'All calculators',
  guides: 'How-to guides',
  calculators: 'Calculators',
  community: 'Community',
  alsoFrom: 'Also from iDuck',
  search: 'Search',
  searchPlaceholder: 'Search calculators…',
  searchAria: 'Search calculators, pages and actions',
  support: 'Support',
  language: 'Language',
  theme: 'Switch between light and dark',
  menu: 'Open the menu',
  runs: 'Runs in your browser',
  noSignup: 'No sign-up',
  noAds: 'No ads',
  quick: 'Quick answer',
  how: 'How it works',
  formula: 'The formula',
  example: 'A worked example',
  faq: 'Common questions',
  related: 'Related calculators',
  readGuide: 'Read the guide',
  rulesAsOf: 'Rules as of',
  footerTagline: 'Free calculators that run in your browser.',
  machine: 'This translation was made by a machine and has not been read by a person yet. Calculator names, labels and answers are still in English.',
  roadmap: 'Roadmap',
  request: 'Request a calculator',
  feedback: 'Send feedback',
  settings: 'Settings',
  about: 'About',
  privacy: 'Privacy',
  terms: 'Terms',
} as const;
export type Dict = Record<keyof typeof EN, string>;

export const TR: Dict = {
  skip: 'Hesap makinesine geç',
  home: 'Ana sayfa',
  helper: 'Yardımcıya sor',
  all: 'Tüm hesap makineleri',
  guides: 'Nasıl yapılır rehberleri',
  calculators: 'Hesap makineleri',
  community: 'Topluluk',
  alsoFrom: 'iDuck ailesinden',
  search: 'Ara',
  searchPlaceholder: 'Hesap makinesi ara…',
  searchAria: 'Hesap makinelerinde, sayfalarda ve eylemlerde ara',
  support: 'Destek ol',
  language: 'Dil',
  theme: 'Açık ve koyu tema arasında geç',
  menu: 'Menüyü aç',
  runs: 'Tarayıcınızda çalışır',
  noSignup: 'Üyelik yok',
  noAds: 'Reklam yok',
  quick: 'Kısa cevap',
  how: 'Nasıl çalışır',
  formula: 'Formül',
  example: 'Çözümlü örnek',
  faq: 'Sık sorulan sorular',
  related: 'İlgili hesap makineleri',
  readGuide: 'Rehberi oku',
  rulesAsOf: 'Kuralların geçerlilik tarihi',
  footerTagline: 'Tarayıcınızda çalışan ücretsiz hesap makineleri.',
  machine: 'Bu çeviri makine tarafından yapıldı ve henüz bir kişi tarafından okunmadı. Hesap makinesi adları, etiketleri ve cevaplar şimdilik İngilizce.',
  roadmap: 'Yol haritası',
  request: 'Hesap makinesi iste',
  feedback: 'Geri bildirim gönder',
  settings: 'Ayarlar',
  about: 'Hakkında',
  privacy: 'Gizlilik',
  terms: 'Koşullar',
};

export const DICTS: Record<Language['code'], Dict> = { en: EN, tr: TR };

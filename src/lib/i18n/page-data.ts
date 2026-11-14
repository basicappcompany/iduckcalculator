/** The English text of lists on the roadmap and support pages. The collector scans this file, so every string here is sent for translation. */

/** What is next on the roadmap. */
export const ROADMAP_NEXT = [
  { name: 'In-hand salary from CTC and TDS basics', note: 'Built on the same checked rules.' },
  { name: 'NPS', note: 'Government schemes: the calculators wait for the current rates and limits to be checked.' },
];

/** What is further off. */
export const ROADMAP_LATER = ['Native-speaker read-throughs of the translations', 'Share a result as a link', 'More health and student tools, based on your requests'];

/** The "other ways to help" cards on the support page. */
export const SUPPORT_CARDS = [
  { to: '/feedback/', icon: '🐞', title: 'Report a problem', text: 'Found a result that looks wrong? Tell us what you typed and what you expected.' },
  { to: '/request/', icon: '💡', title: 'Suggest a calculator', text: 'Tell us what you wish existed. Requests decide what gets built next.' },
  { to: '/roadmap/', icon: '🗺️', title: 'See what is coming', text: 'Everything that is live and everything we are thinking about.' },
  { to: '/about/', icon: '🦆', title: 'Learn how it works', text: 'Who runs it, what it costs, and how your numbers are handled.' },
];

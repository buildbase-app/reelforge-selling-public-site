import type { Messages } from '../types';
import type { Locale } from '../config';

import en from './en';

// Only served locales are loaded (see `locales` in ../config.ts). The other
// message files (hi, es, fr, de, ja, zh, ar) stay in this folder, unused:
// they hold the starter's demo copy and must be translated before a code is
// added back. Then import it here and add it to the map.
export const messages: Record<Locale, Messages> = {
  en,
};

export function getMessages(locale: Locale): Messages {
  return messages[locale] ?? messages.en;
}

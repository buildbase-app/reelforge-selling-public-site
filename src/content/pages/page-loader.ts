import { locales, defaultLocale } from '@/i18n/config';
import type { Locale } from '@/i18n/config';

/**
 * Generic per-page content loader.
 *
 * Every legal page is a module per language,
 * `src/content/pages/{page}/{locale}.ts`, holding its header fields and a
 * Markdown body (rendered and sanitised on the server by `LegalPage`), and
 * its `index.ts` wraps them with `createPageLoader`.
 *
 * Fallback rule: if the requested locale has no translation, the
 * default-locale version is served.
 */
export interface PageContentLoader<T> {
  get(locale: Locale): Promise<T | null>;
  getSupportedLocales(): Promise<Locale[]>;
}

interface LocalizedDoc {
  locale: string;
}

/** One legal page in one language. */
export interface LegalPageContent extends LocalizedDoc {
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  seoTitle?: string;
  seoDescription?: string;
  /** `YYYY-MM-DD`. */
  lastUpdated: string;
  /** Shows a "Draft – pending review" note above the page. */
  pendingReview?: boolean;
  /** Markdown. */
  body: string;
}

function isKnownLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function createPageLoader<T extends LocalizedDoc>(
  allDocs: readonly T[]
): PageContentLoader<T> {
  const native = allDocs.filter((d) => isKnownLocale(d.locale));

  return {
    async get(locale) {
      const match = native.find((d) => d.locale === locale);
      if (match) return match;
      if (locale !== defaultLocale) {
        return native.find((d) => d.locale === defaultLocale) ?? null;
      }
      return null;
    },

    async getSupportedLocales() {
      return native.map((d) => d.locale as Locale);
    },
  };
}

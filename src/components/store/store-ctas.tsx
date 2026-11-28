import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/link';

export interface StoreCtaLabels {
  waitlist: string;
  pricing: string;
  buy: string;
  free: string;
  faq: string;
}

/** The buttons' words, from the `home` messages. */
export async function getStoreCtaLabels(
  locale: string
): Promise<StoreCtaLabels> {
  const t = await getTranslations({ locale, namespace: 'home' });
  return {
    waitlist: t('hero.waitlist'),
    pricing: t('hero.pricing'),
    buy: t('hero.buy'),
    free: t('hero.free'),
    faq: t('hero.faq'),
  };
}

/**
 * The two main buttons: "Join the waitlist" and "See pricing" until the
 * store has something on sale, then "Buy RenderWeld" and "Read the FAQ".
 * While only the free Personal key can be claimed (`freeKey`, nothing
 * paid on sale): "Get the free Personal licence" and "Join the waitlist".
 * Decided from the published items the page read on the server, so it
 * changes without a deploy. When the server could not read them (`onSale`
 * undefined), it shows the first pair: both still lead to the prices.
 * No browser read and no BuildBase provider: the home page renders without
 * one (studio issue #79). A server component: nothing here runs in the
 * browser, so the buttons' classes and icons cost no JavaScript.
 */
export function StoreCtas({
  labels,
  onSale,
  freeKey,
  goalSection,
}: {
  labels: StoreCtaLabels;
  onSale?: boolean;
  /** A free key can be claimed now (`freeKeyFrom`). */
  freeKey?: boolean;
  /**
   * Where the buttons are (`hero`, `final`): the primary button then counts
   * the `primary_cta` goal through BuildBase tracking's `data-bb-goal`.
   */
  goalSection?: string;
}) {
  return (
    <Ctas
      labels={labels}
      state={saleState(onSale, freeKey)}
      goalSection={goalSection}
    />
  );
}

/** What the store offers now: paid licences, only the free key, or nothing. */
export type SaleState = 'paid' | 'free' | 'none';

/** Unknown (undefined) counts as nothing on sale: both buttons still lead to the prices. */
export function saleState(onSale?: boolean, freeKey?: boolean): SaleState {
  if (onSale) return 'paid';
  if (freeKey) return 'free';
  return 'none';
}

/**
 * The page's primary action: "Join the waitlist" until the store has
 * something on sale, "Get the free Personal licence" while only the free
 * key can be claimed, then "Buy RenderWeld". The hero, the final call to
 * action and the header (`HeaderCta`) all decide it here.
 */
export function primaryCta(labels: StoreCtaLabels, state: SaleState) {
  if (state === 'paid')
    return { href: '/pricing', label: labels.buy, target: 'pricing' };
  if (state === 'free')
    return { href: '/pricing', label: labels.free, target: 'pricing' };
  return { href: '/waitlist', label: labels.waitlist, target: 'waitlist' };
}

/** The second button, beside `primaryCta`. */
export function secondaryCta(labels: StoreCtaLabels, state: SaleState) {
  if (state === 'paid') return { href: '/help', label: labels.faq };
  if (state === 'free') return { href: '/waitlist', label: labels.waitlist };
  return { href: '/pricing', label: labels.pricing };
}

/**
 * The same primary action in the site header on the home page (studio
 * issue #215), from the `@headerAction` slot: the header's one filled
 * button, in the accent (orange with ink text, 5.6:1). `data-header-cta`
 * tells the header it is there (see `HomeHeader`).
 */
export function HeaderCta({
  labels,
  onSale,
  freeKey,
}: {
  labels: StoreCtaLabels;
  onSale?: boolean;
  freeKey?: boolean;
}) {
  const cta = primaryCta(labels, saleState(onSale, freeKey));
  return (
    <Link
      href={cta.href}
      data-header-cta=""
      data-bb-goal="primary_cta"
      data-bb-goal-section="header"
      data-bb-goal-target={cta.target}
      className="bg-brand text-brand-foreground inline-flex h-9 shrink-0 items-center rounded-md px-4 text-sm font-medium whitespace-nowrap transition-colors hover:bg-[color-mix(in_oklab,var(--brand)_88%,black)] max-sm:px-3 max-sm:text-[13px]"
    >
      {cta.label}
    </Link>
  );
}

function Ctas({
  labels,
  state,
  goalSection,
}: {
  labels: StoreCtaLabels;
  state: SaleState;
  goalSection?: string;
}) {
  const primary = primaryCta(labels, state);
  const secondary = secondaryCta(labels, state);

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <Button size="lg" className="gap-2 px-8" asChild>
        <Link
          href={primary.href}
          {...(goalSection && {
            'data-bb-goal': 'primary_cta',
            'data-bb-goal-section': goalSection,
            'data-bb-goal-target': primary.target,
          })}
        >
          {primary.label}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </Button>
      <Button size="lg" variant="outline" className="gap-2 px-8" asChild>
        <Link href={secondary.href}>{secondary.label}</Link>
      </Button>
    </div>
  );
}

import { getStoreCtaLabels, HeaderCta } from '@/components/store/store-ctas';
import { getStoreItems, onSaleFrom } from '@/lib/store/items';

/**
 * The home page's primary action in the site header (studio issue #215):
 * "Join the waitlist" until the store is on sale, then "Buy ReelForge",
 * decided from the same store read as the page's own buttons (Next
 * deduplicates the fetch within the render).
 */
export default async function HomeHeaderAction({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [labels, store] = await Promise.all([
    getStoreCtaLabels(locale),
    getStoreItems(),
  ]);
  return <HeaderCta labels={labels} onSale={onSaleFrom(store)} />;
}

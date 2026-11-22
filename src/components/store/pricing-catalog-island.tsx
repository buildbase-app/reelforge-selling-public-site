'use client';

import { SaaSProvider } from '@/components/saas-provider';
import { PricingCatalog } from './pricing-catalog';

/**
 * Loaded only when a provider-free page could not read the store on the
 * server: the full catalog, reading the items in the browser. Its tracking is
 * off because the page already has `SiteTracking`.
 */
export default function PricingCatalogIsland() {
  return (
    <SaaSProvider tracking={false}>
      <PricingCatalog serverItems={null} />
    </SaaSProvider>
  );
}

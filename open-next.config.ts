import { defineCloudflareConfig } from '@opennextjs/cloudflare';

/**
 * No incremental cache override yet: R2 is not enabled on the Cloudflare
 * account, so ISR/`revalidate` data is not persisted between Worker
 * instances. Add the R2 incremental cache once a bucket exists:
 * https://opennext.js.org/cloudflare/caching
 */
export default defineCloudflareConfig({});

import { notFound } from 'next/navigation';

/**
 * Any path no page matches lands here, inside the locale layout, so the
 * 404 below gets the translations, header and footer instead of Next's
 * bare default page.
 */
export default function CatchAll() {
  notFound();
}

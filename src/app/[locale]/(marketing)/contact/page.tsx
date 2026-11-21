import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { HelpCircle, Mail, ScrollText } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { BreadcrumbJsonLd } from '@/components/seo/json-ld';
import { SUPPORT_EMAIL_TODO, siteConfig } from '@/config/site';
import { LEGAL_ENTITY_PLACEHOLDER } from '@/config/seo';
import type { Locale } from '@/i18n/config';
import { buildMarketingMetadata } from '@/lib/seo/marketing-metadata';

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

const TITLE = 'Contact';
const DESCRIPTION =
  'How to reach the people behind ReelForge: support, orders, refunds and privacy questions.';

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildMarketingMetadata({
    path: '/contact',
    locale: locale as Locale,
    title: TITLE,
    description: DESCRIPTION,
  });
}

/**
 * Public contact page. Shows the support email when NEXT_PUBLIC_SUPPORT_EMAIL
 * is set; otherwise points to Help (and, in development only, says the
 * address is missing). The seller's legal name is a visible placeholder
 * until the founder confirms it.
 */
export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const email = siteConfig.contact.support;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 md:py-24">
      <BreadcrumbJsonLd items={[{ name: TITLE, url: '/contact' }]} />
      <h1 className="text-foreground text-3xl font-bold tracking-tight md:text-5xl">
        {TITLE}
      </h1>
      <p className="text-muted-foreground mt-4 text-base md:text-lg">
        {DESCRIPTION}
      </p>

      <div className="mt-10 space-y-6">
        <section className="bg-card rounded-xl border p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Mail className="text-muted-foreground h-5 w-5" aria-hidden />
            Support
          </h2>
          {email ? (
            <p className="text-muted-foreground mt-2">
              Email{' '}
              <a
                href={`mailto:${email}`}
                className="text-foreground font-medium underline underline-offset-2"
              >
                {email}
              </a>{' '}
              about installation, your order, refunds or your personal data.
              Include your order number if you have one.
            </p>
          ) : (
            <div className="text-muted-foreground mt-2 space-y-2">
              {process.env.NODE_ENV !== 'production' && (
                <p className="text-destructive font-mono text-xs">
                  {SUPPORT_EMAIL_TODO}
                </p>
              )}
              <p>
                Contact us via the help page: the{' '}
                <Link
                  href="/help"
                  className="text-foreground font-medium underline underline-offset-2"
                >
                  Help
                </Link>{' '}
                page answers the common questions, and a direct support address
                will be published here before ReelForge goes on sale.
              </p>
              <p>
                To hear when ReelForge can be bought,{' '}
                <Link
                  href="/waitlist"
                  className="text-foreground font-medium underline underline-offset-2"
                >
                  join the waitlist
                </Link>
                .
              </p>
            </div>
          )}
        </section>

        <section className="bg-card rounded-xl border p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <HelpCircle className="text-muted-foreground h-5 w-5" aria-hidden />
            Before you write
          </h2>
          <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5">
            <li>
              <Link href="/help" className="text-foreground underline">
                Help and FAQ
              </Link>
            </li>
            <li>
              <Link href="/refund" className="text-foreground underline">
                Refund policy
              </Link>
            </li>
            <li>
              <Link href="/licence" className="text-foreground underline">
                Licences
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-foreground underline">
                Privacy policy
              </Link>
            </li>
          </ul>
        </section>

        <section className="bg-card rounded-xl border p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ScrollText className="text-muted-foreground h-5 w-5" aria-hidden />
            Seller
          </h2>
          <p className="text-muted-foreground mt-2">
            ReelForge is sold by {LEGAL_ENTITY_PLACEHOLDER}. [Address and
            country to be confirmed.]
          </p>
        </section>
      </div>
    </div>
  );
}

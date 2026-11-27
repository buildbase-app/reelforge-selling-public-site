import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { HelpCircle, Mail, ScrollText } from 'lucide-react';
import { Link } from '@/i18n/link';
import { BreadcrumbJsonLd } from '@/components/seo/json-ld';
import {
  SUPPORT_EMAIL_TODO,
  companyAddressLine,
  siteConfig,
} from '@/config/site';
import type { Locale } from '@/i18n/config';
import { buildMarketingMetadata } from '@/lib/seo/marketing-metadata';

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

const TITLE = 'Contact';
const DESCRIPTION =
  'How to reach the people behind RenderWeld: support, orders, refunds and privacy questions.';

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

const { company, contact } = siteConfig;

/** One inbox per purpose, so a request lands with whoever handles it. */
const CHANNELS = [
  {
    title: 'Support',
    email: contact.support,
    about: 'Installation, your licence key, your order or a refund.',
  },
  {
    title: 'Privacy',
    email: contact.privacy,
    about: 'Your personal data: a copy, a correction or deletion.',
  },
  {
    title: 'Terms and licences',
    email: contact.legal,
    about: 'The terms of service, the licences and commercial use.',
  },
  {
    title: 'Everything else',
    email: contact.general,
    about: 'Partnerships, press and general questions.',
  },
] as const;

/**
 * Public contact page: one inbox per purpose and the seller's name and
 * address. The support address comes from NEXT_PUBLIC_SUPPORT_EMAIL (set in
 * .env.production); a development build without it says so.
 */
export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 md:py-24">
      <BreadcrumbJsonLd items={[{ name: TITLE, url: '/contact' }]} />
      <h1 className="text-foreground text-3xl font-medium tracking-tight md:text-5xl">
        {TITLE}
      </h1>
      <p className="text-muted-foreground mt-4 text-base md:text-lg">
        {DESCRIPTION}
      </p>

      <div className="mt-10 space-y-6">
        <section className="bg-card rounded-xl border p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Mail className="text-muted-foreground h-5 w-5" aria-hidden />
            Email us
          </h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {CHANNELS.map((channel) => (
              <div key={channel.title}>
                <dt className="text-foreground font-medium">{channel.title}</dt>
                <dd className="text-muted-foreground mt-1 text-sm">
                  {channel.email ? (
                    <a
                      href={`mailto:${channel.email}`}
                      className="text-foreground underline underline-offset-2"
                    >
                      {channel.email}
                    </a>
                  ) : (
                    process.env.NODE_ENV !== 'production' && (
                      <span className="text-destructive font-mono text-xs">
                        {SUPPORT_EMAIL_TODO}
                      </span>
                    )
                  )}
                  <span className="mt-1 block">{channel.about}</span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-muted-foreground mt-4 text-sm">
            Include your order number if you have one. Write in English if you
            can.
          </p>
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
          <address className="text-muted-foreground mt-2 not-italic">
            RenderWeld is developed, maintained and sold by{' '}
            <span className="text-foreground">{company.legalName}</span>,{' '}
            {companyAddressLine}.
          </address>
        </section>
      </div>
    </div>
  );
}

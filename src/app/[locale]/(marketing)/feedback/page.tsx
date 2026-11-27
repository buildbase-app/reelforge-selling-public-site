import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Clapperboard, Lightbulb, Map as MapIcon } from 'lucide-react';
import { Link } from '@/i18n/link';
import { ContactForm } from '@/components/contact/contact-form';
import { BreadcrumbJsonLd } from '@/components/seo/json-ld';
import type { Locale } from '@/i18n/config';
import { getCollectionRecords } from '@/lib/platform/content';
import { getPublicForm } from '@/lib/platform/forms';
import {
  ROADMAP_COLLECTION,
  ROADMAP_STATUSES,
  ROADMAP_STATUS_LABELS,
  toRoadmap,
  type RoadmapRecord,
} from '@/lib/roadmap';
import { buildMarketingMetadata } from '@/lib/seo/marketing-metadata';

interface FeedbackPageProps {
  params: Promise<{ locale: string }>;
}

const TITLE = 'Feedback';
const DESCRIPTION =
  'Suggest a feature or a reel template for RenderWeld, and see what is planned, in progress and shipped.';

export async function generateMetadata({
  params,
}: FeedbackPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildMarketingMetadata({
    path: '/feedback',
    locale: locale as Locale,
    title: TITLE,
    description: DESCRIPTION,
  });
}

/**
 * /feedback: the public roadmap (BuildBase collection `roadmap`, src/lib/roadmap)
 * and two BuildBase forms, Feature request and Template request
 * (NEXT_PUBLIC_BUILDBASE_FEATURE_REQUEST_FORM_ID and
 * NEXT_PUBLIC_BUILDBASE_TEMPLATE_REQUEST_FORM_ID). Submissions land in the
 * console and are never listed here; there are no vote counts.
 */
export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [featureForm, templateForm, records] = await Promise.all([
    getPublicForm('feature'),
    getPublicForm('template'),
    getCollectionRecords(ROADMAP_COLLECTION),
  ]);
  const roadmap = toRoadmap(records as RoadmapRecord[]);
  const hasRoadmap = ROADMAP_STATUSES.some((s) => roadmap[s].length > 0);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 md:py-24">
      <BreadcrumbJsonLd items={[{ name: TITLE, url: '/feedback' }]} />
      <h1 className="text-foreground text-3xl font-medium tracking-tight md:text-5xl">
        {TITLE}
      </h1>
      <p className="text-muted-foreground mt-4 text-base md:text-lg">
        {DESCRIPTION}
      </p>

      <div className="mt-10 space-y-6">
        <section
          aria-labelledby="roadmap"
          className="bg-card rounded-xl border p-6"
        >
          <h2
            id="roadmap"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <MapIcon className="text-muted-foreground h-5 w-5" aria-hidden />
            Roadmap
          </h2>
          {hasRoadmap ? (
            <div className="mt-4 space-y-6">
              {ROADMAP_STATUSES.filter((s) => roadmap[s].length > 0).map(
                (status) => (
                  <div key={status}>
                    <h3 className="text-foreground font-medium">
                      {ROADMAP_STATUS_LABELS[status]}
                    </h3>
                    <ul className="mt-2 space-y-3">
                      {roadmap[status].map((item) => (
                        <li key={item.id}>
                          <p className="text-foreground">{item.title}</p>
                          {item.summary && (
                            <p className="text-muted-foreground text-sm">
                              {item.summary}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-muted-foreground mt-2">
              Nothing is on the public roadmap yet. Shipped work is in the{' '}
              <Link href="/changelog" className="text-foreground underline">
                changelog
              </Link>
              .
            </p>
          )}
        </section>

        <section className="bg-card rounded-xl border p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Lightbulb className="text-muted-foreground h-5 w-5" aria-hidden />
            Suggest a feature
          </h2>
          <div className="mt-4">
            {featureForm ? (
              <ContactForm
                form={featureForm}
                idPrefix="feature"
                submitLabel="Send suggestion"
                sentMessage="Thanks, we read every suggestion. If it makes the roadmap, it shows up on this page."
              />
            ) : (
              <FallbackToContact />
            )}
          </div>
        </section>

        <section className="bg-card rounded-xl border p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Clapperboard
              className="text-muted-foreground h-5 w-5"
              aria-hidden
            />
            Request a template
          </h2>
          <div className="mt-4">
            {templateForm ? (
              <ContactForm
                form={templateForm}
                idPrefix="template"
                submitLabel="Send request"
                sentMessage="Thanks, we read every request. If it makes the roadmap, it shows up on this page."
              />
            ) : (
              <FallbackToContact />
            )}
          </div>
        </section>

        <p className="text-muted-foreground text-sm">
          Never put a password, licence key or other secret in these forms. For
          help with an order or your licence, use the{' '}
          <Link href="/contact" className="text-foreground underline">
            contact page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

function FallbackToContact() {
  return (
    <p className="text-muted-foreground">
      This form is not available right now. Send it through the{' '}
      <Link href="/contact" className="text-foreground underline">
        contact page
      </Link>{' '}
      instead.
    </p>
  );
}

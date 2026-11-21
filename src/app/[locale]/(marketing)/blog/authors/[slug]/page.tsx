import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLdScript } from 'next-seo';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BreadcrumbJsonLd } from '@/components/seo/json-ld';
import { PostList } from '@/components/marketing/post-list';
import type { Locale } from '@/i18n/config';
import { authorPersonJsonLd, authorSameAs, initials } from '@/lib/blog/authors';
import { authorsOf } from '@/lib/blog/posts';
import { getPosts } from '@/lib/blog/source';
import { buildMarketingMetadata } from '@/lib/seo/marketing-metadata';
import { localePath } from '@/lib/i18n-url';

/**
 * An author (console: Content, Blogs, Authors; the slug is the username)
 * and their posts. Only authors with a published post have a page. ISR, as
 * /blog.
 */
export const revalidate = 3600;

interface AuthorPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

async function load(username: string) {
  const posts = await getPosts('blog');
  const author = authorsOf(posts).find((a) => a.username === username);
  if (!author) return null;
  return {
    author,
    posts: posts.filter((p) => p.authors.some((a) => a.username === username)),
  };
}

export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const found = await load(slug);
  if (!found) return {};
  const t = await getTranslations({ locale, namespace: 'blog' });
  return buildMarketingMetadata({
    path: `/blog/authors/${slug}`,
    locale: locale as Locale,
    title: found.author.name,
    description: t('postsByAuthor', { name: found.author.name }),
    image: found.author.image,
  });
}

const LINK_LABELS: Record<string, string> = {
  'x.com': 'X',
  'twitter.com': 'X',
  'www.linkedin.com': 'LinkedIn',
  'linkedin.com': 'LinkedIn',
};

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const localeTyped = locale as Locale;
  const found = await load(slug);
  if (!found) notFound();
  const { author, posts } = found;
  const t = await getTranslations({ locale: localeTyped, namespace: 'blog' });
  const links = authorSameAs(author).map((href) => ({
    href,
    label: LINK_LABELS[new URL(href).hostname] ?? new URL(href).hostname,
  }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <JsonLdScript
        data={authorPersonJsonLd(author)}
        scriptKey={`person-${slug}`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: t('label'), url: localePath(localeTyped, '/blog') },
          {
            name: author.name,
            url: localePath(localeTyped, `/blog/authors/${slug}`),
          },
        ]}
      />

      <header className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-center">
        {author.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={author.image}
            alt=""
            className="border-border size-20 shrink-0 rounded-full border object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="bg-muted border-border text-muted-foreground flex size-20 shrink-0 items-center justify-center rounded-full border font-mono text-xl"
          >
            {initials(author.name)}
          </span>
        )}
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
            {author.name}
          </h1>
          {links.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground text-sm underline underline-offset-4"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      <section>
        <h2 className="text-muted-foreground mb-2 text-base font-medium">
          {t('postsByAuthor', { name: author.name })}
        </h2>
        <PostList posts={posts} headingLevel="h3" />
      </section>
    </div>
  );
}

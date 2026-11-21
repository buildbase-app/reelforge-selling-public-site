import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { BreadcrumbJsonLd } from '@/components/seo/json-ld';
import { PostList } from '@/components/marketing/post-list';
import type { Locale } from '@/i18n/config';
import { tagsOf } from '@/lib/blog/posts';
import { getPosts } from '@/lib/blog/source';
import { buildMarketingMetadata } from '@/lib/seo/marketing-metadata';
import { localePath } from '@/lib/i18n-url';

/** Posts with one BuildBase tag (by its slug). ISR, as /blog. */
export const revalidate = 3600;

interface TagPageProps {
  params: Promise<{ tag: string; locale: string }>;
}

async function load(slug: string) {
  const posts = await getPosts('blog');
  const tag = tagsOf(posts).find((t) => t.slug === slug);
  if (!tag) return null;
  return {
    tag,
    posts: posts.filter((p) => p.tags.some((t) => t.slug === slug)),
  };
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { tag, locale } = await params;
  const found = await load(decodeURIComponent(tag));
  if (!found) return {};
  const t = await getTranslations({ locale, namespace: 'blog' });
  return buildMarketingMetadata({
    path: `/blog/tag/${found.tag.slug}`,
    locale: locale as Locale,
    title: t('meta.tagTitle', { tag: found.tag.title }),
    description: t('meta.tagDescription', { tag: found.tag.title }),
  });
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag, locale } = await params;
  setRequestLocale(locale);
  const localeTyped = locale as Locale;
  const found = await load(decodeURIComponent(tag));
  if (!found) notFound();
  const t = await getTranslations({ locale: localeTyped, namespace: 'blog' });

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <BreadcrumbJsonLd
        items={[
          { name: t('label'), url: localePath(localeTyped, '/blog') },
          {
            name: found.tag.title,
            url: localePath(localeTyped, `/blog/tag/${found.tag.slug}`),
          },
        ]}
      />

      <header className="mb-12">
        <Link
          href="/blog"
          className="text-muted-foreground hover:text-foreground mb-4 inline-block text-sm transition-colors"
        >
          {t('allPosts')}
        </Link>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
          {found.tag.title}
        </h1>
        <p className="text-muted-foreground mt-3 text-base md:text-lg">
          {t('postsTaggedCount', {
            count: found.posts.length,
            tag: found.tag.title,
          })}
        </p>
      </header>

      <PostList posts={found.posts} />
    </div>
  );
}

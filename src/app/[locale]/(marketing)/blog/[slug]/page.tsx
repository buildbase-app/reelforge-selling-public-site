import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArticleHtml } from '@/components/content/article-html';
import { TableOfContents } from '@/components/marketing/table-of-contents';
import { PostMeta, TagLinks } from '@/components/marketing/post-meta';
import { ShareButtons } from '@/components/marketing/share-buttons';
import { RelatedPosts } from '@/components/marketing/related-posts';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/json-ld';
import type { Locale } from '@/i18n/config';
import { siteUrl } from '@/env';
import { seoConfig } from '@/config/seo';
import { Link } from '@/i18n/link';
import { initials, postAuthorJsonLd } from '@/lib/blog/authors';
import { relatedPosts } from '@/lib/blog/posts';
import { getPost, getPosts } from '@/lib/blog/source';
import { localePath, localeUrl } from '@/lib/i18n-url';
import { renderMarkdown } from '@/lib/platform/markdown';
import { buildMarketingMetadata } from '@/lib/seo/marketing-metadata';

/**
 * A post from BuildBase Blogs (folder `blog`), read through the cached
 * `buildbase:blog` read that the `blog.*` webhook revalidates, so a post
 * published or edited in the console shows on the next request. No
 * `generateStaticParams`: the build has no API token, and a post published
 * after the deploy must render on demand.
 */
export const revalidate = 3600;

interface BlogPostPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = await getPost('blog', slug);
  if (!post) return {};
  return buildMarketingMetadata({
    path: `/blog/${slug}`,
    locale: locale as Locale,
    title: post.title,
    description: post.description,
    type: 'article',
    image: post.image,
    publishedTime: post.date,
    modifiedTime: post.updated,
    authors: post.authors.map((a) => a.name),
    articleTags: post.tags.map((t) => t.title),
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const localeTyped = locale as Locale;
  const t = await getTranslations({ locale: localeTyped, namespace: 'blog' });

  const [post, all] = await Promise.all([
    getPost('blog', slug),
    getPosts('blog'),
  ]);
  if (!post) notFound();

  const postPath = `/blog/${slug}`;
  const fullUrl = localeUrl(siteUrl, localeTyped, postPath);
  const { html } = renderMarkdown(post.markdown);
  const author = post.authors[0];

  return (
    <>
      <ArticleJsonLd
        title={post.title}
        description={post.description}
        url={fullUrl}
        image={post.image}
        datePublished={post.date}
        dateModified={post.updated}
        author={postAuthorJsonLd(post)}
        publisher={{
          name: seoConfig.publisher.name,
          logo: seoConfig.publisher.logo,
        }}
        wordCount={post.wordCount}
        articleSection={t('label')}
        keywords={post.tags.map((tag) => tag.title)}
        inLanguage={localeTyped}
      />
      <BreadcrumbJsonLd
        items={[
          { name: t('label'), url: localePath(localeTyped, '/blog') },
          { name: post.title, url: localePath(localeTyped, postPath) },
        ]}
      />
      <article className="mx-auto max-w-3xl px-6 pt-16 pb-16 md:pt-24">
        <nav className="text-muted-foreground mb-8 text-sm">
          <Link
            href="/blog"
            className="hover:text-foreground transition-colors"
          >
            {t('label')}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{post.title}</span>
        </nav>

        <PostMeta post={post} locale={localeTyped} />

        <h1 className="text-foreground mt-4 text-3xl font-medium tracking-tight text-balance md:text-4xl">
          {post.title}
        </h1>
        {post.description ? (
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            {post.description}
          </p>
        ) : null}

        {author ? (
          <div className="border-border mt-8 flex items-center gap-3 border-t pt-6">
            <Link
              href={`/blog/authors/${author.username}`}
              className="flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              {author.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={author.image}
                  alt=""
                  className="border-border size-10 rounded-full border object-cover"
                />
              ) : (
                <span
                  aria-hidden
                  className="bg-muted border-border text-muted-foreground flex size-10 items-center justify-center rounded-full border font-mono text-xs"
                >
                  {initials(author.name)}
                </span>
              )}
              <span className="text-foreground text-sm font-medium">
                {post.authors.map((a) => a.name).join(', ')}
              </span>
            </Link>
          </div>
        ) : null}

        {post.tags.length > 0 ? (
          <div className="mt-6">
            <TagLinks tags={post.tags} />
          </div>
        ) : null}

        <div className="mt-12">
          <TableOfContents />
          <ArticleHtml html={html} className="mt-10" />
        </div>

        <div className="border-border mt-12 border-t pt-6">
          <ShareButtons
            url={fullUrl}
            title={post.title}
            labels={{
              share: t('share'),
              x: t('shareAriaX'),
              linkedin: t('shareAriaLinkedin'),
              facebook: t('shareAriaFacebook'),
              copy: t('shareAriaCopy'),
              copied: t('shareAriaCopied'),
            }}
          />
        </div>

        <RelatedPosts posts={relatedPosts(post, all)} />
      </article>
    </>
  );
}

import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { postDay, type BlogPost } from '@/lib/blog/posts';

/** The list of post cards on /blog, a tag page and an author page. */
export async function PostList({
  posts,
  activeTag,
  headingLevel = 'h2',
}: {
  posts: BlogPost[];
  /** A tag page highlights its own tag. */
  activeTag?: string;
  headingLevel?: 'h2' | 'h3';
}) {
  const t = await getTranslations('blog');
  const Heading = headingLevel;
  return (
    <div className="border-border bg-border flex flex-col gap-px overflow-hidden rounded-lg border">
      {posts.map((post) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="bg-background hover:bg-muted group flex flex-col gap-3 p-6 transition-colors md:p-8"
        >
          <span className="text-muted-foreground font-mono text-xs">
            <time dateTime={post.date}>{postDay(post.date)}</time> ·{' '}
            {post.readingTime}
          </span>
          <Heading className="text-foreground text-xl font-bold tracking-tight md:text-2xl">
            {post.title}
          </Heading>
          {post.description ? (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {post.description}
            </p>
          ) : null}
          {post.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag.slug}
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    tag.slug === activeTag
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {tag.title}
                </span>
              ))}
            </div>
          ) : null}
          <span className="text-primary mt-2 inline-flex items-center gap-2 text-sm opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            {t('readMore')}
            <ArrowRight className="size-4" aria-hidden />
          </span>
        </Link>
      ))}
    </div>
  );
}

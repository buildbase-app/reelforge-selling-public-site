import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import type { BlogPost } from '@/lib/blog/posts';

interface RelatedPostsProps {
  posts: BlogPost[];
}

/**
 * Shows up to three related blog posts. The parent page picks them
 * (`relatedPosts`: shared tags).
 */
export async function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  const t = await getTranslations('blog');

  return (
    <section className="border-border mt-16 border-t pt-12">
      <h2 className="text-foreground mb-6 text-xl font-bold tracking-tight">
        {t('relatedPosts')}
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="border-border hover:border-primary/50 group flex flex-col gap-3 rounded-lg border p-6 transition-colors"
          >
            {post.tags[0] ? (
              <span className="text-primary font-mono text-xs tracking-wider uppercase">
                {post.tags[0].title}
              </span>
            ) : null}
            <h3 className="text-foreground text-base leading-snug font-medium">
              {post.title}
            </h3>
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {post.description}
            </p>
            <span className="text-primary mt-auto inline-flex items-center gap-1 text-sm opacity-0 transition-opacity group-hover:opacity-100">
              {t('read')}
              <ArrowRight className="size-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

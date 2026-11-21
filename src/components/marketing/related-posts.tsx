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
    <section className="border-border mt-16 border-t pt-10">
      <h2 className="text-muted-foreground mb-4 text-base font-medium">
        {t('relatedPosts')}
      </h2>
      <ul className="divide-border divide-y">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-1 py-4"
            >
              <h3 className="text-foreground decoration-foreground/30 text-base font-medium underline-offset-4 group-hover:underline">
                {post.title}
              </h3>
              {post.description ? (
                <p className="text-muted-foreground line-clamp-2 text-sm">
                  {post.description}
                </p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

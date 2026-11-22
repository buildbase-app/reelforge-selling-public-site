import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { PostMeta } from '@/components/marketing/post-meta';
import type { BlogPost } from '@/lib/blog/posts';

/**
 * Posts on /blog, a tag page and an author page: a plain list divided by
 * hairlines, the whole row a link, the title the only strong text.
 */
export async function PostList({
  posts,
  headingLevel = 'h2',
}: {
  posts: BlogPost[];
  headingLevel?: 'h2' | 'h3';
}) {
  const locale = await getLocale();
  const Heading = headingLevel;
  return (
    <ul className="border-border divide-border divide-y border-y">
      {posts.map((post) => (
        <li key={post.slug}>
          <Link
            href={`/blog/${post.slug}`}
            className="group focus-visible:ring-ring -mx-4 flex flex-col gap-2 rounded-lg px-4 py-8 transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <PostMeta post={post} locale={locale} />
            <Heading className="text-foreground decoration-foreground/30 text-xl font-medium tracking-tight underline-offset-4 group-hover:underline md:text-2xl">
              {post.title}
            </Heading>
            {post.description ? (
              <p className="text-muted-foreground max-w-prose text-base leading-relaxed">
                {post.description}
              </p>
            ) : null}
            {post.tags.length > 0 ? (
              <p className="text-muted-foreground text-sm">
                {post.tags.map((t) => t.title).join(' · ')}
              </p>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

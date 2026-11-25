import { Link } from '@/i18n/link';
import { formatPostDate, type BlogPost, type BlogTag } from '@/lib/blog/posts';

/**
 * The one meta line every post and release note carries: date, version
 * (release notes), reading time. Muted, with tabular figures so dates and
 * versions line up from post to post; set in the body face, since mono is
 * for code only.
 */
export function PostMeta({
  post,
  locale,
  latest = false,
}: {
  post: BlogPost;
  locale: string;
  /** The newest release note says so. */
  latest?: boolean;
}) {
  return (
    <p className="text-muted-foreground flex flex-wrap items-center gap-x-2 text-sm tabular-nums">
      <time dateTime={post.date}>{formatPostDate(post.date, locale)}</time>
      {post.version ? (
        <>
          <span aria-hidden>·</span>
          <span className="text-foreground">v{post.version}</span>
        </>
      ) : null}
      {latest ? (
        <>
          <span aria-hidden>·</span>
          <span className="text-foreground">Latest</span>
        </>
      ) : null}
      <span aria-hidden>·</span>
      <span>{post.readingTime}</span>
    </p>
  );
}

/** Tags as quiet links with a hairline, never pills. */
export function TagLinks({
  tags,
  active,
}: {
  tags: BlogTag[];
  active?: string;
}) {
  if (tags.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li key={tag.slug}>
          <Link
            href={`/blog/tag/${tag.slug}`}
            aria-current={tag.slug === active ? 'page' : undefined}
            className="border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 aria-[current=page]:text-foreground aria-[current=page]:border-foreground/40 inline-flex rounded-md border px-2.5 py-1 text-sm transition-colors"
          >
            {tag.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

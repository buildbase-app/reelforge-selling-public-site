import type { BlogPost } from '@/lib/blog/posts';

function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(locale, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return iso.slice(0, 10);
  }
}

/** A changelog entry's date, "Latest" badge, version and reading time. */
export function ChangelogMeta({
  entry,
  locale,
  latest,
}: {
  entry: BlogPost;
  locale: string;
  latest: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <time
        dateTime={entry.date}
        className="text-muted-foreground font-mono text-xs tracking-wider uppercase"
      >
        {formatDate(entry.date, locale)}
      </time>
      {latest ? (
        <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
          Latest
        </span>
      ) : null}
      {entry.version ? (
        <span className="text-muted-foreground font-mono text-xs">
          v{entry.version}
        </span>
      ) : null}
      <span className="text-muted-foreground font-mono text-xs">
        {entry.readingTime}
      </span>
    </div>
  );
}

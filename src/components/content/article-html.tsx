import { cn } from '@/lib/utils';
import styles from './rich-text.module.css';

/**
 * A long-form body (blog post, release note, legal page): HTML produced by
 * `renderRichText` (src/lib/content/rich-text.ts) or `renderMarkdown`
 * (src/lib/platform/markdown.ts), already sanitised on the server, with the
 * shared rich-text typography. Never pass it anything else.
 */
export function ArticleHtml({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={cn(styles.prose, className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

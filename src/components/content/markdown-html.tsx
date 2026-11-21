import { cn } from '@/lib/utils';

/**
 * Shows HTML produced by `renderMarkdown` (src/lib/platform/markdown.ts),
 * which is already sanitised on the server. Never pass it anything else.
 */
export function MarkdownHtml({
  html,
  className,
  as: Tag = 'div',
}: {
  html: string;
  className?: string;
  as?: 'div' | 'span';
}) {
  return (
    <Tag
      className={cn(
        '[&_a]:text-foreground [&_code]:bg-muted [&_pre]:bg-muted [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6',
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

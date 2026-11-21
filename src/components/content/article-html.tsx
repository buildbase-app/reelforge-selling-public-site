import { cn } from '@/lib/utils';

/**
 * A long-form body (blog post, changelog entry, legal page): HTML produced
 * by `renderMarkdown` (src/lib/platform/markdown.ts), already sanitised on
 * the server, with the article typography. Never pass it anything else.
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
      className={cn(
        'text-foreground max-w-[68ch] text-[17px] leading-[1.7]',
        '[&_h1]:mt-12 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight md:[&_h1]:text-4xl',
        '[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:scroll-mt-24 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight',
        '[&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:scroll-mt-24 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:tracking-tight',
        '[&_h4]:mt-8 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:tracking-tight',
        '[&_li]:leading-[1.7] [&_p]:my-5 [&_strong]:font-semibold',
        '[&_ul]:my-5 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-6',
        '[&_ol]:my-5 [&_ol]:flex [&_ol]:list-decimal [&_ol]:flex-col [&_ol]:gap-2 [&_ol]:pl-6',
        '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:no-underline',
        '[&_blockquote]:border-primary [&_blockquote]:text-muted-foreground [&_blockquote]:my-6 [&_blockquote]:border-l-2 [&_blockquote]:pl-5',
        '[&_hr]:border-border [&_hr]:my-12',
        '[&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md',
        '[&_code]:bg-muted [&_code]:border-border [&_code]:rounded [&_code]:border [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.875em]',
        '[&_pre]:bg-muted [&_pre]:border-border [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:p-4 [&_pre]:text-sm',
        '[&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0',
        '[&_table]:my-6 [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:text-sm',
        '[&_th]:bg-muted [&_th]:border-border [&_th]:border [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-medium',
        '[&_td]:border-border [&_td]:text-muted-foreground [&_td]:border [&_td]:px-4 [&_td]:py-3 [&_td]:align-top',
        '[&>*:first-child]:mt-0',
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

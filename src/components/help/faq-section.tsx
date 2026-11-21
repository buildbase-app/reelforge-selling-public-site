import type { RenderedFaq } from '@/lib/platform/faqs';
import { MarkdownHtml } from '@/components/content/markdown-html';

/**
 * An FAQ as a native `<details>` accordion (no client JavaScript). Answers
 * are server-rendered, sanitised Markdown, so they are in the HTML for
 * crawlers. Pair it with `FAQJsonLd` built from the same items.
 */
export function FaqSection({ items }: { items: RenderedFaq[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-4 divide-y rounded-xl border">
      {items.map((item) => (
        <li key={item.id}>
          <details className="group">
            <summary className="hover:bg-muted/50 flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium">
              {item.question}
              <span
                aria-hidden
                className="text-muted-foreground transition-transform group-open:rotate-180"
              >
                ▾
              </span>
            </summary>
            <MarkdownHtml
              html={item.html}
              className="text-muted-foreground px-4 pb-4 text-sm leading-relaxed"
            />
          </details>
        </li>
      ))}
    </ul>
  );
}
